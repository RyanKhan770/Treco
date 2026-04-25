import { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import DataTable from '../components/DataTable';

const ROLE_COLORS = {
  admin:     'bg-purple-100 text-purple-700',
  organizer: 'bg-blue-100 text-blue-700',
  user:      'bg-gray-100 text-gray-600',
  banned:    'bg-red-100 text-red-700',
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    adminAPI.getUsers()
      .then((res) => setUsers(res.data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleRole = async (userId, role) => {
    if (!window.confirm(`Change this user's role to "${role}"?`)) return;
    try {
      await adminAPI.setRole(userId, role);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u));
    } catch { alert('Failed to update role'); }
  };

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch { alert('Failed to delete user'); }
  };

  const handleBan = async (userId, name, isBanned) => {
    const action = isBanned ? 'unban' : 'ban';
    if (!window.confirm(`${isBanned ? 'Unban' : 'Ban'} user "${name}"?`)) return;
    try {
      await adminAPI.banUser(userId, !isBanned);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: isBanned ? 'user' : 'banned' } : u));
    } catch { alert(`Failed to ${action} user`); }
  };

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'name', label: 'User',
      render: (val, row) => (
        <div>
          <p className="font-medium text-gray-800">{val}</p>
          <p className="text-gray-400 text-xs">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'role', label: 'Role',
      render: (val) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLORS[val] || ROLE_COLORS.user}`}>
          {val}
        </span>
      ),
    },
    {
      key: 'is_verified', label: 'Verified',
      render: (val) => (
        <span className={`text-xs font-medium ${val ? 'text-green-600' : 'text-gray-400'}`}>
          {val ? '✅ Yes' : '— No'}
        </span>
      ),
    },
    {
      key: 'created_at', label: 'Joined',
      render: (val) => val ? new Date(val).toLocaleDateString() : '—',
    },
    {
      key: 'id', label: 'Actions',
      render: (id, row) => (
        <div className="flex items-center gap-2">
          <select
            value={row.role}
            onChange={(e) => handleRole(id, e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none"
          >
            <option value="user">user</option>
            <option value="organizer">organizer</option>
            <option value="admin">admin</option>
          </select>
          <button
            onClick={() => handleBan(id, row.name, row.role === 'banned')}
            className={`text-xs font-medium px-2 py-1 rounded-lg transition ${row.role === 'banned' ? 'text-green-600 hover:bg-green-50' : 'text-orange-500 hover:bg-orange-50'}`}
          >
            {row.role === 'banned' ? 'Unban' : 'Ban'}
          </button>
          <button
            onClick={() => handleDelete(id, row.name)}
            className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Users</h1>
          <p className="text-gray-400 text-sm mt-1">{users.length} registered users</p>
        </div>
        <input
          type="text"
          placeholder="Search users…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 w-56"
        />
      </div>

      {loading ? (
        <div className="bg-white rounded-xl h-64 animate-pulse border border-gray-100" />
      ) : (
        <DataTable columns={columns} data={filtered} emptyMessage="No users found." />
      )}
    </div>
  );
}
