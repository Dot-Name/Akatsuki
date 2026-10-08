import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { useFetch, useMonth } from '../hooks/hooks';
import { get } from '../services/api';
import { Stat, MonthPicker, PageHead, Skeleton, ErrorBox, Empty } from '../components/ui';
import { inr, fdate, mlabel } from '../utils/format';
const tooltipStyle = { contentStyle: { backgroundColor: '#171717', border: '1px solid #333333', borderRadius: 12 }, labelStyle: { color: '#FFFFFF' }, itemStyle: { color: '#FFFFFF' } };
export default function Dashboard() {
  const [my, setMy] = useMonth();
  const { data: s, loading, error, reload } = useFetch(() => get('/dashboard/summary', my), [my.month, my.year]);
  const { data: monthly } = useFetch(() => get('/dashboard/monthly'), []); const { data: daily } = useFetch(() => get('/dashboard/daily', my), [my.month, my.year]);
  const pie = s ? [['Paid', s.paid, '#2B2B2B'], ['Due', s.due, '#C62828'], ['Partial', s.partial, '#E65100']].map(([name, value, color]) => ({ name, value, color })) : [];
  return <>
    <PageHead title="Dashboard"><MonthPicker value={my} onChange={setMy} /></PageHead>
    {loading ? <Skeleton rows={3} /> : error ? <ErrorBox error={error} onRetry={reload} /> : <>
      <div className="relative mb-5 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B0B0B] via-[#2B2B2B] to-[#C62828] p-6 text-white shadow-lg shadow-brand/10 sm:p-8">
        <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full border border-white/10"/><div className="absolute -right-2 -top-12 h-48 w-48 rounded-full border border-white/10"/>
        <div className="relative flex flex-wrap items-end justify-between gap-6"><div><p className="text-sm font-medium text-white/65">Total collected · {mlabel(my.month, my.year)}</p><p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{inr(s.collected)}</p><p className="mt-2 text-sm text-white/65">of {inr(s.expected)} expected</p></div>
          <div className="min-w-[150px] rounded-xl border border-white/10 bg-white/[0.08] px-4 py-3"><p className="text-xs font-medium text-white/65">Still pending</p><p className="mt-1 text-2xl font-bold">{inr(s.pending)}</p></div></div>
        <div className="relative mt-7"><div className="mb-2 flex justify-between text-xs font-semibold text-white/90"><span>Monthly collection progress</span><span>{s.collectionPercent}%</span></div><div className="h-3 overflow-hidden rounded-full border border-white/20 bg-white/15"><div className="h-full rounded-full bg-[#E65100] shadow-[0_0_12px_rgba(230,81,0,0.45)] transition-all" style={{ width: `${Math.min(100, s.collectionPercent)}%`, minWidth: s.collectionPercent > 0 ? '4px' : 0 }} /></div></div>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4"><Stat label="Total students" value={s.totalStudents} /><Stat label="Students paid" value={s.paid} tone="text-paid" />
        <Stat label="Students due" value={s.due} tone="text-due" /><Stat label="Partial" value={s.partial} tone="text-part" /></div>
      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2"><h2 className="mb-1 text-sm font-bold text-slate-800">Collected per month</h2><p className="mb-3 text-xs text-slate-400">Collection trend across recent months</p><ResponsiveContainer height={240}><BarChart data={(monthly || []).map((m) => ({ ...m, label: mlabel(m.month, m.year, true) }))}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333333" /><XAxis dataKey="label" fontSize={12} axisLine={false} tickLine={false} tick={{ fill: '#B8B8B8' }} /><YAxis fontSize={12} width={50} axisLine={false} tickLine={false} tick={{ fill: '#B8B8B8' }} /><Tooltip {...tooltipStyle} formatter={inr} /><Bar dataKey="collected" fill="#C62828" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div>
        <div className="card"><h2 className="mb-1 text-sm font-bold text-slate-800">Paid vs due</h2><p className="mb-3 text-xs text-slate-400">Student fee status this month</p><ResponsiveContainer height={240}><PieChart><Pie data={pie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>{pie.map((p) => <Cell key={p.name} fill={p.color} />)}</Pie><Tooltip {...tooltipStyle} /></PieChart></ResponsiveContainer>
          <p className="text-center text-sm text-slate-600">Paid {s.paid} · Due {s.due} · Partial {s.partial}</p></div></div>
      <div className="card mb-5"><h2 className="mb-1 text-sm font-bold text-slate-800">Daily collection</h2><p className="mb-3 text-xs text-slate-400">Payments received in {mlabel(my.month, my.year)}</p>{daily?.length ? <ResponsiveContainer height={200}><BarChart data={daily}><XAxis dataKey="day" fontSize={12} axisLine={false} tickLine={false} tick={{ fill: '#B8B8B8' }} /><YAxis fontSize={12} width={50} axisLine={false} tickLine={false} tick={{ fill: '#B8B8B8' }} /><Tooltip {...tooltipStyle} formatter={inr} /><Bar dataKey="collected" fill="#C62828" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer> : <Empty>No payments recorded this month.</Empty>}</div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card"><h2 className="mb-1 text-sm font-bold text-slate-800">Recent payments</h2><p className="mb-2 text-xs text-slate-400">Latest activity</p>{s.recentPayments.length ? <ul className="divide-y divide-slate-100">{s.recentPayments.map((p) => <li key={p._id} className="flex justify-between py-3 text-sm">
          <span><Link className="font-semibold text-brand" to={`/students/${p.studentId?._id}`}>{p.studentId?.name}</Link><br /><span className="text-slate-500">{p.feeRecordId && mlabel(p.feeRecordId.month, p.feeRecordId.year, true)} · {fdate(p.paymentDate)}</span><br /><span className="text-xs text-slate-400">Joined {fdate(p.studentId?.joiningDate)}</span></span><b>{inr(p.amount)}</b></li>)}</ul> : <Empty>No payments yet.</Empty>}</div>
        <div className="card"><h2 className="mb-1 text-sm font-bold text-slate-800">Older unpaid fees</h2><p className="mb-2 text-xs text-slate-400">Students with outstanding balances</p>{s.outstandingStudents.length ? <ul className="divide-y divide-slate-100">{s.outstandingStudents.map((o) => <li key={o._id} className="flex justify-between py-3 text-sm">
          <span><Link className="font-semibold text-brand" to={`/students/${o._id}`}>{o.name}</Link><br /><span className="text-xs font-normal text-slate-400">Joined {fdate(o.joiningDate)} · {o.months} month{o.months > 1 && 's'} unpaid</span></span><b className="text-due">{inr(o.total)}</b></li>)}</ul> : <Empty>No old outstanding fees.</Empty>}</div></div></>}
  </>;
}
