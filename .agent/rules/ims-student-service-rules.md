---
trigger: manual
---

# STUDENT SERVICE RULES — IMS

This document defines the **domain boundaries, responsibilities, and invariants**
for the `ims-student-service` in the Institute Management System (IMS).

Any AI agent generating or modifying code for student-service MUST strictly
follow these rules.

---

## 1. Purpose of Student Service

The student-service is responsible for managing **student identity and lifecycle**
within an academic institution.

It owns:
- Student personal profiles
- Student guardians and relationships
- Student enrollments
- Student documents
- Academic participation context

Student-service does NOT manage:
- Authentication or credentials
- Academic structure (programs, offerings, subjects)
- Fees, payments, or accounting
- Attendance marking or exams

---

## 2. Core Philosophy

A student is a **person first**, not an academic unit.

Academic participation is defined **only via enrollment**.

Key principles:
- Students exist independently of academics
- Enrollment defines academic context
- Students may have multiple enrollments over time
- Student data must be reusable across years

Never conflate student identity with academic placement.

---

## 3. Entity Ownership

Student-service is the source of truth for:

- ImsStudents
- ImsStudentGuardians
- ImsStudentEnrollments
- ImsStudentDocuments
- Student lifecycle metadata

These are the main Entities for this service, if required in future we may create more also based on the requirement.
No other service may create or modify these entities.

---

## 4. Identity & Auth Relationship (Critical)

- Every student may be linked to:
  - An auth user (for portal access)
  - Or exist without login credentials
- Student-service must NOT manage:
  - Passwords
  - Roles
  - Tokens

Rules:
- `user_id` is a reference only
- Authentication is owned by auth-service
- Student-service must validate user ownership via tenant context

---

## 5. Tenant Scope & Security Invariants

- Every student record belongs to exactly one tenant
- Tenant context must come from authentication
- Frontend-provided tenant IDs must not be trusted blindly
- Cross-tenant student access is strictly forbidden

Security invariant:
- A student can only be enrolled into offerings of the same tenant

---

## 6. Students — Personal Identity

Students represent **individual persons**.

Rules:
- Students are NOT tied directly to:
  - Programs
  - Classes
  - Subjects
- Students may exist without enrollment
- Global uniqueness must be enforced for:
  - Email
  - Phone
  - Admission number (where applicable)

Student entity should remain stable across years.

---

## 7. StudentEnrollments — Academic Participation (MOST IMPORTANT)

StudentEnrollments define **where and when a student studies**.

Rules:
- Enrollment is mandatory for academic activity
- Each enrollment links:
  - One student
  - One offering
- Students may have multiple enrollments across time
- Enrollment must validate:
  - Offering existence
  - Offering tenant ownership
  - Offering active status

Promotion is implemented as:
- Creating a new enrollment
- Never updating an old one

---

## 8. Enrollment Lifecycle Rules

Enrollment states may include:
- ACTIVE
- COMPLETED
- WITHDRAWN
- TRANSFERRED

Rules:
- Enrollment history must be preserved
- Old enrollments must not be deleted
- Reports must rely on enrollment records

---

## 9. StudentGuardians — Relationships

StudentGuardians represent **parent or guardian relationships**.

Rules:
- A student may have multiple guardians
- Guardians may be shared across siblings
- Guardian contact details must be validated
- Guardian access (login) is optional and future-ready

Guardians are relational context, not identity owners.

---

## 10. StudentDocuments — Evidence & Records

StudentDocuments represent **uploaded artifacts**.

Examples:
- Birth certificate
- Transfer certificate
- ID proof

Rules:
- Document storage is abstracted (local, S3, etc.)
- Database stores only metadata and file reference
- Actual file storage must not block core student operations

Documents are attachments, not primary data.

---

## 11. Data Creation Order (Invariant)

Correct order when onboarding a student:

1. Create Student
2. Create StudentEnrollment
3. Assign Guardians (optional)
4. Upload Documents (optional)

Skipping enrollment results in an academically inactive student.

---

## 12. API Design Rules (Service-Specific)

- APIs must support:
  - Wizard-style student onboarding
  - Partial data saving
- Enrollment creation must be explicit
- Avoid APIs that combine student creation and enrollment invisibly
- Enrollment APIs must validate academic-service data via ID checks

---

## 13. Cross-Service Interaction Rules

Student-service:
- Consumes offering IDs from academic-service
- Does NOT query academic tables directly
- Must NOT assume academic structure
- Must remain loosely coupled

All cross-service interactions are via identifiers only.

---

## 14. Error Handling & Validation

- Missing enrollment must be treated as domain error
- Clear error messages must be returned:
  - Student not found
  - Offering not found
  - Enrollment invalid
- Validation must occur in service layer

---

## 15. Anti-Patterns (Must Never Happen)

- Attaching students directly to classes or subjects
- Updating enrollment to represent promotion
- Deleting enrollment history
- Hardcoding academic assumptions
- Trusting frontend tenant IDs

---

## 16. Future-Proofing Guidelines

Design assuming future support for:
- Attendance
- Exams
- Promotion workflows
- Analytics
- Parent portals

Do not block these through rigid schemas.

---

## 17. How the AI Agent Should Think

When working on student-service, always ask:
- Is this student identity or academic participation?
- Does this respect enrollment-based modeling?
- Is tenant isolation enforced?
- Will this preserve academic history?

If uncertain, ask before generating code.

