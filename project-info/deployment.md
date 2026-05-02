# ATL Project - Production Deployment Checklist

This document provides a comprehensive step-by-step guide for deploying the Institute Management System (IMS) / ATL project to a production server using Docker and external databases.

## 1. Pre-Deployment Infrastructure
Before running the backend services, ensure your production environment has the following ready:
- **Server Instance (VPS/EC2)**: Linux machine with Docker and Docker Compose installed.
- **External Database**: A managed PostgreSQL database (e.g., AWS RDS, Supabase, Neon) configured and accessible. You must manually create the individual databases (e.g., `atl-auth-db`, `ims-academic-db`, etc.) in the PostgreSQL server prior to starting the services.
- **External Redis**: A managed Redis instance configured and accessible.
- **Domain & SSL**: A domain pointing to your backend server, ideally sitting behind a reverse proxy (like Nginx or AWS ALB) to provide HTTPS/SSL.

---

## 2. Setting Up the Environment Variables
Your `.env` file is the master configuration file for the entire stack.
1. Transfer the `.env` file and `docker-compose.prod.yml` to your production server, along with the source code repository.
2. Edit the `.env` file on the production server.
3. **Critical updates inside `.env`:**
   - Update `AUTH_DB_URL`, `ACADEMIC_DB_URL`, etc., to point to your external PostgreSQL server instead of `localhost`.
   - Update `DB_USER` and `DB_PASS` with your production database credentials.
   - Update `REDIS_HOST`, `REDIS_PORT`, and `REDIS_PASSWORD`.
   - Update `CORS_ALLOWED_ORIGINS` to match your production UI domain (e.g., `https://my-school-app.com`).
   - Update `AUTH_JWT_SECRET` to a highly secure, randomized string.

---

## 3. Dockerizing the Backend
**Do I need to run `mvn clean package` manually?**
**No.** We configured **Multi-stage Dockerfiles** for every microservice. 
When Docker builds the image, Stage 1 automatically pulls a Maven container, downloads dependencies, and compiles your Java code into `.jar` files. Stage 2 then copies that `.jar` into a lightweight Java 17 runtime container. 
*You only need to provide the raw source code to the server.*

### Commands to Build and Run:
Navigate to the root directory where your `docker-compose.prod.yml` and `.env` are located, and execute:

```bash
# This command tells Docker to use the specific production compose file, 
# explicitly load variables from .env, build the maven images, and run in detached mode.
docker compose --env-file .env -f docker-compose.prod.yml up -d --build
```

**Helpful Docker Commands:**
- **View all running services:** `docker compose -f docker-compose.prod.yml ps`
- **View logs for a specific service (e.g., gateway):** `docker logs atl-gateway --tail 100 -f`
- **Stop all services:** `docker compose -f docker-compose.prod.yml down`

---

## 4. Deploying the Frontend (UI Service)
As planned, `atl-web-ui` is not included in the Docker Compose cluster and will be hosted on **Netlify**.

1. Connect your Git repository to Netlify.
2. Set the base directory to `atl-web-ui`.
3. Configure the Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. **Environment Variables on Netlify**:
   - Go to Site Settings > Environment Variables in the Netlify Dashboard.
   - Add a new variable: 
     - **Key:** `VITE_API_URL`
     - **Value:** `https://api.your-production-domain.com` *(This should point to the public domain/IP of your `atl-gateway-service`)*
5. Trigger the deployment. Netlify will embed the `VITE_API_URL` into the static files during the build.

---

## 5. Post-Deployment Verification
Once everything is running, perform the following checks:
1. **Check Discovery Server**: Open `http://<your-server-ip>:8761`. You should see the Eureka dashboard. Verify that all microservices (auth, academic, gateway, etc.) have successfully registered themselves.
2. **Database Initialization**: Check the logs of any domain service (e.g., `docker logs ims-academic`). Because we set `spring.jpa.hibernate.ddl-auto=update`, Hibernate should automatically create the PostgreSQL tables on startup.
3. **Gateway Routing Check**: Attempt to access a public endpoint via the Gateway (e.g., `http://<your-server-ip>:8080/atl-auth-service/auth/signin` with a dummy POST payload). Ensure you don't receive a 502 Bad Gateway.
4. **CORS Validation**: Visit your Netlify UI and attempt to log in. Check the browser console to ensure there are no CORS blockage errors, confirming that the Gateway recognized the Netlify Origin.
