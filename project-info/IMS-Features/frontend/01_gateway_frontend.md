# 01 Gateway Frontend Plan

**Corresponding Backend**: `atl-gateway-service`
**Scope**: App-Wide Networking & UX Layout
**Priority**: P0

---

## 1. Networking Layer (Axios)
Even though the Gateway is backend, the Frontend interacts with it.
- [ ] **Interceptor Logic**:
    - **Request**: Attach `X-Tenant-ID` (from Global Store) to *every* request.
    - **Response**: Handle `401 Unauthorized` -> Redirect to Login.
    - **Response**: Handle `503 Service Unavailable` -> Show "System Maintenance" Overlay.
    - **Timeout**: Set default timeout (e.g., 10s) and show Retry UI.

## 2. Global UI Shell
- [ ] **Layout Component**: `DashboardLayout`
    - Sidebar (Collapsible).
    - Topbar (User Profile, Notifications, Tenant Switcher).
    - Breadcrumbs (Auto-generated from URL).
- [ ] **Feedback Systems**:
    - **Toasts**: Success/Error popup manager (e.g., `react-hot-toast`).
    - **Loaders**: Top-bar progress indicator (`nprogress`) for route transitions.

---

## 3. Integration Plan
- **API Base URL**: `VITE_API_GATEWAY_URL` (e.g., `http://localhost:8080`).
- **Health Check**: Poll `/actuator/health` periodically to show connectivity status.
