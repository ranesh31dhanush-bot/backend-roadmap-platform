# 35. Epic & User Story Breakdown

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 5 — Scrum Master Planning  
**Role:** BMAD Scrum Master  
**Status:** Comprehensive Story Specifications  

---

## Epic 0: Project & Architecture Foundation (Sprint 0)

### FND-001: Monorepo Structure & TypeScript Setup
- **User Story:** As a developer, I want a clean monorepo workspace containing `frontend/`, `backend/`, and `shared/` packages with shared TypeScript configurations so that development proceeds with type safety and modular isolation.
- **Priority:** P0 | **Release:** MVP | **Size:** S | **Sprint:** Sprint 0
- **Dependencies:** None
- **Acceptance Criteria:**
  - **Given** the clean repository root, **When** executing build/lint scripts, **Then** all workspace packages (`frontend`, `backend`, `shared`) compile without TypeScript errors.
  - **Given** any shared DTO in `shared/src/`, **When** imported in frontend or backend, **Then** type definitions resolve cleanly without circular dependencies.
- **Technical Scope:** Workspace root, `pnpm-workspace.yaml` / npm workspaces, `tsconfig.base.json`, `.editorconfig`, `.prettierrc`.
- **Architecture Reference:** `16-system-context-and-architecture.md`, `ADR-001`
- **Definition of Done:** Workspaces configured, TypeScript builds pass on all 3 directories, strict mode enabled.

---

### FND-002: Express Backend Bootstrap & Env Validation
- **User Story:** As a developer, I want an Express.js server boilerplate with Zod-based environment variable validation and graceful shutdown handling so that the server fails fast on misconfiguration.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 0
- **Dependencies:** FND-001
- **Acceptance Criteria:**
  - **Given** missing required environment variables (e.g. `PORT`, `MONGODB_URI`, `JWT_SECRET`), **When** the backend initializes, **Then** it exits immediately with a descriptive Zod schema validation error.
  - **Given** a running Express process, **When** `SIGTERM` or `SIGINT` is received, **Then** existing requests complete and database connections close gracefully within 10 seconds.
- **Technical Scope:** `backend/src/config/env.ts`, `backend/src/server.ts`, `backend/src/app.ts`.
- **Architecture Reference:** `18-backend-architecture.md`, `ADR-001`
- **Definition of Done:** Env schema validates on startup, Express server starts on configurable port, `/health/live` returns `200 OK`.

---

### FND-003: MongoDB Atlas Connection & Mongoose Setup
- **User Story:** As a backend service, I want a reliable, pooled Mongoose connection to MongoDB Atlas with auto-reconnection and schema index synchronization so that data operations remain consistent and fast.
- **Priority:** P0 | **Release:** MVP | **Size:** S | **Sprint:** Sprint 0
- **Dependencies:** FND-002
- **Acceptance Criteria:**
  - **Given** a valid `MONGODB_URI`, **When** the server boots, **Then** Mongoose connects with a connection pool size of 10–50 and logs successful connection.
  - **Given** a network interruption, **When** the database becomes temporarily unavailable, **Then** Mongoose attempts automatic reconnection with exponential backoff.
- **Technical Scope:** `backend/src/config/database.ts`, Mongoose connection hooks.
- **Architecture Reference:** `20-mongodb-data-model.md`, `ADR-002`
- **Definition of Done:** Connection lifecycle events logged, health check reports database status, unit tests mock MongoDB correctly.

---

### FND-004: Next.js 15+ App Router Setup & Tailwind Theme
- **User Story:** As a learner, I want a fast, dark-mode-first Next.js web application styled according to the design tokens so that my learning workspace feels sleek, modern, and accessible.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 0
- **Dependencies:** FND-001
- **Acceptance Criteria:**
  - **Given** the Next.js application, **When** loaded in any modern browser, **Then** the page renders using the dark palette (`#0B0F17` background, `#111827` surface, `#6366F1` indigo primary).
  - **Given** typography classes, **When** applied to headings and code, **Then** `Inter` and `JetBrains Mono` fonts render cleanly.
- **Technical Scope:** `frontend/app/layout.tsx`, `frontend/tailwind.config.ts`, `frontend/app/globals.css`.
- **Architecture / UX Reference:** `17-frontend-architecture.md`, `11-ux-design-system.md`
- **Definition of Done:** Next.js App Router scaffolded, Tailwind dark theme tokens configured, font assets loaded with zero layout shift.

---

### FND-005: Centralized Error Handling & Pino Logging
- **User Story:** As a developer/admin, I want structured JSON logging with correlation IDs and centralized exception mapping so that production errors are instantly traceable without leaking internals.
- **Priority:** P0 | **Release:** MVP | **Size:** S | **Sprint:** Sprint 0
- **Dependencies:** FND-002
- **Acceptance Criteria:**
  - **Given** any HTTP request, **When** entering Express middleware, **Then** an `x-request-id` header is assigned and attached to all Pino log lines.
  - **Given** an unhandled domain `AppError`, **When** caught by the error handler, **Then** the client receives a standard JSON error envelope `{ success: false, error: { code, message } }` with the appropriate HTTP status code.
- **Technical Scope:** `backend/src/middleware/errorHandler.ts`, `backend/src/middleware/requestId.ts`, `backend/src/utils/logger.ts`.
- **Architecture Reference:** `18-backend-architecture.md`
- **Definition of Done:** Centralized error middleware tests pass, 404 handler returns structured JSON, stack traces omitted in production mode.

---

### FND-006: Shared Type Contracts & API Envelope
- **User Story:** As a fullstack developer, I want unified TypeScript interfaces and API response envelopes in the `shared/` package so that frontend and backend communicate with strict compile-time contract guarantees.
- **Priority:** P0 | **Release:** MVP | **Size:** S | **Sprint:** Sprint 0
- **Dependencies:** FND-001
- **Acceptance Criteria:**
  - **Given** the `shared/` package, **When** defining generic `ApiResponse<T>` and standard error types, **Then** both frontend API clients and backend controllers compile against the exact same shapes.
- **Technical Scope:** `shared/src/types/api.ts`, `shared/src/types/curriculum.ts`, `shared/src/types/auth.ts`.
- **Architecture Reference:** `21-api-specification.md`
- **Definition of Done:** Type packages exported, verified by TypeScript build in both `frontend` and `backend`.

---

### FND-007: Testing Pipeline (Vitest, Supertest, Playwright)
- **User Story:** As a quality engineer, I want automated unit, integration, and end-to-end testing frameworks configured so that all future stories can be verified against automated regressions.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 0
- **Dependencies:** FND-001, FND-002, FND-004
- **Acceptance Criteria:**
  - **Given** the test suites, **When** running `npm run test:unit`, `npm run test:integration`, and `npm run test:e2e`, **Then** test runners execute and report coverage metrics accurately.
  - **Given** an integration test, **When** launched, **Then** it utilizes an in-memory MongoDB server instance for fast, isolated database testing.
- **Technical Scope:** `backend/vitest.config.ts`, `frontend/vitest.config.ts`, `playwright.config.ts`, `mongodb-memory-server`.
- **Architecture Reference:** `30-testing-architecture.md`
- **Definition of Done:** Test scripts functional across all workspaces, sample passing test in place for each tier.

---

## Epic 1: Authentication & Identity (Sprint 1)

### AUTH-001: User Registration API & Password Hashing
- **User Story:** As a new learner, I want to register an account using my email and password so that my progress and notes are securely stored under my personal profile.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 1
- **Dependencies:** FND-002, FND-003, FND-005, FND-006
- **Acceptance Criteria:**
  - **Given** valid registration details (`email`, `password`, `displayName`), **When** POSTing to `/api/v1/auth/register`, **Then** the password is salted and hashed with Argon2id/bcrypt (cost factor 12) and stored in `user_credentials`, creating a record in `users` with role `learner`.
  - **Given** an already registered email, **When** attempting registration, **Then** the API returns `409 Conflict` with a user-friendly error message.
  - **Given** a weak password (< 8 chars or missing complexity), **When** submitted, **Then** the Zod validator rejects it with `400 Bad Request`.
- **Technical Scope:** `backend/src/modules/auth/auth.controller.ts`, `backend/src/modules/auth/auth.service.ts`, `user.model.ts`, `user_credentials.model.ts`.
- **Architecture Reference:** `22-authentication-security-architecture.md`, `ADR-003`
- **Definition of Done:** Unit tests for password hashing pass, integration test validates user persistence and duplicate rejection.

