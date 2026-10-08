import { z } from 'zod';
import { Student, FeeRecord } from '../models/index.js';
import { ApiError, ok, wrap, parseMY } from '../utils/http.js';
import { outstandingFor, ensureMonth } from '../services/feeService.js';

const cleanText = z.string().trim().transform((value) => value.replace(/\s+/g, ' '));
const phone = z.string().trim();
export const studentSchema = z.object({
  name: cleanText.pipe(z.string().min(1)), className: cleanText.pipe(z.string().min(1)), phone: phone.optional(),
  guardianName: cleanText.pipe(z.string().min(1)), guardianPhone: phone.optional(), address: cleanText.optional(),
  monthlyFee: z.coerce.number().positive(), joiningDate: z.coerce.date().optional(), status: z.enum(['active', 'inactive']).optional(),
});
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const list = wrap(async (req, res) => {
  const { search, className, status, sort = 'name', order = 'asc', page = 1, limit = 20 } = req.query;
  const { month, year } = parseMY(req.query);
  const q = {};
  if (className) q.className = String(className);
  if (status) q.status = String(status);
  if (search) { const r = new RegExp(esc(String(search)), 'i'); q.$or = [{ name: r }, { phone: r }, { guardianName: r }, { studentCode: r }]; }
  const [items, total] = await Promise.all([
    Student.find(q).sort({ [sort]: order === 'desc' ? -1 : 1 }).skip((page - 1) * limit).limit(Number(limit)).lean(),
    Student.countDocuments(q)]);
  await ensureMonth(month, year);
  const fees = await FeeRecord.find({ month, year, studentId: { $in: items.map((s) => s._id) } }).lean();
  const byStudent = Object.fromEntries(fees.map((f) => [String(f.studentId), f]));
  const data = items.map((s) => ({ ...s, currentFee: byStudent[String(s._id)] || null }));
  ok(res, { items: data, total, page: Number(page), pages: Math.ceil(total / limit) });
});

export const get = wrap(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw new ApiError(404, 'Student not found.');
  const [outstanding, history] = await Promise.all([outstandingFor(student), FeeRecord.find({ studentId: student._id }).sort({ year: -1, month: -1 })]);
  ok(res, { student, history, outstanding });
});

export const create = wrap(async (req, res) => {
  const count = await Student.countDocuments();
  const student = await Student.create({ ...req.body, studentCode: `STU${String(count + 1).padStart(4, '0')}${Math.floor(Math.random() * 90 + 10)}` });
  ok(res, student, 'Student added', 201);
});

export const update = wrap(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw new ApiError(404, 'Student not found.');
  Object.assign(student, req.body); // fee changes only affect months created from now on
  if (req.body.status === 'inactive' && !student.inactiveDate) student.inactiveDate = new Date();
  if (req.body.status === 'active') student.inactiveDate = undefined;
  await student.save(); ok(res, student, 'Student updated');
});

export const deactivate = wrap(async (req, res) => {
  const s = await Student.findByIdAndUpdate(req.params.id, { status: 'inactive', inactiveDate: new Date() }, { new: true });
  if (!s) throw new ApiError(404, 'Student not found.');
  ok(res, s, 'Student deactivated');
});
