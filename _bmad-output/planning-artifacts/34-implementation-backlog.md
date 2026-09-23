# 34. Implementation Backlog

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 5 — Scrum Master Planning  
**Role:** BMAD Scrum Master  
**Status:** Approved Implementation Backlog  

---

## 1. Backlog Overview & Prioritization Strategy

The Implementation Backlog organizes all work required to transform the static backend roadmap into a dynamic, production-grade cloud platform. Stories are strictly prioritized using the MoSCoW framework mapped to release boundaries:
- **P0 (Must Have):** Core MVP functionality required for authenticated multi-device learning, scheduling, progress, zero-knowledge quizzes, notes, streaks, legacy migration, and admin content management.
- **P1 (Should Have):** V1 functionality including Capstone Project submissions, diagnostic analytics, advanced admin user management, and offline optimistic sync.
- **P2 (Could Have):** V2 enhancements such as Spaced Repetition Flashcards, custom learning reminders, community rubrics, and public badge verification.
- **Future:** AI interactive coding mentor, AI PR review bot, real-time study rooms, and enterprise cohort analytics.

---

## 2. Master Story Registry

| Story ID | Epic | Title | Priority | Release | Size | Target Sprint | Primary Layer |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FND-001** | Foundation | Monorepo Structure & TypeScript Setup | P0 | MVP | S | Sprint 0 | Fullstack |
| **FND-002** | Foundation | Express Backend Bootstrap & Env Validation | P0 | MVP | M | Sprint 0 | Backend |
| **FND-003** | Foundation | MongoDB Atlas Connection & Mongoose Setup | P0 | MVP | S | Sprint 0 | Database |
| **FND-004** | Foundation | Next.js 15+ App Router Setup & Tailwind Theme | P0 | MVP | M | Sprint 0 | Frontend |
| **FND-005** | Foundation | Centralized Error Handling & Pino Logging | P0 | MVP | S | Sprint 0 | Backend |
| **FND-006** | Foundation | Shared Type Contracts & API Envelope | P0 | MVP | S | Sprint 0 | Shared |
| **FND-007** | Foundation | Testing Pipeline (Vitest, Supertest, Playwright) | P0 | MVP | M | Sprint 0 | Tooling |
| **AUTH-001** | Auth & Identity | User Registration API & Password Hashing | P0 | MVP | M | Sprint 1 | Backend |
| **AUTH-002** | Auth & Identity | Dual-Token Cookie Authentication & Session Store | P0 | MVP | L | Sprint 1 | Backend |
| **AUTH-003** | Auth & Identity | Google OAuth 2.0 Integration & Account Linking | P0 | MVP | M | Sprint 1 | Backend |
| **AUTH-004** | Auth & Identity | Password Reset Flow via Email Tokens | P0 | MVP | M | Sprint 1 | Backend |
| **AUTH-005** | Auth & Identity | RBAC Middleware & CSRF Double-Submit Protection | P0 | MVP | M | Sprint 1 | Security |
| **AUTH-006** | Auth & Identity | Frontend Auth Screens (Login, Register, Forgot) | P0 | MVP | L | Sprint 1 | Frontend |
| **AUTH-007** | Auth & Identity | Auth State Provider & Axios/Fetch Interceptors | P0 | MVP | M | Sprint 1 | Frontend |
| **ONBD-001** | Onboarding | Onboarding Data Model & Schedule Initialization API | P0 | MVP | M | Sprint 2 | Backend |
| **ONBD-002** | Onboarding | Interactive Onboarding Wizard & Date Picker UI | P0 | MVP | M | Sprint 2 | Frontend |
| **ONBD-003** | Onboarding | Learner Setup Routing Guard & Profile Hydration | P0 | MVP | S | Sprint 2 | Frontend |
| **CURR-001** | Curriculum | Canonical Curriculum Schema & Tree Seeding | P0 | MVP | L | Sprint 2 | Database |
| **CURR-002** | Curriculum | Curriculum Hierarchy Read API with In-Memory Cache | P0 | MVP | M | Sprint 2 | Backend |
| **CURR-003** | Curriculum | Interactive Roadmap View & Phase/Week Accordion | P0 | MVP | L | Sprint 3 | Frontend |
| **CURR-004** | Curriculum | Curriculum Search & Phase/Week Deep-Link Engine | P0 | MVP | M | Sprint 3 | Frontend |
| **CURR-005** | Curriculum | Resource Links Catalog & Skip Directives Renderer | P0 | MVP | S | Sprint 3 | Frontend |
| **SCHD-001** | Scheduling | Dynamic Calendar Date Calculation Engine | P0 | MVP | M | Sprint 3 | Backend |
| **SCHD-002** | Scheduling | Reschedule Schedule API & Date Shift Calculation | P0 | MVP | M | Sprint 3 | Backend |
| **SCHD-003** | Scheduling | Pause & Resume Course Lifecycle API | P0 | MVP | M | Sprint 3 | Backend |
| **SCHD-004** | Scheduling | Schedule Management Modal & Calendar Date Projection UI | P0 | MVP | M | Sprint 3 | Frontend |
| **DWKS-001** | Daily Workspace | Daily Learning Workspace Layout & Day Header | P0 | MVP | M | Sprint 4 | Frontend |
| **DWKS-002** | Daily Workspace | Day Topic Checklist & Subtopic Action Items | P0 | MVP | M | Sprint 4 | Frontend |
| **DWKS-003** | Daily Workspace | Daily Workspace Day-Switching & Keyboard Shortcuts | P0 | MVP | S | Sprint 4 | Frontend |
| **PROG-001** | Progress | Topic Progress Ledger Schema & Toggle Status API | P0 | MVP | M | Sprint 4 | Backend |
| **PROG-002** | Progress | Progress Rollup Aggregation Pipeline Engine | P0 | MVP | L | Sprint 4 | Backend |
| **PROG-003** | Progress | Optimistic UI Checkbox Toggle with Rollback (<16ms) | P0 | MVP | M | Sprint 4 | Frontend |
| **PROG-004** | Progress | Progress Telemetry Bars (Top-Bar, Sidebar, Global) | P0 | MVP | M | Sprint 4 | Frontend |
| **QUIZ-001** | Quizzes | Quiz Bank & Question Collection Schemas | P0 | MVP | M | Sprint 5 | Database |
| **QUIZ-002** | Quizzes | Zero-Knowledge Question Delivery API | P0 | MVP | M | Sprint 5 | Backend |
| **QUIZ-003** | Quizzes | Server-Side Quiz Grading, Scoring & Attempt API | P0 | MVP | L | Sprint 5 | Backend |
| **QUIZ-004** | Quizzes | Daily & Weekly Quiz Runner Modal & Timer UI | P0 | MVP | L | Sprint 5 | Frontend |
| **QUIZ-005** | Quizzes | Quiz Results View, Explanations & High-Score Ledger | P0 | MVP | M | Sprint 5 | Frontend |
| **QUIZ-006** | Quizzes | Phase Exam Gating Logic & High-Score Persistence | P0 | MVP | M | Sprint 5 | Fullstack |
| **NOTE-001** | Notes & Links | Day Notes Schema & Optimistic Lock Autosave API | P0 | MVP | M | Sprint 6 | Backend |
| **NOTE-002** | Notes & Links | Markdown Notes Editor with Live Preview & Sanitize | P0 | MVP | L | Sprint 6 | Frontend |
| **NOTE-003** | Notes & Links | Custom External Resource Links API & UI Manager | P0 | MVP | M | Sprint 6 | Fullstack |
| **NOTE-004** | Notes & Links | Centralized Learner Notes Explorer & Search Modal | P0 | MVP | M | Sprint 6 | Frontend |
| **STRK-001** | Streaks & Habit | User Activity Ledger & Daily Streak Engine | P0 | MVP | M | Sprint 7 | Backend |
| **STRK-002** | Streaks & Habit | 21-Day Habit Building Matrix Visualization UI | P0 | MVP | M | Sprint 7 | Frontend |
| **STRK-003** | Streaks & Habit | Streak Freeze Logic (1 per Calendar Month) | P0 | MVP | S | Sprint 7 | Backend |
| **STRK-004** | Streaks & Habit | Built-in Pomodoro Study Timer (25/5 min + audio) | P0 | MVP | S | Sprint 7 | Frontend |
| **MIGR-001** | Migration | Legacy LocalStorage Schema Extraction Script | P0 | MVP | S | Sprint 8 | Frontend |
| **MIGR-002** | Migration | Date-to-Canonical-Slug Translation Pipeline | P0 | MVP | L | Sprint 8 | Backend |
| **MIGR-003** | Migration | Atomic Transactional LocalStorage Ingestion API | P0 | MVP | L | Sprint 8 | Backend |
| **MIGR-004** | Migration | Migration Flow Modal with Progress & Rollback Safety | P0 | MVP | M | Sprint 8 | Frontend |
| **ADMN-001** | Admin CRUD | Admin Role Guard & Backoffice Layout Scaffold | P0 | MVP | M | Sprint 9 | Fullstack |
| **ADMN-002** | Admin CRUD | Curriculum Node Editor & Live JSON Tree Builder | P0 | MVP | L | Sprint 9 | Fullstack |
| **ADMN-003** | Admin CRUD | Curriculum Version Draft & Semantic Publish Engine | P0 | MVP | L | Sprint 9 | Backend |
| **ADMN-004** | Admin CRUD | Quiz Question Bank Authoring & Explanations Editor | P0 | MVP | M | Sprint 9 | Fullstack |
| **ADMN-005** | Admin CRUD | Admin Audit Logging Engine | P0 | MVP | S | Sprint 9 | Backend |
| **ANLT-001** | Analytics | Telemetry Event Ingestion Pipeline & Event Ledger | P0 | MVP | M | Sprint 10 | Backend |
| **ANLT-002** | Analytics | Learner Velocity Dashboard & Time-to-Complete Stats | P0 | MVP | M | Sprint 10 | Frontend |
| **PROJ-001** | Capstone | Capstone Projects Schema & Specification Viewer | P0 | MVP | M | Sprint 10 | Fullstack |
| **HARD-001** | Hardening | Multi-Stage Production Dockerfiles & Compose | P0 | MVP | M | Sprint 11 | DevOps |
| **HARD-002** | Hardening | End-to-End Test Suite for 8 Critical Journeys | P0 | MVP | L | Sprint 11 | QA |
| **HARD-003** | Hardening | Performance Tuning, Index Audits & Security Scan | P0 | MVP | M | Sprint 11 | Security |
| **PROJ-101** | Capstone | GitHub Repository URL & Live Demo Submission API | P1 | V1 | M | Post-MVP | Backend |
| **PROJ-102** | Capstone | Capstone Submission Status Badge & Portfolio Link | P1 | V1 | M | Post-MVP | Frontend |
| **ANLT-101** | Analytics | Admin Aggregate Analytics & Cohort Drop-off Charts | P1 | V1 | L | Post-MVP | Fullstack |
| **ADMN-101** | Admin CRUD | Admin User Directory, Role Granting & Activity Log | P1 | V1 | M | Post-MVP | Fullstack |
| **CURR-101** | Curriculum | Offline Optimistic Topic Sync & Conflict Queue | P1 | V1 | L | Post-MVP | Frontend |
| **QUIZ-101** | Quizzes | Bulk CSV/JSON Quiz Question Import Tool | P1 | V1 | M | Post-MVP | Backend |
| **REDIS-101**| Infrastructure | Redis In-Memory Cache & Distributed Rate Limiter | P1 | V1 | L | Post-MVP | Backend |
| **BULL-101** | Infrastructure | BullMQ Background Job Worker Integration | P1 | V1 | L | Post-MVP | Backend |
| **SPAC-201** | Spaced Repetition | SuperMemo SM-2 Flashcard Engine for Failed Topics | P2 | V2 | L | Post-V1 | Backend |
| **SPAC-202** | Spaced Repetition | Daily Flashcard Review Modal & SRS Schedule Deck | P2 | V2 | M | Post-V1 | Frontend |
| **NOTF-201** | Notifications | In-App & Email Daily Learning Reminders Engine | P2 | V2 | M | Post-V1 | Fullstack |
| **COMM-201** | Community | Public Profile Showcase & Shareable Milestone Badges | P2 | V2 | M | Post-V1 | Fullstack |
| **AI-301**   | AI Capabilities | Interactive AI Coding Mentor & Concept Explainer | P3 | Future | XL | Future | Fullstack |
| **AI-302**   | AI Capabilities | Automated GitHub PR Architecture Reviewer Bot | P3 | Future | XL | Future | Fullstack |
| **ROOM-301** | Real-Time | Live Synchronous Virtual Study Rooms & Pomodoro Co-working | P3 | Future | XL | Future | Fullstack |
