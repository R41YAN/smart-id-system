import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { BoardDecor } from '../components/Decor';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate(res.data.user.role === 'super_admin' ? '/super-admin' : '/admin');
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach backend server. Please verify backend is running on port 5000 (cd backend && npm run dev).');
      } else if (err.response.status === 503) {
        setError(err.response.data?.message || 'Database connection error. Please ensure internet access to reach the Cloud Supabase database.');
      } else {
        setError(err.response?.data?.message || 'Invalid credentials or login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sifs-board min-h-screen flex items-center justify-center p-4 relative overflow-hidden text-slate-100 selection:bg-blue-400 selection:text-slate-900">
      <BoardDecor />

      <div className="w-full max-w-md relative z-10">
        {/* Index-card style login card */}
        <div className="relative bg-slate-800 border-2 border-b-[6px] border-slate-700 rounded-[28px] px-7 pt-11 pb-8 sm:px-9">
          {/* strip of tape */}
          <div aria-hidden="true" className="absolute -top-3.5 left-1/2 -ml-[60px] w-[120px] h-7 bg-yellow-400/85 -rotate-2 rounded-sm" />

          {/* Logo & Header */}
          <div className="text-center mb-7">
            {/* Logo tile with a soft blue glow */}
            <div className="relative inline-block mb-3">
              <div aria-hidden="true" className="absolute -inset-2 rounded-3xl bg-blue-500/30 blur-xl" />
              <img
                src="/logo.jpg"
                alt="SIFS Official Badge"
                className="relative w-20 h-20 rounded-2xl object-cover border border-slate-600/70 shadow-[0_0_22px_2px_rgba(96,165,250,0.35)]"
              />
            </div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">Welcome back</p>
            <h1 className="mt-1 text-[26px] font-black tracking-tight text-slate-50">
              Smart ID Formatting System
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-300">
              Institutional ID Management Platform
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div role="alert" className="bg-rose-500/15 border-2 border-rose-500/40 text-rose-200 px-4 py-3 rounded-2xl text-sm font-semibold animate-shake flex items-start gap-2">
                <svg aria-hidden="true" className="w-5 h-5 shrink-0 text-rose-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></svg>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="block text-sm font-extrabold text-slate-200 mb-1.5">
                Staff email
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="username"
                placeholder="name@university.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-[52px] px-4 bg-slate-900 border-2 border-slate-700 rounded-2xl text-base font-semibold text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-extrabold text-slate-200 mb-1.5">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-[52px] px-4 bg-slate-900 border-2 border-slate-700 rounded-2xl text-base font-semibold text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-chunky w-full mt-2 h-[54px] bg-blue-400 text-[#0B1B3A] font-bold rounded-2xl text-base disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </span>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          {/* Footer Copyright */}
          <p className="mt-6 text-center text-xs font-semibold text-slate-400">
            &copy; {new Date().getFullYear()} Smart ID Formatting System (SIFS). All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
