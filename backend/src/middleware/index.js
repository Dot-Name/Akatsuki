import jwt from 'jsonwebtoken';
import { ZodError } from 'zod';
import { Admin } from '../models/index.js';
import { ApiError } from '../utils/http.js';

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) throw new ApiError(401, 'You are not authorized to perform this action.');
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(id).select('-passwordHash');
    if (!admin) throw new ApiError(401, 'You are not authorized to perform this action.');
    req.admin = admin; next();
  } catch (e) { next(e instanceof ApiError ? e : new ApiError(401, 'You are not authorized to perform this action.')); }
};

// CSRF defence for cookie auth: browsers can't add custom headers cross-site without a CORS preflight.
export const csrfGuard = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.get('X-Requested-With') !== 'XMLHttpRequest')
    return next(new ApiError(403, 'Invalid request origin.'));
  next();
};

export const validate = (schema) => (req, res, next) => {
  try { req.body = schema.parse(req.body); next(); } catch (e) { next(e); }
};

export const notFound = (req, res, next) => next(new ApiError(404, 'Route not found'));
export const errorHandler = (err, req, res, next) => {
  let status = err.status || 500, message = err.message;
  if (err instanceof ZodError) { status = 400; message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '); }
  else if (err.code === 11000) { status = 409; message = 'Duplicate record.'; }
  else if (err.name === 'CastError') { status = 400; message = 'Invalid ID.'; }
  else if (status === 500) { console.error(err); message = 'Something went wrong. Please try again.'; }
  res.status(status).json({ success: false, message, error: null });
};
