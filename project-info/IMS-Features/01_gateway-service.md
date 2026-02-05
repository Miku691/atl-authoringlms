# 01 Gateway Service Implementation Plan

**Service Name**: `atl-gateway-service`
**Type**: Existing (Refactor & Improvement)
**Priority**: P0 (Critical Foundation)
**Port**: 8080

---

## 1. Current State Analysis
- **Framework**: Spring Cloud Gateway.
- **Function**: Currently handles basic routing and public endpoint exposure.
- **Gap Analysis**:
    - Lacks centralized Rate Limiting.
    - Lacks strict Tenant Context extraction and forwarding.
    - Error responses might not be standardized.
    - Security headers (CORS/CSRF) need tightening for Zero Trust.

---

## 2. Improvement Plan (Feature-Wise)

### 2.1 Security & Zero Trust Architecture
- [ ] **Tenant Context Filter**:
    - **Goal**: Every request *must* resolve to a Tenant.
    - **Implementation**:
        - Intercept request.
        - Check `X-Tenant-ID` header OR Subdomain (e.g., `tenant1.ims.com`).
        - Validate against cache (Redis).
        - **Reject** if tenant inactive.
        - **Forward** header `X-Tenant-Context` to downstream.
- [ ] **JWT Validation (Centralized)**:
    - **Goal**: Offload simple auth checks from microservices.
    - **Implementation**:
        - Validate signature at Gateway.
        - Pass parsed claims (User ID, Roles) in headers (`X-User-Id`, `X-User-Roles`) to downstream to avoid re-parsing everywhere.

### 2.2 Traffic Control
- [ ] **Rate Limiting**:
    - **Goal**: Prevent DDoS and abuse.
    - **Implementation**: Redis Rate Limiter.
        - Config: 100 req/sec for public, 1000 req/sec for authenticated.
- [ ] **Circuit Breakers**:
    - **Goal**: Fail fast if a service is down.
    - **Implementation**: Resilience4j fallback methods for critical routes.

### 2.3 Observability
- [ ] **Request Correlation**:
    - **Goal**: Trace request across services.
    - **Implementation**: Generate `X-Correlation-ID` if missing and pass it downstream.

### 2.4 API Routes Configuration (Static vs Dynamic)
- [ ] **Move to Dynamic Routing**:
    - Instead of hardcoded `application.yml`, fetch routes from `configuration-service` or Discovery Server metadata.

---

## 3. Technical Tasks
1.  Add dependencies: `spring-boot-starter-data-redis-reactive`, `resilience4j-spring-boot3`.
2.  Create `GlobalErrorAttributes` class for JSON reliability.
3.  Create `TenantResolutionFilter` (GlobalFilter).
4.  Update `securityWebFilterChain` to be stricter.
