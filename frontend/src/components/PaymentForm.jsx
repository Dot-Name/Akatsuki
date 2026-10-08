import { useState } from 'react';
import { useFetch } from '../hooks/hooks';
import { get, post, errMsg } from '../services/api';
import { StatusBadge, Skeleton, ErrorBox, Field } from './ui';
import { inr, fdate, mlabel, today, METHODS } from '../utils/format';
import Receipt from './Receipt';

/** Collect a fee for one student and allocate it to the selected pending months. */
export default function PaymentForm({ studentId, month, year, onDone }) {
  const { data, loading, error, reload } = useFetch(() => get(`/fees/student/${studentId}`), [studentId]);
  const [mode, setMode] = useState('month'); const [amount, setAmount] = useState(''); const [method, setMethod] = useState('upi');
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [date, setDate] = useState(today()); const [notes, setNotes] = useState(''); const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null); const [receipt, setReceipt] = useState(null);
  if (loading) return <Skeleton rows={3} />; if (error) return <ErrorBox error={error} onRetry={reload} />;
  const { student, history, outstanding } = data; const fee = history.find((f) => f.month === month && f.year === year);
  const selectedRecords = outstanding.records.filter((r) => selectedMonths.includes(`${r.year}-${r.month}`));
  const selectedTotal = selectedRecords.reduce((sum, r) => sum + r.remainingAmount, 0);
  const max = mode === 'month' ? fee?.remainingAmount ?? 0 : mode === 'selected' ? selectedTotal : outstanding.total; const value = amount === '' ? max : amount;
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setMsg(null);
    try { const res = await post('/fees/collect', { studentId, month, year, mode, ...(mode === 'selected' ? { months: selectedRecords.map(({ month: m, year: y }) => ({ month: m, year: y })) } : {}), amount: +value, paymentDate: date, paymentMethod: method, notes });
      const first = Array.isArray(res) ? res[0] : res; setMsg({ ok: true, id: first._id }); setAmount(''); setNotes(''); reload(); onDone?.(); }
    catch (err) { setMsg({ ok: false, text: errMsg(err, 'Payment could not be recorded. Please check the amount.') }); } finally { setBusy(false); }
  };
  return <form onSubmit={submit} className="space-y-5">
    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-base font-bold uppercase text-brand">{student.name?.[0] || 'S'}</span><div><p className="font-bold text-slate-800">{student.name}</p><p className="mt-0.5 text-xs text-slate-500">Class {student.className}{student.phone ? ` · ${student.phone}` : ''}</p></div></div><div className="rounded-xl bg-white px-3 py-2 text-right shadow-sm"><p className="text-[11px] font-semibold text-slate-400">MONTHLY FEE</p><p className="mt-0.5 text-sm font-bold text-slate-800">{inr(student.monthlyFee)}</p></div></div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2"><div className="rounded-xl border border-slate-200/80 bg-white p-3"><p className="text-xs font-semibold text-slate-500">{mlabel(month, year)} balance</p><div className="mt-1.5 flex flex-wrap items-center gap-2">{fee ? <><StatusBadge status={fee.status} /><span className="text-sm font-bold text-slate-800">{inr(fee.remainingAmount)} left</span></> : <span className="text-sm text-slate-500">No fee record</span>}</div>{fee?.remainingAmount === 0 && <p className="mt-1 text-xs text-slate-400">Paid {fdate(fee.paymentDate)}</p>}</div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-3"><p className="text-xs font-semibold text-slate-500">All outstanding fees</p><p className={`mt-1.5 text-sm font-bold ${outstanding.total > 0 ? 'text-due' : 'text-paid'}`}>{inr(outstanding.total)} remaining</p><p className="mt-1 truncate text-xs text-slate-400">{outstanding.records.length ? outstanding.records.map((r) => mlabel(r.month, r.year, true)).join(' · ') : 'No unpaid months'}</p></div></div>
    </div>
    <div><p className="mb-2 text-xs font-semibold text-slate-600">Apply payment to</p><div className="grid grid-cols-3 gap-1.5 sm:gap-2" role="radiogroup" aria-label="Payment allocation">{[['month', `${mlabel(month, year, true)} only`], ['selected', 'Choose months'], ['outstanding', 'All pending']].map(([k, l]) =>
      <button type="button" role="radio" aria-checked={mode === k} key={k} onClick={() => { setMode(k); setAmount(''); }} className={`min-h-11 min-w-0 rounded-xl border px-1.5 py-2 text-xs font-semibold leading-tight transition sm:px-3 sm:py-2.5 sm:text-sm ${mode === k ? 'border-brand bg-brand text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{l}</button>)}</div></div>
    {mode === 'selected' && <section aria-label="Choose pending months"><div className="mb-2 flex items-center justify-between gap-2"><p className="text-xs font-semibold text-slate-600">Select the month or months this payment covers</p><span className="text-xs text-slate-500">{selectedRecords.length} selected · {inr(selectedTotal)}</span></div>
      {outstanding.records.length ? <div className="grid gap-2 sm:grid-cols-2">{outstanding.records.map((record) => { const key = `${record.year}-${record.month}`; const checked = selectedMonths.includes(key); return <label key={key} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${checked ? 'border-brand bg-brand-soft/50 ring-1 ring-brand/20' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}>
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={() => { setSelectedMonths((prev) => checked ? prev.filter((item) => item !== key) : [...prev, key]); setAmount(''); }} />
        <span aria-hidden className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold transition ${checked ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white text-transparent'}`}>✓</span>
        <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-800">{mlabel(record.month, record.year)}</span><span className="text-xs text-slate-500">Pending balance</span></span><span className="text-sm font-bold tabular-nums text-due">{inr(record.remainingAmount)}</span>
      </label>; })}</div> : <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">There are no pending months to select.</p>}</section>}
    {max <= 0 ? <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-700">Nothing to collect for this selection.</p>{mode === 'month' && outstanding.total > 0 && <button type="button" className="mt-2 text-sm font-semibold text-brand hover:underline" onClick={() => { setMode('outstanding'); setAmount(''); }}>Collect an older outstanding month →</button>}</div> : <>
      <Field label={`Payment amount · up to ${inr(max)}`}><div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">₹</span><input className="input !pl-8 !py-3 text-lg font-semibold tabular-nums" inputMode="numeric" type="number" min="1" max={max} value={value} onChange={(e) => setAmount(e.target.value)} required /></div></Field>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Field label="Payment method"><select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>{METHODS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
        <Field label="Payment date"><input className="input" type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} required /></Field></div>
      <Field label="Note (optional)"><input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add a short note for this payment" /></Field>
      <button className="btn-primary w-full !py-3 text-base" disabled={busy || +value < 1 || +value > max}>{busy ? 'Saving payment…' : `Record payment · ${inr(value)}`}</button></>}
    {msg && (msg.ok ? <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#2B2B2B]/20 bg-paid-soft p-4 text-sm font-semibold text-paid"><span>Payment recorded successfully.</span><button type="button" className="rounded-lg px-2 py-1 underline underline-offset-2" onClick={() => setReceipt(msg.id)}>View receipt</button></div>
      : <p className="rounded-xl border border-red-100 bg-due-soft p-4 text-sm text-due" role="alert">{msg.text}</p>)}
    {receipt && <Receipt paymentId={receipt} onClose={() => setReceipt(null)} />}
  </form>;
}
