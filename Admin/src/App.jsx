import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'sonner';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminManagement from './pages/AdminManagement';
import DoctorManagement from './pages/DoctorManagement';
import ReceptionistManagement from './pages/ReceptionistManagement';
import Departments from './pages/Departments';
import Appointments from './pages/Appointments';
import Patients from './pages/Patients';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import Support from './pages/Support';
import Announcements from './pages/Announcements';
import SiteUpdates from './pages/SiteUpdates';
import DoctorProfile from './pages/DoctorProfile';
import ReceptionistProfile from './pages/ReceptionistProfile';
import AdminProfile from './pages/AdminProfile';
import SlotManagement from './pages/SlotManagement';
import SlotSettings from './pages/SlotSettings';
import InvoiceTemplate from './pages/InvoiceTemplate';

// Root redirect component
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner-large"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on role
  switch (user.role) {
    case 'Admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'Receptionist':
      return <Navigate to="/receptionist/dashboard" replace />;
    case 'Doctor':
      return <Navigate to="/doctor/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" richColors />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="admin-management" element={<AdminManagement />} />
            <Route path="doctor-management" element={<DoctorManagement />} />
            <Route path="receptionist-management" element={<ReceptionistManagement />} />
            <Route path="departments" element={<Departments />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="patients" element={<Patients />} />
            <Route path="billing" element={<Billing />} />
            <Route path="settings" element={<Settings />} />
            <Route path="support" element={<Support />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="site-updates" element={<SiteUpdates />} />
            <Route path="slot-settings" element={<SlotSettings />} />
            <Route path="invoice-template" element={<InvoiceTemplate />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>

          {/* Receptionist Routes */}
          <Route
            path="/receptionist/*"
            element={
              <ProtectedRoute allowedRoles={['Receptionist']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<ReceptionistDashboard />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="patients" element={<Patients />} />
            <Route path="billing" element={<Billing />} />
            <Route path="slot-management" element={<SlotManagement />} />
            <Route path="profile" element={<ReceptionistProfile />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Doctor Routes */}
          <Route
            path="/doctor/*"
            element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="patients" element={<Patients />} />
            <Route path="profile" element={<DoctorProfile />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

