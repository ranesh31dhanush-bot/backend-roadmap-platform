# Analytics & Observability Architecture Specification

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 4 — System Architecture  
**Author:** Winston (BMAD System Architect)  
**Date:** September 21, 2026  
**Status:** Completed Architecture  

---

## 1. Domain Event Tracking & Telemetry Schema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DOMAIN EVENT TAXONOMY                                 │
├────────────────────────┬────────────────────────────────────────────────────┤
│ EVENT TYPE             │ TRIGGER & PAYLOAD METADATA                         │
├────────────────────────┼────────────────────────────────────────────────────┤
│ `USER_REGISTERED`      │ Triggered upon new account creation (authProvider).│
│ `ONBOARDING_COMPLETED` │ Triggered when start date is confirmed.            │
│ `TOPIC_TOGGLED`        │ Triggered on subtopic check/uncheck (topicId, day).│
│ `QUIZ_COMPLETED`       │ Triggered on quiz submission (score, grade, passed)│
│ `COURSE_PAUSED`        │ Triggered when learner freezes journey (pausedAt). │
│ `COURSE_RESUMED`       │ Triggered on resumption (pauseDeltaDays, newEnd).  │
│ `MIGRATION_COMPLETED`  │ Triggered on legacy data cloud import (counts).    │
└────────────────────────┴────────────────────────────────────────────────────┘
```

### Event Document Structure (`analytics_events`):
```typescript
interface AnalyticsEvent {
  _id: ObjectId;
  eventType: string;
  userId: ObjectId;
  correlationId: string;
  entityId?: string; // canonicalDayId, topicId, or quizKey
  metadata: Record<string, any>;
  timestamp: Date; // Indexed with 90-day MongoDB TTL
}
```

---

## 2. Observability Architecture (Pino & Prometheus)

```
                       OBSERVABILITY PIPELINE
  ┌───────────────────────┐
  │ Incoming HTTP Request │
  └──────────┬────────────┘
             │ 1. Attaches correlationId (UUIDv4)
             ▼
  ┌───────────────────────┐
  │ Pino JSON Logger      │ ──► {"level":30,"time":1774312200,"reqId":"9a8b","msg":"Topic checked"}
  └──────────┬────────────┘
             │ 2. Records Prometheus Histogram metrics
             ▼
  ┌───────────────────────┐
  │ /metrics Endpoint     │ ──► `http_request_duration_seconds_bucket{route="/api/v1/progress"}`
  └───────────────────────┘
```

### Health Check Standards:
- **Liveness Probe (`GET /healthz`):** Returns HTTP 200 `{ "status": "UP" }` if Express event loop is responsive.
- **Readiness Probe (`GET /readyz`):** Performs active ping against MongoDB database (`mongoose.connection.db.admin().ping()`). Returns HTTP 200 if connected, HTTP 503 if disconnected.
