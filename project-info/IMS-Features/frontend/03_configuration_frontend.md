# 03 Configuration Frontend Plan

**Corresponding Backend**: `configuration-service`
**Scope**: Theming, Tenant Config
**Priority**: P1

---

## 1. UI Components
- [ ] **Theme Provider**:
    - Dynamically inject CSS variables:
        - `--primary-color`
        - `--sidebar-bg`
    - Support "Dark Mode" toggle if config allows.
- [ ] **Tenant Resolver**:
    - Loading Screen component that waits for Config to load before showing App.

## 2. State & Logic
- [ ] **Config Store**:
    - `tenantConfig`: `{ logoUrl, featureFlags: [], theme: {} }`.
- [ ] **Feature Flags Hook**:
    - `useFeature('LMS')` -> Returns true/false.
    - Hide Sidebar items based on this.

---

## 3. Integration Plan
- **Fetch Config**: `GET /public/tenant/resolve?domain={window.location.hostname}`.
    - Call this inside `App.tsx` via `useEffect` before rendering `Router`.
