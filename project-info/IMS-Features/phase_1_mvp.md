# Phase 1: MVP (Foundation) - Detailed Tasks

**Goal**: Get a tenant from "Zero" to "Enrolled Students" with basic fee tracking.

---

## 1.A: User Authentication & Role Management

### 1.A.1 Backend (atl-auth-service)
- [ ] **DB Schema**: Ensure `users`, `roles`, `user_roles` tables are optimized.
- [ ] **API**: `POST /auth/login` - Validate creds, return JWT with Claims (userId, tenantId, roles).
- [ ] **API**: `POST /auth/signup` - Create Tenant Admin user + New Tenant placeholder.
- [ ] **API**: `POST /auth/forgot-password` - Generate token, send email link.
- [ ] **Security**: Implement Rate Limiting on these public endpoints (Gateway).

### 1.A.2 Frontend (atl-web-ui)
- [ ] **Page**: `LoginPage.tsx` - Email/Password form, Error handling, Token storage.
- [ ] **Page**: `SignupPage.tsx` - Basic registration form.
- [ ] **Guard**: `RequireAuth.tsx` - Higher Order Component to protect routes.
- [ ] **Context**: `AuthContext.tsx` - Manage user state (user, token, login, logout).

---

## 1.B: Tenant Onboarding Wizard

### 1.B.1 Backend (ims-academic-service / atl-auth-service)
- [ ] **Entity**: `ImsTenant` - Add fields for `institutionType` (SCHOOL/COLLEGE/COACHING), `address`, `logoUrl`.
- [ ] **Entity**: `ImsAcademicYear` - Start Date, End Date, Is Active flag.
- [ ] **API**: `PUT /tenant/profile` - Update profile details.
- [ ] **API**: `POST /academic/year` - Create and activate a session.

### 1.B.2 Frontend (atl-web-ui)
- [ ] **Component**: `OnboardingWizard` - Multi-step form.
    - Step 1: Organization Details.
    - Step 2: Select Type (School / College / Coaching).
    - Step 3: Define Academic Year.
- [ ] **Route**: Redirect to `/setup` if `tenant.isConfigured` is false on login.

---

## 1.C: Academic Structure Configuration

### 1.C.1 Backend (ims-academic-service)
- [ ] **Entity**: `ImsProgram` - The 'Stream' or 'Curriculum' root.
- [ ] **Entity**: `ImsOffering` - The actual Class/Batch (linked to Program + Academic Year).
- [ ] **Entity**: `ImsSubject` - Subject definition.
- [ ] **Logic**: Mapping Subjects to Offerings (with `isOptional` flag).
- [ ] **APIs**: CRUD for Program, Offering, Subject, SubjectMapping.

### 1.C.2 Frontend (atl-web-ui)
- [ ] **Page**: `AcademicStructurePage` - Tree view of Programs -> Offerings.
- [ ] **Modal**: "Add Class/Batch" - Dynamic label based on Institution Type.
- [ ] **Page**: `SubjectMappingPage` - Drag and drop or multi-select interface to assign subjects to class.

---

## 1.D: Student Admission & Enrollment

### 1.D.1 Backend (ims-student-service)
- [ ] **Entity**: `ImsStudent` - Profile data (Name, DOB, Gender, etc.).
- [ ] **Entity**: `ImsGuardian` - Parent data.
- [ ] **Entity**: `ImsEnrollment` - Links Student <-> Offering.
- [ ] **API**: `POST /students/admit` - Transactional: Create Student + Guardian + Enrollment.
- [ ] **Validations**: Check if Offering exists and has capacity (optional).

### 1.D.2 Frontend (atl-web-ui)
- [ ] **Page**: `StudentListPage` - Datatable with filters.
- [ ] **Page**: `AdmissionForm` - Comprehensive form with photo upload.
    - Section 1: Personal Details.
    - Section 2: Guardian Details.
    - Section 3: Academic Selection (Program -> Offering).

---

## 1.E: Basic Manual Fees

### 1.E.1 Backend (ims-finance-service - NEW)
- [ ] **Module Setup**: Create new service `ims-finance-service`.
- [ ] **Entity**: `FeeHead` (Tuition, Exam, etc.), `FeeStructure` (Amount per Offering), `StudentFeeRecord`.
- [ ] **API**: `POST /fees/collect` - Record a manual payment (Cash/Cheque).
- [ ] **API**: `GET /fees/student/{id}` - Get due amount and history.

### 1.E.2 Frontend (atl-web-ui)
- [ ] **Component**: `FeeCollectionModal` - On Student Profile.
- [ ] **Page**: `FeeStructureSetup` - Define fees for each class/batch.
- [ ] **Logic**: Show "Due" vs "Paid" status.
