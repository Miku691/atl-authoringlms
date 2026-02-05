# 13 Notification Service Implementation Plan

**Service Name**: `ims-notification-service`
**Type**: New (Creation Plan)
**Priority**: P2 (Communication)
**Port**: Dynamic / 808X

---

## 1. Purpose
Central hub for all outgoing communications. Decouples business logic from SMS/Email providers.

---

## 2. Feature Implementation Plan

### 2.1 Channels
- [ ] **Providers**:
    - SMS: Twilio / AWS SNS.
    - Email: SendGrid / AWS SES.
    - WhatsApp: Twilio / Meta API.
    - Push: Firebase (FCM).

### 2.2 Templates
- [ ] **Entity**: `NotificationTemplate`
    - `code` (e.g., `WELCOME_EMAIL`).
    - `body` (Mustache/Thymeleaf template: "Hello {{name}}...").
    - `tenantId` (Tenants can customize templates).

### 2.3 Event Listeners
- [ ] **Kafka Listener**:
    - Topic: `ims.*`.
    - Routing Logic: If `STUDENT_ADMITTED` -> Send Welcome Email.

---

## 3. Technical Tasks
1.  Initialize Service.
2.  Implement Async Worker (Don't block APIs sending emails).
3.  Add Retry Logic (If SMS fails, retry 3 times).
