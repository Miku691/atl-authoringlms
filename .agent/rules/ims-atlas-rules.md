---
trigger: always_on
---

# IMS ATLAS RULES — Living System Map

IMS Atlas is a **living HTML + CSS based infographic and system tree**
that visually represents the architecture, flows, and relationships
of the Institute Management System (IMS).

Any AI agent working on this project MUST treat IMS Atlas as:
- A first-class artifact
- A continuously updated system map
- A single source of architectural truth for humans

---

## 1. Purpose of IMS Atlas

IMS Atlas exists to:
- Explain how the IMS works end-to-end
- Visualize service boundaries and interactions
- Show data ownership and flow
- Help developers understand impact of changes
- Act as a reference during debugging, onboarding, and reviews

IMS Atlas is NOT marketing material.  
It is a **technical-explanatory system map**.

---

## 2. Core Principles

- Atlas must be **self-explanatory**
- Atlas must be **human-readable**
- Atlas must be **updated when the system changes**
- Atlas must reflect **actual implementation**, not plans

If code changes and Atlas is not updated, the change is incomplete.

---

## 3. Format & Technology Constraints

- IMS Atlas must be implemented using:
  - Plain HTML
  - External css framenwrok cdn
  - CSS (utility-first or minimal custom)
  - Optional lightweight JS (no frameworks)
- No backend dependency
- Must be viewable locally in browser
- Must be version-controlled with the project

---

## 4. Structural Layout Rules

IMS Atlas must be structured into **clear visual layers**:

1. Entry Layer (Client & Gateway)
2. Security Layer (Auth & Tenant)
3. Core Domain Services
4. Supporting Services
5. Cross-Cutting Concerns
6. Data Ownership & Flow

Each layer must be visually distinct.

---

## 5. Mandatory Sections in IMS Atlas

The HTML system must include at least:

- System Overview (What IMS is)
- Microservices Tree View
- Service Responsibilities (short descriptions)
- Data Ownership Matrix (which service owns what)
- Core Flows (Login, Setup, Enrollment, Operations)
- Security Boundaries
- Tenant Isolation Visualization

---

## 6. Tree-Based Navigation Rules

IMS Atlas must expose a **tree-style navigation**, such as:

- Gateway
  - Auth Service
  - Student Service
  - Academic Service
- Academic Service
  - Programs
  - Offerings
  - Subjects
- Student Service
  - Students
  - Enrollments
  - Guardians

Tree nodes must:
- Be expandable/collapsible
- Link to detailed sections
- Show relationships visually

---

## 7. Service Responsibility Rules

For each microservice, IMS Atlas must show:

- Purpose of the service
- Owned entities
- Referenced entities
- Downstream dependencies
- Upstream dependencies

No service should appear without explanation.

---

## 8. Flow Visualization Rules

IMS Atlas must visually represent **key flows**, such as:

- Authentication & Tenant Resolution
- Tenant Setup Flow
- Academic Setup Flow
- Student Enrollment Flow
- Role-Based Access Flow

Flows must show:
- Direction
- Service boundaries
- Validation points

---

## 9. Security-First Visualization Rules

Security must be visible, not implicit.

IMS Atlas must clearly show:
- Gateway as first security boundary
- Auth service as identity source
- Tenant context propagation
- Role checks at gateway
- Fine-grained checks at services

Security assumptions must never be hidden.

---

## 10. Update Rules (CRITICAL)

Any AI agent that:
- Adds a new service
- Modifies a service responsibility
- Introduces a new flow
- Changes a dependency

MUST:
- Update IMS Atlas HTML
- Update the tree view
- Update flow diagrams (if impacted)

Atlas updates are mandatory, not optional.

---

## 11. Change Detection Thinking

When making changes, the AI agent must ask:

- Does this affect a service boundary?
- Does this change data ownership?
- Does this introduce a new dependency?
- Does this modify an existing flow?

If YES to any → IMS Atlas must be updated.

---

## 12. Level of Detail Rules

IMS Atlas should:
- Stay high-level by default
- Allow drill-down for details
- Avoid class-level or method-level noise

It explains architecture, not implementation internals.

---

## 13. Naming & Consistency Rules

- Service names must match actual service names
- Entity names must match actual entities
- Terminology must match Workspace Rules

Atlas must never invent concepts that don’t exist.

---

## 14. AI Agent Responsibilities

The AI agent must:
- Keep Atlas in sync with code
- Never let Atlas drift from reality
- Treat Atlas as a living artifact
- Prefer updating Atlas proactively

Atlas is part of the deliverable.

---

## 15. Human Usage Expectation

A developer should be able to:
- Open IMS Atlas
- Understand the system in 5–10 minutes
- Trace a feature end-to-end
- Identify where to make changes

If this is not possible, Atlas is incomplete.

---

## End of IMS Atlas Rules