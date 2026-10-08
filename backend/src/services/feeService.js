import { FeeRecord, Payment, AuditLog, Student, getSettings } from '../models/index.js';
import { ApiError } from '../utils/http.js';

const monthIndex = (m, y) => y * 12 + (m - 1);
const startOfMonth = (m, y) => new Date(Date.UTC(y, m - 1, 1));

/** Is this student chargeable for the given month? (joined yet? left already?) */
const isChargeable = (s, m, y) => {
  const j = new Date(s.joiningDate);
  if (monthIndex(m, y) < monthIndex(j.getUTCMonth() + 1, j.getUTCFullYear())) return false;
  if (s.inactiveDate && startOfMonth(m, y) > new Date(s.inactiveDate)) return false;
  return true;
};

const initialAmount = (s, m, y, settings) => {
  const j = new Date(s.joiningDate);
  const joinMonth = j.getUTCMonth() + 1 === m && j.getUTCFullYear() === y;
  if (joinMonth && j.getUTCDate() > 1 && settings.midMonthJoin === 'half') return Math.round(s.monthlyFee / 2);
  return s.monthlyFee; // snapshot of the fee at creation time
};

/** Derive paid/remaining/status from non-voided Payment rows (single source of truth). */
export const recalc = async (fee) => {
  const pays = await Payment.find({ feeRecordId: fee._id, voided: false }).sort({ paymentDate: 1 });
  fee.amountPaid = pays.reduce((a, p) => a + p.amount, 0);
  fee.remainingAmount = Math.max(0, fee.amountDue - fee.amountPaid);
  fee.status = fee.remainingAmount === 0 ? 'paid' : fee.amountPaid > 0 ? 'partial' : 'due';
  const last = pays[pays.length - 1];
  fee.paymentDate = last?.paymentDate; fee.paymentMethod = last?.paymentMethod;
  return fee.save();
};

export const getOrCreateFee = async (student, month, year) => {
  let fee = await FeeRecord.findOne({ studentId: student._id, month, year });
  if (fee) return fee;
  if (!isChargeable(student, month, year)) return null;
  const amountDue = initialAmount(student, month, year, await getSettings());
  try { fee = await FeeRecord.create({ studentId: student._id, month, year, amountDue, remainingAmount: amountDue }); }
  catch (e) { if (e.code === 11000) fee = await FeeRecord.findOne({ studentId: student._id, month, year }); else throw e; }
  return fee;
};

/** Lazily create missing records for one month (bulk; unique index makes it race-safe). */
export const ensureMonth = async (month, year) => {
  const settings = await getSettings();
  const students = await Student.find({ $or: [{ status: 'active' }, { inactiveDate: { $gte: startOfMonth(month, year) } }] });
  const existing = new Set((await FeeRecord.find({ month, year }).select('studentId')).map((f) => String(f.studentId)));
  const docs = students.filter((s) => !existing.has(String(s._id)) && isChargeable(s, month, year)).map((s) => {
    const amountDue = initialAmount(s, month, year, settings);
    return { studentId: s._id, month, year, amountDue, remainingAmount: amountDue };
  });
  if (docs.length) await FeeRecord.insertMany(docs, { ordered: false }).catch((e) => { if (e.code !== 11000 && !e.writeErrors) throw e; });
};

/** Unpaid/partial months (oldest first), from joining month to the current month. */
export const outstandingFor = async (student) => {
  const now = new Date(); const cur = monthIndex(now.getMonth() + 1, now.getFullYear());
  const j = new Date(student.joiningDate);
  for (let i = monthIndex(j.getUTCMonth() + 1, j.getUTCFullYear()); i <= cur; i++)
    await getOrCreateFee(student, (i % 12) + 1, Math.floor(i / 12));
  const records = await FeeRecord.find({ studentId: student._id, remainingAmount: { $gt: 0 } }).sort({ year: 1, month: 1 });
  return { records, total: records.reduce((a, r) => a + r.remainingAmount, 0) };
};

