# Deployment Guide

## 1. Overview
This guide covers how to deploy the **Frontend** of this SaaS application to **Vercel**.
The backend must be hosted separately (e.g., Railway, Render, AWS) and accessible via a public URL.

**Why Vercel?**
Vercel is the optimal choice for React + Vite applications, offering global CDN, automatic SSL, and continuous deployment out of the box.

## 2. Prerequisites
- [ ] A **GitHub** account
- [ ] A **Vercel** account (Free tier is sufficient)
- [ ] **Backend Deployed**: You must have your backend URL ready (e.g., `https://api.your-saas.com`)

## 3. GitHub Setup
1. Create a new repository on GitHub.
2. Initialize and push your code:
   ```bash
   git init
   git add .
   # Note: .env files are automatically excluded by .gitignore to protect secrets
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

## 4. Vercel Configuration
1. Log in to Vercel and click **"Add New..."** -> **"Project"**.
2. Import your GitHub repository.
3. Configure the project settings exactly as below:

| Setting | Value |
| :--- | :--- |
| **Framework Preset** | `Vite` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

> **Important**: Setting the **Root Directory** to `frontend` is critical because the React app lives in a subdirectory, not the root.

## 5. Environment Variables
1. In the Vercel project setup (or Settings > Environment Variables), add the following:

| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://your-backend-url.com` | The public URL of your live backend API. |

> **Why?** Frontend apps cannot see server environment variables. We use `VITE_` prefix to securely expose this URL to the browser so the app knows where to fetch data.
> **Note**: Do NOT use `localhost` for production.

## 6. Deployment Verification
Click **"Deploy"**. Once finished:

- [ ] **Load Homepage**: Visit the provided Vercel URL.
- [ ] **Check Client Routing**: Navigate to a sub-page and refresh the browser. It should NOT show a 404 error (handled by `vercel.json`).
- [ ] **Test API**: Inspect the Network tab or try logging in to ensure requests are hitting your remote backend, not localhost.

## 6a. Continuous Deployment
Once connected to GitHub, Vercel automatically redeploys the frontend on every push to the `main` branch.

This allows rapid iteration without manual deployment steps.


## 7. Common Issues
- **Blank Page**: Usually means `VITE_API_URL` is missing or incorrect. Check console errors.
- **404 on Refresh**: Ensure `frontend/vercel.json` exists in your repository.
- **Build Failures**: Check that you selected `frontend` as the Root Directory.

## 8. What You Should See When Live
- [ ] Public HTTPS URL (`*.vercel.app`)
- [ ] Login & Register pages loading correctly
- [ ] Dashboard loads after authentication
- [ ] No console errors in production

