import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login'; import Dashboard from './pages/Dashboard'; import Students from './pages/Students'; import StudentDetails from './pages/StudentDetails';
import CollectFees from './pages/CollectFees'; import PendingFees from './pages/PendingFees'; import FeeHistory from './pages/FeeHistory'; import Settings from './pages/Settings';
import PublicHome from './pages/PublicHome';
function Guard() { const { user, loading } = useAuth(); if (loading) return <p className="p-8">Loading…</p>; return user ? <Layout /> : <Navigate to="/login" replace />; }
export default function App() {
  useEffect(() => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const root = document.documentElement;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    const observeNew = () => document.querySelectorAll('[data-reveal]:not([data-reveal-observed])').forEach((element) => {
      element.setAttribute('data-reveal-observed', '');
      observer.observe(element);
    });
    root.classList.add('motion-enabled');
    observeNew();
    const mutations = new MutationObserver(observeNew);
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => {
      mutations.disconnect();
      observer.disconnect();
      root.classList.remove('motion-enabled');
      document.querySelectorAll('[data-reveal-observed]').forEach((element) => element.removeAttribute('data-reveal-observed'));
    };
  }, []);

  return <AuthProvider><BrowserRouter><Routes>
    <Route path="/" element={<PublicHome />} /><Route path="/login" element={<Login />} />
    <Route element={<Guard />}><Route path="dashboard" element={<Dashboard />} /><Route path="students" element={<Students />} /><Route path="students/:id" element={<StudentDetails />} />
      <Route path="collect" element={<CollectFees />} /><Route path="pending" element={<PendingFees />} /><Route path="history" element={<FeeHistory />} /><Route path="settings" element={<Settings />} /></Route>
    <Route path="*" element={<Navigate to="/" />} /></Routes></BrowserRouter></AuthProvider>;
}
