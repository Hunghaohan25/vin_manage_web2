import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/DashboardLayout';
import LoginPage from './pages/LoginPage';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import AttendancePage from './pages/employee/AttendancePage';
import LeaveRequestPage from './pages/employee/LeaveRequestPage';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import TeamAttendancePage from './pages/manager/TeamAttendancePage';
import LeaveApprovalPage from './pages/manager/LeaveApprovalPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function DashboardRedirect() {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role === 'admin' || currentUser.role === 'manager') return <DashboardRedirectByRole />;
  return <EmployeeDashboard />;
}

function DashboardRedirectByRole() {
  const { currentUser } = useAuth();
  if (currentUser?.role === 'admin') return <AdminDashboard />;
  if (currentUser?.role === 'manager') return <ManagerDashboard />;
  return <EmployeeDashboard />;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950">
      <div className="text-center">
        <Loader2 size={36} className="animate-spin text-primary-500 mx-auto mb-4" />
        <p className="text-surface-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardRedirect />} />
            {/* Employee */}
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/leave" element={<LeaveRequestPage />} />
            {/* Manager */}
            <Route path="/team-attendance" element={<TeamAttendancePage />} />
            <Route path="/leave-approval" element={<LeaveApprovalPage />} />
            {/* Manager & Admin */}
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/settings" element={<AdminSettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
