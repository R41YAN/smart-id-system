import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
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

export default function SuperAdminDashboard() {
  const [universities, setUniversities] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/universities'), api.get('/auth/users')])
      .then(([uniRes, userRes]) => {
        setUniversities(uniRes.data);
        setUsers(userRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Super Admin Dashboard</h1>
        <p className="text-gray-500 mb-8">System-wide overview</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Stat icon="🏛️" label="Total Universities" value={universities.length} color="border-blue-500" />
          <Stat icon="📖" label="Open Credit" value={universities.filter(u=>u.type==='open_credit').length} color="border-green-500" />
          <Stat icon="👤" label="Client Admins" value={users.filter(u=>u.role==='client_admin').length} color="border-purple-500" />
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">All Universities</h2>
          {loading ? <p className="text-gray-400">Loading...</p> : universities.length === 0 ? (
            <p className="text-gray-400 text-sm">No universities yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b">
                <th className="pb-3">Name</th><th className="pb-3">Type</th>
                <th className="pb-3">Status</th><th className="pb-3">Created</th>
              </tr></thead>
              <tbody>
                {universities.map(u => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-800">{u.name}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.type==='open_credit'?'bg-green-100 text-green-700':'bg-purple-100 text-purple-700'}`}>
                        {u.type==='open_credit'?'Open Credit':'Close Credit'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${u.is_locked?'bg-red-100 text-red-600':'bg-gray-100 text-gray-500'}`}>
                        {u.is_locked?'🔒 Locked':'🔓 Unlocked'}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
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
