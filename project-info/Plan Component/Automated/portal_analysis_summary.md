# Portal Analysis Summary: eSkooly (Reference)

## Analysis Brief
The reference portal provides a highly configurable and domain-rich environment for institute management. The key takeaway is the **granularity of data** and the **separation of administrative setup from daily operations**.

### Key Findings
1. **Dynamic Financial Modeling**: Separate definition of "Fee Particulars" (labels/amounts) allows for flexible accounting.
2. **Comprehensive Person Profiles**: Detailed tracking of non-academic student data (orphan status, blood group, etc.) and employee detail (salary, joining info).
3. **Multi-Mode Operations**: Support for both manual and automated (card scanning) attendance.
4. **Hierarchical Settings**: General settings that govern branding, grading scales, and account defaults across the tenant.

---

## Proposed Microservices Roadmap

### Phase 1: Core Domain Extension (Identity & Profiles)
*Focus on enriching the existing profile services.*

1. **ims-student-service (Existing)**
   - **Responsibility**: Detailed student lifecycle, profiles, and admission letters.
   - **Fields**: Birth Form ID, Orphan Status, Blood Group, Previous School.
2. **ims-staff-service (Existing)**
   - **Responsibility**: Employee management, roles, salary info, and experience tracking.
   - **Fields**: Joining Date, Qualification, Base Salary.

### Phase 2: Operations & Data Integrity
*Focus on daily academic routine and configuration.*

3. **ims-academic-service (Existing)**
   - **Responsibility**: Class-Subject mapping, Syllabus tracking, and Grade Scales.
   - **New Feature**: Mark Grading systems and total exam marks per subject.
4. **ims-attendance-service (NEW)**
   - **Responsibility**: Track daily attendance for both Students and Staff.
   - **Connections**: Links `studentId`/`staffId` to `offeringId` (class).

### Phase 3: Financial Management
*Focus on revenue and expense tracking.*

5. **ims-finance-service (NEW)**
   - **Responsibility**: Fee particulars, student invoicing, and payment collection.
   - **Connections**: Pulls enrollment status from `ims-student-service`.
6. **ims-account-service (NEW)**
   - **Responsibility**: Simple expense tracking and chart of accounts.
   - **Connections**: Independent ledger service.

### Phase 4: Communication & Intelligence
*Focus on outputs and utility.*

7. **ims-communication-service (NEW)**
   - **Responsibility**: SMS/WhatsApp notifications and internal announcements.
8. **ims-report-service (NEW)**
   - **Responsibility**: Centralized report generation (PDF Admission letters, Fee slips, Progress reports).

---

## Service Connectivity (Internal Contract)
- **Shared ID Policy**: All services communicate via `UUID` (String).
- **Tenant Isolation**: Every request must carry `X-Tenant-Id` header (injected by `atl-gateway-service`).
- **Auth Link**: `userId` connects any person (Student/Staff) to their `atl-auth-service` credentials.
- **Academic Link**: `offeringId` is the primary key for all classroom activities (Attendance, Timetable, Exams).
