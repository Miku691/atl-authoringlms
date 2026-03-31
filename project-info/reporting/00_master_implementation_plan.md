# IMS Reporting Module — Master Implementation Plan

> Full phased implementation plan for the IMS Reporting Module.  
> This covers Phase 1 through 3 with task breakdown, dependencies, and verification criteria.

---

## Overview

The reporting module is built around:
1. **`ims-reports-service`** — Spring Boot microservice (already scaffolded)
2. **`ims_reports_db`** — Dedicated MySQL database with cross-schema views
3. **`atl-web-ui` Reports Tab** — React TypeScript frontend
4. **Gateway Routing** — New route added to `atl-gateway-service`

---

## Architecture Summary

```
Browser (React)
     │
     │  GET /ims-reports/attendance/monthly?offeringId=X&yearMonth=2025-03&format=pdf
     ▼
atl-gateway-service   (validates JWT, injects X-Tenant-Id header, routes to service)
     │
     ▼
ims-reports-service   (validates tenant, loads data from views, generates file)
     │
     ▼
ims_reports_db        (MySQL database with cross-schema views)
     │ (views reference)
     ├── ims_student_db
     ├── ims_academic_db
     ├── ims_finance_db
     └── ims_instructor_db
```

---

## Phase 1: Foundation (Core Reports)

### Step 1.1 — Database: Create `ims_reports_db` and Views