---

### AUTH-002: Dual-Token Cookie Authentication & Session Store
- **User Story:** As a learner, I want to log in and receive secure HttpOnly cookies with automatic token rotation so that my session remains active and resistant to XSS and token-theft attacks.
- **Priority:** P0 | **Release:** MVP | **Size:** L | **Sprint:** Sprint 1
- **Dependencies:** AUTH-001
- **Acceptance Criteria:**
  - **Given** valid credentials, **When** POSTing to `/api/v1/auth/login`, **Then** the server issues a short-lived `accessToken` (15m) and long-lived `refreshToken` (7d) as `HttpOnly`, `Secure`, `SameSite=Lax` cookies and creates an active record in `user_sessions`.
  - **Given** an expired `accessToken`, **When** POSTing to `/api/v1/auth/refresh` with a valid `refreshToken`, **Then** a new token pair is issued, the old refresh token is invalidated, and the session is updated (token family rotation).
  - **Given** a reused/stolen refresh token, **When** submitted, **Then** the entire token family is revoked immediately and the session is destroyed.
- **Technical Scope:** `backend/src/modules/auth/session.service.ts`, `user_sessions.model.ts`, cookie signing utilities.
- **Architecture Reference:** `22-authentication-security-architecture.md`, `ADR-003`
- **Definition of Done:** Dual-token rotation fully tested, token reuse detection unit/integration tests verified.

---

### AUTH-003: Google OAuth 2.0 Integration & Account Linking
- **User Story:** As a learner, I want to sign in with my Google account so that I can authenticate quickly without remembering a separate password.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 1
- **Dependencies:** AUTH-002
- **Acceptance Criteria:**
  - **Given** a learner clicking "Continue with Google", **When** redirected to `/api/v1/auth/google`, **Then** the server initiates OAuth flow with PKCE and state verification.
  - **Given** a successful Google callback at `/api/v1/auth/google/callback`, **When** verified, **Then** a user profile is created or linked via `googleId`, and authentication cookies are set.
- **Technical Scope:** `backend/src/modules/auth/oauth.service.ts`, Google OAuth client.
- **Architecture Reference:** `22-authentication-security-architecture.md`
- **Definition of Done:** OAuth initiation and callback handlers tested with mocked Google API responses.

---

### AUTH-004: Password Reset Flow via Email Tokens
- **User Story:** As a learner who forgot my password, I want to request a password reset link to my registered email so that I can securely regain access to my account.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 1
- **Dependencies:** AUTH-001
- **Acceptance Criteria:**
  - **Given** an email address, **When** POSTing to `/api/v1/auth/forgot-password`, **Then** a cryptographically secure random token (hashed in DB) is generated with a 1-hour expiration.
  - **Given** a valid reset token and new password, **When** POSTing to `/api/v1/auth/reset-password`, **Then** the password is updated and all existing active sessions are terminated.
- **Technical Scope:** `backend/src/modules/auth/passwordReset.service.ts`, email dispatch stub.
- **Architecture Reference:** `22-authentication-security-architecture.md`
- **Definition of Done:** Reset token generation, hashing, verification, and expiration tests passing.

---

### AUTH-005: RBAC Middleware & CSRF Double-Submit Protection
- **User Story:** As a system architect, I want role-based access control and CSRF validation headers on all mutating endpoints so that unauthorized users cannot invoke admin or cross-site operations.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 1
- **Dependencies:** AUTH-002
- **Acceptance Criteria:**
  - **Given** a request to `/api/v1/admin/*`, **When** the authenticated user has role `learner`, **Then** the server returns `403 Forbidden`.
  - **Given** a mutating request (POST/PUT/PATCH/DELETE), **When** the `x-csrf-token` header does not match the signed CSRF cookie, **Then** the server rejects the request with `403 Forbidden`.
- **Technical Scope:** `backend/src/middleware/authGuard.ts`, `backend/src/middleware/rbacGuard.ts`, `backend/src/middleware/csrfGuard.ts`.
- **Architecture Reference:** `22-authentication-security-architecture.md`
- **Definition of Done:** Security middleware tests verify learner block on admin routes, CSRF token header validation verified.

---

### AUTH-006: Frontend Auth Screens (Login, Register, Forgot)
- **User Story:** As a learner, I want responsive, accessible login, registration, and password recovery pages styled to the design system so that I can authenticate smoothly on mobile and desktop.
- **Priority:** P0 | **Release:** MVP | **Size:** L | **Sprint:** Sprint 1
- **Dependencies:** FND-004, AUTH-001, AUTH-002, AUTH-003
- **Acceptance Criteria:**
  - **Given** the login/registration forms, **When** submitted with invalid fields, **Then** inline Zod error messages render with accessible `aria-invalid` and `aria-describedby` attributes.
  - **Given** a user submitting credentials, **When** processing, **Then** the submit button displays an accessible loading spinner and disables duplicate clicks.
- **Technical Scope:** `frontend/app/(auth)/login/page.tsx`, `register/page.tsx`, `forgot-password/page.tsx`, `AuthCard.tsx`, `SocialAuthButtons.tsx`.
- **Architecture / UX Reference:** `17-frontend-architecture.md`, `12-ux-wireframes.md` (Screen A, B, C)
- **Definition of Done:** Forms validate on blur/submit, keyboard navigation compliant (WCAG AA), responsive across 375px–1920px.

---

### AUTH-007: Auth State Provider & Axios/Fetch Interceptors
- **User Story:** As a frontend client, I want an Auth Context Provider and HTTP interceptor that automatically refreshes expired access tokens so that user sessions never drop unexpectedly during active study.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 1
- **Dependencies:** AUTH-002, AUTH-006
- **Acceptance Criteria:**
  - **Given** an API call failing with `401 Unauthorized`, **When** intercepted, **Then** the client calls `/api/v1/auth/refresh` behind the scenes, replays the original request, and updates global user state without user disruption.
  - **Given** a refresh failure (session terminated), **When** detected, **Then** the client redirects cleanly to `/login?redirect=...`.
- **Technical Scope:** `frontend/lib/api/client.ts`, `frontend/stores/authStore.ts`, `frontend/providers/AuthProvider.tsx`.
- **Architecture Reference:** `17-frontend-architecture.md`
- **Definition of Done:** Token refresh interceptor tested with mock 401s, logout clears client state and cache.

---

## Epic 2: Learner Onboarding & Schedule Initialization (Sprint 2)

### ONBD-001: Onboarding Data Model & Schedule Initialization API
- **User Story:** As a newly registered learner, I want an onboarding API that stores my chosen start date, learning pace, and role target so that my personalized 52-week schedule is anchored in the database.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 2
- **Dependencies:** AUTH-002, CURR-001
- **Acceptance Criteria:**
  - **Given** a learner profile without an active schedule, **When** POSTing to `/api/v1/onboarding/start` with `{ startDate: "YYYY-MM-DD", targetRole: "Backend Engineer" }`, **Then** a record in `user_schedules` is created with `startDate`, `pausedAt: null`, `totalPauseDays: 0`, and `users.isOnboarded` is set to `true`.
  - **Given** an existing schedule, **When** trying to re-initialize without reset, **Then** the API returns `409 Conflict`.
- **Technical Scope:** `backend/src/modules/onboarding/onboarding.controller.ts`, `user_schedules.model.ts`.
- **Architecture Reference:** `24-scheduling-progress-architecture.md`, `ADR-005`
- **Definition of Done:** Integration tests confirm schedule anchor creation and idempotency.

---

### ONBD-002: Interactive Onboarding Wizard & Date Picker UI
- **User Story:** As a new learner, I want an interactive 3-step onboarding wizard (Welcome $\rightarrow$ Start Date Selection $\rightarrow$ Schedule Projection Confirmation) so that I clearly understand my 52-week commitment.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 2
- **Dependencies:** FND-004, ONBD-001
- **Acceptance Criteria:**
  - **Given** Step 2 of the wizard, **When** selecting a start date (Today, Tomorrow, Next Monday, or Custom Date), **Then** Step 3 dynamically projects and displays the completion date and phase milestones.
  - **Given** the final step confirmation, **When** clicking "Launch My Roadmap", **Then** the onboarding API is called and the learner is routed to `/dashboard`.
