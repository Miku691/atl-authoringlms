---
trigger: manual
---

# INSTRUCTOR SERVICE RULES — IMS

This document defines the **domain boundaries, responsibilities, and invariants**
for the `ims-instructor-service` in the Institute Management System (IMS).

Any AI agent generating or modifying code for instructor-service MUST strictly
follow these rules.

---

## 1. Purpose of Instructor Service

The instructor-service manages **teaching professionals** and their
academic involvement within an institution.

It owns:
- Instructor personal profiles
- Instructor qualifications and experience
- Instructor subject expertise
- Instructor documents
- Teaching capability metadata

Instructor-service does NOT manage:
- Authentication or credentials
- Academic structure (programs, offerings, subjects)
- Student enrollment
- Attendance or exams execution

---

## 2. Core Philosophy

An instructor is a **person with teaching capability**, not a permanently
assigned academic unit.

Key principles:
- Instructors are independent of offerings
- Teaching assignments are contextual and time-bound
- Expertise does not imply assignment
- One instructor can teach multiple offerings

Never conflate instructor identity with teaching assignment.

---

## 3. Entity Ownership

Instructor-service is the source of truth for:

- ImsInstructors
- ImsInstructorSubjects
- ImsInstructorDocuments
- Instructor profile metadata

These are the main Entities for this service, if required in future we may create more also based on the requirement.

No other service may create or modify these entities.

---

## 4. Identity & Auth Relationship (Critical)

- An instructor may be linked to an auth user for portal access
- An instructor profile may exist without login credentials
- Instructor-service must NOT manage:
  - Passwords
  - Roles
  - Tokens

Rules:
- `user_id` is a reference only
- Authentication and authorization are owned by auth-service
- Instructor-service must validate tenant ownership via authentication context

---

## 5. Tenant Scope & Security Invariants

- Every instructor belongs to exactly one tenant
- Tenant context must be derived from authentication
- Frontend-provided tenant IDs must never be trusted blindly
- Cross-tenant instructor access is strictly forbidden

Security invariant:
- Instructor assignments must only reference offerings within the same tenant

---

## 6. Instructors — Teaching Identity

Instructors represent **teaching professionals**.

Rules:
- Instructors are NOT tied directly to:
  - Programs
  - Classes
  - Offerings
- Instructor identity remains stable across years
- Contact details should be globally unique where applicable
- Employment status must be explicit (ACTIVE, INACTIVE, ON_LEAVE)

---

## 7. InstructorSubjects — Expertise Mapping

InstructorSubjects define **what an instructor is capable of teaching**.

Rules:
- This is a many-to-many mapping:
  - Instructor ↔ Subject
- This does NOT mean the instructor is currently teaching that subject
- Expertise mapping is long-lived and reusable
- Academic-service subjects are referenced by ID only

This entity defines capability, not assignment.

---

## 8. Teaching Assignment Boundary (Important)

Instructor-service does NOT assign instructors to offerings.

Rules:
- Teaching assignments are contextual and time-bound
- Assignment logic belongs to:
  - Academic-service
  - Or a future scheduling/teaching-assignment service
- Instructor-service only provides eligibility and profile data

This separation prevents tight coupling.

---

## 9. InstructorDocuments — Verification Artifacts

InstructorDocuments represent **professional documents**.

Examples:
- Degree certificates
- Experience letters
- ID proof

Rules:
- File storage is abstracted (local, S3, etc.)
- Database stores only metadata and file references
- Document presence must not block instructor creation

Documents support verification, not identity.

---

## 10. Data Creation Order (Invariant)

Correct order when onboarding an instructor:

1. Create Instructor profile
2. Map InstructorSubjects (expertise)
3. Upload InstructorDocuments (optional)
4. Link auth user (optional)

Instructor creation must not depend on academic assignments.

---

## 11. API Design Rules (Service-Specific)

- APIs must support:
  - Incremental profile completion
  - Partial saves
- Avoid APIs that assume instructor is already teaching
- Do not expose academic structure details in this service
- Prefer small, composable APIs

---

## 12. Cross-Service Interaction Rules

Instructor-service:
- Consumes subject IDs from academic-service
- Provides instructor IDs to academic-service
- Does NOT query student or enrollment data
- Remains independent of scheduling logic

Only identifiers cross service boundaries.

---

## 13. Error Handling & Validation

- Invalid subject references must fail fast
- Clear domain errors must be returned:
  - Instructor not found
  - Subject not found
- Validation must occur in service layer
- Do not silently ignore invalid mappings

---

## 14. Anti-Patterns (Must Never Happen)

- Assigning instructors to offerings in instructor-service
- Mixing timetable or scheduling logic here
- Assuming one instructor teaches only one subject
- Hardcoding institution type assumptions
- Trusting frontend tenant identifiers

---

## 15. Future-Proofing Guidelines

Design entities assuming future support for:
- Timetable integration
- Teaching load analysis
- Performance reviews
- AI-assisted teaching insights

Avoid schema decisions that block these evolutions.

---

## 16. How the AI Agent Should Think

When working on instructor-service, always ask:
- Is this capability or assignment?
- Does this respect tenant isolation?
- Is academic structure being leaked?
- Will this support multiple offerings and years?

If uncertain, ask before generating code.

---

## End of Instructor Service Rules