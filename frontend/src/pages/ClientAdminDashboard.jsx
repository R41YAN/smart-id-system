import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  DepartmentIcon,
  StudentsIcon,
  LockIcon,
  UnlockIcon,
  AdmitIcon,
  ArrowRightIcon
} from '../components/Icons';

function StatCard({ icon: Icon, label, value, subtext, colorClass, iconBg }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-black text-slate-900">{value ?? '—'}</p>
      </div>
      {subtext && <p className="text-xs text-slate-400 mt-1 font-medium">{subtext}</p>}
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
    Promise.all([api.get('/departments'), api.get('/students')])
      .then(([d, s]) => {
        setDepartments(d.data);
        setStudents(s.data);
      })
      .finally(() => setLoading(false));

    if (user?.university_id) {
      api.get(`/universities/${user.university_id}`).then(r => setUniversity(r.data));
    }
  }, [user]);

  const isOpen = university?.type === 'open_credit';

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Admission Dashboard
            </h1>
            {university && (
              <div className="flex flex-wrap items-center gap-2.5 mt-2">
                <span className="text-sm font-semibold text-slate-700">{university.name}</span>
                <span className="text-slate-300">•</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isOpen
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                }`}>
                  {isOpen ? 'Open Credit System' : 'Close Credit System'}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  university.is_locked
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {university.is_locked ? (
                    <>
                      <LockIcon className="w-3 h-3 text-rose-600" />
                      Locked
                    </>
                  ) : (
                    <>
                      <UnlockIcon className="w-3 h-3 text-emerald-600" />
                      Active
                    </>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Quick Action Button */}
          <div className="flex gap-2.5">
            <Link
              to="/admin/admit"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm shadow-blue-500/20 active:scale-[0.98] transition-all"
            >
              <AdmitIcon className="w-4 h-4" />
              <span>Admit Student</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard
            icon={DepartmentIcon}
            label="Active Departments"
            value={departments.length}
            subtext="Available for enrollment"
            colorClass="text-blue-600"
            iconBg="bg-blue-50"
          />
          <StatCard
            icon={StudentsIcon}
            label="Enrolled Students"
            value={students.length}
            subtext="Generated smart ID numbers"
            colorClass="text-emerald-600"
            iconBg="bg-emerald-50"
          />
          <StatCard
            icon={university?.is_locked ? LockIcon : UnlockIcon}
            label="Admission Engine"
            value={university?.is_locked ? 'Locked' : 'Active'}
            subtext={university?.is_locked ? 'Admissions temporarily paused' : 'Sequential ID generation ready'}
            colorClass={university?.is_locked ? 'text-rose-600' : 'text-purple-600'}
            iconBg={university?.is_locked ? 'bg-rose-50' : 'bg-purple-50'}
          />
        </div>

        {/* Recent Admissions Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Student Admissions</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest generated IDs in this university</p>
            </div>
            {students.length > 0 && (
              <Link
                to="/admin/students"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 transition-colors"
              >
                <span>View Full Roster</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Loading admissions...</div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center">
              <StudentsIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No students admitted yet</p>
              <p className="text-xs text-slate-400 mt-1">Start by enrolling a student through the admission form.</p>
              <Link
                to="/admin/admit"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                <AdmitIcon className="w-3.5 h-3.5" />
                <span>Admit First Student</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500">
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Student ID</th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Full Name</th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Admission Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {students.slice(0, 8).map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-xs bg-blue-50 text-blue-700 border border-blue-200/80 px-2.5 py-1 rounded-lg">
                          {s.student_id}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{s.name}</td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="font-mono text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {s.department_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                        {new Date(s.admitted_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}