- **Technical Scope:** `frontend/app/(learner)/onboarding/page.tsx`, `OnboardingWizard.tsx`, `DatePicker.tsx`.
- **Architecture / UX Reference:** `10-ux-user-flows.md` (Flow 2), `12-ux-wireframes.md` (Screen D)
- **Definition of Done:** Wizard state transitions smoothly, date math matches backend algorithm, keyboard focus accessible.

---

### ONBD-003: Learner Setup Routing Guard & Profile Hydration
- **User Story:** As a learner navigating the app, I want routing middleware that redirects un-onboarded users to `/onboarding` and onboarded users directly to `/dashboard` so that incomplete states are prevented.
- **Priority:** P0 | **Release:** MVP | **Size:** S | **Sprint:** Sprint 2
- **Dependencies:** AUTH-007, ONBD-001
- **Acceptance Criteria:**
  - **Given** an authenticated user with `isOnboarded: false`, **When** accessing `/dashboard` or `/curriculum`, **Then** Next.js middleware redirects to `/onboarding`.
  - **Given** an onboarded user, **When** accessing `/onboarding`, **Then** middleware redirects to `/dashboard`.
- **Technical Scope:** `frontend/middleware.ts`, route guards.
- **Architecture Reference:** `17-frontend-architecture.md`
- **Definition of Done:** Routing rules covered by automated Playwright navigation tests.

---

## Epic 3: Dynamic Roadmap & Curriculum Hierarchy (Sprint 2 & 3)

### CURR-001: Canonical Curriculum Schema & Tree Seeding
- **User Story:** As a system architect, I want the canonical 52-week / 5-phase / 364-day / 813-topic backend roadmap seeded into MongoDB with immutable canonical slugs (`p1-w1-d1-t1`) so that learning nodes are permanently addressable.
- **Priority:** P0 | **Release:** MVP | **Size:** L | **Sprint:** Sprint 2
- **Dependencies:** FND-003
- **Acceptance Criteria:**
  - **Given** the database seed script, **When** executed against the JSON curriculum source, **Then** all 5 phases, 52 weeks, 364 days, 813 topics, and 454 resources are inserted into `curriculum_nodes` version `1.0.0` with `status: "published"`.
  - **Given** any topic node, **When** inspected, **Then** its `canonicalId` follows the exact hierarchy syntax `p<N>-w<N>-d<N>-t<N>` without index-based volatility.
- **Technical Scope:** `backend/src/modules/curriculum/curriculum.model.ts`, `backend/src/seeds/curriculum_v1.json`, seed runner script.
- **Architecture Reference:** `20-mongodb-data-model.md`, `23-curriculum-versioning-architecture.md`, `ADR-004`
- **Definition of Done:** Complete 52-week tree verified by automated test, total count matches discovery inventory (5 phases, 52 weeks, 364 days, 813 topics).

---

### CURR-002: Curriculum Hierarchy Read API with In-Memory Cache
- **User Story:** As a learner, I want an ultra-fast `/api/v1/curriculum` API that returns the full curriculum tree or specific phase/week subtrees in `<50ms` using in-memory caching.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 2
- **Dependencies:** CURR-001
- **Acceptance Criteria:**
  - **Given** a GET request to `/api/v1/curriculum`, **When** invoked, **Then** the server returns the active published version tree from an in-memory LRU cache in `<30ms`.
  - **Given** a GET request to `/api/v1/curriculum/nodes/:canonicalId`, **When** queried with a valid slug (e.g., `p1-w2-d3`), **Then** it returns the exact node with its child subtopics, curated resources, and skip directives.
- **Technical Scope:** `backend/src/modules/curriculum/curriculum.controller.ts`, `curriculum.service.ts`, in-memory cache adapter.
- **Architecture Reference:** `21-api-specification.md`, `27-caching-and-background-jobs.md`, `ADR-008`
- **Definition of Done:** Integration tests confirm cache hits, P95 response time `< 50ms`.

---

### CURR-003: Interactive Roadmap View & Phase/Week Accordion
- **User Story:** As a learner, I want an interactive, collapsible roadmap view displaying all 5 Phases and 52 Weeks with visual completion percentages, salary milestones, and phase badges so that I can easily navigate my entire career path.
- **Priority:** P0 | **Release:** MVP | **Size:** L | **Sprint:** Sprint 3
- **Dependencies:** FND-004, CURR-002
- **Acceptance Criteria:**
  - **Given** the Roadmap page (`/curriculum`), **When** rendered, **Then** 5 phase cards display with their respective week counts, topic totals, target salary milestones ($80k $\rightarrow$ $300k+), and active progress bars.
  - **Given** a Phase card, **When** expanded, **Then** weeks 1–52 expand smoothly with day pills and completion status indicators.
- **Technical Scope:** `frontend/app/(learner)/curriculum/page.tsx`, `PhaseCard.tsx`, `WeekAccordion.tsx`, `PhaseProgressBar.tsx`.
- **Architecture / UX Reference:** `17-frontend-architecture.md`, `12-ux-wireframes.md` (Screen E, F)
- **Definition of Done:** Responsive accordion, smooth 200ms transitions, keyboard navigation compliant (`Enter`/`Space` to expand).

---

### CURR-004: Curriculum Search & Phase/Week Deep-Link Engine
- **User Story:** As a learner, I want a global search bar (and `Cmd+K` command palette) to search across all 813 topics and deep-link directly to the matching Day Workspace so that I can reference backend concepts instantly.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 3
- **Dependencies:** CURR-003
- **Acceptance Criteria:**
  - **Given** pressing `Cmd+K` or `Ctrl+K`, **When** the modal opens and a query (e.g. "Redis Distributed Locks") is typed, **Then** fuzzy search returns matching topics, weeks, and days in `<50ms`.
  - **Given** selecting a search result, **When** clicked, **Then** the user is navigated directly to `/workspace?day=p3-w27-d2`.
- **Technical Scope:** `frontend/components/CommandPalette.tsx`, client-side Fuse.js / search index.
- **Architecture / UX Reference:** `09-ux-information-architecture.md`, `13-ux-component-inventory.md`
- **Definition of Done:** Command palette accessible via shortcut and header button, search results highlight matching terms.

---

### CURR-005: Resource Links Catalog & Skip Directives Renderer
- **User Story:** As a learner, I want curated external articles, official documentation, GitHub repositories, and explicit "Skip If Already Mastered" guidance rendered on each topic so that I optimize my study time.
- **Priority:** P0 | **Release:** MVP | **Size:** S | **Sprint:** Sprint 3
- **Dependencies:** CURR-003
- **Acceptance Criteria:**
  - **Given** a topic detail card, **When** rendered, **Then** external resources display with verified domain icons (GitHub, MDN, RFC, YouTube) and `rel="noopener noreferrer"`.
  - **Given** a topic with a `skipDirective` (e.g., "Skip basic CSS if you have fullstack experience"), **When** present, **Then** a distinct visual banner renders above the topic resources.
- **Technical Scope:** `frontend/components/ResourceLinkList.tsx`, `SkipDirectiveBanner.tsx`.
- **Architecture / UX Reference:** `11-ux-design-system.md`, `13-ux-component-inventory.md`
- **Definition of Done:** Component renders verified links, skip banners render with warning color token (`#F59E0B`).

---

## Epic 4: Adaptive Scheduling & Pause Engine (Sprint 3)

### SCHD-001: Dynamic Calendar Date Calculation Engine
- **User Story:** As a learner, I want the system to calculate the exact calendar dates for all 364 days dynamically from my `startDate` and accumulated pause days without storing 364 redundant calendar records.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 3
- **Dependencies:** ONBD-001
- **Acceptance Criteria:**
  - **Given** a learner with `startDate = "2026-01-01"` and `totalPauseDays = 0`, **When** querying Day 10 (`p1-w2-d3`, day offset 9), **Then** the projected date is calculated deterministically as `"2026-01-10"`.
  - **Given** a user pausing for 5 days, **When** resumed, **Then** all future day projections shift forward by exactly 5 calendar days.
- **Technical Scope:** `backend/src/modules/scheduling/scheduleProjection.ts`, shared calculation utility.
- **Architecture Reference:** `24-scheduling-progress-architecture.md`, `ADR-005`
- **Definition of Done:** 100% unit test coverage for leap years, month boundaries, and pause offsets.

