# 38. Release Scope Matrix (MVP / V1 / V2 / Future)

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 5 — Scrum Master Planning  
**Role:** BMAD Scrum Master  
**Status:** Approved Release Boundaries  

---

## 1. Release Tier Definitions

* **MVP (Minimum Viable Product — Sprints 0–11):** The absolute foundational baseline required to replace the static HTML file with a secure, multi-device, cloud-synchronized learning platform.
* **V1 (Fast Follow Enhancement — Post-MVP):** Ecosystem enhancements including capstone project repository submissions, diagnostic admin analytics, offline optimistic sync, and Redis/BullMQ infrastructure integration.
* **V2 (Advanced Learning & Community):** Deep engagement tools including Spaced Repetition (SRS Flashcards), email/in-app notification digest, and public portfolio badges.
* **Future (AI & Real-Time Scale):** Autonomous AI mentor bots, real-time virtual co-working rooms, and enterprise cohort management.

---

## 2. Feature & Domain Release Boundary Matrix

| Functional Area | MVP Scope (Sprints 0–11) | V1 Scope (Post-MVP) | V2 Scope | Future / Experimental |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication & Identity** | Email/Password, Google OAuth 2.0, HttpOnly dual-token cookie rotation, Session revocation, Password reset, Basic RBAC (`learner`, `admin`). | Social login expansion (GitHub OAuth), Session device manager view. | Passkey / WebAuthn passwordless, 2FA/MFA (TOTP). | Enterprise SSO (SAML, Okta). |
| **Curriculum Catalog** | 52-week canonical tree, 5 phases, 364 days, 813 topics, 454 resources, skip directives, salary milestones, immutable slugs (`p1-w1-d1-t1`). | Offline optimistic topic sync with IndexedDB queue. | Interactive code playground embedded in topics. | Multi-track roadmaps (Go, Rust, Distributed Systems specialist tracks). |
| **Learner Onboarding** | 3-step wizard, start date selection, target role, completion projection. | Diagnostic skill assessment to auto-recommend skip directives. | Personalized weekly study schedule generator (e.g. 10h vs 20h/week). | AI learning path customizer. |
| **Adaptive Scheduling** | Anchor-based schedule, dynamic calendar projection, pause course, resume course, reschedule start date. | Google Calendar / Outlook iCal sync integration. | Holiday calendar exclusions, custom rest day configurations. | Predictive pace adjustments based on real velocity. |
| **Daily Workspace** | Daily checklist, code syntax snippets, resource links, keyboard shortcuts (`[` / `]`), $<16\text{ms}$ optimistic checkbox toggle. | Split-screen workspace layout, rich media embeds (Loom, diagrams). | Interactive REPL sandbox per day. | Live voice/screen co-learning. |
| **Progress & Telemetry** | Atomic topic progress ledger, rollups aggregation (Day/Week/Phase/Global), top-bar telemetry, sidebar indicators. | CSV progress export, Printable progress certificate. | Milestone shareable cards for LinkedIn/Twitter. | Blockchain verified graduation credentials. |
| **Quizzes & Mastery** | Zero-knowledge question API, 9 quiz banks, timed runner, server-side grading, $\ge 75\%$ accuracy mastery gate, retakes, high scores. | Bulk CSV/JSON question import tool for admin. | Adaptive difficulty questions based on past performance. | AI-generated dynamic quiz questions per topic. |
| **Notes & Resources** | Markdown notes editor, DOMPurify XSS sanitize, debounced autosave, optimistic lock (`409 Conflict`), custom day links, global Notes Explorer. | PDF / Markdown notes export as single career handbook. | Rich LaTeX math formulas and Mermaid diagram live rendering. | AI automated note summarization & key concept extraction. |
| **Habits & Streaks** | Daily activity ledger, streak counter, 21-Day Habit Matrix, 1 monthly streak freeze, Pomodoro timer (25/5 min + audio). | Custom Pomodoro intervals (50/10 min), streak recovery challenges. | Public streak leaderboards & peer high-five cheers. | Synchronous study room Pomodoro sync. |
| **Legacy Migration** | Client-side `localStorage` extraction, date-to-slug translation, atomic transactional MongoDB import, rollback safety. | Migration diagnostic repair tool for corrupted legacy dumps. | JSON backup file import/export. | One-click import from Notion / Obsidian. |
| **Admin Backoffice** | Backoffice shell, curriculum tree editor, semantic version publishing (`v1.1.0`), quiz question editor, audit logging. | User management directory, role elevation, manual progress override. | Version diff visualizer, staging sandbox environment. | Multi-tenant organization administration. |
| **Capstone Projects** | 4 detailed Capstone architectural specifications, benchmarks, and requirement rubrics. | GitHub repository & live demo URL submission API, submission status badge. | Peer code review rubrics & community upvoting. | Automated AI code architecture reviewer bot. |
| **Analytics & Telemetry** | Asynchronous `/api/v1/analytics/event` ingestion, personal velocity dashboard widget. | Admin aggregate cohort retention & drop-off heatmaps. | Study time heatmaps (GitHub-style contribution graph). | Predictive dropout early warning alerts. |
| **Infrastructure & Caching**| In-memory LRU caching, in-process async event bus, MongoDB Atlas, Distroless Docker containers. | Redis distributed cache, BullMQ background worker service. | Multi-region read replicas, SSE live notification push. | Serverless edge compute deployment. |

---

## 3. Explicit "What Developers Must NOT Build in MVP"

To prevent scope creep and maintain development focus, the following items are **strictly prohibited from MVP implementation**:
1. ❌ **Do NOT install Redis or BullMQ in MVP:** Use in-memory LRU caching and in-process async handlers.
2. ❌ **Do NOT build WebSockets or SSE real-time infrastructure in MVP:** Standard REST with optimistic UI is sufficient.
3. ❌ **Do NOT build AI Mentor integrations in MVP:** Defer all LLM integrations to future phases.
4. ❌ **Do NOT build Google Calendar / iCal sync in MVP:** Scheduling uses internal dynamic calculation.
5. ❌ **Do NOT build public user profiles or social leaderboards in MVP:** Focus on individual learner mastery.
6. ❌ **Do NOT build multi-track roadmaps in MVP:** Only the canonical 52-week Backend Roadmap is supported.
