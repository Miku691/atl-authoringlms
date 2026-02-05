# Phase 3: Advanced Modules - Detailed Tasks

**Goal**: Automate complex processes and enhance engagement.

---

## 3.A: Online Fee Collection

### 3.A.1 Backend (ims-finance-service)
- [ ] **Integration**: Integrate Payment Gateway (Razorpay/Stripe).
- [ ] **Entity**: `PaymentTransaction` (Gateway ID, Amount, Status, Signature).
- [ ] **Webhook**: Handle payment success/failure webhooks from provider.
- [ ] **Invoice**: PDF generation for receipts.

### 3.A.2 Frontend (atl-web-ui)
- [ ] **Flow**: "Pay Now" button -> Gateway Modal -> Success Page.
- [ ] **History**: Transaction history table.

---

## 3.B: Learning Management System (LMS)

### 3.B.1 Backend (ims-learning-service - NEW)
- [ ] **Module Setup**: Create `ims-learning-service`.
- [ ] **Entity**: `StudyMaterial` (Title, URL, Type: PDF/VIDEO, Offering).
- [ ] **Entity**: `Assignment` (Title, Due Date, Max Marks).
- [ ] **Entity**: `Submission` (Student, File URL, Grade).
- [ ] **Storage**: Integration with AWS S3 / MinIO for file storage.

### 3.B.2 Frontend (atl-web-ui)
- [ ] **Module**: `LMSDashboard` - Subject-wise view.
- [ ] **Player**: Video player or PDF viewer embed.
- [ ] **Upload**: Drag-and-drop uploader for teachers.

---

## 3.C: Communication Suite

### 3.C.1 Backend (ims-notification-service - possibly new or shared)
- [ ] **Integration**: SMS/Email Provider (Twilio/SendGrid).
- [ ] **Entity**: `NotificationTemplate` (e.g., "Fee Due", "Absent Alert").
- [ ] **Event**: Listen to Kafka events (e.g., `ATTENDANCE_MARKED_ABSENT`) and trigger SMS.

### 3.C.2 Frontend (atl-web-ui)
- [ ] **Admin**: `BroadcastPage` - Send message to entire Class/Batch.
- [ ] **User**: `NotificationBell` - In-app alerts list.

---

## 3.D: Library & Transport

### 3.D.1 Backend (ims-operations-service)
- [ ] **Library**: `Book`, `BookIssue` entities. Inventory management logic.
- [ ] **Transport**: `Vehicle`, `Route`, `Stop` entities.
- [ ] **Fee Linkage**: Auto-add Transport fee to student fee structure if opted in.

### 3.D.2 Frontend (atl-web-ui)
- [ ] **Library**: Search Catalog, Issue flow.
- [ ] **Transport**: Route map view, Stop selection during admission.
