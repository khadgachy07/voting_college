import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Badge from './ui/Badge.jsx';
import Button from './ui/Button.jsx';

export default function Layout() {
  const { user, logout } = useAuth();

  const role = user?.role || 'student';
  const initials = (user?.name || '?').split(' ').map((w) => w[0]).join('').toUpperCase();

  const navItems = [
    ...(role === 'admin' ? [{ to: '/admin/dashboard', label: 'Dashboard', icon: '📊' }] : []),
    ...(role === 'admin' ? [{ to: '/admin/students', label: 'Students', icon: '🎓' }] : []),
    ...(role === 'admin' ? [{ to: '/admin/elections', label: 'Elections', icon: '🗳️' }] : []),
    ...(role === 'admin' ? [{ to: '/admin/candidates', label: 'Candidates', icon: '👤' }] : []),
    ...(role === 'admin' ? [{ to: '/admin/results', label: 'Results', icon: '📈' }] : []),
    ...(role === 'admin' ? [{ to: '/admin/audit', label: 'Audit Log', icon: '🛡️' }] : []),
    ...(role === 'student' ? [{ to: '/student/dashboard', label: 'Dashboard', icon: '🏠' }] : []),
    ...(role === 'student' ? [{ to: '/student/vote', label: 'Cast Vote', icon: '🗳️' }] : []),
    ...(role === 'candidate' ? [{ to: '/candidate/dashboard', label: 'Dashboard', icon: '🏠' }] : []),
    ...(role === 'candidate' ? [{ to: '/candidate/profile', label: 'My Profile', icon: '👤' }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full">
        <div className="p-5 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary">
            <span className="text-2xl">🗳️</span> VoteCollege
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors ${isActive ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <span>{item.icon}</span> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">{initials}</div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate text-slate-700">{user?.name || 'Guest'}</p>
              <p className="text-xs text-slate-400 capitalize">{role}</p>
            </div>
          </div>
          <Button variant="secondary" className="w-full" onClick={logout}>Logout</Button>
        </div>
      </aside>

      <div className="flex-1 ml-64">
        <Outlet />
      </div>
    </div>
  );
}
