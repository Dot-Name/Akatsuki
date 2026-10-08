// npm run seed         -> creates admin only (safe for production)
// npm run seed:dev     -> also inserts demo students/fees (NEVER run in production)
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import { Admin, Student, FeeRecord, Settings } from './models/index.js';
import { collect } from './services/feeService.js';

await connectDB();
const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;
if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
  console.error('Set ADMIN_USERNAME and ADMIN_PASSWORD in .env before seeding.');
  process.exit(1);
}
let admin = await Admin.findOne({ username: ADMIN_USERNAME.toLowerCase() });
if (!admin) admin = await Admin.findOne();
if (!admin) admin = new Admin();
admin.username = ADMIN_USERNAME;
admin.passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
await admin.save();
await Settings.updateOne({ key: 'main' }, { $setOnInsert: { key: 'main' } }, { upsert: true });
console.log('Admin ready:', admin.username);

if (process.argv.includes('--demo')) {
  if (process.env.NODE_ENV === 'production') { console.error('Refusing to seed demo data in production.'); process.exit(1); }
  await Promise.all([Student.deleteMany({}), FeeRecord.deleteMany({})]);
  const now = new Date(); const start = new Date(Date.UTC(now.getFullYear(), now.getMonth() - 3, 1));
  const names = [['Rahul Kumar', '10', 1500], ['Aman Sharma', '9', 1200], ['Priya Singh', '8', 1000], ['Ravi Kumar', '10', 1500], ['Neha Singh', '8', 1000],
    ['Karan Verma', '9', 1200], ['Sneha Gupta', '10', 1500], ['Arjun Mehta', '8', 1000], ['Pooja Yadav', '9', 1200], ['Vikas Rana', '10', 1500]];
  const students = await Student.insertMany(names.map(([name, className, monthlyFee], i) => ({ name, className, monthlyFee, guardianName: `Guardian of ${name.split(' ')[0]}`,
    phone: `98765432${String(10 + i)}`, studentCode: `STU${String(i + 1).padStart(4, '0')}`, joiningDate: start })));
  const methods = ['cash', 'upi', 'bank_transfer'];
  for (const [i, s] of students.entries()) for (let back = 3; back >= 0; back--) {
    const d = new Date(now.getFullYear(), now.getMonth() - back, 1);
    const pattern = (i + back) % 4; // 0 unpaid, 1 partial, else paid
    if (pattern === 0) continue;
    const amount = pattern === 1 ? Math.round(s.monthlyFee * 0.6) : s.monthlyFee;
    await collect({ studentId: s._id, month: d.getMonth() + 1, year: d.getFullYear(), amount, paymentDate: new Date(d.getFullYear(), d.getMonth(), 1 + ((i * 3) % 9)),
      paymentMethod: methods[i % 3] }, admin._id);
  }
  console.log('Demo data inserted');
}
process.exit(0);
