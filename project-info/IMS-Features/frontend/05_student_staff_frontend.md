# 05 Student & Staff Frontend Plan

**Corresponding Backend**: `ims-student-service`, `ims-staff-service`
**Scope**: CRM, Profiles
**Priority**: P1

---

## 1. UI Components
- [ ] **Admission Form (Wizard)**:
    - **Step 1: Bio**: Name, DOB, Photo (Image Cropper).
    - **Step 2: Guardian**: Search-as-you-type to find existing parents.
    - **Step 3: Academic**: Linked Dropdowns (Program -> Session -> Offering).
- [ ] **Student Profile Card**:
    - Tabs: Overview, Attendance, Fees, Exam Results, Documents.
    - "Quick Actions": Call Parent, Send ID Card.
- [ ] **Staff Directory**:
    - Grid/List Toggle.
    - Filter Sidebar (Department, Role).

## 2. State & Logic
- [ ] **Form State**:
    - Use `react-hook-form` + `zod` for validation.
    - Persist draft in `localStorage` if user navigates away.
- [ ] **Search**:
    - Debounced Search Input for Student List.

---

## 3. Integration Plan
- **Submit Admission**: `POST /api/v1/admissions`.
- **Search Students**: `GET /api/v1/students?search=...`.
- **Upload Photo**: `POST /documents/upload` -> Get URL -> Send in Admission JSON.
