# UX Design Principles, Decision Log & Traceability

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 3 — UX Design  
**Author:** Sally (BMAD UX Designer)  
**Date:** September 21, 2026  
**Status:** Completed Design  

---

## 1. Core UX Design Principles

1. **Action Over Decoration:** Every visual element must directly serve the learner's immediate study task. Decorative graphics and gratuitous animations are eliminated.
2. **One Obvious Next Step:** The interface always makes the next learning action clear—whether it's checking off a topic, starting a Pomodoro block, or taking a quiz.
3. **Transparent Progress & Zero Ambiguity:** Progress metrics must be truthful and multi-tiered (Day, Week, Phase, Global) so learners know exactly how much work remains.
4. **Data Safety During Life Disruptions:** When learners reschedule or pause their journey, their learning history, notes, and quiz scores must remain 100% intact.
5. **Dark-First Engineering Craft:** The color palette is calibrated for intense, multi-hour technical study sessions with high contrast (WCAG 2.1 AA) and fixed-pitch JetBrains Mono typography.
6. **Optimistic & Immediate Feedback:** Subtopic toggles, quiz answer evaluations, and notes auto-saving respond instantaneously (<16ms UI updates) without blocking user input.
7. **Rest Is Part of the Curriculum:** Day 7 (Rest & Consolidation) is treated as a first-class learning state with recovery tips and assessment shortcuts, preventing burnout.
8. **Keyboard Discoverability:** Power users must be able to navigate days, toggle topics, save notes, and manage quizzes without taking their hands off the keyboard.
9. **Zero-Friction Re-Entry:** Returning learners must land directly on their active study day within a single click or launch.
10. **Accessibility as a Foundation:** Contrast ratios, visible focus rings, non-color indicators, and screen reader semantics are built into the core component architecture.

---

## 2. UX Decision Log

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            UX DECISION LOG MATRIX                           │
├────┬─────────────────────────────┬─────────────────┬────────────────────────┤
│ ID │ UX Decision Topic           │ Status          │ PM Confirmation Status │
├────┼─────────────────────────────┼─────────────────┼────────────────────────┤
│ UX1│ Dark-Mode Exclusivity (MVP) │ Adopted         │ Confirmed for MVP      │
│ UX2│ Bottom Tab Bar for Mobile   │ Adopted         │ UX Recommendation      │
│ UX3│ Canonical ID Note Anchoring │ Adopted         │ Confirmed in PRD       │
│ UX4│ Modal vs Inline Quiz UI     │ Adopted         │ UX Recommendation      │
│ UX5│ Debounced Auto-Save (1.2s)  │ Adopted         │ Confirmed in PRD       │
│ UX6│ Subtle Streak Freeze UI     │ Adopted         │ UX Recommendation      │
└────┴─────────────────────────────┴─────────────────┴────────────────────────┘
```

### In-Depth UX Decision Records:

#### Decision UX-1: Dark-Mode Exclusivity for Initial Releases
- **Decision:** Optimize 100% of MVP and V1 design tokens for dark mode (`#0d1117` base); defer light mode to V2.
- **Reason:** 98% of backend engineers prefer dark mode for terminal and IDE work. Dark mode ensures optimal contrast with code snippets and video embeds.
- **Alternatives Considered:** Building dual light/dark themes immediately. (Rejected: adds testing overhead and risks contrast regressions).

#### Decision UX-2: Mobile Bottom Tab Navigation
- **Decision:** On screens $< 768\text{px}$, replace the left sidebar with a fixed 4-tab bottom bar (`Today`, `Roadmap`, `Quiz`, `Notes`).
- **Reason:** One-handed mobile ergonomics make reaching top hamburger menus difficult during mobile study.
- **Alternatives Considered:** Hamburger-only drawer. (Rejected: hides active day navigation).

#### Decision UX-3: Modal Overlay for Quiz Assessments
- **Decision:** Render Daily, Weekly, and Phase quizzes as focused modal overlays (`.qov / #quiz-el`) rather than navigating to a separate URL page.
- **Reason:** Keeps the learner anchored in their daily study context. Once finished, dismissing the modal returns them directly to their day checklist without page reloads.

#### Decision UX-4: Debounced Auto-Saving with Discrete Status Badge
- **Decision:** Use a 1200ms debounce timer for note-saving combined with a subtle fading badge (`Note saved ✓`).
- **Reason:** Removes the cognitive burden of remembering to click "Save" while avoiding noisy toast alerts on every keystroke.

