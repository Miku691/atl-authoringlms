# 06 Attendance Service Implementation Plan

**Service Name**: `ims-attendance-service`
**Type**: New (Creation Plan)
**Priority**: P2 (Daily Operations)
**Port**: Dynamic / 808X

---

## 1. Purpose
Handles all attendance recording, modifying, and reporting. Separate from `academic-service` to allow high-volume writes without slowing down the core structure.

---

## 2. Feature Implementation Plan

### 2.1 Daily Attendance (School Mode)
- [ ] **Entity**: `DailyAttendance`
    - `id`
    - `date` (LocalDate)
    - `offeringId` (Class)
    - `absentStudentIds` (JSON Array: `[101, 105, 299]`)
    - `markedBy` (Staff ID)
- [ ] **Logic**:
    - **Optimistic Default**: Assume everyone is present. Only store absences.
    - **Validation**: Ensure date is not a holiday (check Calendar from Academic Service).

### 2.2 Lecture Attendance (College Mode)
- [ ] **Entity**: `LectureAttendance`
    - `id`
    - `timeSlotId` (Link to Timetable)
    - `subjectId`
    - `studentAttendanceMap` (JSON: `{"101": "P", "102": "A", "103": "L"}`)
- [ ] **Logic**:
    - "L" = Late, "E" = Excused.

### 2.3 Reporting & Analysis
- [ ] **API**: `GET /attendance/student/{id}/summary`
    - Returns: Total Days, Present Days, Percentage.
- [ ] **API**: `GET /attendance/offering/{id}/sheet`
    - Returns: Grid for the month (Day vs Student).

---

## 3. Technical Tasks
1.  Initialize Service.
2.  Implement `AttendanceRepository` with JSON support.
3.  Add "Low Attendance Alert" job (Batch Process) -> Publish event to `notification-service`.
