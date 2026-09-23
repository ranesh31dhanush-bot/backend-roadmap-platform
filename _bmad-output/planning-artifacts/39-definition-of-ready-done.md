# 39. Definition of Ready (DoR) & Definition of Done (DoD)

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 5 — Scrum Master Planning  
**Role:** BMAD Scrum Master  
**Status:** Approved Engineering Quality Contracts  

---

## 1. Definition of Ready (DoR)

A user story **MUST** meet all of the following criteria before it can be pulled into an active Sprint backlog:

1. **User Story Clarity:** Stated in standard user story format (*"As a [role], I want [feature], so that [benefit]"*).
2. **Acceptance Criteria:** Defined with unambiguous **Given / When / Then** scenarios covering positive, negative, and edge-case behaviors.
3. **Architecture Reference:** Mapped to the authoritative Phase 4 Architecture artifact, ADR, API route contract, and MongoDB collection schema.
4. **UX Reference:** Mapped to relevant Phase 3 wireframes, design tokens, component inventories, and keyboard interaction guidelines (where frontend is touched).
5. **Dependencies Resolved:** All prerequisite stories in the Critical Path are completed and merged.
6. **Technical Scope & Sizing:** Implementation boundaries are explicitly scoped and sized ($\le \text{L}$; any story rated $\text{XL}$ is split).
7. **Security & Data Safety Impact Identified:** Explicitly states whether endpoints require authentication, CSRF validation, XSS sanitization, or transaction boundaries.
8. **Test Expectations Defined:** Unit, integration, or E2E testing scope clearly specified.

---

## 2. Definition of Done (DoD)

A user story is considered **DONE** and eligible for release only when all of the following verification checks are satisfied:

### Code Quality & Standards
- [ ] **TypeScript Compliance:** 100% clean compilation with `tsc --noEmit` under `strict: true` across all packages (`frontend`, `backend`, `shared`).
- [ ] **Linting & Formatting:** ESLint and Prettier pass with 0 errors and 0 warnings.
- [ ] **Layer Boundary Isolation:** Code strictly adheres to the 4-layer architecture (Controllers $\rightarrow$ Services $\rightarrow$ Repositories $\rightarrow$ Mongoose Models). No direct database queries inside route handlers.

### Automated Testing
- [ ] **Unit Tests:** All new domain logic, calculation helpers, and transformation utilities covered by Vitest with $\ge 85\%$ branch coverage.
- [ ] **Integration Tests:** All new API endpoints verified using Supertest + `mongodb-memory-server` testing HTTP status codes, Zod validation rejections, and database persistence.
- [ ] **E2E Tests:** Critical user journeys verified with automated Playwright specs.
- [ ] **Regression Check:** Full test suite executes in CI and passes 100%.

### Security & Data Safety
- [ ] **Input Validation:** All incoming request bodies, query parameters, and route params validated via strict Zod schemas.
- [ ] **Auth & RBAC:** Protected endpoints enforce HttpOnly cookie verification, CSRF token headers, and role guards (`learner` vs `admin`).
- [ ] **Zero Answer Leakage:** Quiz delivery payloads explicitly verified to contain no answer keys or explanations.
- [ ] **XSS Sanitization:** User-submitted markdown and URLs sanitized via DOMPurify / valid protocol checks.
- [ ] **Concurrency & Transactions:** Multi-document writes and legacy migrations wrapped in atomic MongoDB transactions; notes autosave validates `version` field.

### UX, Accessibility & Performance
- [ ] **Design Token Fidelity:** UI conforms to Phase 3 design system (dark palette, Inter/JetBrains Mono typography, 4px spacing).
- [ ] **Accessibility (WCAG 2.1 AA):** All interactive elements support full keyboard navigation, visible focus rings, appropriate ARIA roles, and color contrast $\ge 4.5:1$.
- [ ] **Responsive Design:** Verified on standard viewport widths (375px mobile, 768px tablet, 1024px desktop, 1440px wide).
- [ ] **Optimistic UI:** Checkbox toggle updates in $<16\text{ms}$ with automatic rollback on error.
- [ ] **Performance (NFR):** P95 API latency $< 150\text{ms}$; database queries backed by indexes with 0 `COLLSCAN`s.

### Observability & Documentation
- [ ] **Structured Logging:** Key domain events and errors logged via Pino with `x-request-id` and contextual metadata.
- [ ] **Error Handling:** Errors mapped to centralized `AppError` taxonomy returning standard JSON envelopes.
- [ ] **Git Hygiene:** Commits follow Conventional Commits format (`feat:`, `fix:`, `test:`, `docs:`) with atomic PR diffs.
