---
title: Product Requirements Document (PRD) — Top 1% Backend Roadmap Platform
status: draft
version: 1.0.0
author: John (BMAD Product Manager)
date: 2026-09-21
updated: 2026-09-21
project: Top 1% Backend Roadmap Platform
bmad_version: 6.12.0
---

# Product Requirements Document (PRD)
## Top 1% Backend Roadmap Platform

---

## 1. Executive Summary & Product Vision

### 1.1 Executive Summary
The **Top 1% Backend Roadmap Platform** is an enterprise-grade, cloud-backed dynamic learning accelerator designed to transform aspiring and intermediate software engineers into top-tier (Top 1%) backend systems engineers. 

Evolving from a single-device client-side prototype (`backend_roadmap_final_with_links.html`), this platform transitions the complete 52-week (12-month) curriculum into a dynamic, multi-tenant learning environment backed by persistent cloud state, server-evaluated assessments, adaptive calendar scheduling, and verified project milestone deliverables.

### 1.2 Product Vision
```
                      PRODUCT TRANSFORMATION TRAJECTORY
  ┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
  │  STATIC / LOCAL ROADMAP │ ──► │  DYNAMIC CLOUD PLATFORM │ ──► │ PERSONALIZED ACCELERATOR│
  │ • Single-device storage │     │ • Multi-device cloud sync│     │ • AI-assisted mentorship│
  │ • Hardcoded HTML/JS     │     │ • Admin content CRUD    │     │ • Automated PR review   │
  │ • Self-reported ticks   │     │ • Server-evaluated quiz │     │ • Verified portfolio    │
  └─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘
```

**Core Philosophy:**  
> *"Build deep. Ship real things. Write about it. That's the entire strategy."*

The platform rejects the passive, superficial video consumption of traditional generic LMS platforms. It enforces an **active, disciplined execution environment** anchored around:
- **Opinionated Curriculum:** 5 progressive phases covering 52 weeks, 813+ granular subtopics, and explicit negative guidance ("Skip" directives).
- **Relentless Accountability:** Dynamic start dates, calendar mapping, automated pause/resume calculations, and streak mechanics.
- **Active Conceptual Retrieval:** Multi-tier quiz engine (Daily, Weekly, Phase Exams) with immediate feedback and pedagogical explanations.
- **Verifiable Portfolio Proof:** Real-world milestone projects requiring repository submissions and production-readiness standards.

---

## 2. Product Goals, Non-Goals & Success Metrics

### 2.1 Strategic Product Goals

| ID | Product Goal | Why It Matters | Success Indicator |
|---|---|---|---|
| **G-1** | **Preserve Master Curriculum Integrity** | The 52-week curriculum is the platform's core intellectual property. | 100% of the 5 phases, 52 weeks, subtopics, resources, and skip directives from source materials are accurately represented and dynamically served. |
| **G-2** | **Multi-Device Cloud Continuity** | Learners switch between desktops, laptops, and mobile devices during long-term study. | 0% progress loss across device transitions; persistent user state stored securely in cloud database. |
| **G-3** | **Zero-Loss Legacy Migration** | Existing learners who used the static app must not lose their hard-earned streaks, notes, or progress. | 100% successful one-click data migration from browser `localStorage` to new cloud account upon initial login. |
| **G-4** | **Server-Evaluated Assessment Integrity** | Client-side answers allow trivial cheating; assessments must validate true understanding. | 100% of quiz scoring, correct answers, and explanations are evaluated server-side without client-side leakage. |
| **G-5** | **Adaptive Life-Resilient Scheduling** | Long 12-month journeys encounter life disruptions; rigid calendars cause guilt and abandonment. | Learners can pause and resume journeys seamlessly, automatically shifting future dates without corrupting historical logs. |
| **G-6** | **Centralized Admin Content Governance** | Curriculum requires continuous updates, new question banks, and link maintenance. | Administrators can create, edit, reorder, and publish curriculum topics, external resources, and quizzes via admin UI without code deployments. |

### 2.2 Product Non-Goals (Out of Scope for MVP)

