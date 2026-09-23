# 37. Sprint Implementation Plan

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 5 — Scrum Master Planning  
**Role:** BMAD Scrum Master  
**Status:** Approved Sprint Roadmap  

---

## Sprint Overview (12 Sprints: Sprint 0 to Sprint 11)

```text
Sprint 0  ──► Monorepo, Express Bootstrap, Next.js Setup & Testing Foundations
Sprint 1  ──► Authentication, Dual-Token Session Cookies & Google OAuth
Sprint 2  ──► Canonical Curriculum Seeding & Learner Onboarding
Sprint 3  ──► Dynamic Schedule Projection & Interactive Roadmap View
Sprint 4  ──► Daily Learning Workspace & Optimistic Progress Ledger
Sprint 5  ──► Zero-Knowledge Quizzes, Timed Runner & Grading Pipeline
Sprint 6  ──► Markdown Notes Autosave & Custom Reference Links
Sprint 7  ──► 21-Day Habit Matrix, Streaks, Pomodoro & Freeze Logic
Sprint 8  ──► Legacy LocalStorage Migration & Transactional Ingestion
Sprint 9  ──► Admin Backoffice, Curriculum Editor & Version Publisher
Sprint 10 ──► Capstone Project Specs & Learner Velocity Analytics
Sprint 11 ──► Production Hardening, 8 E2E Test Journeys & Security Audit
```

---

## Detailed Sprint Specifications

### Sprint 0: Foundation, Architecture Scaffolding & Testing
* **Sprint Goal:** Establish the TypeScript monorepo workspace, Express backend boilerplate, Next.js dark-themed shell, MongoDB connection, structured logging, and automated testing harness.
* **Stories:** `FND-001`, `FND-002`, `FND-003`, `FND-004`, `FND-005`, `FND-006`, `FND-007`.
* **Dependencies:** Clean repository workspace.
* **Expected Deliverable:** Compiling monorepo where `npm run dev` boots both frontend and backend; MongoDB connects with pooling; tests execute in Vitest and Supertest.
* **Demo Criteria:**
  1. Boot Express server; verify `/health/live` returns `{ status: "ok", uptime: ... }` with `x-request-id`.
  2. Boot Next.js; verify dark-mode homepage renders with JetBrains Mono font tokens.
  3. Run `npm test`; verify passing unit tests in backend and frontend.
* **Exit Criteria:** Zero TypeScript compilation errors, strict mode enabled, base logger and error handler active.
* **Risks:** Node version mismatch (requires Node v20.12+).
* **Deferred Work:** Feature APIs, auth guards, real domain schemas.

---

### Sprint 1: Authentication, Identity & Session Security
* **Sprint Goal:** Deliver end-to-end user registration, login with HttpOnly dual-token cookie rotation, Google OAuth, password reset, and CSRF protection.
* **Stories:** `AUTH-001`, `AUTH-002`, `AUTH-003`, `AUTH-004`, `AUTH-005`, `AUTH-006`, `AUTH-007`.
* **Dependencies:** Sprint 0 completion (`FND-001` through `FND-007`).
* **Expected Deliverable:** Secure authentication portal with registration, login, token refresh interceptor, and RBAC route guards.
* **Demo Criteria:**
  1. Register a new user via UI; verify hashed password in `user_credentials`.
  2. Log in; inspect browser cookies for `HttpOnly`, `Secure`, `SameSite=Lax` tokens.
  3. Trigger token refresh via interceptor; verify old token invalidation and family rotation.
  4. Attempt accessing `/api/v1/admin` with learner account; verify `403 Forbidden`.
* **Exit Criteria:** Auth integration tests passing, token reuse detection verified, CSRF protection active on mutating endpoints.
* **Risks:** Cookie domain configuration across local development (`localhost:3000` to `localhost:5000`).
* **Deferred Work:** Multi-factor authentication, biometric auth.

---

