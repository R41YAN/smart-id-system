import { useState, useEffect } from 'react';
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
  TrashIcon
} from './Icons';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sifs_sidebar_collapsed') === 'true';
  });

  const [uniLogoUrl, setUniLogoUrl] = useState(() => user?.university_logo || null);
  const [uniName, setUniName] = useState(() => user?.university_name || '');

  useEffect(() => {
    if (user?.university_id) {
      if (!user.university_name || !user.university_logo) {
        api.get(`/universities/${user.university_id}`)
          .then(res => {
            if (res.data) {
              setUniName(res.data.name || '');
              setUniLogoUrl(res.data.logo_url || null);
            }
          })
          .catch(() => {});
      } else {
        setUniName(user.university_name);
        setUniLogoUrl(user.university_logo);
      }
    } else {
      setUniName('');
      setUniLogoUrl(null);
    }
  }, [user]);

  const uniLogo = getUniversityLogo(uniName, uniLogoUrl);

  const toggleCollapse = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sifs_sidebar_collapsed', String(next));
      return next;
    });
  };

  const superLinks = [
    { to: '/super-admin',              label: 'Dashboard',     icon: DashboardIcon, exact: true },
    { to: '/super-admin/universities', label: 'Universities',  icon: UniversityIcon },
    { to: '/super-admin/admins',       label: 'Manage Admins', icon: AdminsIcon },
    { to: '/super-admin/trash',        label: 'Recycle Bin',   icon: TrashIcon },
  ];

  const clientLinks = [
    { to: '/admin',             label: 'Dashboard',     icon: DashboardIcon, exact: true },
    { to: '/admin/departments', label: 'Departments',   icon: DepartmentIcon },
    { to: '/admin/batches',     label: 'Batches',       icon: BatchIcon },
    { to: '/admin/admit',       label: 'Admit Student', icon: AdmitIcon },
    { to: '/admin/students',    label: 'Student List',  icon: StudentsIcon },
    { to: '/admin/trash',       label: 'Recycle Bin',   icon: TrashIcon },
  ];

  const links = user?.role === 'super_admin' ? superLinks : clientLinks;

  return (
    <aside
      className={`min-h-screen bg-[#070C18] text-slate-100 flex flex-col shrink-0 border-r border-slate-800/80 shadow-2xl print:hidden select-none transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* ─── UNCOLLAPSED MODE (Wide — 256px) ────────────────────────── */}
      {!collapsed ? (
        <>
          {/* Header Section (Exact height h-[178px] matching collapsed) */}
          <div className="h-[178px] px-3.5 py-4 border-b border-slate-800/80 flex flex-col justify-between shrink-0">
            {/* Top Row: SIFS Logo + Brand (No v2.0) + Collapse Toggle Icon */}
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-2 min-w-0">
                {/* Logo wrapper with fixed aspect-square and shrink-0 to prevent frame squeezing */}
                <div className="relative group shrink-0 w-10 h-10">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-blue-500 rounded-xl blur-xs opacity-50 group-hover:opacity-100 transition duration-300" />
                  <img
                    src="/logo.jpg"
                    alt="SIFS Badge"
                    className="relative w-10 h-10 rounded-xl object-contain shadow-lg border border-amber-400/50 transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0">
                  <span className="font-black tracking-wider text-base text-white block leading-tight">
                    SIFS
                  </span>
                  <p className="text-[11px] text-slate-400 font-medium tracking-tight whitespace-nowrap leading-tight mt-0.5">
                    Smart ID Formatting System
                  </p>
                </div>
              </div>

              {/* Collapse Toggle Button [|] */}
              <button
                type="button"
                onClick={toggleCollapse}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Collapse sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v18M14 9l-3 3 3 3" />
                </svg>
              </button>
            </div>

            {/* User Identity Details + University Logo in the Red Mark */}
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2.5">
              <div className="min-w-0 flex-1">
                {/* Role Badge */}
                <div className="mb-1">
                  <span
                    className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      user?.role === 'super_admin'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                    }`}
                  >
                    {user?.role === 'super_admin' ? 'Super Admin' : 'Client Admin'}
                  </span>
                </div>

                {/* Admin Full Name — No Truncation / No Cut Words! */}
                <p className="text-sm font-bold text-white leading-snug break-words">
                  {user?.name || user?.email}
                </p>

                {/* Admin Email */}
                <p className="text-xs text-slate-400 mt-0.5 break-all">
                  {user?.email}
                </p>
              </div>

              {/* University Logo on the Right (Red Mark) */}
              {user?.role !== 'super_admin' && (
                <div
                  className="w-10 h-10 rounded-xl bg-white/95 p-1 flex items-center justify-center shadow-md border border-slate-700/80 shrink-0 transition-transform hover:scale-105"
                  title={uniName || 'University Logo'}
                >
                  {uniLogo ? (
                    <img
                      src={uniLogo}
                      alt={uniName || 'University Logo'}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <UniversityIcon className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Section */}
          <nav className="flex-1 p-3 overflow-y-auto space-y-2">
            {/* Section Heading Slot (Height: h-8 flex items-center) */}
            <div className="h-8 flex items-center px-3 mb-1">
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                {user?.role === 'super_admin' ? 'System Console' : 'Admission Portal'}
              </p>
            </div>

            {links.map((l) => {
              const Icon = l.icon;
              return (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.exact}
                  className={({ isActive }) =>
                    `h-11 flex items-center gap-3 px-3.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white shadow-lg shadow-blue-600/30 font-semibold'
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

          {/* Footer / Sign Out (Height: h-[72px]) */}
          <div className="h-[72px] p-4 border-t border-slate-800/80 bg-[#050811] flex items-center shrink-0">
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="w-full h-10 flex items-center justify-center gap-2 px-3 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
            >
              <LogoutIcon className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </>
      ) : (
        /* ─── COLLAPSED MODE (Mini Rail — 80px) ────────────────────────── */
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Header Section (Exact matching height h-[178px] with divider at identical Y) */}
            <div className="h-[178px] p-2.5 border-b border-slate-800/80 flex flex-col items-center justify-between shrink-0">
              {/* Top Group: SIFS Logo Button + SIFS Brand Text */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={toggleCollapse}
                  className="relative group p-0.5 focus:outline-none cursor-pointer"
                  title="Expand sidebar"
                >
                  <div className="relative">
                    <img
                      src="/logo.jpg"
                      alt="SIFS"
                      className="w-10 h-10 rounded-xl object-contain border border-amber-400/50 shadow-md group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-blue-600/80 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* SIFS text placed right under the logo badge */}
                <p className="text-xs font-black tracking-wider text-white text-center mt-1">
                  SIFS
                </p>
              </div>

              {/* Middle Group: Role Badge */}
              {/* 1st Pic Green Mark: CLIENT ADMIN | 2nd Pic Red Mark: SUPER ADMIN */}
              <div className="w-full flex justify-center my-auto">
                <span
                  className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border text-center leading-tight shadow-sm ${
                    user?.role === 'super_admin'
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                  }`}
                  title={user?.name || (user?.role === 'super_admin' ? 'Super Admin' : 'Client Admin')}
                >
                  {user?.role === 'super_admin' ? (
                    <>SUPER<br />ADMIN</>
                  ) : (
                    <>CLIENT<br />ADMIN</>
                  )}
                </span>
              </div>

              {/* Bottom Group (1st Pic Orange Mark): University Logo for Client Admin */}
              <div className="w-full flex justify-center pb-0.5">
                {user?.role !== 'super_admin' ? (
                  <div
                    className="w-8 h-8 rounded-lg bg-white/95 p-1 flex items-center justify-center shadow-md border border-slate-700/80 transition-transform hover:scale-105"
                    title={uniName || 'University Logo'}
                  >
                    {uniLogo ? (
                      <img
                        src={uniLogo}
                        alt={uniName || 'University Logo'}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <UniversityIcon className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                ) : (
                  <div className="w-8 h-8" />
                )}
              </div>
            </div>

            {/* Navigation Section */}
            <nav className="p-3 overflow-y-auto space-y-2 flex flex-col items-center">
              {/* Portal Active Indicator Slot (Height: h-8 matching uncollapsed ADMISSION PORTAL) */}
              <div className="h-8 flex items-center justify-center mb-1">
                <div
                  className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-sm shadow-blue-400/50"
                  title={user?.role === 'super_admin' ? 'System Console Active' : 'Admission Portal Active'}
                />
              </div>

              {/* Navigation Icons (Height: h-11 matching uncollapsed) */}
              {links.map((l) => {
                const Icon = l.icon;
                return (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.exact}
                    title={l.label}
                    className={({ isActive }) =>
                      `h-11 w-11 flex items-center justify-center rounded-xl transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white shadow-lg shadow-blue-600/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Footer / Sign Out (Height: h-[72px] matching uncollapsed) */}
          <div className="h-[72px] p-4 border-t border-slate-800/80 bg-[#050811] flex items-center justify-center shrink-0">
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="w-10 h-10 flex items-center justify-center text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogoutIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