---

### SCHD-002: Reschedule Schedule API & Date Shift Calculation
- **User Story:** As a learner who fell behind or wants to restart, I want to update my schedule start date via `/api/v1/schedule/reschedule` without losing any completed topics, notes, or quiz high scores.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 3
- **Dependencies:** SCHD-001
- **Acceptance Criteria:**
  - **Given** an existing schedule, **When** PATCHing to `/api/v1/schedule/reschedule` with a new `startDate`, **Then** the `startDate` is updated in `user_schedules` in a single scalar update.
  - **Given** the updated schedule, **When** the learner views their workspace, **Then** calendar dates re-align to the new anchor while all previous checkmarks, notes, and quiz scores remain 100% intact.
- **Technical Scope:** `backend/src/modules/scheduling/schedule.controller.ts`, `schedule.service.ts`.
- **Architecture Reference:** `24-scheduling-progress-architecture.md`, `ADR-005`
- **Definition of Done:** Reschedule endpoint tested; verifies zero data loss across progress and notes collections.

---

### SCHD-003: Pause & Resume Course Lifecycle API
- **User Story:** As a learner going on vacation or facing exams, I want to pause my course so that my schedule freezes and resume it later with all future dates automatically shifted by the paused duration.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 3
- **Dependencies:** SCHD-001
- **Acceptance Criteria:**
  - **Given** an active schedule, **When** POSTing to `/api/v1/schedule/pause`, **Then** `pausedAt` is recorded with the current timestamp and schedule status changes to `"paused"`.
  - **Given** a paused schedule, **When** POSTing to `/api/v1/schedule/resume`, **Then** the elapsed days ($\Delta \text{days}$) are added to `totalPauseDays`, `pausedAt` is cleared to `null`, and schedule status changes to `"active"`.
- **Technical Scope:** `backend/src/modules/scheduling/schedule.service.ts`, `pause_events` audit tracking.
- **Architecture Reference:** `24-scheduling-progress-architecture.md`, `ADR-005`
- **Definition of Done:** Pause/resume cycle tests confirm correct delta addition and idempotent resume calls.

---

### SCHD-004: Schedule Management Modal & Calendar Date Projection UI
- **User Story:** As a learner, I want an intuitive Schedule Settings modal accessible from the top navigation to view my current schedule, pause/resume the course, or shift my start date with a visual date preview.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 3
- **Dependencies:** FND-004, SCHD-002, SCHD-003
- **Acceptance Criteria:**
  - **Given** the Schedule modal, **When** clicking "Pause Course", **Then** the UI displays a clear "Course Paused" banner with a 1-click "Resume Learning" button.
  - **Given** selecting a new start date in the reschedule tab, **When** previewed, **Then** the UI shows a side-by-side comparison of "Current End Date" vs "Projected New End Date".
- **Technical Scope:** `frontend/components/ScheduleModal.tsx`, `CourseStatusBanner.tsx`.
- **Architecture / UX Reference:** `10-ux-user-flows.md` (Flow 6), `12-ux-wireframes.md` (Screen O)
- **Definition of Done:** Modal integrates with backend schedule APIs, handles error rollbacks cleanly.

---

## Epic 5: Daily Learning Workspace & Progress Tracking (Sprint 4)

### DWKS-001: Daily Learning Workspace Layout & Day Header
- **User Story:** As a learner, I want a dedicated Daily Learning Workspace (`/workspace`) with a breadcrumb header (Phase / Week / Day), calendar date indicator, and day navigation arrows so that I can focus entirely on today's curriculum.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 4
- **Dependencies:** FND-004, CURR-003, SCHD-001
- **Acceptance Criteria:**
  - **Given** the workspace page, **When** loaded with `?day=p1-w1-d1`, **Then** the header displays "Phase 1: Foundation $\rightarrow$ Week 1 $\rightarrow$ Day 1", the dynamic calendar date (e.g. "Monday, Oct 12"), and current day completion status.
  - **Given** clicking "Next Day $\rightarrow$", **When** triggered, **Then** the route transitions to `d2` without full-page reload.
- **Technical Scope:** `frontend/app/(learner)/workspace/page.tsx`, `DayWorkspaceHeader.tsx`, `DayNavigationControls.tsx`.
- **Architecture / UX Reference:** `12-ux-wireframes.md` (Screen G)
- **Definition of Done:** Responsive workspace layout, sticky header on mobile, deep-linkable URL parameters.

---

### DWKS-002: Day Topic Checklist & Subtopic Action Items
- **User Story:** As a learner, I want an interactive checklist of all topics, key concepts, code snippets, and resources for the selected day so that I can systematically check off items as I learn.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 4
- **Dependencies:** DWKS-001, CURR-001
- **Acceptance Criteria:**
  - **Given** Day 1 workspace, **When** rendered, **Then** all child topics display with interactive checkboxes, duration estimates, code blocks (syntax-highlighted with JetBrains Mono), and resource links.
  - **Given** all topics for a day are checked, **When** completed, **Then** a celebratory banner ("Day Completed! 🎉") renders with a prompt to take the daily quiz.
- **Technical Scope:** `frontend/components/TopicChecklist.tsx`, `TopicItem.tsx`, `CodeBlock.tsx`.
- **Architecture / UX Reference:** `13-ux-component-inventory.md`, `11-ux-design-system.md`
- **Definition of Done:** Checkbox state accessible via keyboard (`Space`), code blocks support 1-click copy to clipboard.

---

### DWKS-003: Daily Workspace Day-Switching & Keyboard Shortcuts
- **User Story:** As a power-user learner, I want keyboard shortcuts (`[` for Previous Day, `]` for Next Day, `Space` to toggle active topic) so that I can navigate my learning path without touching the mouse.
- **Priority:** P0 | **Release:** MVP | **Size:** S | **Sprint:** Sprint 4
- **Dependencies:** DWKS-002
- **Acceptance Criteria:**
  - **Given** the workspace view, **When** pressing `]` (and not typing inside a textarea/input), **Then** the workspace navigates to the next consecutive day.
  - **Given** reaching Day 364, **When** pressing `]`, **Then** navigation safely disables.
- **Technical Scope:** `frontend/hooks/useWorkspaceShortcuts.ts`.
- **Architecture / UX Reference:** `14-ux-accessibility-and-responsive.md`
- **Definition of Done:** Shortcuts ignore active inputs, keyboard focus indicator visible on active topic.

---

### PROG-001: Topic Progress Ledger Schema & Toggle Status API
- **User Story:** As a learner, I want to toggle a topic completion status via `/api/v1/progress/toggle` with atomic persistence in MongoDB so that my progress is permanently and reliably recorded.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 4
- **Dependencies:** AUTH-002, CURR-001
- **Acceptance Criteria:**
  - **Given** an authenticated user and topic slug `p1-w1-d1-t1`, **When** POSTing to `/api/v1/progress/toggle` with `{ completed: true }`, **Then** a record in `topic_progress` is upserted with `completed: true`, `completedAt: Date()`.
  - **Given** a toggle to `{ completed: false }`, **When** executed, **Then** the record is updated with `completed: false`, `completedAt: null`.
  - **Given** concurrent toggle requests for the same topic, **When** executed, **Then** the compound unique index (`userId` + `topicCanonicalId`) prevents duplicate rows.
- **Technical Scope:** `backend/src/modules/progress/progress.controller.ts`, `progress.service.ts`, `topic_progress.model.ts`.
- **Architecture Reference:** `20-mongodb-data-model.md`, `24-scheduling-progress-architecture.md`, `ADR-006`
- **Definition of Done:** Upsert logic covered by concurrent execution integration tests.

---

### PROG-002: Progress Rollup Aggregation Pipeline Engine
- **User Story:** As a learner/admin, I want the backend to compute exact hierarchical rollups (Day %, Week %, Phase %, Global %) on demand via MongoDB aggregation pipelines so that progress metrics are 100% mathematically correct and never drift.
- **Priority:** P0 | **Release:** MVP | **Size:** L | **Sprint:** Sprint 4
- **Dependencies:** PROG-001
- **Acceptance Criteria:**
  - **Given** a user with 10 completed topics out of 813 total, **When** GETting `/api/v1/progress/summary`, **Then** the API returns `totalTopicsCompleted: 10`, `globalPercentage: 1.23%`, and exact breakdown per Phase (1–5) and Week (1–52).
  - **Given** unchecking a topic, **When** querying summary, **Then** all parent rollup percentages decrement accurately.
