# Sprint 5 — Zero-Knowledge Quizzes & Assessment Engine Completion Report

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 6 — BMAD Development  
**Sprint:** Sprint 5 (Zero-Knowledge Quizzes & Assessment Engine)  
**Role:** BMAD Developer  
**Date:** September 22, 2026  
**Status:** **COMPLETE**

---

## 1. Executive Summary

Sprint 5 delivers the zero-knowledge assessment engine, timed runner modal, and server-side grading pipeline for the Top 1% Backend Roadmap Platform.

All 6 Sprint 5 user stories (`QUIZ-001`, `QUIZ-002`, `QUIZ-003`, `QUIZ-004`, `QUIZ-005`, `QUIZ-006`) have been fully implemented, tested, and verified with zero architectural drift. The assessment engine enforces strict **Zero-Knowledge Delivery**: the browser receives only question text and option labels, while correct answers, answer keys, and explanations remain solely on the server until submission. Grading executes server-side, enforcing the approved $\ge 75\%$ accuracy threshold for mastery, persisting immutable attempt ledgers, maintaining learner high scores, and unlocking Phase Certification badges.

---

## 2. Story Registry & Status

| Story ID | Epic | Title | Status | Primary Layer |
| :--- | :--- | :--- | :--- | :--- |
| **QUIZ-001** | Quizzes | Quiz Bank & Question Collection Schemas (`quiz_banks`, `quiz_questions`, `quiz_attempts`, `quiz_high_scores`) | **COMPLETE** | Database & Seeders |
| **QUIZ-002** | Quizzes | Zero-Knowledge Question Delivery API (`POST /api/v1/quizzes/:id/start`) | **COMPLETE** | Backend Engine |
| **QUIZ-003** | Quizzes | Server-Side Quiz Grading, Scoring & Attempt API (`POST /api/v1/quizzes/:id/submit`) | **COMPLETE** | Backend Engine |
| **QUIZ-004** | Quizzes | Daily & Weekly Quiz Runner Modal & Timer UI (`QuizRunnerModal.tsx`) | **COMPLETE** | Frontend UI |
| **QUIZ-005** | Quizzes | Quiz Results View, Explanations & High-Score Ledger (`QuizResultsCard.tsx`) | **COMPLETE** | Frontend UI |
| **QUIZ-006** | Quizzes | Phase Exam Gating Logic & High-Score Persistence | **COMPLETE** | Full-Stack Certification |

---

## 3. Zero-Knowledge Assessment Architecture

### Zero-Knowledge Delivery Flow
To eliminate client-side cheating, inspect-element extraction, or reverse-engineering from serialized payloads:

```text
               ZERO-KNOWLEDGE ASSESSMENT PIPELINE
┌──────────────┐                                      ┌──────────────┐
│   BROWSER    │                                      │    SERVER    │
└──────┬───────┘                                      └──────┬───────┘
       │ 1. POST /api/v1/quizzes/:bankId/start               │
       ├────────────────────────────────────────────────────►│
       │                                                     │ ──► Resolves Question Bank
       │                                                     │ ──► Initializes QuizAttempt (in_progress)
       │                                                     │ ──► STRIPS correctOptionIndex
       │                                                     │ ──► STRIPS explanation
       │ 2. Returns QuizQuestionClientDTO (NO ANSWERS)       │
       │◄────────────────────────────────────────────────────┤
       │                                                     │
       │ [Learner answers in timed QuizRunnerModal]          │
       │                                                     │
       │ 3. POST /api/v1/quizzes/:bankId/submit              │
       │    (attemptId, selectedOptionIndices)               │
       ├────────────────────────────────────────────────────►│
       │                                                     │ ──► Verifies attempt ownership
       │                                                     │ ──► Loads server-side truth from DB
       │                                                     │ ──► Evaluates accuracy score
       │                                                     │ ──► Checks >= 75% Mastery threshold
       │                                                     │ ──► Persists attempt (submitted)
       │                                                     │ ──► Updates QuizHighScore ($max)
       │                                                     │ ──► Unlocks user badge if phase exam
       │ 4. Returns QuizResultDTO (Score + Explanations)     │
       │◄────────────────────────────────────────────────────┤
```

