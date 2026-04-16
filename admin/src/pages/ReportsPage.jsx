import { useEffect, useState } from 'react';
import { reportsAPI } from '../services/api';
import DataTable from '../components/DataTable';

const STATUS_COLORS = {
  pending:    'bg-amber-100 text-amber-700',
  reviewed:   'bg-blue-100 text-blue-700',
  resolved:   'bg-green-100 text-green-700',
  dismissed:  'bg-gray-100 text-gray-500',
};

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const load = () => {
    setLoading(true);
    reportsAPI.getAll()
      .then((res) => setReports(res.data))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAction = async (id, status) => {
    try {
      await reportsAPI.update(id, status);
      setReports((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    } catch { alert('Failed to update report'); }
  };

  const filtered = reports.filter((r) => filter === 'all' || r.status === filter);

  const columns = [
    {
      key: 'reporter_name', label: 'Reporter',
      render: (val) => <span className="font-medium text-gray-800 text-sm">{val}</span>,
    },
    {
      key: 'reported_name', label: 'Reported User',
      render: (val) => <span className="text-gray-600 text-sm">{val || '—'}</span>,
    },
    {
      key: 'reason', label: 'Reason',
      render: (val) => <span className="text-sm text-gray-700 capitalize">{val?.replace(/_/g, ' ')}</span>,
    },
    {
      key: 'description', label: 'Details',
      render: (val) => (
        <p className="text-xs text-gray-500 max-w-xs truncate" title={val}>{val || '—'}</p>
      ),
    },
    {
      key: 'status', label: 'Status',
      render: (val) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[val] || ''}`}>
          {val}
        </span>
      ),
    },
    {
      key: 'created_at', label: 'Date',
      render: (val) => val ? new Date(val).toLocaleDateString() : '—',
    },
    {
      key: 'id', label: 'Actions',
      render: (id, row) => row.status === 'pending' ? (
        <div className="flex gap-1.5">
          <button onClick={() => handleAction(id, 'resolved')}
            className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-lg hover:bg-green-100 transition">
            Resolve
          </button>
          <button onClick={() => handleAction(id, 'dismissed')}
            className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-100 transition">
            Dismiss
          </button>
        </div>
      ) : (
        <span className="text-gray-300 text-xs">Done</span>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <p className="text-gray-400 text-sm mt-1">User-submitted reports and moderation</p>
        </div>
        <div className="flex gap-2">
          {['pending', 'resolved', 'dismissed', 'all'].map((s) => (
            <button key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                filter === s ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl h-64 animate-pulse border border-gray-100" />
      ) : (
        <DataTable columns={columns} data={filtered} emptyMessage="No reports in this category." />
      )}
    </div>
  );
}
