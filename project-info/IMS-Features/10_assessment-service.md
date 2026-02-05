# 10 Assessment Service Implementation Plan

**Service Name**: `ims-assessment-service`
**Type**: New (Creation Plan)
**Priority**: P3 (LMS/Exams)
**Port**: Dynamic / 808X

---

## 1. Purpose
Handles Assignments, Quizzes (Online Exams), and Grading.

---

## 2. Feature Implementation Plan

### 2.1 Assignments
- [ ] **Entity**: `Assignment`
    - `title`, `deadline`, `maxMarks`.
- [ ] **Entity**: `Submission`
    - `studentId`, `fileUrl`, `submittedAt`.
- [ ] **Workflow**: Student uploads -> Teacher previews -> Teacher enters Grade.

### 2.2 Quizzes (MCQ)
- [ ] **Entity**: `Quiz`
    - `questions` (JSON Array of Q/A).
    - `timeLimitMinutes`.
- [ ] **Logic**: Auto-grading for MCQs.

### 2.3 Grading Book
- [ ] **API**: `GET /assessment/marksheet/{studentId}`.
    - Aggregates Quizzes + Assignments.

---

## 3. Technical Tasks
1.  Initialize Service.
2.  Implement "Timer" logic for quizzes (Server-side validation of submission time).
3.  Secure quiz questions (Don't send answers to frontend until submission).
