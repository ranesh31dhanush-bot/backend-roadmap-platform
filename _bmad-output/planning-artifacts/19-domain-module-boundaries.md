# Domain Module Boundaries & Encapsulation Specification

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 4 — System Architecture  
**Author:** Winston (BMAD System Architect)  
**Date:** September 21, 2026  
**Status:** Completed Architecture  

---

## 1. Domain Module Dependency Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       MODULE DEPENDENCY TOPOLOGY                            │
├──────────────────┬───────────────────────────┬──────────────────────────────┤
│ MODULE           │ INBOUND CALLERS           │ OUTBOUND DEPENDENCIES        │
├──────────────────┼───────────────────────────┼──────────────────────────────┤
│ AuthModule       │ API Clients               │ UserModule, TokenService     │
│ UserModule       │ AuthModule, AdminModule   │ Database                     │
│ CurriculumModule │ Schedule, Progress, Quiz  │ Database                     │
│ ScheduleModule   │ Progress, API Clients     │ CurriculumModule, UserModule │
│ ProgressModule   │ API Clients, Migration    │ CurriculumModule, Schedule   │
│ QuizModule       │ API Clients, AdminModule  │ CurriculumModule, Progress   │
│ NotesModule      │ API Clients, Migration    │ CurriculumModule             │
│ StreakModule     │ Progress (via EventBus)   │ ScheduleModule               │
│ MigrationModule  │ API Clients               │ Progress, Notes, Quiz, Sched │
│ AdminModule      │ Admin Clients             │ All Modules (Curriculum/User)│
└──────────────────┴───────────────────────────┴──────────────────────────────┘
```

---

## 2. In-Depth Module Specifications

### 2.1 Identity & Access Module (`AuthModule`)
- **Responsibilities:** User registration, password hashing (bcrypt), Google OAuth token verification, JWT issuance/rotation, session revocation, and password reset flows.
- **Exported Interface:** `AuthService.verifyAccessToken(token)`, `AuthService.revokeAllUserSessions(userId)`.
- **Domain Events Emitted:** `UserRegisteredEvent`, `PasswordResetRequestedEvent`.

### 2.2 Curriculum Module (`CurriculumModule`)
- **Responsibilities:** Stores and serves the canonical 52-week curriculum hierarchy (Phases, Weeks, Days, Topics, Resources, Projects, Skip directives).
- **Exported Interface:** `CurriculumService.getCurriculumOutline(version)`, `CurriculumService.getDayDetails(canonicalDayId)`, `CurriculumService.isValidTopicId(topicId)`.
- **Domain Events Emitted:** `CurriculumPublishedEvent`.

### 2.3 Schedule Engine Module (`ScheduleModule`)
- **Responsibilities:** Computes calendar mappings from `startDate`, executes rescheduling shifts, computes pause/resume day deltas ($\Delta$), and determines whether a calendar day is today, past, or future.
- **Exported Interface:** `ScheduleService.getUserSchedule(userId)`, `ScheduleService.setStartDate(userId, date)`, `ScheduleService.pauseCourse(userId)`, `ScheduleService.resumeCourse(userId)`.
- **Domain Events Emitted:** `CoursePausedEvent`, `CourseResumedEvent`, `ScheduleRemappedEvent`.

### 2.4 Progress & Rollup Module (`ProgressModule`)
- **Responsibilities:** Manages granular topic completion flags, recalculates Day/Week/Phase/Global completion statistics, guarantees idempotency on checkbox toggles.
- **Exported Interface:** `ProgressService.toggleTopic(userId, topicId)`, `ProgressService.getUserProgressSummary(userId)`.
- **Domain Events Emitted:** `TopicCompletedEvent`, `DayCompletedEvent`, `WeekCompletedEvent`, `PhaseCompletedEvent`.

### 2.5 Assessment & Quiz Module (`QuizModule`)
- **Responsibilities:** Server-side question selection (randomized from tagged pools), answer evaluation without exposing answer keys, score calculation, letter grade assignment, attempt history logging.
- **Exported Interface:** `QuizService.generateQuizSession(userId, type, key)`, `QuizService.submitQuizAnswers(userId, submissionDto)`.
- **Domain Events Emitted:** `QuizPassedEvent`, `QuizFailedEvent`.

### 2.6 Notes & Study Links Module (`NotesModule`)
- **Responsibilities:** Markdown note persistence, HTML/script sanitization (DOMPurify/sanitize-html), debounced saves, external ChatGPT URL and PDF/Notion URL management.
- **Exported Interface:** `NotesService.saveDayNote(userId, dayId, content)`, `NotesService.saveExternalLink(userId, dayId, type, url)`.

### 2.7 Streak & Habit Module (`StreakModule`)
- **Responsibilities:** Listens to `TopicCompletedEvent` / `DayCompletedEvent` $\rightarrow$ evaluates learner timezone $\rightarrow$ updates rolling 21-day activity matrix $\rightarrow$ manages monthly streak freezes.
- **Exported Interface:** `StreakService.getUserStreak(userId)`, `StreakService.applyStreakFreeze(userId)`.

### 2.8 Migration Bridge Module (`MigrationModule`)
- **Responsibilities:** Validates incoming browser `localStorage` payloads, maps date-based legacy keys to canonical Day/Topic IDs, atomically inserts user records into the cloud database.
- **Exported Interface:** `MigrationService.importLegacyData(userId, payloadDto)`.
- **Domain Events Emitted:** `MigrationCompletedEvent`.

### 2.9 Administration Module (`AdminModule`)
- **Responsibilities:** Manages curriculum CRUD operations, quiz studio question bank authoring, user search, account role updates, and aggregated platform metrics.
