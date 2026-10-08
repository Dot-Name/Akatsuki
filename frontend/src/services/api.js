import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:10000/api', withCredentials: true, headers: { 'X-Requested-With': 'XMLHttpRequest' } });
export const unwrap = (p) => p.then((r) => r.data.data);
export const errMsg = (e, fallback = 'Something went wrong. Please try again.') => e?.response?.data?.message || fallback;
export const get = (u, params) => unwrap(api.get(u, { params }));
export const post = (u, b) => unwrap(api.post(u, b));
export const put = (u, b) => unwrap(api.put(u, b));
export const del = (u) => unwrap(api.delete(u));
export const download = async (url, params, name) => {
  const r = await api.get(url, { params, responseType: 'blob' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(r.data); a.download = name; a.click();
};
export default api;
