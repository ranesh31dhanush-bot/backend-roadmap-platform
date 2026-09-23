# Information Architecture & Navigation Specification

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 3 — UX Design  
**Author:** Sally (BMAD UX Designer)  
**Date:** September 21, 2026  
**Status:** Completed Design  

---

## 1. UX Philosophy & Architectural Principles

The Information Architecture (IA) is designed specifically for an **intensive, focused engineering learning environment**. It prioritizes:
1. **Zero Distraction & Cognitive Clarity:** The interface minimizes peripheral clutter, ensuring the learner's attention is 100% focused on today's study execution.
2. **Instant Re-Entry:** A returning learner can resume their exact active topic within a single click or keyboard shortcut.
3. **Transparent Hierarchy:** The learner always understands their exact coordinates within the 52-week curriculum: `Phase` $\rightarrow$ `Week` $\rightarrow$ `Day` $\rightarrow$ `Subtopic`.

```
                        PLATFORM INFORMATION TOPOLOGY
  ┌────────────────────────────────────────────────────────────────────────┐
  │                               APP SHELL                                │
  ├────────────────────────────────────┬───────────────────────────────────┤
  │       GLOBAL TOP NAVIGATION        │ Telemetry, Streaks, Pause, Quick  │
  │                                    │ Actions (Reschedule, Quiz, Profile│
  ├─────────────────┬──────────────────┴───────────────────────────────────┤
  │ PRIMARY SIDEBAR │ WORKSPACE CANVAS (CENTRAL)                           │
  │ • Progress Dial │ • Active Day Metadata & Skip Directives              │
  │ • Phase Selector│ • Subtopic Interactive Checklists                    │
  │ • Week List     │ • Curated Video/Doc/Repo Resource Cards              │
  │ • Streak Matrix │ • Salary (LPA) Benchmark Cards                       │
  │ • Quiz History  │ • Embedded Markdown Notes & External Links           │
  │                 │ • Pomodoro Focus Timer & Test Shortcuts              │
  └─────────────────┴──────────────────────────────────────────────────────┘
```

---

## 2. Complete Navigation Taxonomy

### 2.1 Primary Global Navigation (Persistent Top Header)
Positioned fixed at the top (`height: 56px`), with blur backdrop (`rgba(13, 17, 23, 0.92)`).

```
[Logo: T1% Backend] ─── [Progress Telemetry] ─── [Pause Indicator] ─── [Actions & Profile]
```

- **Brand Anchor (Left):** `[T1%] Backend Roadmap` — Click returns to Dashboard / Active Day.
- **Live Telemetry Strip (Center):**
  - `Done:` Completed topics count (e.g., `42 / 813`).
  - `Complete:` Progress percentage badge (e.g., `5%`).
  - `Streak:` Active flame badge + day count (e.g., `14🔥`).
  - `Remaining:` Days left in 364-day schedule (e.g., `322d`).
- **Contextual Status & Action Controls (Right):**
  - `⏸ PAUSED` Badge (Rendered only when course is in paused state).
  - `⏸ Pause / ▶ Resume` Button.
  - `📅 Reschedule` Button.
  - `Today` Quick-snap Button.
  - `🧪 Quiz` Quick-launch Button.
  - `User Avatar & Menu` (Profile, Settings, Admin Portal switch if admin, Logout).

---

### 2.2 Secondary Navigation (Sidebar Tree & Views)
Fixed collapsible left sidebar (`width: 260px` desktop, drawer on mobile).

```
┌────────────────────────────────────────┐
│ SIDEBAR NAVIGATION TREE                │
├────────────────────────────────────────┤
│ 1. LEARNER PROGRESS SUMMARY            │
│    • Radial / Linear Progress Fill     │
│    • Phase / Week / Day Coordinates    │
├────────────────────────────────────────┤
│ 2. PHASE SELECTOR ACCORDION            │
│    • Phase 1: Foundation (Weeks 1-6)   │
│    • Phase 2: Core Skills (Weeks 7-18) │
│    • Phase 3: Production (Weeks 19-28) │
│    • Phase 4: Advanced (Weeks 29-42)   │
│    • Phase 5: Top 1% (Weeks 43-52)     │
├────────────────────────────────────────┤
│ 3. WEEKS DRILL-DOWN LIST (ACTIVE PHASE)│
│    • Week 1: Node.js Internals (✓)     │
│    • Week 2: TCP/IP & HTTP (Active)    │
│    • Week 3: Raw HTTP Server           │
├────────────────────────────────────────┤
│ 4. STREAK & HABIT ACCOUNTABILITY       │
│    • 21-Day Rolling Heatmap Matrix     │
│    • Streak Freeze Status              │
├────────────────────────────────────────┤
│ 5. RECENT ASSESSMENTS & HIGH SCORES    │
│    • Last 5 Quiz Scores & Tiers        │
│    • Take Today's Quiz CTA             │
└────────────────────────────────────────┘
```

