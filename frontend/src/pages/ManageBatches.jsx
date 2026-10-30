import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  BatchIcon,
  PlusIcon,
  TrashIcon
} from '../components/Icons';

const SEM_LABELS = { SP: 'Spring', SM: 'Summer', FL: 'Fall' };

export default function ManageBatches() {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [university, setUniversity] = useState(null);
  const [form, setForm] = useState({
    department_id: '',
    year: new Date().getFullYear(),
    batch_number: '',
    semester_code: 'SP',
    semester_index: 1
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAll = () => {
    Promise.all([api.get('/batches'), api.get('/departments')]).then(([b, d]) => {
      setBatches(b.data);
      setDepartments(d.data);
    });
  };

  useEffect(() => {
    fetchAll();
    if (user?.university_id) {
      api.get(`/universities/${user.university_id}`).then(r => setUniversity(r.data));
    }
  }, [user]);

  const isOpen = university?.type === 'open_credit';

  const setSem = (code) => {
    setForm({ ...form, semester_code: code, semester_index: { SP: 1, SM: 2, FL: 3 }[code] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/batches', {
        department_id: form.department_id,
        year: form.year,
        batch_number: isOpen ? null : form.batch_number,
        semester_code: isOpen ? form.semester_code : null,
        semester_index: isOpen ? form.semester_index : null,
      });
      setForm({
        department_id: '',
        year: new Date().getFullYear(),
        batch_number: '',
        semester_code: 'SP',
        semester_index: 1
      });
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this batch? Note: Batches with registered students cannot be deleted.')) return;
    try {
      await api.delete(`/batches/${id}`);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot delete batch.');
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Batches & Semester Intakes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure {isOpen ? 'semester intakes (Spring, Summer, Fall)' : 'batch cohorts'} that manage sequential serial counters.
          </p>
        </div>

        {/* Algorithm Pill */}
        <div className="bg-slate-100/80 border border-slate-200/80 rounded-2xl p-4 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-700">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-slate-800 text-white rounded-lg font-mono font-bold text-[10px]">
              FORMAT RULE
            </span>
            <span className="font-mono text-xs font-semibold text-slate-900">
              {isOpen ? '[Dept][YY][SemCode][Serial] (e.g. CSE26FL001)' : '[Dept][Batch][YY][Serial] (e.g. CSE5426001)'}
            </span>
          </div>
          <span className="text-slate-400 font-medium">Auto-resets per batch up to 999</span>
        </div>

        {/* Create Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <PlusIcon className="w-5 h-5 text-blue-600" />
            <span>Create New {isOpen ? 'Semester Intake' : 'Batch Cohort'}</span>
          </h2>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-medium mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Department
                </label>
                <select
                  required
                  value={form.department_id}
                  onChange={e => setForm({ ...form, department_id: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                >
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Academic Year
                </label>
                <input
                  type="number"
                  required
                  min="2000"
                  max="2100"
                  value={form.year}
                  onChange={e => setForm({ ...form, year: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono"
                />
              </div>

              {isOpen ? (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Semester Code
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      ['SP', 'Spring (SP)'],
                      ['SM', 'Summer (SM)'],
                      ['FL', 'Fall (FL)'],
                    ].map(([code, label]) => (
                      <button
                        type="button"
                        key={code}
                        onClick={() => setSem(code)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          form.semester_code === code
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Batch Number
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 54"
                    value={form.batch_number}
                    onChange={e => setForm({ ...form, batch_number: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono"
                  />
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
                <span>{loading ? 'Creating...' : 'Create Batch'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Existing Batches List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Active Batches & Intakes</h2>
              <p className="text-xs text-slate-500 mt-0.5">{batches.length} registered intake groups</p>
            </div>
          </div>

          {batches.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">No batches configured yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {batches.map((b) => (
                <div
                  key={b.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 shrink-0">
                      <BatchIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {b.department_name}
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                          {b.semester_code ? `${SEM_LABELS[b.semester_code]} ${b.year}` : `${b.batch_number}th Batch (${b.year})`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Serial Progress: <span className="font-mono font-bold text-blue-600">{b.current_serial}</span> / 999
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                      Prefix: {b.semester_code ? `${b.department_name}${String(b.year).slice(-2)}${b.semester_code}` : `${b.department_name}${b.batch_number}${String(b.year).slice(-2)}`}
                    </span>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete batch"
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