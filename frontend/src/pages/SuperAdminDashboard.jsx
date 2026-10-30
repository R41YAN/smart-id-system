import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api/axios';
import {
  UniversityIcon,
  DepartmentIcon,
  AdminsIcon,
  LockIcon,
  UnlockIcon,
  ArrowRightIcon,
  PlusIcon
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

  const openCreditCount = universities.filter(u => u.type === 'open_credit').length;
  const clientAdminsCount = users.filter(u => u.role === 'client_admin').length;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Super Admin Console
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Global system monitoring, university tenants, and administrative access
            </p>
          </div>

          <div className="flex gap-2.5">
            <Link
              to="/super-admin/universities"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm shadow-blue-500/20 active:scale-[0.98] transition-all"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add University</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard
            icon={UniversityIcon}
            label="Registered Universities"
            value={universities.length}
            subtext="Multi-tenant institutions"
            colorClass="text-blue-600"
            iconBg="bg-blue-50"
          />
          <StatCard
            icon={DepartmentIcon}
            label="Open Credit Tenants"
            value={openCreditCount}
            subtext={`${universities.length - openCreditCount} close-credit tenants`}
            colorClass="text-emerald-600"
            iconBg="bg-emerald-50"
          />
          <StatCard
            icon={AdminsIcon}
            label="Client Admins"
            value={clientAdminsCount}
            subtext="University staff operators"
            colorClass="text-purple-600"
            iconBg="bg-purple-50"
          />
        </div>

        {/* Universities Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Configured Universities</h2>
              <p className="text-xs text-slate-500 mt-0.5">Institutions with active ID formatting rules</p>
            </div>
            <Link
              to="/super-admin/universities"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 transition-colors"
            >
              <span>Manage Universities</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Loading universities...</div>
          ) : universities.length === 0 ? (
            <div className="p-12 text-center">
              <UniversityIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No universities registered</p>
              <p className="text-xs text-slate-400 mt-1">Add your first university to begin issuing IDs.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500">
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">University Name</th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Credit Model</th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Engine Status</th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {universities.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-800">{u.name}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          u.type === 'open_credit'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {u.type === 'open_credit' ? 'Open Credit' : 'Close Credit'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          u.is_locked
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {u.is_locked ? (
                            <>
                              <LockIcon className="w-3 h-3 text-rose-600" />
                              Locked
                            </>
                          ) : (
                            <>
                              <UnlockIcon className="w-3 h-3 text-emerald-600" />
                              Unlocked
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                        {new Date(u.created_at).toLocaleDateString(undefined, {
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