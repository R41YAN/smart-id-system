import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  AdmitIcon,
  CheckCircleIcon,
  SparklesIcon,
  PrinterIcon,
  PlusIcon
} from '../components/Icons';

const SEM_LABELS = { SP: 'Spring', SM: 'Summer', FL: 'Fall' };

export default function AdmitStudent() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [university, setUniversity] = useState(null);
  const [form, setForm] = useState({ department_id: '', batch_id: '', name: '', email: '', phone: '' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/departments').then(r => setDepartments(r.data));
    api.get('/batches').then(r => setBatches(r.data));
    if (user?.university_id) {
      api.get(`/universities/${user.university_id}`).then(r => setUniversity(r.data));
    }
  }, [user]);

  const handleDept = (id) => {
    setForm({ ...form, department_id: id, batch_id: '' });
    setFilteredBatches(batches.filter(b => String(b.department_id) === String(id)));
  };

  const isOpen = university?.type === 'open_credit';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await api.post('/students', form);
      setResult(res.data.student);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to admit student');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError('');
    setForm({ department_id: '', batch_id: '', name: '', email: '', phone: '' });
    setFilteredBatches([]);
  };

  // Live Card Preview computed values
  const currentDept = departments.find(d => String(d.id) === String(form.department_id));
  const currentBatch = batches.find(b => String(b.id) === String(form.batch_id));

  const deptCode = currentDept?.name || 'CSE';
  const yearStr = String(currentBatch?.year || new Date().getFullYear()).slice(-2);
  const semCode = currentBatch?.semester_code || 'FL';
  const batchNum = currentBatch?.batch_number || '54';

  const previewID = isOpen
    ? `${deptCode}${yearStr}${semCode}•••`
    : `${deptCode}${batchNum}${yearStr}•••`;

  const displayID = result ? result.student_id : previewID;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Admit Student & Generate ID
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Fill the enrollment details below to issue an institutional student identity card with concurrency-safe locking.
          </p>
        </div>

        {/* Algorithm Info Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-600 text-white rounded-lg font-mono font-bold text-[10px]">
              ENGINE
            </span>
            <span>
              Format Rule:{' '}
              <strong className="font-mono text-blue-700 font-bold">
                {isOpen ? '[Dept][YY][SemCode][Serial] (e.g. CSE26FL001)' : '[Dept][Batch][YY][Serial] (e.g. CSE5426001)'}
              </strong>
            </span>
          </div>
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            SELECT FOR UPDATE Protected
          </span>
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
            <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
              <AdmitIcon className="w-5 h-5 text-blue-600" />
              <span>Student Admission Details</span>
            </h2>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-medium mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Department *
                  </label>
                  <select
                    required
                    value={form.department_id}
                    onChange={e => handleDept(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    {isOpen ? 'Semester Intake *' : 'Batch *'}
                  </label>
                  <select
                    required
                    value={form.batch_id}
                    onChange={e => setForm({ ...form, batch_id: e.target.value })}
                    disabled={!form.department_id}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">Select {isOpen ? 'Intake' : 'Batch'}</option>
                    {filteredBatches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.semester_code ? `${SEM_LABELS[b.semester_code]} ${b.year}` : `${b.batch_number}th Batch (${b.year})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arafat Rahman"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="student@email.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  >
                  </input>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-blue-600/25 active:scale-[0.99] transition-all text-sm disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Locking Row & Generating ID...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-4 h-4 text-amber-300" />
                      <span>Admit Student & Generate ID</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Interactive Digital ID Card (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-sm">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {result ? 'Issued Student ID Card' : 'Live ID Card Simulation'}
                </span>
                {result ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    Issued
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-400">
                    Live Preview
                  </span>
                )}
              </div>

              {/* Physical-style ID Card */}
              <div className={`relative w-full rounded-2xl overflow-hidden shadow-xl border transition-all ${
                result
                  ? 'border-amber-400 ring-4 ring-amber-400/20 shadow-amber-500/10 bg-white'
                  : 'border-slate-200 bg-white'
              }`}>
                {/* Lanyard Hole Clip */}
                <div className="w-full h-4 bg-slate-100 flex items-center justify-center border-b border-slate-200">
                  <div className="w-12 h-1.5 rounded-full bg-slate-300"></div>
                </div>

                {/* Card Header (Deep Navy) */}
                <div className="bg-[#0B132B] px-5 py-4 text-white relative overflow-hidden">
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src="/logo.jpg"
                        alt="SIFS"
                        className="w-9 h-9 rounded-lg object-cover border border-amber-400/40 shrink-0"
                      />
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-amber-300">
                          {university?.name || 'SIFS ACADEMY'}
                        </p>
                        <p className="text-xs font-extrabold text-white leading-tight">
                          STUDENT IDENTITY CARD
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  <div className="flex gap-4 items-start mb-4">
                    {/* Avatar Placeholder */}
                    <div className="w-20 h-24 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 shrink-0 relative overflow-hidden">
                      <svg className="w-10 h-10 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">PHOTO</span>
                    </div>

                    {/* Student Info */}
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Name</p>
                      <p className="text-sm font-extrabold text-slate-900 truncate leading-snug">
                        {form.name || 'Student Full Name'}
                      </p>

                      <div className="mt-2.5 grid grid-cols-2 gap-2 text-left">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Dept</p>
                          <p className="font-mono text-xs font-bold text-slate-800">
                            {currentDept?.name || 'CSE'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                            {isOpen ? 'Intake' : 'Batch'}
                          </p>
                          <p className="font-mono text-xs font-bold text-slate-800 truncate">
                            {currentBatch
                              ? (isOpen ? `${SEM_LABELS[currentBatch.semester_code] || ''} '${yearStr}` : `${batchNum}th`)
                              : (isOpen ? `Fall '${yearStr}` : `${batchNum}th`)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ID Number Box */}
                  <div className={`p-3 rounded-xl border text-center transition-colors ${
                    result
                      ? 'bg-amber-50/80 border-amber-300 text-amber-900'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Generated Student ID
                    </p>
                    <p className="font-mono text-xl font-black tracking-wider mt-0.5 text-blue-700">
                      {displayID}
                    </p>
                  </div>

                  {/* Simulated Barcode */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex gap-0.5 items-center h-6 opacity-60">
                      <span className="w-0.5 h-6 bg-slate-900"></span>
                      <span className="w-1 h-6 bg-slate-900"></span>
                      <span className="w-0.5 h-6 bg-slate-900"></span>
                      <span className="w-1.5 h-6 bg-slate-900"></span>
                      <span className="w-0.5 h-6 bg-slate-900"></span>
                      <span className="w-2 h-6 bg-slate-900"></span>
                      <span className="w-0.5 h-6 bg-slate-900"></span>
                      <span className="w-1 h-6 bg-slate-900"></span>
                      <span className="w-0.5 h-6 bg-slate-900"></span>
                      <span className="w-1.5 h-6 bg-slate-900"></span>
                      <span className="w-0.5 h-6 bg-slate-900"></span>
                      <span className="w-1 h-6 bg-slate-900"></span>
                      <span className="w-2 h-6 bg-slate-900"></span>
                      <span className="w-0.5 h-6 bg-slate-900"></span>
                      <span className="w-1 h-6 bg-slate-900"></span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">
                      VERIFIED ID
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons when Admitted */}
              {result && (
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => window.print()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow cursor-pointer"
                  >
                    <PrinterIcon className="w-4 h-4" />
                    <span>Print Student ID Card</span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    <span>Enroll Another Student</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}