### Private vs Public Model Separation
- **Public DTO (`QuizQuestionClientDTO`):** `{ id, questionText, options }` (Safe for untrusted browser execution).
- **Private Database Entity (`QuizQuestion`):** `{ correctOptionIndex, explanation, difficulty, order }` (Restricted to server-side memory).

---

## 4. Assessment Models & Database Architecture

1. **`quiz_banks` Collection (`QuizBankModel`):**
   - Fields: `slug`, `title`, `description`, `tier` (`daily`, `weekly`, `phase_exam`), `canonicalId`, `phaseNumber`, `durationMinutes`, `passThresholdPercentage` (75%), `isActive`.
   - Indexes: `{ slug: 1 }` (unique), `{ canonicalId: 1 }`, `{ phaseNumber: 1 }`.
2. **`quiz_questions` Collection (`QuizQuestionModel`):**
   - Fields: `quizBankId`, `canonicalId`, `questionText`, `options` (array of strings), `correctOptionIndex`, `explanation`, `difficulty`, `order`.
   - Index: `{ quizBankId: 1, order: 1 }`.
3. **`quiz_attempts` Collection (`QuizAttemptModel`):**
   - Fields: `userId`, `quizBankId`, `canonicalId`, `status` (`in_progress`, `submitted`, `expired`), `startedAt`, `submittedAt`, `timeSpentSeconds`, `scorePercentage`, `passed`, `totalQuestions`, `correctAnswersCount`, `answers` array.
   - Index: `{ userId: 1, quizBankId: 1, createdAt: -1 }`.
4. **`quiz_high_scores` Collection (`QuizHighScoreModel`):**
   - Fields: `userId`, `quizBankId`, `canonicalId`, `highScorePercentage`, `passed`, `attemptsCount`, `lastAttemptAt`.
   - Unique Compound Index: `{ userId: 1, quizBankId: 1 }`.

---

## 5. Scoring, Mastery & Phase Certification Engine

### Mastery Threshold ($\ge 75\%$)
- Score calculation: $\text{Score} = \text{round}\left(\frac{\text{Correct Answers}}{\text{Total Questions}} \times 100\right)$
- Mastery Pass criteria: $\text{Score} \ge 75\%$
  - $80\%$ (4/5) $\rightarrow$ **MASTERED (Pass)**
  - $75\%$ (3/4) $\rightarrow$ **MASTERED (Pass)**
  - $60\%$ (3/5) $\rightarrow$ **NOT MASTERED (Needs Review)**

### High-Score Preservation ($max)
- Subsequent retakes update `quiz_high_scores` using `$max: { highScorePercentage: scorePercentage }` and `$inc: { attemptsCount: 1 }`, ensuring that a lower subsequent score never degrades the learner's best record.

### Phase Certification Exam Gating (`phase-1`)
- When a learner achieves $\ge 75\%$ on a Phase Certification Exam (15 comprehensive architectural questions), the server automatically awards the certification badge (e.g. `phase-1-mastery`) to `users.badges`.

---

## 6. Frontend Quiz Experience (`QuizRunnerModal.tsx`)

- **Interactive Timed Runner Modal:**
  - Active countdown timer with color warnings (`< 2 mins` warning pulse) and automated submission upon timer expiry (`00:00`).
  - Question index pills allowing random jumping across questions with answered state tracking.
  - Keyboard shortcuts (`1`–`4` or `A`–`D`) for rapid option selection.
- **Comprehensive Results Card (`QuizResultsCard.tsx`):**
  - Displays percentage score, Pass/Fail badge, stats summary (correct count, time spent), personal best high score, and badge unlock notice.
  - Question-by-question review accordion (`ExplanationAccordion.tsx`) showing selected choice, correct answer, and in-depth explanation.
  - 1-click "Retake Quiz" and "Done & Return to Workspace" actions.
