import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

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
    <div className="min-h-screen flex items-center justify-center bg-[#070C18] p-4 relative overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* Background Subtle Tech Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Cinematic Ambient Glow Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/25 rounded-full blur-[120px] pointer-events-none animate-ambient" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-[140px] pointer-events-none animate-ambient" style={{ animationDelay: '4s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Glassmorphic Login Card */}
        <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/80 border border-slate-700/60 p-8 sm:p-10 transition-all">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-block relative mb-4 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-md opacity-40 group-hover:opacity-75 transition duration-500" />
              <img
                src="/logo.jpg"
                alt="SIFS Official Badge"
                className="relative w-20 h-20 mx-auto rounded-2xl shadow-xl border border-slate-600/60 object-cover"
              />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Smart ID Formatting System
            </h1>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mt-1.5 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Institutional ID Management Platform
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-xl text-xs font-medium animate-shake flex items-start gap-2">
                <span className="text-rose-400 font-bold">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Staff Email
              </label>
              <input
                type="email"
                required
                placeholder="name@university.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/30 active:scale-[0.99] transition-all text-sm disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
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
        </div>

        {/* Footer Copyright */}
        <p className="mt-6 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Smart ID Formatting System (SIFS). All rights reserved.
        </p>
      </div>
    </div>
  );
}
