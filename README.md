# ATL - Authoring Tool and LMS Platform

This repository contains the full-stack, cloud-based e-learning ecosystem built using Spring Boot microservices. It includes tools for course authoring and a custom LMS platform.

## 🧱 Architecture Overview

- **Microservices**:
    - `auth-service`: Handles user registration, login, and JWT generation.
    - `course-service`: Manages course structures and metadata.
    - `content-service`: Handles individual content blocks (text, video, quiz).
    - `export-service`: Converts courses to SCORM/xAPI formats.
    - `api-gateway`: Routes requests and validates JWT tokens.
    - `shared-library`: Contains common DTOs, utilities, and constants.

- **Frontend** (planned): React-based UI for course creation and LMS access.

- **Deployment**:
    - Docker Compose for local development.
    - Kubernetes manifests for cloud deployment.

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Maven
- Docker & Docker Compose
- MongoDB Atlas or PostgreSQL (depending on service)

### Running Locally
```bash
docker-compose up --build