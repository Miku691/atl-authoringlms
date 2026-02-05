# Backend Implementation Roadmap (Parallel Track)

This document defines the **Backend Work Packet** for the IMS system.
**Target Audience**: Backend AI Agent / Developer.
**Goal**: Build isolated, industry-ready microservices with strict API contracts.

**Inter-Service Communication Strategy**:
- **Sync (Data Retrieval)**: Feign Client (REST).
- **Async (Events)**: Kafka/RabbitMQ (e.g., `STUDENT_ENROLLED` -> `FINANCE_CREATE_LEDGER`).
- **Shared Lib**: `atl-common-lib` (DTOs, Exceptions, Security Config).

---

## Phase 1: Foundation (Core & Identity)

### 1.1 Gateway Service (`gateway-service`)
- [ ] **1.1.1**: Configure Netty Routing for all new services.
- [ ] **1.1.2**: Implement Global Exception Handler (Standard JSON Error).
- [ ] **1.1.3**: Add Rate Limiting (Redis-based) per Tenant.

### 1.2 Auth Service (`auth-service`)
- [ ] **1.2.1**: Refactor User Entity to support "Tenant Switching" (One User, Multiple Tenants).
- [ ] **1.2.2**: API `GET /internal/user/{id}/validate`: For downstream services to validate identity.

### 1.3 Configuration Service (`configuration-service`)
*Responsible for Tenant Profiles and Global Settings.*
- [ ] **1.3.1**: Create `Tenant` entity (ID, Name, Type, Logo, Theme).
- [ ] **1.3.2**: API `GET /public/tenant/{domain}`: Resolve tenant by subdomain.

---

## Phase 2: Academic Core (Domain Structures)

### 2.1 Academic Service (`academic-service`)
*Owns: Programs, Sessions, Offerings.*
- [ ] **2.1.1**: **API Contract**:
    - `POST /api/v1/programs` (Create Program)
    - `POST /api/v1/offerings` (Create Class/Batch)
    - `GET /api/v1/offerings/{id}/subjects` (Get Subjects)
- [ ] **2.1.2**: Implement `ImsOffering` entity with strictly indexed `tenant_id`.

---

## Phase 3: People & Enrollment (The Pivot)

### 3.1 Student Service (`student-service`)
*Owns: Profiles, Guardians.*
- [ ] **3.1.1**: **API Contract**:
    - `POST /api/v1/students` (Admit Student)
    - `PUT /api/v1/students/{id}/enroll` (Link to Offering)
- [ ] **3.1.2**: **Event**: Publish `STUDENT_CREATED` event on topic `ims.student.lifecycle`.

### 3.2 Instructor Service (`instructor-service`)
- [ ] **3.2.1**: Profile creation linked to `auth-service` User ID.

---

## Phase 4: Operations & Communication

### 4.1 Attendance Service (`attendance-service`)
- [ ] **4.1.1**: **API Contract**:
    - `POST /api/v1/attendance/bulk` (List of {studentId, status})
- [ ] **4.1.2**: Logic: Validate `offeringId` via Feign call to `academic-service`.

### 4.2 Notification Service (`notification-service`)
- [ ] **4.2.1**: **Listener**: Subscribe to `ims.student.lifecycle` -> Send Welcome Email.
- [ ] **4.2.2**: **API**: `POST /api/v1/notifications/send` (Manual trigger).

---

## Phase 5: Finance & Assets

### 5.1 Finance Service (`finance-service`)
- [ ] **5.1.1**: **Event Listener**: Listen to `STUDENT_ENROLLED` -> Create Fee Ledger.
- [ ] **5.1.2**: **API**: `GET /api/v1/fees/student/{id}/summary`.

### 5.2 Library Service (`library-service`)
- [ ] **5.2.1**: Book Inventory Management.

---

## Phase 6: LMS & Assessment

### 6.1 Content Service (`content-service`)
- [ ] **6.1.1**: S3/MinIO Integration for file storage.
- [ ] **6.1.2**: API to link Reference Material to `offeringId`.

### 6.2 Assessment Service (`assessment-service`)
- [ ] **6.2.1**: Logic for Quizzes and Assignments.
