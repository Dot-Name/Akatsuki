import { useState, useEffect } from 'react';
import { get, put, errMsg } from '../services/api';
import { PageHead, Field } from '../components/ui';
export default function Settings() {
  const [s, setS] = useState(null); const [msg, setMsg] = useState(''); const [pw, setPw] = useState({ currentPassword: '', newPassword: '' }); const [pmsg, setPmsg] = useState('');
  useEffect(() => { get('/settings').then(setS).catch((e) => setMsg(errMsg(e))); }, []);
  const save = async (e) => { e.preventDefault(); try { await put('/settings', { tuitionName: s.tuitionName, dueDay: +s.dueDay, midMonthJoin: s.midMonthJoin }); setMsg('Settings saved.'); } catch (x) { setMsg(errMsg(x)); } };
  const changePw = async (e) => { e.preventDefault(); if (!window.confirm('Change the admin password?')) return; try { await put('/auth/change-password', pw); setPmsg('Password changed.'); setPw({ currentPassword: '', newPassword: '' }); } catch (x) { setPmsg(errMsg(x)); } };
  return <><PageHead title="Settings" /><div className="grid gap-4 lg:grid-cols-2">
    {s && <form onSubmit={save} className="card space-y-3"><h2 className="font-bold">Tuition</h2>
      <Field label="Tuition name (shown on receipts)"><input className="input" value={s.tuitionName} onChange={(e) => setS({ ...s, tuitionName: e.target.value })} /></Field>
      <Field label="Fee due day of month (1 to 28)"><input className="input" type="number" min="1" max="28" value={s.dueDay} onChange={(e) => setS({ ...s, dueDay: e.target.value })} /></Field>
      <Field label="Student joins mid-month"><select className="input" value={s.midMonthJoin} onChange={(e) => setS({ ...s, midMonthJoin: e.target.value })}><option value="full">Charge the full month</option><option value="half">Charge half the month</option></select></Field>
      <button className="btn-primary">Save settings</button>{msg && <p className="text-sm">{msg}</p>}</form>}
    <form onSubmit={changePw} className="card space-y-3"><h2 className="font-bold">Change password</h2>
      <Field label="Current password"><input className="input" type="password" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required /></Field>
      <Field label="New password (8+ characters)"><input className="input" type="password" autoComplete="new-password" minLength={8} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required /></Field>
      <button className="btn-primary">Change password</button>{pmsg && <p className="text-sm">{pmsg}</p>}</form></div></>;
}
