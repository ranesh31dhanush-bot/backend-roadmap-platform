# Architecture Decision Records (ADR 001–011)

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 4 — System Architecture  
**Author:** Winston (BMAD System Architect)  
**Date:** September 21, 2026  
**Status:** Completed Architecture  

---

## ADR-001: Modular Monolith over Microservices Architecture
- **Status:** Accepted
- **Context:** The platform requires 12 distinct domain modules (Auth, Curriculum, Schedule, Progress, Quizzes, Notes, Streaks, Migration, Admin, etc.). Microservices would introduce network latency, distributed transactions, service mesh complexity, and deployment overhead.
- **Decision:** Build the backend as a strictly modularized Node.js/Express Monolith where domain modules communicate via internal TypeScript service interfaces.
- **Consequences:** Simplifies local development, enables atomic database transactions, reduces operational complexity, and allows clean future extraction of services if justified by scale.

---

## ADR-002: MongoDB Data Modeling Strategy (Normalized vs Embedded)
- **Status:** Accepted
- **Context:** Curriculum content is read frequently and updated rarely. Learner progress, notes, and quiz scores are written frequently and independently.
- **Decision:** Use **Embedded Trees** for Curriculum content (`curriculum_nodes` with embedded subtopics and resources) to enable 1-query page loads, and **Normalized Collections** for high-frequency learner state (`topic_progress`, `day_notes`, `quiz_attempts`, `user_streaks`).
- **Consequences:** Maximizes read performance while avoiding oversized document growth and race conditions during concurrent user updates.

---

## ADR-003: Dual-Token HttpOnly Cookie Authentication Strategy
- **Status:** Accepted
- **Context:** Client-side token storage in `localStorage` is vulnerable to token theft via XSS.
- **Decision:** Issue short-lived JWT access tokens (15m) and opaque refresh tokens (7d) stored exclusively in `HttpOnly`, `SameSite=Strict`, `Secure` cookies, accompanied by an `X-CSRF-Token` header on mutating requests.
- **Consequences:** Eliminates XSS token leakage and CSRF vulnerabilities without sacrificing automated token rotation.

---

## ADR-004: Canonical Curriculum Identity & Semantic Versioning
- **Status:** Accepted
- **Context:** Relying on array indices (e.g. `s::1::0::0`) causes progress to break whenever curriculum topics are reordered or updated.
- **Decision:** Assign immutable string slugs (`p1-w1-d1-t1`) to all curriculum nodes and release content under semantic version tags (`v1.0.0`).
- **Consequences:** Historical user progress, notes, and quiz scores survive curriculum edits and structural upgrades with 100% stability.

---

## ADR-005: Scheduling Model: Anchor Storage vs Dynamic Runtime Projection
- **Status:** Accepted
- **Context:** Storing 364 calendar date strings per user creates heavy database bloat and requires expensive bulk writes during rescheduling or pause operations.
- **Decision:** Store only the schedule anchor (`startDate`, `isPaused`, `pausedAt`, `totalPauseDays`) in `user_schedules` and compute calendar dates dynamically on read requests.
- **Consequences:** Rescheduling and pause/resume execute via a single $O(1)$ scalar database write, completely eliminating write storms.

---

## ADR-006: Progress Rollup & Concurrency Model
- **Status:** Accepted
- **Context:** Rapid double-clicking on checkboxes could create duplicate records or corrupted progress rollups.
- **Decision:** Use a compound unique index `{ userId: 1, topicId: 1 }` in `topic_progress` with atomic upsert/delete operations.
- **Consequences:** Checkbox toggles are completely idempotent and immune to race conditions.

---

## ADR-007: Zero-Knowledge Server-Side Quiz Evaluation
- **Status:** Accepted
- **Context:** In the static prototype, answer keys and explanations were present in client JavaScript bundles, enabling inspection cheating.
- **Decision:** Strip answer keys and explanations from quiz session payloads. The client submits chosen option indices; the server evaluates submissions and returns grades and explanations.
- **Consequences:** Guarantees assessment integrity and authentic learning validation.

---

## ADR-008: Deferred Redis Introduction Strategy
- **Status:** Accepted
- **Context:** Redis is a target technology, but running a Redis cluster for a single-instance MVP adds unnecessary operational failure points.
- **Decision:** Use Node.js in-memory LRU caching and in-memory rate-limiting for MVP. Introduce Redis in V1 when DAU exceeds 5,000 or multi-instance clustering is deployed.
- **Consequences:** Reduces MVP infrastructure costs and complexity while maintaining a seamless plug-and-play upgrade path.

---

## ADR-009: Background Job Queue Strategy (BullMQ)
- **Status:** Accepted
- **Context:** Transactional emails, notes exports, and analytics rollups can block HTTP response threads if run synchronously.
- **Decision:** Implement an abstract `JobQueue` interface. In MVP, non-critical side effects execute asynchronously via Node.js events/promises. In V1, BullMQ + Redis is slotted in seamlessly.
- **Consequences:** Keeps MVP lightweight while providing enterprise-grade queue architecture for V1.

---

## ADR-010: Real-Time Communication Evolution (REST $\rightarrow$ SSE)
- **Status:** Accepted
- **Context:** The platform is primarily an asynchronous study tool. Full duplex WebSockets add connection state management overhead without immediate user value.
- **Decision:** Use REST with optimistic UI updates for MVP. Introduce Server-Sent Events (SSE) in V2 for live notifications and admin metrics.
- **Consequences:** Minimizes server memory footprint and connection exhaustion risks.

---

## ADR-011: Multi-Stage Docker & Cloud-Neutral Deployment
- **Status:** Accepted
- **Context:** The application must deploy cleanly across diverse cloud providers (AWS, Render, Railway, DigitalOcean).
- **Decision:** Package frontend and backend as standard, multi-stage Alpine Docker containers with non-root security profiles.
- **Consequences:** Ensures 100% environment parity between local development, staging, and cloud production.