---

## 3. End-to-End UX Traceability Matrix

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       UX TRACEABILITY MATRIX                                                │
├──────────────────────┬──────────────────────┬────────┬─────────────────────────┬────────────────────────────┤
│ Phase 1 Finding      │ Phase 2 PRD Req      │ Epic # │ UX Screen / Modal       │ UX Component Specification │
├──────────────────────┼──────────────────────┼────────┼─────────────────────────┼────────────────────────────┤
│ Onboarding & Dates   │ FR-2.1, FR-2.3       │ EPIC 2 │ SCR-03 (Onboarding)     │ COMP-21 (ScheduleModal)    │
├──────────────────────┼──────────────────────┼────────┼─────────────────────────┼────────────────────────────┤
│ 52-Week Hierarchy    │ FR-3.1, FR-3.2       │ EPIC 3 │ SCR-05 (Roadmap View)   │ COMP-05 (PhaseAccordion)   │
├──────────────────────┼──────────────────────┼────────┼─────────────────────────┼────────────────────────────┤
│ Daily Learning Canvas│ FR-4.1, FR-4.2       │ EPIC 4 │ SCR-06 (Day Workspace)  │ COMP-08 (WorkspaceHeader)  │
├──────────────────────┼──────────────────────┼────────┼─────────────────────────┼────────────────────────────┤
│ Skip Guidance        │ FR-3.5               │ EPIC 4 │ SCR-06 (Day Workspace)  │ COMP-09 (SkipDirectives)   │
├──────────────────────┼──────────────────────┼────────┼─────────────────────────┼────────────────────────────┤
│ Subtopic Checklists  │ FR-5.1               │ EPIC 5 │ SCR-06 (Day Workspace)  │ COMP-10 (CheckboxRow)      │
├──────────────────────┼──────────────────────┼────────┼─────────────────────────┼────────────────────────────┤
│ Multi-Tier Progress  │ FR-5.2               │ EPIC 5 │ SCR-04, 12 (Progress)   │ COMP-25 (MultiProgressBar) │
├──────────────────────┼──────────────────────┼────────┼─────────────────────────┼────────────────────────────┤
│ Start Date Remapping │ FR-6.1, FR-6.2       │ EPIC 6 │ SCR-10 (Reschedule)     │ COMP-21 (ScheduleModal)    │
├──────────────────────┼──────────────────────┼────────┼─────────────────────────┼────────────────────────────┤
│ Course Pause/Resume  │ FR-6.3, FR-6.5       │ EPIC 6 │ SCR-11 (Pause Modal)    │ COMP-22 (PauseResumeModal) │
├──────────────────────┼──────────────────────┼────────┼─────────────────────────┼────────────────────────────┤
│ Dynamic Quiz Engine  │ FR-7.1 to FR-7.5     │ EPIC 7 │ SCR-07, 08 (Quiz Views) │ COMP-17, 18, 19, 20 (Quiz) │
├──────────────────────┼──────────────────────┼────────┼─────────────────────────┼────────────────────────────┤
│ Markdown Notes & URL │ FR-8.1 to FR-8.4     │ EPIC 8 │ SCR-06, 09 (Notes View) │ COMP-15, 16 (Notes/Links)  │
├──────────────────────┼──────────────────────┼────────┼─────────────────────────┼────────────────────────────┤
│ Pomodoro Focus Timer │ FR-9.1, FR-9.2       │ EPIC 9 │ SCR-06 (Day Workspace)  │ COMP-14 (PomodoroWidget)   │
├──────────────────────┼──────────────────────┼────────┼─────────────────────────┼────────────────────────────┤
│ 21-Day Activity Dots │ FR-9.3, FR-9.4       │ EPIC 9 │ SCR-04, 06 (Sidebar)    │ COMP-24 (StreakHeatmap)    │
├──────────────────────┼──────────────────────┼────────┼─────────────────────────┼────────────────────────────┤
│ LocalStorage Migrate │ FR-10.1 to FR-10.4   │ EPIC 10│ SCR-16 (Migration)      │ COMP-23 (MigrationModal)   │
├──────────────────────┼──────────────────────┼────────┼─────────────────────────┼────────────────────────────┤
│ Admin Curriculum CRUD│ FR-11.1 to FR-11.5   │ EPIC 11│ SCR-18 (Admin Editor)   │ COMP-28 (CurriculumTree)   │
└──────────────────────┴──────────────────────┴────────┴─────────────────────────┴────────────────────────────┘
```
