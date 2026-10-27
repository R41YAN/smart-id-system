import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function Stat({ icon, label, value, color }) {
  return (
    <div className={`bg-white rounded-xl p-6 shadow flex items-center gap-5 border-l-4 ${color}`}>
      <div className="text-4xl">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-3xl font-bold text-gray-800">{value ?? '—'}</p>
      </div>
    </div>
  );
}

export default function ClientAdminDashboard() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/departments'), api.get('/students')]).then(([d, s]) => {
      setDepartments(d.data); setStudents(s.data);
    }).finally(() => setLoading(false));
    if (user?.university_id)
      api.get(`/universities/${user.university_id}`).then(r => setUniversity(r.data));
  }, [user]);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">Admin Dashboard</h1>
        {university && (
          <p className="text-gray-500 mb-8">
            {university.name} —{' '}
            <span className={`text-sm font-medium ${university.type==='open_credit'?'text-green-600':'text-purple-600'}`}>
              {university.type==='open_credit'?'Open Credit':'Close Credit'}
            </span>
            {university.is_locked && ' 🔒'}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Stat icon="🏢" label="Departments" value={departments.length} color="border-blue-500" />
          <Stat icon="🎓" label="Total Students" value={students.length} color="border-green-500" />
          <Stat icon="🔒" label="System" value={university?.is_locked ? 'Locked' : 'Active'} color="border-purple-500" />
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Admissions</h2>
          {loading ? <p className="text-gray-400">Loading...</p> : students.length === 0 ? (
            <p className="text-gray-400 text-sm">No students admitted yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b">
                <th className="pb-3">Student ID</th><th className="pb-3">Name</th>
                <th className="pb-3">Department</th><th className="pb-3">Date</th>
              </tr></thead>
              <tbody>
                {students.slice(0,8).map(s => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3">
                      <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs">{s.student_id}</span>
                    </td>
                    <td className="py-3 text-gray-800">{s.name}</td>
                    <td className="py-3 text-gray-500">{s.department_name}</td>
                    <td className="py-3 text-gray-400">{new Date(s.admitted_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}
