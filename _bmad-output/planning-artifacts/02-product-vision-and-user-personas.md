# Product Vision & User Personas

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 1 — Product Discovery & Analysis  
**Author:** Mary (BMAD Business Analyst)  
**Date:** September 21, 2026  
**Status:** Completed Analysis  

---

## 1. Product Vision

### Core Transformation:
Transform a single-browser client-side roadmap demo into an **Enterprise-Grade, Dynamic Backend Engineering Accelerator** that systematically guides engineers through a structured 52-week curriculum to reach top-tier (Top 1%) backend engineering competency.

### The "What Exactly Are We Building?" Vision:
The **Top 1% Backend Roadmap Platform** is not just another passive video course portal or generic documentation checklist. It is an **active, disciplined execution environment** combining:
1. **Curriculum Mastery**: An opinionated 5-phase, 52-week curriculum emphasizing deep systems fundamentals, production-grade reliability, and architectural craft.
2. **Accountability & Momentum**: Cloud-synced daily scheduling, flexible life-pause mechanisms, streak tracking, and focus timers.
3. **Active Knowledge Retrieval**: Daily topic-matched quizzes, weekly assessments, and phase exams with immediate pedagogical feedback.
4. **Portfolio Proof**: Real project milestone tracks with repository submissions and verified completion.
5. **Personalized Intelligence & Continuous Evolution**: Admin-curated, version-controlled content with detailed learner analytics and future AI-assisted learning mentorship.

---

## 2. User Types & Personas

After rigorous analysis of product requirements, exactly **two primary user roles** are justified for the core product lifecycle:

```
                      ┌─────────────────────────────────────────┐
                      │      Top 1% Backend Roadmap Platform    │
                      └────────────────────┬────────────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    ▼                                             ▼
       ┌────────────────────────┐                   ┌────────────────────────┐
       │     Learner / User     │                   │     Administrator      │
       │ (Aspiring & Growth Eng)│                   │(Curriculum Lead / Ops) │
       └────────────────────────┘                   └────────────────────────┘
```

> **Analyst Note on Additional Roles**: Mentor/Reviewer and Community Moderator roles were evaluated but classified as **Future Extensions (Phase 5/V2)**. Introducing multi-tenant organizational hierarchies or peer reviewer roles prematurely would add unnecessary architectural complexity to the MVP/V1 releases.

---

### Persona 1: The Learner (`Role: USER`)

#### Profile:
- **Title**: Junior to Mid-Level Software Engineer / Computer Science Student.
- **Context**: Wants to break into high-paying backend roles (₹15L–₹50L+ LPA or global remote equivalent) or level up from basic CRUD development to distributed systems engineering.
- **Mental Model**: Overwhelmed by fragmented tutorials, confused about what topics to prioritize vs. skip, and struggling with long-term study consistency.

#### Learner Goals:
1. Follow a clear, proven, step-by-step 52-week curriculum without second-guessing what to learn next.
2. Maintain study momentum and build daily consistency through calendar scheduling and streak accountability.
3. Validate true conceptual understanding through rigorous quizzes rather than false confidence from passive video watching.
4. Build and showcase real-world, production-grade portfolio projects that impress hiring managers.
5. Access learning progress, notes, and study links seamlessly across multiple devices (laptop, desktop, mobile).

#### Learner Key Actions:
- Sign up, log in, and configure individual start date and daily study goals.
- Navigate roadmap phases, weeks, and days.
- Check off mastered topics and subtopics.
- Access curated video tutorials, official docs, and GitHub repositories.
- Take daily quizzes, weekly tests, and phase certification exams.
- Record personal rich-text/markdown notes and link external resources (Notion/PDF/ChatGPT chats).
- Run focus study sessions using the integrated focus timer.
- Pause and resume the roadmap when unexpected life events occur without losing progress.
- Submit project repositories for milestone completion.
- Review personal analytics, score trends, and retention diagnostics.

#### Learner Pain Points in Current System:
- "If I clear my browser cookies or switch from my laptop to my desktop, my 3-month streak and all my notes disappear."
- "I cannot submit my project links or verify if my implementation meets production standards."
- "I cannot access deeper analytics on my weak topic areas."

#### Product-Level Permissions Needed:
- Read published roadmap content, phases, weeks, days, topics, and resources.
- Create, update, and delete own study progress, checkboxes, and active navigation state.
- Submit quiz attempts and view own historical quiz scores.
- Create, read, update, and export own personal notes and linked URLs.
- Manage own schedule (start date, pause state, resume state, custom target dates).
- Submit own project milestone deliverables.
- Read and manage own user profile and account security settings.

---

### Persona 2: The Administrator / Content Lead (`Role: ADMIN`)

#### Profile:
- **Title**: Curriculum Director / Lead Backend Architect / Platform Operator.
- **Context**: Responsible for curriculum accuracy, authoring quiz question banks, keeping external links updated, monitoring platform-wide engagement, and publishing new roadmap versions.

#### Administrator Goals:
1. Manage and curate the entire roadmap hierarchy (phases, weeks, days, topics, skip directives, resources, LPA benchmarks).
2. Author, update, categorize, and validate quiz question banks and detailed explanations.
3. Publish curriculum updates and manage versioning without corrupting active learners' historical progress.
4. Monitor platform-wide learner retention, completion funnels, and topic difficulty ratings.
5. Manage platform users, role assignments, and content moderation.

#### Administrator Key Actions:
- Log in via secure admin portal with elevated privileges.
- Create, edit, reorder, archive, and publish Roadmap content entities (Phases, Weeks, Days, Topics).
- Manage Resource links (validate dead links, update URLs, tag media types).
- Create, edit, and bulk-import Quiz Question Banks, questions, options, and explanations.
- Define Capstone Project specifications, acceptance criteria, and suggested tech stacks.
- View platform-wide aggregated analytics (daily active learners, drop-off points, average quiz pass rates).
- Manage user accounts (search users, view learner progress state, reset password/status, assign admin roles).

#### Product-Level Permissions Needed:
- Full CRUD permissions on all Curriculum Entities (`Phases`, `Weeks`, `Days`, `Topics`, `Resources`, `SkipItems`, `LPA Metadata`).
- Full CRUD permissions on `QuizBanks`, `Questions`, and `Assessments`.
- Full CRUD permissions on `ProjectDefinitions` and rubrics.
- Read permissions on aggregated platform metrics and anonymized learner telemetry.
- User management permissions (view users, deactivate accounts, promote/demote roles).
- Content release management (Draft $\rightarrow$ Review $\rightarrow$ Published states).
