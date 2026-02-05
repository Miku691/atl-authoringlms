# 10 Assessment Frontend Plan

**Corresponding Backend**: `ims-assessment-service`
**Scope**: Assignments, Quizzes
**Priority**: P3

---

## 1. UI Components
- [ ] **Quiz Player**:
    - Full screen mode.
    - Timer overlay.
    - "Next/Prev" navigation.
    - Disable Tab Switch (Visibility API warning).
- [ ] **Assignment Submission**:
    - File upload for homework.

---

## 3. Integration Plan
- **Load Quiz**: `GET /api/v1/assessment/quiz/{id}/start`.
- **Submit Answer**: `POST /api/v1/assessment/quiz/submit`.
