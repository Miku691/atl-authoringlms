---
trigger: always_on
---

# WORKSPACE RULES — Institute Management System (IMS)

This workspace represents a **multi-tenant, AI-enabled Institute Management System** designed for schools, colleges, and coaching centers.

These rules define **how to think, design, and implement** features in this project.

---

## 1. Project Vision

The goal of this project is to build a **scalable, configurable, and future-proof education ERP** that:

- Supports **multiple institution types** (school, college, coaching)
- Works as a **multi-tenant SaaS platform**
- Separates **identity, academics, operations, and finance** cleanly
- Treats academic structure as **configurable**, not hardcoded
- Allows gradual onboarding and setup (wizard-based)
- Can evolve into a **platform**, not just an application

This is NOT a CRUD-heavy monolith.  
This is a **domain-driven, service-oriented system**.

---

## 2. Core Architectural Principles

- Microservices are **domain boundaries**, not just technical splits
- Each service owns its **data and rules**
- Cross-service references are by **IDs only**, never joins
- Services communicate via:
  - APIs (sync)
  - Events (future)
- Tenant isolation is **non-negotiable**

---

## 3. Multi-Tenancy Mindset

- Every meaningful domain record belongs to a **tenant**
- Tenant context comes from authentication, not from UI trust
- No API should allow cross-tenant data leakage
- Tenant onboarding is **progressive**, not instant

A tenant may exist in one of these states:
- Created
- Partially configured
- Academically active

The system must support all three.

---

## 4. Identity vs Domain Separation

- `atl-auth-service` is the **single source of truth** for users
- Domain services (student, instructor, staff) extend identity
- A user may exist without a domain profile
- Domain profiles also may exist without a auth user (because some tenant may not provide student login, but students should be there in ims-student-service)

Never duplicate authentication logic in domain services.

---

## 5. Academic Domain Philosophy

Academic modeling follows **real-world education systems**, not UI convenience.

Key ideas:
- **Programs** define curriculum intent
- **Offerings** define real academic runs (class/batch/semester)
- **Offerings are the operational core**
- Students, instructors, subjects, attendance, exams all attach to offerings

Classes and sections are **structural helpers**, not primary identity.

---

## 6. Student Lifecycle Thinking

A student:
- Is a **person** first
- Becomes academically active via **enrollment**
- Can have multiple enrollments over time

Rules:
- Never attach a student directly to a class or subject
- Enrollment is mandatory for any academic activity
- Promotion = new enrollment, not update

---

## 7. Instructor & Staff Philosophy

- Instructors and staff are **roles people play**, not identities
- Teaching assignments are contextual and time-bound
- Staff roles define **operational responsibility**, not security

Avoid rigid assumptions — flexibility is key.

---

## 8. Academic Setup Flow (Mental Model)

Think in this order when designing features:

1. Tenant exists
2. Tenant chooses institution type
3. Programs are defined
4. Offerings are created
5. Subjects are mapped to offerings
6. Users are onboarded
7. Students are enrolled
8. Academics become active

The UI and APIs must support **partial progress and resumption**.

---

## 9. Setup & Bootstrap Philosophy

- No tenant should be considered active until minimum academic setup is complete
- Setup is:
  - Step-driven
  - Validated
  - Re-entrant
- System must be able to answer:
  “What is missing to complete setup?”

Avoid hard blocking unless absolutely required.

---

## 10. Data Modeling Rules (Project-Specific)

- UUID (String) is mandatory for all entities
- Entities must be future-proof
- Prefer configuration over hardcoding
- Use enums only when values are truly stable
- Design entities assuming future:
  - AI features
  - Analytics
  - Reporting

---

## 11. API Design Philosophy

- APIs should support:
  - Wizard-based UI
  - Progressive disclosure
  - Partial saves
- Avoid APIs that require “everything at once”
- Prefer composable, small APIs over giant payloads

---

## 12. Error Handling & UX Alignment

- Errors must be:
  - Domain-specific
  - User-comprehensible
- Backend errors should map cleanly to UI actions
- Avoid generic error messages

The backend exists to **support good UX**, not fight it.

---

## 13. AI Integration Mindset (Phase 2, not currently)

- AI is an **assistant**, not an authority
- AI outputs must always be reviewable
- AI must respect:
  - Tenant boundaries
  - Academic structure
  - Business rules
- Never allow AI to bypass validation or authorization

---

## 14. Scalability & Future Thinking

Always assume:
- More tenants
- More data
- More users
- More modules

Design so that:
- Adding a new module does not break existing ones
- Schema changes are manageable
- New institution types can be supported

---

## 15. How the AI Agent Should Think

When generating code or designs, always ask internally:
- Does this respect tenant isolation?
- Does this align with academic domain logic?
- Does this allow future extension?
- Is this consistent with previous entities?
- Would this work for school, college, and coaching?

If unsure, ask before generating.

---

## End of Workspace Rules