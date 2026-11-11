import { useState, useEffect } from 'react';
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
  LogoutIcon
} from './Icons';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sifs_sidebar_collapsed') === 'true';
  });

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
    <aside
      className={`min-h-screen bg-[#070C18] text-slate-100 flex flex-col shrink-0 border-r border-slate-800/80 shadow-2xl print:hidden select-none transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* ─── UNCOLLAPSED MODE (Wide — 256px) ────────────────────────── */}
      {!collapsed ? (
        <>
          {/* Header Section */}
          <div className="p-4 border-b border-slate-800/80">
            {/* Top Row: SIFS Logo + Brand + Version + Collapse Toggle Icon */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
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
                  <div className="flex items-center gap-1.5">
                    <span className="font-black tracking-wider text-base text-white">SIFS</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded font-bold">
                      v2.0
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium truncate leading-tight mt-0.5" title="Smart ID Formatting System">
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

            {/* User Identity Details as Requested */}
            <div className="mt-4 pt-3.5 border-t border-slate-800/60">
              {/* Role Badge */}
              <div className="mb-2">
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
          </div>

          {/* Navigation Section */}
          <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 px-3 py-1.5">
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

          {/* Footer / Sign Out */}
          <div className="p-4 border-t border-slate-800/80 bg-[#050811]">
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
            >
              <LogoutIcon className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </>
      ) : (
        /* ─── COLLAPSED MODE (Mini Rail — 80px) ────────────────────────── */
        <div className="flex flex-col h-full items-center py-4 justify-between">
          {/* Top: SIFS Logo + SIFS + Role + Expand Toggle */}
          <div className="w-full flex flex-col items-center">
            {/* SIFS Logo with Expand Icon on Hover */}
            <button
              type="button"
              onClick={toggleCollapse}
              className="relative group p-1 focus:outline-none cursor-pointer"
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

            {/* SIFS Text */}
            <p className="text-xs font-black tracking-wider text-white text-center mt-1.5">
              SIFS
            </p>

            {/* Compact Role Badge */}
            <span
              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mt-1 border text-center ${
                user?.role === 'super_admin'
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
              }`}
              title={user?.role === 'super_admin' ? 'Super Admin' : 'Client Admin'}
            >
              {user?.role === 'super_admin' ? 'Super' : 'Admin'}
            </span>

            {/* Divider */}
            <div className="w-12 h-px bg-slate-800 my-4" />

            {/* Portal Indicator */}
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mb-3 animate-pulse" title="Portal Active" />

            {/* 3rd Pic Navigation Icons (Centered with Tooltips) */}
            <nav className="flex flex-col gap-2.5 items-center w-full px-2">
              {links.map((l) => {
                const Icon = l.icon;
                return (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.exact}
                    title={l.label}
                    className={({ isActive }) =>
                      `w-11 h-11 flex items-center justify-center rounded-xl transition-all ${
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

          {/* Bottom: Sign Out Icon */}
          <div className="w-full flex flex-col items-center pt-3 border-t border-slate-800/80">
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="w-11 h-11 flex items-center justify-center text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
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
