import { useEffect, useState } from 'react';
import { organizerAPI } from '../services/api';
import DataTable from '../components/DataTable';

export default function OrganizerRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    organizerAPI.getRequests()
      .then((res) => setRequests(res.data))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleReview = async (id, status, name) => {
    const action = status === 'approved' ? 'approve' : 'reject';
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} organizer request from "${name}"?`)) return;
    try {
      await organizerAPI.review(id, status);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch { alert('Failed to update request'); }
  };

  const columns = [
    {
      key: 'name', label: 'Applicant',
      render: (val, row) => (
        <div>
          <p className="font-medium text-gray-800">{val}</p>
          <p className="text-gray-400 text-xs">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'previous_treks', label: 'Treks Done',
      render: (val) => <span className="font-semibold text-primary">{val}</span>,
    },
    {
      key: 'experience', label: 'Experience',
      render: (val) => (
        <p className="text-gray-600 text-xs max-w-xs truncate" title={val}>{val || '—'}</p>
      ),
    },
    {
      key: 'reason', label: 'Reason',
      render: (val) => (
        <p className="text-gray-600 text-xs max-w-xs truncate" title={val}>{val || '—'}</p>
      ),
    },
    {
      key: 'created_at', label: 'Applied',
      render: (val) => val ? new Date(val).toLocaleDateString() : '—',
    },
    {
      key: 'id', label: 'Actions',
      render: (id, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleReview(id, 'approved', row.name)}
            className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primaryLight transition"
          >
            Approve
          </button>
          <button
            onClick={() => handleReview(id, 'rejected', row.name)}
            className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition"
          >
            Reject
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Organizer Requests</h1>
        <p className="text-gray-400 text-sm mt-1">
          {requests.length} pending {requests.length === 1 ? 'request' : 'requests'}
        </p>
      </div>

      {requests.length === 0 && !loading ? (
        <div className="bg-white rounded-xl p-16 text-center border border-gray-100">
          <p className="text-4xl mb-3">✅</p>
          <p className="font-semibold text-gray-600">All caught up!</p>
          <p className="text-gray-400 text-sm mt-1">No pending organizer requests.</p>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-xl h-64 animate-pulse border border-gray-100" />
      ) : (
        <DataTable columns={columns} data={requests} emptyMessage="No pending requests." />
      )}
    </div>
  );
}
