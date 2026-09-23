# Epics, User Stories & Acceptance Criteria Specification

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 2 — Product Manager (PRD & Specifications)  
**Author:** John (BMAD Product Manager)  
**Date:** September 21, 2026  
**Status:** Completed  

---

## 1. Epic Overview

```
  ┌─────────────────────────────────────────────────────────────────────────┐
  │                         CORE PRODUCT EPICS                              │
  ├──────────────┬──────────────────────────────────────────────────────────┤
  │ EPIC 1       │ User Authentication & Identity Management               │
  │ EPIC 2       │ Learner Onboarding & Schedule Initialization            │
  │ EPIC 3       │ Dynamic Roadmap & Curriculum Hierarchy                  │
  │ EPIC 4       │ Daily Learning Workspace & Content Interaction          │
  │ EPIC 5       │ Progress Tracking & Hierarchical Rollups                │
  │ EPIC 6       │ Adaptive Scheduling & Pause / Resume Engine             │
  │ EPIC 7       │ Dynamic Assessment & Quiz Engine                        │
  │ EPIC 8       │ Day-Bound Notes & External Study Links                  │
  │ EPIC 9       │ Focus Study Timer & Streak Accountability               │
  │ EPIC 10      │ Legacy LocalStorage Migration Bridge                    │
  │ EPIC 11      │ Administrator Content Management Portal (CRUD)          │
  │ EPIC 12      │ Capstone Project Milestones & Portfolio (V1)            │
  │ EPIC 13      │ Learner & Administrator Analytics (MVP/V1)              │
  │ EPIC 14      │ Notifications & Automated Reminders (V2)                │
  │ EPIC 15      │ Spaced Repetition & Future AI Mentorship (V2/Future)     │
  └──────────────┴──────────────────────────────────────────────────────────┘
```

---

## 2. Granular User Stories & Acceptance Criteria (Given / When / Then)

### EPIC 1: User Authentication & Identity Management

#### US-1.1: Email & Password Registration
* **User Story:** As a new learner, I want to create an account using my email address and a secure password, so that my roadmap progress and notes are safely stored in the cloud.
* **Acceptance Criteria:**
  - **AC-1.1.1:** Given a user provides a valid, unregistered email and a password ($\ge 8$ chars, including uppercase, lowercase, and numbers), When they submit the registration form, Then an account is created, a session cookie is set, and the user is redirected to Onboarding.
  - **AC-1.1.2:** Given a user provides an already registered email, When they attempt to register, Then a clear error message is displayed: *"An account with this email already exists."*
  - **AC-1.1.3:** Given a user provides an invalid email format or weak password, When they attempt to submit, Then client-side and server-side validation messages block submission.

#### US-1.2: Google OAuth Social Login
* **User Story:** As a learner, I want to sign up or log in using my Google account with one click, so that I can access my roadmap quickly without managing another password.
* **Acceptance Criteria:**
  - **AC-1.2.1:** Given an unauthenticated user on the login/signup page, When they click "Continue with Google", Then they are redirected to Google's OAuth consent screen.
  - **AC-1.2.2:** Given successful Google authorization, When returned to the platform, Then the platform creates or links the account, sets secure session cookies, and routes the user to their active roadmap day.

#### US-1.3: Password Reset Workflow
* **User Story:** As a registered learner, I want to request a password reset link via email, so that I can regain access to my account if I forget my credentials.
* **Acceptance Criteria:**
  - **AC-1.3.1:** Given a user enters their registered email on the "Forgot Password" page, When they submit, Then a single-use, time-limited (15-minute expiry) tokenized reset link is dispatched to their email.
  - **AC-1.3.2:** Given a user clicks a valid reset link, When they submit a new password, Then the password is updated and all active sessions are re-authenticated.

---

### EPIC 2: Learner Onboarding & Schedule Initialization

#### US-2.1: Initial Start Date Selection & Interactive Schedule Preview
* **User Story:** As a newly registered learner, I want to pick my journey start date and preview the full 12-month calendar distribution, so that I have a realistic, committed timeline before starting.
* **Acceptance Criteria:**
  - **AC-2.1.1:** Given a new user who has not set a start date, When they log in, Then the Onboarding modal is displayed with a start date picker defaulting to today.
  - **AC-2.1.2:** Given the date picker value changes, When the user inspects the modal, Then an interactive month-by-month bar graph dynamically renders the phase distribution and projected completion date.
  - **AC-2.1.3:** Given the user clicks "Start My Journey", When the start date is confirmed, Then the date is saved to their cloud profile, all 364 roadmap days are mapped, and they land on Phase 1, Week 1, Day 1.

---

### EPIC 3: Dynamic Roadmap & Curriculum Hierarchy