| Non-Goal | Classification | Rationale |
|---|---|---|
| **Social Network / Peer Chat / Forums** | Deferred to V2 / Future | Distracts from core deep work and individual learning momentum during initial release. |
| **Automated AI PR Code Reviewer** | Deferred to Future | Requires complex sandboxed code execution and LLM fine-tuning; out of MVP scope. |
| **Multiple / Customizable Roadmaps** | Deferred to V2 | The initial platform is strictly optimized for the canonical 52-week Backend Roadmap. |
| **Automated Dead-Link Web Crawler** | Deferred to V1 | Admin manual URL editing fulfills operational needs for launch. |
| **Enterprise Cohort / Team Dashboards** | Deferred to Future | Focus is single-learner mastery before enterprise B2B expansion. |

### 2.3 Success Metrics & Counter-Metrics

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRODUCT METRICS DASHBOARD                           │
├──────────────────────────────────────┬──────────────────────────────────────┤
│           PRIMARY METRICS            │           COUNTER-METRICS            │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ • Activation: % of registered users  │ • Passive Ticking: High topic check  │
│   completing Week 1 Day 1 (Target:   │   rate combined with low quiz pass   │
│   >75%)                              │   rates (<50%) indicates skimming.   │
│ • Weekly Retention: % of active      │ • Quiz Frustration: High quiz abandon│
│   learners returning week-over-week  │   rate before completing 5 questions │
│   (Target: >60% at 3 months)         │   indicates question ambiguity.      │
│ • Quiz Engagement: Average quiz      │ • Artificial Streaks: Checking all   │
│   attempts per completed day (>1.2)  │   topics in 30 seconds to maintain   │
│ • 12-Month Completion: % of enrolled │   streak without study time logged.  │
│   learners reaching Phase 5          │                                      │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

---

## 3. Target User Personas & Permissions

### 3.1 Primary Persona: The Learner (`Role: USER`)
- **Who They Are:** Aspiring or junior-to-mid backend software engineers aiming for top-tier compensation (₹15L–₹50L+ LPA) or systems mastery.
- **Core Jobs-to-be-Done:**
  1. *"When I sit down to study, I want a structured daily plan with vetted resources so that I don't waste hours wandering through tutorials."*
  2. *"When I complete topics, I want to test myself with real interview-grade quizzes so that I know I actually understand the concept."*
  3. *"When unexpected life events happen, I want to pause my schedule so that my calendar doesn't become broken or demotivating."*
- **Permissions:** Read published curriculum; CRUD own progress, checkboxes, notes, and links; submit quiz attempts; manage own schedule and profile.

### 3.2 Secondary Persona: The Administrator / Content Lead (`Role: ADMIN`)
- **Who They Are:** Curriculum directors and lead architects managing platform content and learning standards.
- **Core Jobs-to-be-Done:**
  1. *"When official documentation or industry best practices change, I want to update topics and resource links immediately so learners always study relevant material."*
  2. *"When a quiz question proves confusing, I want to edit questions and rationales in real time."*
  3. *"When learners stall, I want to inspect platform drop-off funnels to identify where curriculum adjustments are needed."*
- **Permissions:** Full CRUD on all curriculum entities (Phases, Weeks, Days, Topics, Resources, Projects, Quizzes); access to aggregated platform telemetry; user management.

---

## 4. Epic Decomposition & Roadmap

