import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import {
  AdminsIcon,
  PlusIcon,
  CheckCircleIcon,
  ShieldCheckIcon
} from '../components/Icons';

export default function ManageAdmins() {
  const [universities, setUniversities] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', university_id: '', role: 'client_admin' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [uniRes, userRes] = await Promise.all([
        api.get('/universities'),
        api.get('/auth/users'),
      ]);
      setUniversities(uniRes.data);
      setUsers(userRes.data);
      if (uniRes.data.length > 0 && !form.university_id) {
        setForm(prev => ({ ...prev, university_id: uniRes.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const payload = {
        ...form,
        university_id: form.role === 'super_admin' ? null : form.university_id,
      };
      const res = await api.post('/auth/register', payload);
      setResult(res.data.user);
      setForm({
        name: '',
        email: '',
        password: '',
        university_id: universities[0]?.id || '',
        role: 'client_admin'
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Administrative Access
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Provision Client Admin accounts assigned to specific university admission offices or new Super Admins.
          </p>
        </div>

        {/* Create Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <PlusIcon className="w-5 h-5 text-blue-600" />
            <span>Create New Administrator</span>
          </h2>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-medium mb-4">
              {error}
            </div>
          )}

          {result && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-medium mb-4 flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Account created successfully for <strong>{result.name}</strong> ({result.email}) as{' '}
                <span className="capitalize font-bold">{result.role.replace('_', ' ')}</span>.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. John Smith"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="staff@university.edu"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Account Role
                </label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                >
                  <option value="client_admin">Client Admin (University Staff)</option>
                  <option value="super_admin">Super Admin (System Developer)</option>
                </select>
              </div>

              {form.role === 'client_admin' && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Assigned University
                  </label>
                  <select
                    required
                    value={form.university_id}
                    onChange={e => setForm({ ...form, university_id: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  >
                    <option value="">Select a University</option>
                    {universities.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.type === 'open_credit' ? 'Open Credit' : 'Close Credit'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm active:scale-[0.98] transition-all cursor-pointer"
              >
                <PlusIcon className="w-4 h-4" />
                <span>{loading ? 'Creating...' : 'Create Admin Account'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Existing Accounts List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Active Administrative Staff</h2>
              <p className="text-xs text-slate-500 mt-0.5">{users.length} accounts configured</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {users.map((u) => (
              <div
                key={u.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    u.role === 'super_admin' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {u.role === 'super_admin' ? <ShieldCheckIcon className="w-5 h-5" /> : <AdminsIcon className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    u.role === 'super_admin'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {u.role === 'super_admin' ? 'Super Admin' : (u.university_name || 'Client Admin')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}