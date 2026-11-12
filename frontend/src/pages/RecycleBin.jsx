import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  TrashIcon,
  RefreshIcon,
  StudentsIcon,
  BatchIcon,
  DepartmentIcon,
  CheckCircleIcon
} from '../components/Icons';

const SEM_LABELS = { SP: 'Spring', SM: 'Summer', FL: 'Fall' };

const getOrdinal = (n) => {
  const num = parseInt(n, 10);
  if (isNaN(num)) return `${n}th`;
  const j = num % 10, k = num % 100;
  if (j === 1 && k !== 11) return `${num}st`;
  if (j === 2 && k !== 12) return `${num}nd`;
  if (j === 3 && k !== 13) return `${num}rd`;
  return `${num}th`;
};

export default function RecycleBin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('students');
  const [data, setData] = useState({ students: [], batches: [], departments: [], totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchTrash = async () => {
    try {
      setLoading(true);
      const res = await api.get('/trash');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load trash:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (type, id, name) => {
    try {
      setActionLoading(true);
      await api.post('/trash/restore', { type, id });
      setMessage(`Restored "${name}" successfully!`);
      setTimeout(() => setMessage(''), 3500);
      fetchTrash();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to restore item.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePermanentDelete = async (type, id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"? This action CANNOT be undone.`)) {
      return;
    }
    try {
      setActionLoading(true);
      await api.delete('/trash/permanent', { data: { type, id } });
      setMessage(`Permanently removed "${name}".`);
      setTimeout(() => setMessage(''), 3500);
      fetchTrash();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete permanently.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEmptyTrash = async () => {
    if (data.totalCount === 0) return;
    if (!window.confirm('Are you sure you want to empty the entire Recycle Bin? All deleted students, batches, and departments will be PERMANENTLY destroyed.')) {
      return;
    }
    try {
      setActionLoading(true);
      await api.post('/trash/empty');
      setMessage('Recycle bin has been emptied.');
      setTimeout(() => setMessage(''), 3500);
      fetchTrash();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to empty recycle bin.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0 shadow-xs">
                <TrashIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Recycle Bin & Data Recovery
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Restore accidentally removed students, cohorts, and departments or purge them permanently
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleEmptyTrash}
              disabled={data.totalCount === 0 || actionLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-sm active:scale-[0.98] transition-all cursor-pointer"
            >
              <TrashIcon className="w-4 h-4" />
              <span>Empty Recycle Bin</span>
            </button>
          </div>
        </div>

        {/* Feedback Message */}
        {message && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-xs">
            <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'students'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <StudentsIcon className="w-4 h-4" />
            <span>Students ({data.students.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('batches')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'batches'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BatchIcon className="w-4 h-4" />
            <span>Batches ({data.batches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('departments')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'departments'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <DepartmentIcon className="w-4 h-4" />
            <span>Departments ({data.departments.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 font-medium text-xs">
            Loading recycle bin records...
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {activeTab === 'students' && (
              data.students.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                    <CheckCircleIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">No deleted students in Recycle Bin</h3>
                  <p className="text-xs text-slate-400 mt-1">All student records are active in the live directory.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-4 py-3">Student ID</th>
                        <th className="px-4 py-3">Full Name</th>
                        <th className="px-4 py-3">Department & Batch</th>
                        <th className="px-4 py-3">Deleted Date</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.students.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3.5 font-mono font-bold text-blue-600">{s.student_id}</td>
                          <td className="px-4 py-3.5 font-bold text-slate-800">
                            <div className="flex items-center gap-3">
                              {s.photo ? (
                                <img
                                  src={s.photo}
                                  alt={s.name}
                                  className="w-8 h-8 rounded-full object-cover object-center ring-2 ring-blue-100 shrink-0 border border-slate-200 select-none"
                                />
                              ) : (
                                <div
                                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200 select-none"
                                  title="No photo attached"
                                >
                                  {(s.name || '?')[0].toUpperCase()}
                                </div>
                              )}
                              <span className="truncate">{s.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-slate-500">
                            {s.department_name} • {s.semester_code ? `${SEM_LABELS[s.semester_code]} ${s.year}` : `${getOrdinal(s.batch_number)} Batch ${s.year}`}
                          </td>
                          <td className="px-4 py-3.5 text-slate-400">
                            {s.deleted_at ? new Date(s.deleted_at).toLocaleString() : 'Recently'}
                          </td>
                          <td className="px-4 py-3.5 text-right space-x-2">
                            <button
                              onClick={() => handleRestore('student', s.id, s.name)}
                              disabled={actionLoading}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                              title="Restore back to active student list"
                            >
                              <RefreshIcon className="w-3.5 h-3.5" />
                              <span>Restore</span>
                            </button>
                            <button
                              onClick={() => handlePermanentDelete('student', s.id, s.name)}
                              disabled={actionLoading}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                              title="Permanently remove from database"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {activeTab === 'batches' && (
              data.batches.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                    <CheckCircleIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">No deleted batches</h3>
                  <p className="text-xs text-slate-400 mt-1">All academic batches and cohorts are active.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-4 py-3">Batch Name</th>
                        <th className="px-4 py-3">Department</th>
                        <th className="px-4 py-3">Year</th>
                        <th className="px-4 py-3">Deleted Date</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.batches.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3.5 font-bold text-slate-800">
                            {b.semester_code ? `${SEM_LABELS[b.semester_code]} Intake` : `${getOrdinal(b.batch_number)} Batch`}
                          </td>
                          <td className="px-4 py-3.5 text-slate-500">{b.department_name}</td>
                          <td className="px-4 py-3.5 font-mono text-slate-500">{b.year}</td>
                          <td className="px-4 py-3.5 text-slate-400">
                            {b.deleted_at ? new Date(b.deleted_at).toLocaleString() : 'Recently'}
                          </td>
                          <td className="px-4 py-3.5 text-right space-x-2">
                            <button
                              onClick={() => handleRestore('batch', b.id, `${b.department_name} Batch`)}
                              disabled={actionLoading}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                            >
                              <RefreshIcon className="w-3.5 h-3.5" />
                              <span>Restore</span>
                            </button>
                            <button
                              onClick={() => handlePermanentDelete('batch', b.id, `${b.department_name} Batch`)}
                              disabled={actionLoading}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {activeTab === 'departments' && (
              data.departments.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                    <CheckCircleIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">No deleted departments</h3>
                  <p className="text-xs text-slate-400 mt-1">All department codes are active.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-4 py-3">Department Code</th>
                        <th className="px-4 py-3">Full Title</th>
                        <th className="px-4 py-3">Deleted Date</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.departments.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3.5 font-bold font-mono text-blue-600">{d.code || d.name}</td>
                          <td className="px-4 py-3.5 font-bold text-slate-800">{d.full_name || d.name}</td>
                          <td className="px-4 py-3.5 text-slate-400">
                            {d.deleted_at ? new Date(d.deleted_at).toLocaleString() : 'Recently'}
                          </td>
                          <td className="px-4 py-3.5 text-right space-x-2">
                            <button
                              onClick={() => handleRestore('department', d.id, d.code || d.name)}
                              disabled={actionLoading}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                            >
                              <RefreshIcon className="w-3.5 h-3.5" />
                              <span>Restore</span>
                            </button>
                            <button
                              onClick={() => handlePermanentDelete('department', d.id, d.code || d.name)}
                              disabled={actionLoading}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