The product is decomposed into **15 focused Epics**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRODUCT EPIC TAXONOMY                             │
├────────┬──────────────────────────────────┬──────────────┬──────────────────┤
│ EPIC # │ EPIC TITLE                       │ RELEASE TIER │ PRIMARY ACTOR    │
├────────┼──────────────────────────────────┼──────────────┼──────────────────┤
│ EPIC 1 │ User Authentication & Identity   │     MVP      │ Learner / Admin  │
│ EPIC 2 │ Learner Onboarding & Schedule    │     MVP      │ Learner          │
│ EPIC 3 │ Dynamic Roadmap & Curriculum     │     MVP      │ Learner          │
│ EPIC 4 │ Daily Learning Workspace         │     MVP      │ Learner          │
│ EPIC 5 │ Progress Tracking & Rollups      │     MVP      │ Learner          │
│ EPIC 6 │ Adaptive Schedule & Pause/Resume │     MVP      │ Learner          │
│ EPIC 7 │ Assessment & Quiz Engine         │     MVP      │ Learner          │
│ EPIC 8 │ Day-Bound Notes & Study Links    │     MVP      │ Learner          │
│ EPIC 9 │ Focus Study Timer & Streaks      │     MVP      │ Learner          │
│ EPIC 10│ Legacy LocalStorage Migration    │     MVP      │ Learner          │
│ EPIC 11│ Admin Content Management (CRUD)  │     MVP      │ Administrator    │
│ EPIC 12│ Capstone Project Submission      │      V1      │ Learner / Admin  │
│ EPIC 13│ Learner & Admin Analytics        │    MVP / V1  │ Learner / Admin  │
│ EPIC 14│ Notifications & Study Reminders  │      V2      │ Learner / System │
│ EPIC 15│ Spaced Repetition & AI Mentor    │  V2 / Future │ Learner / AI     │
└────────┴──────────────────────────────────┴──────────────┴──────────────────┘
```

---

## 5. Detailed Functional Requirements (FR)

### Epic 1: User Authentication & Identity Management
- **FR-1.1**: The platform MUST allow learners to register using Email & Password.
- **FR-1.2**: The platform MUST support Social Login via Google OAuth 2.0.
- **FR-1.3**: The platform MUST maintain authenticated sessions using secure JWT access and refresh tokens stored in HttpOnly, SameSite=Strict cookies.
- **FR-1.4**: The platform MUST provide a secure self-service Password Reset workflow via email verification links.
- **FR-1.5**: The platform MUST enforce Role-Based Access Control (`USER` vs. `ADMIN`).

### Epic 2: Learner Onboarding & Schedule Initialization
- **FR-2.1**: Upon initial login, if a learner has not configured a start date, the platform MUST display an Onboarding Modal.
- **FR-2.2**: The Onboarding experience MUST present a 5-phase duration summary (Foundation 6wks, Core 12wks, Prod 10wks, Advanced 14wks, Top 1% 10wks).
- **FR-2.3**: When the learner selects a start date, the platform MUST display a live month-by-month schedule visualization bar showing start date, calculated completion date, and monthly phase distribution.
- **FR-2.4**: Upon confirming the start date, the platform MUST persist the schedule anchor in the user's cloud profile and route directly to Phase 1, Week 1, Day 1.

### Epic 3: Dynamic Roadmap & Curriculum Hierarchy
- **FR-3.1**: The platform MUST dynamically render the complete 52-week curriculum organized into 5 progressive phases.
- **FR-3.2**: Every Phase MUST display its name, week duration, target salary benchmarks (Min/Mid/Max LPA), qualifying job titles, and phase-level "Skip" directives.
- **FR-3.3**: Every Week MUST display its sequential week number, thematic title, and 7 sequential calendar day cards.
- **FR-3.4**: The platform MUST distinguish between Standard Learning Days (Days 1–6) and Rest & Consolidation Days (Day 7).
- **FR-3.5**: Every Day MUST render its title, formatted calendar date, contextual summary description, and daily skip directives ("Do not waste time on...").
- **FR-3.6**: Every Day MUST render structured external resource cards categorized with icons and badges (`YouTube`, `Article/Documentation`, `GitHub Repository`).

### Epic 4: Daily Learning Workspace & Content Interaction
- **FR-4.1**: The platform MUST provide a central Day Workspace displaying all daily subtopics as interactive checklist rows.
- **FR-4.2**: The workspace MUST provide persistent chronological navigation controls (`← Prev`, `Today`, `Next →`).
- **FR-4.3**: The workspace MUST support keyboard hotkeys: `ArrowLeft` for previous day, `ArrowRight` for next day, and `Ctrl+S`/`Cmd+S` for saving notes.
- **FR-4.4**: Clicking on external resource cards MUST open the target URL in a new browser tab with `rel="noopener noreferrer"`.
- **FR-4.5**: On Rest & Consolidation Days, the workspace MUST display restorative guidance tips, week reflection notes, and assessment review shortcuts.

### Epic 5: Progress Tracking & Hierarchical Rollups
- **FR-5.1**: Learners MUST be able to toggle individual subtopics complete/incomplete with immediate visual feedback (strikethrough text and filled green checkbox).
- **FR-5.2**: The platform MUST automatically compute and roll up progress at four tiers:
  1. *Day Tier:* Complete when all active subtopics are checked ($N/N$).
  2. *Week Tier:* Complete when all active days in the week are complete (triggers visual green `✓` in sidebar week list).
  3. *Phase Tier:* Percentage calculated as $(\text{Completed Phase Topics} / \text{Total Phase Topics}) \times 100$.
  4. *Global Tier:* Total percentage and ratio $(\text{Total Completed Topics} / \text{Total Roadmap Topics})$.
- **FR-5.3**: Progress updates MUST sync asynchronously to the backend database; UI state MUST update optimistically without blocking user interaction.
- **FR-5.4**: Unchecking a subtopic MUST decrement progress rollups instantly.

### Epic 6: Adaptive Scheduling & Pause / Resume Engine
- **FR-6.1**: Learners MUST be able to open a "Reschedule" modal at any time to select a new `startDate`.
- **FR-6.2**: Rescheduling MUST remap all 364 calendar dates forward/backward while keeping all topic checkboxes, notes, and quiz scores completely intact.
- **FR-6.3**: Learners MUST be able to Pause their course via a "Pause" modal.
- **FR-6.4**: While paused, the platform MUST display a persistent `⏸ PAUSED` indicator in the header navigation bar.
- **FR-6.5**: When a learner Resumes, the platform MUST calculate the exact elapsed days paused ($\text{Today} - \text{PausedAt}$), shift the `startDate` forward by that number of days, clear the pause state, and toast-notify the user of their new completion date.

### Epic 7: Dynamic Assessment & Quiz Engine
- **FR-7.1**: The platform MUST support three assessment tiers:
  1. *Daily Quiz:* 5 randomized questions dynamically pulled from the question bank matching the active day's keywords.
  2. *Weekly Test:* 10 randomized questions evaluating cumulative weekly understanding.
  3. *Phase Exam:* 15 comprehensive questions evaluating full phase mastery (70–75% pass mark).
- **FR-7.2**: The frontend MUST NOT receive correct answer keys prior to user submission.
- **FR-7.3**: When an option is picked, the platform MUST evaluate the submission, lock all options, and immediately display visual feedback (green for correct, red for incorrect).
- **FR-7.4**: Upon answer evaluation, the platform MUST display the comprehensive pedagogical explanation (`exp`) beneath the question.
- **FR-7.5**: Upon quiz completion, the platform MUST display a results summary (Score, Percentage, Correct count, Wrong count, Letter Grade, and Actionable Guidance).
- **FR-7.6**: Learners MUST be permitted unlimited retakes. The platform MUST record all attempt logs while maintaining the user's high score.

### Epic 8: Day-Bound Notes & Study Links
- **FR-8.1**: Every learning day MUST provide an embedded rich markdown notes textarea.
- **FR-8.2**: Notes MUST auto-save automatically using a 1200ms debounce timer following user input, with visual status confirmation (`Note saved ✓`).
- **FR-8.3**: Learners MUST be able to save a custom ChatGPT Conversation URL for each study day.
- **FR-8.4**: Learners MUST be able to save a custom PDF / Notion / Google Drive Notes URL for each study day.
- **FR-8.5**: Saved external links MUST render as dedicated 1-click launch buttons with an `Edit` action.
- **FR-8.6**: All notes and external links MUST be permanently anchored to the canonical `Day ID` rather than the calendar date string, ensuring zero data loss during rescheduling.

### Epic 9: Focus Study Timer & Streak Accountability
- **FR-9.1**: The platform MUST provide an integrated Pomodoro Focus Timer with presets: 25 minutes (Focus), 5 minutes (Short Break), 15 minutes (Long Break).
- **FR-9.2**: The timer MUST support Start, Pause, and Reset controls, triggering toast notifications upon session completion.
- **FR-9.3**: The platform MUST calculate the learner's active daily streak based on contiguous calendar days with completed study topics, adjusted for user timezone.
- **FR-9.4**: The sidebar MUST render a 21-day rolling activity matrix displaying completed days (green), today (amber), and rest/past days (neutral).

### Epic 10: Legacy LocalStorage Migration Bridge
- **FR-10.1**: Upon first login to an authenticated account, the client application MUST detect if legacy data exists in `localStorage` (`done`, `notes`, `qscores`, `startDate`, `chatLinks`, `pdfLinks`).
- **FR-10.2**: If legacy data is found, the platform MUST prompt the learner with a one-click "Import Existing Progress" modal.
- **FR-10.3**: Upon confirmation, the client MUST transmit the payload to a dedicated cloud migration endpoint that validates, converts date keys to canonical IDs, and imports the records into the user's cloud account.
- **FR-10.4**: Upon successful import, the platform MUST clear legacy `localStorage` keys and display a success confirmation.

### Epic 11: Administrator Content Management (CRUD)
- **FR-11.1**: Administrators MUST have access to an authenticated Admin Portal.
- **FR-11.2**: Administrators MUST be able to Create, Read, Update, and Archive Phases, Weeks, Days, and Subtopics.
- **FR-11.3**: Administrators MUST be able to Create, Update, and Delete curated Resource links, including media type tags.
- **FR-11.4**: Administrators MUST be able to Create, Update, and Delete Quiz Question Banks, Questions, Options, Answer Keys, and Explanations.
- **FR-11.5**: Administrators MUST be able to Publish curriculum revisions and manage draft vs. published states.
- **FR-11.6**: Administrators MUST be able to search users, view user progress metrics, and adjust user roles.

### Epic 12: Capstone Project Submission & Portfolio (V1)
- **FR-12.1**: The platform MUST render full specifications, suggested tech stacks, and acceptance rubrics for all 15 phase capstone projects.
- **FR-12.2**: Learners MUST be able to submit their project deliverable links (GitHub Repository URL and Live Demo URL).
- **FR-12.3**: The platform MUST track project status: `Not Started`, `In Progress`, `Submitted`, `Completed`.

### Epic 13: Learning & Platform Analytics (MVP / V1)
- **FR-13.1 (MVP)**: Learners MUST have access to their personal progress summary, completed topic counts, days remaining projection, and active streak.
- **FR-13.2 (V1)**: Learners MUST have access to a Diagnostic Quiz Breakdown highlighting weak topic areas (<70% score) vs. strong domains.
- **FR-13.3 (V1)**: Administrators MUST have access to aggregated platform metrics: Total Registered Learners, Daily Active Users (DAU), Curriculum Drop-Off Funnel by Week, and Question Failure Rates.

---

## 6. Non-Functional Requirements (NFR)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       NON-FUNCTIONAL REQUIREMENTS                           │
├───────────────────┬─────────────────────────────────────────────────────────┤
│ NFR-1 Performance │ • P95 API latency < 150ms.                              │
│                   │ • Optimistic UI updates on checkboxes (< 16ms render).  │
│                   │ • Initial page load (LCP) < 1.2s on desktop broadband.  │
├───────────────────┼─────────────────────────────────────────────────────────┤
│ NFR-2 Security    │ • Passwords hashed with bcrypt (cost factor 12).        │
│                   │ • JWT tokens in HttpOnly, SameSite=Strict cookies.      │
│                   │ • Server-side evaluation of all quiz answers.           │
│                   │ • Strict rate limiting on auth routes (5 req/min/IP).   │
│                   │ • XSS sanitization on all user markdown notes.          │
├───────────────────┼─────────────────────────────────────────────────────────┤
│ NFR-3 Scalability │ • Architecture must support 10,000+ daily active        │
│                   │   learners without degradation.                         │
│                   │ • Database indexing on userId, topicId, canonicalDayId. │
├───────────────────┼─────────────────────────────────────────────────────────┤
│ NFR-4 Reliability │ • 99.9% uptime availability for core learning routes.   │
│                   │ • Automated database snapshots & Point-In-Time Recovery.│
├───────────────────┼─────────────────────────────────────────────────────────┤
│ NFR-5 Data Safety │ • Idempotent progress toggles preventing race conditions│
│                   │ • Complete GDPR-compliant user data export & deletion.  │
├───────────────────┼─────────────────────────────────────────────────────────┤
│ NFR-6 a11y & UX   │ • WCAG 2.1 AA contrast compliance across dark palette.  │
│                   │ • Responsive layouts from 375px (mobile) to 4K desktop. │
│                   │ • Complete keyboard navigation support.                 │
└───────────────────┴─────────────────────────────────────────────────────────┘
```