- **Technical Scope:** `backend/src/modules/progress/progressAggregation.ts`, MongoDB aggregation pipeline.
- **Architecture Reference:** `24-scheduling-progress-architecture.md`, `ADR-006`
- **Definition of Done:** Aggregation pipeline tested against multiple completion distributions, execution time `< 30ms`.

---

### PROG-003: Optimistic UI Checkbox Toggle with Rollback (<16ms)
- **User Story:** As a learner clicking a topic checkbox, I want the UI state to toggle instantly in `<16ms` with automatic background synchronization and error rollback so that the platform feels lightning fast.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 4
- **Dependencies:** DWKS-002, PROG-001
- **Acceptance Criteria:**
  - **Given** clicking an unchecked topic, **When** clicked, **Then** TanStack Query immediately updates the cache, updates progress bars, and fires the mutation in the background.
  - **Given** a network failure or `500 Server Error`, **When** the mutation fails, **Then** TanStack Query automatically reverts the checkbox state to unchecked and displays an accessible toast error.
- **Technical Scope:** `frontend/hooks/useTopicProgressMutation.ts`, TanStack Query optimistic mutation config.
- **Architecture Reference:** `17-frontend-architecture.md`
- **Definition of Done:** UI reacts in $<16\text{ms}$, error rollback verified with simulated network failures.

---

### PROG-004: Progress Telemetry Bars (Top-Bar, Sidebar, Global)
- **User Story:** As a learner, I want consistent progress telemetry bars in the global top bar, sidebar, and dashboard so that I always know my exact overall progress and current streak.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 4
- **Dependencies:** FND-004, PROG-002
- **Acceptance Criteria:**
  - **Given** any page in the learner portal, **When** rendered, **Then** the Top-Bar telemetry displays "Overall: X%", "Phase N: Y%", and the flame streak badge.
  - **Given** the sidebar, **When** expanded, **Then** each Phase and Week shows a mini radial or linear progress meter.
- **Technical Scope:** `frontend/components/TelemetryTopBar.tsx`, `SidebarProgressList.tsx`, `ProgressBar.tsx`.
- **Architecture / UX Reference:** `09-ux-information-architecture.md`, `13-ux-component-inventory.md`
- **Definition of Done:** Telemetry values match server progress summary, animated transitions on progress change.

---

## Epic 6: Assessment & Zero-Knowledge Quizzes (Sprint 5)

### QUIZ-001: Quiz Bank & Question Collection Schemas
- **User Story:** As a system architect, I want MongoDB schemas for `quiz_banks`, `quiz_questions`, and `quiz_attempts` with indexing on `canonicalId` and `phaseNumber` so that questions can be queried and attempts recorded with referential integrity.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 5
- **Dependencies:** FND-003, CURR-001
- **Acceptance Criteria:**
  - **Given** the database models, **When** seeded with all 9 quiz banks (Phases 1–5, Daily, Capstone exams), **Then** question documents store `questionText`, `options` array, `correctOptionIndex`, `explanation`, and `difficulty`.
  - **Given** `quiz_attempts`, **When** recording a submission, **Then** it stores `userId`, `quizBankId`, `score`, `passed` ($\ge 75\%$), `timeSpentSeconds`, and `answers` array.
- **Technical Scope:** `backend/src/modules/quizzes/quiz.model.ts`, `quiz_attempts.model.ts`, question seed scripts.
- **Architecture Reference:** `20-mongodb-data-model.md`, `25-quiz-security-architecture.md`, `ADR-007`
- **Definition of Done:** Models validated, compound indexes on (`userId`, `quizBankId`, `createdAt`) created.

---

### QUIZ-002: Zero-Knowledge Question Delivery API
- **User Story:** As a learner starting a quiz, I want to fetch questions via `/api/v1/quizzes/:id/start` with answer keys strictly stripped out so that the platform prevents client-side answer extraction and cheating.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 5
- **Dependencies:** QUIZ-001
- **Acceptance Criteria:**
  - **Given** a learner starting a quiz, **When** calling `/api/v1/quizzes/:id/start`, **Then** the server initializes an attempt record and returns question items containing ONLY `{ questionId, questionText, options: [strings] }`.
  - **Given** inspection of network payloads, **When** analyzed, **Then** `correctOptionIndex`, `explanation`, and internal scoring keys are **100% absent** from the HTTP response.
- **Technical Scope:** `backend/src/modules/quizzes/quiz.controller.ts`, `quiz.service.ts` projection stripping.
- **Architecture Reference:** `25-quiz-security-architecture.md`, `ADR-007`
- **Definition of Done:** Zero-knowledge security test passes; payload explicitly verified to contain no answer fields.

---

### QUIZ-003: Server-Side Quiz Grading, Scoring & Attempt API
- **User Story:** As a learner submitting my quiz, I want the backend to grade my submitted answers, calculate my accuracy score, log my attempt, and return detailed explanations via `/api/v1/quizzes/:id/submit`.
- **Priority:** P0 | **Release:** MVP | **Size:** L | **Sprint:** Sprint 5
- **Dependencies:** QUIZ-002
- **Acceptance Criteria:**
  - **Given** a submission payload `{ attemptId, answers: [{ questionId, selectedOptionIndex }] }`, **When** POSTed to `/api/v1/quizzes/:id/submit`, **Then** the server calculates the score against the database answer keys.
  - **Given** a score of $80\%$, **When** evaluated against the mastery threshold ($75\%$), **Then** `passed` is marked `true`, the high score for the user is updated, and the response includes detailed question explanations.
  - **Given** a submission submitted after timeout ($> 15\text{ mins}$ on a 10-min quiz), **When** received, **Then** the server rejects or penalizes the attempt.
- **Technical Scope:** `backend/src/modules/quizzes/quizGrading.service.ts`, `quiz_attempts` persistence.
- **Architecture Reference:** `25-quiz-security-architecture.md`, `ADR-007`
- **Definition of Done:** Unit tests for grading algorithm, boundary tests for 74% (Fail) vs 75% (Pass), high-score tracking integration test.

---

### QUIZ-004: Daily & Weekly Quiz Runner Modal & Timer UI
- **User Story:** As a learner, I want an interactive, timed Quiz Runner modal with clear question pagination, radio selection, and countdown timer so that I can test my knowledge without distractions.
- **Priority:** P0 | **Release:** MVP | **Size:** L | **Sprint:** Sprint 5
- **Dependencies:** FND-004, QUIZ-002, QUIZ-003
- **Acceptance Criteria:**
  - **Given** the Quiz Runner modal, **When** open, **Then** questions render one at a time with an option selector (A, B, C, D), a progress indicator ("Question 4 of 10"), and an active countdown timer.
  - **Given** the timer reaching `00:00`, **When** expired, **Then** the runner automatically submits all selected answers to the server.
- **Technical Scope:** `frontend/components/QuizRunnerModal.tsx`, `QuestionCard.tsx`, `QuizTimer.tsx`.
- **Architecture / UX Reference:** `10-ux-user-flows.md` (Flow 4), `12-ux-wireframes.md` (Screen I)
- **Definition of Done:** Modal traps keyboard focus, handles keyboard selection (`1`, `2`, `3`, `4` or `A`, `B`, `C`, `D`), auto-submits on timer expiry.

---

### QUIZ-005: Quiz Results View, Explanations & High-Score Ledger
- **User Story:** As a learner who finished a quiz, I want a comprehensive Results screen displaying my final score, Pass/Fail badge, breakdown of right/wrong answers with explanations, and a 1-click Retake option.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 5
- **Dependencies:** QUIZ-004
- **Acceptance Criteria:**
  - **Given** a completed quiz result, **When** viewed, **Then** the screen displays the percentage score (e.g. `90%`), a green "Mastered" badge if $\ge 75\%$ or red "Needs Review" if $< 75\%$, and explanations for every question.
  - **Given** clicking "Retake Quiz", **When** initiated, **Then** a new attempt starts with randomized question order.
