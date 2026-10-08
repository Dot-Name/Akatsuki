import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const opts = { timestamps: true };

export const Admin = model('Admin', new Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
}, opts));

const studentSchema = new Schema({
  studentCode: { type: String, unique: true },
  name: { type: String, required: true, trim: true },
  className: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  guardianName: { type: String, required: true, trim: true },
  guardianPhone: { type: String, trim: true },
  address: String,
  monthlyFee: { type: Number, required: true, min: 1 },
  joiningDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  inactiveDate: Date, // fees stop generating after this date
}, opts);
studentSchema.index({ name: 1 }); studentSchema.index({ phone: 1 }); studentSchema.index({ status: 1 });
export const Student = model('Student', studentSchema);

const feeSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  month: { type: Number, min: 1, max: 12, required: true },
  year: { type: Number, required: true },
  amountDue: { type: Number, required: true, min: 0 }, // snapshot: never changes when student's fee changes
  amountPaid: { type: Number, default: 0 },
  remainingAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['paid', 'due', 'partial'], default: 'due' },
  paymentDate: Date, // latest payment date
  paymentMethod: String,
  notes: String,
}, opts);
feeSchema.index({ studentId: 1, month: 1, year: 1 }, { unique: true });
feeSchema.index({ status: 1 }); feeSchema.index({ year: 1, month: 1 });
export const FeeRecord = model('FeeRecord', feeSchema);

const paymentSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  feeRecordId: { type: Schema.Types.ObjectId, ref: 'FeeRecord', required: true },
  amount: { type: Number, required: true, min: 1 },
  paymentDate: { type: Date, required: true }, // may be backdated
  paymentMethod: { type: String, enum: ['cash', 'upi', 'bank_transfer', 'other'], required: true },
  notes: String,
  receiptId: { type: String, unique: true },
  voided: { type: Boolean, default: false }, // payments are voided, never deleted
  recordedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
}, opts); // createdAt = when it was recorded
paymentSchema.index({ studentId: 1 }); paymentSchema.index({ feeRecordId: 1 }); paymentSchema.index({ paymentDate: 1 });
export const Payment = model('Payment', paymentSchema);

export const AuditLog = model('AuditLog', new Schema({
  action: String, entity: String, entityId: Schema.Types.ObjectId,
  before: Schema.Types.Mixed, after: Schema.Types.Mixed, summary: String,
  by: { type: Schema.Types.ObjectId, ref: 'Admin' },
}, opts));

export const Settings = model('Settings', new Schema({
  key: { type: String, default: 'main', unique: true },
  tuitionName: { type: String, default: 'My Tuition' },
  dueDay: { type: Number, default: 5, min: 1, max: 28 },
  midMonthJoin: { type: String, enum: ['full', 'half'], default: 'full' },
}, opts));
export const getSettings = async () => (await Settings.findOne({ key: 'main' })) || Settings.create({ key: 'main' });