#### US-3.1: Curriculum Exploration & Multi-Level Browsing
* **User Story:** As a learner, I want to explore the complete 52-week curriculum organized by phases and weeks, so that I understand the roadmap structure and milestones ahead.
* **Acceptance Criteria:**
  - **AC-3.1.1:** Given a learner viewing the sidebar, When they inspect the phase list, Then all 5 phases are listed with their title, color coding, week counts, and completion percentage bars.
  - **AC-3.1.2:** Given a learner selects a phase, When the phase changes, Then the sidebar week list updates to show the weeks belonging to that phase, along with completion checkmarks.
  - **AC-3.1.3:** Given a learner selects a week, When clicked, Then the main workspace navigates to Day 1 of that week.

#### US-3.2: Phase Career & Salary Milestone Display
* **User Story:** As a learner, I want to see the target compensation (LPA) benchmarks and job roles for each phase, so that I stay motivated by tangible career outcomes.
* **Acceptance Criteria:**
  - **AC-3.2.1:** Given an active day in Phase $N$, When rendered in the workspace, Then the salary benchmark section displays the Entry, Mid, and Top compensation range (e.g., Phase 2: ₹6L / ₹12L / ₹18L+ LPA) and target job titles.

---

### EPIC 4: Daily Learning Workspace & Content Interaction

#### US-4.1: Daily Learning Execution & Skip Directives
* **User Story:** As a learner, I want to see what topics to master and what bad habits/topics to skip today, so that I focus exclusively on high-leverage skills.
* **Acceptance Criteria:**
  - **AC-4.1.1:** Given a learner viewing a standard learning day, When rendered, Then the workspace displays the day's title, full date, description, "Skip" directives container (if present), and subtopic checklist rows.
  - **AC-4.1.2:** Given a learner viewing a designated Rest & Consolidation Day (Day 7), When rendered, Then the workspace displays rest tips, reflection prompts, and weekly assessment shortcuts instead of subtopics.

#### US-4.2: Curated Resource Cards & Launching
* **User Story:** As a learner, I want to access vetted YouTube tutorials, documentation guides, and GitHub repositories directly from the day card, so that I learn from reliable sources without searching blindly.
* **Acceptance Criteria:**
  - **AC-4.2.1:** Given resource cards on an active day, When rendered, Then each card displays its specific media icon (`YouTube ▶`, `Article 📄`, `GitHub ⬡`) and title.
  - **AC-4.2.2:** Given a user clicks a resource card, When triggered, Then the URL opens in a secure external tab (`target="_blank" rel="noopener noreferrer"`).

---

### EPIC 5: Progress Tracking & Hierarchical Rollups

#### US-5.1: Subtopic Completion Toggling
* **User Story:** As a learner, I want to check off completed subtopics with immediate visual feedback, so that I track my daily progress effortlessly.
* **Acceptance Criteria:**
  - **AC-5.1.1:** Given an unchecked subtopic, When the learner clicks anywhere on the row, Then the checkbox immediately turns green with a checkmark icon, the text gets strikethrough styling, and an asynchronous update is sent to the cloud.
  - **AC-5.1.2:** Given a checked subtopic, When clicked again, Then the checkbox clears, strikethrough is removed, and the cloud state is updated.
  - **AC-5.1.3:** Given all subtopics of a day are checked, When the last topic is checked, Then the day is marked complete, updating the week progress and sidebar checkmark.

---

### EPIC 6: Adaptive Scheduling & Pause / Resume Engine

#### US-6.1: Start Date Rescheduling
* **User Story:** As a learner whose timeline shifted, I want to remap my start date to a new date, so that all calendar days realign while preserving all my completed checkmarks, notes, and quiz scores.
* **Acceptance Criteria:**
  - **AC-6.1.1:** Given a learner opens the "Reschedule" modal, When they pick a new start date and click "Apply", Then all 364 calendar dates are recalculated forward.
  - **AC-6.1.2:** Given dates are remapped, When the learner inspects previously completed days, Then all topic checkboxes, saved notes, and quiz scores remain attached to their respective topics with 100% fidelity.

#### US-6.2: Course Pause & Resume Execution
* **User Story:** As a learner facing exams or illness, I want to pause my course and resume later, so that my remaining schedule automatically shifts forward by the exact number of days I was away.
* **Acceptance Criteria:**
  - **AC-6.2.1:** Given an active course, When the learner clicks "Pause Course" in the Pause modal, Then `pausedAt` is recorded in the cloud, the modal closes, and a persistent `⏸ PAUSED` badge appears in the header.
  - **AC-6.2.2:** Given a paused course, When the learner returns days later and clicks "Resume Course", Then the platform calculates elapsed pause days ($\Delta = \text{Today} - \text{PausedAt}$), increments `startDate` by $\Delta$, clears the pause flag, and toasts: *"▶ Resumed! Schedule shifted by $\Delta$ days. New end: [Date]"*.

---

### EPIC 7: Dynamic Assessment & Quiz Engine

