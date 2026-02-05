# IMS Hybrid Deployment Plan - Step-by-Step Guide

This document provides a comprehensive, end-to-end guide for the **Hybrid Deployment** strategy: Frontend on Netlify and all Backend components on a single Hostinger VPS.

---

## 1. Prerequisites & Preparation

### A. Repository Structure
Ensure each microservice has its `Dockerfile` at its root, and your `docker-compose.yml` is in the project root.

### B. Docker Hub Account
- Create an account at [hub.docker.com](https://hub.docker.com).
- **Recommendation**: Use **Private Repositories** for your microservices to protect your proprietary code. Hostinger's free tier for Docker Hub allows 1 private repo; you may need a Pro plan or use a public repo with highly obfuscated builds if cost is a major factor.

---

## 2. Step 1: CI/CD with GitHub Actions

Every time you "Push" to the `main` branch, GitHub will automatically build your images and send them to Docker Hub.

### Implementation: `.github/workflows/deploy.yml`
Create this file in your repository:

```yaml
name: Build and Push to Docker Hub

on:
  push:
    branches: [ main ]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and Push Auth Service
        uses: docker/build-push-action@v4
        with:
          context: ./atl-auth-service
          push: true
          tags: your-username/atl-auth:latest

      # Repeat the "Build and Push" step for all other microservices...
```

**Note**: You must add `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` (Access Token) to your **GitHub Repo Secrets**.

---

## 3. Step 2: Hostinger VPS Selection

Running 8+ Java microservices + MySQL + Redis requires significant RAM.

- **Recommended Plan**: **Hostinger KVM 4** or **KVM 8**.
  - **RAM**: Minimum 8GB (Java services are memory-hungry).
  - **CPU**: 4 Cores.
  - **OS**: Ubuntu 22.04 64bit.

---

## 4. Step 3: VPS Server Setup

Once your VPS is ready, SSH into it and run these commands:

### A. Install Docker & Compose
```bash
# Update and install Docker
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

### B. Login to Docker Hub
```bash
docker login -u your-username
# Enter your Access Token when prompted
```

---

## 5. Step 4: Launching the Backend

### A. Create Production Directory
```bash
mkdir ~/ims-app && cd ~/ims-app
nano docker-compose.yml # Copy your local docker-compose content here
nano .env              # Add your production secrets (DB Pass, JWT Secret)
```

### B. Pull and Run
```bash
# Pull images from Docker Hub
docker compose pull

# Start the cluster
docker compose up -d
```

---

## 6. Step 5: Frontend Migration to Netlify

1.  **Preparation**: In the root of `atl-web-ui`, create a file named `public/_redirects` with the content: `/* /index.html 200`. This ensures SPA routing works.
2.  **Netlify Setup**: 
    - Connect GitHub.
    - Select Only the `atl-web-ui` folder if your repo is a monorepo (use "Base directory" setting).
    - **Environment Variable**: Set `VITE_API_URL` to `http://<your-vps-ip>:8080`.
3.  **Deploy**: Netlify will build and host your site on their global CDN.

---

## 7. Ongoing Updates
Whenever you make a change and push to GitHub:
1.  GitHub Action builds and pushes new images to Docker Hub.
2.  You SSH into the VPS and run:
    ```bash
    cd ~/ims-app
    docker compose pull
    docker compose up -d --remove-orphans
    ```
