import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

const SEM_LABELS = { SP: 'Spring', SM: 'Summer', FL: 'Fall' };

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [filter, setFilter] = useState({ department_id:'', batch_id:'' });
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    const params = {};
    if (filter.department_id) params.department_id = filter.department_id;
    if (filter.batch_id) params.batch_id = filter.batch_id;
    const r = await api.get('/students', { params });
    setStudents(r.data); setLoading(false);
  };

  useEffect(() => {
    api.get('/departments').then(r => setDepartments(r.data));
    api.get('/batches').then(r => setBatches(r.data));
    fetchStudents();
  }, []);

  useEffect(() => { fetchStudents(); }, [filter]);

  const filteredBatches = filter.department_id
    ? batches.filter(b => String(b.department_id) === String(filter.department_id))
    : batches;

  const handleDelete = async (id) => {
    if (!confirm('Delete this student record?')) return;
    try { await api.delete(`/students/${id}`); fetchStudents(); }
    catch { alert('Cannot delete'); }
  };

  const exportCSV = () => {
    if (students.length === 0) return;
    const headers = ['#', 'Student ID', 'Full Name', 'Department', 'Intake/Batch', 'Email', 'Phone', 'Admission Date'];
    const rows = students.map((s, i) => [
      i + 1,
      `"${s.student_id}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.department_name}"`,
      `"${s.semester_code ? `${SEM_LABELS[s.semester_code]} ${s.year}` : `${s.batch_number}th Batch ${s.year}`}"`,
      `"${s.email || ''}"`,
      `"${s.phone || ''}"`,
      `"${new Date(s.admitted_at).toLocaleDateString()}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Student_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Student List</h1>
        <p className="text-gray-500 mb-6">All admitted students with their generated IDs</p>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap items-center gap-4 print:hidden">
          <select value={filter.department_id}
            onChange={e => setFilter({...filter, department_id: e.target.value, batch_id: ''})}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={filter.batch_id} onChange={e => setFilter({...filter, batch_id: e.target.value})}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Batches</option>
            {filteredBatches.map(b => (
              <option key={b.id} value={b.id}>
                {b.department_name} — {b.semester_code
                  ? `${SEM_LABELS[b.semester_code]} ${b.year}`
                  : `${b.batch_number}th Batch ${b.year}`}
              </option>
            ))}
          </select>

          <span className="text-sm text-gray-500">{students.length} student(s)</span>

          <div className="ml-auto flex gap-2">
            <button
              onClick={exportCSV}
              disabled={students.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer"
              title="Download as CSV spreadsheet"
            >
              📥 Export CSV
            </button>
            <button
              onClick={handlePrint}
              disabled={students.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer"
              title="Print or Save as PDF"
            >
              🖨️ Print / PDF
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden print:shadow-none print:border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-4 font-medium">#</th>
                <th className="px-4 py-4 font-medium">Student ID</th>
                <th className="px-4 py-4 font-medium">Name</th>
                <th className="px-4 py-4 font-medium">Dept</th>
                <th className="px-4 py-4 font-medium">Batch / Intake</th>
                <th className="px-4 py-4 font-medium">Email</th>
                <th className="px-4 py-4 font-medium">Date</th>
                <th className="px-4 py-4 print:hidden"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-400">No students found.</td></tr>
              ) : students.map((s, i) => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">{i+1}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs">{s.student_id}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500">{s.department_name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {s.semester_code ? `${SEM_LABELS[s.semester_code]} ${s.year}` : `${s.batch_number}th — ${s.year}`}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{s.email || '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(s.admitted_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 print:hidden">
                    <button onClick={() => handleDelete(s.id)}
                      className="text-red-400 hover:text-red-600 text-xs hover:bg-red-50 px-2 py-1 rounded transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
