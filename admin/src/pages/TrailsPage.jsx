import { useEffect, useState } from 'react';
import { trailsAPI } from '../services/api';
import DataTable from '../components/DataTable';

const DIFF_COLORS = {
  easy:        'bg-green-100 text-green-700',
  moderate:    'bg-yellow-100 text-yellow-700',
  hard:        'bg-orange-100 text-orange-700',
  challenging: 'bg-red-100 text-red-700',
};

const EMPTY_FORM = {
  name: '', description: '', difficulty: 'moderate',
  distance_km: '', duration_days: '', elevation_gain_m: '',
  max_altitude_m: '', location_name: '', region: '',
  permit_required: false, best_season: '', tea_houses_available: false,
};

export default function TrailsPage() {
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState('All');

  const load = () => {
    setLoading(true);
    trailsAPI.getAll()
      .then((res) => setTrails(res.data))
      .catch(() => setTrails([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = trails.filter((t) => {
    const matchSearch = !search ||
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.location_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.region?.toLowerCase().includes(search.toLowerCase());
    const matchDiff = diffFilter === 'All' || t.difficulty === diffFilter.toLowerCase();
    return matchSearch && matchDiff;
  });

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deactivate trail "${name}"?`)) return;
    try {
      await trailsAPI.delete(id);
      setTrails((prev) => prev.filter((t) => t.id !== id));
    } catch { alert('Failed to delete trail'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await trailsAPI.create({
        ...form,
        distance_km: parseFloat(form.distance_km),
        duration_days: parseInt(form.duration_days),
        elevation_gain_m: parseInt(form.elevation_gain_m),
        max_altitude_m: parseInt(form.max_altitude_m),
      });
      setTrails((prev) => [res.data, ...prev]);
      setShowModal(false);
      setForm(EMPTY_FORM);
    } catch { alert('Failed to create trail'); }
    finally { setSaving(false); }
  };

  const columns = [
    {
      key: 'name', label: 'Trail',
      render: (val, row) => (
        <div>
          <p className="font-medium text-gray-800">{val}</p>
          <p className="text-gray-400 text-xs">{row.region} · {row.location_name}</p>
        </div>
      ),
    },
    {
      key: 'difficulty', label: 'Difficulty',
      render: (val) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${DIFF_COLORS[val] || ''}`}>
          {val}
        </span>
      ),
    },
    { key: 'duration_days', label: 'Days' },
    { key: 'distance_km',  label: 'Distance (km)' },
    {
      key: 'permit_required', label: 'Permit',
      render: (val) => <span className={val ? 'text-amber-600 text-xs font-medium' : 'text-gray-400 text-xs'}>{val ? 'Required' : 'No'}</span>,
    },
    {
      key: 'id', label: 'Actions',
      render: (id, row) => (
        <button
          onClick={() => handleDelete(id, row.name)}
          className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition"
        >
          Deactivate
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Trails</h1>
          <p className="text-gray-400 text-sm mt-1">{filtered.length} of {trails.length} trails</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primaryLight transition"
        >
          + Add Trail
        </button>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          placeholder="Search by name, location, or region…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <select
          value={diffFilter}
          onChange={(e) => setDiffFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none"
        >
          {['All', 'Easy', 'Moderate', 'Hard', 'Challenging'].map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl h-64 animate-pulse border border-gray-100" />
      ) : (
        <DataTable columns={columns} data={filtered} emptyMessage="No trails match your search." />
      )}

      {/* Add Trail Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Add New Trail</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {[
                { label: 'Trail Name', key: 'name', type: 'text', required: true },
                { label: 'Location', key: 'location_name', type: 'text' },
                { label: 'Region', key: 'region', type: 'text' },
                { label: 'Duration (days)', key: 'duration_days', type: 'number' },
                { label: 'Distance (km)', key: 'distance_km', type: 'number' },
                { label: 'Elevation Gain (m)', key: 'elevation_gain_m', type: 'number' },
                { label: 'Max Altitude (m)', key: 'max_altitude_m', type: 'number' },
                { label: 'Best Season', key: 'best_season', type: 'text' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    required={f.required}
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
                >
                  {['easy', 'moderate', 'hard', 'challenging'].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none resize-none"
                />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={form.permit_required}
                    onChange={(e) => setForm({ ...form, permit_required: e.target.checked })} />
                  Permit Required
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={form.tea_houses_available}
                    onChange={(e) => setForm({ ...form, tea_houses_available: e.target.checked })} />
                  Tea Houses
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primaryLight disabled:opacity-60">
                  {saving ? 'Saving…' : 'Add Trail'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
