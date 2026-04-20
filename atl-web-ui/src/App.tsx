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
import ForcePasswordResetPage from './pages/auth/ForcePasswordResetPage';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboardHome from './pages/dashboard/admin/AdminDashboardHome';
import RoleManagementPage from './pages/dashboard/admin/RoleManagementPage';
import TenantSettingsPage from './pages/dashboard/admin/TenantSettingsPage';
import StudentManagementPage from './pages/dashboard/admin/users/StudentManagementPage';
import AddStudentPage from './pages/dashboard/admin/people/students/AddStudentPage';
import BulkAdmissionPage from './pages/dashboard/admin/people/students/BulkAdmissionPage';
import StudentProfilePage from './pages/dashboard/admin/people/students/StudentProfilePage';
import AttendanceMarkingPage from './pages/dashboard/admin/operations/AttendanceMarkingPage';
import GuardianManagementPage from './pages/dashboard/admin/people/guardians/GuardianManagementPage';
import AddInstructorPage from './pages/dashboard/admin/people/instructors/AddInstructorPage';
import AddStaffPage from './pages/dashboard/admin/users/AddStaffPage';
import FeeConfigPage from './pages/dashboard/admin/finance/FeeConfigPage';
import FeeStructurePage from './pages/dashboard/admin/finance/FeeStructurePage';
import InstallmentPlansPage from './pages/dashboard/admin/finance/InstallmentPlansPage';
import StudentLedgerPage from './pages/dashboard/admin/finance/StudentLedgerPage';
import CollectionDeskPage from './pages/dashboard/admin/finance/CollectionDeskPage';
import { DefaultersPage } from './pages/dashboard/admin/finance/DefaultersPage';
import { ExpenseEntryPage } from './pages/dashboard/admin/finance/ExpenseEntryPage';
import { ExpenseCategoryPage } from './pages/dashboard/admin/finance/ExpenseCategoryPage';
import { BudgetPage } from './pages/dashboard/admin/finance/BudgetPage';
import { BudgetReportPage } from './pages/dashboard/admin/finance/BudgetReportPage';
import { FinancialReportsPage } from './pages/dashboard/admin/finance/FinancialReportsPage';
import FinanceDashboardPage from './pages/dashboard/admin/finance/FinanceDashboardPage';
import LateFeeRulesPage from './pages/dashboard/admin/finance/LateFeeRulesPage';
import ConcessionWorkflowPage from './pages/dashboard/admin/finance/ConcessionWorkflowPage';
import InventoryDashboardPage from './pages/dashboard/admin/inventory/InventoryDashboardPage';
import StockManagementPage from './pages/dashboard/admin/inventory/StockManagementPage';
import AssetRegisterPage from './pages/dashboard/admin/inventory/AssetRegisterPage';
import SupplierManagementPage from './pages/dashboard/admin/inventory/SupplierManagementPage';
import FeeAllocationPage from './pages/dashboard/admin/system/FeeAllocationPage';
import { CurrencyProvider } from './context/CurrencyContext';
import FeeHeadManagementPage from './pages/dashboard/admin/finance/FeeHeadManagementPage';
import SetupMasterPage from './pages/dashboard/admin/system/SetupMasterPage';