- **Workspace & Curriculum Integration:**
  - Integrated "🧠 Daily Quiz" launcher inside the Daily Workspace (`/workspace`).
  - Integrated "🎖️ Phase Exam" launcher inside Phase headers on the Interactive Roadmap (`/curriculum`).

---

## 7. Zero-Knowledge Security Verification

- **Automated Response Payload Scanning:** Integration tests explicitly JSON-serialize HTTP responses from `POST /api/v1/quizzes/:id/start` and verify that `correctOptionIndex`, `explanation`, `answerKey`, and `isCorrect` are **100% absent**.
- **Client Storage Audit:** Verified that no answer keys or explanations are stored in `localStorage`, `sessionStorage`, `cookies`, `URL parameters`, or client-side React state prior to submission.
- **Learner Isolation & Tampering Defense:** Verified that Learner B cannot view, retrieve, or submit Learner A's quiz attempts (404 Unauthorized / Not Found).
- **Submission Idempotency:** Duplicate submissions on the same attempt are rejected with `409 Conflict`.
- **CSRF & Authentication:** All quiz mutating endpoints require valid double-submit CSRF tokens and HttpOnly session cookies.

---

## 8. Verification & Automated Test Results

```text
==================================================
              TEST SUITE SUMMARY
==================================================
Backend Unit Tests:          31/31 PASS
  - AppError Unit:            7/7  PASS
  - Environment Unit:         1/1  PASS
  - JWT Tokens Unit:          3/3  PASS
  - Crypto/Bcrypt Unit:       3/3  PASS
  - Curriculum Seed Unit:     4/4  PASS
  - Schedule Utils Unit:      3/3  PASS
  - Progress Ledger Unit:     5/5  PASS
  - Quiz Grading Unit:        5/5  PASS (Sprint 5)
Backend Integration Tests:   56/56 PASS
  - Health Probes:            4/4  PASS
  - Authentication API:      10/10 PASS (Sprint 1 Regression)
  - Curriculum Read API:      6/6  PASS (Sprint 2 Regression)
  - Onboarding Engine API:    7/7  PASS (Sprint 2 Regression)
  - Schedule & Roadmap API:   7/7  PASS (Sprint 3 Regression)
  - Progress Ledger API:      8/8  PASS (Sprint 4 Regression)
  - Quiz & Exam API:         11/11 PASS (Sprint 5)
  - Curriculum Seeding:       3/3  PASS
Frontend Unit Tests:         15/15 PASS
  - Auth Store:               2/2  PASS
  - Onboarding Store:         2/2  PASS
  - Schedule Math:            2/2  PASS
  - Progress Ledger Math:     4/4  PASS
  - Quiz & Timer Math:        4/4  PASS (Sprint 5)
  - Baseline Setup:           1/1  PASS
--------------------------------------------------
TOTAL AUTOMATED TESTS:       102/102 PASS (100%)
==================================================
```

### Monorepo Typecheck & Production Build
- `npm run typecheck`: **PASS** (0 errors across `@top1/shared`, `@top1/backend`, `@top1/frontend`).
- `npm run build`: **PASS** (Next.js 15 production build compiled successfully with `/workspace`, `/curriculum`, `/dashboard`, `/onboarding`, `/login`, `/register`).

---

## 9. Sprint Boundary & Scope Discipline

Sprint 5 strictly maintained boundaries:
- ❌ NO markdown notes editor or autosave endpoints (Sprint 6).
- ❌ NO streaks, Pomodoro timers, 21-Day Habit Matrix, or monthly streak freeze (Sprint 7).
- ❌ NO AI tutor, AI question generation, or LLM-assisted explanations.
- ❌ NO Redis or BullMQ infrastructure introduced.
- ❌ NO admin quiz authoring interface or CSV uploaders.

---

## 10. Sprint 6 Readiness

- **Status:** **READY FOR SPRINT 6**
- **Foundation Available for Sprint 6:**
  - Full Zero-Knowledge Assessment Engine and timed Quiz Runner operational.
  - Daily Learning Workspace (`/workspace`) ready for Markdown Notes editor (`NOTE-001` .. `NOTE-004`) with optimistic concurrency locks in Sprint 6.