const receiptId = () => `RCPT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

export const addPayment = async (fee, { amount, paymentDate, paymentMethod, notes }, adminId) => {
  if (fee.remainingAmount <= 0) throw new ApiError(400, "This month's fee has already been fully paid.");
  if (amount > fee.remainingAmount) throw new ApiError(400, `Amount exceeds the outstanding balance (₹${fee.remainingAmount}).`);
  const payment = await Payment.create({ studentId: fee.studentId, feeRecordId: fee._id, amount, paymentDate, paymentMethod, notes, receiptId: receiptId(), recordedBy: adminId });
  await recalc(fee);
  await AuditLog.create({ action: 'payment.create', entity: 'Payment', entityId: payment._id, after: payment.toObject(), by: adminId, summary: `Recorded ₹${amount} for ${fee.month}/${fee.year}` });
  return payment;
};

export const collect = async ({ studentId, month, year, ...pay }, adminId) => {
  const student = await Student.findById(studentId);
  if (!student) throw new ApiError(404, 'Student not found.');
  const fee = await getOrCreateFee(student, month, year);
  if (!fee) throw new ApiError(400, 'Student is not chargeable for this month.');
  return addPayment(fee, pay, adminId);
};

/** One amount allocated oldest-month-first; each month keeps its own Payment row. */
export const collectOutstanding = async (studentId, pay, adminId) => {
  const student = await Student.findById(studentId);
  if (!student) throw new ApiError(404, 'Student not found.');
  const { records, total } = await outstandingFor(student);
  if (pay.amount > total) throw new ApiError(400, `Amount exceeds total outstanding (₹${total}).`);
  let left = pay.amount; const made = [];
  for (const rec of records) {
    if (left <= 0) break;
    const part = Math.min(left, rec.remainingAmount);
    made.push(await addPayment(rec, { ...pay, amount: part }, adminId)); left -= part;
  }
  return made;
};

/** Allocate a payment oldest-first across only the pending months selected by the user. */
export const collectSelected = async (studentId, months, pay, adminId) => {
  const student = await Student.findById(studentId);
  if (!student) throw new ApiError(404, 'Student not found.');
  if (!Array.isArray(months) || months.length === 0) throw new ApiError(400, 'Select at least one pending month.');

  const keys = months.map(({ month, year }) => monthIndex(month, year));
  if (new Set(keys).size !== keys.length) throw new ApiError(400, 'A month can only be selected once.');
  const selected = await Promise.all(months.map(({ month, year }) => getOrCreateFee(student, month, year)));
  if (selected.some((fee) => !fee)) throw new ApiError(400, 'Student is not chargeable for one of the selected months.');
  const pending = selected.filter((fee) => fee.remainingAmount > 0).sort((a, b) => monthIndex(a.month, a.year) - monthIndex(b.month, b.year));
  if (pending.length !== selected.length) throw new ApiError(400, 'One of the selected months is no longer pending. Refresh and try again.');
  const total = pending.reduce((sum, fee) => sum + fee.remainingAmount, 0);
  if (pay.amount > total) throw new ApiError(400, `Amount exceeds the selected months' outstanding balance (₹${total}).`);

  let left = pay.amount;
  const made = [];
  for (const fee of pending) {
    if (left <= 0) break;
    const part = Math.min(left, fee.remainingAmount);
    made.push(await addPayment(fee, { ...pay, amount: part }, adminId));
    left -= part;
  }
  return made;
};

/** Edit or void a payment; the previous state is kept in AuditLog. */
export const editPayment = async (id, changes, adminId) => {
  const p = await Payment.findById(id);
  if (!p || p.voided) throw new ApiError(404, 'Payment not found.');
  const fee = await FeeRecord.findById(p.feeRecordId);
  const before = p.toObject(); const { reason, ...rest } = changes;
  if (rest.voided) p.voided = true;
  else {
    if (rest.amount && rest.amount - p.amount > fee.remainingAmount) throw new ApiError(400, 'Amount exceeds the outstanding balance.');
    Object.assign(p, rest);
  }
  await p.save(); await recalc(fee);
  await AuditLog.create({ action: rest.voided ? 'payment.void' : 'payment.edit', entity: 'Payment', entityId: p._id, before, after: p.toObject(), by: adminId, summary: reason });
  return p;
};

export const monthlySummary = async (month, year) => {
  await ensureMonth(month, year);
  const [r] = await FeeRecord.aggregate([{ $match: { month, year } }, { $group: {
    _id: null, expected: { $sum: '$amountDue' }, collected: { $sum: '$amountPaid' }, pending: { $sum: '$remainingAmount' },
    paid: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
    due: { $sum: { $cond: [{ $eq: ['$status', 'due'] }, 1, 0] } },
    partial: { $sum: { $cond: [{ $eq: ['$status', 'partial'] }, 1, 0] } } } }]);
  const s = r || { expected: 0, collected: 0, pending: 0, paid: 0, due: 0, partial: 0 };
  delete s._id;
  return { ...s, month, year, collectionPercent: s.expected ? +((s.collected / s.expected) * 100).toFixed(2) : 0 };
};

export const overdueInfo = (month, year, dueDay, today = new Date()) => {
  const due = Date.UTC(year, month - 1, dueDay);
  const days = Math.floor((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - due) / 86400000);
  return { dueDate: new Date(due), daysOverdue: Math.max(0, days), overdue: days > 0 };
};
