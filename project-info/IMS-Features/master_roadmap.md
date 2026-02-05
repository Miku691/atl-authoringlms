# IMS Feature Master Roadmap

**Project**: Institute Management System (Multi-Tenant)
**Architecture**: Microservices (Spring Boot) + React (TypeScript)

This document is the **Index** to the Detailed Implementation Plans.

---

## 📂 Implementation Plans (By Priority)

### Phase 1: Foundation (Secure & Ready)
| Service | Backend Plan | Frontend Plan |
| :--- | :--- | :--- |
| **Gateway** | [01_gateway-service.md](01_gateway-service.md) | [frontend/01_gateway_frontend.md](frontend/01_gateway_frontend.md) |
| **Auth & Identity** | [02_auth-service.md](02_auth-service.md) | [frontend/02_auth_frontend.md](frontend/02_auth_frontend.md) |
| **Configuration** | [03_configuration-service.md](03_configuration-service.md) | [frontend/03_configuration_frontend.md](frontend/03_configuration_frontend.md) |

### Phase 2: Core Domain (The Backbone)
| Service | Backend Plan | Frontend Plan |
| :--- | :--- | :--- |
| **Academic** | [04_academic-service.md](04_academic-service.md) | [frontend/04_academic_frontend.md](frontend/04_academic_frontend.md) |
| **Student & Staff** | [05_student-staff-service.md](05_student-staff-service.md) | [frontend/05_student_staff_frontend.md](frontend/05_student_staff_frontend.md) |

### Phase 3: Operations & Finance (Day-to-Day)
| Service | Backend Plan | Frontend Plan |
| :--- | :--- | :--- |
| **Attendance** | [06_attendance-service.md](06_attendance-service.md) | [frontend/06_attendance_frontend.md](frontend/06_attendance_frontend.md) |
| **Finance** | [07_finance-service.md](07_finance-service.md) | [frontend/07_finance_frontend.md](frontend/07_finance_frontend.md) |
| **Payment (Gateway)** | [08_payment-service.md](08_payment-service.md) | [frontend/08_payment_frontend.md](frontend/08_payment_frontend.md) |
| **Notifications** | [13_notification-service.md](13_notification-service.md) | [frontend/13_notification_frontend.md](frontend/13_notification_frontend.md) |

### Phase 4: LMS & Assessment (Advanced)
| Service | Backend Plan | Frontend Plan |
| :--- | :--- | :--- |
| **Content (LMS)** | [09_content-service.md](09_content-service.md) | [frontend/09_content_frontend.md](frontend/09_content_frontend.md) |
| **Assessment** | [10_assessment-service.md](10_assessment-service.md) | [frontend/10_assessment_frontend.md](frontend/10_assessment_frontend.md) |
| **Exams** | [11_exam-service.md](11_exam-service.md) | [frontend/11_exam_frontend.md](frontend/11_exam_frontend.md) |

### Phase 5: Extended Features
| Service | Backend Plan | Frontend Plan |
| :--- | :--- | :--- |
| **Library** | [12_library-service.md](12_library-service.md) | [frontend/12_library_frontend.md](frontend/12_library_frontend.md) |
| **Reporting** | [14_reporting-analytics-service.md](14_reporting-analytics-service.md) | [frontend/14_reporting_frontend.md](frontend/14_reporting_frontend.md) |
| **AI & Audit** | [15_ai-audit-service.md](15_ai-audit-service.md) | [frontend/15_ai_audit_frontend.md](frontend/15_ai_audit_frontend.md) |
| **Integration** | [16_integration-document-service.md](16_integration-document-service.md) | [frontend/16_integration_document_frontend.md](frontend/16_integration_document_frontend.md) |

---

## 🛠️ Combined Workflow

1.  **Select a Feature**: E.g., "Student Admission".
2.  **Backend Agent**: Work on `05_student-staff-service.md` -> Implement `POST /admissions`.
3.  **Frontend Agent**: Work on `frontend/05_student_staff_frontend.md` -> Implement `AdmissionWizard.tsx`.
4.  **Sync**: Ensure Frontend call matches Backend API.
