import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

export default function ManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetch = () => api.get('/departments').then(r => setDepartments(r.data));
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await api.post('/departments', { name }); setName(''); fetch(); }
    catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this department?')) return;
    try { await api.delete(`/departments/${id}`); fetch(); }
    catch (err) { alert(err.response?.data?.message || 'Cannot delete'); }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Departments</h1>
        <p className="text-gray-500 mb-8">Manage your university departments (CSE, BBA, LAW, etc.)</p>

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Add Department</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input type="text" required placeholder="e.g. CSE" value={name}
              onChange={e => setName(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase" />
            <button type="submit" disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
              {loading ? 'Adding...' : '+ Add'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Departments ({departments.length})</h2>
          {departments.length === 0 ? <p className="text-gray-400 text-sm">No departments yet.</p> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {departments.map(d => (
                <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="font-bold text-gray-800 font-mono">{d.name}</span>
                  <button onClick={() => handleDelete(d.id)}
                    className="text-red-400 hover:text-red-600 text-xs px-2 py-1 hover:bg-red-50 rounded transition-colors">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
