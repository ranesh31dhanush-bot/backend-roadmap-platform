# Design System, Typography & Layout Specification

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 3 — UX Design  
**Author:** Sally (BMAD UX Designer)  
**Date:** September 21, 2026  
**Status:** Completed Design  

---

## 1. Design System Philosophy

The **Top 1% Backend Roadmap Platform** uses a **Dark-First, Precision Engineering Aesthetic**. 

Inspired by high-performance developer environments (GitHub dark mode, JetBrains IDEs, Linear, Warp), the design eliminates visual noise, delivers exceptional contrast for long night-study sessions, and uses semantic colors purposefully rather than decoratively.

```
                      DESIGN TOKEN HIERARCHY
  ┌─────────────────────────┐     ┌─────────────────────────┐
  │     CANONICAL TOKENS    │ ──► │     SEMANTIC USAGE      │
  │ • Deep Canvas (#0d1117) │     │ • Primary Workspace Bg  │
  │ • Slate Surface (#161b22│     │ • Cards, Sidebar, Modals│
  │ • Cyan Accent (#58a6ff) │     │ • Active Highlights & UI│
  │ • Terminal (#3fb950)    │     │ • Complete, Passed, Safe│
  │ • Amber Core (#d29922)  │     │ • In-Progress, Streaks  │
  └─────────────────────────┘     └─────────────────────────┘
```

> **UX Recommendation on Light Mode:** Light mode is **explicitly deferred to V2**. Dark mode is the canonical industry standard for backend systems engineers. Focusing exclusively on a world-class dark-mode experience ensures maximum Polish and WCAG 2.1 AA contrast compliance without design compromises.

---

## 2. Semantic Color System

### 2.1 Base Canvas & Surface Elevation Tokens

| Token Name | Hex Value | Semantic Usage |
|---|---|---|
| `--bg` (Base Canvas) | `#0d1117` | Root viewport background. |
| `--s1` (Surface Level 1)| `#161b22` | Sidebar background, modal container boxes, app header. |
| `--s2` (Surface Level 2)| `#1c2333` | Interactive cards, day panels, input fields, stat tiles. |
| `--s3` (Surface Level 3)| `#21262d` | Hover states, progress bar track backgrounds, button hovers. |
| `--b1` (Subtle Border) | `#30363d` | Standard divider lines, card outlines, container borders. |
| `--b2` (Muted Border)  | `#484f58` | Interactive element hover borders, focused input outlines. |

### 2.2 Text & Typography Colors

| Token Name | Hex Value | Contrast Ratio on `--bg` | Semantic Usage |
|---|---|---|---|
| `--t1` (Primary Text)  | `#e6edf3` | **14.8:1** (AAA) | Headings, active checklist labels, titles. |
| `--t2` (Secondary Text)| `#8b949e` | **6.4:1** (AA)  | Descriptions, metadata, secondary instructions. |
| `--t3` (Muted Text)    | `#6e7681` | **4.6:1** (AA)  | Footers, timestamps, disabled labels. |

### 2.3 Semantic Status & Intent Tokens

| Token Name | Core Hex | Subtle Alpha Tint (`*L`) | Semantic Usage |
|---|---|---|---|
| `--acc` (Primary Accent) | `#58a6ff` | `rgba(88, 166, 255, 0.12)` | Primary CTAs, active links, focused tabs. |
| `--grn` (Success / Done) | `#3fb950` | `rgba(63, 185, 80, 0.12)`  | Completed topics, passed quizzes, start date. |
| `--amb` (Warning / Streak)| `#d29922`| `rgba(210, 153, 34, 0.12)` | Active streaks, warning badges, paused course. |
| `--red` (Destructive / Skip)|`#f85149`| `rgba(248, 81, 73, 0.12)`  | Skip directives, failed quizzes, errors. |
| `--prp` (Assessment)     | `#bc8cff` | `rgba(188, 140, 255, 0.12)`| Quiz triggers, certification badges, exams. |

### 2.4 Curriculum Phase Identity Tokens

| Phase Number & Title | Theme Accent Hex | Background Tint |
|---|---|---|
| **Phase 1: Foundation** | `#00e676` (Emerald) | `rgba(0, 230, 118, 0.08)` |
| **Phase 2: Core Backend Skills** | `#29b6f6` (Sky Blue) | `rgba(41, 182, 246, 0.08)` |
| **Phase 3: Production-Grade Thinking** | `#ff9800` (Amber) | `rgba(255, 152, 0, 0.08)` |
| **Phase 4: Advanced Systems** | `#ce93d8` (Lavender) | `rgba(206, 147, 216, 0.08)` |
| **Phase 5: Top 1% Differentiators** | `#ff6b6b` (Coral) | `rgba(255, 107, 107, 0.08)` |

---

## 3. Typography Hierarchy

