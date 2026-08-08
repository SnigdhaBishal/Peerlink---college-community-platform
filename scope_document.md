# Scope Document - PeerLink Platform

This document defines the complete scope, user interface layout details, external system requirements, third-party dependencies, and deployment error analysis for the **PeerLink** platform.

---

## 1. Executive Summary & Project Scope

**PeerLink** is a modern, responsive campus engagement and academic collaboration web platform. It unifies social interaction, peer matching, study group collaboration, course note sharing, and AI-powered academic assistance into a single unified web application.

### Key Functional Domains
1. **Campus Feed**: Community announcements, student posts, course discussions, interactive pulse polls.
2. **Campus Hub**: Trending campus buzz announcements and collaborative project partner discovery.
3. **Vibe Check**: Peer discovery cards for study partner matching and direct messaging.
4. **AI Study Assistant**: AI conversational chat powered by Google Gemini 3.6 Flash for summarizing uploaded course notes and explaining concepts.
5. **Notes Library**: Organized course folder repository for sharing lecture slides, study guides, and past exams.
6. **Authentication & Profile System**: Password hashing, JWT token-based authentication, and profile editing.

---

## 2. Layout & UI Component Architecture

The user interface follows a modern glassmorphic, card-based Material Design 3 design system with responsive breakpoints for desktop, tablet, and mobile views.

```
+-------------------------------------------------------------------------+
|                              TopHeader                                  |
| [Logo]  [Campus Feed]  [Campus Hub]  [Vibe Check]  [AI Chat]  [Notes]   |
|                                        [Search]  [Notifications]  [User]|
+-------------------------------------------------------------------------+
|                                                                         |
|                               Main Content                              |
|   +-----------------------+ +--------------------+ +----------------+   |
|   |   Sidebar Filters     | | Main View Area     | | Widget / Stats |   |
|   |   - Course Tags       | | - Feed Cards       | | - Campus Pulse |   |
|   |   - Categories        | | - Project Grid     | | - Mutual Vibes |   |
|   |                       | | - AI Study Chat    | |                |   |
|   +-----------------------+ +--------------------+ +----------------+   |
|                                                                         |
+-------------------------------------------------------------------------+
|                     MobileBottomNav (Mobile Screen Only)                |
+-------------------------------------------------------------------------+
```

### Component Breakdown

