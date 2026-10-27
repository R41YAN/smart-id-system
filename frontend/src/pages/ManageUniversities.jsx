import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

export default function ManageUniversities() {
  const [universities, setUniversities] = useState([]);
  const [form, setForm] = useState({ name: '', type: 'open_credit' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetch = () => api.get('/universities').then(r => setUniversities(r.data));
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await api.post('/universities', form); setForm({ name:'', type:'open_credit' }); fetch(); }
    catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this university?')) return;
    try { await api.delete(`/universities/${id}`); fetch(); }
    catch (err) { alert(err.response?.data?.message || 'Cannot delete'); }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Universities</h1>
        <p className="text-gray-500 mb-8">Add and manage universities on the platform</p>

        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Add New University</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <input type="text" required placeholder="University name" value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="open_credit">Open Credit</option>
              <option value="close_credit">Close Credit</option>
            </select>
            <button type="submit" disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
              {loading ? 'Adding...' : '+ Add'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">All Universities ({universities.length})</h2>
          {universities.length === 0 ? <p className="text-gray-400 text-sm">No universities yet.</p> : (
            <div className="space-y-3">
              {universities.map(u => (
                <div key={u.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-800">{u.name}</p>
                    <div className="flex gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.type==='open_credit'?'bg-green-100 text-green-700':'bg-purple-100 text-purple-700'}`}>
                        {u.type==='open_credit'?'Open Credit':'Close Credit'}
                      </span>
                      {u.is_locked && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">🔒 Locked</span>}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(u.id)}
                    className="text-red-400 hover:text-red-600 text-sm px-3 py-1 hover:bg-red-50 rounded transition-colors">Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
