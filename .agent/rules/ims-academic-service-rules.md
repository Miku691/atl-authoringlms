---
trigger: manual
---

# ACADEMIC SERVICE RULES — IMS

This document defines the **domain boundaries, responsibilities, and invariants**
for the `ims-academic-service` in the Institute Management System (IMS).

These rules must be respected by any AI agent generating or modifying code
related to academic-service.

---

## 1. Purpose of Academic Service

The academic-service is the **academic structure engine** of IMS.

Its responsibility is to define:
- What academic programs exist
- How academics are operationalized over time
- How teaching units (classes, batches, semesters) are structured
- How subjects are mapped to those teaching units

Academic-service does NOT manage:
- Users or authentication
- Payments or fees
- Attendance marking
- Exams or grading (future services)

---

## 2. Core Philosophy

Academic modeling must reflect **real-world educational systems**, not UI convenience.

Key principles:
- Programs define **curriculum intent**
- Offerings define **real academic runs**
- Offerings are the **operational core**
- Everything academic ultimately attaches to an **offering**

If a concept changes every year or batch, it belongs to an Offering.

---

## 3. Entity Ownership

Academic-service is the source of truth for:

- ImsPrograms
- ImsOfferings
- ImsClasses
- ImsSections
- ImsSubjects
- ImsOfferingSubjects
- Academic metadata (years, structure, mappings)

Those are the main Entities for this service, if required in future we may create more also based on the requirement.

No other service may create or mutate these entities.

---

## 4. Tenant Scope & Isolation (Critical)

- Every academic entity is **tenant-scoped**
- Tenant context must be derived from authentication
- Tenant ID passed from frontend must NEVER be trusted blindly
- Cross-tenant academic access is strictly forbidden

Security invariant:
- An offering is valid only within its tenant
- Subjects may be global, but mappings are tenant-bound

---

## 5. Programs — Curriculum Definition

Programs represent **what an institution offers academically**.

Examples:
- CBSE School
- B.Tech Computer Science
- IIT-JEE Coaching

Rules:
- Programs are long-lived
- Programs are not time-bound
- Students never enroll directly into programs
- Programs exist to group offerings

Programs define possibility, not execution.

---

## 6. Offerings — Operational Teaching Units (MOST IMPORTANT)

Offerings represent **real, time-bound teaching units**.

Examples:
- Class 10 (2024–25)
- Semester 3 (2023–24)
- IIT-JEE Batch A

Rules:
- Offerings are tenant-scoped and program-bound
- Offerings are time-bound (start and end dates)
- Students enroll ONLY into offerings
- Attendance, exams, timetable will attach to offerings
- Offerings change every academic cycle

UI must treat offerings as:
- Classes (school)
- Semesters (college)
- Batches (coaching)

---

## 7. Classes — Structural Grade Definitions (School Only)

Classes represent **reusable grade labels**.

Examples:
- Class 1
- Class 10

Rules:
- Classes are NOT time-bound
- Classes do not own students
- Classes exist to support:
  - Sections
  - Consistency across years
- Classes should not be exposed as primary entities in UI

Classes are templates, not academic instances.

---

## 8. Sections — Subdivisions of Classes

Sections represent **structural subdivisions** such as A, B, C.

Rules:
- Sections are always linked to a Class
- Sections are optional
- Students are not enrolled directly into sections
- Section assignment may be contextual to an offering

Sections help organization, not enrollment.

---

## 9. Subjects — Academic Knowledge Units

Subjects represent **what is taught**, independent of time.

Examples:
- Mathematics
- Physics
- Chemistry

Rules:
- Subjects are reusable
- Subjects are not tied to academic years
- Subjects are not tied directly to students
- Subjects gain context only via offerings

---

## 10. OfferingSubjects — Academic Mapping Layer

OfferingSubjects define **which subjects are taught in which offering**.

Rules:
- This is a many-to-many mapping between Offerings and Subjects
- This is where syllabus depth, weightage, and hours evolve later
- Without OfferingSubjects, an offering has no academic content

This entity is mandatory for meaningful academics.

---

## 11. Data Creation Order (Invariant)

Academic data must be created in this order:

1. Program
2. Subjects (can be parallel)
3. Offering
4. Class (school only)
5. Section (optional)
6. OfferingSubjects

Violating this order leads to broken academic state.

---

## 12. Academic Setup & Bootstrap

Academic-service must support **progressive setup**.

Rules:
- Partial setup must be allowed
- APIs must support resumption
- System must be able to report:
  “What academic components are missing?”

Academic setup is not a single atomic operation.

---

## 13. API Design Rules (Service-Specific)

- APIs should be small and composable
- Avoid APIs that require entire academic structure at once
- Prefer:
  - Create Program
  - Create Offering
  - Map Subjects
- APIs must be wizard-friendly

---

## 14. Cross-Service Interaction Rules

Academic-service:
- Provides offering IDs to student-service
- Provides offering IDs to instructor-service
- Does NOT query student or user data
- Must remain independent of auth-service internals

Only IDs cross service boundaries.

---

## 15. Error Handling & Validation

- Invalid academic structure must fail fast
- Clear domain errors must be returned:
  - Program not found
  - Offering not active
  - Subject not mapped
- Validation must happen at service layer

---

## 16. Anti-Patterns (Must Never Happen)

- Attaching students directly to classes
- Attaching students directly to subjects
- Making offerings optional
- Mixing academic logic into auth or student service
- Assuming only schools exist

---

## 17. Future-Proofing Guidelines

Design entities assuming future:
- Exams
- Attendance
- Promotion
- Academic year closure
- Analytics
- AI-driven insights

Avoid schema decisions that block these.

---

## 18. How the AI Agent Should Think

When working on academic-service, always ask:
- Is this concept time-bound?
- Does this belong to an offering?
- Does this respect tenant isolation?
- Will this work for school, college, and coaching?

If unsure, ask before generating code.

---

## End of Academic Service Rules