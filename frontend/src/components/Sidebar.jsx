import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getUniversityLogo } from '../utils/universityLogos';
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

  const handleSidebarLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.university_id) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, SVG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const maxDim = 300;
        let width = img.width;
        let height = img.height;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const resized = canvas.toDataURL('image/png');

        try {
          await api.put(`/universities/${user.university_id}`, { logo_url: resized });
          const localUser = localStorage.getItem('user');
          if (localUser) {
            const parsed = JSON.parse(localUser);
            parsed.university_logo = resized;
            localStorage.setItem('user', JSON.stringify(parsed));
          }
          window.location.reload();
        } catch {
          alert('Failed to update university logo.');
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

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
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate">Smart ID Formatting System</p>
          </div>
        </div>

        {/* Institutional Tenant Badge for Client Admin (Visible on all tabs) */}
        {user?.role === 'client_admin' && (
          <div className="mt-3.5 p-2.5 rounded-xl bg-gradient-to-r from-slate-900/90 to-blue-950/40 border border-blue-500/25 flex items-center gap-3">
            <div
              onClick={() => document.getElementById('sidebar-uni-logo-input')?.click()}
              className="w-9 h-9 rounded-lg bg-white/10 p-1 border border-white/20 flex items-center justify-center shrink-0 overflow-hidden shadow-inner cursor-pointer hover:border-blue-400 relative group"
              title="Click to update university logo"
            >
              {getUniversityLogo(user?.university_name, user?.university_logo) ? (
                <img
                  src={getUniversityLogo(user?.university_name, user?.university_logo)}
                  alt={user?.university_name || 'University'}
                  className="w-full h-full object-contain"
                />
              ) : (
                <UniversityIcon className="w-5 h-5 text-blue-300" />
              )}
              <div className="absolute inset-0 bg-slate-950/70 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-bold">
                📷
              </div>
            </div>

            <input
              type="file"
              id="sidebar-uni-logo-input"
              accept="image/*"
              className="hidden"
              onChange={handleSidebarLogoUpload}
            />

            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-bold text-white truncate" title={user?.university_name}>
                {user?.university_name || 'University Portal'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-[10px] text-blue-300 font-medium truncate">
                  {user?.university_type === 'open_credit' ? 'Open Credit Model' : 'Close Credit Model'}
                </span>
              </div>
            </div>
          </div>
        )}

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