#### A. Header & Navigation Structure
- **[`TopHeader.tsx`](file:///c:/Users/snigd/Downloads/peerlink/src/components/TopHeader.tsx)**:
  - Sticky glassmorphic top navigation bar on desktop and tablet views.
  - Quick action icons: Notifications Drawer toggle (with unread badge counter) and User Profile Auth Modal toggle.
- **[`MobileBottomNav.tsx`](file:///c:/Users/snigd/Downloads/peerlink/src/components/MobileBottomNav.tsx)**:
  - Fixed bottom navigation bar for screen widths `< 768px` providing one-thumb tab switching (`Feed`, `Hub`, `Vibe`, `AI Chat`, `Notes`).

#### B. Views
- **[`CampusFeedView.tsx`](file:///c:/Users/snigd/Downloads/peerlink/src/components/CampusFeedView.tsx)**:
  - Responsive 3-column desktop layout (Filter sidebar, Post Feed, Pulse widget).
  - Post creation modal, like counters, threaded comments list, and interactive radio poll options.
- **[`CampusHubView.tsx`](file:///c:/Users/snigd/Downloads/peerlink/src/components/CampusHubView.tsx)**:
  - Two primary sections: *Trending Campus Buzz* and *Active Projects Grid*.
  - Direct project join button, project group chat launcher, and buzz creation modal.
- **[`VibeCheckView.tsx`](file:///c:/Users/snigd/Downloads/peerlink/src/components/VibeCheckView.tsx)**:
  - Swipe/button candidate deck with peer profile tags, major, class year, and verification badge.
  - Mutual connection row with direct peer messaging launcher.
- **[`AiChatView.tsx`](file:///c:/Users/snigd/Downloads/peerlink/src/components/AiChatView.tsx)**:
  - Chat message stream with Markdown formatting, document context pill switcher, typing indicator, and document reference badges.
- **[`NotesLibraryView.tsx`](file:///c:/Users/snigd/Downloads/peerlink/src/components/NotesLibraryView.tsx)**:
  - Course folder cards (e.g. CS201, Biology 101, History 204), file upload dropzone, document list view, and peer contribution stats counter.

#### C. Modals & Overlays
- **[`AuthModal.tsx`](file:///c:/Users/snigd/Downloads/peerlink/src/components/AuthModal.tsx)**: Multi-tab overlay (*Profile Edit*, *Sign In*, *Register*) handling user state and JWT storage.
- **[`NotificationsDrawer.tsx`](file:///c:/Users/snigd/Downloads/peerlink/src/components/NotificationsDrawer.tsx)**: Slide-out panel for activity alerts.
- **[`DirectMessageDrawer.tsx`](file:///c:/Users/snigd/Downloads/peerlink/src/components/DirectMessageDrawer.tsx)**: Real-time simulated peer-to-peer and project channel chat overlay.

---

## 3. External System Requirements & Third-Party Dependencies

### System Requirements
| Requirement | Minimum / Version | Purpose |
| :--- | :--- | :--- |
| **Node.js Runtime** | Node 20 LTS or higher | Express server execution & asset bundling |
| **Package Manager** | npm v10+ | Dependency resolution and scripts |
| **Container Engine** | Docker v24+ / Docker Compose v2+ | Optional containerized deployment |
| **Memory / CPU** | 512 MB RAM, 1 vCPU | Low-footprint server execution |

### External APIs & Network Assets
1. **Google Gemini API**:
   - Endpoint: `https://generativelanguage.googleapis.com`
   - Purpose: Generative AI explanations and chapter summaries in AI Study Chat.
   - Requirement: `GEMINI_API_KEY` set in environment variables. Includes automatic fallback if key is unconfigured.
2. **CDN & Image Hosts**:
   - Google Fonts (`https://fonts.googleapis.com`, `https://fonts.gstatic.com`): Fonts (`Inter`, `Material Symbols Outlined`).
   - Unsplash (`https://images.unsplash.com`): High-resolution campus and avatar images.

### Key NPM Packages & Libraries
- **Backend Security**: `helmet` (HTTP security headers), `express-rate-limit` (DDoS protection), `cors`, `jsonwebtoken` (JWT bearer tokens), `bcryptjs` (password hashing).
- **Core Runtime**: `express`, `dotenv`, `@google/genai`.
- **Frontend Stack**: `react` 19, `react-dom`, `vite` 6, `tailwindcss` 4, `lucide-react`, `motion` (Framer Motion).

---

## 4. Deployment Error & Audit Analysis

A full audit of the codebase was conducted to identify and mitigate common deployment issues.

### 🔍 Identified Risk Audit & Resolved Solutions

| Potential Error / Failure Point | Cause | Implemented Resolution | Status |
| :--- | :--- | :--- | :--- |
| **CORS Wildcard with Credentials** | Browser blocks `Access-Control-Allow-Origin: *` when credentials are set | Dynamically reflect request origin in `server/security.ts` when origin is `'*'` | ✅ Resolved |
| **Dynamic Port Assignment** | Hostings like Render/Railway pass arbitrary `PORT` | `server/config.ts` reads `process.env.PORT` with `3000` fallback | ✅ Resolved |
| **Missing API Key Crash** | Missing `GEMINI_API_KEY` in environment | Gemini client wrapper in `server/routes/api.ts` includes structured fallback response system | ✅ Resolved |
| **Unprivileged Docker Execution** | Running containers as root creates security risks | `Dockerfile` uses dedicated `expressjs` user (`uid 1001`) | ✅ Resolved |
| **Reverse Proxy Rate Limiting** | Rate limiters misuse proxy IP addresses | Enabled `app.set('trust proxy', 1)` in `server.ts` for Nginx/Render proxies | ✅ Resolved |
| **TypeScript Compilation Errors** | Missing type definitions or mismatched schema interfaces | Updated `UserProfile` with optional fields; `npx tsc --noEmit` verified 0 errors | ✅ Resolved |
| **Static Build Asset Pathing** | Single-page application router returning 404s on refresh | Production Express handler returns `dist/index.html` for all unhandled GET routes | ✅ Resolved |

---

## 5. Deployment Readiness Summary

- **TypeScript Compilation**: `npx tsc --noEmit` -> **PASSED (0 Errors)**
- **Production Asset Build**: `npm run build` -> **PASSED (`dist/index.html`, `dist/assets/`, `dist/server.cjs`)**
- **Server Health Probes**: `/healthz` & `/api/health` -> **PASSED (200 OK)**
- **Authentication & Endpoints**: User Registration, Login, Chat APIs -> **PASSED**