- **Technical Scope:** `frontend/components/QuizResultsCard.tsx`, `ExplanationAccordion.tsx`.
- **Architecture / UX Reference:** `12-ux-wireframes.md` (Screen J)
- **Definition of Done:** Results UI responsive, explanations expand smoothly, score animations render smoothly.

---

### QUIZ-006: Phase Exam Gating Logic & High-Score Persistence
- **User Story:** As a learner completing a Phase, I want to take a comprehensive 30-question Phase Exam and have my highest score recorded permanently as a prerequisite for Phase completion.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 5
- **Dependencies:** QUIZ-003, QUIZ-005, PROG-002
- **Acceptance Criteria:**
  - **Given** Phase 1 completion, **When** the Phase 1 Exam is passed with $\ge 75\%$, **Then** the Phase 1 badge is unlocked and recorded in `users.badges`.
  - **Given** multiple retakes, **When** scored, **Then** `user_schedules.phaseHighScores` records the maximum score achieved across all attempts.
- **Technical Scope:** `backend/src/modules/quizzes/phaseExam.service.ts`, badge unlocking hook.
- **Architecture Reference:** `25-quiz-security-architecture.md`
- **Definition of Done:** High-score aggregation tests pass, badge unlock event verified.

---

## Epic 7: Markdown Notes, External Links & Habit Tracking (Sprint 6 & 7)

### NOTE-001: Day Notes Schema & Optimistic Lock Autosave API
- **User Story:** As a learner, I want my markdown notes autosaved to `/api/v1/notes/:dayCanonicalId` with an integer `version` field so that concurrent edits from multiple tabs never silently overwrite my thoughts.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 6
- **Dependencies:** AUTH-002, CURR-001
- **Acceptance Criteria:**
  - **Given** an authenticated user editing Day 5 notes, **When** PUTting to `/api/v1/notes/p1-w1-d5` with `{ markdownContent, version: 1 }`, **Then** the record in `day_notes` updates and increments to `version: 2`.
  - **Given** a stale write with `version: 1` when the server is already at `version: 2`, **When** submitted, **Then** the server rejects the write with `409 Conflict` and returns the latest server content.
- **Technical Scope:** `backend/src/modules/notes/notes.controller.ts`, `notes.service.ts`, `day_notes.model.ts`.
- **Architecture Reference:** `20-mongodb-data-model.md`, `ADR-002`
- **Definition of Done:** Optimistic locking tests verify 409 rejection on version mismatch, autosave persists clean content.

---

### NOTE-002: Markdown Notes Editor with Live Preview & Sanitize
- **User Story:** As a learner, I want an in-browser Markdown editor with live preview, syntax highlighting, and XSS sanitization so that I can take rich technical notes with code examples safely.
- **Priority:** P0 | **Release:** MVP | **Size:** L | **Sprint:** Sprint 6
- **Dependencies:** FND-004, NOTE-001
- **Acceptance Criteria:**
  - **Given** typing in the editor, **When** idle for 1.5 seconds, **Then** the client automatically triggers a background autosave and displays "Saved" with a subtle checkmark.
  - **Given** a markdown string containing malicious `<script>alert(1)</script>` or `javascript:` links, **When** rendered in preview, **Then** DOMPurify strips all dangerous elements and renders sanitized text.
- **Technical Scope:** `frontend/components/NotesEditor.tsx`, `MarkdownRenderer.tsx`, DOMPurify sanitization.
- **Architecture / UX Reference:** `12-ux-wireframes.md` (Screen H), `22-authentication-security-architecture.md`
- **Definition of Done:** XSS test vectors blocked, debounced autosave tested with simulated delay.

---

### NOTE-003: Custom External Resource Links API & UI Manager
- **User Story:** As a learner, I want to add my own custom reference links (ChatGPT logs, PDFs, GitHub gists) to any specific day via `/api/v1/links` so that my external study materials are organized in one place.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 6
- **Dependencies:** AUTH-002, CURR-001
- **Acceptance Criteria:**
  - **Given** a custom link submission, **When** POSTed to `/api/v1/links` with `{ dayCanonicalId, title, url, type }`, **Then** the backend validates that `url` starts with `http://` or `https://` and stores it in `external_links`.
  - **Given** an invalid or unsafe URL (e.g. `javascript:...`), **When** submitted, **Then** Zod validation rejects it with `400 Bad Request`.
- **Technical Scope:** `backend/src/modules/links/links.controller.ts`, `external_links.model.ts`, `frontend/components/CustomLinksManager.tsx`.
- **Architecture Reference:** `21-api-specification.md`, `22-authentication-security-architecture.md`
- **Definition of Done:** URL validation tests pass, CRUD operations for custom links verified on UI.

---

### NOTE-004: Centralized Learner Notes Explorer & Search Modal
- **User Story:** As a learner preparing for interviews, I want a centralized Notes Explorer (`/notes`) to browse, filter, and search across all my notes from all 52 weeks in one place.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 6
- **Dependencies:** NOTE-001, NOTE-002
- **Acceptance Criteria:**
  - **Given** the Notes page, **When** typing a search term (e.g. "CAP Theorem"), **Then** all days containing matching notes are filtered with highlighted snippets.
  - **Given** clicking a note item, **When** selected, **Then** the full note opens with a 1-click link to "Open in Workspace".
- **Technical Scope:** `frontend/app/(learner)/notes/page.tsx`, `NotesSearchList.tsx`, `NoteDetailView.tsx`.
- **Architecture / UX Reference:** `12-ux-wireframes.md` (Screen K)
- **Definition of Done:** Search filters notes in real-time, empty states and markdown formatting verified.

---

### STRK-001: User Activity Ledger & Daily Streak Engine
- **User Story:** As a learner, I want my daily study activities (completing topics, finishing quizzes, writing notes) recorded in an activity ledger so that my daily study streak is calculated accurately.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 7
- **Dependencies:** AUTH-002, PROG-001
- **Acceptance Criteria:**
  - **Given** a qualifying study action performed today, **When** recorded in `user_streaks.activityDates`, **Then** the streak calculation checks consecutive active days.
  - **Given** activity today and yesterday, **When** queried, **Then** `currentStreak` increments by 1 and `longestStreak` updates if a new personal record is set.
- **Technical Scope:** `backend/src/modules/streaks/streak.service.ts`, `user_streaks.model.ts`.
- **Architecture Reference:** `20-mongodb-data-model.md`
- **Definition of Done:** Streak calculation unit tests pass across time zones and day boundaries.

---

### STRK-002: 21-Day Habit Building Matrix Visualization UI
- **User Story:** As a learner building study consistency, I want a visual 21-Day Habit Matrix on my dashboard showing glowing checkmarks for my recent study days so that I stay motivated to complete the habit-building cycle.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 7
- **Dependencies:** FND-004, STRK-001
- **Acceptance Criteria:**
  - **Given** the dashboard habit matrix, **When** rendered, **Then** a 3x7 grid displays days 1 to 21 with active flame icons for completed days and an encouragement banner ("Day 14/21 — Habit forming! 🔥").
- **Technical Scope:** `frontend/components/HabitMatrix21.tsx`, dashboard widget.
- **Architecture / UX Reference:** `12-ux-wireframes.md` (Screen P)
- **Definition of Done:** Grid adapts to screen size, tooltips display exact activity dates on hover.

---

### STRK-003: Streak Freeze Logic (1 per Calendar Month)
- **User Story:** As a learner who missed a day due to an emergency, I want the system to automatically apply an available monthly Streak Freeze so that my hard-earned streak is protected once per month.
- **Priority:** P0 | **Release:** MVP | **Size:** S | **Sprint:** Sprint 7
- **Dependencies:** STRK-001
- **Acceptance Criteria:**
  - **Given** a learner with `freezeAvailable: true` who misses exactly one study day, **When** the streak engine evaluates yesterday's activity, **Then** a freeze is consumed, `freezeUsedAt` is set, and the streak is preserved.
  - **Given** a second missed day in the same month, **When** evaluated, **Then** the streak resets to 0 because no freeze is available.
- **Technical Scope:** `backend/src/modules/streaks/streakFreeze.service.ts`.
- **Architecture Reference:** `19-domain-module-boundaries.md`
- **Definition of Done:** Unit tests verify monthly freeze consumption and reset on 1st of each month.

---