---

## End of Student Service Rules
# STUDENT SERVICE RULES — IMS

This document defines the **domain boundaries, responsibilities, and invariants**
for the `ims-student-service` in the Institute Management System (IMS).

Any AI agent generating or modifying code for student-service MUST strictly
follow these rules.

---

## 1. Purpose of Student Service

The student-service is responsible for managing **student identity and lifecycle**
within an academic institution.

It owns:
- Student personal profiles
- Student guardians and relationships
- Student enrollments
- Student documents
- Academic participation context

Student-service does NOT manage:
- Authentication or credentials
- Academic structure (programs, offerings, subjects)
- Fees, payments, or accounting
- Attendance marking or exams

---

## 2. Core Philosophy

A student is a **person first**, not an academic unit.

Academic participation is defined **only via enrollment**.

Key principles:
- Students exist independently of academics
- Enrollment defines academic context
- Students may have multiple enrollments over time
- Student data must be reusable across years

Never conflate student identity with academic placement.

---

## 3. Entity Ownership

Student-service is the source of truth for:

- ImsStudents
- ImsStudentGuardians
- ImsStudentEnrollments
- ImsStudentDocuments
- Student lifecycle metadata

These are the main Entities for this service, if required in future we may create more also based on the requirement.
No other service may create or modify these entities.

---

## 4. Identity & Auth Relationship (Critical)

- Every student may be linked to:
  - An auth user (for portal access)
  - Or exist without login credentials
- Student-service must NOT manage:
  - Passwords
  - Roles
  - Tokens

Rules:
- `user_id` is a reference only
- Authentication is owned by auth-service
- Student-service must validate user ownership via tenant context

---

## 5. Tenant Scope & Security Invariants

- Every student record belongs to exactly one tenant
- Tenant context must come from authentication
- Frontend-provided tenant IDs must not be trusted blindly
- Cross-tenant student access is strictly forbidden

Security invariant:
- A student can only be enrolled into offerings of the same tenant

---

## 6. Students — Personal Identity

Students represent **individual persons**.

Rules:
- Students are NOT tied directly to:
  - Programs
  - Classes
  - Subjects
- Students may exist without enrollment
- Global uniqueness must be enforced for:
  - Email
  - Phone
  - Admission number (where applicable)

Student entity should remain stable across years.

---

## 7. StudentEnrollments — Academic Participation (MOST IMPORTANT)

StudentEnrollments define **where and when a student studies**.

Rules:
- Enrollment is mandatory for academic activity
- Each enrollment links:
  - One student
  - One offering
- Students may have multiple enrollments across time
- Enrollment must validate:
  - Offering existence
  - Offering tenant ownership
  - Offering active status

Promotion is implemented as:
- Creating a new enrollment
- Never updating an old one

---

## 8. Enrollment Lifecycle Rules

Enrollment states may include:
- ACTIVE
- COMPLETED
- WITHDRAWN
- TRANSFERRED

Rules:
- Enrollment history must be preserved
- Old enrollments must not be deleted
- Reports must rely on enrollment records

---

## 9. StudentGuardians — Relationships

StudentGuardians represent **parent or guardian relationships**.

Rules:
- A student may have multiple guardians
- Guardians may be shared across siblings
- Guardian contact details must be validated
- Guardian access (login) is optional and future-ready

Guardians are relational context, not identity owners.

---

## 10. StudentDocuments — Evidence & Records

StudentDocuments represent **uploaded artifacts**.

Examples:
- Birth certificate
- Transfer certificate
- ID proof

Rules:
- Document storage is abstracted (local, S3, etc.)
- Database stores only metadata and file reference
- Actual file storage must not block core student operations

Documents are attachments, not primary data.

---

## 11. Data Creation Order (Invariant)

Correct order when onboarding a student:

1. Create Student
2. Create StudentEnrollment
3. Assign Guardians (optional)
4. Upload Documents (optional)

Skipping enrollment results in an academically inactive student.

---

## 12. API Design Rules (Service-Specific)

- APIs must support:
  - Wizard-style student onboarding
  - Partial data saving
- Enrollment creation must be explicit
- Avoid APIs that combine student creation and enrollment invisibly
- Enrollment APIs must validate academic-service data via ID checks

---

## 13. Cross-Service Interaction Rules

Student-service:
- Consumes offering IDs from academic-service
- Does NOT query academic tables directly
- Must NOT assume academic structure
- Must remain loosely coupled

All cross-service interactions are via identifiers only.

---

## 14. Error Handling & Validation

- Missing enrollment must be treated as domain error
- Clear error messages must be returned:
  - Student not found
  - Offering not found
  - Enrollment invalid
- Validation must occur in service layer

---

## 15. Anti-Patterns (Must Never Happen)

- Attaching students directly to classes or subjects
- Updating enrollment to represent promotion
- Deleting enrollment history
- Hardcoding academic assumptions
- Trusting frontend tenant IDs

---

## 16. Future-Proofing Guidelines

Design assuming future support for:
- Attendance
- Exams
- Promotion workflows
- Analytics
- Parent portals

Do not block these through rigid schemas.

---

## 17. How the AI Agent Should Think

When working on student-service, always ask:
- Is this student identity or academic participation?
- Does this respect enrollment-based modeling?
- Is tenant isolation enforced?
- Will this preserve academic history?

If uncertain, ask before generating code.

---

## End of Student Service Rules
