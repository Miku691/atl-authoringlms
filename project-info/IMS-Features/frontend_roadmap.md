# Frontend Implementation Roadmap (Parallel Track)

This document defines the **Frontend Work Packet** for the IMS system.
**Target Audience**: Frontend AI Agent / Developer.
**Goal**: Build a responsive, role-based UI that consumes the Backend APIs.

**Tech Stack**: React, TypeScript, React Query, Tailwind/CSS.

---

## Phase 1: Foundation UI

### 1.1 Shell & Auth
- [ ] **1.1.1**: **App Shell**: Sidebar, Topbar, Tenant Logo area.
- [ ] **1.1.2**: **Login Flow**: Consusmes `POST /auth/login`. Stores JWT in HttpOnly (or JS memory).
- [ ] **1.1.3**: **Tenant Resolver**: Read subdomain/URL to fetch Tenant specific Config (`GET /public/tenant`).

### 1.2 Onboarding Wizards
- [ ] **1.2.1**: **Setup Wizard**: Multi-step form for configuring the Tenant.
    - POST to `configuration-service` and `academic-service`.

---

## Phase 2: Academic UI

### 2.1 Structure Management
- [ ] **2.1.1**: **Program Manager**: Tree view of Programs -> Sessions.
- [ ] **2.1.2**: **Class Creator**: Modal to create Offerings (Class/Batch).
    - Needs `GET /api/v1/programs` to populate dropdowns.

---

## Phase 3: Student Admission UI

### 3.1 Admission Form
- [ ] **3.1.1**: **Complex Form**:
    - Tab 1: Personal Details.
    - Tab 2: Guardian Details.
    - Tab 3: Enrollment (Select Class/Batch).
- [ ] **3.1.2**: **Search**: Student Search Bar (Server-side filtering).

---

## Phase 4: Operations UI

### 4.1 Attendance Dashboard
- [ ] **4.1.1**: **Marking View**: Grid layout.
    - Columns: Student Name, Roll No, [P/A/L] Toggles.
    - Fetch list from `student-service` (by Offering).
    - Submit to `attendance-service`.

### 4.2 Communications
- [ ] **4.2.1**: **Notice Board**: WYSIWYG Editor to post notices.

---

## Phase 5: Finance & Library UI

### 5.1 Fee Counter
- [ ] **5.1.1**: **Student Ledger View**: Show Total Due, Paid, Balance.
- [ ] **5.1.2**: **Payment Modal**: Record offline payment.

### 5.2 Library Catalog
- [ ] **5.2.1**: Search and Issue Book interface.

---

## Phase 6: LMS UI

### 6.1 Classroom View
- [ ] **6.1.1**: **Student View**: List of subjects -> List of notes/videos.
- [ ] **6.1.2**: **Teacher View**: Upload Interface.
