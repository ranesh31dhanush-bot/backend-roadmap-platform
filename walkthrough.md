# Sprint 7 Execution Walkthrough: Habits, Streaks & Pomodoro

## 1. Overview

Sprint 7 introduces habit-building, streak mechanics, and focus tools on top of the established learning workspace:
* **STRK-001**: User Activity Ledger & Daily Streak Engine (`user_streaks` collection, consecutive day tracking, automatic study activity recording).
* **STRK-002**: 21-Day Habit Building Matrix Visualization UI (3x7 glowing telemetry grid, streak flame badges, milestone celebration copy).
* **STRK-003**: Streak Freeze Logic (1 automatic freeze per calendar month, single-missed-day bridge protection, monthly replenishing).
* **STRK-004**: Built-in Pomodoro Study Timer (timestamp-based countdown resilient to browser throttling, tab title synchronization `(24:59)`, Web Audio synthesizer chime).

---

## 2. Changes Made

### Shared Models & Types
* [streaks.ts](file:///d:/Backend_dev/Backend_Roadmap_hosted/shared/src/types/streaks.ts): Added `HabitMatrixDayDTO`, `UserStreakDTO`, `RecordActivityRequestDTO`, `PomodoroSessionDTO`.

### Backend Modules
* [userStreak.model.ts](file:///d:/Backend_dev/Backend_Roadmap_hosted/backend/src/models/userStreak.model.ts): Mongoose schema with `userId`, `currentStreak`, `longestStreak`, `lastActiveDate`, `activityDates`, `freezeAvailable`, `freezeUsedAt`, `lastFreezeResetMonth`.
* [streaks.service.ts](file:///d:/Backend_dev/Backend_Roadmap_hosted/backend/src/modules/streaks/streaks.service.ts): Timezone-aware date calculations, consecutive streak computation, atomic freeze consumption, and rolling 21-day habit matrix generation.
* [streaks.controller.ts](file:///d:/Backend_dev/Backend_Roadmap_hosted/backend/src/modules/streaks/streaks.controller.ts) & [streaks.routes.ts](file:///d:/Backend_dev/Backend_Roadmap_hosted/backend/src/modules/streaks/streaks.routes.ts): REST endpoints mounted at `/api/v1/streaks`.
* Integrated automatic streak recording on:
  * Progress topic completion ([progress.service.ts](file:///d:/Backend_dev/Backend_Roadmap_hosted/backend/src/modules/progress/progress.service.ts))
  * Quiz submission ([quiz.service.ts](file:///d:/Backend_dev/Backend_Roadmap_hosted/backend/src/modules/quiz/quiz.service.ts))
  * Notes autosave ([notes.service.ts](file:///d:/Backend_dev/Backend_Roadmap_hosted/backend/src/modules/notes/notes.service.ts))

### Frontend Components & Pages
* [HabitMatrix21.tsx](file:///d:/Backend_dev/Backend_Roadmap_hosted/frontend/components/streaks/HabitMatrix21.tsx): 3x7 glowing habit matrix with milestone banners and tooltip status details.
* [PomodoroTimer.tsx](file:///d:/Backend_dev/Backend_Roadmap_hosted/frontend/components/timer/PomodoroTimer.tsx): Focus timer with presets (25m Focus / 5m Break / 15m Rest), tab title updates, Web Audio chime, and automatic streak recording on completion.
* [dashboard/page.tsx](file:///d:/Backend_dev/Backend_Roadmap_hosted/frontend/app/(learner)/dashboard/page.tsx): Embedded streak flame counter and `<HabitMatrix21 />`.
* [workspace/page.tsx](file:///d:/Backend_dev/Backend_Roadmap_hosted/frontend/app/(learner)/workspace/page.tsx): Integrated top streak pill and sidebar `<PomodoroTimer />`.

### Strict Streak Qualification & Habit Recalibration
* **Strict Daily Completion Engine**: Updated [streaks.service.ts](file:///d:/Backend_dev/Backend_Roadmap_hosted/backend/src/modules/streaks/streaks.service.ts) with `syncLearnerStreakFromCompletedDays`. A day qualifies as an active streak day **ONLY** when:
  1. **All subtopics** for that canonical day are marked completed (`completedSubtopics >= totalSubtopics`).
  2. The **day-wise quiz** is completed and submitted (`QuizAttempt` with `status: "submitted"`).
* **Decoupled Partial Actions**: Note saves and single subtopic checks alone no longer increment the streak.
* **Auto-Synchronization & Record Fix**: Whenever a topic is toggled or a quiz is submitted, the learner's active streak AND historical record (`longestStreak`) are recalculated deterministically via `calculateLongestConsecutiveDays`. Stale fake records (e.g. `🏆 2d`) were completely eliminated and reset to `🏆 0d`.
* **Program Start Date Anchoring**: Connected `UserScheduleModel` to `StreaksService`. The 21-Day Habit Matrix now begins on the learner's actual onboarding `startDate` (`2026-09-22` -> Day 1: `09-22`, Day 2: `09-23` [Today], Days 3–21: `Upcoming` [○]), rather than arbitrarily projecting 20 days into the pre-registration past (`09-03`).
* **TypeScript IDE Fix**: Resolved strict null-check error on `lastActiveDate` index access.

### SKIP Directives ("Do not waste time on:")
* **Curriculum Canonical Data Ingestion**: Extracted all `skipItems` definitions from [backend_roadmap_final_with_links.html](file:///d:/Backend_dev/Backend_Roadmap_hosted/backend_roadmap_final_with_links.html) across 10 critical modules and project weeks (70 canonical study days).
* **Database Migration**: Updated [curriculum_canonical_v1.json](file:///d:/Backend_dev/Backend_Roadmap_hosted/backend/src/seeds/curriculum_canonical_v1.json) and executed idempotent bulk-write in MongoDB Atlas via `seedCurriculum.ts` (147 nodes matched and updated).
* **Workspace Integration**: Implemented the styled `SKIP` banner in [workspace/page.tsx](file:///d:/Backend_dev/Backend_Roadmap_hosted/frontend/app/(learner)/workspace/page.tsx) with the exact visual treatment from the reference blueprint: red-tinted container, uppercase section divider, `Do not waste time on:` heading, and `✕` bullet markers.
* **Curriculum Roadmap Alignment**: Updated [curriculum/page.tsx](file:///d:/Backend_dev/Backend_Roadmap_hosted/frontend/app/(learner)/curriculum/page.tsx) right-hand detail pane to share the same red-themed skip directive styling.

---

## 3. Verification Results

* **Backend Tests**: 29 test files, **201/201 PASS (100%)**
* **Frontend TypeScript**: Clean compile with 0 errors (`tsc --noEmit`)
* **Strict Streak Validation**: Verified that incomplete days evaluate strictly to `0 Day Streak` and `🏆 0d Record`.
* **Browser UI Verification**: Confirmed visually via Chrome subagent that headings and copy render in clear, classical font, Record displays `🏆 0d`, the 21-day matrix begins on `09-22`, and the `SKIP` section renders identically to the design reference.
* **Documentation**: Updated [USER_GUIDE.md](file:///d:/Backend_dev/Backend_Roadmap_hosted/USER_GUIDE.md) with SKIP directives documentation and embedded screenshot [workspace_skip_section.png](file:///d:/Backend_dev/Backend_Roadmap_hosted/docs/screenshots/workspace_skip_section.png).

