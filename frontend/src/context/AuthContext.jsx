import { createContext, useContext, useEffect, useState } from 'react';
import api, { get, post } from '../services/api';
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => { get('/auth/me').then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
    const id = api.interceptors.response.use((r) => r, (e) => { if (e.response?.status === 401 && !e.config.url.includes('/auth/')) setUser(null); return Promise.reject(e); });
    return () => api.interceptors.response.eject(id); }, []);
  const login = async (username, password) => { await post('/auth/login', { username, password }); setUser(await get('/auth/me')); };
  const logout = async () => { await post('/auth/logout'); setUser(null); };
  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}
