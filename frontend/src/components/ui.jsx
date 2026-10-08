import { MONTHS } from '../utils/format';
import { errMsg } from '../services/api';
const BADGE = { paid: ['bg-paid-soft text-paid', 'Paid', '●'], due: ['bg-due-soft text-due', 'Due', '●'], partial: ['bg-part-soft text-part', 'Partial', '●'], overdue: ['bg-due text-white', 'Overdue', '●'] };
export function StatusBadge({ status, overdueDays }) {
  const key = status !== 'paid' && overdueDays > 0 ? 'overdue' : status; const [c, label, dot] = BADGE[key] || BADGE.due;
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${c}`}><span aria-hidden>{dot}</span>{label}{key === 'overdue' && ` · ${overdueDays}d`}</span>;
}
export const Skeleton = ({ rows = 4 }) => <div className="animate-pulse space-y-3" aria-busy>{Array.from({ length: rows }).map((_, i) => <div key={i} className="h-10 rounded bg-slate-200" />)}</div>;
export const Empty = ({ children }) => <div className="px-5 py-12 text-center"><span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-lg text-slate-400">–</span><p className="text-sm text-slate-500">{children}</p></div>;
export const ErrorBox = ({ error, onRetry }) => <div className="card flex flex-wrap items-center justify-between gap-3 border-due/20 bg-due-soft/70 text-sm text-due"><span>{errMsg(error)}</span>{onRetry && <button className="rounded-lg px-3 py-2 font-semibold hover:bg-due-soft" onClick={onRetry}>Try again</button>}</div>;
export function Modal({ title, onClose, children, wide }) {
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
    <div className={`max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6 ${wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
      <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4"><h2 className="text-lg font-bold tracking-tight text-slate-800">{title}</h2><button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-xl text-slate-500 hover:bg-slate-100" aria-label="Close">×</button></div>{children}</div></div>;
}
export const Stat = ({ label, value, tone, sub }) => <div className="card min-w-0"><p className="text-xs font-semibold text-slate-500">{label}</p><p className={`mt-2 truncate text-2xl font-bold tracking-tight ${tone || 'text-slate-800'}`}>{value}</p>{sub && <p className="mt-1 text-xs leading-5 text-slate-400">{sub}</p>}</div>;
export function MonthPicker({ value, onChange }) {
  const y = new Date().getFullYear();
  return <div className="flex gap-2"><select className="input !w-auto" value={value.month} onChange={(e) => onChange({ ...value, month: +e.target.value })} aria-label="Month">{MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select>
    <select className="input !w-auto" value={value.year} onChange={(e) => onChange({ ...value, year: +e.target.value })} aria-label="Year">{[y - 2, y - 1, y, y + 1].map((v) => <option key={v}>{v}</option>)}</select></div>;
}
export const PageHead = ({ title, children }) => <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h1 className="text-[26px] font-bold tracking-tight text-slate-900">{title}</h1>{children}</div>;
export const Field = ({ label, children }) => <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>{children}</label>;
