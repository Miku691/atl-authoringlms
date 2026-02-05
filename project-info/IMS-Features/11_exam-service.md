# 11 Exam Service Implementation Plan

**Service Name**: `ims-exam-service`
**Type**: New (Creation Plan)
**Priority**: P3 (Formal Exams)
**Port**: Dynamic / 808X

---

## 1. Purpose
Manages formal examinations, admit cards, and final result sheets (Transcripts). Distinct from "Assessment" which is for quizzes/assignments.

---

## 2. Feature Implementation Plan

### 2.1 Exam Setup
- [ ] **Entity**: `ExamSession` (e.g., "Finals 2025").
- [ ] **Entity**: `ExamSchedule` (Subject, Date, Time, Room).
- [ ] **Logic**: Conflict checking (Student cannot be in two exams at once).

### 2.2 Hall Tickets & Results
- [ ] **Feature**: Admit Card Generation (PDF).
- [ ] **Feature**: Marksheet Generation (Weighted average of Assessments + Final Exam).

---

## 3. Technical Tasks
1.  Initialize Service.
2.  Implement "Grading Strategy" pattern (Generic rules for converting Marks to Grades).
