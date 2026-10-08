import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch, useDebounce } from '../hooks/hooks';
import { get, post, put, del, errMsg } from '../services/api';
import { StatusBadge, Skeleton, ErrorBox, Empty, Modal, PageHead, Field } from '../components/ui';
import { inr, fdate, today } from '../utils/format';
import PaymentForm from '../components/PaymentForm';

const blank = { name: '', className: '', phone: '', guardianName: '', guardianPhone: '', address: '', monthlyFee: '', joiningDate: today() };
function StudentForm({ initial, onSaved, onClose }) {
  const [f, setF] = useState(initial ? { ...initial, joiningDate: initial.joiningDate?.slice(0, 10) } : blank); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => { e.preventDefault(); setBusy(true); setErr('');
    try { const { _id, studentCode, createdAt, updatedAt, __v, currentFee, inactiveDate, ...body } = f; body.monthlyFee = +body.monthlyFee;
      initial ? await put(`/students/${initial._id}`, body) : await post('/students', body); onSaved(); } catch (x) { setErr(errMsg(x, 'Student could not be saved.')); } finally { setBusy(false); } };
  return <form onSubmit={submit} className="space-y-3">
    <Field label="Student name"><input className="input" value={f.name} onChange={set('name')} required /></Field>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Field label="Class"><input className="input" value={f.className} onChange={set('className')} required /></Field>
      <Field label="Monthly fee (₹)"><input className="input" type="number" min="1" value={f.monthlyFee} onChange={set('monthlyFee')} required /></Field></div>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Field label="Student phone (optional)"><input className="input" type="text" inputMode="tel" autoComplete="tel" placeholder="e.g. +91 98765 43210" value={f.phone || ''} onChange={set('phone')} /></Field>
      <Field label="Joining date"><input className="input" type="date" value={f.joiningDate} onChange={set('joiningDate')} /></Field></div>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Field label="Guardian name"><input className="input" value={f.guardianName} onChange={set('guardianName')} required /></Field>
      <Field label="Guardian phone (optional)"><input className="input" type="text" inputMode="tel" autoComplete="tel" placeholder="Any phone number format" value={f.guardianPhone || ''} onChange={set('guardianPhone')} /></Field></div>
    <Field label="Address"><input className="input" value={f.address || ''} onChange={set('address')} /></Field>
    {initial && <p className="text-xs text-slate-500">Changing the monthly fee only affects months created from now on. Past months keep their original amount.</p>}
    {err && <p className="text-due" role="alert">{err}</p>}<div className="flex gap-2"><button className="btn-primary flex-1" disabled={busy}>{busy ? 'Saving…' : 'Save student'}</button><button type="button" className="btn-ghost" onClick={onClose}>Cancel</button></div></form>;
}

export default function Students() {
  const [q, setQ] = useState({ search: '', className: '', status: 'active', sort: 'name', page: 1 }); const dq = useDebounce(q.search);
  const { data, loading, error, reload } = useFetch(() => get('/students', { ...q, search: dq, limit: 15 }), [dq, q.className, q.status, q.sort, q.page]);
  const [modal, setModal] = useState(null); const set = (k) => (e) => setQ({ ...q, [k]: e.target.value, page: 1 });
  const deactivate = async (s) => { if (window.confirm(`Deactivate ${s.name}? Fees will stop being generated. Payment history is kept.`)) { try { await del(`/students/${s._id}`); reload(); } catch (e) { alert(errMsg(e)); } } };
  const now = new Date();
  return <>
    <PageHead title="Students"><button className="btn-primary" onClick={() => setModal({ type: 'form' })}>Add student</button></PageHead>
    <div className="mb-4 grid gap-2 sm:grid-cols-4"><input className="input sm:col-span-2" placeholder="Search name, phone, guardian or ID" value={q.search} onChange={set('search')} />
      <input className="input" placeholder="Class (e.g. 10)" value={q.className} onChange={set('className')} />
      <select className="input" value={q.status} onChange={set('status')}><option value="active">Active</option><option value="inactive">Inactive</option><option value="">All</option></select></div>
    <div className="card overflow-x-auto !p-0">{loading ? <div className="p-4"><Skeleton /></div> : error ? <div className="p-4"><ErrorBox error={error} onRetry={reload} /></div> : !data.items.length ? <Empty>No students match. Try a different search or add a student.</Empty> :
      <table className="w-full"><thead className="border-b bg-slate-50"><tr>{['Student', 'Class', 'Guardian', 'Phone', 'Joined', 'Fee', 'Paid on', 'This month', ''].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
        <tbody className="divide-y">{data.items.map((s) => <tr key={s._id}>
          <td className="td font-semibold"><Link className="text-brand" to={`/students/${s._id}`}>{s.name}</Link></td><td className="td">{s.className}</td><td className="td">{s.guardianName}</td><td className="td">{s.phone || '–'}</td>
          <td className="td">{fdate(s.joiningDate)}</td><td className="td">{inr(s.monthlyFee)}</td><td className="td">{fdate(s.currentFee?.paymentDate)}</td>
          <td className="td">{s.status === 'inactive' ? <span className="text-slate-500">Inactive</span> : s.currentFee ? <StatusBadge status={s.currentFee.status} /> : '–'}</td>
          <td className="td"><div className="flex items-center gap-2">{s.status === 'active' && <button className="min-h-9 rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2" onClick={() => setModal({ type: 'pay', s })}>Collect</button>}<button className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2" onClick={() => setModal({ type: 'form', s })}>Edit</button>{s.status === 'active' && <button className="min-h-9 rounded-lg px-2.5 py-2 text-xs font-semibold text-due transition hover:bg-due-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-due/30 focus-visible:ring-offset-2" onClick={() => deactivate(s)}>Deactivate</button>}</div></td></tr>)}</tbody></table>}</div>
    {data && data.pages > 1 && <div className="mt-3 flex items-center justify-center gap-3"><button className="btn-ghost" disabled={q.page <= 1} onClick={() => setQ({ ...q, page: q.page - 1 })}>Previous</button><span className="text-sm">Page {data.page} of {data.pages}</span><button className="btn-ghost" disabled={q.page >= data.pages} onClick={() => setQ({ ...q, page: q.page + 1 })}>Next</button></div>}
    {modal?.type === 'form' && <Modal title={modal.s ? 'Edit student' : 'Add student'} onClose={() => setModal(null)}><StudentForm initial={modal.s} onClose={() => setModal(null)} onSaved={() => { setModal(null); reload(); }} /></Modal>}
    {modal?.type === 'pay' && <Modal title="Collect fee" onClose={() => { setModal(null); reload(); }}><PaymentForm studentId={modal.s._id} month={now.getMonth() + 1} year={now.getFullYear()} /></Modal>}
  </>;
}
