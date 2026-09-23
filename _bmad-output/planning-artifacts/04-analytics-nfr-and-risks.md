# Analytics, Non-Functional Requirements & Product Risks

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 1 — Product Discovery & Analysis  
**Author:** Mary (BMAD Business Analyst)  
**Date:** September 21, 2026  
**Status:** Completed Analysis  

---

## 1. Analytics Requirements

A central value proposition of the upgraded platform is providing learners and administrators with deep visibility into learning velocity, conceptual retention, and platform health.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ANALYTICS FRAMEWORK                              │
├──────────────────────────────────────┬──────────────────────────────────────┤
│        DIRECTLY TRACKED DATA         │           DERIVED METRICS            │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ • Timestamped Topic Check Events     │ • Overall Course Progress %          │
│ • Quiz Submission Attempts (Score,   │ • Phase-by-Phase Completion Velocity │
│   Selected Answers, Duration)        │ • Active Daily Streak & Longest      │
│ • Completed Pomodoro Study Blocks    │   Historical Streak                  │
│ • User Session Timestamps            │ • Retention Score & Topic Weakness   │
│ • Notes Word Count & Update Events   │   Heatmaps (from quiz fail rates)    │
│ • Pause / Resume Event Timestamps    │ • Average Study Hours per Week       │
│ • Project Submission Timestamps      │ • Curriculum Drop-Off Funnel Analysis│
└──────────────────────────────────────┴──────────────────────────────────────┘
```

### Key Learner Analytics Views:
1. **Mastery Dashboard**: Overall progress meter, phase completion bars, days remaining projection, active streak counter.
2. **Quiz Diagnostic Breakdown**: History of quiz attempts, first-attempt vs. best-attempt scores, categorization of strong vs. weak domains (e.g., "Strong: SQL Indexing (90%), Needs Review: Kafka Consumer Groups (55%)").
3. **Study Habit Velocity**: Rolling 21-day and 365-day activity heatmaps, cumulative study time logged via Pomodoro timer.

### Key Administrator Analytics Views:
1. **Curriculum Funnel & Drop-Off**: Pinpoints exact weeks/days where learners stall or drop out.
2. **Question Difficulty Index**: Identifies quiz questions with anomalously low pass rates (<40%) to flag poor phrasing, incorrect answer keys, or curriculum gaps.
3. **Engagement Telemetry**: Daily Active Users (DAU), Weekly Active Users (WAU), total notes written, and project submission rates.

---

## 2. Future Capabilities Roadmap

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FEATURE EVOLUTION ROADMAP                           │
├───────────────┬─────────────────┬────────────────────┬──────────────────────┤
│   MVP (Now)   │     V1 (Q2)     │      V2 (Q3)       │    FUTURE VISION     │
├───────────────┼─────────────────┼────────────────────┼──────────────────────┤
│ • Cloud-Synced│ • Project Repo  │ • Spaced           │ • AI Coding Mentor & │
│   Roadmap &   │   Submissions   │   Repetition       │   Automated PR Code  │
│   Checklists  │   & Reviews     │   Quiz Engine      │   Reviews            │
│ • Full 52 Wks │ • Email / In-App│ • Gamification,    │ • Dynamic AI Topic   │
│   Curriculum  │   Study Reminder│   Badges & Tiers   │   Explainer & Tutor  │
│ • Full Quiz   │   Notifications │ • Public Learner   │ • Real-time Live     │
│   Engine (All │ • Rich Markdown │   Profile & Social │   Study Rooms & Peer │
│   Banks)      │   Notes Export  │   Share Cards      │   Collaboration      │
│ • Schedule    │ • Advanced Topic│ • Multi-Track      │ • Enterprise Team    │
│   Pause/Resume│   Weakness      │   Roadmaps (e.g.,  │   Dashboards & SDE-2 │
│ • Focus Timer │   Analytics     │   Go, DevOps, Rust)│   Hiring Portals     │
│ • Admin CRUD  │ • Bulk Content  │ • Leaderboards &   │ • Automated Quiz Gen │
│   Portal      │   Import Tools  │   Peer Cohorts     │   via LLM Pipeline   │
└───────────────┴─────────────────┴────────────────────┴──────────────────────┘
```

---

## 3. Product Non-Functional Requirements (NFR)

