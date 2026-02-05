# 06 Attendance Frontend Plan

**Corresponding Backend**: `ims-attendance-service`
**Scope**: Daily Operations
**Priority**: P2

---

## 1. UI Components
- [ ] **Marking Interface**:
    - **Date Picker**: Constrained to active academic days.
    - **Student Grid**:
        - Cards with Photo + Name.
        - Click to toggle status: Present (Green) -> Absent (Red) -> Late (Yellow).
    - **Bulk Actions**: "Mark All Present", "Clear All".
- [ ] **Report View**:
    - Calendar View: Red dots on absent days.
    - Stats: Circular Progress Bar (% Attendance).

---

## 3. Integration Plan
- **Fetch List**: `GET /api/v1/students/offering/{id}` (From Student Service).
- **Fetch Existing**: `GET /api/v1/attendance/check?date=...`.
- **Submit**: `POST /api/v1/attendance`.
