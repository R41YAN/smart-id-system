import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const superLinks = [
  { to: '/super-admin',                label: '📊 Dashboard', exact: true },
  { to: '/super-admin/universities',   label: '🏛️ Universities' },
  { to: '/super-admin/admins',         label: '👤 Manage Admins' },
];

const clientLinks = [
  { to: '/admin',             label: '📊 Dashboard', exact: true },
  { to: '/admin/departments', label: '🏢 Departments' },
  { to: '/admin/batches',     label: '📋 Batches' },
  { to: '/admin/admit',       label: '✅ Admit Student' },
  { to: '/admin/students',    label: '🎓 Student List' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === 'super_admin' ? superLinks : clientLinks;

  return (
    <div className="w-64 min-h-screen bg-gray-900 text-white flex flex-col shrink-0 print:hidden">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-lg font-bold text-blue-400 leading-snug">🪪 Smart ID Formatting System</h1>
        <p className="text-xs text-gray-400 mt-1 truncate">{user?.email}</p>
        <span className="mt-2 inline-block text-xs bg-blue-600 px-2 py-0.5 rounded-full">
          {user?.role === 'super_admin' ? 'Super Admin' : 'Client Admin'}
        </span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.exact}
            className={({ isActive }) =>
              `flex items-center px-4 py-2.5 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-900/30 rounded-lg transition-colors">
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
