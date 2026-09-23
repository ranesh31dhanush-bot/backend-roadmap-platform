# Legacy LocalStorage Migration Architecture

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 4 — System Architecture  
**Author:** Winston (BMAD System Architect)  
**Date:** September 21, 2026  
**Status:** Completed Architecture  

---

## 1. Migration Pipeline Overview

```
                      LEGACY DATA MIGRATION PIPELINE
  ┌────────────────────────────────┐
  │ Browser LocalStorage           │
  │ • done: { "s::1::0::0": true } │
  │ • notes: { "2026-09-01": "..."}│
  │ • qscores: { ... }             │
  │ • chatLinks / pdfLinks         │
  └───────────────┬────────────────┘
                  │ 1. Client detects keys & dispatches POST /api/v1/migration/import
                  ▼
  ┌────────────────────────────────┐
  │ Schema & Payload Validation    │ ──► Rejects malformed JSON / oversized payloads (>2MB)
  └───────────────┬────────────────┘
                  │ 2. Payload validated
                  ▼
  ┌────────────────────────────────┐
  │ Date-to-Canonical ID Mapper    │ ──► Resolves s::1::0::0 ──► p1-w1-d1-t1
  │                                │ ──► Resolves 2026-09-01  ──► p1-w1-d1
  └───────────────┬────────────────┘
                  │ 3. Normalized DTOs created
                  ▼
  ┌────────────────────────────────┐
  │ Atomic MongoDB Transaction     │ ──► Upserts TopicProgress, DayNotes, UserSchedule
  └───────────────┬────────────────┘
                  │ 4. Transaction committed
                  ▼
  ┌────────────────────────────────┐
  │ Client Cleans LocalStorage     │ ──► Server returns 200 OK; browser clears legacy keys
  └────────────────────────────────┘
```

---

## 2. Legacy Key to Canonical ID Translation Algorithm

Because the legacy application stored notes by date string (`notes['2026-09-01']`) and topics by slot index (`done['s::1::0::0']`), the migration service executes a **deterministic chronological projection** using the legacy `startDate`:

1. **Calculate Baseline Calendar Mapping:** Using legacy `startDate`, compute the calendar date for every day index $(0..363)$.
2. **Translate Slot Keys:**
   $$\text{'s::wn::di::ti'} \longrightarrow \text{Canonical Topic ID: 'p}\{P\}\text{-w}\{\text{wn}\}\text{-d}\{\text{di}+1\}\text{-t}\{\text{ti}+1\}\text{'}$$
3. **Translate Date-Keyed Notes:**
   $$\text{notes}[\text{DateString}] \longrightarrow \text{Match Day by Date} \longrightarrow \text{DayNote with CanonicalDayId 'p}\{P\}\text{-w}\{\text{wn}\}\text{-d}\{\text{di}+1\}\text{'}$$
4. **Translate Quiz High Scores:**
   $$\text{qscores}[\text{'daily::Node.js Event Loop'}] \longrightarrow \text{QuizHighScore record for topic bank}$$

---

## 3. Idempotency & Fault-Tolerance Guarantees

- **Multi-Document Transaction:** The entire migration runs within a MongoDB session transaction (`session.startTransaction()`). If any single record fails validation, the entire batch rolls back.
- **Idempotent Upsert Strategy:** Every write uses `$setOnInsert` or `$max` on unique compound keys (`{ userId, topicId }`, `{ userId, canonicalDayId }`), allowing safe repeated retries without duplicating progress or overwriting newer cloud edits.
- **Protected LocalStorage Retention:** The client frontend MUST NOT delete browser `localStorage` keys until an explicit HTTP 200 response with `"status": "COMPLETED"` is received from the server.
