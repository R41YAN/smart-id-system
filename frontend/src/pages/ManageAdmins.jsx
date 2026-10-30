import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

export default function ManageAdmins() {
  const [universities, setUniversities] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name:'', email:'', password:'', university_id:'', role:'client_admin' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [uniRes, userRes] = await Promise.all([
        api.get('/universities'),
        api.get('/auth/users'),
      ]);
      setUniversities(uniRes.data);
      setUsers(userRes.data);
      if (uniRes.data.length > 0 && !form.university_id) {
        setForm(prev => ({ ...prev, university_id: uniRes.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setResult(null); setLoading(true);
    try {
      const payload = {
        ...form,
        university_id: form.role === 'super_admin' ? null : form.university_id,
      };
      const res = await api.post('/auth/register', payload);
      setResult(res.data.user);
      setForm({ name:'', email:'', password:'', university_id: universities[0]?.id || '', role:'client_admin' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Admins</h1>
        <p className="text-gray-500 mb-8">Create Client Admin accounts for university staff</p>

        {/* Create Form */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Create New Admin</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded mb-4 text-sm">{error}</div>}
          {result && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 text-sm">
              ✅ Admin created: <strong>{result.name}</strong> ({result.email}) — Role: {result.role}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. John Smith"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="staff@university.edu"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="client_admin">Client Admin (University Staff)</option>
                  <option value="super_admin">Super Admin (System Developer)</option>
                </select>
              </div>

              {form.role === 'client_admin' && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned University</label>
                  <select
                    required
                    value={form.university_id}
                    onChange={e => setForm({ ...form, university_id: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a university</option>
                    {universities.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.type === 'open_credit' ? 'Open Credit' : 'Close Credit'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? 'Creating...' : 'Create Admin Account'}
            </button>
          </form>
        </div>

        {/* Existing Admins List */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Existing Accounts ({users.length})</h2>
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3.5 border border-gray-100 rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    u.role === 'super_admin' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {u.role === 'super_admin' ? 'Super Admin' : (u.university_name || 'Client Admin')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
