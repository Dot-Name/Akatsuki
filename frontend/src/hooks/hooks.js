import { useEffect, useState, useCallback } from 'react';
export const useDebounce = (v, ms = 350) => { const [d, setD] = useState(v); useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t); }, [v, ms]); return d; };
export const useMonth = () => { const n = new Date(); return useState({ month: n.getMonth() + 1, year: n.getFullYear() }); };
/** Fetch helper: {data, loading, error, reload} */
export const useFetch = (fn, deps) => {
  const [s, setS] = useState({ data: null, loading: true, error: null });
  const run = useCallback(() => { setS((x) => ({ ...x, loading: true, error: null })); fn().then((data) => setS({ data, loading: false, error: null }), (error) => setS({ data: null, loading: false, error })); }, deps); // eslint-disable-line
  useEffect(run, [run]);
  return { ...s, reload: run };
};
