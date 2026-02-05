# 03 Configuration Service Implementation Plan

**Service Name**: `configuration-service`
**Type**: New (Creation Plan)
**Priority**: P1 (Critical Architecture)
**Port**: 8888 (Standard Config) or Application Port if dedicated service.

---

## 1. Purpose
This service acts as the **Brain** of the multi-tenant architecture. It stores:
1.  **Tenant Registry**: Who are our clients? (School A, College B).
2.  **Feature Flags**: Which tenant has "LMS" enabled?
3.  **UI Themes**: Logo, Primary Color for frontend.

---

## 2. Feature Implementation Plan

### 2.1 Tenant Registry
- [ ] **Entity**: `Tenant`
    - `id` (UUID)
    - `domainKey` (Unique, e.g., `st-xaviers`)
    - `name` (Display Name)
    - `type` (SCHOOL / COLLEGE / COACHING)
    - `status` (ACTIVE / SUSPENDED)
    - `subscriptionPlan` (BASIC / PREMIUM)

### 2.2 Feature Management
- [ ] **Entity**: `TenantConfig`
    - `modules_enabled`: JSON Array `["ACADEMIC", "LMS", "FINANCE"]`
    - `theme_config`: JSON Object `{ "primaryColor": "#ff0000", "logoUrl": "..." }`

### 2.3 APIs
- [ ] **Public Resolution**:
    - `GET /public/tenant/resolve?domain=...`: Used by Frontend to load theme before login.
- [ ] **Internal Validation**:
    - `GET /internal/tenant/{id}/active`: Used by Gateway to validate requests.

---

## 3. Technical Tasks
1.  Initialize Spring Boot Project.
2.  Setup MySQL Connection.
3.  Add Redis Caching (Critical: Tenant Config doesn't change often).
4.  Seed Default Tenant for "Super Admin".
