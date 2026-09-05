# Full Deployment Guide

This guide explains how to deploy the **Railway Reservation System** across:
1. 🗄️ **Railway.app**: MySQL Database
2. ☁️ **Render**: Spring Boot Microservices (Eureka, Config Server, Gateway & Services)
3. ⚡ **Vercel**: React (Vite) Frontend

---

## Architecture Overview

```
[ User Browser ]
       │
       ▼
[ Vercel (React Frontend) ]
       │
       │ (REST / JSON via HTTPS)
       ▼
[ Render (API Gateway: 8765) ]
       │
       ├──► [ User Service: 8081 ] ──────┐
       ├──► [ Train Service: 8082 ] ─────┼──► [ Railway (MySQL Database) ]
       ├──► [ Reservation Service: 8083 ]┤
       └──► [ Payment Service: 8084 ] ───┘
```

---

## Step 1: Deploy MySQL Database on Railway.app

1. Go to [Railway.app](https://railway.app/) and log in (or sign up with GitHub).
2. Click **New Project** > **Provision MySQL**.
3. Once the database is created, click on the **MySQL** service card and go to the **Variables** / **Connect** tab:
   - Note the **`MYSQLHOST`** (or Public Hostname)
   - Note the **`MYSQLPORT`** (usually `3306` or a custom TCP port)
   - Note the **`MYSQLUSER`** (default: `root`)
   - Note the **`MYSQLPASSWORD`**
4. Construct your JDBC URLs (replace `HOST`, `PORT`, `USER`, and `PASSWORD` with your actual Railway values):

```text
USERSERVICE_DB_URL=jdbc:mysql://HOST:PORT/userservicetrain?createDatabaseIfNotExist=true
TRAINSERVICE_DB_URL=jdbc:mysql://HOST:PORT/trainservicetrain?createDatabaseIfNotExist=true
RESERVATIONSERVICE_DB_URL=jdbc:mysql://HOST:PORT/reservationservicetrain?createDatabaseIfNotExist=true
PAYMENTSERVICE_DB_URL=jdbc:mysql://HOST:PORT/paymentservicetrain?createDatabaseIfNotExist=true
DB_USERNAME=root
DB_PASSWORD=<Your-Railway-MySQL-Password>
```

---

## Step 2: Push Code to GitHub

Make sure all your latest changes are pushed to your GitHub repository:
```bash
git add .
git commit -m "Configure deployment and bugfixes"
git push origin main
```

---

## Step 3: Deploy Spring Boot Backend to Render

### Method A: Using Render Blueprint (`render.yaml`) - Recommended

1. Go to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** > **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect `render.yaml` and parse all services:
   - `railway-eureka-server`
   - `railway-config-server`
   - `railway-user-service`
   - `railway-train-service`
   - `railway-payment-service`
   - `railway-reservation-service`
   - `railway-api-gateway`
5. Render will prompt you for the secret environment variables marked `sync: false`:
   - `DB_USERNAME`: `root` (from Railway)
   - `DB_PASSWORD`: `<your-railway-mysql-password>`
   - `USERSERVICE_DB_URL`: `jdbc:mysql://HOST:PORT/userservicetrain?createDatabaseIfNotExist=true`
   - `TRAINSERVICE_DB_URL`: `jdbc:mysql://HOST:PORT/trainservicetrain?createDatabaseIfNotExist=true`
   - `RESERVATIONSERVICE_DB_URL`: `jdbc:mysql://HOST:PORT/reservationservicetrain?createDatabaseIfNotExist=true`
   - `PAYMENTSERVICE_DB_URL`: `jdbc:mysql://HOST:PORT/paymentservicetrain?createDatabaseIfNotExist=true`
   - `STRIPE_SECRET_KEY`: `sk_test_...` (or test key)
   - `MAIL_USERNAME`: `<your-email>`
   - `MAIL_PASSWORD`: `<your-app-password>`
6. Click **Apply**.
7. Once services are created, copy your **API Gateway public URL** (e.g. `https://railway-api-gateway.onrender.com`).

---

## Step 4: Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com/) and sign in with GitHub.
2. Click **Add New...** > **Project**.
3. Import your GitHub repository (`Railway-Reservation-System`).
4. In the **Configure Project** screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`railway-frontend`**
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `dist` (or leave default)
5. Under **Environment Variables**, add:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://<your-api-gateway-url>.onrender.com` (from Step 3)
6. Click **Deploy**.
7. Copy your deployed Vercel URL (e.g. `https://railway-reservation.vercel.app`).

---

## Step 5: Connect CORS & URLs

Once your Vercel URL is live:
1. In Render, open the **`railway-api-gateway`** service > **Environment**.
2. Update `APP_CORS_ALLOWED_ORIGINS` to include your Vercel domain:
   ```text
   http://localhost:5173,https://railway-reservation.vercel.app
   ```
3. In Render, open the **`railway-payment-service`** service > **Environment**:
   - `PAYMENT_SUCCESS_URL`: `https://railway-reservation.vercel.app/payment-success`
   - `PAYMENT_CANCEL_URL`: `https://railway-reservation.vercel.app/dashboard`
4. Click **Save Changes** (Render will automatically redeploy).

---

## Deployment Checklist & Verification

- [ ] Railway MySQL is active and reachable.
- [ ] Render services deployed and status is `Live`.
- [ ] `https://<api-gateway-url>.onrender.com/actuator/health` returns `{"status":"UP"}`.
- [ ] Vercel frontend is live and communicating with Render API Gateway.
