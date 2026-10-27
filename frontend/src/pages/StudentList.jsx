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

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Student List</h1>
        <p className="text-gray-500 mb-6">All admitted students with their generated IDs</p>

        <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap gap-4">
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
          <span className="ml-auto text-sm text-gray-500 self-center">{students.length} student(s)</span>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
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
                <th className="px-4 py-4"></th>
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
                  <td className="px-4 py-3">
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
