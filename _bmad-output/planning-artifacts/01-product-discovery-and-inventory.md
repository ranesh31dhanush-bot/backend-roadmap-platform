# Product Discovery & Current System Inventory

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 1 — Product Discovery & Analysis  
**Author:** Mary (BMAD Business Analyst)  
**Date:** September 21, 2026  
**Status:** Completed Analysis  

---

## 1. Executive Summary & Source Material Synthesis

This document presents a comprehensive audit and product discovery of the existing **Top 1% Backend Developer Roadmap** application and associated source materials. 

### Source Materials Inspected:
1. **Interactive Application (`backend_roadmap_final_with_links.html`)**:
   - Single-file client-side interactive web application (~284 KB, 3,418 LOC).
   - High-density dark-mode learning workspace with day-by-day progression, calendar views, timer, note-taking, external resource curation, quiz engine, schedule remapping, and course pause/resume.
   - Currently details **21 weeks** across 5 phases (147 days total: 131 active study days, 16 rest/consolidation days), housing **813 individual subtopics**, **454 curated learning resources** (YouTube, official documentation, GitHub repositories), **9 domain quiz banks**, **2 weekly assessments**, and **3 comprehensive phase exams**.
2. **Master Curriculum Document (`Top1_Backend_Roadmap.pdf`)**:
   - 6-page comprehensive curriculum framework detailing the full **52-week (12-month)** philosophy, 5 learning phases, 32 core milestones, explicit "SKIP" guidance, 12 multi-tiered milestone projects, and Top 1% differentiator competencies.
3. **Iterative Development Variants (`/dev/`)**:
   - `backend_roadmap_final_with_pause.html`, `backend_roadmap_final_With_Project.html`, `backend_roadmap_final_With_Edit.html`, etc., showcasing progressive feature additions (such as PDF links, ChatGPT prompts, and schedule pause algorithms).

---

## 2. Deep-Dive Current Product Inventory (A through R)

### A. Current Application Pages & Screens
The current application operates as a single-page reactive dashboard with modal overlays:
1. **Onboarding Screen (`#ob`)**: Initial modal overlay displayed when no `startDate` exists in `localStorage`. Features a 5-phase duration breakdown, start date selector, and an interactive real-time month-by-month schedule visualization bar graph.
2. **Main Dashboard**:
   - **Top Navigation & Live Telemetry Bar**: Persistent sticky header showing overall completion metrics, streak counter, remaining days, and utility action triggers.
   - **Left Navigation Sidebar (`aside.sb`)**: Sticky sidebar showing total progress percentage, mini-stat grid, phase selector list with LPA badges, week selector list with completion checkmarks, 21-day rolling activity heatmap, and recent quiz score history.
   - **Central Day Workspace (`main.mc`)**: Dynamic container displaying day metadata, weekday calendar strip, skip directives, interactive topic checklists, 2-column external resource cards, phase capstone project cards, market compensation (LPA) benchmarks, assessment triggers, Pomodoro focus timer, third-party ChatGPT/PDF notes links, and inline daily notes textarea.
3. **Rest & Consolidation Screen**: Rendered in `main.mc` on designated rest days (e.g., Day 7 of weeks). Features recovery tips, reflection notes textarea, and week/phase quiz shortcuts.
4. **Schedule Reschedule Modal (`#rs-modal`)**: Modal allowing learners to remap their `startDate` while preserving all completed topic checkmarks, quiz scores, and saved notes.
5. **Course Pause / Resume Modal (`#pause-modal`)**: Modal allowing learners to temporarily freeze course progression, dynamically calculating pause duration and shifting future start dates forward upon resumption.
6. **Interactive Quiz Overlay (`.qov / #quiz-el`)**: Fullscreen modal hosting interactive multiple-choice tests with immediate visual feedback, detailed pedagogical explanations, progress indicators, scoring breakdown, and grade tiers.

### B. Current Navigation Architecture
- **Hierarchical Drill-down**: Phase Selection (1–5) $\rightarrow$ Week Selection (1–21/52) $\rightarrow$ Day Navigation (1–7 per week).
- **Temporal Shortcuts**: 
  - `Today` button (snaps directly to the calculated calendar day matching `todayStr()`).
  - `← Prev` and `Next →` buttons for step-by-step chronological navigation.
  - Keyboard shortcuts: `ArrowLeft` (previous day), `ArrowRight` (next day), and `Ctrl+S` / `Cmd+S` (save notes).
- **Interactive Calendar Navigation**: Top week calendar bar (`.wcal`) allows direct clicking between days of the active week with rest and completion indicators.

