import { useState } from 'react';
import { useFetch, useMonth } from '../hooks/hooks';
import { get, download } from '../services/api';
import { PageHead, MonthPicker, Skeleton, ErrorBox, Empty, Modal, StatusBadge } from '../components/ui';
import { inr, mlabel } from '../utils/format';
import PaymentForm from '../components/PaymentForm';
export default function PendingFees() {
  const [my, setMy] = useMonth(); const { data, loading, error, reload } = useFetch(() => get('/dashboard/pending', my), [my.month, my.year]); const [sel, setSel] = useState(null);
  return <>
    <PageHead title={`Pending fees, ${mlabel(my.month, my.year)}`}><div className="flex flex-wrap gap-2"><MonthPicker value={my} onChange={setMy} />
      <button className="btn-ghost" onClick={() => download('/fees/monthly/export', { ...my, pendingOnly: true }, `pending-${my.year}-${my.month}.csv`)}>Export CSV</button></div></PageHead>
    <div className="card overflow-x-auto !p-0">{loading ? <div className="p-4"><Skeleton /></div> : error ? <div className="p-4"><ErrorBox error={error} onRetry={reload} /></div> : !data.length ? <Empty>No pending fees for {mlabel(my.month, my.year)}.</Empty> :
      <table className="w-full"><thead className="border-b bg-slate-50"><tr>{['Student', 'Class', 'Guardian', 'Phone', 'Remaining', 'Status', ''].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
        <tbody className="divide-y">{data.map((r) => <tr key={r._id}><td className="td font-semibold">{r.studentId?.name}</td><td className="td">{r.studentId?.className}</td><td className="td">{r.studentId?.guardianName}</td><td className="td">{r.studentId?.phone || '–'}</td>
          <td className="td font-bold">{inr(r.remainingAmount)}</td><td className="td"><StatusBadge status={r.status} overdueDays={r.daysOverdue} /></td><td className="td"><button className="font-semibold text-brand" onClick={() => setSel(r)}>Collect</button></td></tr>)}</tbody></table>}</div>
    {sel && <Modal title="Collect fee" onClose={() => { setSel(null); reload(); }}><PaymentForm studentId={sel.studentId._id} month={my.month} year={my.year} /></Modal>}
  </>;
}