### Sprint 2: Canonical Curriculum Seeding & Onboarding Engine
* **Sprint Goal:** Seed the complete 52-week canonical curriculum into MongoDB and deliver the interactive 3-step learner onboarding wizard.
* **Stories:** `CURR-001`, `CURR-002`, `ONBD-001`, `ONBD-002`, `ONBD-003`.
* **Dependencies:** Sprint 1 completion (`AUTH-001` through `AUTH-007`).
* **Expected Deliverable:** Database containing all 5 phases, 52 weeks, 364 days, and 813 topics keyed by canonical IDs (`p1-w1-d1-t1`); functional Onboarding flow.
* **Demo Criteria:**
  1. Query `/api/v1/curriculum`; verify complete JSON tree returned from in-memory cache in $<30\text{ms}$.
  2. Log in as a new user; verify automatic redirect to `/onboarding`.
  3. Select start date in wizard; verify schedule anchor created in `user_schedules` and redirect to `/dashboard`.
* **Exit Criteria:** 100% of curriculum nodes seeded and verified, onboarding route guards enforce schedule creation.
* **Risks:** Seed data inconsistencies (must match 813 topics from discovery inventory).
* **Deferred Work:** Admin curriculum editor (scheduled for Sprint 9).

---

### Sprint 3: Adaptive Scheduling & Interactive Roadmap View
* **Sprint Goal:** Implement dynamic calendar date projection, course pause/resume/reschedule APIs, and the collapsible 52-week career roadmap UI with Command Palette search.
* **Stories:** `SCHD-001`, `SCHD-002`, `SCHD-003`, `SCHD-004`, `CURR-003`, `CURR-004`, `CURR-005`.
* **Dependencies:** Sprint 2 completion (`CURR-001`, `ONBD-001`).
* **Expected Deliverable:** Interactive Roadmap page (`/curriculum`) with phase cards, week accordions, search palette (`Cmd+K`), and Schedule Management modal.
* **Demo Criteria:**
  1. Open `/curriculum`; expand Phase 1 and Week 1; verify salary milestones and day pills.
  2. Press `Cmd+K`; search "Distributed Transactions"; verify instant deep-link navigation.
  3. Open Schedule modal; click "Pause Course"; verify schedule freeze and resume date shift calculations.
* **Exit Criteria:** Dynamic calendar calculation verified across leap years and pause intervals without storing redundant dates.
* **Risks:** Date timezone boundaries during schedule projection.
* **Deferred Work:** Google Calendar / iCal sync.

---

### Sprint 4: Daily Learning Workspace & Optimistic Progress Ledger
* **Sprint Goal:** Build the Daily Learning Workspace (`/workspace`), atomic topic progress ledger, rollups aggregation pipeline, and $<16\text{ms}$ optimistic UI toggles.
* **Stories:** `DWKS-001`, `DWKS-002`, `DWKS-003`, `PROG-001`, `PROG-002`, `PROG-003`, `PROG-004`.
* **Dependencies:** Sprint 3 completion (`CURR-003`, `SCHD-001`).
* **Expected Deliverable:** Full Daily Workspace with checklist, code blocks, day navigation shortcuts (`[` / `]`), and live telemetry bars.
* **Demo Criteria:**
  1. Navigate to `/workspace?day=p1-w1-d1`; toggle a topic checkbox; verify instant UI checkmark ($<16\text{ms}$) and background database upsert.
  2. Complete all topics for Day 1; verify Day Completed celebratory banner and top-bar telemetry increment.
  3. Disconnect network and click a topic; verify graceful optimistic rollback and toast error notification.
* **Exit Criteria:** Concurrency-safe progress toggle passing unit/integration tests, zero rollup percentage drift.
* **Risks:** Client-side cache synchronization on rapid multi-topic clicking.
* **Deferred Work:** Offline service worker sync (V1).

---

