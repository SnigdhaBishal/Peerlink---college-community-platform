# PeerLink - Production Deployment Guide

This guide details how to deploy the **PeerLink** platform (Responsive React Frontend + Secure Express Node.js Backend) to production.

---

## 🚀 Environment Variables Configuration

Create a `.env` file or configure your cloud provider's environment variables dashboard with the following variables:

```env
PORT=3000
NODE_ENV=production
JWT_SECRET=your_super_secret_jwt_key_here_change_in_prod
GEMINI_API_KEY=your_google_gemini_api_key
CORS_ORIGIN=*
```

---

## 🐳 Option 1: Docker / Docker Compose Deployment (Recommended)

### Prerequisites
- Installed [Docker](https://www.docker.com/) & Docker Compose.

### Step 1: Build & Launch Container
Run the following command in the project directory:

```bash
docker-compose up --build -d
```

### Step 2: Verify Health Check
Check container status and health:
```bash
docker ps
curl http://localhost:3000/healthz

```

---

## ⚡ Option 2: Render Deployment (Free / Cloud Node.js Host)

1. Connect your GitHub repository to [Render](https://render.com/).
2. Create a new **Web Service**.
3. Set the following parameters:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
4. Add environment variables (`JWT_SECRET`, `GEMINI_API_KEY`, `NODE_ENV=production`).
5. Render will automatically build the client and start the Express backend.

---

## 🚂 Option 3: Railway / Fly.io Container Deployment

### Deploying with Railway
1. Install Railway CLI or connect via [Railway.app](https://railway.app/).
2. Link repository: `railway init`
3. Deploy: `railway up`

### Deploying with Fly.io
1. Install Fly CLI and run:
   ```bash
   fly launch
   ```
2. Deploy the application:
   ```bash
   fly deploy
   ```

---

## 🛠️ Local Production Test

To build and run locally in production mode:

```bash
# 1. Install dependencies
npm install

# 2. Build Vite static bundle and server bundle
npm run build

# 3. Start production server
npm run start
```

Visit `http://localhost:3000` in your browser.

---

## 🔒 Security Best Practices Implemented

- **Helmet Security Headers**: Enforces strict Content Security Policy, X-Frame-Options, and HSTS.
- **Express Rate Limiter**: Protects API routes, auth attempts, and AI endpoints against brute force and DDoS attacks.
- **JWT & Password Hashing**: Utilizes bcrypt for password storage and signed JWT bearer tokens.
- **Input Sanitization**: Prevents XSS script injections in user posts, comments, and AI prompts.
- **Non-Root Execution**: Docker container runs under an unprivileged `expressjs` user.
