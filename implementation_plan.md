# Implementation Plan - Responsive PeerLink Website & Secure Backend

Build a complete, responsive campus platform (**PeerLink**) with a secure Express backend architecture, enhanced security controls, input validation, authentication, rate limiting, and complete deployment readiness (Docker, Docker Compose, production builds, and health checks).

## User Review Required

> [!IMPORTANT]
> - **Security Stack**: We will introduce `helmet`, `express-rate-limit`, `cors`, `jsonwebtoken`, and `bcryptjs` (or lightweight crypto utils) for JWT authentication, security headers, XSS/injection protection, and DDoS prevention.
> - **Deployment Packaging**: We will provide a multi-stage `Dockerfile`, `docker-compose.yml`, production build tooling, and deployment instructions for Render, Vercel, Fly.io, or AWS/Docker hostings.

## Open Questions

> [!NOTE]
> 1. **Gemini AI Key**: The server is pre-configured to use `GEMINI_API_KEY` for AI Study Chat. If the key is absent, a resilient fallback response system is included.
> 2. **Database Storage**: The backend will feature an extensible repository layer initialized with structured in-memory persistence and mock JSON persistence hooks, easily swappable with MongoDB/PostgreSQL when deploying to production.

## Proposed Changes

---

### Backend Security & Architecture Enhancement

#### [MODIFY] [package.json](file:///c:/Users/snigd/Downloads/peerlink/package.json)
- Add backend security & utility dependencies: `helmet`, `express-rate-limit`, `cors`, `jsonwebtoken`, `bcryptjs`, `zod` (or clean schema validation handlers).
- Add dev dependencies `@types/jsonwebtoken`, `@types/bcryptjs`, `@types/cors`.

#### [NEW] [server/security.ts](file:///c:/Users/snigd/Downloads/peerlink/server/security.ts)
- Implement Helmet middleware for CSP (Content Security Policy), HSTS, X-Frame-Options, X-Content-Type-Options.
- Implement rate limiters (Global API limiter, strict Auth limiter, AI endpoint limiter).
- Implement input sanitization and payload size limits.

#### [NEW] [server/auth.ts](file:///c:/Users/snigd/Downloads/peerlink/server/auth.ts)
- Implement JWT token generation, verification middleware (`authenticateToken`), password hashing using `bcryptjs` / crypto.
- Implement `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/update` endpoints with validation.

#### [MODIFY] [server.ts](file:///c:/Users/snigd/Downloads/peerlink/server.ts)
- Refactor Express server into modular router modules.
- Secure all state-modifying endpoints (`POST /api/posts`, `POST /api/poll/vote`, `POST /api/buzz`, `POST /api/projects`, `POST /api/vibes/action`, `POST /api/notes/upload`, `POST /api/chat`).
- Add global error handling middleware, request correlation IDs, standardized API output `{ success, data, error, timestamp }`.
- Implement liveness `/healthz` and readiness `/api/health` health check endpoints.

---

### Frontend UI & Client Integration

#### [MODIFY] [src/App.tsx](file:///c:/Users/snigd/Downloads/peerlink/src/App.tsx)
- Integrate JWT token authentication header (`Authorization: Bearer <token>`) in all API requests.
- Add error boundary, API toast notifications / alert banners for server state changes.
- Ensure seamless fallback behavior if server connectivity is disrupted.

#### [MODIFY] [src/components/AuthModal.tsx](file:///c:/Users/snigd/Downloads/peerlink/src/components/AuthModal.tsx)
- Add login and sign-up forms with field validation, password security feedback, and profile update capability.

#### [MODIFY] [src/index.css](file:///c:/Users/snigd/Downloads/peerlink/src/index.css)
- Refine responsive glassmorphism aesthetic, animation keyframes, dark/light theme tokens, and typography.

---

### Deployment & DevOps Setup

#### [NEW] [Dockerfile](file:///c:/Users/snigd/Downloads/peerlink/Dockerfile)
- Multi-stage Docker build for Node.js production server with Vite static asset serving.

#### [NEW] [docker-compose.yml](file:///c:/Users/snigd/Downloads/peerlink/docker-compose.yml)
- Docker Compose configuration for quick local/production containerized deployment.

#### [NEW] [.dockerignore](file:///c:/Users/snigd/Downloads/peerlink/.dockerignore)
- Ignore `node_modules`, `dist`, `.git`, `.env` files from container context.

#### [NEW] [DEPLOYMENT.md](file:///c:/Users/snigd/Downloads/peerlink/DEPLOYMENT.md)
- Comprehensive guide for deploying to Docker, Vercel, Render, Railway, and Fly.io with environment setup instructions.

---

## Verification Plan

### Automated Verification
- Run `npm run lint` / `npx tsc --noEmit` to verify type safety across frontend and backend.
- Run `npm run build` to verify production Vite and esbuild bundling without errors.
- Test server startup and API endpoints using automated HTTP requests (`GET /api/health`, `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/chat`).

### Manual Verification
- Test login/register authentication flow in AuthModal.
- Verify security headers (Helmet CSP/HSTS) and rate limiting response (429 status code on excessive requests).
- Test responsive layout across desktop, tablet, and mobile views.