### Sprint 5: Zero-Knowledge Quizzes, Timed Runner & Scoring
* **Sprint Goal:** Implement zero-knowledge quiz question delivery, timed modal runner, server-side grading, and Phase Exam gating.
* **Stories:** `QUIZ-001`, `QUIZ-002`, `QUIZ-003`, `QUIZ-004`, `QUIZ-005`, `QUIZ-006`.
* **Dependencies:** Sprint 4 completion (`PROG-001`, `DWKS-002`).
* **Expected Deliverable:** Secure quiz evaluation pipeline and interactive Quiz Runner modal with countdown timer and score breakdown.
* **Demo Criteria:**
  1. Start Daily Quiz 1; inspect network tab to prove `correctOptionIndex` and `explanation` are **100% absent** from the payload.
  2. Submit answers; verify server-side score calculation and immediate return of explanations.
  3. Test boundary score: submit 74% (verify Fail badge) and 75% (verify Pass badge + high score update).
* **Exit Criteria:** Zero-knowledge security test passes, attempt timeout enforcement verified.
* **Risks:** Cheating via client clock tampering (mitigated by server-side `startedAt` vs `submittedAt` checks).
* **Deferred Work:** CSV question bulk upload (V1).

---

### Sprint 6: Markdown Notes, Sanitization & Reference Links
* **Sprint Goal:** Deliver debounced notes autosave with optimistic locking (`409 Conflict`), safe Markdown rendering, custom day links, and Notes Explorer.
* **Stories:** `NOTE-001`, `NOTE-002`, `NOTE-003`, `NOTE-004`.
* **Dependencies:** Sprint 4 completion (`DWKS-001`, `PROG-001`).
* **Expected Deliverable:** Notes editor inside the Daily Workspace with live preview, XSS protection, and a global Notes Explorer at `/notes`.
* **Demo Criteria:**
  1. Type markdown in Day 1 notes; observe debounced auto-save ("Saved ✅").
  2. Paste malicious `<script>` snippet in markdown; verify DOMPurify renders safe sanitized preview.
  3. Open two browser tabs on the same day; edit notes in Tab 1, then Tab 2; verify Tab 2 receives `409 Conflict` and prevents silent overwrite.
  4. Open `/notes`; search for key terms and click deep-link to workspace.
* **Exit Criteria:** XSS attack vectors blocked, optimistic locking conflict test verified.
* **Risks:** Markdown rendering performance on very large notes.
* **Deferred Work:** PDF / Markdown export (V2).

---

### Sprint 7: Streaks, 21-Day Habit Matrix & Pomodoro Focus
* **Sprint Goal:** Implement daily activity ledger, streak calculation, 21-Day Habit Matrix visualizer, monthly streak freeze, and built-in Pomodoro timer.
* **Stories:** `STRK-001`, `STRK-002`, `STRK-003`, `STRK-004`.
* **Dependencies:** Sprint 4 completion (`PROG-001`).
* **Expected Deliverable:** Motivational dashboard telemetry with 21-day habit matrix, top-bar flame badge, automatic streak freeze, and Pomodoro timer.
* **Demo Criteria:**
  1. Complete study actions; verify daily streak increments and habit matrix checkmark lights up.
  2. Simulate a missed study day; verify automatic consumption of monthly streak freeze and streak preservation.
  3. Start Pomodoro timer; verify tab title countdown `(24:59)` and completion audio chime.
* **Exit Criteria:** Streak calculation tested across timezone UTC boundaries, monthly freeze reset verified.
* **Risks:** Timezone edge cases on midnight rollups.
* **Deferred Work:** Public streak leaderboards (V2).

---

### Sprint 8: Legacy LocalStorage Data Migration
* **Sprint Goal:** Deliver the automated client-side detection, date-to-canonical ID translation, and atomic MongoDB transactional ingestion for legacy roadmap users.
* **Stories:** `MIGR-001`, `MIGR-002`, `MIGR-003`, `MIGR-004`.
* **Dependencies:** Sprint 4, 5, 6 completion (`PROG-001`, `QUIZ-001`, `NOTE-001`).
* **Expected Deliverable:** Migration modal that detects legacy `localStorage` keys, executes atomic cloud import, and safely preserves local data until verified.
* **Demo Criteria:**
  1. Populate browser `localStorage` with legacy keys (`done`, `notes`, `qscores`, `startDate`); refresh app; verify Migration Banner appears.
  2. Click "Start Cloud Import"; verify translation of dates to slugs (`p1-w1-d1-t1`) and progress bar UI.
  3. Verify imported checkmarks, notes, and quiz high scores appear instantly in the cloud workspace.
  4. Simulate server failure during import; verify transaction aborts with 0 partial writes and local storage remains untouched.
