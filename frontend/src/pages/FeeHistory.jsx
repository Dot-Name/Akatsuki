import { useState } from 'react';
import { useFetch, useDebounce } from '../hooks/hooks';
import { get, download } from '../services/api';
import { PageHead, Skeleton, ErrorBox, Empty, StatusBadge, Stat } from '../components/ui';
import { inr, fdate, mlabel, methodLabel } from '../utils/format';
export default function FeeHistory() {
  const { data: months, loading, error, reload } = useFetch(() => get('/dashboard/monthly'), []); const [sel, setSel] = useState(null);
  const [f, setF] = useState({ status: '', search: '', className: '' }); const ds = useDebounce(f.search);
  const detail = useFetch(() => (sel ? get('/fees/monthly', { month: sel.month, year: sel.year, status: f.status, className: f.className, search: ds, limit: 100 }) : Promise.resolve(null)), [sel?.month, sel?.year, f.status, f.className, ds]);
  return <>
    <PageHead title="Fee history" />
    <div className="card mb-4 overflow-x-auto !p-0">{loading ? <div className="p-4"><Skeleton /></div> : error ? <div className="p-4"><ErrorBox error={error} onRetry={reload} /></div> : !months.length ? <Empty>No history yet. Collect a fee to start.</Empty> :
      <table className="w-full"><thead className="border-b bg-slate-50"><tr>{['Month', 'Expected', 'Collected', 'Pending'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
        <tbody className="divide-y">{[...months].reverse().map((m) => <tr key={`${m.year}-${m.month}`} className={`cursor-pointer hover:bg-slate-50 ${sel?.month === m.month && sel?.year === m.year ? 'bg-brand-soft' : ''}`} onClick={() => setSel(m)}>
          <td className="td font-semibold text-brand">{mlabel(m.month, m.year)}</td><td className="td">{inr(m.expected)}</td><td className="td text-paid">{inr(m.collected)}</td><td className="td text-due">{inr(m.pending)}</td></tr>)}</tbody></table>}</div>
    {sel && <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-bold">{mlabel(sel.month, sel.year)}</h2>
        <button className="btn-ghost" onClick={() => download('/fees/monthly/export', sel, `fees-${sel.year}-${sel.month}.csv`)}>Export CSV</button></div>
      <div className="mb-3 grid gap-2 sm:grid-cols-4"><input className="input sm:col-span-2" placeholder="Search" value={f.search} onChange={(e) => setF({ ...f, search: e.target.value })} />
        <input className="input" placeholder="Class" value={f.className} onChange={(e) => setF({ ...f, className: e.target.value })} />
        <select className="input" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}><option value="">All</option><option value="paid">Paid</option><option value="due">Due</option><option value="partial">Partial</option></select></div>
      <div className="card overflow-x-auto !p-0">{detail.loading ? <div className="p-4"><Skeleton /></div> : !detail.data?.items.length ? <Empty>No records match these filters.</Empty> :
        <table className="w-full"><thead className="border-b bg-slate-50"><tr>{['Student', 'Class', 'Due', 'Paid', 'Remaining', 'Status', 'Paid on', 'Method'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
          <tbody className="divide-y">{detail.data.items.map((r) => <tr key={r._id}><td className="td font-semibold">{r.student.name}</td><td className="td">{r.student.className}</td><td className="td">{inr(r.amountDue)}</td><td className="td">{inr(r.amountPaid)}</td><td className="td">{inr(r.remainingAmount)}</td>
            <td className="td"><StatusBadge status={r.status} overdueDays={r.daysOverdue} /></td><td className="td">{fdate(r.paymentDate)}</td><td className="td">{methodLabel(r.paymentMethod)}</td></tr>)}</tbody></table>}</div></>}
  </>;
}