### STRK-004: Built-in Pomodoro Study Timer (25/5 min + audio)
- **User Story:** As a learner in the workspace, I want a built-in Pomodoro timer (25 min Focus / 5 min Break) with unobtrusive audio chimes so that I can maintain deep focus without leaving the platform.
- **Priority:** P0 | **Release:** MVP | **Size:** S | **Sprint:** Sprint 7
- **Dependencies:** FND-004, DWKS-001
- **Acceptance Criteria:**
  - **Given** the Pomodoro widget in the top-bar/sidebar, **When** started, **Then** it counts down smoothly, shows the time in the browser tab title (`(24:59) Top 1% Roadmap`), and plays a gentle chime on completion.
- **Technical Scope:** `frontend/components/PomodoroTimer.tsx`, Web Audio API integration.
- **Architecture / UX Reference:** `13-ux-component-inventory.md`
- **Definition of Done:** Timer operates in background tab via `requestAnimationFrame` / `setInterval`, audio respects user mute preference.

---

## Epic 8: Legacy LocalStorage Data Migration (Sprint 8)

### MIGR-001: Legacy LocalStorage Schema Extraction Script
- **User Story:** As a returning learner who used the old single-file HTML roadmap, I want the web app to detect my legacy `localStorage` keys (`done`, `notes`, `qscores`, `startDate`, `chatLinks`, `pdfLinks`) and format them into an import payload.
- **Priority:** P0 | **Release:** MVP | **Size:** S | **Sprint:** Sprint 8
- **Dependencies:** FND-004, AUTH-007
- **Acceptance Criteria:**
  - **Given** a browser with existing legacy keys, **When** the learner logs into the new platform, **Then** a client-side utility extracts all legacy data into a structured JSON payload.
  - **Given** a legacy payload, **When** validated locally, **Then** a prominent banner prompts: "Legacy progress detected! Import to your cloud account".
- **Technical Scope:** `frontend/lib/migration/localStorageExtractor.ts`, `LegacyMigrationBanner.tsx`.
- **Architecture Reference:** `26-migration-architecture.md`
- **Definition of Done:** Extractor tested with real legacy `localStorage` dumps from `backend_roadmap_final_with_links.html`.

---

### MIGR-002: Date-to-Canonical-Slug Translation Pipeline
- **User Story:** As a backend migration service, I want a translation engine that maps legacy date-keyed progress (`done['2026-01-15_1']`) and array indices into modern canonical slugs (`p1-w2-d4-t1`) so that legacy data binds accurately to curriculum nodes.
- **Priority:** P0 | **Release:** MVP | **Size:** L | **Sprint:** Sprint 8
- **Dependencies:** CURR-001
- **Acceptance Criteria:**
  - **Given** legacy progress entries mapped by date offsets, **When** processed through the translation table, **Then** each item is resolved to its exact canonical ID (`p<N>-w<N>-d<N>-t<N>`).
  - **Given** unmappable or corrupted legacy items, **When** encountered, **Then** the pipeline records them in a `skippedItems` warning log without failing the overall migration.
- **Technical Scope:** `backend/src/modules/migration/slugTranslator.ts`, translation dictionary.
- **Architecture Reference:** `26-migration-architecture.md`
- **Definition of Done:** 100% translation coverage verified on legacy test fixtures.

---

### MIGR-003: Atomic Transactional LocalStorage Ingestion API
- **User Story:** As a learner, I want my legacy data ingested via `/api/v1/migration/import` inside an atomic MongoDB transaction so that my progress, notes, and quiz scores are imported without partial data corruption.
- **Priority:** P0 | **Release:** MVP | **Size:** L | **Sprint:** Sprint 8
- **Dependencies:** MIGR-002, PROG-001, NOTE-001, QUIZ-001
- **Acceptance Criteria:**
  - **Given** a valid migration payload POSTed to `/api/v1/migration/import`, **When** executed, **Then** progress records, notes, quiz scores, and start dates are written within a single `mongoose.startSession()` transaction.
  - **Given** any unexpected database failure during import, **When** thrown, **Then** the transaction aborts, no partial records remain, and the API returns `500 Import Error`.
  - **Given** calling import multiple times, **When** re-executed, **Then** the operation is completely **idempotent** and merges without duplicating records.
- **Technical Scope:** `backend/src/modules/migration/migration.controller.ts`, `migration.service.ts`.
- **Architecture Reference:** `26-migration-architecture.md`
- **Definition of Done:** Transaction rollback test verified, idempotency verified across 3 consecutive calls.

---

### MIGR-004: Migration Flow Modal with Progress & Rollback Safety
- **User Story:** As a learner migrating my data, I want a 3-step modal showing an import progress bar, summary of migrated items (e.g. "42 topics, 8 notes, 2 quiz scores"), and an explicit confirmation before clearing local storage.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 8
- **Dependencies:** MIGR-001, MIGR-003
- **Acceptance Criteria:**
  - **Given** the migration modal, **When** clicking "Start Cloud Import", **Then** the UI shows a progress loader and displays a breakdown summary upon completion.
  - **Given** the server response confirming `{ success: true }`, **When** confirmed, **Then** and ONLY then does the client clear the legacy `localStorage` keys or mark `legacy_migrated: true`.
- **Technical Scope:** `frontend/components/MigrationModal.tsx`, `MigrationSummaryCard.tsx`.
- **Architecture / UX Reference:** `10-ux-user-flows.md` (Flow 8), `12-ux-wireframes.md` (Screen Q)
- **Definition of Done:** LocalStorage preservation verified on simulated server error; cleanup verified on success.

---

## Epic 9: Admin Backoffice & Curriculum Authoring (Sprint 9)

### ADMN-001: Admin Role Guard & Backoffice Layout Scaffold
- **User Story:** As an administrator, I want a secure Admin Portal (`/admin`) with a dedicated sidebar (Curriculum Editor, Quiz Manager, Version Publisher, Audit Logs) protected by strict RBAC guards.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 9
- **Dependencies:** AUTH-005, FND-004
- **Acceptance Criteria:**
  - **Given** a non-admin learner attempting to visit `/admin`, **When** accessed, **Then** the server and client route guards immediately redirect to `/dashboard` with an unauthorized alert.
  - **Given** an authenticated admin, **When** accessing `/admin`, **Then** the backoffice layout renders with metrics and administrative tools.
- **Technical Scope:** `frontend/app/(admin)/layout.tsx`, `AdminSidebar.tsx`, `backend/src/middleware/rbacGuard.ts`.
- **Architecture / UX Reference:** `12-ux-wireframes.md` (Screen R)
- **Definition of Done:** Role check integration tests pass, unauthorized UI access blocked.

---

### ADMN-002: Curriculum Node Editor & Live JSON Tree Builder
- **User Story:** As an administrator, I want an interactive tree editor to add, edit, or reorder topics, subtopics, resource links, and skip directives without writing manual database queries.
- **Priority:** P0 | **Release:** MVP | **Size:** L | **Sprint:** Sprint 9
- **Dependencies:** ADMN-001, CURR-001
- **Acceptance Criteria:**
  - **Given** the Curriculum Editor, **When** modifying a topic's title or adding an external resource link, **Then** changes are staged in a draft curriculum version with validation on required fields.
- **Technical Scope:** `frontend/app/(admin)/admin/curriculum/page.tsx`, `CurriculumTreeEditor.tsx`, `NodeEditModal.tsx`.
- **Architecture Reference:** `19-domain-module-boundaries.md`
- **Definition of Done:** Form validation prevents empty slugs or invalid URLs, tree reflects edits live.

---

### ADMN-003: Curriculum Version Draft & Semantic Publish Engine
- **User Story:** As an administrator, I want to publish staged curriculum edits as a new Semantic Version (`v1.1.0`) via `/api/v1/admin/curriculum/publish` so that existing learners are never broken by destructive changes.
- **Priority:** P0 | **Release:** MVP | **Size:** L | **Sprint:** Sprint 9
- **Dependencies:** ADMN-002, CURR-001
- **Acceptance Criteria:**
  - **Given** staged edits in draft mode, **When** clicking "Publish Version v1.1.0", **Then** the backend validates tree integrity, sets status to `"published"`, invalidates in-memory caches, and logs the publish event in `admin_audit_logs`.
  - **Given** existing enrolled learners, **When** published, **Then** learners remain pinned to their active version unless they choose to upgrade.
