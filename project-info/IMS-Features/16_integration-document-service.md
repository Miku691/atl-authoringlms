# 16 Integration & Document Service Plan

**Services**: `ims-integration-service` & `ims-document-service`
**Type**: New (Creation Plan)
**Priority**: P4 (Support)

---

## 1. Document Service
- [ ] **Purpose**: Centralized File Handler (if not using S3 directly from features).
- [ ] **Function**: Virus Scanning, Image Compression, Thumbnail generation.
- [ ] **API**: `POST /documents/upload` -> Returns ID.

## 2. Integration Service
- [ ] **Purpose**: Talk to the outside world.
- [ ] **Connectors**:
    - Govt Education Portals (Data sync).
    - Biometric Device APIs (Pull attendance).
    - Zoom/Google Meet (Create link for online class).

---

## 3. Technical Tasks
1.  Initialize Services.
2.  Implement Strategy Pattern for Integrations (Adapter Pattern).
