# Feature Prioritization, MVP Boundary & Open Decisions

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 1 — Product Discovery & Analysis  
**Author:** Mary (BMAD Business Analyst)  
**Date:** September 21, 2026  
**Status:** Completed Analysis  

---

## 1. Feature Prioritization (P0 / P1 / P2 / P3)

Every discovered capability is prioritized based on core learner value, risk mitigation, and implementation sequence:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       FEATURE PRIORITIZATION MATRIX                         │
├────────────┬──────────────────────────────────┬─────────────────────────────┤
│  PRIORITY  │ CAPABILITY AREA                  │ RATIONALE / VALUE           │
├────────────┼──────────────────────────────────┼─────────────────────────────┤
│     P0     │ • User Auth & Session Management │ Fundamental prerequisite    │
│ (Critical) │ • Full 52-Week Curriculum Engine │ for multi-device cloud      │
│            │ • Topic Checklists & Rollups     │ sync and persistent state.  │
│            │ • Dynamic Schedule & Pause/Resume│ Core learning workflow.     │
│            │ • Interactive Quiz Engine (Daily,│                             │
│            │   Weekly, Phase Exams)           │                             │
│            │ • Daily Markdown Notes & Links   │                             │
│            │ • Focus Pomodoro Timer & Streaks │                             │
│            │ • Admin Curriculum & Quiz CRUD   │                             │
│            │ • Legacy LocalStorage Migration  │                             │
├────────────┼──────────────────────────────────┼─────────────────────────────┤
│     P1     │ • Capstone Project Repo Submit   │ Bridges conceptual learning │
│(Important) │ • User Performance Analytics View│ to tangible portfolio proof.│
│            │ • Admin User Management Portal   │ Essential operational and   │
│            │ • Offline Optimistic Sync        │ diagnostic tools.           │
│            │ • Bulk CSV Import for Questions  │                             │
├────────────┼──────────────────────────────────┼─────────────────────────────┤
│     P2     │ • Email & In-App Study Reminders │ Increases long-term habit   │
│ (Valuable) │ • Spaced Repetition Quiz Engine  │ retention and engagement.   │
│            │ • Project Rubrics & Admin Reviews│ Enhanced pedagogical polish.│
│            │ • Notes Markdown Export (PDF/Zip)│                             │
│            │ • Public Shareable Profile Badges│                             │
├────────────┼──────────────────────────────────┼─────────────────────────────┤
│     P3     │ • AI Mentor / PR Code Reviewer   │ Advanced differentiators    │
│ (Future)   │ • AI Topic Explainer & Tutor     │ suitable for post-V1        │
│            │ • Live Peer Study Rooms          │ scaling and monetization.   │
│            │ • Multi-Track Roadmaps (Go/Rust) │                             │
│            │ • Enterprise Cohort Management   │                             │
└────────────┴─────────────────────────────┴─────────────────────────────────┘
```

---

## 2. Clear MVP Scope Boundary

To ensure a rapid, high-quality, and reliable delivery, the MVP boundary is strictly delineated:

### ✅ IN-SCOPE FOR MVP:
1. **User Identity & Multi-Tenancy**: Secure Email/Password registration, Google OAuth, JWT HttpOnly cookie authentication, User Profile.
2. **Complete 52-Week Dynamic Curriculum**: Seamlessly rendered across all 5 Phases, with all Days, Topics, Skip Directives, Resources, and LPA Milestones.
3. **Cloud-Synced Progress Tracking**: Checkbox toggles on subtopics with instant UI feedback, rolling up into Day, Week, Phase, and Global progress indicators.
4. **Adaptive Scheduling & Pause Engine**: Start date selection, month-by-month projection, Rescheduling date remap, and course Pause/Resume functionality.
5. **Full Dynamic Quiz Engine**: Server-evaluated Daily Quizzes (5Q), Weekly Tests (10Q), and Phase Exams (15Q) with immediate pedagogical rationale, scoring, grade assignments, and retake support.
6. **Day-Bound Note Taking & Links**: Rich markdown notes editor with debounced auto-saving, ChatGPT chat link persistence, and PDF/Notion note link persistence.
7. **Habit Accountability**: Integrated Pomodoro timer (25m/5m/15m) and dynamic streak calculation.
8. **Admin Content Management Portal**: Dedicated administrative UI for creating, editing, reordering, and publishing Roadmap days, topics, external resources, and quiz question banks.
9. **Legacy Data Migration Bridge**: Automatic one-click transfer of pre-existing browser `localStorage` progress into the user's newly created cloud account.

### ❌ OUT-OF-SCOPE FOR MVP (Deferred to V1 / V2 / Future):
1. Automated AI PR code reviewer or AI topic tutor.
2. Formal project manual grading / rubric review workflow (MVP supports project view and milestone link submission).
3. Spaced repetition algorithm engine (Leitner/SM-2).
4. Peer-to-peer live chat, forums, or social leaderboards.
5. Multi-language/multi-track alternate roadmaps (e.g., Python-only or Go-only tracks).
6. Automated dead-link crawler (Admin can manually edit/update URLs).

---

## 3. Explicit Open Product Questions & Decisions

The following architectural and business questions have been identified during analysis and must be formally resolved in subsequent BMAD phases (PM / Architect):

### Question 1: Roadmap Customization vs. Strict Linear Discipline
- **Context**: The existing roadmap is highly opinionated ("Zero Fluff", "No shortcuts"). Should learners be allowed to customize their roadmap (e.g., reorder weeks, hide topics, create custom tracks), or should all learners follow the canonical 52-week path?
- **Impact**: Affects data model complexity, caching strategies, and peer comparison metrics.

### Question 2: Topic Completion Criteria & Verification Gating
- **Context**: Currently, marking a topic complete is purely self-reported via checkboxes. Should the platform enforce completion gating (e.g., must score $\ge$ 75% on the Daily Quiz or submit a project link before a Day/Week is marked complete), or remain self-paced/honor-system?
- **Impact**: Affects progression logic, user friction, and completion analytics validity.

### Question 3: Handling Curriculum Content Updates for Active Cohorts
- **Context**: When an Admin updates topics or replaces resources in Week 4, how should this affect a learner who is currently on Week 10?
- **Options**:
  - *Option A (Global In-Place Update)*: All users see updated content immediately; completed topic IDs remain checked.
  - *Option B (Enrolled Version Pinning)*: Learners stay on the curriculum version they started with (`v1.0`), with an optional banner: "New roadmap version available — Click to upgrade."
- **Impact**: Impacts schema design, database query complexity, and versioning models.

### Question 4: Project Deliverable Verification & Feedback
- **Context**: The roadmap contains 15 demanding projects (e.g., building a raw HTTP server without frameworks, Kafka event streaming). For MVP, is saving a GitHub repository URL sufficient proof of completion, or is automated CI/CD test verification required?
- **Impact**: Affects MVP release timeline and backend worker architecture.

### Question 5: Streak Forgiveness & Grace Periods
- **Context**: The current streak algorithm strictly breaks if an active study day has no checked topics. Should the platform offer "Streak Freezes" (e.g., 1 free freeze per month) or a 24-hour grace period to prevent learner demotivation?
- **Impact**: Directly affects learner retention psychology and streak calculation service logic.

### Question 6: Offline-First vs. Cloud-First Synchronization
- **Context**: Should the platform support full offline study (e.g., PWA with IndexedDB sync when reconnected), or is persistent internet connectivity assumed for all learning sessions?
- **Impact**: Dictates frontend service worker architecture, offline state reconciliation, and conflict resolution rules.