---

### 2.3 Contextual Workspace Navigation
Embedded directly within the learning canvas:
- **Weekday Strip (`.wcal`):** Horizontal 7-day pill strip displaying days Monday through Sunday of the active week. Indicates active day, completed days, rest days, and today.
- **Chronological Step Buttons:** `← Previous Day` and `Next Day →` with keyboard shortcut discoverability tooltips.
- **Breadcrumb Hierarchy:** `Roadmap` $>$ `Phase 1: Foundation` $>$ `Week 2` $>$ `Day 3: TCP/IP Fundamentals`.

---

### 2.4 Mobile Navigation Pattern (< 768px)
- **Top Bar:** Condensed logo, streak fire badge, pause indicator, and hamburger toggle (`☰`).
- **Bottom Tab Navigation (`height: 60px`):**
  1. `Today` (Active learning workspace).
  2. `Roadmap` (Phase & week drawer).
  3. `Quiz` (Assessments modal/view).
  4. `Timer` (Focus Pomodoro drawer).
  5. `More` (Notes, Reschedule, Profile).

---

### 2.5 Administrator Navigation Hierarchy
Accessible only to users with `Role: ADMIN` via a distinct, elevated dark-slate workspace:

```
┌────────────────────────────────────────────────────────────────────────┐
│                           ADMIN NAVIGATION                             │
├───────────────────┬────────────────────────────────────────────────────┤
│ • Admin Dashboard │ Platform-wide DAU, completion rates, drop-off      │
│ • Curriculum CRUD │ Phase $\rightarrow$ Week $\rightarrow$ Day $\rightarrow$ Topic tree manager        │
│ • Resource Hub    │ URL health monitor, media tagger, dead link check  │
│ • Quiz Studio     │ Question banks, options, answers, explanations     │
│ • User Directory  │ Learner search, progress inspector, role modifier  │
│ • Releases        │ Version tagging, draft preview, live publish       │
└───────────────────┴────────────────────────────────────────────────────┘
```

---

## 3. Screen Mapping to PRD Requirements

| PRD Epic | Screen / Modal ID | Primary Purpose | Key UX Elements |
|---|---|---|---|
| **EPIC 1** | `AUTH-01` Login / Register | Secure user access & onboarding | Email/Pass form, Google OAuth, Password reset, validation alerts. |
| **EPIC 2** | `ONBOARD-01` Onboarding Modal | Start date selection & commitment | 5-phase breakdown, date picker, live month-by-month bar graph preview. |
| **EPIC 3, 4**| `WORKSPACE-01` Day Canvas | Core daily study environment | Subtopic checklists, Skip cards, Resource cards, LPA salary badges. |
| **EPIC 5** | `PROGRESS-01` Overview Panel | Mastery & completion rollups | Multi-tier progress dials, week checkmarks `✓`, phase completion bars. |
| **EPIC 6** | `SCHED-01` Reschedule Modal | Calendar date remapping | Date selector, new schedule preview, "Progress is preserved" guarantee. |
| **EPIC 6** | `PAUSE-01` Pause / Resume Modal | Life disruption pause engine | Pause duration calculator, resume date shift preview, status banner. |
| **EPIC 7** | `QUIZ-01` Quiz Modal Overlay | Interactive active retrieval test | 5/10/15 question cards, locked options, instant explanations, timer. |
| **EPIC 7** | `QUIZ-02` Results Screen | Assessment diagnostic summary | Score %, Correct/Wrong breakdown, letter grade, retry action. |
| **EPIC 8** | `NOTES-01` Embedded Editor | Rich markdown note-taking | Debounced auto-save, `Ctrl+S`, ChatGPT link, PDF/Notion note link. |
| **EPIC 9** | `TIMER-01` Pomodoro Focus Widget | Deep study focus blocks | 25m/5m/15m presets, Start/Pause/Reset, non-intrusive sound/toast. |
| **EPIC 10**| `MIGRATE-01` Migration Bridge | Legacy `localStorage` transfer | Data detection banner, 1-click import confirmation, progress state. |
| **EPIC 11**| `ADMIN-01` to `04` Admin Portal | Full curriculum & quiz curation | Tree editors, Markdown preview, draft/publish toggles, user table. |
| **EPIC 12**| `PROJECT-01` Portfolio Hub (V1)| Capstone milestone tracking | Spec cards, tech tags, GitHub URL input, live demo URL input. |
| **EPIC 13**| `ANALYTICS-01` Learner Metrics | Diagnostic weakness insights | Score trends, weak topic heatmap, study hours velocity chart. |
