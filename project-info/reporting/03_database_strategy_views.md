# IMS Reporting — Database Strategy (MySQL Views)

> This document explains why and how we use MySQL Views as the data aggregation layer
> for the `ims-reports-service`, given our multi-database microservices architecture.

---

## 1. The Problem: Cross-Service Data for Reports

In our IMS, data lives in **separate databases** per microservice:

| Database | Owned By | Key Tables |
|----------|----------|-----------|
| `ims_auth_db` | atl-auth-service | users, tenants, roles |
| `ims_academic_db` | ims-academic-service | offerings, classes, subjects, attendance, assignments |
| `ims_student_db` | ims-student-service | students, enrollments, guardians |
| `ims_finance_db` | ims-finance-service | fee structures, ledger, expenses, budget |
| `ims_instructor_db` | ims-instructor-service | instructors, subjects assigned |

Most meaningful reports need data from **at least two of these databases**.

Example: "Fee Defaulter Report"
- Student name → `ims_student_db`
- Enrollment (which offering) → `ims_student_db`
- Fee outstanding → `ims_finance_db`

---

## 2. Strategy: Dedicated Reporting Database

### Approach: `ims_reports_db` — A Dedicated Read-Only Database

```
┌─────────────────────────────────────────────────────────┐
│                    ims_reports_db                        │
│  (Separate logical DB on same MySQL instance)            │
│                                                          │
│  Views referencing cross-DB tables:                      │
│  - vw_rpt_student_enrollment                            │
│  - vw_rpt_attendance_summary                            │
│  - vw_rpt_fee_collection                                │
│  - vw_rpt_fee_outstanding                               │
│  - ...                                                   │
└─────────────────────────────────────────────────────────┘
```

### How MySQL Cross-DB Views Work

MySQL fully supports views that span multiple databases **if they are on the same MySQL instance**:

```sql
-- In ims_reports_db
CREATE VIEW vw_rpt_student_enrollment AS
SELECT
    s.id                AS student_id,
    s.tenant_id,
    s.full_name         AS student_name,
    s.admission_number,
    e.id                AS enrollment_id,
    e.offering_id,
    e.status            AS enrollment_status,
    e.enrolled_on
FROM ims_student_db.ims_students s
JOIN ims_student_db.ims_student_enrollments e ON s.id = e.student_id;
```

This view lives in `ims_reports_db` but reads from `ims_student_db`. This is standard MySQL behavior.

---

## 3. Why Views, Not Direct Queries?

### Advantages of Views

| Concern | Without Views | With Views |
|---------|--------------|-----------|
| **Query Complexity** | Reports service must write complex JOINs in Java | JOINs abstracted in view, service just `SELECT * FROM vw_ WHERE tenant_id=?` |
| **Schema Changes** | Changing a table breaks all reports | Only the view needs updating, service is insulated |
| **Security** | Reports service must have access to all source tables | Grant SELECT only on views, not source tables |
| **Performance** | Same complex query written multiple times | View optimized once, reused everywhere |
| **Tenant Isolation** | Every query must include `WHERE tenant_id=?` | View enforces tenant column, service just filters |
| **Database Coupling** | Reports tightly coupled to source schemas | Loose coupling through view abstraction |

### Why Not Stored Procedures?

- Stored procedures embed business logic in the database — anti-pattern in microservices
- Harder to version, test, and maintain
- Views are read-only and transparent — ideal for reporting
- Procedures are better for writes and computations; we don't need them for reports

### Why Not API Composition?

