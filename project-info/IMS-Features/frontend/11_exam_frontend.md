# 11 Exam Frontend Plan

**Corresponding Backend**: `ims-exam-service`
**Scope**: Formal Exams, Result Sheets
**Priority**: P3

---

## 1. UI Components
- [ ] **Schedule View**:
    - Calendar or List of upcoming exams.
    - "Download Admit Card" button (PDF).
- [ ] **Result Card**:
    - Detailed marksheet with Grade.

---

## 3. Integration Plan
- **Get Schedule**: `GET /api/v1/exams/schedule`.
- **Get Admit Card**: `GET /api/v1/exams/admit-card`.
- **Get Results**: `GET /api/v1/exams/results`.
