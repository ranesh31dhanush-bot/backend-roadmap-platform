# System Context & High-Level Architecture Specification

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 4 — System Architecture  
**Author:** Winston (BMAD System Architect)  
**Date:** September 21, 2026  
**Status:** Completed Architecture  

---

## 1. Architectural Style & Core Tenets

```
                    MODULAR MONOLITH CORE ARCHITECTURE
  ┌────────────────────────────────────────────────────────────────────────┐
  │                         CLIENT TIER (NEXT.JS)                          │
  │ • App Router (React Server Components + Client Islands)                │
  │ • Optimistic State & Mutation Layer (React Query / Zustand)            │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │ HTTPS / REST (JSON)
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                   APPLICATION TIER (NODE.JS / EXPRESS)                 │
  │ ┌────────────────────────────────────────────────────────────────────┐ │
  │ │                      MODULAR MONOLITH BOUNDARIES                   │ │
  │ │  [Auth]      [Curriculum]  [Schedule]    [Progress]   [Quiz]       │ │
  │ │  [Notes]     [Streaks]     [Migration]   [Projects]   [Admin]      │ │
  │ └────────────────────────────────────────────────────────────────────┘ │
  │ • Shared Domain Event Bus (In-Memory Node EventEmitter $\rightarrow$ Redis)  │
  │ • Strict Layering: Controllers $\rightarrow$ Services $\rightarrow$ Repositories $\rightarrow$ Models│
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │ Mongoose ODM / WiredTiger
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                           PERSISTENCE TIER                             │
  │ • MongoDB Primary Document Store (Clustered Replica Set)               │
  │ • (V1/V2 Evolution: Redis Cache & BullMQ Job Queue)                   │
  └────────────────────────────────────────────────────────────────────────┘
```

### Core Architectural Decisions:
1. **Modular Monolith over Microservices:** To minimize operational overhead, network latency, distributed transaction complexity, and deployment friction for MVP, the backend is architected as a **strictly encapsulated Modular Monolith** in Node.js/TypeScript. Domain modules communicate via explicit internal service interfaces.
2. **Server Authority on State:** All topic completion validations, quiz score evaluations, streak recalculations, and schedule shift operations are strictly governed by the server. The client only performs optimistic UI predictions.
3. **Immutable Canonical Identity:** Curriculum entities (Phases, Weeks, Days, Topics, Quizzes) use immutable string slugs (`p1-w1-d1-t1`) rather than array indices, ensuring complete resilience against curriculum updates and schedule remapping.

---

## 2. System Context Diagram (C4 Level 1)

```
                                  SYSTEM CONTEXT
 
    ┌────────────────────────┐                   ┌────────────────────────┐
    │     Learner / User     │                   │     Administrator      │
    │ (Aspiring Backend Eng) │                   │(Curriculum Lead / Ops) │
    └───────────┬────────────┘                   └───────────┬────────────┘
                │                                            │
                │ HTTPS (Web Browser)                        │ HTTPS (Web Browser)
                ▼                                            ▼
   ┌────────────────────────────────────────────────────────────────────────┐
   │                  TOP 1% BACKEND ROADMAP PLATFORM                       │
   │                                                                        │
   │  ┌───────────────────────┐             ┌────────────────────────────┐  │
   │  │   Next.js Frontend    │ ──REST API─►│     Node.js/Express API    │  │
   │  │   (App Router + UI)   │   (HTTPS)   │     (Modular Monolith)     │  │
   │  └───────────────────────┘             └──────────────┬─────────────┘  │
   │                                                       │                │
   │                                                       ▼                │
   │                                            ┌─────────────────────┐     │
   │                                            │   MongoDB Database  │     │
   │                                            │(Mongoose Data Store)│     │
   │                                            └─────────────────────┘     │
   └───────────────┬───────────────────────────────────────┬────────────────┘
                   │                                       │
     OAuth 2.0 /   │                                       │ SMTP / Transactional
     OpenID Connect│                                       │ (Resend / SendGrid)
                   ▼                                       ▼
     ┌───────────────────────────┐           ┌───────────────────────────┐
     │   Google Identity / OAuth │           │   Transactional Email API │
     │   (User Social Sign-in)   │           │   (Password Reset / Auth) │
     └───────────────────────────┘           └───────────────────────────┘
```

---

## 3. Evolutionary Infrastructure Roadmap (MVP vs V1 vs V2 vs Future)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SYSTEM EVOLUTION MILESTONES                           │
├────────────┬──────────────────────────────────┬─────────────────────────────┤
│ TIER       │ INFRASTRUCTURE COMPONENTS        │ ARCHITECTURAL JUSTIFICATION │
├────────────┼──────────────────────────────────┼─────────────────────────────┤
│ **MVP**    │ • Next.js (Node.js runtime)      │ Lean, robust, zero extra    │
│            │ • Express.js API (TypeScript)    │ infrastructure to manage.   │
│            │ • MongoDB (Replica Set)          │ Node in-memory primitives   │
│            │ • Nodemailer / SMTP Email API    │ handle immediate needs.     │
├────────────┼──────────────────────────────────┼─────────────────────────────┤
│ **V1**     │ • Redis (Standalone / Cluster)   │ Offloads curriculum caching,│
│            │ • BullMQ (Background Workers)    │ handles rate-limit counters,│
│            │ • GitHub API Integration         │ async email/migration jobs. │
├────────────┼──────────────────────────────────┼─────────────────────────────┤
│ **V2**     │ • Server-Sent Events (SSE)       │ Lightweight push channel for│
│            │ • S3 / Object Storage (Export)   │ background job status and   │
│            │ • Prometheus + Grafana           │ live admin metrics.         │
├────────────┼──────────────────────────────────┼─────────────────────────────┤
│ **Future** │ • Sandboxed Code Runners         │ Isolated container runners  │
│            │ • Vector DB / LLM Gateway        │ for project code evaluation │
│            │ • WebSocket Gateway              │ and AI mentorship features. │
└────────────┴──────────────────────────────────┴─────────────────────────────┘
```

---

## 4. Cross-Module Communication Patterns

To preserve modularity and prevent spaghetti dependencies within the monolith:
1. **Direct Service Invocations (Synchronous Queries):** When Module A needs data from Module B (e.g., `ScheduleService` querying `CurriculumService` for total days), it calls Module B's exported public service method. Direct database access across module boundaries is strictly prohibited.
2. **In-Memory Domain Event Bus (Decoupled Side-Effects):** When state changes trigger asynchronous cross-cutting actions (e.g., `TopicCompletedEvent` triggering `StreakService` update and `AnalyticsService` logging), the originating service publishes an event to an in-memory `DomainEventBus` (Node.js `EventEmitter`). In V1/V2, this cleanly swaps to Redis Pub/Sub / BullMQ without changing domain business logic.
