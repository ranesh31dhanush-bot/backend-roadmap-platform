# Functional & Dynamic Requirements Specification

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 1 — Product Discovery & Analysis  
**Author:** Mary (BMAD Business Analyst)  
**Date:** September 21, 2026  
**Status:** Completed Analysis  

---

## 1. Data Classification Matrix (Dynamic vs. Static)

To properly transition the platform from client-side `localStorage` to a robust cloud platform, all product elements are classified across five distinct data tiers:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PLATFORM DATA CLASSIFICATION                          │
├──────────────────────┬──────────────────────┬───────────────────────────────┤
│ 1. STATIC ASSETS     │ Fixed System Assets  │ Platform branding, UI icons,  │
│                      │                      │ CSS themes, static legal docs │
├──────────────────────┼──────────────────────┼───────────────────────────────┤
│ 2. ADMIN-MANAGED     │ Curriculum Content   │ Phases, Weeks, Days, Topics,  │
│    CONTENT           │ (Versioned)          │ Resources, Skip Directives,   │
│                      │                      │ Quiz Question Banks, Projects │
├──────────────────────┼──────────────────────┼───────────────────────────────┤
│ 3. USER DATA         │ Learner-Specific     │ User profiles, topic ticks,   │
│                      │ Private State        │ personal notes, linked URLs,  │
│                      │                      │ custom start dates, pause log │
├──────────────────────┼──────────────────────┼───────────────────────────────┤
│ 4. SYSTEM DATA       │ Operational & Audit  │ Auth tokens, session cookies, │
│                      │ Records              │ quiz attempts, timestamps,    │
│                      │                      │ system audit & error logs     │
├──────────────────────┼──────────────────────┼───────────────────────────────┤
│ 5. DERIVED /         │ Computed Real-Time   │ Streaks, completion %, days   │
│    ANALYTICAL DATA   │ or Pre-Aggregated    │ remaining, quiz letter grade, │
│                      │ Metrics              │ weakness heatmaps, drop-offs  │
└──────────────────────┴──────────────────────┴───────────────────────────────┘
```

### Detailed Item Breakdown:

| Data Item | Tier | Storage & Mutation Characteristics |
|---|---|---|
| Roadmap Structure (Phases/Weeks/Days) | **Admin-Managed** | Centrally stored, versioned, read frequently by all users. |
| Topics & Subtopics | **Admin-Managed** | Structured arrays of learning objectives. Managed by Admin. |
| Curated Resources (YT, Docs, Repos) | **Admin-Managed** | Structured objects with media types and URLs. Admin-managed. |
| Skip Directives ("Do not waste time on") | **Admin-Managed** | Opinionated guidance attached to phases/days. Admin-managed. |
| Salary / LPA Benchmarks & Roles | **Admin-Managed** | Compensation tiers and target career job titles per phase. |
| Quiz Question Banks & Explanations | **Admin-Managed** | Categorized question pools, options, answer keys, explanations. |
| Capstone Project Specifications | **Admin-Managed** | Project prompts, requirements, tags, acceptance criteria. |
| User Profile & Credentials | **User / System** | Email, hashed password, OAuth IDs, profile settings. |
| Topic Completion Checkmarks (`done`) | **User Data** | User-specific completion boolean flags keyed by canonical topic ID. |
| Personal Notes | **User Data** | User's rich markdown text reflections keyed by canonical day/topic. |
| External Study Links (ChatGPT / PDF) | **User Data** | Custom URLs saved by learner for each study day. |
| Schedule Anchor (`startDate`) | **User Data** | Learner's personalized schedule baseline. |
| Course Pause History (`pausedAt`, days) | **User Data** | Active pause status and historical pause duration log. |
| Quiz Submissions & Attempts | **System Data** | Timestamped logs of every quiz attempt, chosen options, score. |
| Study Sessions (Timer Logs) | **System Data** | Duration of completed focus study blocks. |
| Daily Active Streak | **Derived Data** | Computed dynamically from daily completion logs + timezone rules. |
| Phase / Week / Total Progress % | **Derived Data** | Computed on-the-fly or aggregated from topic completion states. |
| Platform Analytics / Drop-off Funnels | **Derived Data** | Aggregated across all learner records for Admin dashboards. |

---

## 2. Core Functional Requirements (FR)

### Module 1: User Identity & Account Management
- **FR-1.1**: User registration with email/password and social login (Google OAuth).
- **FR-1.2**: Secure authentication with JWT access/refresh token rotation and HttpOnly cookies.
- **FR-1.3**: Password reset via secure email verification tokens.
- **FR-1.4**: User profile management (name, avatar, experience level, notification preferences).
- **FR-1.5**: Role-based access control (`Learner` vs. `Admin`).
- **FR-1.6**: Migration utility for legacy users to import existing `localStorage` data into their authenticated account upon first login.

### Module 2: Dynamic Roadmap & Curriculum Engine
- **FR-2.1**: Render complete 52-week curriculum organized into 5 progressive phases.
- **FR-2.2**: Support multi-level hierarchy: Phase $\rightarrow$ Week $\rightarrow$ Day $\rightarrow$ Topics, Resources, Projects.
- **FR-2.3**: Display phase-level salary expectations (LPA), job roles, and skip directives.
- **FR-2.4**: Support distinct day types: Standard Learning Day vs. Rest & Consolidation Day.
- **FR-2.5**: Display structured external resource cards categorized by type (`YouTube`, `Documentation`, `GitHub`).

### Module 3: Adaptive Schedule & Pause Engine
- **FR-3.1**: Allow learner to set a custom `startDate` during onboarding or anytime via Reschedule modal.
- **FR-3.2**: Project all 364 calendar days forward with exact dates and weekday mappings.
- **FR-3.3**: Provide a visual month-by-month schedule preview graph during date selection.
- **FR-3.4**: Support "Today" snap navigation, matching the learner's current local date.
- **FR-3.5**: Course Pause functionality: freeze active schedule, display sticky `⏸ PAUSED` indicator.
- **FR-3.6**: Course Resume functionality: compute elapsed pause days, automatically shift `startDate` and future calendar assignments forward while preserving all completed work.

### Module 4: Topic Mastery & Progress Tracking
- **FR-4.1**: Interactive toggle for individual subtopics with real-time visual strike-through and checkmark.
- **FR-4.2**: Real-time progress rollup: Day completion (all topics checked) $\rightarrow$ Week completion (visual badge `✓`) $\rightarrow$ Phase % $\rightarrow$ Overall Course %.
- **FR-4.3**: Non-blocking asynchronous progress sync with cloud backend.
- **FR-4.4**: Support offline optimistic updates with resilient background synchronization.

### Module 5: Interactive Knowledge Assessment & Quiz Engine
- **FR-5.1**: Dynamic Daily Quiz generation: pull 5 randomized questions from the question bank matching today's topical keywords.
- **FR-5.2**: Weekly Assessment: 10 randomized questions covering cumulative week topics.
- **FR-5.3**: Phase Certification Exam: 15 comprehensive questions with strict pass thresholds (70–75%).
- **FR-5.4**: Real-time interactive UI: immediate visual indicator of correct/incorrect choice upon selection, locking remaining options.
- **FR-5.5**: Display comprehensive pedagogical rationale/explanation for each question after submission.
- **FR-5.6**: Score calculation, performance breakdown (Correct / Wrong / Total), letter grade evaluation, and actionable recommendation (e.g., "Below 75% — revisit today's topics").
- **FR-5.7**: Record quiz attempt history, best scores, and dates in learner profile.
- **FR-5.8**: Unlimited quiz retake capability.

### Module 6: Note-Taking & External Link Management
- **FR-6.1**: Embedded rich markdown notes editor on every learning day.
- **FR-6.2**: Automatic debounced saving (auto-save after 1.2s idle) plus manual `💾 Save` and `Ctrl+S` hotkeys.
- **FR-6.3**: Custom ChatGPT Chat Link persistence: store and launch topic-specific conversation URLs.
- **FR-6.4**: Custom PDF/External Notes Link persistence: store and launch Notion/Google Drive/PDF URLs.

### Module 7: Study Focus & Habit Accountability
- **FR-7.1**: Integrated Pomodoro Focus Timer with presets: 25m Focus, 5m Short Break, 15m Long Break.
- **FR-7.2**: Audio/visual alerts and toast notifications upon timer completion.
- **FR-7.3**: Streak tracking: calculate consecutive days with completed study topics based on user's timezone.
- **FR-7.4**: Visual 21-day rolling activity matrix displaying completed, current, and rest days.

### Module 8: Project Milestones & Portfolio Tracking
- **FR-8.1**: Display detailed specifications for all 15 phase capstone projects.
- **FR-8.2**: Allow learners to submit project links (GitHub Repository URL, Live Demo URL).
- **FR-8.3**: Project submission status tracking: `Not Started`, `In Progress`, `Submitted`, `Completed`.

---

## 3. Administrator Capabilities & Roadmap

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ADMIN CAPABILITIES MATRIX                           │
├───────────────────────────┬───────────────────────────┬─────────────────────┤
│        MUST HAVE          │        SHOULD HAVE        │       FUTURE        │
│          (MVP)            │           (V1)            │        (V2)         │
├───────────────────────────┼───────────────────────────┼─────────────────────┤
│ • Full CRUD for Curriculum│ • Versioned Roadmap       │ • Automated Broken  │
│   (Phases, Weeks, Days)   │   Publishing (v1, v2)     │   Link Crawler      │
│ • Full CRUD for Topics &  │ • Capstone Project        │ • AI Question Gen   │
│   External Resources      │   Submission Review &     │   from Topics       │
│ • Full CRUD for Quiz      │   Feedback Portal         │ • Peer Review       │
│   Banks, Questions, & Exp │ • User Search, Status     │   Orchestration     │
│ • User List & Role Admin  │   Management & Reset      │ • Cohort Analytics  │
│ • Aggregated Learner      │ • Bulk CSV Import/Export  │   & Team Training   │
│   Metrics (Users, Counts) │   for Quizzes & Resources │   Dashboards        │
└───────────────────────────┴───────────────────────────┴─────────────────────┘
```

