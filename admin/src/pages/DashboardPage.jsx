import { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import StatsCard from '../components/StatsCard';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats()
      .then((res) => setStats(res.data))
      .catch(() => setStats({
        totalUsers: 0, totalTrails: 0, totalGroups: 0,
        pendingReports: 0, pendingOrganizerRequests: 0,
      }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Welcome back. Here's what's happening on Treco.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 h-24 animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard label="Total Users"      value={stats?.totalUsers}              icon="👥" color="bg-blue-50"        textColor="text-blue-700" />
          <StatsCard label="Active Trails"    value={stats?.totalTrails}             icon="🏔️" color="bg-primaryPale"    textColor="text-primary" />
          <StatsCard label="Total Groups"     value={stats?.totalGroups}             icon="🤝" color="bg-purple-50"      textColor="text-purple-700" />
          <StatsCard label="Pending Reports"  value={stats?.pendingReports}          icon="🚩" color="bg-red-50"         textColor="text-red-600" />
          <StatsCard label="Organizer Reqs"   value={stats?.pendingOrganizerRequests}icon="📋" color="bg-amber-50"       textColor="text-amber-700" />
        </div>
      )}

      {/* Quick actions */}
      <div className="mt-8">
        <h2 className="text-base font-semibold text-gray-700 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Review Reports',      icon: '🚩', href: '/reports',             bg: 'bg-red-50 hover:bg-red-100 text-red-700' },
            { label: 'Organizer Requests',  icon: '📋', href: '/organizer-requests',  bg: 'bg-amber-50 hover:bg-amber-100 text-amber-700' },
            { label: 'ID Verifications',    icon: '✅', href: '/verifications',       bg: 'bg-green-50 hover:bg-green-100 text-green-700' },
            { label: 'Manage Trails',       icon: '🏔️', href: '/trails',             bg: 'bg-blue-50 hover:bg-blue-100 text-blue-700' },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl font-medium text-sm transition ${action.bg}`}
            >
              <span className="text-2xl">{action.icon}</span>
              {action.label}
            </a>
          ))}
        </div>
      </div>

      {/* Info note */}
      <div className="mt-6 bg-primaryPale border border-accent/30 rounded-xl p-4 text-sm text-primary">
        <strong>Treco Admin Panel</strong> — Manage users, trails, groups, and content moderation.
        All actions are logged. Use with care.
      </div>
    </div>
  );
}