### C. Current User Flows
1. **First-Time Onboarding Flow**: User visits site $\rightarrow$ prompted to select start date $\rightarrow$ reviews 12-month phase distribution $\rightarrow$ clicks "Start My Journey" $\rightarrow$ date mapping generated $\rightarrow$ lands on Phase 1, Week 1, Day 1.
2. **Daily Study Flow**: User logs in $\rightarrow$ clicks "Today" $\rightarrow$ reads day title/description and "Skip" directives $\rightarrow$ starts Focus Pomodoro timer $\rightarrow$ opens external resources (YouTube/Docs) $\rightarrow$ studies topic $\rightarrow$ checks off subtopics as completed $\rightarrow$ writes reflections in Notes textarea $\rightarrow$ clicks "Take Today's Quiz" $\rightarrow$ completes 5 questions $\rightarrow$ reviews explanations and score.
3. **Life Disruption / Pause Flow**: User needs time off $\rightarrow$ clicks "Pause" $\rightarrow$ activates pause state $\rightarrow$ returns weeks later $\rightarrow$ clicks "Resume" $\rightarrow$ system calculates delta days $\rightarrow$ automatically shifts `startDate` and remaps all 364 calendar slots forward $\rightarrow$ resumes exactly where left off without breaking streak or calendar alignment.

### D. Current Roadmap Structure
- **5 Core Phases**:
  - **Phase 1: Foundation** (Weeks 1–6) — Language internals, TCP/IP, DNS, raw HTTP server, Linux CLI, PostgreSQL fundamentals, Git.
  - **Phase 2: Core Backend Skills** (Weeks 7–18) — REST API design, Express/FastAPI, DB design, Redis caching, JWT/OAuth auth, BullMQ queues, Testing (Jest), Docker.
  - **Phase 3: Production-Grade Thinking** (Weeks 19–28) — CI/CD, Observability (Prometheus/Grafana/Loki), AWS cloud fundamentals, Performance profiling, OWASP security, API design at scale.
  - **Phase 4: Advanced Systems** (Weeks 29–42) — System design, DB at scale (PgBouncer, read replicas), Kafka event streaming, Microservices/gRPC, Kubernetes, Reliability engineering (SLOs/Chaos).
  - **Phase 5: Top 1% Differentiators** (Weeks 43–52) — Production codebase analysis, Open source contributions, Technical writing, Specialty deep-dive, Systems thinking, Shipping to real users.
- **Granular Days**: 7 calendar days per week (6 active learning days + 1 rest/consolidation day).
- **Explicit "Skip" Sections**: Highly opinionated negative curriculum ("What NOT to do") at the phase and daily level to prevent tutorial hell and distraction.

### E. Current Learning Experience
- **Pedagogical Philosophy**: "Build deep. Ship real things. Write about it."
- **Action-Oriented Checklist**: Granular micro-topics (3–6 per day) designed to be verified and checked off.
- **Deep Resource Integration**: Direct curated external URLs categorized by media type (`yt` video, `article` documentation, `github` repository).
- **Salary / Career Anchoring**: Clear market compensation milestones (e.g., Phase 1: ₹3–8 LPA, Phase 2: ₹6–18 LPA, Phase 3: ₹12–28 LPA, Phase 4: ₹25–60 LPA, Phase 5: ₹40–100+ LPA) with target job titles and hiring expectations.

### F. Current Progress Tracking
- **Topic-Level Granularity**: Each topic has a unique key `s::{week}::{dayIndex}::{topicIndex}` stored in the `done` dictionary.
- **Day-Level Rollup**: A day is marked complete when all non-rest subtopics are checked.
- **Week-Level Rollup**: A week is complete when all active days are marked complete (triggers a visual green checkmark `✓` in sidebar).
- **Phase-Level Rollup**: Aggregate percentage calculation of completed topics divided by total phase topics.
- **Global Rollup**: Overall completion percentage and completed/total topic counter.

### G. Current Quiz System
- **Three Quiz Tiers**:
  1. **Daily Quiz**: 5 randomized questions dynamically pulled from the question bank best matching the day's topical tags (via `DAY_QUIZ_MAP` keyword router).
  2. **Weekly Assessment**: 10 randomized questions evaluating cumulative weekly understanding.
  3. **Phase Exam**: 15 comprehensive questions with strict pass marks (70–75%).
- **Interactive Mechanics**: Instant right/wrong color feedback, detailed contextual explanations (`exp`), score calculation, letter grade evaluation ("Outstanding! 🏆", "Strong Pass ✅", "Needs Review 📚"), and retry options.
- **Score Retention**: Best score percentage and date recorded in `localStorage` under `qscores`.

### H. Current Notes System
- **Day-Bound Markdown/Text Notes**: Dedicated textarea per calendar date (`notes[curDate]`).
- **Persistence**: Debounced auto-saving (1200ms debounce) plus manual `💾 Save` button and `Ctrl+S` hotkey.
- **Third-Party External Links**:
  - `chatLinks`: Stores custom ChatGPT conversation URLs for each topic.
  - `pdfLinks`: Stores external PDF / Notion / Google Drive study note URLs.

