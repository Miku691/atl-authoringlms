import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store, type RootState } from './store/store';
import LoginPage from './pages/auth/LoginPage';
import OtpPage from './pages/auth/OtpPage';
import RegisterInstitutePage from './pages/auth/RegisterInstitutePage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import SetupTenantPage from './pages/onboarding/SetupTenantPage';
import CreateTenantPage from './pages/onboarding/CreateTenantPage';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboardHome from './pages/dashboard/admin/AdminDashboardHome';
import RoleManagementPage from './pages/dashboard/admin/RoleManagementPage';
import TenantSettingsPage from './pages/dashboard/admin/TenantSettingsPage';
import StudentManagementPage from './pages/dashboard/admin/users/StudentManagementPage';
import AddStudentPage from './pages/dashboard/admin/people/students/AddStudentPage';

// ... (existing imports)

import StaffManagementPage from './pages/dashboard/admin/users/StaffManagementPage';
import InstructorManagementPage from './pages/dashboard/admin/users/InstructorManagementPage';
import AcademicStructurePage from './pages/dashboard/admin/academics/AcademicStructurePage';
import ComingSoonPage from './pages/common/ComingSoonPage';

// Protected Route Wrapper
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Tenant Setup Check
  if (user?.roles.includes('TENANT_ADMIN')) {
    const isSetupPage = window.location.pathname === '/onboarding/setup-tenant';
    const isCreatePage = window.location.pathname === '/onboarding/create-tenant';

    if (!user.tenantId) {
      if (!isCreatePage) {
        return <Navigate to="/onboarding/create-tenant" replace />;
      }
    } else {
      if (isCreatePage) {
        // If tenant exists, shouldn't be on create page
        return <Navigate to={user.tenantSetupCompleted ? "/dashboard" : "/onboarding/setup-tenant"} replace />;
      }

      if (user.tenantSetupCompleted === false && !isSetupPage) {
        return <Navigate to="/onboarding/setup-tenant" replace />;
      }
      if (user.tenantSetupCompleted === true && isSetupPage) {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  if (allowedRoles && user) {
    const hasRole = user.roles.some(role => allowedRoles.includes(role));
    if (!hasRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/otp" element={<OtpPage />} />
          <Route path="/register-institute" element={<RegisterInstitutePage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Main App Layout */}
          <Route element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'TENANT_ADMIN', 'INSTRUCTOR', 'STUDENT']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<AdminDashboardHome />} />

            {/* Setup */}
            <Route path="/setup" element={<TenantSettingsPage />} />

            {/* Academics */}
            <Route path="/academics/offerings" element={<AcademicStructurePage />} />
            <Route path="/academics/subjects" element={<ComingSoonPage />} />
            <Route path="/academics/syllabus" element={<ComingSoonPage />} />

            {/* People */}
            <Route path="/people/students" element={<StudentManagementPage />} />
            <Route path="/people/students/all" element={<StudentManagementPage />} />
            <Route path="/people/students/add" element={<AddStudentPage />} />
            <Route path="/people/students/enrollments" element={<ComingSoonPage />} />
            <Route path="/people/students/guardians" element={<ComingSoonPage />} />
            <Route path="/people/students/documents" element={<ComingSoonPage />} />
            <Route path="/people/instructors" element={<InstructorManagementPage />} />
            <Route path="/people/staff" element={<StaffManagementPage />} />

            {/* Operations */}
            <Route path="/operations/*" element={<ComingSoonPage />} />

            {/* Finance */}
            <Route path="/finance/*" element={<ComingSoonPage />} />

            {/* LMS */}
            <Route path="/lms/*" element={<ComingSoonPage />} />

            {/* Communication */}
            <Route path="/communication/*" element={<ComingSoonPage />} />

            {/* Reports */}
            <Route path="/reports/*" element={<ComingSoonPage />} />

            {/* System */}
            <Route path="/system/users" element={<StudentManagementPage />} />
            <Route path="/system/roles" element={<RoleManagementPage />} />
            <Route path="/system/audit" element={<ComingSoonPage />} />

            {/* Legacy Admin Redirects */}
            <Route path="/admin/*" element={<Navigate to="/dashboard" replace />} />
          </Route>

          <Route path="/onboarding/create-tenant" element={
            <ProtectedRoute allowedRoles={['TENANT_ADMIN']}>
              <CreateTenantPage />
            </ProtectedRoute>
          } />

          <Route path="/onboarding/setup-tenant" element={
            <ProtectedRoute allowedRoles={['TENANT_ADMIN']}>
              <SetupTenantPage />
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
          <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
