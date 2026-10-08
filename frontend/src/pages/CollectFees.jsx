import { useState } from 'react';
import { useFetch, useDebounce, useMonth } from '../hooks/hooks';
import { get } from '../services/api';
import { PageHead, MonthPicker, Empty, StatusBadge, Skeleton, ErrorBox } from '../components/ui';
import { inr, mlabel } from '../utils/format';
import PaymentForm from '../components/PaymentForm';

export default function CollectFees() {
  const [search, setSearch] = useState('');
  const query = useDebounce(search.trim());
  const [my, setMy] = useMonth();
  const [sel, setSel] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const { data, loading, error, reload } = useFetch(
    () => query.length >= 2 ? get('/students', { search: query, status: 'active', limit: 8, ...my }) : Promise.resolve(null),
    [query, my.month, my.year, refresh],
  );
  const clearStudent = () => { setSel(null); setSearch(''); };

  return <>
    <PageHead title="Collect fees"><MonthPicker value={my} onChange={setMy} /></PageHead>
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 rounded-2xl bg-gradient-to-r from-[#0B0B0B] to-[#2B2B2B] px-5 py-5 text-white sm:px-7 sm:py-6">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/60">Payment collection</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-bold tracking-tight sm:text-2xl">Find a student to get started</h2><p className="mt-1 text-sm text-white/65">Collecting for <span className="font-semibold text-white">{mlabel(my.month, my.year)}</span></p></div><span className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl sm:flex" aria-hidden>₹</span></div>
      </div>

      {!sel ? <section className="card !p-0">
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <label htmlFor="student-search" className="mb-2 block text-sm font-semibold text-slate-800">Search active students</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>⌕</span>
            <input id="student-search" className="input !pl-10 !pr-10 !py-3" placeholder="Name, phone, guardian or student ID" value={search} onChange={(e) => setSearch(e.target.value)} autoComplete="off" />
            {search && <button type="button" className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Clear search" onClick={() => setSearch('')}>×</button>}
          </div>
          <p className="mt-2 text-xs text-slate-400">Enter at least 2 characters. Inactive students are hidden.</p>
        </div>
        {loading && query.length >= 2 ? <div className="space-y-3 p-4"><Skeleton rows={3} /></div> : error ? <div className="p-4"><ErrorBox error={error} onRetry={reload} /></div> : data?.items?.length ? <ul className="divide-y divide-slate-100">
          {data.items.map((student) => <li key={student._id}><button type="button" className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-slate-50 sm:px-5" onClick={() => setSel(student)}>
            <span className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-sm font-bold uppercase text-brand">{student.name?.[0] || 'S'}</span><span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-800">{student.name}</span><span className="mt-0.5 block truncate text-xs text-slate-500">Class {student.className}{student.guardianName ? ` · ${student.guardianName}` : ''}{student.phone ? ` · ${student.phone}` : ''}</span></span></span>
            <span className="flex items-center gap-3 pl-[52px] sm:pl-0">{student.currentFee ? <><span className="hidden text-right sm:block"><span className="block text-xs text-slate-400">Balance due</span><span className="text-sm font-semibold text-slate-700">{inr(student.currentFee.remainingAmount)}</span></span><StatusBadge status={student.currentFee.status} /></> : <span className="text-xs text-slate-400">No fee record yet</span>}<span className="text-lg text-brand" aria-hidden>→</span></span>
          </button></li>)}
        </ul> : query.length >= 2 && data ? <Empty>No active student matched “{query}”. Try another name, phone number or ID.</Empty> : <div className="px-5 py-10 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-400" aria-hidden>⌕</span><p className="mt-3 text-sm font-semibold text-slate-700">Search for a student</p><p className="mt-1 text-xs text-slate-400">Choose a student to see their balance and record a payment.</p></div>}
      </section> : <section>
        <div className="mb-3 flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Selected student</p><p className="mt-0.5 text-sm text-slate-600">Review their balance before recording a payment.</p></div><button type="button" className="btn-ghost !min-h-9 !px-3 !py-1.5 text-xs" onClick={clearStudent}>Change student</button></div>
        <div className="card"><PaymentForm key={`${sel._id}-${my.month}-${my.year}`} studentId={sel._id} month={my.month} year={my.year} onDone={() => setRefresh((v) => v + 1)} /></div>
      </section>}
    </div>
  </>;
}
