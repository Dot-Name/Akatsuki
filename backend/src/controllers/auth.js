import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Admin } from '../models/index.js';
import { ApiError, ok, wrap } from '../utils/http.js';

const prod = process.env.NODE_ENV === 'production';
const cookieOpts = { httpOnly: true, secure: prod, sameSite: prod ? 'none' : 'lax', maxAge: 7 * 864e5 }; // 'none' needed for Vercel↔Render

export const loginSchema = z.object({ username: z.string().min(1), password: z.string().min(1) });
export const passwordSchema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8) });

export const login = wrap(async (req, res) => {
  const admin = await Admin.findOne({ username: req.body.username.toLowerCase() });
  const valid = admin && (await bcrypt.compare(req.body.password, admin.passwordHash));
  if (!valid) throw new ApiError(401, 'Invalid username or password.');
  res.cookie('token', jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' }), cookieOpts);
  ok(res, { username: admin.username }, 'Logged in');
});
export const logout = (req, res) => { res.clearCookie('token', { ...cookieOpts, maxAge: undefined }); ok(res, null, 'Logged out'); };
export const me = (req, res) => ok(res, { id: req.admin._id, username: req.admin.username });
export const changePassword = wrap(async (req, res) => {
  const admin = await Admin.findById(req.admin._id);
  if (!(await bcrypt.compare(req.body.currentPassword, admin.passwordHash))) throw new ApiError(400, 'Current password is incorrect.');
  admin.passwordHash = await bcrypt.hash(req.body.newPassword, 12); await admin.save();
  ok(res, null, 'Password changed');
});
