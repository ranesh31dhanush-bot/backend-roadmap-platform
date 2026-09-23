# UX Component Inventory & State Specifications

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 3 — UX Design  
**Author:** Sally (BMAD UX Designer)  
**Date:** September 21, 2026  
**Status:** Completed Design  

---

## 1. Master Component Inventory (30 Core Components)

```
  ┌─────────────────────────────────────────────────────────────────────────┐
  │                         COMPONENT CATALOG                               │
  ├──────────┬────────────────────────────┬──────────┬──────────────────────┤
  │ COMP-01  │ AppShell                   │ COMP-16  │ ExternalLinkButton   │
  │ COMP-02  │ HeaderNav                  │ COMP-17  │ QuizModalContainer   │
  │ COMP-03  │ TelemetryBadge             │ COMP-18  │ QuizOptionButton     │
  │ COMP-04  │ SidebarContainer           │ COMP-19  │ PedagogicalRationale │
  │ COMP-05  │ PhaseAccordionItem         │ COMP-20  │ QuizResultsCard      │
  │ COMP-06  │ WeekListItem               │ COMP-21  │ ScheduleModal        │
  │ COMP-07  │ WeekCalendarStrip          │ COMP-22  │ PauseResumeModal     │
  │ COMP-08  │ DayWorkspaceHeader         │ COMP-23  │ MigrationBridgeModal │
  │ COMP-09  │ SkipDirectivesCard         │ COMP-24  │ StreakMatrixHeatmap  │
  │ COMP-10  │ SubtopicCheckboxRow        │ COMP-25  │ MultiTierProgressBar │
  │ COMP-11  │ CuratedResourceCard        │ COMP-26  │ ToastNotification    │
  │ COMP-12  │ SalaryMilestoneCard        │ COMP-27  │ ConfirmationDialog   │
  │ COMP-13  │ AssessmentTriggerStrip     │ COMP-28  │ AdminCurriculumTree  │
  │ COMP-14  │ PomodoroFocusWidget        │ COMP-29  │ AdminDataTable       │
  │ COMP-15  │ MarkdownNotesEditor        │ COMP-30  │ EmptyAndErrorState   │
  └──────────┴────────────────────────────┴──────────┴──────────────────────┘
```

---

## 2. Component Specifications & State Matrices

### COMP-10: SubtopicCheckboxRow
- **Role:** Interactive micro-learning checklist item.
- **Props / Inputs:** `topicId`, `title`, `isCompleted`, `disabled`, `onToggle()`.
- **Visual Anatomy:** Left 18px rounded checkbox + Right descriptive text label.
- **State Matrix:**

| State | Checkbox Box | Icon | Text Styling | Background Tint |
|---|---|---|---|---|
| **Normal / Unchecked** | `1.5px solid #484f58` | Hidden | `--t1` (#e6edf3) | `--s2` (#1c2333) |
| **Hover** | `1.5px solid #58a6ff` | Hidden | `--t1` | `--s3` (#21262d) |
| **Active / Click** | Scale 1.08 bounce | Appears | `--t2` strikethrough | `--grnL` (Green tint) |
| **Completed / Checked**| Filled Green `#3fb950` | White `✓`| Strikethrough `#8b949e` | `rgba(63, 185, 80, 0.1)` |
| **Disabled / Syncing** | Opacity 0.5 | As is | Cursor not-allowed | Base |

---

### COMP-11: CuratedResourceCard
- **Role:** Vetted educational link launcher.
- **Props / Inputs:** `type ('yt' | 'article' | 'github')`, `title`, `url`.
- **Visual Anatomy:** Media Icon badge + Type Label + Truncated Title.
- **State Matrix:**

| State | Left Icon Badge | Type Text Color | Border Outline | Background |
|---|---|---|---|---|
| **YouTube (`yt`)** | Red `▶` badge | `--red` (#f85149) | `rgba(248, 81, 73, 0.18)` | `--s2` |
| **Article (`article`)**| Cyan `📄` badge | `--acc` (#58a6ff) | `--b1` (#30363d) | `--s2` |
| **GitHub (`github`)** | Slate `⬡` badge | `--t2` (#8b949e) | `--b1` (#30363d) | `--s2` |
| **Card Hover** | Subtle glow | Elevated | `--b2` (#484f58) | `--s3` (#21262d) |

---

### COMP-15: MarkdownNotesEditor
- **Role:** Day-bound rich technical reflection editor with debounced auto-save.
- **Props / Inputs:** `canonicalDayId`, `initialContent`, `onSave()`.
- **States:**
  - `Idle / Saved`: Displays discrete green badge `Note saved ✓` (fades out after 2s).
  - `Editing / Dirty`: Displays subtle amber status `Saving...` during typing.
  - `Error / Offline`: Displays red alert `Failed to save — Retrying in background` with manual `💾 Retry Save` button.

---

### COMP-18: QuizOptionButton
- **Role:** Multiple-choice quiz option selector with server-evaluated feedback.
- **Props / Inputs:** `index (0..3)`, `optionText`, `selected`, `evaluatedStatus ('correct' | 'wrong' | 'unselected')`, `disabled`, `onSelect()`.
- **State Matrix:**

| State | Border | Background | Text Color | Trailing Icon |
|---|---|---|---|---|
| **Default** | `1px solid #30363d` | Transparent | `--t1` (#e6edf3) | None |
| **Hover** | `1px solid #484f58` | `--s2` (#1c2333) | `--t1` | None |
| **Evaluated Correct** | `1.5px solid #3fb950` | `rgba(63, 185, 80, 0.15)` | `#3fb950` | `✅` |
| **Evaluated Wrong** | `1.5px solid #f85149` | `rgba(248, 81, 73, 0.15)` | `#f85149` | `❌` |
| **Locked / Unselected**| `1px solid #21262d` | Transparent | Opacity 0.4 | None |

---

### COMP-24: StreakMatrixHeatmap
- **Role:** Rolling 21-day activity accountability visualization in sidebar.
- **Props / Inputs:** `historyArray [21 days]`.
- **Visual Nodes (`s-dot`):**
  - `Done`: Filled Green `#3fb950` ($7\text{px} \times 7\text{px}$, 2px radius).
  - `Today`: Filled Amber `#d29922` with pulse ring.
  - `Rest / Missed`: Filled Muted Slate `#21262d`.

---

### COMP-26: ToastNotification
- **Role:** Ephemeral system confirmation message.
- **Props / Inputs:** `message`, `type ('info' | 'success' | 'warning' | 'error')`, `duration (3000ms)`.
- **Positioning:** Fixed bottom-right (`bottom: 24px`, `right: 24px`, `z-index: 999`).
- **Animation:** Entry slide-up + fade-in (200ms); Exit fade-out (150ms).
