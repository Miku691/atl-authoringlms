# 04 Academic Frontend Plan

**Corresponding Backend**: `ims-academic-service`
**Scope**: Structure Management, Timetables
**Priority**: P1

---

## 1. UI Components
- [ ] **Program Tree View**:
    - Recursive component to show `Program -> Session -> Offering`.
    - Custom Icons for each level.
- [ ] **Offering Manager**:
    - Modal to Create/Edit Class.
    - "Assign Subjects" Transfer List (Left: Available, Right: Assigned).
- [ ] **Timetable Grid**:
    - Drag-and-Drop Interface (e.g., `dnd-kit` or `react-big-calendar`).
    - Color coded by Subject/Teacher.

## 2. State & Logic
- [ ] **Academic Cache**:
    - Don't refetch Program Tree on every click. Cache it until mutation.
- [ ] **Conflict Visualizer**:
    - If user drags "Maths" to Monday 9am, highlight if Teacher is already busy (Client-side check + Backend validation).

---

## 3. Integration Plan
- **Tree Data**: `GET /api/v1/programs/hierarchy`.
- **Create Class**: `POST /api/v1/offerings`.
- **Assign Subjects**: `PUT /api/v1/offerings/{id}/subjects`.
- **Timetable**: `GET /api/v1/timetable/offering/{id}`.
