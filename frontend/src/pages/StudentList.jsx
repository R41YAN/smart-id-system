import { useEffect, useState, useMemo } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StudentIdCard from '../components/StudentIdCard';
import {
  buildExportFileName,
  triggerPrintWithFileName
} from '../utils/exportHelpers';
import {
  DownloadIcon,
  PrinterIcon,
  TrashIcon,
  StudentsIcon
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

export default function StudentList() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [filter, setFilter] = useState({ department_id: '', batch_id: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoMsg, setPhotoMsg] = useState('');

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedStudent) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, WebP).');
      return;
    }

    setPhotoUploading(true);
    setPhotoMsg('');
    try {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const rawBase64 = ev.target.result;
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const maxDim = 600;
          let width = img.width;
          let height = img.height;
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

          try {
            const res = await api.patch(`/students/${selectedStudent.id}/photo`, { photo: compressed });
            const updatedPhoto = res.data.student.photo;
            setSelectedStudent((prev) => ({ ...prev, photo: updatedPhoto }));
            setStudents((prev) =>
              prev.map((s) => (s.id === selectedStudent.id ? { ...s, photo: updatedPhoto } : s))
            );
            setPhotoMsg('Photo updated successfully!');
            setTimeout(() => setPhotoMsg(''), 3000);
          } catch (err) {
            console.error('API update photo error:', err);
            alert('Failed to save updated photo to database.');
          } finally {
            setPhotoUploading(false);
          }
        };
        img.src = rawBase64;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File read error:', err);
      alert('Error reading image file.');
      setPhotoUploading(false);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    const params = {};
    if (filter.department_id) params.department_id = filter.department_id;
    if (filter.batch_id) params.batch_id = filter.batch_id;
    try {
      const r = await api.get('/students', { params });
      setStudents(r.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/departments').then(r => setDepartments(r.data));
    api.get('/batches').then(r => setBatches(r.data));
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [filter]);

  const filteredBatches = filter.department_id
    ? batches.filter(b => String(b.department_id) === String(filter.department_id))
    : batches;

  const displayedStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase().trim();
    return students.filter(s =>
      (s.student_id && s.student_id.toLowerCase().includes(q)) ||
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.phone && s.phone.includes(q)) ||
      (s.department_name && s.department_name.toLowerCase().includes(q))
    );
  }, [students, searchQuery]);

  const sheetBatches = useMemo(() => {
    const chunkSize = 8;
    const chunks = [];
    for (let i = 0; i < displayedStudents.length; i += chunkSize) {
      chunks.push(displayedStudents.slice(i, i + chunkSize));
    }
    return chunks;
  }, [displayedStudents]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student record?')) return;
    try {
      await api.delete(`/students/${id}`);
      fetchStudents();
    } catch {
      alert('Cannot delete student record.');
    }
  };

  const activeDept = departments.find(d => String(d.id) === String(filter.department_id));
  const activeBatch = batches.find(b => String(b.id) === String(filter.batch_id));
  const activeDeptCode = activeDept?.code || activeDept?.name;

  const exportCSV = () => {
    if (displayedStudents.length === 0) return;
    const headers = [
      '#',
      'Student ID',
      'Full Name',
      'Department Code',
      'Department Name',
      'Batch/Intake',
      'Email',
      'Phone',
      'Admission Date'
    ];
    const rows = displayedStudents.map((s, i) => [
      i + 1,
      `"${s.student_id}"`,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${s.department_code || s.department_name || ''}"`,
      `"${s.department_name || ''}"`,
      `"${s.semester_code ? `${SEM_LABELS[s.semester_code]} ${s.year}` : `${getOrdinal(s.batch_number)} Batch (${s.year})`}"`,
      `"${s.email || ''}"`,
      `"${s.phone || ''}"`,
      `"${new Date(s.admitted_at).toLocaleDateString()}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const baseName = buildExportFileName({
      universityName: user?.university_name,
      deptCode: activeDeptCode,
      batch: activeBatch,
      context: 'Student_Roster'
    });
    link.setAttribute('download', `${baseName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintRoster = () => {
    const fileName = buildExportFileName({
      universityName: user?.university_name,
      deptCode: activeDeptCode,
      batch: activeBatch,
      context: 'Student_Roster'
    });
    triggerPrintWithFileName(fileName);
  };

  const handlePrintSingleCard = () => {
    if (!selectedStudent) return;
    const fileName = buildExportFileName({
      universityName: selectedStudent.university_name || user?.university_name,
      deptCode: selectedStudent.department_code || selectedStudent.department_name,
      student: selectedStudent
    });
    triggerPrintWithFileName(fileName);
  };

  const handleBatchPrint = () => {
    const fileName = buildExportFileName({
      universityName: user?.university_name,
      deptCode: activeDeptCode,
      batch: activeBatch,
      context: 'ID_Cards'
    });
    triggerPrintWithFileName(fileName);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Student Directory
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              All enrolled students with sequentially generated smart IDs
            </p>
          </div>

          {/* Export / Print Actions */}
          <div className="flex flex-wrap items-center gap-2.5 print:hidden">
            <button
              onClick={() => setShowBatchModal(true)}
              disabled={displayedStudents.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-sm active:scale-[0.98] transition-all cursor-pointer"
              title="Batch Print ID Cards on standard A4 sheets (8 cards per sheet)"
            >
              <svg className="w-4 h-4 text-blue-200" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="2" y="4" width="20" height="16" rx="2" strokeWidth="2" />
                <circle cx="8" cy="11" r="3" strokeWidth="2" />
                <path d="M14 9h4m-4 4h4m-4 4h2" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>Print ID Cards ({displayedStudents.length})</span>
            </button>

            <button
              onClick={exportCSV}
              disabled={students.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-sm active:scale-[0.98] transition-all cursor-pointer"
              title="Download CSV spreadsheet"
            >
              <DownloadIcon className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrintRoster}
              disabled={students.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-sm active:scale-[0.98] transition-all cursor-pointer"
              title="Print or Save as PDF"
            >
              <PrinterIcon className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 flex flex-wrap items-center gap-3 print:hidden">
          {/* Instant Search Bar */}
          <div className="flex-1 min-w-[220px] relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by student name or ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
            />
          </div>

          <div className="w-44">
            <select
              value={filter.department_id}
              onChange={e => setFilter({ ...filter, department_id: e.target.value, batch_id: '' })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            >
              <option value="">All Departments</option>
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

          <div className="w-52">
            <select
              value={filter.batch_id}
              onChange={e => setFilter({ ...filter, batch_id: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            >
              <option value="">All Batches & Intakes</option>
              {filteredBatches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.department_name} — {b.semester_code ? `${SEM_LABELS[b.semester_code]} ${b.year}` : `${b.batch_number}th Batch ${b.year}`}
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto text-xs font-bold text-slate-500">
            {displayedStudents.length} of {students.length} student{students.length === 1 ? '' : 's'}
          </div>
        </div>

        {/* Roster Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden print:shadow-none print:border">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Loading student directory...</div>
          ) : displayedStudents.length === 0 ? (
            <div className="p-12 text-center">
              <StudentsIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No students found</p>
              <p className="text-xs text-slate-400 mt-1">Try changing filters or admit new students.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500">
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">#</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Student ID</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Student Name</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Dept</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Batch / Intake</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Email</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">Admitted</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider print:hidden text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {displayedStudents.map((s, i) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="px-5 py-4 text-xs font-mono text-slate-400">{i + 1}</td>
                      <td className="px-5 py-4">
                        <span className="font-mono font-bold text-xs bg-blue-50 group-hover:bg-blue-100/80 text-blue-700 border border-blue-200/80 px-2.5 py-1 rounded-lg transition-colors">
                          {s.student_id}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900">
                        <div className="flex items-center gap-3">
                          {s.photo ? (
                            <img
                              src={s.photo}
                              alt={s.name}
                              className="w-8 h-8 rounded-full object-cover object-center ring-2 ring-blue-100 shrink-0 border border-slate-200"
                            />
                          ) : (
                            <div
                              onClick={() => setSelectedStudent(s)}
                              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200 cursor-pointer transition-colors relative"
                              title="No photo attached — click to view ID card and upload"
                            >
                              {(s.name || '?')[0].toUpperCase()}
                              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-amber-500 rounded-full border border-white flex items-center justify-center text-[7px] text-white font-mono" title="No photo">📷</span>
                            </div>
                          )}
                          <span className="truncate">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {s.department_name}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600 font-medium">
                        {s.semester_code ? `${SEM_LABELS[s.semester_code]} ${s.year}` : `${getOrdinal(s.batch_number)} Batch (${s.year})`}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500">{s.email || '—'}</td>
                      <td className="px-5 py-4 text-xs text-slate-500 font-medium">
                        {new Date(s.admitted_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-5 py-4 print:hidden text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedStudent(s)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all cursor-pointer mr-2 shadow-2xs"
                          title="View / Print Student ID Card"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="2" y="4" width="20" height="16" rx="3" strokeWidth="2" />
                            <circle cx="8" cy="11" r="3" strokeWidth="2" />
                            <path d="M14 9h4m-4 4h4m-4 4h2" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                          <span>ID Card</span>
                        </button>

                        <button
                          onClick={() => handleDelete(s.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete student record"
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
          )}
        </div>
      </div>

      {/* Option B: View / Print Student ID Card Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 relative animate-in zoom-in-95 duration-150 print:border-none print:shadow-none print:p-0">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 print:hidden">
              <div>
                <h3 className="text-base font-black text-slate-900">Student Identity Card</h3>
                <p className="text-xs text-slate-400">Verified official institutional credential</p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* The Verified ID Card */}
            <div className="my-2 flex justify-center">
              <StudentIdCard
                universityName={selectedStudent.university_name || user?.university_name || 'SIFS ACADEMY'}
                universityLogo={selectedStudent.university_logo || user?.university_logo}
                studentName={selectedStudent.name}
                deptCode={selectedStudent.department_code || selectedStudent.department_name}
                batchOrIntakeLabel={selectedStudent.semester_code ? 'Intake' : 'Batch'}
                batchOrIntakeValue={
                  selectedStudent.semester_code
                    ? `${SEM_LABELS[selectedStudent.semester_code]} ${selectedStudent.year}`
                    : `${getOrdinal(selectedStudent.batch_number)} Batch`
                }
                academicYear={selectedStudent.semester_code ? null : selectedStudent.year}
                studentId={selectedStudent.student_id}
                photo={selectedStudent.photo}
                isLivePreview={false}
                onPhotoClick={() => document.getElementById('modal-student-photo-input')?.click()}
              />
            </div>

            {/* Quick Photo Upload / Change Button */}
            <div className="mt-3 flex flex-col items-center print:hidden">
              <input
                type="file"
                id="modal-student-photo-input"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <button
                type="button"
                onClick={() => document.getElementById('modal-student-photo-input')?.click()}
                disabled={photoUploading}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{photoUploading ? 'Uploading...' : selectedStudent.photo ? 'Change Student Photo' : 'Upload Student Photo'}</span>
              </button>
              {photoMsg && <p className="text-[11px] text-emerald-600 font-bold mt-1.5 animate-in fade-in">{photoMsg}</p>}
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 print:hidden">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handlePrintSingleCard}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow transition-all cursor-pointer"
              >
                <PrinterIcon className="w-4 h-4" />
                <span>Print Card</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch ID Card Sheet Print Modal (A4 Grid — 8 cards per page) */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <style>{`
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              body * {
                visibility: hidden !important;
              }
              #batch-print-container, #batch-print-container * {
                visibility: visible !important;
              }
              #batch-print-container {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                background: white !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              .sifs-page-break {
                page-break-after: always !important;
                break-after: page !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              @page {
                size: A4 portrait;
                margin: 6mm;
              }
            }
          `}</style>

          <div className="max-w-5xl w-full mx-auto bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto border border-slate-200 print:border-none print:shadow-none print:w-full print:max-w-none print:bg-transparent">
            {/* Modal Control Header (Hidden in Print) */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>Batch ID Card Sheet Print</span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold border border-blue-200">
                    A4 CR-80 Standard
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rendering {displayedStudents.length} student card{displayedStudents.length === 1 ? '' : 's'} across {sheetBatches.length} printable A4 page{sheetBatches.length === 1 ? '' : 's'} (8 cards/sheet in 2×4 layout).
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBatchPrint}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <PrinterIcon className="w-4 h-4" />
                  <span>Print All ID Sheets ({sheetBatches.length} Page{sheetBatches.length === 1 ? '' : 's'})</span>
                </button>
              </div>
            </div>

            {/* Printable Sheets Area */}
            <div id="batch-print-container" className="p-4 sm:p-6 bg-slate-100/50 overflow-y-auto max-h-[78vh] print:max-h-none print:p-0 print:bg-transparent">
              {sheetBatches.map((sheet, pageIdx) => (
                <div
                  key={pageIdx}
                  className="bg-white rounded-2xl border border-slate-300 shadow-sm p-4 mb-8 mx-auto print:border-none print:shadow-none print:p-0 print:mb-0 print:rounded-none sifs-page-break"
                  style={{ width: '100%', maxWidth: '210mm', minHeight: '290mm', boxSizing: 'border-box' }}
                >
                  {/* Page Guide Banner */}
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 text-[11px] text-slate-400 font-mono print:hidden">
                    <span>A4 SHEET — PAGE {pageIdx + 1} OF {sheetBatches.length}</span>
                    <span>2 COLUMNS × 4 ROWS (8 CR-80 BADGES)</span>
                  </div>

                  {/* 2x4 Badge Grid */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-3 justify-items-center">
                    {sheet.map((student) => (
                      <div key={student.id} className="relative">
                        {/* Outer cut guideline */}
                        <div className="absolute -inset-0.5 border border-dashed border-slate-300 pointer-events-none rounded-xl" />
                        <StudentIdCard
                          universityName={student.university_name || user?.university_name || 'SIFS ACADEMY'}
                          universityLogo={student.university_logo || user?.university_logo}
                          studentName={student.name}
                          deptCode={student.department_code || student.department_name}
                          batchOrIntakeLabel={student.semester_code ? 'Intake' : 'Batch'}
                          batchOrIntakeValue={
                            student.semester_code
                              ? `${SEM_LABELS[student.semester_code]} ${student.year}`
                              : `${getOrdinal(student.batch_number)} Batch`
                          }
                          academicYear={student.semester_code ? null : student.year}
                          studentId={student.student_id}
                          photo={student.photo}
                          compact={true}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
