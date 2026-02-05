# detailed_backend_roadmap.md - Phase 1: Core Foundation & Identity

This document contains the **High-Fidelity Implementation Plan** for the Backend Agent.
**Focus**: Security, Scalability, Tenant Isolation, and Event-Driven Architecture.

---

## 🏗️ Service: Gateway Service (`atl-gateway-service`)
**Priority**: Critical (1)
**Responsibility**: Traffic Control, Security Boundary, Tenant Context Injection.

### 1. Security & Filtering
- [ ] **Filter Implementation**: Create `TenantContextFilter`.
    - Extract `X-Tenant-ID` from header or Subdomain.
    - Validate against `configuration-service` (Cache result in Redis).
    - Reject request if Tenant is invalid/inactive.
- [ ] **Global Error Handling**: Implement `GlobalErrorAttributes` to return standard JSON: `{ "code": "ERR_001", "message": "...", "timestamp": "..." }`.
- [ ] **CORS Configuration**: Allow specific origins (parameterized from Config Server).

### 2. Rate Limiting (Redis)
- [ ] **Rate Limiter**: Implement Token Bucket algorithm using Spring Cloud Gateway Redis RateLimiter.
    - Limit: 100 req/sec per IP for Public APIs.
    - Limit: 1000 req/sec per Tenant for authenticated APIs.

---

## 🔐 Service: Auth Service (`atl-auth-service`)
**Priority**: Critical (1)
**Responsibility**: Identity Management (IAM), RBAC, Token Issuance.

### 1. Database Schema (Multi-Tenant Shared)
- [ ] **Table**: `users` (id, email, password_hash, is_active).
- [ ] **Table**: `tenants` (id, domain_key, name, subscription_status).
- [ ] **Table**: `user_roles` (user_id, tenant_id, role_enum). *Critical: A user can have different roles in different tenants.*

### 2. Core Logic & APIs
- [ ] **JWT Generation**: Include claims: `sub` (email), `uid` (UUID), `tid` (tenantId), `roles` (List<String>).
- [ ] **API**: `POST /auth/login`
    - Input: `{ email, password, tenantDomain (optional) }`.
    - Logic: Verify hash -> Check Tenant Access -> Generate JWT.
- [ ] **API**: `POST /auth/signup/tenant-admin`
    - Input: `{ orgName, adminEmail, adminPassword, domainKey }`.
    - Logic: Transactional (Create Tenant -> Create User -> Assign ROLE_TENANT_ADMIN).
- [ ] **Event Publisher**: Publish `TENANT_CREATED` event to Kafka Topic `auth.events`.

---

## ⚙️ Service: Configuration Service (`configuration-service`)
**Priority**: High (2)
**Responsibility**: Centralized Tenant Profiles & Feature Flags.

### 1. Domains & Features
- [ ] **Table**: `tenant_config` (tenant_id, feature_flags_json, theme_config_json).
- [ ] **API**: `GET /public/config/{domainKey}`
    - Usage: Frontend calls this *before* login to get Logo/Theme.
    - Caching: `@Cacheable(value = "tenant_config", key = "#domainKey")`.

---

## 🎓 Service: Academic Service (`ims-academic-service`)
**Priority**: Critical (3)
**Responsibility**: Academic Structure (The Backbone).

### 1. Entity Modeling (Hierarchy)
- [ ] **Entities**:
    - `ImsProgram` (e.g., "B.Tech CSE", "Grade 10").
    - `ImsSession` (e.g., "2024-2025", "Sem 1").
    - `ImsOffering` (e.g., "Class 10-A", "CSE-2024-Batch").
    - `ImsSubject` (e.g., "Maths", "Data Structures").
    - `ImsOfferingSubject` (Mapping table with `is_optional`, `credits`).

### 2. API Implementation
- [ ] **Offering (Class) Management**:
    - `POST /api/v1/offerings`: Create Class/Batch.
    - `PUT /api/v1/offerings/{id}/subjects`: Bulk assign subjects.
    - Validation: Ensure referenced Program exists in current Tenant.

### 3. Inter-Service Communication
- [ ] **Feign Client**: Create `StaffServiceClient` (future) to validate Class Teacher ID.

---

## 🧑‍🎓 Service: Student Service (`ims-student-service`)
**Priority**: High (4)
**Responsibility**: Student Lifecycle (Admission to Alumni).

### 1. Admission Workflow
- [ ] **Entities**: `ImsStudent`, `ImsGuardian`, `ImsAddress`, `ImsDocuments`.
- [ ] **Transactional API**: `POST /api/v1/admissions`
    - Step 1: Save Guardian.
    - Step 2: Save Student (linked to Guardian).
    - Step 3: Call `AcademicService` (Feign) to check Seat Availability (Optional).
    - Step 4: Save `ImsEnrollment` (Student <-> Offering).
    - Step 5: Publish `STUDENT_ADMITTED` event (payload: studentId, email, offeringId).

### 2. Search & Listing
- [ ] **Specification API**: Implement JPA Specification for dynamic filtering (Name, RollNo, Status, OfferingId).

---

## 🏫 Service: Operations Service (`ims-operations-service`) (includes Attendance)
**Priority**: Medium (5)
**Responsibility**: Daily Activities.

### 1. Attendance Module
- [ ] **Pattern**: Use "Bitset" or simple optimized table for daily attendance to save rows.
    - Alternative: `ImsDailyAttendance` (offering_id, date, absent_student_ids_json). *Much lighter than one row per student.*
- [ ] **API**: `POST /api/v1/attendance`
    - Input: `{ offeringId, date, absentStudentIds[] }`.
    - Logic: Mark all others as Present by default.

---
*Note: Continue to Phase 2 file for Finance, Library, etc. (To be generated on request)*
