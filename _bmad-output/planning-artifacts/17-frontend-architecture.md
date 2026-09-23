# Frontend Architecture Specification (Next.js & TypeScript)

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 4 — System Architecture  
**Author:** Winston (BMAD System Architect)  
**Date:** September 21, 2026  
**Status:** Completed Architecture  

---

## 1. Next.js App Router Architecture

The frontend is structured using **Next.js 15+ (App Router)** with TypeScript, Tailwind CSS, and TanStack Query.

```
                      NEXT.JS APP ROUTER TOPOLOGY
  ┌────────────────────────────────────────────────────────────────────────┐
  │ app/                                                                   │
  │ ├── (auth)/                  ──► Login, Register, Forgot Password      │
  │ ├── (dashboard)/             ──► Authenticated Learner App Shell       │
  │ │   ├── roadmap/             ──► Phase/Week/Day Curriculum Browser     │
  │ │   ├── day/[dayId]/         ──► Primary Daily Learning Canvas         │
  │ │   ├── progress/            ──► Multi-tier Mastery & Stats            │
  │ │   ├── projects/            ──► Capstone Milestone Hub (V1)           │
  │ │   └── settings/            ──► Profile, Schedule, Account Security   │
  │ ├── (admin)/                 ──► Role-Guarded Admin Studio (CRUD)      │
  │ ├── api/auth/                ──► NextAuth / Session Proxy Route Handlers│
  │ ├── layout.tsx               ──► Global Providers (Theme, QueryClient) │
  │ └── error.tsx / not-found.tsx──► Global Error Boundaries & Fallbacks   │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Server Components (RSC) vs. Client Component Boundaries

To achieve maximum performance ($\text{LCP} < 1.0\text{s}$) while retaining fluid interactive controls:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RSC VS CLIENT COMPONENT PARTITION                        │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ REACT SERVER COMPONENTS (RSC)        │ CLIENT ISLANDS ('use client')        │
│ (Static / Server-Rendered)           │ (Interactive / Stateful)             │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ • Page Layout Shells                 │ • `SubtopicCheckbox` (Optimistic UI) │
│ • Static Roadmap Outline             │ • `MarkdownNotesEditor` (Debounced)  │
│ • Skip Directives Container          │ • `FocusPomodoroTimer` (Interval)    │
│ • Resource Link Badges & Descriptions│ • `QuizModal` & Answer Submission    │
│ • Salary / LPA Milestone Cards       │ • `ScheduleModal` & `PauseModal`     │
│ • Static Legal & SEO Meta            │ • `MigrationBridgeModal`             │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

---

## 3. State Management & Data Fetching Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND STATE TIER ARCHITECTURE                       │
├───────────────────┬──────────────────────────┬──────────────────────────────┤
│ STATE DOMAIN      │ TOOL / MECHANISM         │ USAGE & LIFECYCLE            │
├───────────────────┼──────────────────────────┼──────────────────────────────┤
│ **Server State**  │ TanStack React Query v5  │ Curriculum cache, topic ticks│
│                   │                          │ quiz scores, user profile.   │
├───────────────────┼──────────────────────────┼──────────────────────────────┤
│ **Local UI State**│ React `useState`/`useRef`│ Modal visibility, form inputs│
│                   │                          │ active dropdown toggles.     │
├───────────────────┼──────────────────────────┼──────────────────────────────┤
│ **Client Runtime**│ Zustand Store            │ Active Focus Timer countdown,│
│                   │                          │ global audio toast state.    │
└───────────────────┴──────────────────────────┴──────────────────────────────┘
```

### Optimistic Mutation Workflow (Subtopic Toggle):
```
 [Learner Toggles Topic Checkbox]
        │
        ├── 1. Optimistically updates React Query cache immediately (<16ms)
        ├── 2. Re-computes Day/Week completion rollups instantly in UI
        │
        ▼ (Async HTTP POST /api/v1/progress/toggle)
 ┌──────────────┴──────────────┐
 ▼                             ▼
[Server Confirms OK (200)]    [Server Returns Error (500/Net)]
 • Replaces optimistic data   • Rolls back cache to previous snapshot
 • Confirms cloud persistence • Displays toast: "Failed to sync. Retrying"
```

---

## 4. API Client & Session Transport

- **Transport:** Native `fetch` wrapper or `axios` instance configured with `credentials: 'include'`.
- **Automatic Token Refresh:** Interceptor catches HTTP 401 Unauthorized responses $\rightarrow$ pauses queue $\rightarrow$ calls `/api/v1/auth/refresh-token` $\rightarrow$ replays original request.
- **CSRF Token Header:** Extracted from cookie and attached as `X-CSRF-Token` on all state-mutating requests (`POST`, `PUT`, `PATCH`, `DELETE`).

---

## 5. Recommended Frontend Directory Structure

```
frontend/
├── app/                          # Next.js App Router Pages & Layouts
│   ├── (auth)/
│   ├── (dashboard)/
│   └── (admin)/
├── components/                   # Reusable UI Primitives (Design System)
│   ├── ui/                       # Buttons, Badges, Modals, Inputs, Progress
│   └── layout/                   # TopNav, Sidebar, AppShell, Footer
├── features/                     # Domain-Specific Feature Modules
│   ├── curriculum/               # Roadmap tree, Phase cards, Resource cards
│   ├── workspace/                # Checklist rows, Skip containers, LPA cards
│   ├── assessment/               # Quiz modal, Question options, Results card
│   ├── notes/                    # Markdown textarea, link inputs, auto-saver
│   ├── schedule/                 # Reschedule modal, Pause/Resume dialog
│   ├── timer/                    # Pomodoro widget, audio tone player
│   └── migration/                # LocalStorage detection & bridge modal
├── hooks/                        # Custom React Hooks (useDebounce, useHotkeys)
├── lib/                          # Utilities (apiClient, dateCalculations, cn)
├── stores/                       # Zustand stores (useTimerStore, useUIStore)
├── types/                        # Shared TypeScript API Interfaces & Enums
└── styles/                       # Global Tailwind CSS & Design Tokens
```
