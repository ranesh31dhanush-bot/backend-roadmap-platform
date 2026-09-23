# Core User Flows & Interaction Specifications

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 3 — UX Design  
**Author:** Sally (BMAD UX Designer)  
**Date:** September 21, 2026  
**Status:** Completed Design  

---

## 1. Overview of Core User Flows

```
  ┌─────────────────────────────────────────────────────────────────────────┐
  │                         CORE USER FLOW CATALOG                          │
  ├──────────────┬──────────────────────────────────────────────────────────┤
  │ FLOW 1       │ New Learner Registration & Onboarding Flow               │
  │ FLOW 2       │ Returning Learner Quick-Re-entry Flow                    │
  │ FLOW 3       │ Daily Learning & Topic Mastery Execution Flow            │
  │ FLOW 4       │ Schedule Reschedule & Date Remapping Flow                │
  │ FLOW 5       │ Course Pause & Resume Execution Flow                     │
  │ FLOW 6       │ Dynamic Assessment (Daily/Weekly/Phase) Quiz Flow        │
  │ FLOW 7       │ Legacy LocalStorage Cloud Migration Bridge Flow          │
  │ FLOW 8       │ Admin Curriculum & Content Publishing Flow               │
  └──────────────┴──────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Flow Specifications

### Flow 1: New Learner Registration & Onboarding

```
 [Landing Page]
       │
       ▼
 [Auth Modal] ──► (Email/Pass or Google OAuth) ──► [Account Created]
                                                           │
                                                           ▼
                                               [Onboarding Modal Displayed]
                                                           │
                                               [Select Start Date (Picker)]
                                                           │
                                                           ▼
                                               [Schedule Preview Bar Graph]
                                               • Total Weeks: 52 (364 Days)
                                               • Calculated Completion Date
                                               • Month-by-Month Phase Track
                                                           │
                                                           ▼
                                               [Click 'Start My Journey']
                                                           │
                                                           ▼
                                               [Route to Phase 1, Wk 1, Day 1]
                                               • Confetti Toast Notification
```

#### Step-by-Step Interaction:
1. **Intake:** Unauthenticated visitor lands on platform $\rightarrow$ clicks "Start Free Roadmap".
2. **Registration:** Enters email & password or selects "Continue with Google".
3. **Trigger:** System detects no `startDate` configured in user record $\rightarrow$ presents `ONBOARD-01` modal overlay (background dimmed).
4. **Interaction:** User sees 5-phase summary badges $\rightarrow$ picks a start date (defaults to today) $\rightarrow$ the `.ob-prev` schedule preview expands automatically with animation.
5. **Validation:** System validates date format $\rightarrow$ computes end date ($\text{Start} + 363\text{ days}$) $\rightarrow$ renders horizontal month distribution bars.
6. **Commitment:** User clicks `🚀 Start My Journey` $\rightarrow$ button shows subtle loading spinner $\rightarrow$ modal smoothly fades out $\rightarrow$ workspace loads Phase 1, Week 1, Day 1 $\rightarrow$ toast displays: *"Journey started! Target completion: [Date]"*.

---

### Flow 2: Returning Learner Quick Re-Entry

```
 [User Navigates to Platform]
       │
       ▼
 [Auto-Authentication Check (Session Cookie)]
       │
       ├─────────────────────────────────┐
       ▼                                 ▼
 [Authenticated]                 [Session Expired]
       │                                 │
       ▼                                 ▼
 [Snaps to Today's Day]          [Quick Login Prompt] ──► [Snaps to Today's Day]
       │
       ▼
 [Loads Checklists, Notes & Timer State in < 200ms]
```

#### Step-by-Step Interaction:
1. **Launch:** Learner opens browser $\rightarrow$ navigates to app URL.
2. **Resolution:** Service resolves session token $\rightarrow$ checks `curDate` or evaluates `todayStr()`.
3. **Render:** Loads active day workspace immediately with optimistic cached data $\rightarrow$ fetches any background cloud updates.
4. **Zero-Click Productivity:** Learner is immediately positioned in front of their current subtopic checklist without navigating multi-level menus.

---

### Flow 3: Daily Learning & Topic Mastery Execution

```
 [Day Workspace Rendered]
       │
       ▼
 [Review Skip Directives] ──► "Do NOT waste time on X..."
       │
       ▼
 [Start Focus Pomodoro Timer] ──► 25:00 Countdown in Header & Canvas
       │
       ▼
 [Study Curated Resources] ──► Opens YouTube / Docs in new tab
       │
       ▼
 [Toggle Subtopic Checkboxes]
       │
       ├─► (Optimistic UI: instant green fill & strikethrough)
       └─► (Background Cloud Sync: updates topic completion)
       │
       ▼
 [Write Personal Learnings in Notes Area] ──► Auto-saves after 1.2s idle
       │
       ▼
 [Launch Daily Quiz (5Q)] ──► Completes Assessment
       │
       ▼
 [Day Marked Complete (All Topics Ticked)]
       │
       ├─► Day Card turns Green (`done`)
       ├─► Week Progress increments
       └─► Streak Counter increments + 1🔥
