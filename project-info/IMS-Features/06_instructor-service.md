# 06 Instructor Service Implementation Plan

**Service Name**: `ims-instructor-service`
**Type**: Existing (Refactor & Enhancement)
**Priority**: P1 (Core Academic)

---

## 1. Current Context
- **Role**: Manages teaching staff, their qualifications, and availability.
- **Integration**: Linked to `ims-academic-service` (for Classes/Schedule) and `ims-auth-service` (Users).

---

## 2. Proposed Improvements

### 2.1 Enhanced Profile
- [ ] **Rich Attributes**:
    - `qualification` (e.g., PhD, MSc)
    - `experienceYears`
    - `specialization`
    - `joiningDate`
- [ ] **Documents**:
    - Resume, Certificates, ID Proof (linked via `ImsInstructorDocuments`).

### 2.2 Subject Expertise
- [ ] **Mapping**: `ImsInstructorSubjects`
    - Define which subjects an instructor *can* teach.
    - Used for filtering when assigning timetables.

### 2.3 Availability Management (New)
- [ ] **Entity**: `ImsInstructorAvailability`
    - `dayOfWeek`
    - `startTime`, `endTime`
    - `isAvailable` (or blocked slots).
    - Critical for timetable conflict detection.

### 2.4 Workload Tracking
- [ ] **Stats API**:
    - Calculate total hours assigned per week (fed from Academic Service).

---

## 3. Technical Tasks
1.  **Refactor `ImsInstructors`**: Add rich fields.
2.  **Implement `ImsInstructorSubjects`**: CRUD APIs.
3.  **Implement `AvailabilityController`**: Set/Get preferred slots.
4.  **Integration**: Ensure `academic-service` can query instructor availability.
