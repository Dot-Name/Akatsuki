import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';

const NAV = [
  ['/dashboard', 'Dashboard', '▦'], ['/students', 'Students', '♙'], ['/collect', 'Collect fees', '＋'],
  ['/pending', 'Pending fees', '◷'], ['/history', 'Fee history', '▤'], ['/settings', 'Settings', '⚙'],
];
const titles = Object.fromEntries(NAV.map(([to, label]) => [to, label]));

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const title = location.pathname.startsWith('/students/') ? 'Student details' : titles[location.pathname] || 'Akatsuki';
  const link = ({ isActive }) => `group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${isActive ? 'bg-white text-[#0B0B0B] shadow-sm' : 'text-white/75 hover:bg-white/10 hover:text-white'}`;

  return <div className="min-h-screen lg:pl-[264px]">
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col bg-[#0B0B0B] px-4 py-5 text-white shadow-xl shadow-slate-900/10 transition-transform lg:translate-x-0 lg:shadow-none ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="mb-9 flex items-center justify-between px-2">
        <div><BrandLogo imageClassName="h-10 w-10" nameClassName="text-[15px] font-bold tracking-tight"/><p className="ml-[52px] mt-0.5 text-[11px] font-medium text-white/50">FEES & STUDENT CARE</p></div>
        <button className="rounded-lg px-2 py-1 text-xl text-white/65 hover:bg-white/10 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">×</button>
      </div>
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Workspace</p>
      <nav className="space-y-1" onClick={() => setOpen(false)}>{NAV.map(([to, label, icon]) => <NavLink key={to} to={to} end={to === '/'} className={link}><span aria-hidden className="w-5 text-center text-lg leading-none opacity-80">{icon}</span>{label}</NavLink>)}</nav>
      <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p className="text-xs font-semibold text-white/90">A smoother month starts here.</p><p className="mt-1.5 text-xs leading-5 text-white/50">Keep collections, balances and student details in one place.</p></div>
    </aside>
    {open && <button className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-[2px] lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation" />}
    <div className="min-w-0 flex-1">
      <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-7">
        <div className="flex items-center gap-3"><button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-lg text-slate-600 hover:bg-slate-50 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">☰</button><div><p className="text-sm font-bold text-slate-800">{title}</p><p className="hidden text-xs text-slate-400 sm:block">Tuition management workspace</p></div></div>
        <div className="flex items-center gap-2 sm:gap-3"><span className="hidden text-right sm:block"><span className="block text-xs font-semibold text-slate-700">{user.username}</span><span className="block text-[11px] text-slate-400">Administrator</span></span><span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-sm font-bold uppercase text-brand">{user.username?.[0] || 'A'}</span><button className="btn-ghost !min-h-9 !rounded-lg !px-3 !py-1.5 text-xs" onClick={logout}>Log out</button></div>
      </header>
      <main data-reveal className="mx-auto max-w-[1440px] p-4 sm:p-6 lg:p-8"><Outlet /></main>
    </div>
  </div>;
}
