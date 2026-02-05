# 13 Notification Frontend Plan

**Corresponding Backend**: `ims-notification-service`
**Scope**: Alerts, Messages
**Priority**: P2

---

## 1. UI Components
- [ ] **Notification Bell**:
    - Dropdown with list of unread items.
    - "Mark All Read" action.
- [ ] **Broadcast Form** (Admin):
    - Multi-select targets (Class 10A, Staff, Parent).
    - Message body textarea.

---

## 3. Integration Plan
- **Poll**: `GET /api/v1/notifications/unread` (Or WebSocket).
- **Send**: `POST /api/v1/notifications/broadcast`.
