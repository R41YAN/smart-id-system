import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const SEM_LABELS = { SP: 'Spring', SM: 'Summer', FL: 'Fall' };

export default function AdmitStudent() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [university, setUniversity] = useState(null);
  const [form, setForm] = useState({ department_id:'', batch_id:'', name:'', email:'', phone:'' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/departments').then(r => setDepartments(r.data));
    api.get('/batches').then(r => setBatches(r.data));
    if (user?.university_id)
      api.get(`/universities/${user.university_id}`).then(r => setUniversity(r.data));
  }, [user]);

  const handleDept = (id) => {
    setForm({...form, department_id: id, batch_id: ''});
    setFilteredBatches(batches.filter(b => String(b.department_id) === String(id)));
  };

  const isOpen = university?.type === 'open_credit';

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setResult(null); setLoading(true);
    try {
      const res = await api.post('/students', form);
      setResult(res.data.student);
      setForm({ department_id:'', batch_id:'', name:'', email:'', phone:'' });
      setFilteredBatches([]);
    } catch (err) { setError(err.response?.data?.message || 'Failed to admit student'); }
    finally { setLoading(false); }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admit Student</h1>
        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs px-4 py-2 rounded-lg mb-6">
          🔐 ID auto-generated using {isOpen ? '[Dept][YY][SemCode][Serial]' : '[Dept][Batch][YY][Serial]'} with concurrency-safe locking (SELECT FOR UPDATE)
        </div>

        {result && (
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6 mb-6 text-center">
            <div className="text-5xl mb-3">🎓</div>
            <p className="text-green-700 font-medium text-sm mb-2">Student Admitted Successfully!</p>
            <div className="font-mono text-3xl font-bold text-green-800 bg-green-100 px-6 py-4 rounded-lg inline-block">
              {result.student_id}
            </div>
            <p className="text-green-600 text-sm mt-3">{result.name}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow p-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <select required value={form.department_id} onChange={e => handleDept(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{isOpen ? 'Semester Intake *' : 'Batch *'}</label>
                <select required value={form.batch_id} onChange={e => setForm({...form, batch_id: e.target.value})}
                  disabled={!form.department_id}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50">
                  <option value="">Select {isOpen ? 'semester' : 'batch'}</option>
                  {filteredBatches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.semester_code ? `${SEM_LABELS[b.semester_code]} ${b.year}` : `${b.batch_number}th Batch — ${b.year}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input type="text" required placeholder="Student full name" value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" placeholder="student@email.com" value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" placeholder="01XXXXXXXXX" value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 text-base">
              {loading ? 'Generating ID & Admitting...' : '✅ Admit Student & Generate ID'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
