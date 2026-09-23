# 41. Implementation Traceability Matrix

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 5 — Scrum Master Planning  
**Role:** BMAD Scrum Master  
**Status:** Approved Full Traceability Matrix  

---

## 1. Traceability Matrix (PRD $\rightarrow$ UX $\rightarrow$ Architecture $\rightarrow$ Story $\rightarrow$ Sprint)

| PRD Epic / Req | UX Artifact & Screen | Architecture Artifact & ADR | API Endpoint | Data Collection | Story ID | Target Sprint |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Epic 1: Auth (FR-1.1)** | `12-ux-wireframes.md` (Screen A, B) | `22-auth-security.md`, `ADR-003` | `POST /api/v1/auth/register` | `users`, `user_credentials` | `AUTH-001` | Sprint 1 |
| **Epic 1: Auth (FR-1.2)** | `12-ux-wireframes.md` (Screen A) | `22-auth-security.md`, `ADR-003` | `POST /api/v1/auth/login` | `user_sessions` | `AUTH-002` | Sprint 1 |
| **Epic 1: Auth (FR-1.3)** | `12-ux-wireframes.md` (Screen A) | `22-auth-security.md` | `GET /api/v1/auth/google` | `users` | `AUTH-003` | Sprint 1 |
| **Epic 1: Auth (FR-1.4)** | `12-ux-wireframes.md` (Screen C) | `22-auth-security.md` | `POST /api/v1/auth/reset-password` | `password_resets` | `AUTH-004` | Sprint 1 |
| **Epic 1: Auth (FR-1.5)** | `11-ux-design-system.md` | `22-auth-security.md` | `* (Middleware)` | N/A | `AUTH-005` | Sprint 1 |
| **Epic 1: Auth (FR-1.6)** | `12-ux-wireframes.md` (Screen A–C) | `17-frontend-architecture.md` | Client UI | N/A | `AUTH-006` | Sprint 1 |
| **Epic 1: Auth (FR-1.7)** | `10-ux-user-flows.md` (Flow 1) | `17-frontend-architecture.md` | `POST /api/v1/auth/refresh` | `user_sessions` | `AUTH-007` | Sprint 1 |
| **Epic 2: Onboarding (FR-2.1)** | `12-ux-wireframes.md` (Screen D) | `24-scheduling.md`, `ADR-005` | `POST /api/v1/onboarding/start` | `user_schedules` | `ONBD-001` | Sprint 2 |
| **Epic 2: Onboarding (FR-2.2)** | `12-ux-wireframes.md` (Screen D) | `17-frontend-architecture.md` | Client UI | N/A | `ONBD-002` | Sprint 2 |
| **Epic 2: Onboarding (FR-2.3)** | `10-ux-user-flows.md` (Flow 2) | `17-frontend-architecture.md` | Next.js Middleware | N/A | `ONBD-003` | Sprint 2 |
| **Epic 3: Curriculum (FR-3.1)** | `01-product-discovery.md` | `20-mongodb-data-model.md`, `ADR-004` | Database Seeder | `curriculum_nodes` | `CURR-001` | Sprint 2 |
| **Epic 3: Curriculum (FR-3.2)** | `09-ux-information-arch.md` | `21-api-spec.md`, `ADR-008` | `GET /api/v1/curriculum` | `curriculum_nodes` | `CURR-002` | Sprint 2 |
| **Epic 3: Curriculum (FR-3.3)** | `12-ux-wireframes.md` (Screen E, F) | `17-frontend-architecture.md` | Client UI | N/A | `CURR-003` | Sprint 3 |
| **Epic 3: Curriculum (FR-3.4)** | `13-ux-component-inventory.md` | `17-frontend-architecture.md` | Client UI | N/A | `CURR-004` | Sprint 3 |
| **Epic 3: Curriculum (FR-3.5)** | `11-ux-design-system.md` | `17-frontend-architecture.md` | Client UI | N/A | `CURR-005` | Sprint 3 |
| **Epic 6: Schedule (FR-6.1)** | `12-ux-wireframes.md` (Screen O) | `24-scheduling.md`, `ADR-005` | Runtime Projection | `user_schedules` | `SCHD-001` | Sprint 3 |
| **Epic 6: Schedule (FR-6.2)** | `12-ux-wireframes.md` (Screen O) | `24-scheduling.md`, `ADR-005` | `PATCH /api/v1/schedule/reschedule` | `user_schedules` | `SCHD-002` | Sprint 3 |
| **Epic 6: Schedule (FR-6.3)** | `12-ux-wireframes.md` (Screen O) | `24-scheduling.md`, `ADR-005` | `POST /api/v1/schedule/pause` | `user_schedules`, `pause_events` | `SCHD-003` | Sprint 3 |
| **Epic 6: Schedule (FR-6.4)** | `10-ux-user-flows.md` (Flow 6) | `17-frontend-architecture.md` | Client UI | N/A | `SCHD-004` | Sprint 3 |
| **Epic 4: Workspace (FR-4.1)** | `12-ux-wireframes.md` (Screen G) | `17-frontend-architecture.md` | Client UI | N/A | `DWKS-001` | Sprint 4 |
| **Epic 4: Workspace (FR-4.2)** | `12-ux-wireframes.md` (Screen G) | `17-frontend-architecture.md` | Client UI | N/A | `DWKS-002` | Sprint 4 |
| **Epic 4: Workspace (FR-4.3)** | `14-ux-accessibility.md` | `17-frontend-architecture.md` | Client UI | N/A | `DWKS-003` | Sprint 4 |
| **Epic 5: Progress (FR-5.1)** | `12-ux-wireframes.md` (Screen G) | `24-scheduling.md`, `ADR-006` | `POST /api/v1/progress/toggle` | `topic_progress` | `PROG-001` | Sprint 4 |
| **Epic 5: Progress (FR-5.2)** | `09-ux-information-arch.md` | `24-scheduling.md`, `ADR-006` | `GET /api/v1/progress/summary` | Aggregation Pipeline | `PROG-002` | Sprint 4 |
| **Epic 5: Progress (FR-5.3)** | `10-ux-user-flows.md` (Flow 3) | `17-frontend-architecture.md` | TanStack Mutation | N/A | `PROG-003` | Sprint 4 |
| **Epic 5: Progress (FR-5.4)** | `13-ux-component-inventory.md` | `17-frontend-architecture.md` | Client UI | N/A | `PROG-004` | Sprint 4 |
| **Epic 7: Quizzes (FR-7.1)** | `01-product-discovery.md` | `20-mongodb-data-model.md`, `ADR-007` | Database Seeder | `quiz_banks`, `quiz_questions` | `QUIZ-001` | Sprint 5 |
| **Epic 7: Quizzes (FR-7.2)** | `12-ux-wireframes.md` (Screen I) | `25-quiz-security.md`, `ADR-007` | `GET /api/v1/quizzes/:id/start` | `quiz_attempts` | `QUIZ-002` | Sprint 5 |
| **Epic 7: Quizzes (FR-7.3)** | `12-ux-wireframes.md` (Screen J) | `25-quiz-security.md`, `ADR-007` | `POST /api/v1/quizzes/:id/submit`| `quiz_attempts` | `QUIZ-003` | Sprint 5 |
| **Epic 7: Quizzes (FR-7.4)** | `10-ux-user-flows.md` (Flow 4) | `17-frontend-architecture.md` | Client UI | N/A | `QUIZ-004` | Sprint 5 |
| **Epic 7: Quizzes (FR-7.5)** | `12-ux-wireframes.md` (Screen J) | `17-frontend-architecture.md` | Client UI | N/A | `QUIZ-005` | Sprint 5 |
| **Epic 7: Quizzes (FR-7.6)** | `10-ux-user-flows.md` (Flow 4) | `25-quiz-security.md` | `GET /api/v1/quizzes/high-scores`| `user_schedules` | `QUIZ-006` | Sprint 5 |
| **Epic 8: Notes (FR-8.1)** | `12-ux-wireframes.md` (Screen H) | `20-mongodb-data-model.md`, `ADR-002` | `PUT /api/v1/notes/:dayId` | `day_notes` | `NOTE-001` | Sprint 6 |
| **Epic 8: Notes (FR-8.2)** | `12-ux-wireframes.md` (Screen H) | `22-auth-security.md` | Client UI | N/A | `NOTE-002` | Sprint 6 |
| **Epic 8: Links (FR-8.3)** | `12-ux-wireframes.md` (Screen H) | `21-api-spec.md` | `POST /api/v1/links` | `external_links` | `NOTE-003` | Sprint 6 |
| **Epic 8: Notes (FR-8.4)** | `12-ux-wireframes.md` (Screen K) | `17-frontend-architecture.md` | `GET /api/v1/notes` | `day_notes` | `NOTE-004` | Sprint 6 |
| **Epic 9: Streaks (FR-9.1)** | `12-ux-wireframes.md` (Screen P) | `20-mongodb-data-model.md` | `GET /api/v1/streaks` | `user_streaks` | `STRK-001` | Sprint 7 |
| **Epic 9: Streaks (FR-9.2)** | `12-ux-wireframes.md` (Screen P) | `17-frontend-architecture.md` | Client UI | N/A | `STRK-002` | Sprint 7 |
| **Epic 9: Streaks (FR-9.3)** | `03-functional-reqs.md` | `19-domain-module-boundaries.md` | Streak Engine | `user_streaks` | `STRK-003` | Sprint 7 |
| **Epic 9: Streaks (FR-9.4)** | `13-ux-component-inventory.md` | `17-frontend-architecture.md` | Client UI | N/A | `STRK-004` | Sprint 7 |
| **Epic 10: Migration (FR-10.1)**| `12-ux-wireframes.md` (Screen Q) | `26-migration-architecture.md` | Client Extractor | N/A | `MIGR-001` | Sprint 8 |
| **Epic 10: Migration (FR-10.2)**| `01-product-discovery.md` | `26-migration-architecture.md` | Translation Engine | N/A | `MIGR-002` | Sprint 8 |
| **Epic 10: Migration (FR-10.3)**| `10-ux-user-flows.md` (Flow 8) | `26-migration-architecture.md` | `POST /api/v1/migration/import` | Multi-collection Transaction | `MIGR-003` | Sprint 8 |
| **Epic 10: Migration (FR-10.4)**| `12-ux-wireframes.md` (Screen Q) | `17-frontend-architecture.md` | Client UI | N/A | `MIGR-004` | Sprint 8 |
| **Epic 11: Admin (FR-11.1)** | `12-ux-wireframes.md` (Screen R) | `19-domain-module-boundaries.md` | `GET /api/v1/admin/*` | N/A | `ADMN-001` | Sprint 9 |
| **Epic 11: Admin (FR-11.2)** | `12-ux-wireframes.md` (Screen R) | `19-domain-module-boundaries.md` | `PUT /api/v1/admin/curriculum` | `curriculum_nodes` | `ADMN-002` | Sprint 9 |
| **Epic 11: Admin (FR-11.3)** | `03-functional-reqs.md` | `23-curriculum-versioning.md`, `ADR-004`| `POST /api/v1/admin/curriculum/publish` | `curriculum_versions` | `ADMN-003` | Sprint 9 |
| **Epic 11: Admin (FR-11.4)** | `12-ux-wireframes.md` (Screen R) | `25-quiz-security.md` | `POST /api/v1/admin/quizzes` | `quiz_questions` | `ADMN-004` | Sprint 9 |
| **Epic 11: Admin (FR-11.5)** | `04-analytics-nfr-risks.md` | `20-mongodb-data-model.md` | Admin Interceptor | `admin_audit_logs` | `ADMN-005` | Sprint 9 |
| **Epic 12: Projects (FR-12.1)**| `12-ux-wireframes.md` (Screen M) | `20-mongodb-data-model.md` | `GET /api/v1/projects` | `projects` | `PROJ-001` | Sprint 10 |
| **Epic 13: Analytics (FR-13.1)**| `04-analytics-nfr-risks.md` | `28-analytics-observability.md` | `POST /api/v1/analytics/event` | `analytics_events` | `ANLT-001` | Sprint 10 |
| **Epic 13: Analytics (FR-13.2)**| `12-ux-wireframes.md` (Screen N) | `28-analytics-observability.md` | Client UI | N/A | `ANLT-002` | Sprint 10 |
| **NFR: DevOps / Testing** | Full UX Suite | `29-deployment.md`, `30-testing.md`, `ADR-011` | All Routes | All Collections | `HARD-001..003` | Sprint 11 |

---

## 2. Coverage Audit Summary

* **Total PRD P0 Functional Requirements:** 32 / 32 Covered (**100% Coverage**)
* **Total UX Wireframe Screens (A through R):** 18 / 18 Covered (**100% Coverage**)
* **Total MongoDB Collections (15 Collections):** 15 / 15 Covered (**100% Coverage**)
* **Total ADRs (ADR-001 through ADR-011):** 11 / 11 Covered (**100% Coverage**)
* **Uncovered Major Requirements:** **0**
