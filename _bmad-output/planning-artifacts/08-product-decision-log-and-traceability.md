# Product Decision Log & Traceability Matrix

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 2 — Product Manager (PRD & Specifications)  
**Author:** John (BMAD Product Manager)  
**Date:** September 21, 2026  
**Status:** Completed  

---

## 1. Product Decision Log

This log formalizes all open architectural and business decisions identified during Phase 1 Discovery, providing the context, evaluated options, trade-off analysis, product recommendations, and required stakeholder sign-offs.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRODUCT DECISION MATRIX                             │
├────┬─────────────────────────────┬─────────────────┬────────────────────────┤
│ ID │ Decision Topic              │ Status          │ Stakeholder Action     │
├────┼─────────────────────────────┼─────────────────┼────────────────────────┤
│ D1 │ Curriculum Customization    │ Proposed        │ Approve Canonical Mode │
│ D2 │ Topic Gating vs Self-Paced  │ Proposed        │ Approve Self-Paced + Q │
│ D3 │ Curriculum Version Strategy │ Proposed        │ Approve Semantic Model │
│ D4 │ Project Verification Scope  │ Proposed        │ Approve URL (MVP) / CI │
│ D5 │ Streak Forgiveness Policy   │ Proposed        │ Approve 1 Freeze/Mo    │
│ D6 │ Offline vs Cloud-First Sync │ Proposed        │ Approve Cloud + Optim. │
└────┴─────────────────────────────┴─────────────────┴────────────────────────┘
```

### In-Depth Decision Records:

#### Decision 1: Curriculum Customization vs. Strict Canonical Path
- **Context:** Should learners be allowed to rearrange weeks, hide topics, or create custom tracks, or must all learners follow the canonical 52-week path?
- **Options Evaluated:**
  - *Option A (Full Customization):* Learners can reorder weeks and toggle custom modules. *(High data model complexity; breaks cohort comparisons).*
  - *Option B (Strict Canonical Path — Recommended):* All learners follow the validated 52-week roadmap. *(Preserves curriculum integrity, simplifies caching, enables direct peer benchmarks).*
- **Product Recommendation:** Adopt **Option B**. The platform's identity is an opinionated, zero-fluff accelerator.

#### Decision 2: Topic Completion Gating vs. Flexible Self-Reporting
- **Context:** Should checking topics require mandatory quiz passage ($\ge 75\%$) to unlock the next day, or should topic completion remain self-paced?
- **Options Evaluated:**
  - *Option A (Hard Gating):* Day $N+1$ is locked until Day $N$ quiz is passed with $\ge 75\%$. *(Can create high friction and abandonment if questions are tough).*
  - *Option B (Self-Paced with Milestone Gating — Recommended):* Topic checking is unblocked for maximum learner agency, but weekly completion checkmarks (`✓`) and phase credentials require $\ge 75\%$ on weekly/phase assessments.
- **Product Recommendation:** Adopt **Option B**. Maximizes learner autonomy while maintaining rigorous verification for milestone badges.

#### Decision 3: Curriculum Versioning & Active Cohort Update Strategy
- **Context:** When curriculum authors update topics or replace dead resources in Week 4, how should this affect learners currently on Week 10?
- **Options Evaluated:**
  - *Option A (Global Silent Update):* Overwrites all content in-place. *(Risk of orphaning checked topics).*
  - *Option B (Canonical ID + Semantic Versioning — Recommended):* Topics have immutable canonical IDs. Non-breaking changes (resource links, typo fixes) sync immediately. Breaking changes trigger an optional learner upgrade prompt: *"Curriculum update available — Click to upgrade."*
- **Product Recommendation:** Adopt **Option B**. Guaranteed zero progress loss for active learners.

#### Decision 4: Project Verification Scope for MVP vs. V1
- **Context:** The roadmap specifies 15 major capstone projects. How should project completion be verified?
- **Options Evaluated:**
  - *Option A (Automated CI/CD Sandbox in MVP):* Automates test execution against user repos. *(Overly complex for MVP; delays launch).*
  - *Option B (Milestone URL Submission in MVP $\rightarrow$ Automated CI in V2 — Recommended):* MVP allows learners to store GitHub Repository & Live Demo URLs with status tracking; V1 introduces admin rubrics; V2 introduces automated test runners.
- **Product Recommendation:** Adopt **Option B**.

#### Decision 5: Streak Forgiveness & Grace Periods
- **Context:** Real-world life events (emergencies, illness) can break long streaks, causing severe demotivation.
- **Options Evaluated:**
  - *Option A (Zero Forgiveness):* Missed day immediately resets streak to 0. *(High churn risk after broken 60+ day streaks).*
  - *Option B (1 Monthly Streak Freeze — Recommended):* Provide 1 automatic "Streak Freeze" per calendar month, allowing a 24-hour grace window.
- **Product Recommendation:** Adopt **Option B**. Proven in consumer habit psychology (Duolingo model) to maximize long-term retention.

---

## 2. End-to-End Traceability Matrix

This matrix maps every Phase 1 Discovery Finding directly to its Product Requirement (FR/NFR), Epic, User Story, and Acceptance Criteria.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       TRACEABILITY MATRIX                                                   │
├──────────────────────┬──────────────────────┬────────┬─────────────────────────┬────────────────────────────┤
│ Phase 1 Finding      │ Product Req (FR/NFR) │ Epic # │ User Story ID           │ Acceptance Criteria ID     │
├──────────────────────┼──────────────────────┼────────┼─────────────────────────┼────────────────────────────┤
│ A-1: Onboarding &    │ FR-2.1, FR-2.2,      │ EPIC 2 │ US-2.1 (Start Date &    │ AC-2.1.1, AC-2.1.2,        │
│ Schedule Preview     │ FR-2.3, FR-2.4       │        │ Schedule Preview)       │ AC-2.1.3                   │
├──────────────────────┼──────────────────────┼────────┼─────────────────────────┼────────────────────────────┤
│ D-1: 52-Week 5-Phase │ FR-3.1, FR-3.2,      │ EPIC 3 │ US-3.1 (Curriculum      │ AC-3.1.1, AC-3.1.2,        │
│ Roadmap Hierarchy    │ FR-3.3, FR-3.6       │        │ Hierarchy Browsing)     │ AC-3.1.3, AC-3.2.1         │
├──────────────────────┼──────────────────────┼────────┼─────────────────────────┼────────────────────────────┤
│ E-1: Skip Directives │ FR-3.5, FR-4.1,      │ EPIC 4 │ US-4.1 (Daily Workspace │ AC-4.1.1, AC-4.1.2,        │
│ & Curated Resources  │ FR-4.4               │        │ & Skip Directives)      │ AC-4.2.1, AC-4.2.2         │
├──────────────────────┼──────────────────────┼────────┼─────────────────────────┼────────────────────────────┤
│ F-1: Subtopic Ticks  │ FR-5.1, FR-5.2,      │ EPIC 5 │ US-5.1 (Topic Toggling  │ AC-5.1.1, AC-5.1.2,        │
│ & Rollup Percentages │ FR-5.3, FR-5.4       │        │ & Multi-Tier Rollup)    │ AC-5.1.3                   │
├──────────────────────┼──────────────────────┼────────┼─────────────────────────┼────────────────────────────┤
│ G-1: Multi-Tier Quiz │ FR-7.1, FR-7.2,      │ EPIC 7 │ US-7.1 (Daily Topic-    │ AC-7.1.1, AC-7.1.2,        │
│ Engine & Answers     │ FR-7.3, FR-7.5       │        │ Matched Quiz Engine)    │ AC-7.1.3                   │
├──────────────────────┼──────────────────────┼────────┼─────────────────────────┼────────────────────────────┤
│ H-1: Debounced Notes │ FR-8.1, FR-8.2,      │ EPIC 8 │ US-8.1 (Markdown Notes) │ AC-8.1.1, AC-8.1.2,        │
│ & External Links     │ FR-8.3, FR-8.4       │        │ US-8.2 (Study Links)    │ AC-8.2.1, AC-8.2.2         │
├──────────────────────┼──────────────────────┼────────┼─────────────────────────┼────────────────────────────┤
│ I-1: Pomodoro Focus  │ FR-9.1, FR-9.2       │ EPIC 9 │ US-9.1 (Focus Pomodoro  │ AC-9.1.1, AC-9.1.2         │
│ Timer Presets        │                      │        │ Timer)                  │                            │
├──────────────────────┼──────────────────────┼────────┼─────────────────────────┼────────────────────────────┤
│ J-1: Daily Streak &  │ FR-9.3, FR-9.4       │ EPIC 9 │ US-9.2 (Timezone-Aware  │ AC-9.2.1, AC-9.2.2         │
│ Activity Heatmap     │                      │        │ Streaks & Activity Dot) │                            │
├──────────────────────┼──────────────────────┼────────┼─────────────────────────┼────────────────────────────┤
│ K-1: Reschedule &    │ FR-6.1, FR-6.2,      │ EPIC 6 │ US-6.1 (Reschedule Remap│ AC-6.1.1, AC-6.1.2,        │
│ Course Pause/Resume  │ FR-6.3, FR-6.5       │        │ US-6.2 (Pause / Resume) │ AC-6.2.1, AC-6.2.2         │
├──────────────────────┼──────────────────────┼────────┼─────────────────────────┼────────────────────────────┤
│ N-1: LocalStorage    │ FR-10.1, FR-10.2,    │ EPIC 10│ US-10.1 (Legacy Browser │ AC-10.1.1, AC-10.1.2       │
│ Migration Bridge     │ FR-10.3, FR-10.4     │        │ Cloud Migration Bridge) │                            │
├──────────────────────┼──────────────────────┼────────┼─────────────────────────┼────────────────────────────┤
│ O-1: Centralized     │ FR-11.1, FR-11.2,    │ EPIC 11│ US-11.1 (Curriculum CRUD│ AC-11.1.1, AC-11.1.2,      │
│ Admin Content CRUD   │ FR-11.4, FR-11.5     │        │ US-11.2 (Quiz Bank CRUD)│ AC-11.2.1                  │
├──────────────────────┼──────────────────────┼────────┼─────────────────────────┼────────────────────────────┤
│ NFR-1 to NFR-6       │ NFR-1 (Latency),     │ System │ All Epics               │ End-to-End Verification    │
│ Platform Standards   │ NFR-2 (OWASP Sec)    │        │                         │ & Automated Test Suites    │
└──────────────────────┴──────────────────────┴────────┴─────────────────────────┴────────────────────────────┘
```
