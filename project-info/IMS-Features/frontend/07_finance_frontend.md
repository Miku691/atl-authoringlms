# 07 Finance Frontend Plan

**Corresponding Backend**: `ims-finance-service`
**Scope**: Fees, Ledger
**Priority**: P2

---

## 1. UI Components
- [ ] **Fee Structure Builder**:
    - Dynamic Form to add rows (Fee Head, Amount, Frequency).
- [ ] **Collection Desk**:
    - Student Lookup.
    - **Ledger Table**: Accordion view for each Fee Term.
    - **Payment Modal**:
        - Amount Input, Payment Mode Selector.
        - "Print Receipt" button (Triggers PDF download).
- [ ] **Due List Report**:
    - Table with "Send Reminder" action button.

---

## 3. Integration Plan
- **Get Ledger**: `GET /api/v1/finance/ledger/{studentId}`.
- **Collect Fee**: `POST /api/v1/finance/collect`.
- **Download Receipt**: `GET /api/v1/finance/receipt/{txnId}` (Blob).