### I. Current Study Timer / Focus Functionality
- **Pomodoro Timer**: Embedded client-side countdown timer in header and workspace.
- **Preset Durations**: 25 minutes (Pomodoro), 5 minutes (Short Break), 15 minutes (Long Break).
- **Controls**: Start, Pause, Reset, with toast notification upon completion.

### J. Current Streak Functionality
- **Algorithm**: Counts contiguous completed days up to `todayStr()`. If today or yesterday is completed, the streak remains active; if an active study day is missed, streak breaks to 0.
- **Visual Display**: Fire badge (`🔥`), numerical counter, and a 21-day rolling dot visualization matrix.

### K. Current Scheduling Functionality
- **Linear Calendar Projection**: Projects 364 consecutive calendar dates starting from `startDate`.
- **Dynamic Rescheduling**: Shifts start date, recalculating every day's assigned calendar date while maintaining data linkage to week/day slots.
- **Dynamic Pause Engine**: Computes elapsed pause days and pushes remaining calendar dates forward upon resumption.

### L. Current Resource System
- **Curated Learning Links**: 454 verified educational links embedded in JSON metadata with title, type (`yt`, `article`, `github`), and verified URLs.

### M. Current Project System
- **Phase Capstone Projects**: Each phase specifies 3 real-world portfolio projects (15 projects total across the 5 phases).
- **Project Structure**: Name, architectural description, technology tags, and deployment constraints (e.g., deploy to $5 VPS with PM2, no Docker in Phase 1; BullMQ + Redis in Phase 2; AWS EC2 + Prometheus in Phase 3; Kafka + Temporal in Phase 4; Open Source PR in Phase 5).

### N. Current Browser State & `localStorage` Schema
| Key | Type | Description / Format |
|---|---|---|
| `startDate` | `String (YYYY-MM-DD)` | The learner's initial or remapped start date. |
| `curDate` | `String (YYYY-MM-DD)` | Last viewed/active calendar date. |
| `curPhase` | `String ("1".."5")` | Active phase tab index. |
| `done` | `Object {[slotKey: string]: true}` | Completed topics. Key format: `s::{weekNum}::{dayIndex}::{topicIndex}`. |
| `notes` | `Object {[dateStr: string]: string}` | Learner's personal markdown/notes keyed by date. |
| `qscores` | `Object {[quizKey: string]: {score, total, pct, date}}` | High scores for daily (`daily::{bank}`), weekly (`weekly::{week}`), and phase (`phase::{phase}`) quizzes. |
| `chatLinks`| `Object {[dateStr: string]: string}` | URLs to ChatGPT conversations for specific days. |
| `pdfLinks` | `Object {[dateStr: string]: string}` | URLs to external study note documents/PDFs. |
| `pausedAt` | `String (YYYY-MM-DD) \| null` | Timestamp when user paused the course. |
| `totalPauseDays` | `String (number)` | Cumulative total days paused across the journey. |

### O. Current Product Limitations
1. **Device Isolation**: Progress is locked to a single browser instance on a single device. Clearing browser cache destroys all learner history.
2. **No User Accounts / Multi-Tenancy**: No authentication, profile, cloud sync, or multi-device continuity.
3. **Static Content Coupling**: Roadmap topics, resources, and quiz questions are hardcoded directly inside the frontend HTML bundle. Updating content requires code modifications and redeployments.
4. **No Centralized Admin Control**: Roadmap authors cannot add, edit, reorder, or publish new topics, resources, or quiz questions via an interface.
5. **No Submission / Verification for Projects**: Capstone projects are static text descriptions with no code repository submission, review, or milestone validation.
6. **Fragile Date-Linked Keys**: Notes and links are keyed by date (`YYYY-MM-DD`) rather than canonical topic/day IDs. Rescheduling dates can cause notes to detach from their conceptual topics.
7. **No Server-Side Analytics**: Learners cannot view aggregate velocity, time spent, retention curves, or concept mastery diagnostics.

### P. Existing Technical Debt
- Single monolithic HTML file with mixed CSS, HTML templates, and inline ES5 JavaScript.
- Tightly coupled UI rendering (`innerHTML` string concatenation) susceptible to XSS if user input is not escaped.
- Redundant logic between different dev HTML versions in the repository.
- Partial quiz banks (only Weeks 1–2 tests and Phases 1–3 exams are currently authored in the static data; remaining weeks/phases show "Soon" or fallback).

### Q. Existing Reusable Components & Features
- Highly engaging visual design language (GitHub dark mode palette `#0d1117`, JetBrains Mono typography, custom badges, LPA chips).
- High-quality, opinionated roadmap content, subtopics, and curated resource links.
- Proven scheduling algorithm and pause/resume calculation model.
- Established quiz question banks with pedagogical explanations.

### R. Existing Data Structures
- Comprehensive hierarchical data schema: `Phases` $\rightarrow$ `Weeks` $\rightarrow$ `Days` $\rightarrow$ `[Topics, Resources, SkipItems, Projects, LPA Metadata, Quiz Banks]`.
