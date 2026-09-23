# Sprint 3 — Adaptive Scheduling & Interactive Roadmap View Completion Report

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 6 — BMAD Development  
**Sprint:** Sprint 3 (Adaptive Scheduling & Interactive Roadmap View)  
**Role:** BMAD Developer  
**Date:** September 22, 2026  
**Status:** **COMPLETE**

---

## 1. Executive Summary

Sprint 3 delivers the dynamic, anchor-based schedule calculation engine and the 52-week interactive career roadmap view for the Top 1% Backend Roadmap Platform.

All 7 Sprint 3 user stories (`SCHD-001`, `SCHD-002`, `SCHD-003`, `SCHD-004`, `CURR-003`, `CURR-004`, `CURR-005`) have been fully implemented, tested, and verified with zero architectural drift, preserving canonical curriculum immutability while providing personalized calendar projections and course lifecycle controls (pause, resume, reschedule).

---

## 2. Story Registry & Status

| Story ID | Epic | Title | Status | Primary Layer |
| :--- | :--- | :--- | :--- | :--- |
| **SCHD-001** | Scheduling | Dynamic Calendar Date Calculation Engine | **COMPLETE** | Backend Engine |
| **SCHD-002** | Scheduling | Reschedule Schedule API & Date Shift Calculation | **COMPLETE** | Backend API |
| **SCHD-003** | Scheduling | Pause & Resume Course Lifecycle API | **COMPLETE** | Backend API |
| **SCHD-004** | Scheduling | Schedule Management Modal & Date Projection UI | **COMPLETE** | Frontend UI |
| **CURR-003** | Curriculum | Interactive Roadmap View & Phase/Week Accordion | **COMPLETE** | Frontend UI |
| **CURR-004** | Curriculum | Curriculum Search & Phase/Week Deep-Link Engine | **COMPLETE** | Frontend Search |
| **CURR-005** | Curriculum | Resource Links Catalog & Skip Directives Renderer | **COMPLETE** | Frontend UI |

---

## 3. Scheduling Architecture & Projection Formula

### Core Anchor Model
The platform completely avoids storing 364 redundant calendar dates per user. Instead, the database holds only the learner's **Schedule Anchor** (`startDate`, `pausedAt`, `isPaused`, `totalPauseDays`).

```text
                     O(1) DATE PROJECTION FORMULA
For any canonical day with global sequential offset n (1 <= n <= 147):
    ProjectedDate(n) = startDate + (n - 1) days (Strict UTC)
```

### Pause / Resume Forward-Shift Algorithm
When a learner pauses:
- `isPaused = true`, `pausedAt = todayStr()`.

When a learner resumes $N$ days later:
- `pauseDeltaDays = floor((today - pausedAt) / 86400000)`.
- `newStartDate = startDate + pauseDeltaDays`.
- `totalPauseDays += pauseDeltaDays`.
- `projectedCompletionDate = newStartDate + 363 days`.
- `isPaused = false`, `pausedAt = null`.

### Learner Ownership & Timezone Strategy
- Date calculations operate on strict UTC year, month, and day components, eliminating browser/server timezone offset bugs.
- All schedule operations enforce the authenticated user session context (`req.user.userId`). Cross-learner schedule tampering is strictly blocked.

---

## 4. Interactive Roadmap Engine & APIs

### Schedule & Roadmap Endpoints (`/api/v1/schedule`)
- `GET /api/v1/schedule/me`: Returns active schedule details, pause status, days remaining, and current day canonical ID.
- `POST /api/v1/schedule/reschedule`: Validates `newStartDate` (within 1 year), shifts start date anchor, updates graduation target date.
- `POST /api/v1/schedule/pause`: Freezes active journey.
- `POST /api/v1/schedule/resume`: Unpauses course and shifts schedule anchor forward by exact pause delta.
- `GET /api/v1/schedule/roadmap`: Computes dynamic projected calendar dates across all 5 phases, 21 modules, and 147 canonical days specifically for the authenticated learner.

---