import StaffManagementPage from './pages/dashboard/admin/users/StaffManagementPage';
import InstructorManagementPage from './pages/dashboard/admin/people/instructors/InstructorManagementPage';
import InstructorAvailabilityPage from './pages/dashboard/admin/people/instructors/InstructorAvailabilityPage';
import InstructorSubjectsPage from './pages/dashboard/admin/people/instructors/InstructorSubjectsPage';
import InstructorProfilePage from './pages/dashboard/admin/people/instructors/InstructorProfilePage';
import AcademicStructurePage from './pages/dashboard/admin/academics/AcademicStructurePage';
import DepartmentManagementPage from './pages/dashboard/admin/academics/DepartmentManagementPage';
import SyllabusTrackingPage from './pages/dashboard/admin/academics/SyllabusTrackingPage';
import SubjectManagementPage from './pages/dashboard/admin/academics/SubjectManagementPage';
import TimetableManagementPage from './pages/dashboard/admin/academics/TimetableManagementPage';
import GradingConfigPage from './pages/dashboard/admin/academics/GradingConfigPage';
import SessionManagementPage from './pages/dashboard/admin/academics/SessionManagementPage';
import PromotionCenterPage from './pages/dashboard/admin/academics/PromotionCenterPage';
import { ReportsDashboardPage } from './pages/dashboard/admin/reports/ReportsDashboardPage';
import InvoiceTemplatePage from './pages/dashboard/admin/templates/InvoiceTemplatePage';
import ComingSoonPage from './pages/common/ComingSoonPage';
import InstituteCalendarPage from './pages/dashboard/common/InstituteCalendarPage';
import StudentDashboardHome from './pages/dashboard/student/StudentDashboardHome';
import PlatformDashboardHome from './pages/dashboard/platform/PlatformDashboardHome';
import DemoLeadsPage from './pages/dashboard/platform/DemoLeadsPage';
import MyProfilePage from './pages/dashboard/student/MyProfilePage';
import MyAcademicsPage from './pages/dashboard/student/MyAcademicsPage';
import MyTimetablePage from './pages/dashboard/student/MyTimetablePage';
import MySyllabusPage from './pages/dashboard/student/MySyllabusPage';
import MyAttendancePage from './pages/dashboard/student/MyAttendancePage';
import MyAssignmentsPage from './pages/dashboard/student/MyAssignmentsPage';
import MyFinancePage from './pages/dashboard/student/MyFinancePage';
import WardFinancePage from './pages/dashboard/guardian/WardFinancePage';
import AssignmentManagementPage from './pages/dashboard/admin/operations/AssignmentManagementPage';
import AnnouncementManagementPage from './pages/dashboard/admin/communication/AnnouncementManagementPage';
import TeacherDashboard from './pages/dashboard/teacher/TeacherDashboard';
import InstructorClassHubPage from './pages/dashboard/teacher/InstructorClassHubPage';
import ExamManagementPage from './pages/dashboard/teacher/ExamManagementPage';
import InstructorGradebook from './pages/dashboard/teacher/InstructorGradebook';
import MyResultsPage from './pages/dashboard/student/MyResultsPage';
import LeaveRequestPage from './pages/dashboard/student/LeaveRequestPage';

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
    const hasRole = user.roles.some((role: string) => allowedRoles.includes(role));
    if (!hasRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

const DashboardWrapper = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  if (user?.roles.includes('SUPER_ADMIN')) {
    return <PlatformDashboardHome />;
  }
  if (user?.roles.includes('STUDENT')) {
    return <StudentDashboardHome />;
  }
  if (user?.roles.includes('GUARDIAN') || user?.roles.includes('PARENT')) {
    return <WardFinancePage />; // Temp: show finance page as dashboard for guardians
  }
  if (user?.roles.includes('INSTRUCTOR')) {
    return <TeacherDashboard />;
  }
  return <AdminDashboardHome />;
};

