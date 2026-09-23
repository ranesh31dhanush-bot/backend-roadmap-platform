# Screen Wireframes & UI Layout Specifications

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 3 — UX Design  
**Author:** Sally (BMAD UX Designer)  
**Date:** September 21, 2026  
**Status:** Completed Design  

---

## 1. Master Screen Inventory (20 Screens)

```
  ┌─────────────────────────────────────────────────────────────────────────┐
  │                         MASTER SCREEN INVENTORY                         │
  ├──────────┬────────────────────────────┬──────────┬──────────────────────┤
  │ SCR-01   │ User Login Screen          │ SCR-11   │ Course Pause Modal   │
  │ SCR-02   │ User Registration Screen   │ SCR-12   │ Progress Rollup View │
  │ SCR-03   │ Onboarding Start Date Modal│ SCR-13   │ Learner Analytics    │
  │ SCR-04   │ Learner Dashboard          │ SCR-14   │ Capstone Projects Hub│
  │ SCR-05   │ 52-Week Roadmap Explorer   │ SCR-15   │ Profile & Settings   │
  │ SCR-06   │ Daily Learning Workspace   │ SCR-16   │ Migration Bridge     │
  │ SCR-07   │ Interactive Quiz Modal     │ SCR-17   │ Admin Dashboard      │
  │ SCR-08   │ Quiz Results & Diagnostics │ SCR-18   │ Admin Curriculum CRUD│
  │ SCR-09   │ Markdown Notes & Links View│ SCR-19   │ Admin Quiz Studio    │
  │ SCR-10   │ Schedule Reschedule Modal  │ SCR-20   │ Admin User Directory │
  └──────────┴────────────────────────────┴──────────┴──────────────────────┘
```

---

## 2. Low-to-Mid Fidelity Wireframe Specifications

### Screen 01: User Login (`SCR-01`)
- **Purpose:** Secure authentication for returning learners.
- **Primary User:** Learner / Admin.
- **Layout Wireframe:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                       ┌─────────────────────────┐                       │
│                       │   [T1%] Backend Roadmap │                       │
│                       │                         │                       │
│                       │  Welcome back, engineer │                       │
│                       │                         │                       │
│                       │  [ G  Continue with Google ]                    │
│                       │                                                 │
│                       │  ────────── or ─────────                        │
│                       │                                                 │
│                       │  Email Address:                                 │
│                       │  [ user@domain.com    ]                         │
│                       │                                                 │
│                       │  Password:           [Forgot?]                  │
│                       │  [ ••••••••••••••••   ]                         │
│                       │                                                 │
│                       │  [ 🚀 Log In to Roadmap ]                       │
│                       │                                                 │
│                       │  Don't have an account? [Sign Up]               │
│                       └─────────────────────────┘                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```
- **Primary CTA:** `[ 🚀 Log In to Roadmap ]`
- **Secondary Actions:** `Continue with Google`, `Forgot Password`, `Sign Up`.

---

### Screen 03: Onboarding Start Date Selector (`SCR-03`)
- **Purpose:** Set journey start date and project full 12-month schedule.
- **Primary User:** Newly registered learner.
- **Layout Wireframe:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [ONBOARDING MODAL OVERLAY]                                              │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ ● TOP 1% BACKEND ROADMAP                                            │ │
│ │ Set your start date                                                 │ │
│ │ Pick a date and see your complete 52-week schedule & monthly plan.  │ │
│ │                                                                     │ │
│ │ ┌─────────┬─────────┬─────────┬─────────┬─────────┐                 │ │
│ │ │ 1️⃣ Found │ 2️⃣ Core │ 3️⃣ Prod │ 4️⃣ Adv  │ 5️⃣ Top1%│                 │ │
│ │ │ 6 wks   │ 12 wks  │ 10 wks  │ 14 wks  │ 10 wks  │                 │ │
│ │ └─────────┴─────────┴─────────┴─────────┴─────────┘                 │ │
│ │                                                                     │ │
│ │ Start Date:                                                         │ │
│ │ [ 2026-09-21 📅                                                   ] │ │
│ │                                                                     │ │
│ │ ┌── SCHEDULE PREVIEW ─────────────────────────────────────────────┐ │ │
│ │ │ START: 21 Sep 2026   END: 20 Sep 2027   TOTAL: 1.0 yrs          │ │ │
│ │ ├─────────────────────────────────────────────────────────────────┤ │ │
│ │ │ Sep 2026  [████████ Foundation                    ] 10d         │ │ │
│ │ │ Oct 2026  [██████████████████████ Foundation      ] 31d         │ │ │
│ │ │ Nov 2026  [██████████████████████ Core Backend    ] 30d         │ │ │
│ │ └─────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                     │ │
│ │ [ 🚀 Start My Journey ]                                             │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```
- **Primary CTA:** `[ 🚀 Start My Journey ]`

