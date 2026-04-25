import { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';

export default function SOSAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sos/alerts');
      setAlerts(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch SOS alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Auto-refresh every 10 seconds for critical safety feature
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = async (id) => {
    if (!window.confirm('Are you sure this emergency has been resolved?')) return;
    try {
      await api.put(`/sos/alerts/${id}/resolve`);
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to resolve SOS alert');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-8">
        <PageHeader 
          title="SOS Alerts" 
          subtitle="Live emergency distress signals from trekkers in the field."
        />
        <button 
          onClick={fetchAlerts}
          className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading && alerts.length === 0 ? (
        <div className="flex justify-center p-12"><div className="animate-pulse text-gray-400">Loading alerts...</div></div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-500" size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">All Clear</h3>
          <p className="text-gray-500 mt-2">There are no active SOS alerts at this time.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-white rounded-xl shadow-sm border-2 border-red-500 overflow-hidden">
              <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                    <AlertTriangle className="text-red-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-900 text-lg">EMERGENCY SOS</h3>
                    <p className="text-red-700 text-sm font-medium">Triggered at {new Date(alert.triggered_at).toLocaleString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleResolve(alert.id)}
                  className="bg-red-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors shadow-sm"
                >
                  Mark as Resolved
                </button>
              </div>
              <div className="p-6 flex items-start gap-6">
                {alert.profile_photo ? (
                  <img src={alert.profile_photo.startsWith('http') ? alert.profile_photo : `http://localhost:5000${alert.profile_photo}`} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-red-200" />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-xl border-2 border-red-200">
                    {alert.user_name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900">{alert.user_name}</h4>
                  <p className="text-gray-500 text-sm mb-4">User ID: {alert.user_id}</p>
                  
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 inline-block">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={16} className="text-gray-500" />
                      <span className="font-semibold text-gray-700">Last Known Location</span>
                    </div>
                    <div className="text-lg font-mono text-gray-900 bg-white px-3 py-2 rounded border border-gray-200 mb-3">
                      {alert.last_latitude}, {alert.last_longitude}
                    </div>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${alert.last_latitude},${alert.last_longitude}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
                    >
                      Open in Google Maps <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
