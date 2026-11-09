import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import StudentIdCard from '../components/StudentIdCard';
import {
  AdmitIcon,
  CheckCircleIcon,
  SparklesIcon,
  PrinterIcon,
  PlusIcon
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

export default function AdmitStudent() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [university, setUniversity] = useState(null);
  const [form, setForm] = useState({ department_id: '', batch_id: '', name: '', email: '', phone: '', photo: null });
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

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 500;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        setForm(prev => ({ ...prev, photo: compressed }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
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
    setForm({ department_id: '', batch_id: '', name: '', email: '', phone: '', photo: null });
    setFilteredBatches([]);
  };

  // Live Card Preview computed values
  const currentDept = departments.find(d => String(d.id) === String(form.department_id));
  const currentBatch = batches.find(b => String(b.id) === String(form.batch_id));

  const deptCode = currentDept?.code || currentDept?.name || 'CSE';
  const yearStr = String(currentBatch?.year || new Date().getFullYear()).slice(-2);
  const semCode = currentBatch?.semester_code || 'FL';
  const batchNumRaw = currentBatch?.batch_number ?? 54;
  const batchNum = String(batchNumRaw).padStart(2, '0');

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
                    {departments.map(d => {
                      const code = d.code || d.name;
                      const label = d.full_name && d.full_name !== code
                        ? `${d.full_name} (${code})`
                        : code;
                      return (
                        <option key={d.id} value={d.id}>{label}</option>
                      );
                    })}
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
                        {b.semester_code ? `${SEM_LABELS[b.semester_code]} ${b.year}` : `${getOrdinal(b.batch_number)} Batch (${b.year})`}
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

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Student Photograph (Optional)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    id="student-photo-input"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="student-photo-input"
                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 cursor-pointer transition-all shrink-0"
                  >
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{form.photo ? 'Change Photo' : 'Upload Photo'}</span>
                  </label>
                  {form.photo && (
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, photo: null }))}
                      className="text-xs text-rose-600 hover:underline cursor-pointer font-semibold"
                    >
                      Remove
                    </button>
                  )}
                  <span className="text-[11px] text-slate-400">
                    Any size auto-adjusts to ID card portrait
                  </span>
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

              {/* Physical-style ID Card with Real Barcode & Auto-Fitting Photo */}
              <StudentIdCard
                universityName={university?.name || 'SIFS ACADEMY'}
                studentName={form.name || result?.name || 'Student Full Name'}
                deptCode={deptCode}
                batchOrIntakeLabel={isOpen ? 'Intake' : 'Batch'}
                batchOrIntakeValue={
                  currentBatch
                    ? (isOpen ? `${SEM_LABELS[currentBatch.semester_code] || ''} '${yearStr}` : `${getOrdinal(batchNumRaw)} Batch (${currentBatch.year})`)
                    : (isOpen ? `Fall '${yearStr}` : `${getOrdinal(batchNumRaw)} Batch`)
                }
                studentId={displayID}
                photo={form.photo || result?.photo}
                isLivePreview={!result}
                onPhotoClick={() => document.getElementById('student-photo-input')?.click()}
              />

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