```

---

### Flow 4: Schedule Reschedule & Date Remapping

```
 [Learner Clicks '📅 Reschedule']
       │
       ▼
 [Reschedule Modal (SCHED-01) Opens]
       │
       ▼
 [Safety Assurance Banner Displayed]
 "⚠️ Only dates change — all completed topics, notes, and quiz scores stay intact."
       │
       ▼
 [Pick New Start Date] ──► [Preview New Schedule Timeline]
       │
       ▼
 [Click 'Apply New Schedule →']
       │
       ▼
 [Cloud Sync: Dates Remapped] ──► [Workspace Reloaded with Preserved Checkmarks]
```

#### Edge-Case Safety Guarantee:
- Because notes and topics are linked to **Canonical Day IDs** (e.g., `p1-w1-d1`) rather than literal dates, moving the start date from Sept 1 to Oct 15 simply updates the calendar display projection; all notes, checkboxes, and quiz scores remain permanently bound to their proper topics.

---

### Flow 5: Course Pause & Resume Execution

```
                       PAUSE / RESUME LIFECYCLE
  ┌───────────────────────────┐           ┌───────────────────────────┐
  │      1. ACTIVE STATE      │           │      2. PAUSED STATE      │
  │ • Normal calendar flow    │ ──Pause──►│ • Persistent ⏸ PAUSED chip│
  │ • Daily streak active     │           │ • Dates frozen            │
  └───────────────────────────┘           └─────────────┬─────────────┘
                                                        │
                                                      Resume
                                                        │
                                                        ▼
                                          ┌───────────────────────────┐
                                          │     3. RESUMED STATE      │
                                          │ • Compute Pause Delta     │
                                          │ • Shift startDate by N d  │
                                          │ • Remap future calendar   │
                                          └───────────────────────────┘
```

#### Step-by-Step Interaction:
1. **Pause Trigger:** Learner clicks `⏸ Pause` in header $\rightarrow$ modal displays: *"Life happens. Pause the course and all future dates will shift forward when you resume."*
2. **Confirmation:** Learner clicks `⏸ Pause Course` $\rightarrow$ cloud records `pausedAt = todayStr()` $\rightarrow$ header shows animated `⏸ PAUSED` amber chip $\rightarrow$ button text swaps to `▶ Resume`.
3. **Resumption:** Learner returns 18 days later $\rightarrow$ clicks `▶ Resume` $\rightarrow$ modal calculates: *"Paused for 18 days. Resuming will shift your target completion date to [New Date]"*.
4. **Execution:** Learner clicks `▶ Resume Course` $\rightarrow$ system increments `startDate` by 18 days $\rightarrow$ clears pause state $\rightarrow$ toast confirms: *"▶ Resumed! Schedule shifted by 18 days. New end: [Date]"*.

---

### Flow 6: Dynamic Assessment & Quiz Engine Flow

```
 [Click '🧪 Take Today's Quiz' or '📝 Week Test' or '🎯 Phase Exam']
       │
       ▼
 [Quiz Modal Opens (QUIZ-01)]
 • Progress Bar (Question 1 of N)
 • Question Text (JetBrains Mono / Inter)
 • 4 Multiple-Choice Option Buttons
       │
       ▼
 [Learner Clicks Option]
       │
       ▼
 [Server Evaluation & Instant Feedback]
 • Selected option locks
 • If Correct: Option turns Green ✅
 • If Wrong: Selected turns Red ❌ AND Correct turns Green ✅
 • Pedagogical Explanation (exp) container expands below
 • 'Next Question →' button becomes visible
       │
       ▼
 [Learner Clicks 'Next Question →' (Repeats for all Qs)]
       │
       ▼
 [Results Screen Displayed (QUIZ-02)]
 • Big Percentage Score (e.g., 80%) & Letter Grade
 • Metric Breakdown: Correct (4) | Wrong (1) | Total (5)
 • Actionable Guidance: "Strong Pass ✅" or "Below 75% — Revisit Topics"
 • Actions: [↺ Retry Quiz] or [Continue Learning →]
```

---

### Flow 7: Legacy LocalStorage Cloud Migration Bridge

```
 [Existing User Logs In on Browser with Prior LocalStorage Data]
       │
       ▼
 [System Detects LocalStorage Keys: done, notes, qscores, startDate]
       │
       ▼
 [Migration Modal Displayed (MIGRATE-01)]
 • "We found your existing roadmap progress in this browser!"
 • Summary Preview: 42 Topics Completed | 12 Notes Saved | 3 Quizzes
       │
       ├─────────────────────────────────┐
       ▼                                 ▼
 [Click 'Import to Cloud Account'] [Click 'Skip / Start Fresh']
       │                                 │
       ▼                                 ▼
 [Progress Spinner (Importing...)]  [Discard Legacy Data]
       │
       ▼
 [Cloud Conversion & Database Save]
       │
       ▼
 [Success Screen: 'Migration Complete!']
 • Clears legacy browser localStorage
 • Dashboard reloads with all imported history
```

---

### Flow 8: Administrator Curriculum & Content Publishing

```
 [Admin Logs Into Admin Portal]
       │
       ▼
 [Curriculum Tree Manager (ADMIN-02)]
 • Expand Phase 1 ──► Week 2 ──► Day 3
       │
       ▼
 [Select Topic or Resource to Edit]
 • Edit Title, Resource URL, Skip Directives
 • Edit/Add Quiz Questions & Explanations in Quiz Studio
       │
       ▼
 [Toggle 'Save as Draft' vs. 'Publish Changes']
       │
       ▼
 [Audit Log Recorded & Live Curriculum Synchronized]
```
