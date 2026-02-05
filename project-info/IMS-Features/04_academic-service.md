# 04 Academic Service Implementation Plan

**Service Name**: `ims-academic-service`
**Type**: Existing (Refactor & Expansion)
**Priority**: P1 (Core Domain)

---

## 1. Current State Analysis
- **Focus**: Currently likely has basic Subject/Class entities.
- **Gap**: Needs to handle the polymorphism of School vs College vs Coaching structures efficiently.

---

## 2. Improvement Plan

### 2.1 Structural Flexibility (The "Offering" Model)
- [ ] **Refactor Hierarchy**:
    - **Program**: High level bucket (e.g., "Grade 10", "B.Tech CSE").
    - **Session**: Time bound (e.g., "2025-26", "Spring 2025").
    - **Offering**: The actual operational unit (e.g., "Grade 10-A", "CSE-Sem3-Batch1").
    - **Logic**: All students enroll in an *Offering*. All timetables attach to an *Offering*.

### 2.2 Subject Management
- [ ] **Subject Library**:
    - Global list of subjects for the tenant.
- [ ] **Mapping**:
    - `OfferingSubject`: Link Subject -> Offering.
    - Attributes: `isOptional`, `credits`, `instructorId` (Default instructor).

### 2.3 Timetable Module (Moved from Ops)
- [ ] **Entity**: `ClassSchedule`
    - `dayOfWeek`
    - `timeSlot` (Start/End)
    - `offeringId`
    - `subjectId`
    - `roomId`
- [ ] **Conflict Detection**:
    - "Is Instructor Busy?" check.
    - "Is Room Occupied?" check.

---

### 2.4 Departments (College/University Support)
- [ ] **Entity**: `Department`
    - `name` (e.g., "Computer Science", "Humanities")
    - `headOfDepartment` (Instructor ID)
    - `programs` (One-to-Many: A department owns multiple programs)

### 2.5 Syllabus Tracking (Coaching/School Support)
- [ ] **Refactor**:
    - `ImsChapters`: Link to `ImsSubjects`.
    - `ImsTopics`: Link to `ImsChapters`.
- [ ] **Tracking**:
    - `SyllabusCoverage`: Link `OfferingSubject` + `Topic` -> Status (PENDING, COMPLETED).
- [ ] **API**:
    - `PATCH /coverage`: Mark topic as complete for an offering.

---

## 3. Technical Tasks
1.  Migrate existing structure to `Program -> Session -> Offering` model.
2.  Ensure `tenant_id` is indexed on all tables.
3.  Create APIs for "Curriculum View" (Hierarchy tree).
