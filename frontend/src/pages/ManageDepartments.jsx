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
  const [name, setName] = useState('');
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
      await api.post('/departments', { name });
      setName('');
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
            Create departments used as the leading prefix in generated student IDs (e.g., CSE, EEE, BBA).
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

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                required
                placeholder="Department Code (e.g. CSE, EEE, BBA, LLB)"
                value={name}
                onChange={e => setName(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-mono uppercase text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm active:scale-[0.98] transition-all cursor-pointer"
            >
              <PlusIcon className="w-4 h-4" />
              <span>{loading ? 'Adding...' : 'Add Department'}</span>
            </button>
          </form>
        </div>

        {/* Departments Grid */}
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
                      <p className="font-mono font-black text-sm text-slate-900 tracking-wide">{d.name}</p>
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
      </div>
    </Layout>
  );
}