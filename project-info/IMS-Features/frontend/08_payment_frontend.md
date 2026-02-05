# 08 Payment Frontend Plan

**Corresponding Backend**: `ims-payment-service`
**Scope**: Online Payment
**Priority**: P3

---

## 1. UI Components
- [ ] **Payment Button**:
    - "Pay Online" button in Student Portal.
- [ ] **Gateway Modal**:
    - Razorpay/Stripe script integration.
    - Handles Success/Failure events from the script.

## 2. State & Logic
- [ ] **SDK Loader**:
    - Load Gateway SDK script dynamically only when payment is initiated.

---

## 3. Integration Plan
- **Initiate**: `POST /api/v1/payment/initiate` -> Get Order ID & Key.
- **On Success**: `POST /api/v1/payment/webhook/{provider}` (Or let backend handle backend-to-backend).
