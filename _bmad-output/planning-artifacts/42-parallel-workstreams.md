# 42. Parallel Workstreams & Work Coordination

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 5 — Scrum Master Planning  
**Role:** BMAD Scrum Master  
**Status:** Approved Parallel Workstreams  

---

## 1. Workstream Strategy & Isolation Principles

To enable efficient development cycles without merge conflicts or architectural drift, stories are divided into **4 Decoupled Workstreams** bounded by strict contracts in the `shared/` package:

```text
               ┌────────────────────────────────────────────────────────┐
               │         Workstream A: Core Backend & Data Models       │
               └───────────────────────────┬────────────────────────────┘
                                           │ API Contracts (shared/)
┌──────────────────────────────────────────┴────────────────────────────┐
│                    Workstream B: Frontend UI & Client State           │
└──────────────────────────────────────────┬────────────────────────────┘
                                           │
┌──────────────────────────────────────────┴────────────────────────────┐
│                  Workstream C: Feature Modules (Quizzes, Notes, MIGR) │
└──────────────────────────────────────────┬────────────────────────────┘
                                           │
┌──────────────────────────────────────────┴────────────────────────────┐
│              Workstream D: DevOps, Testing & Security Hardening       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 2. Workstream Mapping & Story Allocation

### Workstream A: Backend Infrastructure & Data Domain (Engine Focus)
- **Primary Package:** `backend/src/`
- **Ownership:** Database connections, Mongoose models, Express middleware, authentication pipelines, schedule calculation arithmetic, aggregation rollups, and audit logging.
- **Stories:** `FND-002`, `FND-003`, `FND-005`, `AUTH-001`, `AUTH-002`, `AUTH-003`, `AUTH-004`, `AUTH-005`, `ONBD-001`, `CURR-001`, `CURR-002`, `SCHD-001`, `SCHD-002`, `SCHD-003`, `PROG-001`, `PROG-002`, `QUIZ-001`, `QUIZ-002`, `QUIZ-003`, `NOTE-001`, `STRK-001`, `STRK-003`, `MIGR-002`, `MIGR-003`, `ADMN-003`, `ADMN-005`, `ANLT-001`.

### Workstream B: Frontend UI, UX & Client Islands (Design Focus)
- **Primary Package:** `frontend/app/`, `frontend/components/`, `frontend/stores/`
- **Ownership:** Next.js App Router layouts, Tailwind design system token bindings, accessible forms, Command Palette (`Cmd+K`), roadmap accordions, Daily Workspace shell, and habit visualizers.
- **Stories:** `FND-004`, `AUTH-006`, `AUTH-007`, `ONBD-002`, `ONBD-003`, `CURR-003`, `CURR-004`, `CURR-005`, `SCHD-004`, `DWKS-001`, `DWKS-002`, `DWKS-003`, `PROG-003`, `PROG-004`, `QUIZ-004`, `QUIZ-005`, `NOTE-002`, `NOTE-004`, `STRK-002`, `STRK-004`, `MIGR-001`, `MIGR-004`, `ADMN-001`, `ADMN-002`, `ADMN-004`, `PROJ-001`, `ANLT-002`.

### Workstream C: Cross-Cutting Feature Modules (Vertical Slices)
- **Ownership:** End-to-end vertical slice integration for complex multi-tier features (e.g. LocalStorage migration, zero-knowledge quiz grading, markdown notes autosave).
- **Stories:** `NOTE-003`, `QUIZ-006`, `MIGR-003`/`MIGR-004` integration, `ADMN-001..005` admin portal.

### Workstream D: Testing, Quality Assurance & DevOps (Verification Focus)
- **Primary Package:** `docker/`, `tests/e2e/`, Root CI configs.
- **Ownership:** Monorepo tooling, Vitest / Supertest harnesses, Playwright E2E suites for 8 critical user journeys, multi-stage Docker builds, Lighthouse audits, and security vulnerability scans.
- **Stories:** `FND-001`, `FND-006`, `FND-007`, `HARD-001`, `HARD-002`, `HARD-003`.

---

## 3. Safe Parallel Execution Matrix per Sprint

| Sprint | Workstream A (Backend) | Workstream B (Frontend) | Workstream D (DevOps / Testing) | Synchronization Point |
| :--- | :--- | :--- | :--- | :--- |
| **Sprint 0** | `FND-002`, `FND-003`, `FND-005` | `FND-004` | `FND-001`, `FND-006`, `FND-007` | Shared DTO type verification |
| **Sprint 1** | `AUTH-001`, `AUTH-002`, `AUTH-003`, `AUTH-004`, `AUTH-005` | `AUTH-006` | Auth integration tests | Cookie & CSRF integration (`AUTH-007`) |
| **Sprint 2** | `CURR-001`, `CURR-002`, `ONBD-001` | `ONBD-002` | Seed integrity tests | Onboarding route guard (`ONBD-003`) |
| **Sprint 3** | `SCHD-001`, `SCHD-002`, `SCHD-003` | `CURR-003`, `CURR-004`, `CURR-005` | Schedule leap-year tests | Schedule modal integration (`SCHD-004`) |
| **Sprint 4** | `PROG-001`, `PROG-002` | `DWKS-001`, `DWKS-002`, `DWKS-003` | Rollup aggregation tests | Optimistic UI checkbox (`PROG-003`, `PROG-004`) |
| **Sprint 5** | `QUIZ-001`, `QUIZ-002`, `QUIZ-003` | `QUIZ-004`, `QUIZ-005` | Zero-knowledge security scan | Phase Exam gating (`QUIZ-006`) |
| **Sprint 6** | `NOTE-001`, `NOTE-003` (API) | `NOTE-002`, `NOTE-004` | XSS sanitization test | Notes autosave & 409 conflict test |
| **Sprint 7** | `STRK-001`, `STRK-003` | `STRK-002`, `STRK-004` | Timezone boundary tests | Habit dashboard integration |
| **Sprint 8** | `MIGR-002`, `MIGR-003` | `MIGR-001`, `MIGR-004` | Transaction rollback tests | End-to-end localStorage migration |
| **Sprint 9** | `ADMN-003`, `ADMN-005` | `ADMN-001`, `ADMN-002`, `ADMN-004` | RBAC security tests | Backoffice release validation |
| **Sprint 10**| `ANLT-001` | `PROJ-001`, `ANLT-002` | Telemetry load tests | Dashboard telemetry integration |
| **Sprint 11**| Index audits & security tuning | Accessibility / UI polish | `HARD-001`, `HARD-002`, `HARD-003` | Final Production Launch Gate |