### 3.1 Typeface Families
- **UI & Reading Font:** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
  - High legibility, neutral geometry, optical kerning for dense technical documentation.
- **Code, Data, Numbers & Telemetry:** `'JetBrains Mono', 'Fira Code', monospace`
  - Fixed-pitch clarity for calendar dates, streak counts, telemetry stats, and code snippets.

### 3.2 Type Scale & Sizing Standards

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TYPOGRAPHY SCALE MATRIX                           │
├────────────────────┬──────────┬────────┬─────────────┬──────────────────────┤
│ LEVEL / ROLE       │ FONT     │ SIZE   │ WEIGHT      │ LINE HEIGHT / USAGE  │
├────────────────────┼──────────┼────────┼─────────────┼──────────────────────┤
│ Display Hero (H1)  │ Inter    │ 28px   │ 700 (Bold)  │ 1.25 / Onboarding    │
│ Page Title (H2)    │ Inter    │ 22px   │ 700 (Bold)  │ 1.3  / Day Title     │
│ Section Title (H3) │ Inter    │ 16px   │ 600 (Semi)  │ 1.4  / Modal Headers │
│ Section Label (H4) │ Inter    │ 11px   │ 600 (Upper) │ 1.5  / `sec-t` Caps  │
│ Body Regular       │ Inter    │ 14px   │ 400 (Reg)   │ 1.6  / Workspace     │
│ Body Small         │ Inter    │ 13px   │ 400 (Reg)   │ 1.55 / Descriptions  │
│ Micro Meta         │ Inter    │ 11px   │ 500 (Med)   │ 1.4  / Badges, LPA   │
│ Code / Notes Editor│ JB Mono  │ 12.5px │ 400 (Reg)   │ 1.7  / Notes textarea│
│ Telemetry Large    │ JB Mono  │ 22px   │ 700 (Bold)  │ 1.0  / Big Stats     │
│ Telemetry Standard │ JB Mono  │ 13px   │ 600 (Semi)  │ 1.0  / Header stats  │
│ Badge / Pill Label │ JB Mono  │ 10px   │ 600 (Semi)  │ 1.0  / Phase chip    │
└────────────────────┴──────────┴────────┴─────────────┴──────────────────────┘
```

---

## 4. Spacing, Elevation & Layout Grid

### 4.1 Spacing Scale (4px Base Metric)
- `space-1` = `4px` (Tight padding between badge icons and labels)
- `space-2` = `8px` (Standard gap between grid items, chip margins)
- `space-3` = `12px` (Internal card padding for dense controls)
- `space-4` = `16px` (Standard card and section container padding)
- `space-6` = `24px` (Major workspace margins and section dividers)
- `space-8` = `32px` (Modal internal padding, hero banners)

### 4.2 Border Radii (`Border-Radius`)
- `--r-sm` = `4px` (Checkboxes, tag pills, small buttons)
- `--r-md` = `6px` (Cards, topic checklist rows, input fields)
- `--r-lg` = `10px` (Stat cards, timer panels)
- `--r-xl` = `12px` (Modal windows, dialog containers)
- `--r-pill` = `9999px` (Status chips, today badges, avatar rings)

### 4.3 App Shell Structural Dimensions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DESKTOP APP DIMENSIONS                             │
├───────────────────────────────┬─────────────────────────────────────────────┤
│ Top Navigation Height         │ 56px (Fixed sticky, z-index: 200)           │
│ Primary Sidebar Width         │ 260px (Fixed sticky, overflow-y: auto)      │
│ Main Canvas Container Width   │ Max 1100px (Centered, fluid flex-1)         │
│ Modal Max-Width (Standard)    │ 460px (Onboarding, Reschedule, Pause)       │
│ Modal Max-Width (Quiz / Study)│ 620px (Interactive Assessment Dialog)       │
│ Scrollbar Width               │ 4px (Slim custom track with `--b1` thumb)   │
└───────────────────────────────┴─────────────────────────────────────────────┘
```

---

## 5. Micro-Interactions & Motion Design

1. **Checkbox Toggle:** When clicked, the checkbox performs a subtle 120ms scale bounce (`transform: scale(1.08) $\rightarrow$ 1.0`) while the text transitions strikethrough color smoothly.
2. **Quiz Answer Feedback:** Instant 150ms border-color and background-tint transition to green or red upon submission.
3. **Notes Auto-Save Indicator:** Discrete opacity fade (`0 $\rightarrow$ 1 $\rightarrow$ 0` over 2 seconds) of the green `Note saved ✓` status badge.
4. **Pause Banner Animation:** Subtle 2-second breathing pulse on the `⏸ PAUSED` amber chip (`opacity: 1.0 $\rightarrow$ 0.6 $\rightarrow$ 1.0`).
5. **Toast Notifications:** Smooth slide-up entry from bottom-right (`translateY(10px) $\rightarrow$ translateY(0)` over 200ms ease-out).
