import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/shared/LoadingSpinner';
import AttendancePage from './pages/attendance/AttendancePage';
import LoginPage from './pages/auth/LoginPage';
import CommunicationPage from './pages/communication/CommunicationPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import DonationsPage from './pages/donations/DonationsPage';
import EventsPage from './pages/events/EventsPage';
import GroupsPage from './pages/groups/GroupsPage';
import MemberProfilePage from './pages/members/MemberProfilePage';
import MemberRegistrationPage from './pages/members/MemberRegistrationPage';
import MembersPage from './pages/members/MembersPage';
import ReportsPage from './pages/reports/ReportsPage';
import { authService } from './services/authService';
import { useAuthStore } from './store/authStore';

function ProtectedRoute({ children, allowedRoles }) {
  const { token, user } = useAuthStore();

  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function AuthBootstrap({ children }) {
  const { token, setAuth, logout } = useAuthStore();
  const [checking, setChecking] = useState(Boolean(token));

  useEffect(() => {
    let mounted = true;

    async function verify() {
      if (!token) {
        setChecking(false);
        return;
      }
      try {
        const response = await authService.me();
        if (!mounted) return;
        setAuth(response.data.data, token);
      } catch {
        if (!mounted) return;
        logout();
      } finally {
        if (mounted) setChecking(false);
      }
    }

    verify();
    return () => {
      mounted = false;
    };
  }, [token, setAuth, logout]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <LoadingSpinner label="Verifying session..." />
      </main>
    );
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthBootstrap>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="members/register" element={<MemberRegistrationPage />} />
            <Route path="members/:id" element={<MemberProfilePage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="donations" element={<DonationsPage />} />
            <Route path="groups" element={<GroupsPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="communication" element={<CommunicationPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
        </Routes>
      </AuthBootstrap>
    </BrowserRouter>
  );
}
