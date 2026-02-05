# 08 Payment Service Implementation Plan

**Service Name**: `ims-payment-service`
**Type**: New (Creation Plan)
**Priority**: P3 (Advanced Finance)
**Port**: Dynamic / 808X

---

## 1. Purpose
Abstraction layer for Payment Gateways (Razorpay/Stripe/PayPal). Ensures the core logic doesn't depend on specific provider APIs.

---

## 2. Feature Implementation Plan

### 2.1 Gateway Integration
- [ ] **Strategy Pattern**: Interface `PaymentProvider` with implementations `RazorpayProvider`, `StripeProvider`.
- [ ] **API**: `POST /payment/initiate`
    - Input: `{ amount, currency, orderId (internal) }`.
    - Output: `{ providerOrderId, keyId, callbackUrl }`.

### 2.2 Webhook Handling
- [ ] **API**: `POST /payment/webhook/{provider}`
    - Logic: Verify signature -> Update Transaction Status -> Notify `finance-service`.
- [ ] **Security**: Critical validation of provider signatures.

---

## 3. Technical Tasks
1.  Add SDKs for Razorpay/Stripe.
2.  Implement idempotent webhook processing (handle same event twice gracefully).
3.  Secure API keys using `configuration-service` (never hardcode).
