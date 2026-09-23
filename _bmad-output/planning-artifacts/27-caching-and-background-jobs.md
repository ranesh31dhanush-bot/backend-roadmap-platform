# Caching & Background Job Architecture Specification

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 4 — System Architecture  
**Author:** Winston (BMAD System Architect)  
**Date:** September 21, 2026  
**Status:** Completed Architecture  

---

## 1. Caching Strategy & Redis Trigger Model

```
                      CACHING TIER EVOLUTION
  ┌─────────────────────────┐               ┌─────────────────────────┐
  │        MVP TIER         │  Scale Trigger│         V1 TIER         │
  │ • Node.js In-Memory LRU │ ────────────► │ • Centralized Redis 7.x │
  │ • HTTP Cache-Control    │  (Multi-node/ │ • Distributed LRU Cache │
  │ • Next.js React Query   │  >5,000 DAU)  │ • BullMQ Job Backend    │
  └─────────────────────────┘               └─────────────────────────┘
```

### 1.1 MVP In-Memory Caching:
- **Curriculum Outline (`lru-cache`):** The published 52-week curriculum structure is cached in memory with a TTL of 24 hours. The cache is automatically invalidated when an admin publishes a curriculum revision.
- **HTTP Cache Headers:** Static assets and published curriculum endpoints return `Cache-Control: public, max-age=3600, stale-while-revalidate=86400`.

### 1.2 Redis Architecture (V1 Scale):
When multi-instance backend clustering is deployed, Redis provides:
1. **Curriculum Cache:** Shared cache for rendered Day details and Quiz banks.
2. **Rate Limiting:** Shared token-bucket counters across backend nodes.
3. **Session & Token Revocation:** Instant revocation blacklist for active JWTs.

---

## 2. Background Job Processing Architecture (BullMQ)

```
                       BULLMQ JOB PROCESSING QUEUE
  ┌────────────────────┐
  │ Express API Server │
  └─────────┬──────────┘
            │ dispatches job
            ▼
  ┌────────────────────┐
  │ Redis Queue Engine │
  │ (BullMQ Storage)   │
  └─────────┬──────────┘
            │ worker consumes
            ▼
  ┌────────────────────┐
  │ Dedicated Worker   │ ──► [Email Service (Nodemailer / Resend)]
  │ Process (Node.js)  │ ──► [Analytics Aggregation (Nightly Cron)]
  │                    │ ──► [Legacy Batch Migrator]
  └────────────────────┘
```

### Dedicated Queue Allocations:
1. `emailQueue`: Dispatches transactional emails (password reset, email verification, streak freeze warnings) with 3 retries and exponential backoff.
2. `analyticsQueue`: Aggregates weekly drop-off funnels and question failure rates during off-peak hours.
3. `exportQueue` (V2): Generates learner markdown notes ZIP/PDF bundles asynchronously.
