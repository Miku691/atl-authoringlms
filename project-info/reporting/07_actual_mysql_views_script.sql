-- -----------------------------------------------------------------------------
-- IMS Reporting Service - Actual MySQL Views based on JPA Entities
-- These views join tables across different microservices' databases into a 
-- central `ims_reports_db` for JasperReports consumption.
--
-- IMPORTANT: Make sure your MySQL user has GRANT privileges to SELECT from 
-- `ims_student_db`, `ims_academic_db`, and `ims_finance_db`.
-- Run these statements while connected to `ims_reports_db`.
-- -----------------------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS ims_reports_db;
USE ims_reports_db;

-- ---------------------------------------------------------
-- 1. Student Directory View
-- Combines Student Core with Enrollment and Academic Offering
-- ---------------------------------------------------------
CREATE OR REPLACE VIEW v_student_directory AS
SELECT 
    s.id AS student_id,
    s.tenant_id,
    s.admission_no,
    s.first_name,
    s.last_name,
    s.email,
    s.phone,
    s.gender,
    s.status AS student_status,
    e.id AS enrollment_id,
    e.roll_no,
    e.academic_year,
    o.id AS offering_id,
    o.name AS offering_name,
    o.type AS offering_type
FROM ims_student_db.IMS_STUDENTS s
INNER JOIN ims_student_db.IMS_STUDENT_ENROLLMENTS e ON s.id = e.student_id AND s.tenant_id = e.tenant_id
INNER JOIN ims_academic_db.IMS_OFFERINGS o ON e.offering_id = o.id AND e.tenant_id = o.tenant_id
WHERE s.is_deleted = false AND e.is_deleted = false;

-- ---------------------------------------------------------
-- 2. Basic Program & Offering Report View
-- ---------------------------------------------------------
CREATE OR REPLACE VIEW v_academic_offerings AS
SELECT 
    o.id AS offering_id,
    o.tenant_id,
    o.name AS offering_name,
    o.type AS offering_type,
    o.capacity,
    o.start_date,
    o.end_date,
    p.id AS program_id,
    p.code AS program_code,
    p.title AS program_title,
    p.level AS program_level
FROM ims_academic_db.IMS_OFFERINGS o
LEFT JOIN ims_academic_db.IMS_ACADEMIC_SESSIONS s ON o.session_id = s.id
LEFT JOIN ims_academic_db.IMS_PROGRAMS p ON s.program_id = p.id;

-- ---------------------------------------------------------
-- 3. Student Attendance Summary View
-- ---------------------------------------------------------
CREATE OR REPLACE VIEW v_student_attendance_summary AS
SELECT 
    ar.tenant_id,
    ar.student_id, -- Maps to personId
    COUNT(ar.id) AS total_attendance_recorded,
    SUM(CASE WHEN ar.status = 'PRESENT' THEN 1 ELSE 0 END) AS present_count,
    SUM(CASE WHEN ar.status = 'ABSENT' THEN 1 ELSE 0 END) AS absent_count,
    SUM(CASE WHEN ar.status = 'LATE' THEN 1 ELSE 0 END) AS late_count,
    ROUND((SUM(CASE WHEN ar.status = 'PRESENT' THEN 1 ELSE 0 END) / COUNT(ar.id)) * 100, 2) AS attendance_percentage
FROM ims_academic_db.IMS_ATTENDANCE_RECORDS ar
WHERE ar.person_type = 'STUDENT'
GROUP BY ar.tenant_id, ar.student_id;

-- ---------------------------------------------------------
-- 4. Financial - Fee Defaulter Report View
-- ---------------------------------------------------------
CREATE OR REPLACE VIEW v_fee_defaulters AS
SELECT 
    fr.id AS fee_record_id,
    fr.tenant_id,
    fr.academic_year,
    fr.offering_id,
    o.name AS offering_name,
    s.id AS student_id,
    s.admission_no,
    s.first_name,
    s.last_name,
    s.phone AS student_phone,
    fr.due_date,
    fr.amount_due,
    fr.amount_paid,
    fr.balance,
    fr.status AS fee_status,
    fr.late_fee_amount
