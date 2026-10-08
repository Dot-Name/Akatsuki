import { useState } from 'react';
import { useDebounce, useFetch } from '../hooks/hooks';
import { get, put, errMsg } from '../services/api';
import { Empty, Field, Skeleton } from './ui';
import { inr, mlabel } from '../utils/format';

export default function ReassignPayment({ paymentId, onCancel, onSuccess }) {
  const [query, setQuery] = useState('');
  const [studentId, setStudentId] = useState('');
  const [monthKey, setMonthKey] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const search = useDebounce(query.trim());
  const { data: matches, loading: searching, error: searchError } = useFetch(
    () => search ? get('/students', { search, status: 'active', limit: 8 }) : Promise.resolve(null),
    [search],
  );
  const { data: selected, loading: loadingStudent, error: studentError, reload } = useFetch(
    () => studentId ? get(`/students/${studentId}`) : Promise.resolve(null),
    [studentId],
  );

  const records = selected?.outstanding?.records || [];
  const selectedRecord = records.find((record) => `${record.month}-${record.year}` === monthKey);
  const chooseStudent = (student) => {
    setStudentId(student._id);
    setMonthKey('');
    setError('');
  };
  const submit = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;
    setBusy(true);
    setError('');
    try {
      await put(`/payments/${paymentId}/reassign`, {
        studentId,
        month: selectedRecord.month,
        year: selectedRecord.year,
        reason,
      });
      await onSuccess(studentId);
    } catch (err) {
      setError(errMsg(err, 'Payment could not be reassigned.'));
    } finally {
      setBusy(false);
    }
  };

  return <form onSubmit={submit} className="space-y-4">
    <p className="text-sm leading-6 text-slate-500">Choose the student and an outstanding month to move this payment to. The payment must fit within that month’s remaining balance.</p>
    <Field label="Find active student"><input className="input" value={studentId ? selected?.student?.name || '' : query} onChange={(e) => { setStudentId(''); setMonthKey(''); setQuery(e.target.value); }} placeholder="Search by student name, phone or ID" autoComplete="off" /></Field>
    {!studentId && query.trim() && <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white">
      {searching ? <div className="p-3"><Skeleton rows={2} /></div> : searchError ? <p className="p-3 text-sm text-due">{errMsg(searchError)}</p> : matches?.items?.length ? matches.items.map((student) => <button type="button" key={student._id} className="flex w-full items-center justify-between border-b border-slate-100 px-3.5 py-3 text-left last:border-0 hover:bg-slate-50" onClick={() => chooseStudent(student)}>
        <span><span className="block text-sm font-semibold text-slate-800">{student.name}</span><span className="mt-0.5 block text-xs text-slate-500">Class {student.className}{student.phone ? ` · ${student.phone}` : ''}</span></span><span className="text-brand">→</span>
      </button>) : matches ? <Empty>No active students found.</Empty> : null}
    </div>}
    {studentId && <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      {loadingStudent ? <Skeleton rows={2} /> : studentError ? <div className="text-sm text-due">{errMsg(studentError)} <button type="button" className="ml-2 font-semibold underline" onClick={reload}>Retry</button></div> : selected && <>
        <div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-800">{selected.student.name}</p><p className="mt-0.5 text-xs text-slate-500">Class {selected.student.className}</p></div><button type="button" className="text-xs font-semibold text-brand hover:underline" onClick={() => { setStudentId(''); setMonthKey(''); }}>Change</button></div>
        <Field label="Outstanding month" ><select className="input mt-2" value={monthKey} onChange={(e) => setMonthKey(e.target.value)} required>
          <option value="">Select a month</option>{records.map((record) => <option key={`${record.month}-${record.year}`} value={`${record.month}-${record.year}`}>{mlabel(record.month, record.year)} · {inr(record.remainingAmount)} remaining</option>)}
        </select></Field>
        {!records.length && <p className="mt-2 text-xs text-slate-500">This student has no outstanding months available.</p>}
      </>}
    </div>}
    <Field label="Reason (required)"><textarea className="input min-h-20 resize-y" value={reason} onChange={(e) => setReason(e.target.value)} minLength={3} required placeholder="Explain why this payment is being reassigned" /></Field>
    {error && <p className="rounded-xl border border-due/20 bg-due-soft px-3.5 py-3 text-sm text-due" role="alert">{error}</p>}
    <div className="flex gap-2"><button className="btn-primary flex-1" disabled={busy || loadingStudent || !selectedRecord}>{busy ? 'Reassigning…' : 'Reassign payment'}</button><button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button></div>
  </form>;
}