import LandingPage from './public/LandingPage';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <CurrencyProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/otp" element={<OtpPage />} />
            <Route path="/register-institute" element={<RegisterInstitutePage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ForcePasswordResetPage />} />

            {/* Protected Main App Layout */}
            <Route element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'TENANT_ADMIN', 'INSTRUCTOR', 'STUDENT', 'GUARDIAN', 'PARENT']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route path="/dashboard" element={<DashboardWrapper />} />
              <Route path="/operations/calendar" element={<InstituteCalendarPage />} />

              {/* Student Routes */}
              <Route path="/student/profile" element={<MyProfilePage />} />
              <Route path="/student/academics" element={<MyAcademicsPage />} />
              <Route path="/student/timetable" element={<MyTimetablePage />} />
              <Route path="/student/syllabus" element={<MySyllabusPage />} />
              <Route path="/student/attendance" element={<MyAttendancePage />} />
              <Route path="/student/assignments" element={<MyAssignmentsPage />} />
              <Route path="/student/finance" element={<MyFinancePage />} />
              <Route path="/student/results" element={<MyResultsPage />} />
              <Route path="/student/leaves" element={<LeaveRequestPage />} />

              {/* Guardian Routes */}
              <Route path="/guardian/finance" element={<WardFinancePage />} />

              {/* Setup */}
              <Route path="/setup" element={<TenantSettingsPage />} />

              {/* Academics */}
              <Route path="/academics/sessions" element={<SessionManagementPage />} />
              <Route path="/academics/offerings" element={<AcademicStructurePage />} />
              <Route path="/academics/promotion" element={<PromotionCenterPage />} />
              <Route path="/academics/departments" element={<DepartmentManagementPage />} />
              <Route path="/academics/subjects" element={<SubjectManagementPage />} />
              <Route path="/academics/syllabus" element={<SyllabusTrackingPage />} />
              <Route path="/academics/timetable" element={<TimetableManagementPage />} />
              <Route path="/academics/grading" element={<GradingConfigPage />} />

              {/* People */}
              <Route path="/people/students" element={<StudentManagementPage />} />
              <Route path="/people/students/all" element={<StudentManagementPage />} />
              <Route path="/people/students/add" element={<AddStudentPage />} />
              <Route path="/people/students/bulk" element={<BulkAdmissionPage />} />
              <Route path="/people/students/:id" element={<StudentProfilePage />} />
              <Route path="/people/students/guardians" element={<GuardianManagementPage />} />
              <Route path="/people/students/reports" element={<ComingSoonPage />} />
              <Route path="/people/instructors" element={<InstructorManagementPage />} />
              <Route path="/people/instructors/all" element={<InstructorManagementPage />} />
              <Route path="/people/instructors/add" element={<AddInstructorPage />} />
              <Route path="/people/instructors/reports" element={<ComingSoonPage />} />
              <Route path="/people/instructors/:id/availability" element={<InstructorAvailabilityPage />} />
              <Route path="/people/instructors/:id/subjects" element={<InstructorSubjectsPage />} />
              <Route path="/people/instructors/:id" element={<InstructorProfilePage />} />
              <Route path="/instructor/class/:offeringId" element={<InstructorClassHubPage />} />
              <Route path="/teacher/exams" element={<ExamManagementPage />} />
              <Route path="/instructor/gradebook" element={<InstructorGradebook />} />
              <Route path="/people/staff" element={<StaffManagementPage />} />
              <Route path="/people/staff/all" element={<StaffManagementPage />} />
              <Route path="/people/staff/add" element={<AddStaffPage />} />
              <Route path="/people/staff/reports" element={<ComingSoonPage />} />

              {/* Operations */}
              <Route path="/operations/attendance" element={<AttendanceMarkingPage />} />
              <Route path="/operations/*" element={<ComingSoonPage />} />

              {/* Finance */}
              <Route path="/finance/dashboard" element={<FinanceDashboardPage />} />
              <Route path="/finance/late-fee-rules" element={<LateFeeRulesPage />} />
              <Route path="/finance/concessions" element={<ConcessionWorkflowPage />} />
              <Route path="/finance/fee-heads" element={<FeeHeadManagementPage />} />
              <Route path="/finance/config" element={<FeeConfigPage />} />
              <Route path="/finance/structure" element={<FeeStructurePage />} />
              <Route path="/finance/installment-plans" element={<InstallmentPlansPage />} />
              <Route path="/finance/ledger" element={<StudentLedgerPage />} />
              <Route path="/finance/collection-desk" element={<CollectionDeskPage />} />
              <Route path="/finance/defaulters" element={<DefaultersPage />} />
              <Route path="/finance/expenses" element={<ExpenseEntryPage />} />
              <Route path="/finance/expense-categories" element={<ExpenseCategoryPage />} />
              <Route path="/finance/budgets" element={<BudgetPage />} />
              <Route path="/finance/budget-analysis" element={<BudgetReportPage />} />
              <Route path="/finance/reports" element={<FinancialReportsPage />} />
              <Route path="/finance/*" element={<ComingSoonPage />} />

              {/* Inventory & Assets */}
              <Route path="/inventory/dashboard" element={<InventoryDashboardPage />} />
              <Route path="/inventory/stock" element={<StockManagementPage />} />
              <Route path="/inventory/assets" element={<AssetRegisterPage />} />
              <Route path="/inventory/suppliers" element={<SupplierManagementPage />} />
              <Route path="/inventory/*" element={<ComingSoonPage />} />

              {/* Communication */}
              <Route path="/communication/announcements" element={<AnnouncementManagementPage />} />
              <Route path="/communication/*" element={<ComingSoonPage />} />

              {/* Reports */}
              <Route path="/reports/*" element={<ReportsDashboardPage />} />

              {/* LMS */}
              <Route path="/lms/assignments" element={<AssignmentManagementPage />} />
              <Route path="/lms/*" element={<ComingSoonPage />} />

              {/* System */}
              <Route path="/platform/leads" element={<DemoLeadsPage />} />
              <Route path="/system/templates/invoice" element={<InvoiceTemplatePage />} />
              <Route path="/system/setup-master" element={<SetupMasterPage />} />
              <Route path="/system/users" element={<StudentManagementPage />} />
              <Route path="/system/roles" element={<RoleManagementPage />} />
              <Route path="/system/fee-allocation" element={<FeeAllocationPage />} />
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


            <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
            <Route path="*" element={<div>Page Not Found</div>} />
          </Routes>
        </Router>
      </CurrencyProvider>
    </Provider>
  );
};

export default App;
