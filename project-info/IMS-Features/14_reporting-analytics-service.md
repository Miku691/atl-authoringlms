# 14 Reporting & Analytics Service Plan

**Service Name**: `ims-reporting-analytics-service`
**Type**: New (Creation Plan)
**Priority**: P4 (Insights)
**Port**: Dynamic / 808X

---

## 1. Purpose
Read-Only service for heavy aggregations. Prevents "Report Generation" from crashing the main DBs.

---

## 2. Feature Implementation Plan

### 2.1 Data Pipeline
- [ ] **ETL Strategy**:
    - Option A: Connect to Read-Replicas of other microservices (complex security).
    - Option B: Listen to Domain Events and build a local "Data Warehouse" schema.
    - **Decision**: **Option B** (Event Sourcing Lite).
        - Listen to `ATTENDANCE_MARKED`, `FEE_PAID`.
        - Store in optimized Aggregation Tables.

### 2.2 Dashboards
- [ ] **API**: `GET /analytics/tenant/summary`
    - Total Students, Collections this Month, Avg Attendance.

---

## 3. Technical Tasks
1.  Initialize Service.
2.  Consider using a Columnar Store (e.g., if switching DBs) or just optimized SQL tables with Indexes for reports.
