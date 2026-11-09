import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import StudentIdCard from '../components/StudentIdCard';
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
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [filter, setFilter] = useState({ department_id: '', batch_id: '' });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student record?')) return;
    try {
      await api.delete(`/students/${id}`);
      fetchStudents();
    } catch {
      alert('Cannot delete student record.');
    }
  };

  const exportCSV = () => {
    if (students.length === 0) return;
    const headers = ['#', 'Student ID', 'Full Name', 'Department', 'Intake / Batch', 'Email', 'Phone', 'Admission Date'];
    const rows = students.map((s, i) => [
      i + 1,
      `"${s.student_id}"`,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${s.department_name}"`,
      `"${s.semester_code ? `${SEM_LABELS[s.semester_code]} ${s.year}` : `${getOrdinal(s.batch_number)} Batch ${s.year}`}"`,
      `"${s.email || ''}"`,
      `"${s.phone || ''}"`,
      `"${new Date(s.admitted_at).toLocaleDateString()}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SIFS_Student_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Student Directory
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              All enrolled students with sequentially generated smart IDs
            </p>
          </div>

          {/* Export / Print Actions */}
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={exportCSV}
              disabled={students.length === 0}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-sm active:scale-[0.98] transition-all cursor-pointer"
              title="Download CSV spreadsheet"
            >
              <DownloadIcon className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              disabled={students.length === 0}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-sm active:scale-[0.98] transition-all cursor-pointer"
              title="Print or Save as PDF"
            >
              <PrinterIcon className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 flex flex-wrap items-center gap-3 print:hidden">
          <div className="w-48">
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

          <div className="w-56">
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
            {students.length} student{students.length === 1 ? '' : 's'} enrolled
          </div>
        </div>

        {/* Roster Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden print:shadow-none print:border">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Loading student directory...</div>
          ) : students.length === 0 ? (
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
                  {students.map((s, i) => (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4 text-xs font-mono text-slate-400">{i + 1}</td>
                      <td className="px-5 py-4">
                        <span className="font-mono font-bold text-xs bg-blue-50 text-blue-700 border border-blue-200/80 px-2.5 py-1 rounded-lg">
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
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                              {(s.name || '?')[0].toUpperCase()}
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all cursor-pointer mr-2 shadow-xs"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150 print:border-none print:shadow-none print:p-0">
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
                universityName={selectedStudent.university_name || 'SIFS ACADEMY'}
                studentName={selectedStudent.name}
                deptCode={selectedStudent.department_code || selectedStudent.department_name}
                batchOrIntakeLabel={selectedStudent.semester_code ? 'Intake' : 'Batch'}
                batchOrIntakeValue={
                  selectedStudent.semester_code
                    ? `${SEM_LABELS[selectedStudent.semester_code]} ${selectedStudent.year}`
                    : `${getOrdinal(selectedStudent.batch_number)} Batch (${selectedStudent.year})`
                }
                studentId={selectedStudent.student_id}
                photo={selectedStudent.photo}
                isLivePreview={false}
              />
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
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow transition-all cursor-pointer"
              >
                <PrinterIcon className="w-4 h-4" />
                <span>Print Card</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}