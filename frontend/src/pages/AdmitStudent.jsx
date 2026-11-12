import { useEffect, useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import StudentIdCard from '../components/StudentIdCard';
import {
  AdmitIcon,
  CheckCircleIcon,
  SparklesIcon,
  PrinterIcon,
  PlusIcon,
  DownloadIcon,
  UploadIcon
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
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'bulk'

  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [university, setUniversity] = useState(null);

  // ── Single Admission State ───────────────────────────────────────────────
  const [form, setForm] = useState({ department_id: '', batch_id: '', name: '', email: '', phone: '', photo: null });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Bulk Admission State ─────────────────────────────────────────────────
  const [rawCsvText, setRawCsvText] = useState('');
  const [fileName, setFileName] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState('');
  const [bulkResult, setBulkResult] = useState(null);

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

  // ── CSV Parsing & Validation ─────────────────────────────────────────────
  const parsedRows = useMemo(() => {
    if (!rawCsvText.trim()) return [];

    const lines = rawCsvText.split(/\r\n|\n|\r/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const parseLine = (str) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (char === '"') {
          if (inQuotes && str[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('student'));
    const deptIdx = headers.findIndex(h => h.includes('dept') || h.includes('department'));
    const batchIdx = headers.findIndex(h => h.includes('batch') || h.includes('intake') || h.includes('semester'));
    const emailIdx = headers.findIndex(h => h.includes('email') || h.includes('mail'));
    const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('contact') || h.includes('mobile'));
    const photoIdx = headers.findIndex(h => h.includes('photo') || h.includes('image') || h.includes('url'));

    const list = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseLine(lines[i]);
      if (cols.length === 0 || cols.every(c => c === '')) continue;

      const raw = {
        name: (nameIdx !== -1 ? cols[nameIdx] : (cols[0] || '')).trim(),
        dept: (deptIdx !== -1 ? cols[deptIdx] : (cols[1] || '')).trim(),
        batch: (batchIdx !== -1 ? cols[batchIdx] : (cols[2] || '')).trim(),
        email: (emailIdx !== -1 ? cols[emailIdx] : (cols[3] || '')).trim(),
        phone: (phoneIdx !== -1 ? cols[phoneIdx] : (cols[4] || '')).trim(),
        photo: (photoIdx !== -1 ? cols[photoIdx] : (cols[5] || '')).trim(),
        rowNumber: i + 1
      };

      const errors = [];
      if (!raw.name) errors.push('Missing student full name');

      // Department Match
      const cleanedDept = raw.dept.toLowerCase();
      const matchedDept = departments.find(d =>
        (d.code && d.code.toLowerCase() === cleanedDept) ||
        (d.name && d.name.toLowerCase() === cleanedDept) ||
        (d.full_name && d.full_name.toLowerCase() === cleanedDept)
      );
      if (!matchedDept) {
        errors.push(`Dept "${raw.dept}" not found`);
      }

      // Batch Match
      let matchedBatch = null;
      if (matchedDept) {
        const deptBatches = batches.filter(b => String(b.department_id) === String(matchedDept.id));
        const cleanedBatch = raw.batch.toLowerCase();

        matchedBatch = deptBatches.find(b => {
          if (b.batch_number != null && String(b.batch_number) === cleanedBatch) return true;
          if (b.batch_number != null && `${b.batch_number}th`.toLowerCase() === cleanedBatch) return true;
          if (String(b.id) === cleanedBatch) return true;
          if (b.semester_code) {
            const semName = (SEM_LABELS[b.semester_code] || '').toLowerCase();
            const yr = String(b.year);
            const yrShort = yr.slice(-2);
            const code = b.semester_code.toLowerCase();
            if (`${semName} ${yr}` === cleanedBatch) return true;
            if (`${semName} ${yrShort}` === cleanedBatch) return true;
            if (`${code}${yr}` === cleanedBatch) return true;
            if (`${code}${yrShort}` === cleanedBatch) return true;
            if (code === cleanedBatch) return true;
            if (semName === cleanedBatch) return true;
          }
          return false;
        });

        if (!matchedBatch) {
          errors.push(`Batch "${raw.batch}" not found for ${matchedDept.code || matchedDept.name}`);
        }
      }

      list.push({
        ...raw,
        matchedDept,
        matchedBatch,
        isValid: errors.length === 0,
        errors
      });
    }

    return list;
  }, [rawCsvText, departments, batches]);

  const validRows = parsedRows.filter(r => r.isValid);
  const invalidRows = parsedRows.filter(r => !r.isValid);

  const handleFileUpload = (file) => {
    if (!file) return;
    setFileName(file.name);
    setBulkError('');
    setBulkResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setRawCsvText(e.target?.result || '');
    };
    reader.readAsText(file);
  };

  const downloadCsvTemplate = () => {
    const sampleDept = departments[0]?.code || departments[0]?.name || 'CSE';
    let sampleBatch = '54';
    if (batches.length > 0) {
      const b = batches[0];
      sampleBatch = b.semester_code ? `${SEM_LABELS[b.semester_code]} ${b.year}` : String(b.batch_number || 54);
    }

    const headers = ['Full Name', 'Department Code', 'Batch/Intake', 'Email', 'Phone', 'Photo URL (Optional)'];
    const rows = [
      ['Tanvir Hasan', sampleDept, sampleBatch, 'tanvir@mail.com', '01712345678', ''],
      ['Nusrat Jahan', sampleDept, sampleBatch, 'nusrat@mail.com', '01812345678', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'],
      ['Arif Ahmed', sampleDept, sampleBatch, 'arif@mail.com', '01912345678', '']
    ];

    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(r => r.map(col => `"${col.replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SIFS_Bulk_Admission_Template_${sampleDept}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleBulkSubmit = async () => {
    if (validRows.length === 0) return;
    setBulkLoading(true);
    setBulkError('');
    try {
      const payload = validRows.map(r => ({
        name: r.name,
        department_id: r.matchedDept.id,
        batch_id: r.matchedBatch.id,
        email: r.email || null,
        phone: r.phone || null,
        photo: r.photo || null
      }));

      const res = await api.post('/students/bulk', { students: payload });
      setBulkResult(res.data);
    } catch (err) {
      setBulkError(err.response?.data?.message || 'Bulk admission failed. Please check batch capacity and duplicate data.');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleResetBulk = () => {
    setRawCsvText('');
    setFileName('');
    setBulkResult(null);
    setBulkError('');
  };

  // Live Card Preview computed values (Single tab)
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Admit Student & Generate ID
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Enroll individual students or ingest entire batches via CSV with transactional locking.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 self-start sm:self-auto shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('single')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'single'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AdmitIcon className="w-4 h-4" />
              <span>Single Admission</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bulk')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'bulk'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UploadIcon className="w-4 h-4" />
              <span>Bulk CSV Enrollment</span>
            </button>
          </div>
        </div>

        {/* Algorithm Info Banner */}
        <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-slate-50 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-950 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg font-mono font-bold text-[10px] tracking-wider shrink-0 shadow-xs">
              ENGINE
            </span>
            <span className="font-medium text-slate-700">
              Format Rule:{' '}
              <strong className="font-mono text-blue-700 font-bold bg-white/80 px-2 py-0.5 rounded border border-blue-200/60">
                {isOpen ? '[Dept][YY][SemCode][Serial] (e.g. CSE26FL001)' : '[Dept][Batch][YY][Serial] (e.g. CSE5426001)'}
              </strong>
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-300/60 px-3 py-1 rounded-full text-[11px] shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            SELECT FOR UPDATE Protected
          </span>
        </div>

        {/* ─── TAB 1: SINGLE ADMISSION ─────────────────────────────────── */}
        {activeTab === 'single' && (
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
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
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
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all disabled:bg-slate-100/60 disabled:text-slate-400 font-medium"
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
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
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
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                    />
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
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Student Photograph
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
                      className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 cursor-pointer transition-all shrink-0 shadow-2xs"
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
                      Auto-fits into PVC portrait card frame
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-blue-600/25 active:scale-[0.99] transition-all text-sm disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
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

            {/* Right Column: Live Interactive Digital ID Card (5 cols, sticky) */}
            <div className="lg:col-span-5 flex flex-col items-center lg:sticky lg:top-6">
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
                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                      Live Preview
                    </span>
                  )}
                </div>

                <StudentIdCard
                  universityName={university?.name || user?.university_name || 'SIFS ACADEMY'}
                  universityLogo={university?.logo_url || user?.university_logo}
                  studentName={form.name || result?.name || 'Student Full Name'}
                  deptCode={deptCode}
                  batchOrIntakeLabel={isOpen ? 'Intake' : 'Batch'}
                  batchOrIntakeValue={
                    currentBatch
                      ? (isOpen ? `${SEM_LABELS[currentBatch.semester_code] || ''} '${yearStr}` : `${getOrdinal(batchNumRaw)} Batch`)
                      : (isOpen ? `Fall '${yearStr}` : `${getOrdinal(batchNumRaw)} Batch`)
                  }
                  academicYear={isOpen ? null : (currentBatch?.year || new Date().getFullYear())}
                  studentId={displayID}
                  photo={form.photo || result?.photo}
                  isLivePreview={!result}
                  onPhotoClick={() => document.getElementById('student-photo-input')?.click()}
                />

                {result && (
                  <div className="mt-4 space-y-2 animate-in fade-in duration-200">
                    <button
                      onClick={() => window.print()}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      <PrinterIcon className="w-4 h-4" />
                      <span>Print Student ID Card</span>
                    </button>
                    <button
                      onClick={handleReset}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                      <span>Enroll Another Student</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: BULK CSV ENROLLMENT ───────────────────────────────── */}
        {activeTab === 'bulk' && (
          <div className="space-y-6">
            {/* Template & Guidelines Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UploadIcon className="w-5 h-5 text-blue-600" />
                  <span>Batch CSV Ingestion</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Upload a standard CSV roster containing student names, department codes, and batch/intake numbers.
                  SIFS assigns sequential smart IDs using row-level concurrency locking. Photo URLs are imported automatically; empty photos default to institutional silhouettes with a pending badge.
                </p>
              </div>

              <button
                type="button"
                onClick={downloadCsvTemplate}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <DownloadIcon className="w-4 h-4 text-amber-300" />
                <span>Download CSV Template</span>
              </button>
            </div>

            {bulkError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-5 py-3.5 rounded-xl text-xs font-medium flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <span>{bulkError}</span>
              </div>
            )}

            {/* Success Summary Banner if Admitted */}
            {bulkResult && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <CheckCircleIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-emerald-950">
                        {bulkResult.message || `Successfully Enrolled ${bulkResult.count} Students!`}
                      </h3>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        All student IDs were generated sequentially with ACID database locking.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleResetBulk}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Enroll Another File
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-emerald-200/80 overflow-hidden">
                  <div className="p-3 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between text-xs font-bold text-emerald-900">
                    <span>Generated Student IDs ({bulkResult.students?.length || 0})</span>
                    <a
                      href="/admin/students"
                      className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>View in Student Directory</span>
                      <span>→</span>
                    </a>
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                    {bulkResult.students?.map((s, idx) => (
                      <div key={s.id || idx} className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-slate-400 font-bold w-6">{idx + 1}.</span>
                          <span className="font-bold text-slate-800">{s.name}</span>
                        </div>
                        <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                          {s.student_id}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Drag & Drop Upload Zone (when no result yet) */}
            {!bulkResult && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-6">
                <div
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-8 text-center transition-colors bg-slate-50/50 flex flex-col items-center justify-center cursor-pointer group"
                  onClick={() => document.getElementById('bulk-csv-input')?.click()}
                >
                  <input
                    type="file"
                    id="bulk-csv-input"
                    accept=".csv, text/csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-3 shadow-inner">
                    <UploadIcon className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    {fileName ? `File Selected: ${fileName}` : 'Drop your CSV file here, or click to browse'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports .csv files up to 500 rows per batch
                  </p>
                </div>

                {/* Parsed Rows Preview Table */}
                {parsedRows.length > 0 && (
                  <div className="space-y-4">
                    {/* Status Summary Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-700">Total Rows: {parsedRows.length}</span>
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                          ✓ {validRows.length} Ready
                        </span>
                        {invalidRows.length > 0 && (
                          <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-100/80 px-2.5 py-0.5 rounded-full">
                            ✕ {invalidRows.length} Needs Attention
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleResetBulk}
                          className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 font-semibold cursor-pointer"
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          disabled={validRows.length === 0 || bulkLoading}
                          onClick={handleBulkSubmit}
                          className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer transition-all"
                        >
                          {bulkLoading ? (
                            <>
                              <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Enrolling {validRows.length} Students...</span>
                            </>
                          ) : (
                            <>
                              <SparklesIcon className="w-3.5 h-3.5 text-amber-300" />
                              <span>Confirm & Enroll ({validRows.length} Students)</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Table View */}
                    <div className="border border-slate-200 rounded-xl overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                            <th className="px-4 py-3">Row</th>
                            <th className="px-4 py-3">Student Name</th>
                            <th className="px-4 py-3">Dept</th>
                            <th className="px-4 py-3">Batch / Intake</th>
                            <th className="px-4 py-3">Email & Phone</th>
                            <th className="px-4 py-3">Photo Status</th>
                            <th className="px-4 py-3 text-right">Validation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parsedRows.map((r, idx) => (
                            <tr key={idx} className={r.isValid ? 'hover:bg-slate-50/70' : 'bg-rose-50/40'}>
                              <td className="px-4 py-3 font-mono text-slate-400">{r.rowNumber}</td>
                              <td className="px-4 py-3 font-bold text-slate-900">{r.name || '—'}</td>
                              <td className="px-4 py-3">
                                {r.matchedDept ? (
                                  <span className="font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                                    {r.matchedDept.code || r.matchedDept.name}
                                  </span>
                                ) : (
                                  <span className="font-mono text-rose-600 font-bold">
                                    {r.dept || 'Missing'}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 font-medium text-slate-700">
                                {r.matchedBatch ? (
                                  <span>
                                    {r.matchedBatch.semester_code
                                      ? `${SEM_LABELS[r.matchedBatch.semester_code]} ${r.matchedBatch.year}`
                                      : `${getOrdinal(r.matchedBatch.batch_number)} Batch (${r.matchedBatch.year})`}
                                  </span>
                                ) : (
                                  <span className="text-rose-600 font-bold">
                                    {r.batch || 'Missing'}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-slate-500">
                                <div>{r.email || '—'}</div>
                                <div className="text-[11px] text-slate-400">{r.phone || ''}</div>
                              </td>
                              <td className="px-4 py-3">
                                {r.photo ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                                    <span>🌐</span> URL Provided
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                    <span>📷</span> Photo Pending
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {r.isValid ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                                    <CheckCircleIcon className="w-3.5 h-3.5" />
                                    <span>Ready</span>
                                  </span>
                                ) : (
                                  <span className="text-rose-600 font-semibold text-[11px]" title={r.errors.join(', ')}>
                                    {r.errors[0]}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}