# IMS Distributed Deployment Plan - Step-by-Step Guide

This guide details the "Industrial Standard" deployment: separating the Application, Database, and Cache across three distinct Hostinger VPS instances, with the Frontend hosted on Netlify.

---

## 1. Network & Infrastructure Strategy

| VPS Role | Recommended Hardware | Key Software |
| :--- | :--- | :--- |
| **VPS 1: App Cluster** | Hostinger KVM 4 (8GB RAM) | Docker, Docker Compose, Discovery |
| **VPS 2: MySQL** | Hostinger KVM 1 (4GB RAM) | MySQL Shared Server (Native) |
| **VPS 3: Redis** | Hostinger KVM 1 (4GB RAM) | Redis Server (Native) |

---

## 2. Step 1: GitHub & Docker Hub (CI/CD)

The build process is identical to the Hybrid plan. GitHub Actions will build and push your microservice images to a **Private Docker Hub Registry**.

- **Workflow**: Pushing to `main` triggers 8+ concurrent builds.
- **Images**: Tagged as `your-username/ims-service:latest`.

---

## 3. Step 2: VPS Configuration (The Security Boundary)

### A. VPS 2 (MySQL) & VPS 3 (Redis)
Do **not** use Docker for the DB and Cache on these dedicated servers. Install them natively for better performance.

```bash
# On MySQL VPS
sudo apt install mysql-server
# Edit /etc/mysql/mysql.conf.d/mysqld.cnf to bind to 0.0.0.0
# Set up UFW Firewall:
sudo ufw allow from <VPS1_App_IP> to any port 3306
sudo ufw deny 3306
```

```bash
# On Redis VPS
sudo apt install redis-server
# Edit /etc/redis/redis.conf to bind to 0.0.0.0 and set requirepass
# Set up UFW Firewall:
sudo ufw allow from <VPS1_App_IP> to any port 6379
sudo ufw deny 6379
```

---

## 4. Step 3: Application VPS Setup (VPS 1)

1.  **Install Docker**: Follow standard Ubuntu installation.
2.  **Docker Login**: `docker login -u your-username`.
3.  **Environment Setup**:
    ```bash
    mkdir ~/ims-app && cd ~/ims-app
    nano .env
    ```
    **Critical ENV for Distributed**:
    - `AUTH_MYSQL_URI=jdbc:mysql://<VPS2_IP>:3306/atl-auth-db`
    - `REDIS_URL=<VPS3_IP>`
    - `REDIS_PASSWORD=your_distributed_redis_pass`

---

## 5. Step 4: Orchestration (Docker Compose)

Your `docker-compose.yml` on **VPS 1** should **only** contains microservices and Discovery. Remove the `mysql-db` and `redis` services entirely.

```bash
docker compose pull
docker compose up -d
```

---

## 6. Step 5: Frontend Edge Deployment (Netlify)

1.  **Build Configuration**:
    - Build Command: `npm run build`
    - Base Directory: `atl-web-ui` (if monorepo)
2.  **Environment Variable**:
    - `VITE_API_URL=http://<VPS1_App_IP>:8080` (The Gateway IP).

---

## 7. Operational Checklist
- [ ] **Firewall Verification**: Can VPS 1 ping VPS 2/3? (Ensure UFW is configured).
- [ ] **Data Safety**: Set up a CRON job on VPS 2 to backup MySQL to a separate storage (Hostinger Snapshots).
- [ ] **CORS Policy**: Ensure `atl-gateway-service` allows the Netlify domain in its `application.properties`.
- [ ] **Image Hub Privacy**: Use **Private repositories** on Docker Hub to protect your enterprise IP.
