# Curriculum Versioning & Canonical Identity Architecture

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 4 — System Architecture  
**Author:** Winston (BMAD System Architect)  
**Date:** September 21, 2026  
**Status:** Completed Architecture  

---

## 1. Immutable Canonical Curriculum ID Strategy

To prevent historical progress or notes from orphaning when curriculum content is edited, reordered, or expanded, the platform **completely rejects array index referencing** (e.g., `s::1::0::0`). 

Every entity is assigned a **deterministic, immutable string slug**:

```
                       CANONICAL ID TAXONOMY
  Phase Level    ──► p1                     (Phase 1: Foundation)
  Week Level     ──► p1-w2                  (Phase 1, Week 2: TCP/IP)
  Day Level      ──► p1-w2-d3               (Phase 1, Week 2, Day 3: HTTP Cycle)
  Subtopic Level ──► p1-w2-d3-t1            (Subtopic: Request-Response Cycle)
  Resource Level ──► p1-w2-d3-r1            (Resource: Video / Docs)
  Quiz Question  ──► q-eventloop-01         (Question Entity ID)
  Project Level  ──► proj-p1-urlshortener   (Phase 1 Capstone Project)
```

---

## 2. Curriculum Version Lifecycle & Publishing Model

```
 ┌──────────────┐         Admin Publish         ┌─────────────────┐
 │ DRAFT STATE  │ ────────────────────────────► │ PUBLISHED STATE │
 │ (In-Studio)  │                               │ (Live Version)  │
 └──────────────┘                               └────────┬────────┘
                                                         │
                                                         ▼ New Major Release
                                                ┌─────────────────┐
                                                │ ARCHIVED STATE  │
                                                │ (Pinned Cohorts)│
                                                └─────────────────┘
```

### 2.1 Release Classification Rules:
1. **Non-Breaking Updates (Minor/Patch — e.g., `v1.0.0` $\rightarrow$ `v1.0.1`):**
   - *Modifications:* Typo corrections, updating broken external resource URLs, adding new quiz questions to an existing bank.
   - *System Reaction:* Deployed in-place immediately to all active learners. Zero user action required.
2. **Breaking Structural Updates (Major — e.g., `v1.0.0` $\rightarrow$ `v2.0.0`):**
   - *Modifications:* Adding new weeks, removing subtopics, restructuring phase boundaries.
   - *System Reaction:* Active learners remain pinned to their enrolled version (`v1.0.0`). The dashboard displays an optional banner: *"Curriculum v2.0 is available! Review changes and upgrade."*

### 2.2 Non-Destructive Version Upgrade Algorithm:
When a learner chooses to upgrade from `v1` to `v2`:
```
 [Learner Clicks 'Upgrade to Curriculum v2.0']
       │
       ├── 1. Database fetches learner's completed topicId set: ['p1-w1-d1-t1', 'p1-w1-d1-t2', ...]
       ├── 2. System updates learner's enrolledVersion = '2.0.0'
       ├── 3. Any completed topicId present in v2 remains 100% checked
       ├── 4. Any deprecated topicId not present in v2 is archived in audit history
       └── 5. Progress rollups are recomputed against v2 total topic counts
```
