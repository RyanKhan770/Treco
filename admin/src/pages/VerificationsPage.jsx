import { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import DataTable from '../components/DataTable';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

const STATUS_COLORS = {
  unverified: 'bg-gray-100 text-gray-500',
  pending:    'bg-amber-100 text-amber-700',
  verified:   'bg-green-100 text-green-700',
  rejected:   'bg-red-100 text-red-600',
};

export default function VerificationsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImg, setPreviewImg] = useState(null);

  const load = () => {
    setLoading(true);
    adminAPI.getUsers()
      .then((res) => {
        const withId = res.data.filter(
          (u) => u.verification_status === 'pending' || u.verification_status === 'verified'
        );
        setUsers(withId);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleVerify = async (id, status, name) => {
    const action = status === 'verified' ? 'verify' : 'reject';
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} identity for "${name}"?`)) return;
    try {
      await adminAPI.verifyUser(id, status);
      setUsers((prev) => prev.map((u) =>
        u.id === id ? { ...u, verification_status: status, is_verified: status === 'verified' } : u
      ));
    } catch { alert('Failed to update verification'); }
  };

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
      key: 'phone', label: 'Phone',
      render: (val) => <span className="text-sm text-gray-600">{val || '—'}</span>,
    },
    {
      key: 'verification_status', label: 'Status',
      render: (val) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[val] || ''}`}>
          {val}
        </span>
      ),
    },
    {
      key: 'gov_id_photo', label: 'Gov ID',
      render: (val) => val ? (
        <button
          onClick={() => setPreviewImg(val.startsWith('http') ? val : `${API_BASE}${val}`)}
          className="text-xs text-primary font-semibold hover:underline"
        >
          📄 View ID
        </button>
      ) : <span className="text-xs text-gray-400">Not uploaded</span>,
    },
    {
      key: 'created_at', label: 'Submitted',
      render: (val) => val ? new Date(val).toLocaleDateString() : '—',
    },
    {
      key: 'id', label: 'Actions',
      render: (id, row) => row.verification_status === 'pending' ? (
        <div className="flex gap-1.5">
          <button onClick={() => handleVerify(id, 'verified', row.name)}
            className="px-2.5 py-1 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primaryLight transition">
            Verify
          </button>
          <button onClick={() => handleVerify(id, 'rejected', row.name)}
            className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition">
            Reject
          </button>
        </div>
      ) : (
        <span className={`text-xs font-medium ${row.is_verified ? 'text-green-600' : 'text-gray-400'}`}>
          {row.is_verified ? '✅ Verified' : 'Rejected'}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Identity Verifications</h1>
        <p className="text-gray-400 text-sm mt-1">
          Review government ID submissions from users
        </p>
      </div>

      {users.length === 0 && !loading ? (
        <div className="bg-white rounded-xl p-16 text-center border border-gray-100">
          <p className="text-4xl mb-3">✅</p>
          <p className="font-semibold text-gray-600">All clear!</p>
          <p className="text-gray-400 text-sm mt-1">No pending verifications.</p>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-xl h-64 animate-pulse border border-gray-100" />
      ) : (
        <DataTable columns={columns} data={users} emptyMessage="No verifications found." />
      )}

      {/* Gov ID preview modal */}
      {previewImg && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6"
          onClick={() => setPreviewImg(null)}
        >
          <div className="bg-white rounded-2xl p-4 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700 text-sm">Government ID Preview</h3>
              <button
                onClick={() => setPreviewImg(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <img
              src={previewImg}
              alt="Government ID"
              className="w-full rounded-lg border border-gray-200"
              onError={(e) => { e.target.src = ''; e.target.alt = 'Failed to load image'; }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
