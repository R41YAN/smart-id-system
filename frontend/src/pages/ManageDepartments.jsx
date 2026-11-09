import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import {
  DepartmentIcon,
  PlusIcon,
  TrashIcon
} from '../components/Icons';

export default function ManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ full_name: '', code: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchDepartments = () => {
    api.get('/departments').then(r => setDepartments(r.data));
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/departments', {
        full_name: form.full_name.trim(),
        code: form.code.trim().toUpperCase(),
        name: form.code.trim().toUpperCase()
      });
      setForm({ full_name: '', code: '' });
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create department');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department? Batches and students associated with it may be affected.')) return;
    try {
      await api.delete(`/departments/${id}`);
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot delete department.');
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Academic Departments
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create departments with their full institutional names and short prefix codes used in student IDs.
          </p>
        </div>

        {/* Add Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <PlusIcon className="w-5 h-5 text-blue-600" />
            <span>Add New Department</span>
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
                  Department Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chemistry, Computer Science and Engineering"
                  value={form.full_name}
                  onChange={e => setForm({ ...form, full_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Department Code (Short Form)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CHEM, CSE, BBA, EEE, LLB"
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-mono uppercase text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm active:scale-[0.98] transition-all cursor-pointer"
              >
                <PlusIcon className="w-4 h-4" />
                <span>{loading ? 'Adding...' : 'Add Department'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section 1: Active Departments Grid (Short Codes) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Active Departments</h2>
              <p className="text-xs text-slate-500 mt-0.5">{departments.length} department(s) registered</p>
            </div>
          </div>

          {departments.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">No departments registered yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {departments.map((d) => (
                <div
                  key={d.id}
                  className="p-4 rounded-xl border border-slate-200/80 hover:border-blue-200 bg-slate-50/50 hover:bg-white flex items-center justify-between gap-3 shadow-none hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                      <DepartmentIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-mono font-black text-sm text-slate-900 tracking-wide">{d.code || d.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Active Code</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(d.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete department"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Departments List (Full Formal Names) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Departments</h2>
              <p className="text-xs text-slate-500 mt-0.5">Formal academic department names with ID prefix mapping</p>
            </div>
          </div>

          {departments.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No departments listed yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {departments.map((d) => (
                <div
                  key={d.id}
                  className="py-3.5 px-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {d.full_name && d.full_name !== (d.code || d.name)
                          ? `${d.full_name} (${d.code || d.name})`
                          : `${d.name} (${d.code || d.name})`}
                      </p>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200/70 shrink-0">
                    {d.code || d.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}