## 5. Frontend Interactive Roadmap Experience (`/curriculum`)

- **Interactive 52-Week Roadmap View (`/curriculum`):**
  - Displays dynamic schedule status banner with live target graduation date, remaining days, and pause state.
  - Phase cards with color accents, total modules/days/topics, and salary milestone badges (`3–8 LPA` to `45–120+ LPA`).
  - Collapsible Week/Module accordions with 7-day study pills showing dynamic calendar dates (`Sep 22, 2026`), rest day badges, and "TODAY" highlight.
  - Right-hand detail drawer rendering all subtopics, skip directives, and categorized resource links (YouTube 📹, Articles 📄, GitHub 🐙, Docs 📚).
- **Schedule Management Modal (`ScheduleModal.tsx`):**
  - Allows learners to pause/resume course and reschedule start dates with instant feedback.
- **Command Palette Search Engine (`CommandPalette.tsx` — `Cmd+K` / `Ctrl+K`):**
  - Instant fuzzy search across all 813 topics, concepts, and canonical IDs with keyboard navigation (`↑`/`↓`/`Enter`) and deep-linking.

---

## 6. Verification & Automated Test Results

```text
==================================================
              TEST SUITE SUMMARY
==================================================
Backend Unit Tests:          21/21 PASS
  - AppError Unit:            7/7  PASS
  - Environment Unit:         1/1  PASS
  - JWT Tokens Unit:          3/3  PASS
  - Crypto/Bcrypt Unit:       3/3  PASS
  - Curriculum Seed Unit:     4/4  PASS
  - Schedule Utils Unit:      3/3  PASS (Sprint 3)
Backend Integration Tests:   37/37 PASS
  - Health Probes:            4/4  PASS
  - Authentication API:      10/10 PASS (Sprint 1 Regression)
  - Curriculum Read API:      6/6  PASS (Sprint 2 Regression)
  - Onboarding Engine API:    7/7  PASS (Sprint 2 Regression)
  - Schedule & Roadmap API:   7/7  PASS (Sprint 3)
  - Curriculum Seeding:       3/3  PASS
Frontend Unit Tests:          7/7  PASS
  - Auth Store:               2/2  PASS
  - Onboarding Store:         2/2  PASS
  - Schedule Math Projection: 2/2  PASS (Sprint 3)
  - Baseline Setup:           1/1  PASS
--------------------------------------------------
TOTAL AUTOMATED TESTS:       66/66 PASS (100%)
==================================================
```

### TypeScript & Monorepo Build
- `npm run typecheck`: **PASS** (0 errors across `@top1/shared`, `@top1/backend`, `@top1/frontend`).
- `npm run build`: **PASS** (Next.js 15 production build compiled successfully with `/curriculum`, `/dashboard`, `/onboarding`, `/login`, `/register`).

---

## 7. Security & Secrets Verification

- `MONGODB_URI` is strictly backend-only and validated via Zod.
- `.env.example` contains only mock placeholders.
- No database credentials, JWT secrets, or tokens are logged or committed.
- Schedule mutations require authenticated session context and CSRF tokens.

---

## 8. Sprint Boundary & Scope Discipline

Sprint 3 strictly maintained boundaries:
- ❌ NO topic progress toggles or completion persistence (Sprint 4).
- ❌ NO daily learning workspace execution tools (Sprint 4).
- ❌ NO quiz engines or grading endpoints (Sprint 5).
- ❌ NO markdown notes editor (Sprint 6).
- ❌ NO streaks, Pomodoro timers, or habit matrices (Sprint 7).
- ❌ NO Redis or BullMQ infrastructure introduced.

---

## 9. Sprint 4 Readiness

- **Status:** **READY FOR SPRINT 4**
- **Foundation Available for Sprint 4:**
  - Dynamic interactive roadmap view operational at `/curriculum`.
  - Schedule anchor and runtime date projection engine fully verified.
  - Ready for Daily Learning Workspace (`/workspace`) and atomic topic progress ledger in Sprint 4.