| Domain | Requirement | Target Metric / Standard |
|---|---|---|
| **Performance** | Fast page loads and fluid interactions. | P95 Server Response Time < 150ms for API endpoints; First Contentful Paint (FCP) < 1.0s on Next.js frontend; zero UI lag during checkbox toggles (optimistic UI). |
| **Security** | Robust authentication, data protection, and OWASP compliance. | Secure password hashing (bcrypt cost 12); HttpOnly, SameSite=Strict cookies; CSRF protection; rate limiting on auth and API routes (e.g., 100 req/min/IP); sanitization of notes against XSS. |
| **Scalability** | Capable of supporting high concurrent learner activity. | Stateless backend API; support 10,000+ daily active learners; efficient database indexing on `userId`, `topicId`, and `date`. |
| **Reliability** | Uninterrupted learning and zero data loss. | 99.9% uptime SLA; automated database failover; graceful degradation if external services (e.g., email queue) are temporarily degraded. |
| **Data Integrity** | Absolute accuracy of learner progress, notes, and quiz history. | Idempotent progress toggles; atomic transactions for multi-entity updates; transactional data isolation between users. |
| **Privacy & Compliance** | Learner data ownership and privacy. | Users can export all personal data (notes, progress, quiz history) in standard JSON format; complete "Right to be Forgotten" account deletion support. |
| **Accessibility (a11y)** | Usability across diverse hardware and assistive tools. | WCAG 2.1 Level AA compliance; full keyboard navigation support (`Arrow` keys, shortcuts); high-contrast dark mode palette (contrast ratio $\ge$ 4.5:1). |
| **Responsive UX** | Universal device compatibility. | Seamless responsive layouts across desktop (1920x1080 down to 1280x800), tablets (iPad/Air), and mobile viewports (375px+). |
| **Maintainability** | Clean, modular codebase structure. | TypeScript end-to-end; strictly typed API contracts; modular component architecture; automated unit, integration, and E2E test coverage $\ge$ 80%. |
| **Observability** | Real-time monitoring and alerting. | Structured JSON logging with correlation IDs; Prometheus metrics endpoints; health-check endpoints (`/healthz`); error tracking (Sentry). |
| **Backup & Recovery** | Business continuity against infrastructure failure. | Automated daily database snapshots; point-in-time recovery (PITR); Recovery Point Objective (RPO) < 1 hour, Recovery Time Objective (RTO) < 30 minutes. |

---

## 4. Product Risks Matrix & Mitigation Strategies

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PRODUCT RISK ASSESSMENT                            │
├────┬─────────────────────────────┬───────────┬────────────┬─────────────────┤
│ ID │ Risk Description            │ Likelihood│   Impact   │ Risk Severity   │
├────┼─────────────────────────────┼───────────┼────────────┼─────────────────┤
│ R1 │ Legacy Data Migration Loss  │   High    │    High    │ 🔴 CRITICAL     │
│ R2 │ Curriculum Update Drift     │   High    │    High    │ 🔴 CRITICAL     │
│ R3 │ Quiz Dishonesty / Answers   │   Medium  │   Medium   │ 🟡 MODERATE     │
│ R4 │ Date Remapping Desync       │   Medium  │    High    │ 🔴 CRITICAL     │
│ R5 │ Large Roadmap Payload Lag   │   Medium  │   Medium   │ 🟡 MODERATE     │
│ R6 │ External Resource Bitrot    │   High    │   Medium   │ 🟡 MODERATE     │
│ R7 │ Multi-Device Sync Conflicts │   Medium  │   Medium   │ 🟡 MODERATE     │
└────┴─────────────────────────────┴───────────┴────────────┴─────────────────┘
```

### In-Depth Risk Analysis:

#### Risk 1: Legacy Data Loss during `localStorage` Migration
- **Why It Matters**: Existing loyal learners who have spent weeks tracking their journey in the static app will abandon the platform if their progress, notes, or quiz scores are wiped during the upgrade.
- **Mitigation Strategy**: Implement an automatic client-side migration bridge upon first account registration/login that detects existing `localStorage` keys (`done`, `notes`, `qscores`, `startDate`, `pdfLinks`, `chatLinks`), packages them into a migration payload, and securely imports them into the user's new cloud profile.

#### Risk 2: Curriculum Versioning & Historical Progress Inconsistency
- **Why It Matters**: If an admin modifies, reorders, or deletes topics/weeks in the roadmap, active learners could see their completion percentages shift unpredictably or have progress checkmarks orphaned.
- **Mitigation Strategy**: Decouple topic completion records from array indices. Assign permanent UUIDs/slugs to all curriculum nodes. Support roadmap content versioning (`v1.0.0`) so active learners can remain on their enrolled version or smoothly migrate to new releases.

#### Risk 3: Date Remapping & Note Detachment
- **Why It Matters**: In the existing static app, notes and links are keyed by date string (`notes[2026-09-21]`). If a user reschedules or pauses their course, shifting dates could detach notes from their conceptual topics.
- **Mitigation Strategy**: In the dynamic platform, permanently associate notes, reflections, and external links with **Canonical Day/Topic IDs** (`dayId`), rather than transient calendar dates. The calendar date is simply an active projection overlay.

#### Risk 4: Quiz Integrity & Answer Leakage
- **Why It Matters**: In the static app, correct answer indices (`q.a`) and full explanations are shipped in plaintext in the client bundle, allowing trivial inspection.
- **Mitigation Strategy**: For the dynamic platform, evaluate quiz submissions server-side. The client receives questions and options without answer keys; answers and pedagogical rationales are returned only after the user submits their selection.

#### Risk 5: Large Roadmap Payload & Query Performance
- **Why It Matters**: The full 52-week curriculum across 364 days with 800+ topics, hundreds of resources, and quiz metadata could become a bulky JSON payload (~1–2 MB) if fetched monolithically on every page load.
- **Mitigation Strategy**: Implement efficient hierarchical query slicing and caching. Fetch roadmap outline/metadata on shell load, and fetch deep day topics, resources, and notes on demand or via phase-level pre-caching.

#### Risk 6: External Resource "Link Rot"
- **Why It Matters**: YouTube videos get removed, blogs change URLs, and official doc links move, degrading learner trust.
- **Mitigation Strategy**: Admin dashboard should include resource health monitoring with automated periodic HTTP status checks (detecting 404s/410s) to alert admins of broken URLs.
