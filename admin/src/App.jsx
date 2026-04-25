import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';

import LoginPage             from './pages/LoginPage';
import DashboardPage         from './pages/DashboardPage';
import UsersPage             from './pages/UsersPage';
import TrailsPage            from './pages/TrailsPage';
import GroupsPage            from './pages/GroupsPage';
import OrganizerRequestsPage from './pages/OrganizerRequestsPage';
import ReportsPage           from './pages/ReportsPage';
import VerificationsPage     from './pages/VerificationsPage';

import SOSAlertsPage         from './pages/SOSAlertsPage';

function ProtectedLayout() {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-white text-lg font-semibold animate-pulse">Loading…</div>
      </div>
    );
  }

  if (!admin) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-50 overflow-auto">
        <Routes>
          <Route path="/"                    element={<DashboardPage />} />
          <Route path="/users"               element={<UsersPage />} />
          <Route path="/trails"              element={<TrailsPage />} />
          <Route path="/groups"              element={<GroupsPage />} />
          <Route path="/organizer-requests"  element={<OrganizerRequestsPage />} />
          <Route path="/reports"             element={<ReportsPage />} />
          <Route path="/verifications"       element={<VerificationsPage />} />
          <Route path="/sos-alerts"          element={<SOSAlertsPage />} />
          <Route path="*"                    element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function AppRoutes() {
  const { admin } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={admin ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/*"     element={<ProtectedLayout />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
