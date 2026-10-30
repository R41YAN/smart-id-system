import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import {
  UniversityIcon,
  PlusIcon,
  TrashIcon,
  LockIcon,
  UnlockIcon
} from '../components/Icons';

export default function ManageUniversities() {
  const [universities, setUniversities] = useState([]);
  const [form, setForm] = useState({ name: '', type: 'open_credit' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUniversities = () => {
    api.get('/universities').then(r => setUniversities(r.data));
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/universities', form);
      setForm({ name: '', type: 'open_credit' });
      fetchUniversities();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register university');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this university? Note: Locked universities with student admissions cannot be removed.')) return;
    try {
      await api.delete(`/universities/${id}`);
      fetchUniversities();
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot delete university.');
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            University Tenants
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure universities and select their academic credit structure (Open Credit or Close Credit).
          </p>
        </div>

        {/* Create Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <PlusIcon className="w-5 h-5 text-blue-600" />
            <span>Register New University</span>
          </h2>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-medium mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  University Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North South University"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Credit Model
                </label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                >
                  <option value="open_credit">Open Credit ([Dept][YY][Sem][Serial])</option>
                  <option value="close_credit">Close Credit ([Dept][Batch][YY][Serial])</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm active:scale-[0.98] transition-all cursor-pointer"
              >
                <PlusIcon className="w-4 h-4" />
                <span>{loading ? 'Adding...' : 'Register University'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Existing Universities */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Registered Universities</h2>
              <p className="text-xs text-slate-500 mt-0.5">{universities.length} institutions configured</p>
            </div>
          </div>

          {universities.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">No universities registered yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {universities.map((u) => (
                <div
                  key={u.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                      <UniversityIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          u.type === 'open_credit'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {u.type === 'open_credit' ? 'Open Credit Model' : 'Close Credit Model'}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          u.is_locked
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {u.is_locked ? (
                            <>
                              <LockIcon className="w-3 h-3 text-rose-600" />
                              Locked (Admissions Active)
                            </>
                          ) : (
                            <>
                              <UnlockIcon className="w-3 h-3 text-emerald-600" />
                              Active (Unlocked)
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(u.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <button
                      onClick={() => handleDelete(u.id)}
                      disabled={u.is_locked}
                      title={u.is_locked ? 'Cannot delete: student admissions have begun' : 'Delete university'}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}