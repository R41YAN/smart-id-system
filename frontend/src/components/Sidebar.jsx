import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  DashboardIcon,
  UniversityIcon,
  DepartmentIcon,
  BatchIcon,
  AdmitIcon,
  StudentsIcon,
  AdminsIcon,
  LogoutIcon,
  ShieldCheckIcon
} from './Icons';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const superLinks = [
    { to: '/super-admin',              label: 'Dashboard',     icon: DashboardIcon, exact: true },
    { to: '/super-admin/universities', label: 'Universities',  icon: UniversityIcon },
    { to: '/super-admin/admins',       label: 'Manage Admins', icon: AdminsIcon },
  ];

  const clientLinks = [
    { to: '/admin',             label: 'Dashboard',     icon: DashboardIcon, exact: true },
    { to: '/admin/departments', label: 'Departments',   icon: DepartmentIcon },
    { to: '/admin/batches',     label: 'Batches',       icon: BatchIcon },
    { to: '/admin/admit',       label: 'Admit Student', icon: AdmitIcon },
    { to: '/admin/students',    label: 'Student List',  icon: StudentsIcon },
  ];

  const links = user?.role === 'super_admin' ? superLinks : clientLinks;

  return (
    <aside className="w-64 min-h-screen bg-[#0B132B] text-slate-100 flex flex-col shrink-0 border-r border-slate-800/80 shadow-xl print:hidden select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <img
              src="/logo.jpg"
              alt="SIFS Badge"
              className="w-11 h-11 rounded-xl object-cover shadow-lg border border-amber-400/40 ring-2 ring-amber-400/10 shrink-0 transition-transform group-hover:scale-105"
            />
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wider text-base text-white">SIFS</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-300 border border-amber-400/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate">Smart ID Formatting</p>
          </div>
        </div>

        {/* User Card */}
        <div className="mt-4 p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
          <div className="overflow-hidden pr-2">
            <p className="text-xs text-slate-200 font-medium truncate">{user?.name || user?.email}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 border ${
            user?.role === 'super_admin'
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
              : 'bg-blue-500/10 text-blue-300 border-blue-500/20'
          }`}>
            {user?.role === 'super_admin' ? 'Super Admin' : 'Client Admin'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 px-3 py-2">
          {user?.role === 'super_admin' ? 'System Console' : 'Admission Portal'}
        </p>

        {links.map((l) => {
          const Icon = l.icon;
          return (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{l.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-[#080d1f]">
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
        >
          <LogoutIcon className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}