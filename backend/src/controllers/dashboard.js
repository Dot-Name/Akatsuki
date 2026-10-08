import { z } from 'zod';
import { FeeRecord, Payment, Student, Settings, getSettings } from '../models/index.js';
import { ok, wrap, parseMY, monthRange } from '../utils/http.js';
import { monthlySummary, outstandingFor, overdueInfo, ensureMonth } from '../services/feeService.js';

export const summary = wrap(async (req, res) => {
  const { month, year } = parseMY(req.query);
  const [m, totalStudents, recent] = await Promise.all([monthlySummary(month, year), Student.countDocuments({ status: 'active' }),
    Payment.find({ voided: false }).sort({ createdAt: -1 }).limit(10).populate('studentId', 'name className joiningDate').populate('feeRecordId', 'month year').lean()]);
  // students carrying unpaid months from before the selected month
  const old = await FeeRecord.aggregate([{ $match: { remainingAmount: { $gt: 0 }, $expr: { $lt: [{ $add: [{ $multiply: ['$year', 12] }, '$month'] }, year * 12 + month] } } },
    { $group: { _id: '$studentId', total: { $sum: '$remainingAmount' }, months: { $sum: 1 } } }, { $sort: { total: -1 } }, { $limit: 10 },
    { $lookup: { from: 'students', localField: '_id', foreignField: '_id', as: 's' } }, { $unwind: '$s' }, { $project: { name: '$s.name', className: '$s.className', joiningDate: '$s.joiningDate', total: 1, months: 1 } }]);
  ok(res, { totalStudents, ...m, recentPayments: recent, outstandingStudents: old });
});

export const monthly = wrap(async (req, res) => { // collected per month, by payment date, last 12 months
  const now = new Date(); const from = new Date(Date.UTC(now.getFullYear(), now.getMonth() - 11, 1));
  const rows = await Payment.aggregate([{ $match: { voided: false, paymentDate: { $gte: from } } },
    { $group: { _id: { y: { $year: '$paymentDate' }, m: { $month: '$paymentDate' } }, collected: { $sum: '$amount' } } }, { $sort: { '_id.y': 1, '_id.m': 1 } }]);
  const exp = await FeeRecord.aggregate([{ $group: { _id: { y: '$year', m: '$month' }, expected: { $sum: '$amountDue' }, pending: { $sum: '$remainingAmount' } } }]);
  const key = (y, m) => `${y}-${m}`; const e = Object.fromEntries(exp.map((x) => [key(x._id.y, x._id.m), x]));
  ok(res, rows.map((r) => ({ month: r._id.m, year: r._id.y, collected: r.collected, expected: e[key(r._id.y, r._id.m)]?.expected || 0, pending: e[key(r._id.y, r._id.m)]?.pending || 0 })));
});

export const daily = wrap(async (req, res) => {
  const { month, year } = parseMY(req.query); const [from, to] = monthRange(month, year);
  ok(res, await Payment.aggregate([{ $match: { voided: false, paymentDate: { $gte: from, $lt: to } } },
    { $group: { _id: { $dayOfMonth: '$paymentDate' }, collected: { $sum: '$amount' } } }, { $project: { _id: 0, day: '$_id', collected: 1 } }, { $sort: { day: 1 } }]));
});

export const pending = wrap(async (req, res) => {
  const { month, year } = parseMY(req.query); await ensureMonth(month, year);
  const settings = await getSettings(); const info = overdueInfo(month, year, settings.dueDay);
  const recs = await FeeRecord.find({ month, year, remainingAmount: { $gt: 0 } }).populate('studentId', 'name className phone guardianName').lean();
  ok(res, recs.map((r) => ({ ...r, ...info })));
});

export const getSettingsCtl = wrap(async (req, res) => ok(res, await getSettings()));
export const settingsSchema = z.object({ tuitionName: z.string().min(1).optional(), dueDay: z.coerce.number().int().min(1).max(28).optional(), midMonthJoin: z.enum(['full', 'half']).optional() });
export const updateSettings = wrap(async (req, res) => ok(res, await Settings.findOneAndUpdate({ key: 'main' }, req.body, { new: true, upsert: true }), 'Settings saved'));