**Location:** `D:\ATL\mysql-init\` → add reporting views SQL file

**Tasks:**
- [ ] Create new file: `D:\ATL\mysql-init\03_reporting_views.sql`
- [ ] Create `ims_reports_db` schema
- [ ] Create reporting MySQL user with SELECT-only permissions on views
- [ ] Implement these views:
  - `vw_rpt_student_enrollment`
  - `vw_rpt_student_guardian`
  - `vw_rpt_attendance_detail`
  - `vw_rpt_attendance_summary`
  - `vw_rpt_fee_collection`
  - `vw_rpt_fee_outstanding`
  - `vw_rpt_expense_summary`
  - `vw_rpt_budget_vs_actual`
  - `vw_rpt_offering_overview`
  - `vw_rpt_assignment_submissions`
  - `vw_rpt_student_academic_summary`

---

### Step 1.2 — Backend: Configure `ims-reports-service`

**Tasks:**

**pom.xml** — Add dependencies:
- `net.sf.jasperreports:jasperreports:7.0.1`
- `com.github.librepdf:openpdf:2.0.3`
- `org.apache.poi:poi-ooxml:5.3.0`
- `spring-boot-starter-data-jpa`
- `mysql-connector-j`
- `spring-cloud-starter-netflix-eureka-client`
- `spring-boot-starter-security`
- `lombok`
- `modelmapper`

**application.yml** — Configure:
- Port: 8087
- DataSource: `ims_reports_db`
- Eureka registration
- JPA `ddl-auto: validate`

**Security:**
- `AuthenticationFromGatewayFilter` (copy from another service pattern)
- `SecurityConfig` with role-based endpoint rules

---

### Step 1.3 — Backend: View Entities & Repositories

**Files to create:**

| Entity | Maps to View |
|--------|-------------|
| `VwStudentEnrollment.java` | `vw_rpt_student_enrollment` |
| `VwAttendanceSummary.java` | `vw_rpt_attendance_summary` |
| `VwFeeCollection.java` | `vw_rpt_fee_collection` |
| `VwFeeOutstanding.java` | `vw_rpt_fee_outstanding` |
| `VwOfferingOverview.java` | `vw_rpt_offering_overview` |

Repositories: JPA + JdbcTemplate where needed.

---

### Step 1.4 — Backend: Jasper Report Templates

**Location:** `src/main/resources/reports/`

**Templates to create (JRXML):**
1. `attendance_monthly.jrxml`
2. `attendance_defaulters.jrxml`
3. `fee_collection.jrxml`
4. `fee_outstanding.jrxml`
5. `student_directory.jrxml`

**Design rules:**
- Include tenant name / institution name in header (passed as parameter)
- Include report generation date/time
- Include tenant logo placeholder
- Page numbers in footer

---

### Step 1.5 — Backend: Services & Controllers

**Controllers:**
- `AttendanceReportController` → `/ims-reports/attendance/**`
- `FinanceReportController` → `/ims-reports/finance/**`
- `StudentReportController` → `/ims-reports/student/**`
- `AcademicReportController` → `/ims-reports/academic/**`

**Services:**
- `AttendanceReportService`
- `FinanceReportService`
- `StudentReportService`

---

### Step 1.6 — Gateway: Route Configuration

**File:** `D:\ATL\atl-gateway-service\src\main\resources\application.yml`

Add route:
```yaml
- id: ims-reports-service
  uri: lb://ims-reports-service
  predicates:
    - Path=/ims-reports/**
  filters:
    - RewritePath=/ims-reports/(?<segment>.*), /${segment}
```

---

### Step 1.7 — Frontend: `reportService.ts`

**File:** `D:\ATL\atl-web-ui\src\api\reportService.ts`

- Generic binary download helper with `responseType: 'blob'`
- Functions for each report type
- Type definitions for all report parameters

---

### Step 1.8 — Frontend: Reports Page Components

**Directory:** `D:\ATL\atl-web-ui\src\pages\reports\`

**Components:**
- `ReportsPage.tsx` — Layout with sidebar navigation
- `attendance/MonthlyAttendanceReport.tsx`
- `attendance/DefaulterReport.tsx`
- `finance/FeeCollectionReport.tsx`
- `finance/FeeOutstandingReport.tsx`
- `student/StudentDirectoryReport.tsx`

---

## Phase 2: Extended Reports

- Budget vs Actual Report
- Assignment Submission Report
- Enrollment Summary Report
- Student Guardian Contact Report
- Expense Summary Report
- Fee Receipt (single document PDF)

---

## Phase 3: Advanced Analytics (Future)

- KPI Dashboard (in-browser charts using Recharts)
- At-Risk Student identification
- Enrollment trend graphs
- Revenue forecasting visualizations

---

## Dependencies Between Steps

```
Step 1.1 (DB Views)
      │
      ▼
Step 1.2 (Backend Config)
      │
      ▼
Step 1.3 (Entities/Repos)
      │
      ├──► Step 1.4 (Jasper Templates)
      │
      ▼
Step 1.5 (Services/Controllers)
      │
      ├──► Step 1.6 (Gateway Route) ── runs in parallel
      │
      ▼
Step 1.7 (Frontend Service)
      │
      ▼
Step 1.8 (Frontend Components)
```

---

## Docker Compose Update

Add `ims-reports-service` to `docker-compose.yml`:

```yaml
ims-reports-service:
  build: ./ims-reports-service
  ports:
    - "8087:8087"
  environment:
    - DB_REPORTS_USER=rpt_user
    - DB_REPORTS_PASSWORD=rpt_pass
    - EUREKA_URL=http://atl-discovery-server:8761/eureka/
  depends_on:
    - mysql
    - atl-discovery-server
```

---

## Recommended Start Order

1. **First:** Create `03_reporting_views.sql` and test views in MySQL Workbench
2. **Second:** Configure and boot `ims-reports-service` with JPA + datasource
3. **Third:** Implement attendance monthly report end-to-end (DB → Backend → Frontend)
4. **Then:** Expand to finance and student reports one by one

---

## Key Decisions Recorded

| Decision | Choice | Reason |
|----------|--------|--------|
| Primary PDF engine | JasperReports | Multi-format, visual designer, enterprise-grade |
| Excel engine | Apache POI | Industry standard, Apache 2.0 license |
| PDF for documents | OpenPDF (via JasperReports) | LGPL license, free for commercial use |
| Data access strategy | MySQL cross-DB views | Insulates from schema, enables cross-service joins |
| Report DB | Dedicated `ims_reports_db` | Separation of concerns, read-only access |
| Tenant isolation | `tenant_id` filter on every view query | Non-negotiable security requirement |
| API format selection | Query parameter `?format=pdf/excel/csv` | Simple, client-controlled |
| Response strategy | `byte[]` with `Content-Disposition: attachment` | Standard file download |
