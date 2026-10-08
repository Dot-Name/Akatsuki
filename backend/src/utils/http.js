export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export const ok = (res, data = null, message = 'OK', status = 200) =>
  res.status(status).json({ success: true, message, data });
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export const monthRange = (m, y) => [new Date(Date.UTC(y, m - 1, 1)), new Date(Date.UTC(y, m, 1))];
export const parseMY = (q) => {
  const now = new Date();
  return { month: Number(q.month) || now.getMonth() + 1, year: Number(q.year) || now.getFullYear() };
};