---

## 4. End-to-End Learning Experience & User Journeys

### The Canonical Learning Journey:

```
 [Onboarding] ──► [Select Start Date] ──► [Dashboard & Today's Day]
                                                  │
                                                  ▼
                                         [Review Skip Directives]
                                                  │
                                                  ▼
                                         [Start Focus Timer]
                                                  │
                                                  ▼
                                         [Study Curated Resources]
                                                  │
                                                  ▼
                                         [Check Off Topic Items]
                                                  │
                                                  ▼
                                         [Record Personal Notes]
                                                  │
                                                  ▼
                                         [Take Daily Quiz (5Q)]
                                                  │
                                                  ▼
                                    ┌─────────────┴─────────────┐
                             [Score ≥ 75%]               [Score < 75%]
                                    │                           │
                                    ▼                           ▼
                           [Celebrate & Advance]       [Review Topic Rationale]
                                    │                           │
                                    └─────────────┬─────────────┘
                                                  ▼
                                      [Next Day / Rest Day]
```

### Edge-Case User Flows:

1. **The Life Disruption (Pause & Resume Flow)**:
   - *Trigger*: Learner falls ill or has exams.
   - *Flow*: Clicks `⏸ Pause` $\rightarrow$ System records `pausedAt` timestamp $\rightarrow$ Dashboard displays paused state. Weeks later, learner clicks `▶ Resume` $\rightarrow$ System calculates $\Delta$ days $\rightarrow$ Automatically increments `startDate` $\rightarrow$ Remaps all remaining calendar slots $\rightarrow$ Learner continues with zero guilt and zero calendar misalignment.
2. **The Catch-Up / Rest Day Flow**:
   - *Trigger*: Learner misses Day 3 and Day 4 during a busy week.
   - *Flow*: Day 7 is a designated **Rest & Consolidation Day**. Learner navigates back to Day 3/4 $\rightarrow$ Completes backlog topics $\rightarrow$ Completes Day 7 Weekly Assessment (10Q) $\rightarrow$ Restores weekly completion badge `✓`.
3. **The Non-Linear Learner (Skip & Revision Flow)**:
   - *Trigger*: Experienced engineer already proficient in Git (Week 2).
   - *Flow*: Learner reviews the Day's topics $\rightarrow$ Immediately checks all items or uses "Mark Day Complete" $\rightarrow$ Takes the Daily Quiz to prove proficiency $\rightarrow$ Advances directly to SQL & Database internals.
