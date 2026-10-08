import { z } from 'zod';
import { FeeRecord, Payment, Student, AuditLog, getSettings } from '../models/index.js';
import { ApiError, ok, wrap, parseMY } from '../utils/http.js';
import * as svc from '../services/feeService.js';

const payFields = {
  amount: z.coerce.number().positive(), paymentDate: z.coerce.date(),
  paymentMethod: z.enum(['cash', 'upi', 'bank_transfer', 'other']), notes: z.string().optional(),
};
export const collectSchema = z.object({
  studentId: z.string().length(24), month: z.coerce.number().int().min(1).max(12).optional(), year: z.coerce.number().int().optional(),
  mode: z.enum(['month', 'outstanding', 'selected']).default('month'),
  months: z.array(z.object({ month: z.coerce.number().int().min(1).max(12), year: z.coerce.number().int().min(1900).max(9999) })).optional(),
  ...payFields,
});
export const feeEditSchema = z.object({ amountDue: z.coerce.number().min(0), reason: z.string().min(3) });
export const paymentEditSchema = z.object({
  amount: z.coerce.number().positive().optional(), paymentDate: z.coerce.date().optional(),
  paymentMethod: z.enum(['cash', 'upi', 'bank_transfer', 'other']).optional(), notes: z.string().optional(),
  voided: z.boolean().optional(), reason: z.string().min(3), // stronger confirmation: reason is mandatory
});
export const paymentReassignSchema = z.object({
  studentId: z.string().regex(/^[a-f\d]{24}$/i),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(1900).max(9999),
  reason: z.string().trim().min(3),
});

export const collect = wrap(async (req, res) => {
  const { mode, studentId, month, year, months, ...pay } = req.body;
  const now = new Date();
  if (mode === 'selected') {
    const made = await svc.collectSelected(studentId, months, pay, req.admin._id);
    return ok(res, made, 'Payment recorded successfully', 201);
  }
  if (mode === 'outstanding') {
    const made = await svc.collectOutstanding(studentId, pay, req.admin._id);
    return ok(res, made, 'Payment recorded successfully', 201);
  }
  const p = await svc.collect({ studentId, month: month || now.getMonth() + 1, year: year || now.getFullYear(), ...pay }, req.admin._id);
  ok(res, p, 'Payment recorded successfully', 201);
});

export const monthly = wrap(async (req, res) => {
  const { month, year } = parseMY(req.query);
  const { status, className, search, page = 1, limit = 50 } = req.query;
  await svc.ensureMonth(month, year);
  const match = { month, year }; if (status) match.status = status;
  const sMatch = {};
  if (className) sMatch['student.className'] = className;
  if (search) { const r = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); sMatch.$or = [{ 'student.name': r }, { 'student.phone': r }, { 'student.guardianName': r }, { 'student.studentCode': r }]; }
  const pipeline = [{ $match: match }, { $lookup: { from: 'students', localField: 'studentId', foreignField: '_id', as: 'student' } }, { $unwind: '$student' }, { $match: sMatch }];
  const [items, [t]] = await Promise.all([
    FeeRecord.aggregate([...pipeline, { $sort: { 'student.name': 1 } }, { $skip: (page - 1) * limit }, { $limit: Number(limit) }]),
    FeeRecord.aggregate([...pipeline, { $count: 'n' }])]);
  const settings = await getSettings();
  const rows = items.map((f) => ({ ...f, ...(f.remainingAmount > 0 ? svc.overdueInfo(month, year, settings.dueDay) : {}) }));
  ok(res, { items: rows, total: t?.n || 0, summary: await svc.monthlySummary(month, year) });
});

export const exportMonthly = wrap(async (req, res) => {
  const { month, year } = parseMY(req.query);
  await svc.ensureMonth(month, year);
  const match = { month, year }; if (req.query.pendingOnly === 'true') match.remainingAmount = { $gt: 0 };
  const recs = await FeeRecord.find(match).populate('studentId').lean();
  const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = ['Student,Class,Guardian,Phone,Amount Due,Amount Paid,Remaining,Status,Payment Date,Payment Method',
    ...recs.map((f) => [f.studentId?.name, f.studentId?.className, f.studentId?.guardianName, f.studentId?.phone, f.amountDue, f.amountPaid, f.remainingAmount, f.status, f.paymentDate?.toISOString().slice(0, 10), f.paymentMethod].map(q).join(','))];
  res.setHeader('Content-Type', 'text/csv'); res.setHeader('Content-Disposition', `attachment; filename=fees-${year}-${month}.csv`);
  res.send(lines.join('\n'));
});

