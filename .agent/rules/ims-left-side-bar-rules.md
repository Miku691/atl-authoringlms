---
trigger: always_on
---

# IMS LEFT SIDEBAR RULE SHEET

This document defines the **logical structure, intent, and rules**
for the Left Sidebar Navigation in the Institute Management System (IMS).

The sidebar is a **domain-driven navigation model**, not a static menu.

Any AI agent generating UI, APIs, or permissions related to navigation
MUST follow these rules.

---

## 1. Purpose of the Left Sidebar

The Left Sidebar represents:
- The **capabilities enabled for a tenant**
- The **permissions of the logged-in user**
- The **current setup state** of the tenant

The sidebar is:
- Context-aware
- Role-aware
- Tenant-aware
- Setup-aware

It must never be static or hardcoded.

---

## 2. High-Level Sidebar Philosophy

- Navigation reflects **what the user can do now**
- Features appear only when they are **valid and usable**
- Incomplete setup hides or disables dependent features
- Security is enforced at backend first, UI second

The sidebar is a **projection of backend truth**, not frontend assumptions.

---

## 3. Sidebar Structure (Top-Level Domains)

The sidebar is organized by **domain responsibility**, not by tables or services.

Top-level sections:

1. Dashboard
2. Setup & Configuration
3. Academics
4. People
5. Operations
6. Finance
7. Learning & Content
8. Communication
9. Reports & Analytics
10. System & Security

---

## 4. Dashboard

Purpose:
- High-level snapshot of tenant activity
- Entry point after login

Rules:
- Always visible after login
- Content varies by role
- No direct mutations from dashboard

---

## 5. Setup & Configuration

Purpose:
- Progressive tenant onboarding
- Initial academic configuration

Visible only if:
- User has TENANT_ADMIN or SUPER_ADMIN role
- Tenant setup is incomplete OR editable

Includes:
- Institution type setup (School / College / Coaching)
- Program setup
- Offering setup
- Subject setup

Rules:
- This section disappears or becomes read-only once setup is completed
- Setup completion is backend-driven, not UI-driven

---

## 6. Academics

Purpose:
- Core academic operations

Includes:
- Classes / Batches / Semesters (Offerings)
- Subjects
- Sections (school only)
- Academic structure view

Rules:
- Visible only if tenantSetupCompleted = true
- UI labels depend on tenant type
- All actions are offering-centric

Never expose:
- Raw class templates directly
- Program-only views without offerings

---

## 7. People

Purpose:
- Manage all human actors in the system

Includes:
- Students
- Instructors
- Staff
- Guardians (contextual)

Rules:
- Visibility depends on role
- Creation flows must enforce tenant and academic rules
- Students must always be enrolled into offerings

People section is identity-centric, not academic-centric.

---

## 8. Operations

Purpose:
- Day-to-day academic operations

Includes:
- Attendance
- Timetable
- Assignments (future)
- Exams (future)

Rules:
- All operations must be offering-based
- Cannot function without completed academic setup
- Hidden or disabled if no active offerings exist

---

## 9. Finance

Purpose:
- Financial management of the institution

Includes:
- Fee structures
- Student fees
- Payments
- Payroll (future)
- Expenses

Rules:
- Finance depends on enrollment and offerings
- Finance data must never be mixed across tenants
- Access restricted to finance/admin roles

---

## 10. Learning & Content

Purpose:
- Learning Management System (LMS) features

Includes:
- Study materials
- Notes
- Videos
- AI-assisted content generation

Rules:
- Content must be linked to offerings or subjects
- AI features must be permission-controlled
- Content visibility respects enrollment

---

## 11. Communication

Purpose:
- Institutional communication layer

Includes:
- Announcements
- Notifications
- Messages (SMS / Email / WhatsApp)

Rules:
- Communication is event-driven
- No direct business logic
- Visibility depends on role and context

---

## 12. Reports & Analytics

Purpose:
- Insights and compliance

Includes:
- Academic reports
- Attendance reports
- Financial summaries
- Performance analytics

Rules:
- Reports must be tenant-scoped
- Reports rely on historical data (do not mutate)
- Access restricted by role

---

## 13. System & Security

Purpose:
- Platform-level administration

Includes:
- User management
- Role management
- Permissions
- Audit logs
- API keys (future)

Rules:
- Visible only to SUPER_ADMIN / TENANT_ADMIN
- Security changes must be audited
- No academic logic here

---

## 14. Role-Based Visibility Rules (Critical)

- Sidebar items must be filtered by role
- Roles define capability, not UI preference
- Backend authorization is the source of truth
- UI visibility must never bypass backend checks

---

## 15. Setup-Aware Visibility Rules

- Features depending on academics must be hidden until setup completion
- Student enrollment requires offerings
- Operations require active enrollments
- Finance requires active students

Sidebar must reflect readiness, not possibility.

---

## 16. Tenant-Type Adaptation Rules

The same sidebar structure adapts labels dynamically:

- School: Classes, Sections
- College: Programs, Semesters
- Coaching: Batches

Behavior stays same; labels change.

---

## 17. Security Invariants (Non-Negotiable)

- Sidebar must not expose unauthorized routes
- No route should be accessible just because it is visible
- Backend must re-validate every action
- Tenant isolation applies to navigation as well

---

## 18. How the AI Agent Should Think

When generating sidebar logic or UI:
- Ask what domain this feature belongs to
- Check tenant setup state
- Check user role
- Check dependency readiness
- Never expose incomplete or invalid flows

The sidebar is a **contract between backend state and user experience**.

---

## End of Sidebar Rules