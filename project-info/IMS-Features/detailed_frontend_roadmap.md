# Frontend Phase 1 Roadmap (Tenant Admin)

**Goal**: Build a "Nice", premium-feel frontend for the implemented backend services, focusing on Tenant Admin workflows.

## Technology Stack
*   **Framework**: React 19 + TypeScript
*   **Styling**: Tailwind CSS (Premium Aesthetic: Glassmorphism, smooth gradients, Lucide Icons)
*   **State**: Redux Toolkit
*   **Routing**: React Router 7

---

## 1. Core Architecture (Foundation)
*   **Layout**: Review `AdminLayout` for sidebar navigation consistency.
*   **API Layer**: Ensure centralized Axios instance handles `tenant-id` header automatically.
*   **Components**: Create reusable premium components:
    *   `GlassCard` (Container)
    *   `StatusBadge`
    *   `PageHeader` (with Breadcrumbs)
    *   `DataTable` (with Sort/Filter/Pagination)

## 2. Academic Module (`/academics`)
### 2.1 Departments
*   **Page**: `/academics/departments`
*   **Features**:
    *   List Departments (Grid/List View).
    *   Create Department Modal.
    *   Link Programs to Departments.

### 2.2 Syllabus & topics
*   **Page**: `/academics/syllabus`
*   **Features**:
    *   Tree view of Subject -> Chapter -> Topic.
    *   "Coverage Tracker" visualizer (Progress bars).

## 3. Student Module (`/people/students`)
### 3.1 Bulk Admission
*   **Page**: `/people/students/bulk`
*   **Features**:
    *   Drag-and-drop Excel/CSV upload area.
    *   Preview Table (Validation status before submit).
    *   "Process" button with real-time progress.

### 3.2 Rich Profile
*   **Page**: `/people/students/:id`
*   **Features**:
    *   Tabs: `Overview`, `Academics`, `Guardians`, `Docs`, `Medical`.
    *   **Docs**: Gallery view of uploaded certificates.
    *   **Guardians**: Card view of linked guardians.

## 4. Instructor Module (`/people/instructors`)
### 4.1 Availability Manager
*   **Page**: `/people/instructors/:id/availability`
*   **Features**:
    *   **Weekly Scheduler**: A visual grid (Mon-Sat, 8am-6pm).
    *   Click-to-toggle slots (Green = Available, Red = Busy).
    *   "Copy to all days" shortcut.

### 4.2 Subject Expertise
*   **Page**: `/people/instructors/:id/subjects`
*   **Features**:
    *   Dual Listbox or Tag Input for assigning subjects.
    *   Dropdown for "Preference Level" (Primary/Secondary).
