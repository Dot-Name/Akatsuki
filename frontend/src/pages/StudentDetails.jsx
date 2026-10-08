import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../hooks/hooks';
import { get, put, errMsg } from '../services/api';
import { StatusBadge, Skeleton, ErrorBox, Empty, Modal, PageHead, Stat } from '../components/ui';
import { inr, fdate, mlabel, methodLabel } from '../utils/format';
import PaymentForm from '../components/PaymentForm'; import Receipt from '../components/Receipt';
import ReassignPayment from '../components/ReassignPayment';
export default function StudentDetails() {
  const { id } = useParams(); const { data, loading, error, reload } = useFetch(() => get(`/fees/student/${id}`), [id]);
  const [pay, setPay] = useState(false); const [receipt, setReceipt] = useState(null); const [reassign, setReassign] = useState(null); const now = new Date();
  if (loading) return <Skeleton rows={6} />; if (error) return <ErrorBox error={error} onRetry={reload} />;
  const { student: s, history, payments, outstanding } = data;
  const voidPay = async (p) => { const reason = window.prompt('Voiding changes financial history (it stays in the audit log). Reason for voiding this payment?'); if (!reason || reason.length < 3) return;
    try { await put(`/payments/${p._id}`, { voided: true, reason }); reload(); } catch (e) { alert(errMsg(e)); } };
  const refreshAfterReassign = async (targetStudentId) => {
    reload();
    setReassign(null);
    if (String(targetStudentId) !== String(id)) {
      try { await get(`/fees/student/${targetStudentId}`); } catch { /* the payment and current student details are already refreshed */ }
    }
  };
  return <>
    <PageHead title={s.name}>{s.status === 'active' && <button className="btn-primary" onClick={() => setPay(true)}>Collect fee</button>}</PageHead>
    <div className="mb-4 grid gap-3 sm:grid-cols-3"><div className="card sm:col-span-2"><p className="text-slate-600">Class {s.className} · {s.studentCode} {s.status === 'inactive' && '· Inactive'}</p>
      <p>Guardian: <b>{s.guardianName}</b> {s.guardianPhone && `· ${s.guardianPhone}`}</p><p>Student phone: {s.phone || '–'}</p><p>Monthly fee: <b>{inr(s.monthlyFee)}</b> · Joined {fdate(s.joiningDate)}</p></div>
      <Stat label="Total outstanding" value={inr(outstanding.total)} tone={outstanding.total ? 'text-due' : 'text-paid'} sub={outstanding.records.map((r) => `${mlabel(r.month, r.year, true)} ${inr(r.remainingAmount)}`).join(' · ')} /></div>
    <h2 className="mb-2 text-lg font-bold">Fee history</h2>
    <div className="card mb-6 overflow-x-auto !p-0">{history.length ? <table className="w-full"><thead className="border-b bg-slate-50"><tr>{['Month', 'Due', 'Paid', 'Remaining', 'Status', 'Last payment', 'Method'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
      <tbody className="divide-y">{history.map((f) => <tr key={f._id}><td className="td font-semibold">{mlabel(f.month, f.year)}</td><td className="td">{inr(f.amountDue)}</td><td className="td">{inr(f.amountPaid)}</td><td className="td">{inr(f.remainingAmount)}</td>
        <td className="td"><StatusBadge status={f.status} /></td><td className="td">{fdate(f.paymentDate)}</td><td className="td">{methodLabel(f.paymentMethod)}</td></tr>)}</tbody></table> : <Empty>No fee records yet.</Empty>}</div>
    <h2 className="mb-2 text-lg font-bold">Payments</h2>
    <div className="card overflow-x-auto !p-0">{payments.length ? <table className="w-full"><thead className="border-b bg-slate-50"><tr>{['Paid on', 'Month', 'Amount', 'Method', 'Recorded', 'Note', ''].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
      <tbody className="divide-y">{payments.map((p) => { const f = history.find((h) => h._id === p.feeRecordId); return <tr key={p._id}><td className="td font-semibold">{fdate(p.paymentDate)}</td><td className="td">{f && mlabel(f.month, f.year, true)}</td><td className="td">{inr(p.amount)}</td>
        <td className="td">{methodLabel(p.paymentMethod)}</td><td className="td text-slate-500">{fdate(p.createdAt)}</td><td className="td">{p.notes}</td>
        <td className="td space-x-3"><button className="font-medium text-brand hover:underline" onClick={() => setReceipt(p._id)}>Receipt</button><button className="font-medium text-brand hover:underline" onClick={() => setReassign(p)}>Reassign</button><button className="font-medium text-due hover:underline" onClick={() => voidPay(p)}>Void</button></td></tr>; })}</tbody></table> : <Empty>No payments recorded.</Empty>}</div>
    <Link to="/students" className="mt-4 inline-block text-brand">Back to students</Link>
    {pay && <Modal title="Collect fee" onClose={() => { setPay(false); reload(); }}><PaymentForm studentId={id} month={now.getMonth() + 1} year={now.getFullYear()} /></Modal>}
    {reassign && <Modal title="Reassign payment" onClose={() => setReassign(null)}><ReassignPayment paymentId={reassign._id} onCancel={() => setReassign(null)} onSuccess={refreshAfterReassign} /></Modal>}
    {receipt && <Receipt paymentId={receipt} onClose={() => setReceipt(null)} />}
  </>;
}