---

## 7. Curriculum Versioning Product Rules

To resolve the critical risk of curriculum updates breaking active learners:
1. **Canonical Entity IDs:** Every phase, week, day, and topic is assigned an immutable canonical ID (`slug` or `UUID`) independent of its array index.
2. **Versioned Releases:** The curriculum is published under semantic version tags (e.g., `v1.0.0`, `v1.1.0`).
3. **Enrollment Pinning & Non-Destructive Merges:**
   - Active learners remain pinned to their enrolled major curriculum version.
   - Non-breaking changes (fixing typos, updating dead resource URLs, adding new quiz questions) apply immediately and transparently to all users.
   - Breaking changes (removing topics, altering week structures) trigger an optional learner upgrade notification banner: *"Curriculum update available — Review changes and upgrade"*. Existing completed topic IDs are preserved during upgrades.

---

## 8. Release Strategy & MVP Boundaries

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         RELEASE SCOPE COMPARISON                            │
├───────────────────────────┬───────────────────────────┬─────────────────────┤
│         MVP (NOW)         │          V1 (Q2)          │       V2 (Q3)       │
├───────────────────────────┼───────────────────────────┼─────────────────────┤
│ • Complete 52-Week Roadmap│ • Capstone Project Repo   │ • Spaced Repetition │
│ • User Auth (Email/Google)│   Submission (GitHub/Demo)│   Quiz Engine       │
│ • Cloud Topic Checklists  │ • Diagnostic Quiz Weakness│ • Email & In-App    │
│ • Dynamic Schedule Remap  │   Analytics for Learners  │   Study Reminders   │
│ • Course Pause / Resume   │ • Admin User Management & │ • Notes Markdown    │
│ • Full Dynamic Quiz Engine│   Status Operations       │   Export (PDF/Zip)  │
│ • Debounced Notes & Links │ • Bulk CSV Question Import│ • Public Profile &  │
│ • Focus Timer & Streaks   │ • Offline Optimistic Sync │   Shareable Badges  │
│ • Admin Content CRUD      │ • Curriculum Drop-Off     │ • Project Rubric    │
│ • Legacy Data Migration   │   Admin Analytics         │   Peer Reviews      │
└───────────────────────────┴───────────────────────────┴─────────────────────┘
```

---

## 9. Product Decisions & Stakeholder Sign-Offs

The following open decisions have been formalized for stakeholder confirmation:

1. **Curriculum Customization:**  
   *Product Stance:* Strict linear adherence. Learners follow the canonical 52-week path to maintain curriculum integrity and cohort alignment.
2. **Topic Completion Gating:**  
   *Product Stance:* Flexible self-reporting with quiz validation. Topic checking is unblocked, but weekly completion badges require $\ge 75\%$ quiz completion.
3. **Streak Grace Period:**  
   *Product Stance:* 1 automatic "Streak Freeze" granted per month to prevent catastrophic demotivation from single-day emergencies.
4. **Project Verification Level for MVP:**  
   *Product Stance:* URL storage for MVP; formal verification and rubric scoring introduced in V1.
