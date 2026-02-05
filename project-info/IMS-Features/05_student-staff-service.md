# 05 Student & Staff Implementation Plan

**Services**: `ims-student-service` & `ims-staff-service`
**Type**: Existing (Refactor)
**Priority**: P1 (Core User)

---

## 1. Student Service Improvement

### 1.1 Profile Enhancements
- [ ] **Rich Profile**:
    - Add `MedicalHistory`, `PreviousEducation`, `Documents` (S3 Links).
- [ ] **Guardian Linking**:
    - Support Many-to-Many (One parent, multiple kids).
    - `Guardian` entity needs its own login capability references (linked to Auth User).

### 1.2 Enrollment Lifecycle
- [ ] **Enrollment Entity**:
    - `studentId`
    - `offeringId`
    - `status` (ACTIVE / DROPPED / ALUMNI)
    - `rollNumber` (Generated per offering).
- [ ] **Move Logic**: Ensure "Promote Student" logic creates a *new* enrollment, maintaining history.

---

## 2. Staff & Instructor Improvement
*Note: We will merge logical handling if separation causes too much overhead, but keep clean interfaces.*

### 2.1 Staff Profiles
- [ ] **Designation & Department**:
    - Configurable Master lists per tenant.
- [ ] **Workload Tracking**:
    - Calculate "Hours per week" based on Academic Timetable.

---

## 3. Technical Tasks
1.  Implement `StudentRepository.findByOfferingId`.
2.  Implement `BulkAdmissionController` (Excel upload processing).
3.  Add `PhotoService` interface for image handling (stored in S3/MinIO).