export const byStudent = wrap(async (req, res) => {
  const student = await Student.findById(req.params.studentId);
  if (!student) throw new ApiError(404, 'Student not found.');
  const [history, payments, outstanding] = await Promise.all([
    FeeRecord.find({ studentId: student._id }).sort({ year: -1, month: -1 }),
    Payment.find({ studentId: student._id, voided: false }).sort({ paymentDate: -1 }), svc.outstandingFor(student)]);
  ok(res, { student, history, payments, outstanding });
});

/** Correct a month's amountDue (e.g. custom charge for a half-month join). Audited. */
export const updateFee = wrap(async (req, res) => {
  const fee = await FeeRecord.findById(req.params.id);
  if (!fee) throw new ApiError(404, 'Fee record not found.');
  const before = fee.toObject(); fee.amountDue = req.body.amountDue; await svc.recalc(fee);
  await AuditLog.create({ action: 'fee.edit', entity: 'FeeRecord', entityId: fee._id, before, after: fee.toObject(), by: req.admin._id, summary: req.body.reason });
  ok(res, fee, 'Fee updated');
});

export const listFees = wrap(async (req, res) => {
  const { month, year } = parseMY(req.query);
  ok(res, await FeeRecord.find({ month, year }).lean());
});

export const listPayments = wrap(async (req, res) => {
  const { limit = 20, studentId } = req.query;
  const q = { voided: false }; if (studentId) q.studentId = studentId;
  ok(res, await Payment.find(q).sort({ paymentDate: -1, createdAt: -1 }).limit(Number(limit)).populate('studentId', 'name className').populate('feeRecordId', 'month year').lean());
});
export const paymentsByStudent = wrap(async (req, res) => ok(res, await Payment.find({ studentId: req.params.studentId }).sort({ paymentDate: -1 }).populate('feeRecordId', 'month year')));
export const editPayment = wrap(async (req, res) => ok(res, await svc.editPayment(req.params.id, req.body, req.admin._id), 'Payment updated'));
export const reassignPayment = wrap(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment || payment.voided) throw new ApiError(404, 'Payment not found.');

  const targetStudent = await Student.findById(req.body.studentId);
  if (!targetStudent) throw new ApiError(404, 'Student not found.');
  const targetFee = await svc.getOrCreateFee(targetStudent, req.body.month, req.body.year);
  if (!targetFee) throw new ApiError(400, 'Student is not chargeable for this month.');
  if (String(targetFee._id) === String(payment.feeRecordId)) throw new ApiError(400, 'Payment is already assigned to this student and month.');
  if (payment.amount > targetFee.remainingAmount)
    throw new ApiError(400, `Payment exceeds the selected month's outstanding balance (₹${targetFee.remainingAmount}).`);

  const sourceFee = await FeeRecord.findById(payment.feeRecordId);
  if (!sourceFee) throw new ApiError(404, 'Original fee record not found.');
  const before = payment.toObject();
  payment.studentId = targetStudent._id;
  payment.feeRecordId = targetFee._id;
  await payment.save();
  await Promise.all([svc.recalc(sourceFee), svc.recalc(targetFee)]);
  await AuditLog.create({ action: 'payment.reassign', entity: 'Payment', entityId: payment._id,
    before, after: payment.toObject(), by: req.admin._id, summary: req.body.reason });
  ok(res, payment, 'Payment reassigned');
});
export const receipt = wrap(async (req, res) => {
  const p = await Payment.findById(req.params.id).populate('studentId').populate('feeRecordId');
  if (!p) throw new ApiError(404, 'Payment not found.');
  const s = await getSettings();
  ok(res, { tuitionName: s.tuitionName, receiptId: p.receiptId, studentName: p.studentId.name, className: p.studentId.className,
    guardianName: p.studentId.guardianName, month: p.feeRecordId.month, year: p.feeRecordId.year, amount: p.amount, paymentDate: p.paymentDate, paymentMethod: p.paymentMethod, voided: p.voided });
});
