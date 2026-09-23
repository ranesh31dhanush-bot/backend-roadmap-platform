# MongoDB Data Architecture & Mongoose Schema Specification

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 4 — System Architecture  
**Author:** Winston (BMAD System Architect)  
**Date:** September 21, 2026  
**Status:** Completed Architecture  

---

## 1. Entity-Relationship Overview

```
                      MONGODB DOCUMENT RELATIONSHIPS
  ┌──────────────────┐               ┌────────────────────────┐
  │      User        │ 1           1 │      UserSchedule      │
  │ (Identity/Auth)  ├───────────────┤ (startDate, pausedAt)  │
  └────────┬─────────┘               └────────────────────────┘
           │ 1
           ├─────────────────────────┬────────────────────────┐
           │ 1                       │ 1                      │ 1
           ▼ *                       ▼ *                      ▼ *
  ┌──────────────────┐      ┌──────────────────┐     ┌──────────────────┐
  │  TopicProgress   │      │     DayNote      │     │   ExternalLink   │
  │ (userId, topicId)│      │(userId, dayId)   │     │ (userId, dayId)  │
  └──────────────────┘      └──────────────────┘     └──────────────────┘
           │ 1                       │ 1                      │ 1
           ▼ *                       ▼ *                      ▼ 1
  ┌──────────────────┐      ┌──────────────────┐     ┌──────────────────┐
  │   QuizAttempt    │      │  QuizHighScore   │     │    UserStreak    │
  │(userId, score, Q)│      │(userId, quizKey) │     │(current, rolling)│
  └──────────────────┘      └──────────────────┘     └──────────────────┘
```

---

## 2. Detailed Collection Schemas

### 2.1 Collection: `users`
- **Purpose:** Core user account and identity record.
- **Fields:**
  - `_id`: `ObjectId`
  - `email`: `String` (lowercase, trimmed, unique)
  - `passwordHash`: `String | null` (bcrypt hash, cost factor 12; null if OAuth-only)
  - `name`: `String`
  - `role`: `String` (Enum: `'USER' | 'ADMIN'`, default: `'USER'`)
  - `authProvider`: `String` (Enum: `'LOCAL' | 'GOOGLE'`, default: `'LOCAL'`)
  - `googleId`: `String | null` (sparse index)
  - `avatarUrl`: `String | null`
  - `isMigrated`: `Boolean` (default: `false`)
  - `createdAt`, `updatedAt`: `Date`
- **Indexes:** `{ email: 1 }` (unique), `{ googleId: 1 }` (sparse, unique).

---

### 2.2 Collection: `user_schedules`
- **Purpose:** Learner's personalized 52-week calendar anchor and pause state.
- **Fields:**
  - `_id`: `ObjectId`
  - `userId`: `ObjectId` (Ref: `'User'`, unique)
  - `startDate`: `String` (`YYYY-MM-DD` format)
  - `curDate`: `String` (`YYYY-MM-DD` format)
  - `curPhase`: `Number` (1..5, default: 1)
  - `isPaused`: `Boolean` (default: `false`)
  - `pausedAt`: `String | null` (`YYYY-MM-DD` timestamp when pause activated)
  - `totalPauseDays`: `Number` (default: 0)
  - `createdAt`, `updatedAt`: `Date`
- **Indexes:** `{ userId: 1 }` (unique).

---

### 2.3 Collection: `curriculum_nodes` (Curriculum Days)
- **Purpose:** The canonical 52-week curriculum hierarchy (versioned, published).
- **Fields:**
  - `_id`: `ObjectId`
  - `version`: `String` (e.g., `'1.0.0'`)
  - `canonicalDayId`: `String` (e.g., `'p1-w1-d1'`, unique per version)
  - `phaseNumber`: `Number` (1..5)
  - `phaseName`: `String` (e.g., `'Foundation'`)
  - `phaseColor`: `String` (e.g., `'#00e676'`)
  - `weekNumber`: `Number` (1..52)
  - `weekTitle`: `String`
  - `dayNumberInWeek`: `Number` (1..7)
  - `isRestDay`: `Boolean` (default: `false`)
  - `title`: `String`
  - `description`: `String`
  - `skipDirectives`: `[String]`
  - `salaryMeta`: `{ min: String, mid: String, max: String, roles: [String], note: String }`
  - `subtopics`: `[{ topicId: String, text: String }]`
  - `resources`: `[{ type: String, title: String, url: String }]`
  - `quizBankKey`: `String | null` (mapped topic question bank)
