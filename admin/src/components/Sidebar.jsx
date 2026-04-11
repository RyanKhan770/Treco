import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/',                  label: 'Dashboard',           icon: '📊' },
  { to: '/users',             label: 'Users',               icon: '👥' },
  { to: '/trails',            label: 'Trails',              icon: '🏔️' },
  { to: '/groups',            label: 'Groups',              icon: '🤝' },
  { to: '/organizer-requests',label: 'Organizer Requests',  icon: '📋' },
  { to: '/reports',           label: 'Reports',             icon: '🚩' },
  { to: '/verifications',     label: 'Verifications',       icon: '✅' },
];

export default function Sidebar() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-primary flex flex-col shadow-xl flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <h1 className="text-white text-2xl font-black tracking-wide">Treco</h1>
        <p className="text-white/50 text-xs mt-1 tracking-widest uppercase">Admin Panel</p>
      </div>

      {/* Admin info */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {admin?.name?.[0]?.toUpperCase() || 'A'}
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-semibold truncate">{admin?.name || 'Admin'}</p>
          <p className="text-white/50 text-xs truncate">{admin?.email || ''}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          <span>🚪</span> Log Out
        </button>
      </div>
    </aside>
  );
}