- Calling 4–5 microservice REST APIs per report request is slow and fragile
- Large reports (e.g., 500 students' attendance) would generate hundreds of API calls
- Creates tight runtime coupling between services
- Database views are faster and simpler for batch/bulk data

---

## 4. All Planned MySQL Views

### 4.1 Student Domain Views

```sql
-- Student enrollment with offering info (cross: student_db + academic_db in future)
CREATE OR REPLACE VIEW ims_reports_db.vw_rpt_student_enrollment AS
SELECT
    s.id              AS student_id,
    s.tenant_id,
    s.full_name,
    s.admission_number,
    s.gender,
    s.date_of_birth,
    s.mobile_number,
    s.email,
    s.status          AS student_status,
    s.created_at      AS admission_date,
    e.id              AS enrollment_id,
    e.offering_id,
    e.section_id,
    e.status          AS enrollment_status,
    e.enrolled_on,
    e.academic_session_id
FROM ims_student_db.ims_students s
LEFT JOIN ims_student_db.ims_student_enrollments e ON s.id = e.student_id;

-- Guardian contact view
CREATE OR REPLACE VIEW ims_reports_db.vw_rpt_student_guardian AS
SELECT
    s.id          AS student_id,
    s.tenant_id,
    s.full_name   AS student_name,
    s.admission_number,
    g.full_name   AS guardian_name,
    g.relation,
    g.mobile_number AS guardian_mobile,
    g.email        AS guardian_email
FROM ims_student_db.ims_students s
LEFT JOIN ims_student_db.ims_student_guardian_mapping sgm ON s.id = sgm.student_id
LEFT JOIN ims_student_db.ims_student_guardians g ON sgm.guardian_id = g.id;
```

### 4.2 Attendance Domain Views

```sql
-- Daily attendance detail
CREATE OR REPLACE VIEW ims_reports_db.vw_rpt_attendance_detail AS
SELECT
    ar.id               AS record_id,
    ar.tenant_id,
    ar.offering_id,
    ar.subject_id,
    ar.student_id,
    ar.date             AS attendance_date,
    ar.status           AS attendance_status, -- PRESENT/ABSENT/LATE
    ar.remarks,
    am.session_date,
    am.start_time,
    am.end_time
FROM ims_academic_db.ims_attendance_records ar
LEFT JOIN ims_academic_db.ims_attendance_masters am ON ar.attendance_master_id = am.id;

-- Monthly attendance summary per student per offering
CREATE OR REPLACE VIEW ims_reports_db.vw_rpt_attendance_summary AS
SELECT
    ar.tenant_id,
    ar.offering_id,
    ar.student_id,
    ar.subject_id,
    DATE_FORMAT(ar.date, '%Y-%m') AS year_month,
    COUNT(*)                       AS total_sessions,
    SUM(ar.status = 'PRESENT')     AS present_count,
    SUM(ar.status = 'ABSENT')      AS absent_count,
    SUM(ar.status = 'LATE')        AS late_count,
    ROUND(SUM(ar.status = 'PRESENT') / COUNT(*) * 100, 2) AS attendance_percentage
FROM ims_academic_db.ims_attendance_records ar
GROUP BY ar.tenant_id, ar.offering_id, ar.student_id, ar.subject_id, DATE_FORMAT(ar.date, '%Y-%m');
```

### 4.3 Finance Domain Views

```sql
-- Fee collection summary
CREATE OR REPLACE VIEW ims_reports_db.vw_rpt_fee_collection AS
SELECT
    t.id            AS transaction_id,
    t.tenant_id,
    t.student_id,
    t.amount        AS amount_paid,
    t.payment_date,
    t.payment_mode,
    t.receipt_number,
    fh.name         AS fee_head_name,
    fis.installment_number,
    fis.due_date
FROM ims_finance_db.ims_student_fee_transactions t
LEFT JOIN ims_finance_db.ims_fee_installment_schedules fis ON t.schedule_id = fis.id
LEFT JOIN ims_finance_db.ims_fee_heads fh ON fis.fee_head_id = fh.id;

-- Outstanding fee per student
CREATE OR REPLACE VIEW ims_reports_db.vw_rpt_fee_outstanding AS
SELECT
    fis.tenant_id,
    fis.student_id,
    fis.offering_id,
    fh.name              AS fee_head_name,
    fis.installment_number,
    fis.due_date,
    fis.amount           AS total_due,
    COALESCE(SUM(t.amount), 0) AS amount_paid,
    fis.amount - COALESCE(SUM(t.amount), 0) AS outstanding_amount,
    CASE 
        WHEN fis.amount - COALESCE(SUM(t.amount), 0) <= 0 THEN 'PAID'
        WHEN fis.due_date < CURDATE() THEN 'OVERDUE'
        ELSE 'PENDING'
    END AS payment_status
FROM ims_finance_db.ims_fee_installment_schedules fis
LEFT JOIN ims_finance_db.ims_student_fee_transactions t ON fis.id = t.schedule_id
LEFT JOIN ims_finance_db.ims_fee_heads fh ON fis.fee_head_id = fh.id
GROUP BY fis.id, fh.name;

-- Expense summary by category
CREATE OR REPLACE VIEW ims_reports_db.vw_rpt_expense_summary AS
SELECT
    e.tenant_id,
    ec.name         AS category_name,
    DATE_FORMAT(e.expense_date, '%Y-%m') AS year_month,
    COUNT(*)        AS expense_count,
    SUM(e.amount)   AS total_amount
FROM ims_finance_db.ims_expenses e
LEFT JOIN ims_finance_db.ims_expense_categories ec ON e.category_id = ec.id
GROUP BY e.tenant_id, ec.name, DATE_FORMAT(e.expense_date, '%Y-%m');

-- Budget vs Actual
CREATE OR REPLACE VIEW ims_reports_db.vw_rpt_budget_vs_actual AS
SELECT
    b.tenant_id,
    b.academic_year,
    b.category       AS budget_category,
    b.allocated_amount,
    COALESCE(SUM(e.amount), 0) AS spent_amount,
    b.allocated_amount - COALESCE(SUM(e.amount), 0) AS remaining_amount,
    ROUND(COALESCE(SUM(e.amount), 0) / b.allocated_amount * 100, 2) AS utilization_percentage
FROM ims_finance_db.ims_budgets b
LEFT JOIN ims_finance_db.ims_expenses e 
    ON e.tenant_id = b.tenant_id 
    AND YEAR(e.expense_date) = b.academic_year
    AND e.category_id IN (
        SELECT id FROM ims_finance_db.ims_expense_categories 
        WHERE name = b.category AND tenant_id = b.tenant_id
    )
GROUP BY b.id;
```

### 4.4 Academic Domain Views

```sql
-- Offering (class/batch/semester) overview
CREATE OR REPLACE VIEW ims_reports_db.vw_rpt_offering_overview AS
SELECT
    o.id            AS offering_id,
    o.tenant_id,
    o.name          AS offering_name,
    o.academic_session_id,
    o.program_id,
    o.status,
    o.start_date,
    o.end_date,
    p.name          AS program_name,
    sess.name       AS session_name,
    sess.year       AS academic_year
FROM ims_academic_db.ims_offerings o
LEFT JOIN ims_academic_db.ims_programs p ON o.program_id = p.id
LEFT JOIN ims_academic_db.ims_academic_sessions sess ON o.academic_session_id = sess.id;

-- Assignment submission status
CREATE OR REPLACE VIEW ims_reports_db.vw_rpt_assignment_submissions AS
SELECT
    a.id            AS assignment_id,
    a.tenant_id,
    a.offering_id,
    a.subject_id,
    a.title         AS assignment_title,
    a.due_date,
    sub.student_id,
    sub.submitted_at,
    sub.marks_obtained,
    sub.status      AS submission_status,
    CASE
        WHEN sub.id IS NULL THEN 'NOT_SUBMITTED'
        WHEN sub.submitted_at > a.due_date THEN 'LATE'
        ELSE 'ON_TIME'
    END AS submission_timeliness
FROM ims_academic_db.ims_assignments a
LEFT JOIN ims_academic_db.ims_assignment_submissions sub ON a.id = sub.assignment_id;
```

### 4.5 Cross-Domain Composite Views

```sql
-- Full student report (student + enrollment + attendance summary)
CREATE OR REPLACE VIEW ims_reports_db.vw_rpt_student_academic_summary AS
SELECT
    s.id              AS student_id,
    s.tenant_id,
    s.full_name,
    s.admission_number,
    e.offering_id,
    e.academic_session_id,
    e.status          AS enrollment_status,
    COUNT(ar.id)      AS total_sessions,
    SUM(ar.status = 'PRESENT') AS present_count,
    ROUND(SUM(ar.status = 'PRESENT') / NULLIF(COUNT(ar.id), 0) * 100, 2) AS attendance_pct
FROM ims_student_db.ims_students s
JOIN ims_student_db.ims_student_enrollments e ON s.id = e.student_id
LEFT JOIN ims_academic_db.ims_attendance_records ar 
    ON ar.student_id = s.id AND ar.offering_id = e.offering_id
GROUP BY s.id, s.tenant_id, s.full_name, s.admission_number,
         e.offering_id, e.academic_session_id, e.status;
```

---

## 5. Access Control Strategy

The `ims_reports_db` MySQL user for `ims-reports-service` should have:
- **SELECT only** on all views in `ims_reports_db`
- **No access** to source databases (`ims_student_db`, `ims_academic_db`, etc.)

```sql
-- Create reporting user
CREATE USER 'rpt_user'@'%' IDENTIFIED BY 'strong_password';
GRANT SELECT ON ims_reports_db.* TO 'rpt_user'@'%';
FLUSH PRIVILEGES;
```

---

## 6. View Naming Convention

All reporting views follow the pattern: `vw_rpt_<domain>_<description>`

| View | Domain |
|------|--------|
| `vw_rpt_student_enrollment` | Student |
| `vw_rpt_student_guardian` | Student |
| `vw_rpt_attendance_detail` | Academic |
| `vw_rpt_attendance_summary` | Academic |
| `vw_rpt_fee_collection` | Finance |
| `vw_rpt_fee_outstanding` | Finance |
| `vw_rpt_expense_summary` | Finance |
| `vw_rpt_budget_vs_actual` | Finance |
| `vw_rpt_offering_overview` | Academic |
| `vw_rpt_assignment_submissions` | Academic |
| `vw_rpt_student_academic_summary` | Cross-Domain |

---

## 7. Performance Considerations

| Concern | Mitigation |
|---------|-----------|
| Large datasets | Filter always by `tenant_id`, then date range |
| Cross-DB view performance | Ensure indexed columns are used in JOINs |
| Attendance summary view | This is a GROUP BY — can be slow; consider materialized approach or date-indexed queries |
| Report generation block | All report methods are async-ready; use `CompletableFuture` for large reports |

**Indexes to ensure on source tables:**
- `ims_attendance_records`: index on `(tenant_id, offering_id, date)`
- `ims_student_enrollments`: index on `(student_id, offering_id, tenant_id)`
- `ims_student_fee_transactions`: index on `(tenant_id, student_id, payment_date)`
- `ims_expenses`: index on `(tenant_id, expense_date, category_id)`
