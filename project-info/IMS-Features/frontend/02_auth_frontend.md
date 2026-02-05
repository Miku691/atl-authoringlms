# 02 Auth Frontend Plan

**Corresponding Backend**: `atl-auth-service`
**Scope**: Identity, Access Control
**Priority**: P0

---

## 1. UI Components
- [ ] **Login Page**:
    - Split Layout (Brand Image left, Form right).
    - Floating Label Inputs.
    - "Forgot Password" link.
- [ ] **Signup Wizard** (Tenant Admin):
    - Multi-step: Org Info -> Admin Info -> Verify OTP.
- [ ] **OTP Input**:
    - 4/6 digit segmented input with auto-focus.

## 2. State & Logic
- [ ] **Auth Context/Store**:
    - `user`: User Profile Object.
    - `token`: JWT String (in-memory or HttpOnly cookie handling).
    - `permissions`: List of strings (e.g., `["STUDENT_CREATE", "FEE_VIEW"]`).
- [ ] **Route Guards**:
    - `<RequireAuth roles={['ADMIN']}>`: Redirects if unauthorized.

---

## 3. Integration Plan
- **Login**: `POST /auth/login`
- **Logout**: `POST /auth/logout` (Invalidate cookie).
- **Refresh**: Silent refresh mechanism using interceptors.
- **Tenant Switch**: `POST /auth/switch-tenant` -> Update Token in Store -> Reload App.