---

### Screen 04: Learner Dashboard (`SCR-04`)
- **Purpose:** Central mission control answering "Where am I?" and "What should I do next?"
- **Primary User:** Learner.
- **Layout Wireframe:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [T1%] Backend Roadmap  | Done: 42  | 5%  | 14🔥 | 322d left | [Pause] [Today] [Avatar]│
├───────────────────┬─────────────────────────────────────────────────────┤
│ ── PROGRESS ───── │ ── TODAY'S MISSION ──────────────────────────────── │
│ [ 5% Complete   ] │ Phase 1 · Week 2 · Day 3                            │
│ 42/813 Topics     │ TCP/IP & HTTP/HTTPS Request-Response Cycle          │
│ Streak: 14🔥      │ [ ● Today ]  [ ⏱ 25:00 Focus Timer ]                │
│                   │                                                     │
│ ── CURRICULUM ─── │ [ ▶ Continue Today's Study ]                        │
│ ► P1: Foundation  │                                                     │
│   W1: Node.js (✓) │ ── WEEKLY CALENDAR ──────────────────────────────── │
│   W2: TCP/IP  (•) │ [Mon 21] [Tue 22] [Wed 23*] [Thu 24] [Fri 25] [Sat] │
│   W3: HTTP Server │  Done     Done     Today     Next     Next   Rest   │
│ ► P2: Core Skills │                                                     │
│ ► P3: Production  │ ── RECENT PERFORMANCE ───────────────────────────── │
│ ► P4: Advanced    │ • Daily Quiz: Event Loop ───── 100% 🏆              │
│ ► P5: Top 1%      │ • Daily Quiz: Streams ──────── 80% ✅               │
│                   │                                                     │
│ ── STREAK (21D) ─ │ ── PHASE MILESTONE ──────────────────────────────── │
│ [■■■■■■■■■■■■■■□] │ Phase 1: Foundation (Weeks 1-6)                     │
│ 14-Day Streak     │ Target Milestone: ₹3-8 LPA Entry-Level Backend Role │
└───────────────────┴─────────────────────────────────────────────────────┘
```

---

### Screen 06: Daily Learning Workspace (`SCR-06`) — Master Screen
- **Purpose:** Primary day-by-day learning canvas with interactive checklists, skip guidance, resources, notes, and quiz triggers.
- **Primary User:** Learner.
- **Layout Wireframe:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [T1%] Backend Roadmap  | Done: 44  | 5%  | 14🔥 | 322d left | [Pause] [Today] [Avatar]│
├───────────────────┬─────────────────────────────────────────────────────┤
│ ◄ Phase 1 (W1-6)  │ [Phase 1 · Week 2] [● Today]         [← Prev] [Next →]│
│ • Progress: 44/147│ Node.js Event Loop & V8 Internals                   │
│ • Weeks:          │ Wednesday, 23 September 2026                        │
│   W1: Internals ✓ │ ┌─────────────────────────────────────────────────┐ │
│   W2: Protocols • │ │ Understand what makes Node.js fast and non-     │ │
│   W3: Raw HTTP    │ │ blocking. This mental model will serve forever. │ │
│                   │ └─────────────────────────────────────────────────┘ │
│ ── STREAK (21D) ─ │ ── STATS STRIP ──────────────────────────────────── │
│ [■■■■■■■■■■■■■■□] │ [Today: 3/5] [Total: 44/813] [Streak: 14🔥] [5%]   │
│                   │                                                     │
│ ── QUIZ HISTORY ─ │ ── ✕ SKIP: DO NOT WASTE TIME ON ─────────────────── │
│ • Event Loop: 80% │ ✕ Watching 10hr YouTube "full course" videos        │
│ • HTTP: 100%      │ ✕ Memorizing syntax before building anything real   │
│                   │                                                     │
│ [🧪 Today's Quiz] │ ── TOPICS (3/5) ─────────────────────────────────── │
│                   │ [✓] 1. Event loop phases (timers, I/O, poll, check) │
│                   │ [✓] 2. Call stack vs callback vs microtask queue    │
│                   │ [✓] 3. libuv — what it does under the hood          │
│                   │ [ ] 4. process.nextTick() vs setImmediate()         │
│                   │ [ ] 5. Why Node.js is single-threaded               │
│                   │                                                     │
│                   │ ── CURATED RESOURCES ────────────────────────────── │
│                   │ ┌──────────────────────┐ ┌────────────────────────┐ │
│                   │ │ ▶ YouTube            │ │ 📄 Article             │ │
│                   │ │ Node.js Event Loop   │ │ Node.js Official Docs  │ │
│                   │ └──────────────────────┘ └────────────────────────┘ │
│                   │                                                     │
│                   │ ── ASSESSMENTS ──────────────────────────────────── │
│                   │ [ 🧪 Daily Quiz (5Q) ] [ 📝 Week Test (10Q) ]       │
│                   │                                                     │
│                   │ ── FOCUS TIMER ──────────────────────────────────── │
│                   │ [ 25:00 Pomodoro ]  [25m] [5m] [15m] [▶ Start] [↺]  │
│                   │                                                     │
│                   │ ── EXTERNAL LINKS ───────────────────────────────── │
│                   │ [ 💬 Open ChatGPT Chat for this topic ]      [Edit] │
│                   │ [ 📄 Open PDF Study Notes for this topic ]   [Edit] │
│                   │                                                     │
│                   │ ── PERSONAL NOTES ───────────────────────────────── │
│                   │ [ // Key insights from today's code...            ] │
│                   │ [ // Ctrl+S to save                               ] │
│                   │ [ 💾 Save Note ]   (Note saved ✓)                   │
└───────────────────┴─────────────────────────────────────────────────────┘
```

---

### Screen 07: Interactive Quiz Modal (`SCR-07`)
- **Purpose:** Server-evaluated active retrieval quiz test.
- **Primary User:** Learner.
- **Layout Wireframe:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [QUIZ MODAL OVERLAY]                                                    │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Daily Quiz — Node.js Event Loop Internals                 [✕ Close] │ │
│ ├─────────────────────────────────────────────────────────────────────┤ │
│ │ [██████████████████████░░░░░░░░░░░░░░░░░░░░░░░░] Question 3 of 5    │ │
│ │                                                                     │ │
│ │ What happens when process.nextTick() is called inside a callback?   │ │
│ │                                                                     │ │
│ │ (A) It runs in the next timer phase after setTimeout                │ │
│ │ (B) It executes immediately after current operation, before queue ✅│ │
│ │ (C) It delegates the task to the libuv thread pool                  │ │
│ │ (D) It blocks the event loop indefinitely                           │ │
│ │                                                                     │ │
│ │ ┌── PEDAGOGICAL EXPLANATION ──────────────────────────────────────┐ │ │
│ │ │ ✅ Correct!                                                      │ │ │
│ │ │ process.nextTick() queues a microtask that is processed         │ │ │
│ │ │ immediately after the current operation finishes, before the   │ │ │
│ │ │ event loop continues to the next phase.                         │ │ │
│ │ └─────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                     │ │
│ │ [ Next Question → ]                                                 │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Screen 08: Quiz Results Diagnostic Screen (`SCR-08`)
- **Purpose:** Score summary, letter grade, and mastery recommendations.
- **Primary User:** Learner.
- **Layout Wireframe:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [QUIZ RESULTS OVERLAY]                                                  │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Daily Quiz Results — Node.js Event Loop                   [✕ Close] │ │
│ ├─────────────────────────────────────────────────────────────────────┤ │
│ │                                                                     │ │
│ │                              80%                                    │ │
│ │                       Strong Pass ✅                                │ │
│ │                                                                     │ │
│ │          ┌──────────────┬──────────────┬──────────────┐             │ │
│ │          │      4       │      1       │      5       │             │ │
│ │          │   Correct    │    Wrong     │    Total     │             │ │
│ │          └──────────────┴──────────────┴──────────────┘             │ │
│ │                                                                     │ │
│ │  💡 Outstanding work on Event Loop phases. Review microtask queues  │ │
│ │     before advancing to Streams.                                    │ │
│ │                                                                     │ │
│ │                  [ ↺ Retry Quiz ]   [ Continue Learning → ]         │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Screen 11: Course Pause / Resume Modal (`SCR-11`)
- **Purpose:** Manage life disruption pauses and schedule resumption.
- **Primary User:** Learner.
- **Layout Wireframe:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [PAUSE / RESUME MODAL]                                                  │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ ⏸ Pause Your Journey                                     [✕ Close] │ │
│ ├─────────────────────────────────────────────────────────────────────┤ │
│ │ Life happens. Pause the course and all future dates will shift      │ │
│ │ forward when you resume — keeping your calendar 100% accurate.      │ │
│ │                                                                     │ │
│ │ ┌── HOW IT WORKS ─────────────────────────────────────────────────┐ │ │
│ │ │ When you resume, your start date shifts by the number of days   │ │ │
│ │ │ you were paused. All progress, notes, and quiz scores remain    │ │ │
│ │ │ completely preserved.                                           │ │ │
│ │ └─────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                     │ │
│ │ [ Cancel ]                                     [ ⏸ Pause Course ]   │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Screen 16: Legacy LocalStorage Migration Modal (`SCR-16`)
- **Purpose:** 1-click cloud sync of existing browser progress.
- **Primary User:** Existing learner logging in for the first time.
- **Layout Wireframe:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [MIGRATION BRIDGE OVERLAY]                                              │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 📦 Existing Roadmap Progress Detected!                              │ │
│ ├─────────────────────────────────────────────────────────────────────┤ │
│ │ We found learning progress saved in this browser:                   │ │
│ │                                                                     │ │
│ │ • 42 Completed Topics across Phase 1 & 2                            │ │
│ │ • 14 Days of Saved Markdown Notes                                   │ │
│ │ • 8 Quiz Scores and Streak History                                  │ │
│ │ • Start Date: 01 Sep 2026                                           │ │
│ │                                                                     │ │
│ │ Import this data to your cloud account to sync across all devices?  │ │
│ │                                                                     │ │
│ │ [ Discard & Start Fresh ]              [ 🚀 Import to My Account ]  │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Screen 18: Admin Curriculum Editor (`SCR-18`)
- **Purpose:** Author and curate phases, weeks, days, topics, and resources.
- **Primary User:** Administrator.
- **Layout Wireframe:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [ADMIN] T1% Platform  | Curriculum | Resources | Quizzes | Users | [Live]│
├─────────────────────┬───────────────────────────────────────────────────┤
│ ── CURRICULUM TREE ─│ ── EDITING: Phase 1 > Week 2 > Day 3 ──────────── │
│ ▼ Phase 1: Found.   │ Day Title:                                        │
│   ► Week 1          │ [ Node.js Event Loop & V8 Internals             ] │
│   ▼ Week 2          │                                                   │
│     • Day 1: TCP/IP │ Context Summary:                                  │
│     • Day 2: HTTP   │ [ Understand what makes Node.js fast...         ] │
│     • Day 3: Loop * │                                                   │
│     • Day 4: Stream │ Skip Directives (1 per line):                     │
│     • Day 7: Rest   │ [ Watching 10hr YouTube videos passively        ] │
│   ► Week 3          │ [ Memorizing syntax without code                ] │
│ ► Phase 2: Core     │                                                   │
│ ► Phase 3: Prod     │ Topics Checklist:                                 │
│ ► Phase 4: Advanced │ 1. [ Event loop phases (timers, poll, close)    ] │
│ ► Phase 5: Top 1%   │ 2. [ Call stack vs callback queue vs microtasks ] │
│                     │ [+ Add Subtopic]                                  │
│ [+ Add New Week]    │                                                   │
│                     │ [ Discard Changes ]   [ Save Draft ]   [ Publish ]│
└─────────────────────┴───────────────────────────────────────────────────┘
```
