import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import SearchTechnicians from '../features/technicians/pages/SearchTechnicians';
import NotFound from '../pages/NotFound';
import Unauthorized from '../pages/Unauthorized';
import ProtectedRoute from './ProtectedRoute';
import RoleBasedRoute from './RoleBasedRoute';
import UserLayout from '../layouts/UserLayout';
import UserDashboard from '../features/profile/pages/UserDashboard';
import Favorites from '../features/profile/pages/Favorites';
import MyBookings from '../features/bookings/pages/MyBookings';
import TechnicianLayout from '../layouts/TechnicianLayout';
import TechnicianDashboard from '../features/technicians/pages/TechnicianDashboard';
import TechnicianOnboarding from '../features/technicians/pages/TechnicianOnboarding';
import TechnicianProfile from '../features/technicians/pages/TechnicianProfile';
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboard from '../features/admin/pages/AdminDashboard';
import AccountSettings from '../pages/AccountSettings';
import TechnicianBookings from '../features/technicians/pages/TechnicianBookings';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route path="/technician/:id" element={<TechnicianProfile />} />
      <Route path="/technicians" element={<SearchTechnicians />} />

      {/* Protected Customer Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['user']}>
              <UserLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<UserDashboard />} />
        <Route path="bookings" element={<MyBookings />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="settings" element={<AccountSettings />} />
      </Route>

      {/* Protected Technician Routes */}
      <Route 
        path="/technician" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['technician']}>
              <TechnicianLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<TechnicianDashboard />} />
        <Route path="bookings" element={<TechnicianBookings />} />
        <Route path="onboarding" element={<TechnicianOnboarding />} />
        <Route path="settings" element={<AccountSettings />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
