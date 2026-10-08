import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { protect, validate } from '../middleware/index.js';
import * as auth from '../controllers/auth.js';
import * as st from '../controllers/students.js';
import * as fe from '../controllers/fees.js';
import * as db from '../controllers/dashboard.js';

const r = Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { success: false, message: 'Too many login attempts. Try again later.', error: null } });

r.post('/auth/login', loginLimiter, validate(auth.loginSchema), auth.login);
r.post('/auth/logout', auth.logout);

r.use(protect); // everything below requires a logged-in admin
r.get('/auth/me', auth.me);
r.put('/auth/change-password', validate(auth.passwordSchema), auth.changePassword);

r.get('/students', st.list); r.get('/students/:id', st.get);
r.post('/students', validate(st.studentSchema), st.create);
r.put('/students/:id', validate(st.studentSchema.partial()), st.update);
r.delete('/students/:id', st.deactivate);

r.get('/fees', fe.listFees); r.get('/fees/monthly', fe.monthly); r.get('/fees/monthly/export', fe.exportMonthly);
r.get('/fees/student/:studentId', fe.byStudent);
r.post('/fees/collect', validate(fe.collectSchema), fe.collect);
r.put('/fees/:id', validate(fe.feeEditSchema), fe.updateFee);

r.get('/payments', fe.listPayments); r.get('/payments/student/:studentId', fe.paymentsByStudent);
r.get('/payments/:id/receipt', fe.receipt);
r.post('/payments', validate(fe.collectSchema), fe.collect);
r.put('/payments/:id/reassign', validate(fe.paymentReassignSchema), fe.reassignPayment);
r.put('/payments/:id', validate(fe.paymentEditSchema), fe.editPayment);

r.get('/dashboard/summary', db.summary); r.get('/dashboard/monthly', db.monthly);
r.get('/dashboard/daily', db.daily); r.get('/dashboard/pending', db.pending);
r.get('/settings', db.getSettingsCtl); r.put('/settings', validate(db.settingsSchema), db.updateSettings);
export default r;
