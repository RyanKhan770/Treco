import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  DashboardSquare01Icon, UserMultipleIcon, MountainIcon, 
  UserGroupIcon, ClipboardIcon, Flag01Icon, 
  UserCheck01Icon, Alert01Icon, Logout01Icon 
} from 'hugeicons-react';

const NAV = [
  { to: '/',                  label: 'Dashboard',           icon: <DashboardSquare01Icon size={20} /> },
  { to: '/users',             label: 'Users',               icon: <UserMultipleIcon size={20} /> },
  { to: '/trails',            label: 'Trails',              icon: <MountainIcon size={20} /> },
  { to: '/groups',            label: 'Groups',              icon: <UserGroupIcon size={20} /> },
  { to: '/organizer-requests',label: 'Organizer Requests',  icon: <ClipboardIcon size={20} /> },
  { to: '/reports',           label: 'Reports',             icon: <Flag01Icon size={20} /> },
  { to: '/verifications',     label: 'Verifications',       icon: <UserCheck01Icon size={20} /> },
  { to: '/sos-alerts',        label: 'SOS Alerts',          icon: <Alert01Icon size={20} /> },
];

export default function Sidebar() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 h-screen sticky top-0 bg-primary flex flex-col shadow-xl flex-shrink-0">
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
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
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
      <div className="px-3 py-4 border-t border-white/10 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Logout01Icon size={20} /> Log Out
        </button>
      </div>
    </aside>
  );
}
