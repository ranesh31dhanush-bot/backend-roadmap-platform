# 40. Implementation Risk & Technical Debt Register

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 5 — Scrum Master Planning  
**Role:** BMAD Scrum Master  
**Status:** Approved Risk & Technical Debt Registry  

---

## 1. Implementation Risk Register

| Risk ID | Risk Description | Prob | Impact | Mitigation Strategy | Owner | Trigger / Detection |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RSK-001** | **Legacy Data Loss during Migration:** Corrupted or partial localStorage payloads cause incomplete imports. | Medium | High | Ingestion executed inside atomic MongoDB transaction (`mongoose.startSession()`). Client **never clears** `localStorage` until server explicitly returns `{ success: true }`. | Backend Lead / Sprint 8 | Migration error rate $> 1\%$ |
| **RSK-002** | **Quiz Answer Key Leakage:** Client inspects network payloads to scrape correct options or explanations. | Low | Critical | Zero-knowledge projection pipeline in `quiz.service.ts` explicitly strips `correctOptionIndex` and `explanation` before delivery. Tested by automated security suite. | Security Lead / Sprint 5 | Security regression test failure in CI |
| **RSK-003** | **Curriculum Tree Evolution Breaking Progress:** Publishing v1.1.0 breaks existing learner progress pointers. | Low | High | Enrolled learners are pinned to their active curriculum version. Hard deletions prohibited; deprecations handled via soft flags. | Architect / Sprint 9 | Version publish sanity check |
| **RSK-004** | **Notes Autosave Race Conditions:** Multiple open tabs overwrite each other silently. | Medium | Medium | Optimistic concurrency control via integer `version` field. Backend rejects stale edits with `409 Conflict` and returns latest server snapshot. | Fullstack Dev / Sprint 6 | Concurrency integration test failure |
| **RSK-005** | **Optimistic UI State Drift:** Rapid clicking on flaky networks causes mismatch between UI and server state. | Medium | Medium | TanStack Query mutation rollbacks with automatic cache invalidation and user toast alerts on failed mutations. | Frontend Lead / Sprint 4 | Manual chaos testing on slow 3G |
| **RSK-006** | **Timezone Offsets on Daily Streaks:** Learners near midnight UTC cross day boundaries unexpectedly. | Medium | Low | Streak calculations evaluate against user's reported IANA local timezone offset rather than raw server UTC. | Backend Dev / Sprint 7 | Timezone unit test suite |
| **RSK-007** | **Large Tree Memory Overhead in Frontend:** Rendering 813 topics causing DOM slowdown. | Low | Medium | Virtualized list rendering or accordion chunking (only active Phase/Week DOM nodes mounted). | Frontend Dev / Sprint 3 | Lighthouse rendering performance $< 90$ |

---

## 2. Technical Debt Register

| Debt ID | Description / Area | Reason for Deferral | Architectural Impact | Target Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **DEBT-001** | **In-Memory Caching vs Redis:** Using Node-cache LRU instead of Redis in MVP. | Adhere to Principle #1 (Simplicity before premature distribution). MVP single-instance traffic does not require distributed cache. | Multi-instance horizontal scaling requires distributed cache invalidation. | **V1 Release** (When DAU $> 5,000$ or replicas $> 2$) via `REDIS-101`. |
| **DEBT-002** | **In-Process Events vs BullMQ:** Async operations handled via Node EventEmitter instead of persistent queue. | Avoids heavy Redis/BullMQ worker infrastructure in early MVP. | Unprocessed events could be lost during ungraceful server crashes. | **V1 Release** via `BULL-101`. |
| **DEBT-003** | **REST Polling vs WebSockets / SSE:** Real-time updates use optimistic UI and on-demand queries. | MVP does not require synchronous multi-user collaboration. | Slight latency in multi-tab synchronization. | **V2 Release** when study rooms / live features launch. |
| **DEBT-004** | **Basic Email Stub vs Dedicated Provider:** Email dispatch for password resets uses console logging / SMTP stub in local dev. | Simplifies initial local development without requiring external Resend/SendGrid credentials. | Production requires verified domain and API credentials. | **Sprint 11 (Hardening)** before staging launch. |
| **DEBT-005** | **Offline Sync Queue:** Progressive Web App offline capabilities deferred. | Browser localStorage migration prioritized for MVP over full offline service worker sync. | Users cannot study completely offline without an internet connection. | **V1 Release** via `CURR-101`. |
