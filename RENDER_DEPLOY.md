# Render Free Tier Deployment Guide

This project is configured for **100% Free deployment on Render** using `render.yaml` (Render Blueprint) or manual Web UI setup.

---

## Method 1: 1-Click Render Blueprint (Recommended)

1. Go to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** (top right) $\rightarrow$ **Blueprint**.
3. Connect your GitHub repository (`recovery`).
4. Select the branch (e.g. `main` or your active branch).
5. Render will detect `render.yaml` and automatically configure:
   - **`recoverai-backend`**: FastAPI Python Web Service (Free Tier)
   - **`recoverai-frontend`**: React + Vite Static Site (Free Tier)
6. Click **Apply**.
7. Once deployed:
   - Your frontend will be live at `https://recoverai-frontend.onrender.com`
   - Your backend will be live at `https://recoverai-backend.onrender.com`

---

## Method 2: Manual Web UI Setup

### Step 1: Deploy the Backend (Web Service)
1. In Render Dashboard, click **New +** $\rightarrow$ **Web Service**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name**: `recoverai-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
4. In **Advanced** $\rightarrow$ **Health Check Path**, enter: `/api/health`.
5. Click **Create Web Service**.
6. Copy your backend URL once created (e.g., `https://recoverai-backend.onrender.com`).

---

### Step 2: Deploy the Frontend (Static Site)
1. In Render Dashboard, click **New +** $\rightarrow$ **Static Site**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name**: `recoverai-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. In **Environment Variables**, add:
   - `VITE_API_URL`: Your backend URL from Step 1 (e.g. `https://recoverai-backend.onrender.com`)
5. In **Redirects / Rewrites**, add:
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`
6. Click **Create Static Site**.

---

## Notes on Free Tier Behavior
- **Spin-down**: Free web services automatically spin down after 15 minutes of inactivity. When a new request arrives, Render takes ~30-50 seconds to wake up the service.
- **Static Sites**: The frontend static site runs on Render's global CDN, loads instantly, and never sleeps.
- **Database**: SQLite database automatically initializes and seeds on server startup.
