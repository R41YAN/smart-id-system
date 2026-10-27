import { useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

export default function ManageAdmins() {
  const [form, setForm] = useState({ name:'', email:'', password:'', university_id:'', role:'client_admin' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setResult(null); setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      setResult(res.data.user);
      setForm({ name:'', email:'', password:'', university_id:'', role:'client_admin' });
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Admins</h1>
        <p className="text-gray-500 mb-8">Create Client Admin accounts for university staff</p>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Create New Admin</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded mb-4 text-sm">{error}</div>}
          {result && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 text-sm">
              ✅ Admin created: <strong>{result.name}</strong> ({result.email}) — Role: {result.role}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[['name','Full Name','text','John Doe'],['email','Email','email','admin@uni.edu'],
                ['password','Password','password','••••••••']].map(([key,label,type,ph]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type={type} required placeholder={ph} value={form[key]}
                    onChange={e => setForm({...form,[key]:e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">University ID</label>
                <input type="number" placeholder="University ID" value={form.university_id}
                  onChange={e => setForm({...form, university_id: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="client_admin">Client Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 text-sm">
              {loading ? 'Creating...' : 'Create Admin Account'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
