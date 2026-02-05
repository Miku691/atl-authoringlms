# 09 Content (LMS) Frontend Plan

**Corresponding Backend**: `ims-content-service`
**Scope**: Study Materials
**Priority**: P3

---

## 1. UI Components
- [ ] **Course Feed**:
    - Timeline view of posted materials.
- [ ] **File Viewer**:
    - PDF: Embed PDF.js or native iframe.
    - Video: Custom Player or YouTube Embed.
- [ ] **Upload Drawer**:
    - Dropzone for files.
    - Progress Bar for S3 upload.

---

## 3. Integration Plan
- **Get Feed**: `GET /api/v1/content/offering/{id}`.
- **Get Upload URL**: `GET /api/v1/content/presigned-put`.
- **Confirm Upload**: `POST /api/v1/content/publish`.
