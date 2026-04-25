import { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import DataTable from '../components/DataTable';

const STATUS_COLORS = {
  open:   'bg-green-100 text-green-700',
  full:   'bg-amber-100 text-amber-700',
  closed: 'bg-gray-100 text-gray-600',
};

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    adminAPI.getGroups()
      .then((res) => setGroups(res.data))
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleClose = async (id, name) => {
    if (!window.confirm(`Close group "${name}"? Members will no longer be able to join.`)) return;
    try {
      await adminAPI.closeGroup(id);
      setGroups((prev) => prev.map((g) => g.id === id ? { ...g, status: 'closed' } : g));
    } catch { alert('Failed to close group'); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently delete group "${name}"? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteGroup(id);
      setGroups((prev) => prev.filter((g) => g.id !== id));
    } catch { alert('Failed to delete group'); }
  };

  const filtered = groups.filter((g) =>
    g.name?.toLowerCase().includes(search.toLowerCase()) ||
    g.trail_name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'name', label: 'Group',
      render: (val, row) => (
        <div>
          <p className="font-medium text-gray-800">{val}</p>
          <p className="text-gray-400 text-xs">{row.trail_name || 'No trail'}</p>
        </div>
      ),
    },
    {
      key: 'leader_name', label: 'Organizer',
      render: (val) => <span className="text-sm text-gray-700">{val || '—'}</span>,
    },
    {
      key: 'current_members', label: 'Members',
      render: (val, row) => (
        <span className="text-sm">{val} / {row.max_members}</span>
      ),
    },
    {
      key: 'start_date', label: 'Start Date',
      render: (val) => val ? new Date(val).toLocaleDateString() : '—',
    },
    {
      key: 'status', label: 'Status',
      render: (val) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[val] || STATUS_COLORS.open}`}>
          {val}
        </span>
      ),
    },
    {
      key: 'budget_estimate', label: 'Budget (NPR)',
      render: (val) => val ? `NPR ${Number(val).toLocaleString()}` : '—',
    },
    {
      key: 'id', label: 'Actions',
      render: (id, row) => (
        <div className="flex gap-2">
          {row.status !== 'closed' && (
            <button
              onClick={() => handleClose(id, row.name)}
              className="text-xs text-amber-600 hover:text-amber-800 font-medium px-2 py-1 rounded-lg hover:bg-amber-50 transition"
            >
              Close
            </button>
          )}
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
          <h1 className="text-2xl font-bold text-gray-800">Groups</h1>
          <p className="text-gray-400 text-sm mt-1">{groups.length} total groups</p>
        </div>
        <input
          type="text"
          placeholder="Search groups…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 w-56"
        />
      </div>

      {loading ? (
        <div className="bg-white rounded-xl h-64 animate-pulse border border-gray-100" />
      ) : (
        <DataTable columns={columns} data={filtered} emptyMessage="No groups found." />
      )}
    </div>
  );
}