FROM ims_finance_db.student_fee_records fr
INNER JOIN ims_student_db.IMS_STUDENTS s ON fr.student_id = s.id AND fr.tenant_id = s.tenant_id
INNER JOIN ims_academic_db.IMS_OFFERINGS o ON fr.offering_id = o.id AND fr.tenant_id = o.tenant_id
WHERE fr.status IN ('UNPAID', 'PARTIAL') 
AND fr.due_date < CURRENT_DATE();

-- ---------------------------------------------------------
-- 5. Financial - Transaction / Collection Summary View
-- ---------------------------------------------------------
CREATE OR REPLACE VIEW v_daily_collection_summary AS
SELECT 
    t.id AS transaction_id,
    t.tenant_id,
    t.academic_year,
    t.offering_id,
    t.student_id,
    s.first_name,
    s.last_name,
    s.admission_no,
    t.amount,
    t.payment_mode,
    t.reference_number,
    t.transaction_date,
    t.collected_by,
    DATE(t.transaction_date) AS payment_date
FROM ims_finance_db.transactions t
LEFT JOIN ims_student_db.IMS_STUDENTS s ON t.student_id = s.id AND t.tenant_id = s.tenant_id;

-- ---------------------------------------------------------
-- 6. Student Guardian Contact View
-- ---------------------------------------------------------
CREATE OR REPLACE VIEW v_student_guardian_contact AS
SELECT 
    s.id AS student_id,
    s.tenant_id,
    s.admission_no,
    s.first_name,
    s.last_name,
    g.id AS guardian_id,
    g.name AS guardian_name,
    g.phone AS guardian_phone,
    g.email AS guardian_email,
    m.relation,
    m.is_primary
FROM ims_student_db.IMS_STUDENTS s
INNER JOIN ims_student_db.IMS_STUDENT_GUARDIAN_MAPPING m ON s.id = m.student_id AND s.tenant_id = m.tenant_id
INNER JOIN ims_student_db.IMS_GUARDIANS g ON m.guardian_id = g.id AND m.tenant_id = g.tenant_id
WHERE s.is_deleted = false;

-- ---------------------------------------------------------
-- 7. Financial - Expense Summary by Category View
-- ---------------------------------------------------------
CREATE OR REPLACE VIEW v_expense_summary AS
SELECT 
    e.tenant_id,
    e.academic_year,
    c.name AS category_name,
    DATE_FORMAT(e.expense_date, '%Y-%m') AS year_month,
    COUNT(e.id) AS expense_count,
    SUM(e.amount) AS total_amount
FROM ims_finance_db.expenses e
LEFT JOIN ims_finance_db.expense_categories c ON e.category_id = c.id
GROUP BY e.tenant_id, e.academic_year, c.name, DATE_FORMAT(e.expense_date, '%Y-%m');

-- ---------------------------------------------------------
-- 8. Financial - Budget vs Actual View
-- ---------------------------------------------------------
CREATE OR REPLACE VIEW v_budget_vs_actual AS
SELECT 
    b.tenant_id,
    b.academic_year,
    c.name AS category_name,
    b.allocated_amount,
    COALESCE(SUM(e.amount), 0) AS spent_amount,
    (b.allocated_amount - COALESCE(SUM(e.amount), 0)) AS remaining_amount,
    ROUND((COALESCE(SUM(e.amount), 0) / b.allocated_amount) * 100, 2) AS utilization_percentage
FROM ims_finance_db.budgets b
INNER JOIN ims_finance_db.expense_categories c ON b.category_id = c.id
LEFT JOIN ims_finance_db.expenses e ON b.tenant_id = e.tenant_id AND b.academic_year = e.academic_year AND b.category_id = e.category_id
GROUP BY b.tenant_id, b.academic_year, c.name, b.allocated_amount;
