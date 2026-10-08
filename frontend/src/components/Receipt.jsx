import { useFetch } from '../hooks/hooks';
import { get } from '../services/api';
import { Modal, Skeleton, ErrorBox } from './ui';
import { inr, fdate, mlabel, methodLabel } from '../utils/format';
export default function Receipt({ paymentId, onClose }) {
  const { data: r, loading, error } = useFetch(() => get(`/payments/${paymentId}/receipt`), [paymentId]);
  return <Modal title="Receipt" onClose={onClose}>
    {loading ? <Skeleton rows={5} /> : error ? <ErrorBox error={error} /> : <>
      <div id="receipt" className="rounded border border-slate-300 p-5">
        <h3 className="text-center text-xl font-bold">{r.tuitionName}</h3><p className="mb-4 text-center text-sm text-slate-500">Fee receipt · {r.receiptId}</p>
        <dl className="grid grid-cols-2 gap-y-2 text-sm">{[['Student', r.studentName], ['Class', r.className], ['Guardian', r.guardianName], ['Fee month', mlabel(r.month, r.year)],
          ['Amount paid', inr(r.amount)], ['Payment date', fdate(r.paymentDate)], ['Method', methodLabel(r.paymentMethod)]].map(([k, v]) => <div key={k} className="contents"><dt className="text-slate-500">{k}</dt><dd className="font-semibold">{v}</dd></div>)}</dl>
        {r.voided && <p className="mt-3 font-bold text-due">VOIDED</p>}
      </div>
      <div className="mt-4 flex gap-2"><button className="btn-primary flex-1" onClick={() => window.print()}>Print or save as PDF</button><button className="btn-ghost" onClick={onClose}>Close</button></div></>}
  </Modal>;
}
