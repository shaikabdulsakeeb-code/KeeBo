import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import SearchTechnicians from '../features/technicians/pages/SearchTechnicians';
import NotFound from '../pages/NotFound';
import Unauthorized from '../pages/Unauthorized';
import ProtectedRoute from './ProtectedRoute';
import RoleBasedRoute from './RoleBasedRoute';
import NonAdminRoute from './NonAdminRoute';
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
import AdminTechnicians from '../features/admin/pages/AdminTechnicians';
import AdminTechnicianDetail from '../features/admin/pages/AdminTechnicianDetail';
import AdminApprovals from '../features/admin/pages/AdminApprovals';
import AdminApprovalReview from '../features/admin/pages/AdminApprovalReview';
import AdminUsers from '../features/admin/pages/AdminUsers';
import AdminBookings from '../features/admin/pages/AdminBookings';
import AdminSettings from '../features/admin/pages/AdminSettings';
import AccountSettings from '../pages/AccountSettings';
import AdminReviews from '../features/admin/pages/AdminReviews';
import TechnicianBookings from '../features/technicians/pages/TechnicianBookings';
import TechnicianReviews from '../features/technicians/pages/TechnicianReviews';
import AboutUs from '../pages/AboutUs';
import ContactUs from '../pages/ContactUs';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes - Restricted for Admin */}
      <Route path="/" element={<NonAdminRoute><LandingPage /></NonAdminRoute>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/about" element={<NonAdminRoute><AboutUs /></NonAdminRoute>} />
      <Route path="/contact" element={<NonAdminRoute><ContactUs /></NonAdminRoute>} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route path="/technician/:id" element={<NonAdminRoute><TechnicianProfile /></NonAdminRoute>} />
      <Route 
        path="/technicians" 
        element={
          <ProtectedRoute>
            <NonAdminRoute>
              <RoleBasedRoute allowedRoles={['user']}>
                <SearchTechnicians />
              </RoleBasedRoute>
            </NonAdminRoute>
          </ProtectedRoute>
        } 
      />

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
        <Route path="reviews" element={<TechnicianReviews />} />
        <Route path="settings" element={<AccountSettings />} />
        <Route path="profile-management" element={<TechnicianOnboarding />} />
      </Route>

      <Route 
        path="/technician/onboarding" 
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['technician']}>
              <TechnicianOnboarding />
            </RoleBasedRoute>
          </ProtectedRoute>
        } 
      />

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
        <Route path="technicians" element={<AdminTechnicians />} />
        <Route path="technicians/:id" element={<AdminTechnicianDetail />} />
        <Route path="approvals" element={<AdminApprovals />} />
        <Route path="approvals/:id" element={<AdminApprovalReview />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
