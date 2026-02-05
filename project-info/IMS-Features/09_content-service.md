# 09 Content Service (LMS) Implementation Plan

**Service Name**: `ims-content-service`
**Type**: New (Creation Plan)
**Priority**: P3 (LMS)
**Port**: Dynamic / 808X

---

## 1. Purpose
Manages educational content: Notes, Videos, Links. Does NOT manage live classes (that's `integration-service` with Zoom) or Exams (that's `assessment-service`).

---

## 2. Feature Implementation Plan

### 2.1 Material Repository
- [ ] **Entity**: `StudyMaterial`
    - `title`
    - `description`
    - `type` (PDF / VIDEO_LINK / YOUTUBE)
    - `url` (S3 path or external link)
    - `accessLevel` (PUBLIC / ENROLLED_ONLY)
    - `visibilityHierarchy` (Program / Session / Offering / Subject)

### 2.2 Storage Backend
- [ ] **Integration**: AWS S3 or MinIO (Self-hosted).
- [ ] **Presigned URLs**:
    - Never stream bytes through Java. Generate Presigned Get URL for frontend to view.
    - Generate Presigned Put URL for frontend to upload.

---

## 3. Technical Tasks
1.  Initialize Service.
2.  Configure S3 Client.
3.  Implement Hierarchy Logic ("If posted to Grade 10, all Grade 10 sections see it").
