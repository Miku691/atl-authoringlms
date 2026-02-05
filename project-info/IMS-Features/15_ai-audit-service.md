# 15 AI & Audit Service Plan

**Services**: `ims-ai-service` & `ims-audit-log-service`
**Type**: New (Creation Plan)
**Priority**: P4 (Future)

---

## 1. Audit Log Service
- [ ] **Purpose**: Compliance. Answer "Who changed this grade?".
- [ ] **Mechanism**:
    - Async Kafka Listener: Topic `audit.logs`.
    - Storage: ElasticSearch or MongoDB (Text heavy data).
    - **Entity**: `AuditRecord` (User, Action, OldValue, NewValue, Timestamp).

## 2. AI Service
- [ ] **Purpose**: Smart Features.
- [ ] **Features**:
    - **Content Gen**: "Generate Quiz from this PDF Note".
    - **Insights**: "Predict Student Dropout Risk" based on attendance/grades.
- [ ] **Integration**: Connects to OpenAI/Gemini/Local LLM.
- [ ] **Security**: PII redaction before sending prompt.

---

## 3. Technical Tasks
1.  Initialize Services.
2.  Setup ELK Stack (for Audit Logs) connection via `logstash`.
