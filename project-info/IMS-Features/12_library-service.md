# 12 Library Service Implementation Plan

**Service Name**: `ims-library-service`
**Type**: New (Creation Plan)
**Priority**: P3 (Operations)
**Port**: Dynamic / 808X

---

## 1. Purpose
Manages book inventory, issuing, returns, and fines.

---

## 2. Feature Implementation Plan

### 2.1 Inventory
- [ ] **Entity**: `Book`
    - `isbn`, `title`, `author`.
- [ ] **Entity**: `BookCopy`
    - `barcode`.
    - `status` (AVAILABLE / ISSUED / LOST).

### 2.2 Circulation
- [ ] **Transaction**: `BookIssue`
    - `studentId`, `copyId`, `issueDate`, `dueDate`, `returnDate`.
- [ ] **Fine Calculation**:
    - Job: Calculate fine if `returnDate` > `dueDate`.
    - Publish `FINE_APPLIED` event -> `finance-service` adds to ledger.

---

## 3. Technical Tasks
1.  Initialize Service.
2.  Barcode scanning support API (just takes a string code).
