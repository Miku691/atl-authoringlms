# 12 Library Frontend Plan

**Corresponding Backend**: `ims-library-service`
**Scope**: Book Search, Issues
**Priority**: P3

---

## 1. UI Components
- [ ] **OPAC (Catalog)**:
    - Search Bar (Title, Author, ISBN).
    - Grid of Book covers with status (Available/Issued).
- [ ] **My Library**:
    - List of currently held books.
    - Due dates highlighting.

---

## 3. Integration Plan
- **Search**: `GET /api/v1/library/books?q=...`.
- **My Books**: `GET /api/v1/library/my-books`.
