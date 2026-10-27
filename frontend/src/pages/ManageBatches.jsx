import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const SEM_LABELS = { SP: 'Spring', SM: 'Summer', FL: 'Fall' };

export default function ManageBatches() {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [university, setUniversity] = useState(null);
  const [form, setForm] = useState({ department_id:'', year: new Date().getFullYear(), batch_number:'', semester_code:'SP', semester_index:1 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAll = () => Promise.all([api.get('/batches'), api.get('/departments')])
    .then(([b,d]) => { setBatches(b.data); setDepartments(d.data); });

  useEffect(() => {
    fetchAll();
    if (user?.university_id)
      api.get(`/universities/${user.university_id}`).then(r => setUniversity(r.data));
  }, [user]);

  const isOpen = university?.type === 'open_credit';

  const setSem = (code) => setForm({...form, semester_code: code, semester_index: {SP:1,SM:2,FL:3}[code]});

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.post('/batches', {
        department_id: form.department_id, year: form.year,
        batch_number:  isOpen ? null : form.batch_number,
        semester_code: isOpen ? form.semester_code : null,
        semester_index:isOpen ? form.semester_index : null,
      });
      setForm({ department_id:'', year: new Date().getFullYear(), batch_number:'', semester_code:'SP', semester_index:1 });
      fetchAll();
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this batch?')) return;
    try { await api.delete(`/batches/${id}`); fetchAll(); }
    catch (err) { alert(err.response?.data?.message || 'Cannot delete'); }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Batches / Intakes</h1>
        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs px-4 py-2 rounded-lg mb-8">
          💡 ID Format: {isOpen ? '[Dept][YY][SemCode][Serial] — e.g. CSE26FL001' : '[Dept][Batch][YY][Serial] — e.g. CSE5426001'}
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Add New Batch</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select required value={form.department_id} onChange={e => setForm({...form, department_id: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select department</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input type="number" required min="2000" max="2100" value={form.year}
                onChange={e => setForm({...form, year: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {isOpen ? (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <div className="flex gap-3">
                  {[['SP','Spring'],['SM','Summer'],['FL','Fall']].map(([code,label]) => (
                    <button type="button" key={code} onClick={() => setSem(code)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                        form.semester_code===code ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:border-blue-400'
                      }`}>{label}</button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                <input type="number" required placeholder="e.g. 54" value={form.batch_number}
                  onChange={e => setForm({...form, batch_number: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
            <div className="sm:col-span-2">
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 text-sm">
                {loading ? 'Creating...' : '+ Create Batch'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">All Batches ({batches.length})</h2>
          {batches.length === 0 ? <p className="text-gray-400 text-sm">No batches yet.</p> : (
            <div className="space-y-2">
              {batches.map(b => (
                <div key={b.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <div>
                    <span className="font-bold text-gray-800 font-mono">{b.department_name}</span>
                    <span className="text-gray-500 text-sm ml-2">
                      {b.semester_code ? `${SEM_LABELS[b.semester_code]} ${b.year}` : `${b.batch_number}th Batch — ${b.year}`}
                    </span>
                    <span className="ml-3 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{b.current_serial}/999</span>
                  </div>
                  <button onClick={() => handleDelete(b.id)}
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
