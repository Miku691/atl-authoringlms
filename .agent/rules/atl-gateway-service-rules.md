---
trigger: always_on
---

# GATEWAY SERVICE RULES — IMS

This document defines the **responsibilities, security invariants, and architectural
expectations** for the `atl-gateway-service` in the Institute Management System (IMS).

The gateway-service is the **first and most critical security boundary** of the system.
Any AI agent generating or modifying gateway-service code MUST strictly follow these rules.

---

## 1. Purpose of Gateway Service

The gateway-service acts as the **single entry point** to the IMS platform.

Its responsibilities include:
- Request routing to microservices
- Authentication validation
- Authorization pre-checks
- Tenant context enforcement
- Security hardening
- Observability (logging, tracing)

Gateway-service does NOT:
- Contain business logic
- Modify domain data
- Replace service-level authorization

---

## 2. Industry-Standard Philosophy (Zero Trust)

The gateway follows **Zero Trust Architecture** principles:

- Never trust incoming requests
- Always verify identity
- Always validate authorization
- Assume downstream services are isolated but not exposed

Industry standard (Netflix, AWS, Google):
- Gateway enforces **identity + coarse authorization**
- Services enforce **fine-grained authorization**

---

## 3. Current Gateway State (Acknowledged)

The system already has:
- API Gateway in place
- Routing to auth-service and other services
- Open endpoints for:
  - Signup
  - Login
  - OTP verification

This is correct and should be preserved.

---

## 4. Authentication Rules (Critical)

### 4.1 Public Endpoints (Explicit Allowlist)

The gateway MUST allow unauthenticated access ONLY to:

- User signup
- Login
- OTP send
- OTP verify
- Health checks

These endpoints must be:
- Explicitly allowlisted
- Minimal
- Reviewed regularly

Never use blanket exclusions.

---

### 4.2 Protected Endpoints

All other endpoints MUST:
- Require a valid JWT
- Reject requests without Authorization header
- Reject expired or malformed tokens

The gateway must:
- Validate JWT signature
- Validate token expiry
- Validate token issuer

---

## 5. Tenant Context Enforcement (Very Important)

- Tenant context must be extracted from JWT claims
- Tenant ID must NEVER be trusted from request headers or body
- Gateway must:
  - Inject tenant context into downstream headers
  - Strip any tenant identifiers provided by client

Security invariant:
- A request without tenant context is invalid for domain services

---

## 6. Role & Authorization Handling

### 6.1 Role Validation at Gateway Level

Gateway must perform **coarse-grained authorization**:
- Validate that user has at least one required role
- Reject requests early if role is incompatible

Example:
- STUDENT cannot access admin-only routes
- TENANT_ADMIN required for setup APIs

Gateway must NOT:
- Perform fine-grained domain checks
- Understand business rules

---

### 6.2 Role Propagation

Gateway must forward:
- User ID
- Tenant ID
- Roles
- Permissions (if applicable)

These must be passed via headers or context, not request body.

---

## 7. Request Sanitization & Hardening

Gateway must:
- Strip unknown headers
- Block dangerous HTTP methods if unused
- Enforce payload size limits
- Enforce rate limiting (per user / per IP)

This protects downstream services.

---

## 8. Routing Rules

- Routing must be explicit and predictable
- Avoid dynamic or wildcard routing when possible
- Route paths must align with service boundaries

Example:
- `/ims-student/**` → student-service
- `/ims-academic/**` → academic-service

Never allow one service to access another internally via gateway.

---

## 9. Error Handling & Response Consistency

- Authentication failures must return 401
- Authorization failures must return 403
- Gateway errors must not leak internal details
- Error responses must be consistent and minimal

Gateway should not expose stack traces.

---

## 10. Logging & Observability

Gateway must log:
- Request ID
- User ID (if authenticated)
- Tenant ID
- Target service
- Response status

Do NOT log:
- JWT tokens
- Passwords
- Sensitive payloads

Gateway logs are security artifacts.

---

## 11. Performance & Reliability Rules

- Gateway must be stateless
- Avoid blocking operations
- Prefer reactive / async processing
- Gateway failure should not corrupt downstream state

---

## 12. How to Improve Existing Gateway (Incremental Plan)

The current gateway can be improved by:

1. Centralizing JWT validation logic
2. Introducing role-based route guards
3. Adding tenant context injection
4. Adding request correlation IDs
5. Adding rate limiting per tenant
6. Adding structured logging
7. Adding gateway-level audit hooks (future)

These improvements must be incremental and non-breaking.

---

## 13. Cross-Service Security Contract

Gateway guarantees to downstream services:
- Request is authenticated
- Tenant context is valid
- Roles are verified at a coarse level

Downstream services must:
- Re-validate tenant ownership
- Enforce fine-grained authorization
- Never trust gateway blindly

Defense in depth is mandatory.

---

## 14. Anti-Patterns (Must Never Happen)

- Business logic in gateway
- Blind forwarding without validation
- Trusting client-provided tenant IDs
- Hardcoding role logic per endpoint
- Gateway-to-service data mutation

---

## 15. How the AI Agent Should Think

When working on gateway-service, always ask:
- Does this reduce attack surface?
- Does this fail fast?
- Does this protect downstream services?
- Is tenant isolation enforced?
- Is this aligned with Zero Trust?

If unsure, ask before generating code.

---

## End of Gateway Service Rules