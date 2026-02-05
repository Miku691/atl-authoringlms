# 15 AI & Audit Frontend Plan

**Corresponding Backend**: `ims-ai-service`, `ims-audit-log-service`
**Scope**: Smart Features, Logs
**Priority**: P4

---

## 1. UI Components
- [ ] **AI Assistant Sidebar**:
    - Chat interface (e.g., "Help me find Student X").
- [ ] **Audit Trail Table**:
    - Filter by User, Date, Action.
    - Diff View (Old vs New value).

---

## 3. Integration Plan
- **Chat**: `POST /api/v1/ai/chat`.
- **Logs**: `GET /api/v1/audit/logs`.
