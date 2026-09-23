# 43. Recommended Antigravity Execution Strategy

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 5 — Scrum Master Planning  
**Role:** BMAD Scrum Master  
**Status:** Developer & AI Execution Protocol  

---

## 1. Execution Principles for Development Phase

When implementation begins in **Phase 6 (BMAD Development)**, the AI agent (Antigravity) and human engineers must adhere strictly to this execution protocol:

1. **Sprint-by-Sprint Execution:** Implement strictly **one sprint at a time** (starting at Sprint 0). Never pull stories from future sprints ahead of time.
2. **Read Planning Artifacts Before Coding:** Before writing code for any story, review the corresponding PRD requirement (`prd.md`), UX wireframe (`12-ux-wireframes.md`), Architecture document (`16`–`33`), and ADR (`32-architecture-decision-records.md`).
3. **Preserve Architectural Contracts:** Never modify data schemas, API routes, or technology choices on an ad-hoc basis. If an ambiguity arises, document it as an *Architecture Clarification Required* before proceeding.
4. **Test After Every Story:** Write and execute unit/integration tests for every completed story before marking it complete and moving to the next story.
5. **Atomic, Traceable Git Commits:** Commit work incrementally with Conventional Commit headers referencing the Story ID (e.g. `feat(auth): implement dual-token cookie rotation [AUTH-002]`).
6. **Honor Definition of Ready & Done:** Never start a story without meeting the DoR (`39-definition-of-ready-done.md`), and never declare a story finished without meeting the DoD.
7. **Stop at Sprint Exit Criteria:** Upon finishing all stories in a sprint, execute the sprint verification suite, verify demo criteria, report sprint completion, and wait for human review before proceeding to the next sprint.

---

## 2. Standard Developer Story Workflow

```text
┌────────────────────────────────────────────────────────┐
│ 1. Select Next Story from Current Sprint Backlog      │
│    (Verify DoR & Prerequisites are satisfied)          │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────┴────────────────────────────┐
│ 2. Consult Architecture & UX Specifications            │
│    (DTO types in shared/, API routes in 21, UX in 12)  │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────┴────────────────────────────┐
│ 3. Implement Layer by Layer (4-Layer Model)            │
│    (Domain/Model -> Repository -> Service -> Controller│
│     or React Components -> Client Store -> API Hook)   │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────┴────────────────────────────┐
│ 4. Run Automated Verification Tests                    │
│    (npm run test:unit && npm run test:integration)     │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────┴────────────────────────────┐
│ 5. Verify Definition of Done Checklist                 │
│    (TypeScript clean, Zod valid, XSS safe, WCAG AA)    │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────┴────────────────────────────┐
│ 6. Commit & Mark Story Complete                        │
└────────────────────────────────────────────────────────┘
```

---

## 3. Sprint Cadence & Handoff Protocol

* **Sprint Initialization:**
  * Review Sprint Goal, included Story IDs, and Exit Criteria from [`37-sprint-plan.md`](file:///d:/Backend_dev/Backend_Roadmap_hosted/_bmad-output/planning-artifacts/37-sprint-plan.md).
  * Check that all prerequisite stories from prior sprints are `DONE`.
* **In-Sprint Story Execution:**
  * Implement stories in dependency order within the sprint.
  * Backend API endpoints and DTOs in `shared/` are created before frontend UI integration components.
* **Sprint Review & Gate Check:**
  * Run the full test suite (`npm test`).
  * Run type checking (`npm run typecheck`).
  * Run linting (`npm run lint`).
  * Validate demo criteria against the live running application.
  * Produce a short Sprint Summary Report detailing completed stories, test results, and known issues.
* **Gate Sign-off:**
  * Await stakeholder approval before advancing to the next sprint.