- **Indexes:** `{ version: 1, canonicalDayId: 1 }` (unique), `{ version: 1, weekNumber: 1 }`, `{ version: 1, phaseNumber: 1 }`.

---

### 2.4 Collection: `topic_progress`
- **Purpose:** Granular record of individual completed subtopics.
- **Fields:**
  - `_id`: `ObjectId`
  - `userId`: `ObjectId` (Ref: `'User'`)
  - `topicId`: `String` (canonical topic ID, e.g., `'p1-w1-d1-t1'`)
  - `canonicalDayId`: `String`
  - `phaseNumber`: `Number`
  - `weekNumber`: `Number`
  - `completedAt`: `Date`
- **Indexes:** `{ userId: 1, topicId: 1 }` (unique compound index for idempotent toggling), `{ userId: 1, canonicalDayId: 1 }`, `{ userId: 1, phaseNumber: 1 }`.

---

### 2.5 Collection: `day_notes`
- **Purpose:** Learner's personal markdown notes permanently attached to canonical day.
- **Fields:**
  - `_id`: `ObjectId`
  - `userId`: `ObjectId` (Ref: `'User'`)
  - `canonicalDayId`: `String` (e.g., `'p1-w1-d1'`)
  - `content`: `String` (markdown text, max 50,000 chars)
  - `wordCount`: `Number`
  - `createdAt`, `updatedAt`: `Date`
- **Indexes:** `{ userId: 1, canonicalDayId: 1 }` (unique compound index).

---

### 2.6 Collection: `external_links`
- **Purpose:** Custom ChatGPT conversation links and PDF study notes links.
- **Fields:**
  - `_id`: `ObjectId`
  - `userId`: `ObjectId` (Ref: `'User'`)
  - `canonicalDayId`: `String`
  - `linkType`: `String` (Enum: `'CHATGPT' | 'PDF_NOTES'`)
  - `url`: `String` (validated HTTP/HTTPS URL)
  - `createdAt`, `updatedAt`: `Date`
- **Indexes:** `{ userId: 1, canonicalDayId: 1, linkType: 1 }` (unique compound index).

---

### 2.7 Collection: `quiz_questions` & `quiz_attempts`
- **`quiz_questions` Fields:**
  - `_id`: `ObjectId`
  - `questionId`: `String` (e.g., `'q-eventloop-01'`)
  - `bankSlug`: `String` (e.g., `'Node.js Event Loop'`)
  - `type`: `String` (Enum: `'DAILY' | 'WEEKLY' | 'PHASE'`)
  - `questionText`: `String`
  - `options`: `[String]` (array of 4 text strings)
  - `correctOptionIndex`: `Number` (0..3, NEVER sent to client prior to submission)
  - `explanation`: `String` (pedagogical rationale)
  - `isActive`: `Boolean`
- **`quiz_attempts` Fields:**
  - `_id`: `ObjectId`
  - `userId`: `ObjectId`
  - `quizType`: `String` (`'daily' | 'weekly' | 'phase'`)
  - `quizKey`: `String`
  - `score`: `Number`
  - `total`: `Number`
  - `percentage`: `Number`
  - `grade`: `String`
  - `passed`: `Boolean`
  - `answers`: `[{ questionId: String, selectedIndex: Number, isCorrect: Boolean }]`
  - `completedAt`: `Date`
- **Indexes:** `{ userId: 1, quizType: 1, quizKey: 1 }`, `{ bankSlug: 1, isActive: 1 }`.

---

### 2.8 Collection: `user_streaks`
- **Purpose:** Real-time habit accountability, rolling heatmap, and streak freezes.
- **Fields:**
  - `_id`: `ObjectId`
  - `userId`: `ObjectId` (unique)
  - `currentStreak`: `Number`
  - `longestStreak`: `Number`
  - `lastActiveDate`: `String` (`YYYY-MM-DD`)
  - `rolling21DayHistory`: `[{ date: String, status: String }]`
  - `streakFreezesRemaining`: `Number` (default: 1)
  - `updatedAt`: `Date`
- **Indexes:** `{ userId: 1 }` (unique).