- **Technical Scope:** `backend/src/modules/admin/curriculumAdmin.service.ts`, `backend/src/modules/curriculum/curriculumVersion.service.ts`.
- **Architecture Reference:** `23-curriculum-versioning-architecture.md`, `ADR-004`
- **Definition of Done:** Semantic version increment tests pass, cache invalidation verified.

---

### ADMN-004: Quiz Question Bank Authoring & Explanations Editor
- **User Story:** As an administrator, I want an authoring interface to create and edit quiz questions, multiple-choice options, correct answer selections, and detailed explanation text.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 9
- **Dependencies:** ADMN-001, QUIZ-001
- **Acceptance Criteria:**
  - **Given** the Quiz Manager, **When** adding a new question to Phase 2 Quiz Bank, **Then** the form enforces 4 distinct options, exactly 1 selected correct option index, and markdown explanation text.
  - **Given** saving a question, **When** persisted, **Then** it updates in `quiz_questions` with an updated audit timestamp.
- **Technical Scope:** `frontend/app/(admin)/admin/quizzes/page.tsx`, `QuestionFormModal.tsx`.
- **Architecture Reference:** `25-quiz-security-architecture.md`
- **Definition of Done:** Validation prevents saving questions without correct answers or options.

---

### ADMN-005: Admin Audit Logging Engine
- **User Story:** As a security auditor, I want all admin actions (curriculum edits, publishing, role changes) recorded in an immutable `admin_audit_logs` collection with IP address and before/after diffs.
- **Priority:** P0 | **Release:** MVP | **Size:** S | **Sprint:** Sprint 9
- **Dependencies:** ADMN-001
- **Acceptance Criteria:**
  - **Given** any admin mutation at `/api/v1/admin/*`, **When** executed, **Then** an audit entry is created storing `{ adminUserId, action, entityType, entityId, beforeState, afterState, ipAddress, timestamp }`.
- **Technical Scope:** `backend/src/modules/admin/auditLog.service.ts`, `admin_audit_logs.model.ts`.
- **Architecture Reference:** `20-mongodb-data-model.md`
- **Definition of Done:** Audit logging interceptor tested on all admin mutating routes.

---

## Epic 10: Capstone Projects & Analytics (Sprint 10)

### PROJ-001: Capstone Projects Schema & Specification Viewer
- **User Story:** As a learner reaching a major milestone, I want to view detailed architectural specifications, acceptance criteria, and system requirements for all 4 Capstone Projects (e.g., High-Throughput URL Shortener, Distributed Message Broker) in my workspace.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 10
- **Dependencies:** FND-004, CURR-001
- **Acceptance Criteria:**
  - **Given** the Projects tab (`/projects`), **When** viewed, **Then** all 4 Capstone specifications display with architecture diagrams, required tech stacks, scalability requirements (e.g. 10k RPS), and benchmark milestones.
- **Technical Scope:** `frontend/app/(learner)/projects/page.tsx`, `ProjectSpecCard.tsx`, `projects.model.ts`.
- **Architecture / UX Reference:** `12-ux-wireframes.md` (Screen M)
- **Definition of Done:** Specifications render accurately with syntax-highlighted requirements.

---

### ANLT-001: Telemetry Event Ingestion Pipeline & Event Ledger
- **User Story:** As a platform architect, I want an asynchronous telemetry ingestion endpoint `/api/v1/analytics/event` to record learner milestones (`TOPIC_COMPLETED`, `QUIZ_COMPLETED`, `COURSE_PAUSED`) without blocking UI operations.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 10
- **Dependencies:** AUTH-002
- **Acceptance Criteria:**
  - **Given** a client telemetry event POSTed to `/api/v1/analytics/event`, **When** received, **Then** the server acknowledges with `202 Accepted` in $<15\text{ms}$ and writes the event asynchronously to `analytics_events`.
- **Technical Scope:** `backend/src/modules/analytics/analytics.controller.ts`, `analytics_events.model.ts`.
- **Architecture Reference:** `28-analytics-observability.md`
- **Definition of Done:** Asynchronous ingestion load tested to 500 req/sec without latency spikes.

---

### ANLT-002: Learner Velocity Dashboard & Time-to-Complete Stats
- **User Story:** As a learner on my dashboard, I want a Personal Velocity Widget showing my weekly completion rate, projected graduation date, and estimated study hours invested so that I can track my pacing.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 10
- **Dependencies:** PROG-002, SCHD-001
- **Acceptance Criteria:**
  - **Given** the learner dashboard, **When** rendered, **Then** the Velocity Card displays topics completed this week vs previous week, current pace (e.g. "2.4 topics/day"), and projected completion date.
- **Technical Scope:** `frontend/components/VelocityCard.tsx`, dashboard analytics hook.
- **Architecture / UX Reference:** `12-ux-wireframes.md` (Screen N)
- **Definition of Done:** Math formulas verified against dynamic schedule anchor.

---

## Epic 11: Production Hardening, Testing & DevOps (Sprint 11)

### HARD-001: Multi-Stage Production Dockerfiles & Compose
- **User Story:** As a DevOps engineer, I want optimized, multi-stage, distroless Dockerfiles for `frontend` and `backend` and a complete `docker-compose.yml` for local development and CI so that deployments are reproducible and lightweight.
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 11
- **Dependencies:** FND-001, FND-002, FND-004
- **Acceptance Criteria:**
  - **Given** `docker compose up --build`, **When** executed, **Then** frontend, backend, and MongoDB containers spin up with healthy status and communicate over the internal bridge network.
  - **Given** the production Docker image, **When** built, **Then** image sizes are optimized (< 150MB backend, < 250MB frontend) and run as non-root users.
- **Technical Scope:** `docker/Dockerfile.backend`, `docker/Dockerfile.frontend`, `docker-compose.yml`, `docker-compose.dev.yml`.
- **Architecture Reference:** `29-deployment-and-infrastructure.md`
- **Definition of Done:** Docker containers build in CI without cache errors, healthchecks pass.

---

### HARD-002: End-to-End Test Suite for 8 Critical Journeys
- **User Story:** As a QA lead, I want comprehensive Playwright E2E test suites covering all 8 critical user journeys so that regression testing is 100% automated before production release.
- **Priority:** P0 | **Release:** MVP | **Size:** L | **Sprint:** Sprint 11
- **Dependencies:** All previous MVP stories
- **Acceptance Criteria:**
  - **Given** the Playwright test suite, **When** executed, **Then** automated tests pass with 0 failures across:
    1. New User Registration & Onboarding
    2. User Login & Token Rotation
    3. Topic Checkbox Toggle & Rollup Verification
    4. Quiz Attempt, Timer Expiry & Score Submission
    5. Notes Autosave & Optimistic Lock Conflict Handling
    6. Course Pause, Resume & Reschedule
    7. Legacy LocalStorage Import Pipeline
    8. Admin Curriculum Edit & Version Publishing
- **Technical Scope:** `tests/e2e/*.spec.ts`, Playwright configuration.
- **Architecture Reference:** `30-testing-architecture.md`
- **Definition of Done:** All 8 critical journey specs pass in headless CI pipeline in under 5 minutes.

---

### HARD-003: Performance Tuning, Index Audits & Security Scan
- **User Story:** As a security and performance auditor, I want MongoDB index audits, OWASP ZAP security scans, and Lighthouse accessibility audits executed so that the platform meets all NFR targets (P95 < 150ms, LCP < 1.2s, WCAG AA).
- **Priority:** P0 | **Release:** MVP | **Size:** M | **Sprint:** Sprint 11
- **Dependencies:** HARD-001, HARD-002
- **Acceptance Criteria:**
  - **Given** database queries, **When** audited with `explain('executionStats')`, **Then** all high-frequency queries utilize compound indexes with 0 full collection scans (`COLLSCAN`).
  - **Given** Lighthouse audit on core pages, **When** run, **Then** Accessibility score is $\ge 95$ and Performance score is $\ge 90$.
- **Technical Scope:** MongoDB index definitions, security headers (Helmet), rate limiter configuration.
- **Architecture Reference:** `31-threat-model.md`, `04-analytics-nfr-and-risks.md`
- **Definition of Done:** Zero high-severity vulnerabilities in `npm audit` / Snyk, index coverage report clean.
