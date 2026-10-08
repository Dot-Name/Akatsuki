import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../services/api';
import { Field } from '../components/ui';
import BrandLogo from '../components/BrandLogo';
import Icon from '../components/Icon';

export default function Login() {
  const { user, login } = useAuth();
  const [f, setF] = useState({ username: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/dashboard" replace />;
  const submit = async (e) => { e.preventDefault(); setBusy(true); setErr(''); try { await login(f.username, f.password); } catch (x) { setErr(errMsg(x, 'Unable to sign in. Please try again.')); } finally { setBusy(false); } };

  return <div className="relative min-h-screen bg-paper lg:grid lg:grid-cols-2">
    <section data-reveal className="relative hidden overflow-hidden bg-[#0B0B0B] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-20 xl:py-14">
      <div className="absolute -right-32 -top-28 h-[430px] w-[430px] rounded-full border border-white/[0.08]"/><div className="absolute -right-16 -top-12 h-[300px] w-[300px] rounded-full border border-white/[0.08]"/>
      <BrandLogo className="relative" imageClassName="h-11 w-11" nameClassName="text-lg font-bold tracking-tight text-white" />
      <div className="relative max-w-lg"><p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#C62828]">A calmer way to manage tuition</p><h1 className="text-5xl font-bold leading-[1.12] tracking-tight xl:text-6xl">Every student.<br/>Every payment.<br/><span className="text-[#C62828]">In one place.</span></h1><p className="mt-6 max-w-md text-base leading-7 text-white/65">Stay on top of fee collection and student records, with a clear view of what needs your attention.</p>
        <div className="mt-10 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C62828]/20 text-lg text-white">✓</span><div><p className="text-sm font-semibold">Your tuition workspace</p><p className="mt-0.5 text-xs text-white/50">Simple, organized and ready for the month.</p></div></div>
      </div><p className="relative text-xs text-white/40">AKATSUKI · ADMIN PORTAL</p>
    </section>
    <section data-reveal className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10">
      <div className="w-full max-w-[420px]">
        <div className="mb-9 lg:hidden"><BrandLogo imageClassName="h-11 w-11" nameClassName="text-sm font-bold text-slate-800" /></div>
        <div className="mb-8"><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Admin portal</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2><p className="mt-2 text-sm text-slate-500">Sign in to manage your tuition.</p></div>
        <form onSubmit={submit} className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_45px_rgba(15,23,42,0.06)] sm:p-8">
          <Field label="Username"><input className="input !py-3" autoComplete="username" placeholder="Enter your username" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} required /></Field>
          <Field label="Password"><input className="input !py-3" type="password" autoComplete="current-password" placeholder="Enter your password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required /></Field>
          {err && <p className="rounded-xl border border-due/20 bg-due-soft px-3.5 py-3 text-sm text-due" role="alert">{err}</p>}
          <button className="btn-primary w-full !py-3" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}<Icon name="arrowRight" /></button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-400">Secure access for tuition administrators</p>
      </div>
    </section>
  </div>;
}
