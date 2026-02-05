# 07 Finance Service Implementation Plan

**Service Name**: `ims-finance-service`
**Type**: New (Creation Plan)
**Priority**: P2 (Revenue)
**Port**: Dynamic / 808X

---

## 1. Purpose
Manages Fee Structures, Student Fee Ledgers, Invoices, and Offline Payments.
*Note: Online Payment Gateway interaction is delegated to `payment-service`.*

---

## 2. Feature Implementation Plan

### 2.1 Fee Configuration (The "Menu")
- [ ] **Entities**:
    - `FeeHead`: "Tuition Fee", "Transport Fee", "Exam Fee".
    - `FeeStructure`: Mapping of `FeeHead` to `Offering` (e.g., Grade 10 Tuition = $500).
    - `FeeDiscount`: Rules for scholarships.

### 2.2 Student Ledger (The "Tabs")
- [ ] **Entity**: `StudentFeeRecord`
    - `studentId`
    - `feeHeadId`
    - `dueDate`
    - `amountDue`
    - `amountPaid`
    - `state` (PAID / PARTIAL / UNPAID)
- [ ] **Logic**:
    - Auto-assigned when student enrolls (Event listener: `STUDENT_ENROLLED`).

### 2.3 Collection Desk
- [ ] **API**: `POST /finance/collect`
    - Input: `{ studentId, amount, mode: CASH/CHEQUE, reference }`.
    - Output: Receipt PDF URL.
- [ ] **API**: `GET /finance/ledger/{studentId}`.

---

## 3. Technical Tasks
1.  Initialize Service.
2.  Design Double-Entry Bookkeeping schema (Credits/Debits) for auditability.
3.  Implement PDF Generator (OpenPDF/iText) for receipts.