* **Exit Criteria:** 100% translation accuracy verified on legacy test data, idempotency verified.
* **Risks:** Corrupted or malformed user data in legacy `localStorage`.
* **Deferred Work:** File-based JSON backup export.

---

### Sprint 9: Admin Backoffice, Curriculum Editor & Version Publisher
* **Sprint Goal:** Build the Admin Portal (`/admin`) for curriculum authoring, quiz bank management, semantic version publishing (`v1.1.0`), and audit logging.
* **Stories:** `ADMN-001`, `ADMN-002`, `ADMN-003`, `ADMN-004`, `ADMN-005`.
* **Dependencies:** Sprint 1, 2, 5 completion (`AUTH-005`, `CURR-001`, `QUIZ-001`).
* **Expected Deliverable:** Secure admin dashboard for staging curriculum edits, publishing semantic versions without breaking active learners, and managing questions.
* **Demo Criteria:**
  1. Log in as admin; navigate to `/admin/curriculum`; edit topic description and stage changes in draft version.
  2. Publish Version `v1.1.0`; verify in-memory cache invalidation and immutable audit log entry in `admin_audit_logs`.
  3. Verify enrolled learners remain pinned to their active version.
* **Exit Criteria:** RBAC strictly blocks non-admin access, audit logs record all admin mutations.
* **Risks:** Stale cache reads after publishing (mitigated by explicit cache invalidation hook).
* **Deferred Work:** Multi-tenant admin roles.

---

### Sprint 10: Capstone Projects & Personal Velocity Analytics
* **Sprint Goal:** Deliver Capstone Project specifications, asynchronous telemetry ingestion pipeline, and Personal Velocity dashboard metrics.
* **Stories:** `PROJ-001`, `ANLT-001`, `ANLT-002`.
* **Dependencies:** Sprint 3, 4 completion (`CURR-001`, `PROG-002`, `SCHD-001`).
* **Expected Deliverable:** Capstone Project Specs page (`/projects`), `/api/v1/analytics/event` ingestion pipeline, and Learner Velocity dashboard widget.
* **Demo Criteria:**
  1. Navigate to `/projects`; inspect architecture diagrams and performance benchmarks for all 4 Capstones.
  2. Trigger user milestones; verify telemetry events ingested with `202 Accepted` in $<15\text{ms}$.
  3. View dashboard; verify Personal Velocity calculation matches topic completion rate and schedule projection.
* **Exit Criteria:** Telemetry pipeline load tested, velocity math accurate.
* **Risks:** Heavy aggregation overhead (mitigated by pre-aggregated rollups).
* **Deferred Work:** V1 GitHub PR automated repo submission (scheduled for V1).

---

### Sprint 11: Production Hardening, E2E Testing & Launch Gate
* **Sprint Goal:** Finalize multi-stage Docker containers, execute Playwright E2E suite for 8 critical user journeys, perform index audits, and complete security validation.
* **Stories:** `HARD-001`, `HARD-002`, `HARD-003`.
* **Dependencies:** All previous MVP stories (Sprints 0 through 10).
* **Expected Deliverable:** Production-ready containerized platform with 100% automated test pass, index coverage, and clean security audit.
* **Demo Criteria:**
  1. Execute `docker compose -f docker-compose.prod.yml up`; verify production containers initialize in $<30\text{s}$.
  2. Run `npm run test:e2e`; verify all 8 critical user journeys pass in Playwright with 0 failures.
  3. Run Lighthouse and security audits; verify $\ge 95$ Accessibility, $\ge 90$ Performance, and 0 critical security alerts.
* **Exit Criteria:** All 8 critical E2E tests pass, P95 response time $< 150\text{ms}$, WCAG AA compliance verified, launch approval granted.
* **Risks:** Flaky E2E tests due to network timing (mitigated by deterministic test assertions).
* **Deferred Work:** Multi-region deployment.
