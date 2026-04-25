import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import StatsCard from '../components/StatsCard';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { 
  UserMultipleIcon, MountainIcon, UserGroupIcon, Flag01Icon, 
  UserIdVerificationIcon, UserCheck01Icon, ChartUpIcon 
} from 'hugeicons-react';

const CHART_COLORS = ['#40916C', '#52B788', '#457B9D', '#E76F51', '#8B5CF6', '#6B4423'];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      adminAPI.getStats(),
      adminAPI.getAnalytics(),
    ]).then(([statsRes, analyticsRes]) => {
      setStats(statsRes.status === 'fulfilled' ? statsRes.value.data : {
        totalUsers: 0, totalTrails: 0, totalGroups: 0,
        pendingReports: 0, pendingOrganizerRequests: 0, pendingVerifications: 0,
      });
      setAnalytics(analyticsRes.status === 'fulfilled' ? analyticsRes.value.data : null);
    }).finally(() => setLoading(false));
  }, []);

  const soloGroupData = analytics?.soloVsGroup
    ? [
        { name: 'Group Trekkers', value: analytics.soloVsGroup.group },
        { name: 'Solo Trekkers', value: analytics.soloVsGroup.solo },
      ]
    : [];

  const usersByRoleData = (analytics?.usersByRole || []).map(r => ({
    name: r.role.charAt(0).toUpperCase() + r.role.slice(1),
    value: parseInt(r.count),
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Welcome back. Here's what's happening on Treco.</p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 h-24 animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatsCard label="Total Users"        value={stats?.totalUsers}               icon={<UserMultipleIcon size={24} />} color="bg-blue-50"     textColor="text-blue-700" />
            <StatsCard label="Active Trails"      value={stats?.totalTrails}              icon={<MountainIcon size={24} />} color="bg-primaryPale" textColor="text-primary" />
            <StatsCard label="Total Groups"       value={stats?.totalGroups}              icon={<UserGroupIcon size={24} />} color="bg-purple-50"   textColor="text-purple-700" />
            <StatsCard label="Pending Reports"    value={stats?.pendingReports}           icon={<Flag01Icon size={24} />} color="bg-red-50"      textColor="text-red-600" />
            <StatsCard label="Organizer Requests" value={stats?.pendingOrganizerRequests} icon={<UserIdVerificationIcon size={24} />} color="bg-amber-50"   textColor="text-amber-700" />
            <StatsCard label="ID Verifications"   value={stats?.pendingVerifications}     icon={<UserCheck01Icon size={24} />} color="bg-green-50"   textColor="text-green-700" />
          </div>

          {/* Charts row */}
          {analytics && (
            <>
              <h2 className="text-base font-semibold text-gray-700 mb-4">Analytics Overview</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* User growth chart */}
                {analytics.userGrowth?.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-4">
                      <ChartUpIcon size={18} /> User Growth (Last 12 months)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={analytics.userGrowth.map(d => ({ ...d, count: parseInt(d.count) }))}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#40916C" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#40916C" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="count" stroke="#40916C" fill="url(#colorUsers)" strokeWidth={2} name="New Users" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Popular trails */}
                {analytics.popularTrails?.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-4">
                      <MountainIcon size={18} /> Popular Trails (by groups)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.popularTrails.slice(0, 6).map(d => ({ ...d, group_count: parseInt(d.group_count) }))} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="group_count" fill="#52B788" radius={[0, 4, 4, 0]} name="Groups" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Solo vs Group */}
                {soloGroupData.length > 0 && (soloGroupData[0].value > 0 || soloGroupData[1].value > 0) && (
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-4">
                      <UserMultipleIcon size={18} /> Solo vs Group Trekkers
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={soloGroupData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={true}>
                          {soloGroupData.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Users by role */}
                {usersByRoleData.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-4">
                      <UserGroupIcon size={18} /> Users by Role
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={usersByRoleData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={true}>
                          {usersByRoleData.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Reports by status */}
                {analytics.reportsByStatus?.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-4">
                      <Flag01Icon size={18} /> Reports by Status
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.reportsByStatus.map(d => ({ ...d, count: parseInt(d.count) }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#E76F51" radius={[4, 4, 0, 0]} name="Reports" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Group growth */}
                {analytics.groupGrowth?.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-4">
                      <ChartUpIcon size={18} /> Group Growth
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={analytics.groupGrowth.map(d => ({ ...d, count: parseInt(d.count) }))}>
                        <defs>
                          <linearGradient id="colorGroups" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#457B9D" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#457B9D" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="count" stroke="#457B9D" fill="url(#colorGroups)" strokeWidth={2} name="New Groups" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Quick actions */}
      <div className="mt-4">
        <h2 className="text-base font-semibold text-gray-700 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Review Reports',      icon: <Flag01Icon size={24} />, href: '/reports',             bg: 'bg-red-50 hover:bg-red-100 text-red-700' },
            { label: 'Organizer Requests',  icon: <UserIdVerificationIcon size={24} />, href: '/organizer-requests',  bg: 'bg-amber-50 hover:bg-amber-100 text-amber-700' },
            { label: 'ID Verifications',    icon: <UserCheck01Icon size={24} />, href: '/verifications',       bg: 'bg-green-50 hover:bg-green-100 text-green-700' },
            { label: 'Manage Trails',       icon: <MountainIcon size={24} />, href: '/trails',             bg: 'bg-blue-50 hover:bg-blue-100 text-blue-700' },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.href}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl font-medium text-sm transition ${action.bg}`}
            >
              <div className="mb-1">{action.icon}</div>
              {action.label}
            </Link>
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
