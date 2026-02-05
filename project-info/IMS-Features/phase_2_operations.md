# Phase 2: Operations (Day-to-Day) - Detailed Tasks

**Goal**: Enable daily academic and administrative operations for Staff and Students.

---

## 2.A: Attendance Management

### 2.A.1 Backend (ims-operations-service - NEW)
- [ ] **Module Setup**: Create `ims-operations-service`.
- [ ] **Entity**: `AttendanceSession` (Date, Time, Offering, Staff).
- [ ] **Entity**: `StudentAttendance` (Student, Session, Status: PRESENT, ABSENT, LATE, EXCUSED).
- [ ] **API**: `POST /attendance/mark` - Bulk mark attendance for an offering.
- [ ] **API**: `GET /attendance/report` - Get aggregate data (Student-wise or Offering-wise).

### 2.A.2 Frontend (atl-web-ui)
- [ ] **Page**: `AttendanceMarkingPage` - Grid view of students in a class.
- [ ] **Feature**: "Mark All Present" button for quick action.
- [ ] **Report**: Visual charts for attendance trends.

---

## 2.B: Timetable & Scheduling

### 2.B.1 Backend (ims-academic-service)
- [ ] **Entity**: `TimeSlot` (Start Time, End Time, Label).
- [ ] **Entity**: `ClassSchedule` (Day, TimeSlot, Offering, Subject, Staff, Room).
- [ ] **Validation**: Prevent double-booking of Staff or Room.
- [ ] **API**: `GET /timetable/offering/{id}` - Get weekly schedule.

### 2.B.2 Frontend (atl-web-ui)
- [ ] **Component**: `TimetableGrid` - 2D Grid (Days x TimeSlots).
- [ ] **Interaction**: Click cell to assign Subject/Teacher.
- [ ] **View**: Printable view for students.

---

## 2.C: Staff/Faculty Management

### 2.C.1 Backend (ims-staff-service / ims-instructor-service)
- [ ] **Refactor**: Review existing services (`ims-staff-service`, `ims-instructor-service`).
- [ ] **Entity**: `InstructorSubjectMapping` - Which instructor can teach which subject.
- [ ] **API**: `GET /staff/available` - Find free staff for a specific time slot.

### 2.C.2 Frontend (atl-web-ui)
- [ ] **Page**: `StaffDirectory` - List view with filters (Dept, Role).
- [ ] **Profile**: View teaching load and history.

---

## 2.D: Student/Parent Portal

### 2.D.1 Backend (all services)
- [ ] **Security**: Ensure APIs allow access to `ROLE_STUDENT` or `ROLE_GUARDIAN` for their own data only.
- [ ] **API**: `GET /student/dashboard` - Aggregated data (Next class, Attendance % today, Due Fees).

### 2.D.2 Frontend (atl-web-ui)
- [ ] **Layout**: Simplified Layout for Student/Parent (Mobile first).
- [ ] **Dashboard**: Widgets for Quick Stats.
- [ ] **View**: Read-only views for Attendance, Timetable, Fees.
