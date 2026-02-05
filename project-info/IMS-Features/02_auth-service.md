# 02 Auth Service Implementation Plan

**Service Name**: `atl-auth-service`
**Type**: Existing (Refactor & Improvement)
**Priority**: P0 (Critical Identity)
**Port**: 8081 (Internal), Exposed via Gateway

---

## 1. Current State Analysis
- **Framework**: Spring Boot Security + JWT.
- **Function**: Handles Login, Signup, OTP.
- **Gap Analysis**:
    - Needs support for "One User, Multiple Tenants".
    - Role hierarchy needs to be standard (SUPER_ADMIN vs TENANT_ADMIN).
    - Session management (Refresh Tokens) might be missing/basic.

---

## 2. Improvement Plan (Feature-Wise)

### 2.1 Multi-Tenant Identity Model
- [ ] **Refactor User Entity**:
    - Users should be global (email unique across system) OR tenant-scoped?
    - **Decision**: **Global User** with **Tenant-Specific Roles**.
    - **New Entity**: `UserTenantRole` mapping table.
        - `user_id`
        - `tenant_id`
        - `role` (e.g., INSTRUCTOR in Tenant A, PARENT in Tenant B).
- [ ] **Switch Tenant API**:
    - `POST /auth/switch-tenant`: Input `{ targetTenantId }`. Returns new JWT for that tenant context.

### 2.2 Security Upgrades
- [ ] **Refresh Token Config**:
    - Store Refresh Tokens in HttpOnly Cookie or Redis (with shorter expiry than Access Token).
    - Implement Rotation Policy (New refresh token on every use).
- [ ] **MFA / OTP**:
    - Ensure OTP service is robust (using `atl-otp-service` logic if exists inside auth).

### 2.3 Downstream Integration
- [ ] **Validation API**:
    - `GET /internal/validate-token`: For services that need absolute security check (though Gateway handles most).
- [ ] **User Sync**:
    - Publish `USER_CREATED` event to Kafka so `student-service` or `staff-service` can create domain profiles.

---

## 3. Technical Tasks
1.  Modify `User` entity relationships.
2.  Update JWT claim generation to include `tenantId` and `currentRole`.
3.  Implement `SwitchTenantController`.
4.  Integrate Redis for Token Blacklisting (Logout).