#### US-7.1: Taking Daily Topic-Matched Quizzes
* **User Story:** As a learner, I want to take a 5-question daily quiz matched to today's topics with server-side validation, so that I test my genuine understanding without seeing answers beforehand.
* **Acceptance Criteria:**
  - **AC-7.1.1:** Given a learner clicks "🧪 Take Today's Quiz", When the quiz modal opens, Then 5 randomized questions from the matching topical bank are rendered without client-side answer keys.
  - **AC-7.1.2:** Given a question is displayed, When the learner clicks an option, Then the platform submits the selection, locks all options, highlights correct answers in green and wrong answers in red, and reveals the detailed pedagogical explanation (`exp`).
  - **AC-7.1.3:** Given the learner answers all 5 questions, When they reach the results screen, Then the platform displays the final score percentage, correct/wrong count, letter grade, and records the score to the cloud.

---

### EPIC 8: Day-Bound Notes & External Study Links

#### US-8.1: Debounced Markdown Notes
* **User Story:** As a learner, I want to record markdown notes directly on each learning day and have them automatically saved, so that my personal insights are never lost.
* **Acceptance Criteria:**
  - **AC-8.1.1:** Given a learner enters text into the notes textarea, When they stop typing for 1200ms, Then the system automatically saves the note to the cloud and displays *"Note saved ✓"*.
  - **AC-8.1.2:** Given a learner presses `Ctrl+S` or `Cmd+S`, When triggered, Then default browser save is prevented and the note saves immediately.

#### US-8.2: ChatGPT & External PDF Notes Link Storage
* **User Story:** As a learner, I want to save custom ChatGPT chat URLs and external PDF/Notion study note links for specific topics, so that I can re-open my deep-dive AI conversations and documentation with one click.
* **Acceptance Criteria:**
  - **AC-8.2.1:** Given an empty chat/PDF input field, When the learner pastes a valid HTTP/HTTPS URL and clicks "Save Link", Then the URL is persisted and converts into a 1-click launch button with an `Edit` action.
  - **AC-8.2.2:** Given an invalid URL, When submitted, Then a toast warns: *"Please paste a valid URL"*.

---

### EPIC 9: Focus Study Timer & Streak Accountability

#### US-9.1: Integrated Focus Pomodoro Timer
* **User Story:** As a learner, I want an integrated Pomodoro timer with 25m focus and 5m/15m break presets, so that I can maintain deep focus without external timer apps.
* **Acceptance Criteria:**
  - **AC-9.1.1:** Given the focus timer, When a learner selects "25m Focus" and clicks "Start", Then the timer counts down every second in the header and workspace.
  - **AC-9.1.2:** Given the timer reaches 00:00, When finished, Then an alert/toast announces *"Timer done!"* and prompts for a break.

#### US-9.2: Timezone-Aware Daily Streak Tracking
* **User Story:** As a learner, I want my active streak to increment when I complete study days, so that I build a long-term daily learning habit.
* **Acceptance Criteria:**
  - **AC-9.1.1:** Given a learner completes all topics on an active study day matching their local timezone, When evaluated, Then their streak counter increments by 1.
  - **AC-9.1.2:** Given an active study day is missed without completing topics, When evaluated on the following day, Then the streak resets to 0 (unless a monthly Streak Freeze is applied).

---

### EPIC 10: Legacy LocalStorage Migration Bridge

#### US-10.1: Automatic Detection & One-Click Cloud Migration
* **User Story:** As an existing learner who used the client-side roadmap, I want my browser data automatically detected and imported into my new cloud account, so that I don't lose any progress or notes.
* **Acceptance Criteria:**
  - **AC-10.1.1:** Given a user logs in for the first time on a browser containing existing `localStorage` keys (`done`, `notes`, `qscores`, `startDate`), When the dashboard loads, Then a modal prompts: *"We detected existing roadmap progress in this browser. Import to your cloud account?"*
  - **AC-10.1.2:** Given the user clicks "Import Progress", When processed, Then the payload is converted to canonical IDs, merged into their cloud account, `localStorage` is cleaned up, and a success confirmation appears.

---

### EPIC 11: Administrator Content Management (CRUD)

#### US-11.1: Curriculum Content Editing & Publishing
* **User Story:** As an administrator, I want to edit topics, add new resources, and publish updates through an admin portal, so that the curriculum stays fresh and accurate without code deployments.
* **Acceptance Criteria:**
  - **AC-11.1.1:** Given an authenticated admin, When accessing the Admin Portal, Then they can view, edit, and reorder all Phases, Weeks, Days, and Subtopics.
  - **AC-11.1.2:** Given an admin updates a resource URL or fixes a typo, When saved, Then the change is immediately published to all active learners.

#### US-11.2: Quiz Question Bank Management
* **User Story:** As an administrator, I want to add and edit quiz questions, options, answer keys, and pedagogical explanations, so that assessment pools remain high-quality and challenging.
* **Acceptance Criteria:**
  - **AC-11.2.1:** Given an admin in the Quiz Management section, When they create a question with 4 options, a marked correct index, and an explanation, Then the question is saved into the corresponding question bank.
