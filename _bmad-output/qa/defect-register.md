# Phase 7 — Defect Register

**Project:** Top 1% Backend Developer Roadmap Platform  
**BMAD Phase:** Phase 7 — QA & Final Validation  
**Date:** September 22, 2026  
**Auditor:** BMAD QA / Test Architect  

---

## Defect Classification Standards

* **P0 — Critical Blocker:** Security breach, data corruption, authentication bypass, complete production blocker.
* **P1 — High:** Major approved functionality unusable, severe user impact with no workaround.
* **P2 — Medium:** Meaningful defect or security concern with an available workaround or remediated.
* **P3 — Low:** Minor UX, cosmetic, documentation, build hygiene, or upstream transitive dependency issue.

---

## Defect Summary

| Defect ID | Severity | Feature Area | Title | Status |
| :--- | :--- | :--- | :--- | :--- |
| **DEF-001** | P2 (Medium) | Security / Config | Hardcoded MongoDB Atlas URI in `backend/src/config/env.ts` | **FIXED** |
| **DEF-002** | P3 (Low) | Dependencies | Transitive vulnerability in `postcss` via `next@15` | **DEFERRED** |
| **DEF-003** | P3 (Low) | DevOps / Docker | `tsconfig*.json` excluded by `.dockerignore` | **FIXED** |
| **DEF-004** | P3 (Low) | Security / CSRF | CSRF token cookie name case sensitivity (`csrfToken` vs `csrf_token`) | **CONFIRMED / DOCS** |

---

## Detailed Defect Records

### DEF-001: Hardcoded MongoDB URI in Zod Schema Fallback
* **ID:** `DEF-001`
* **Severity:** P2 (Remediated)
* **Story ID:** `HARD-003`
* **Feature:** Configuration & Environment Security
* **Environment:** Development / Staging / Production
* **Preconditions:** Inspecting `backend/src/config/env.ts`
* **Steps to Reproduce:**
  1. Open `backend/src/config/env.ts`.
  2. Inspect `MONGODB_URI` Zod schema definition.
* **Expected Result:**
  `MONGODB_URI` must NOT have default credentials hardcoded into source code. In production, application must fail fast if `MONGODB_URI` is not provided via environment.
* **Actual Result:**
  A real MongoDB Atlas connection string with embedded credentials was hardcoded as a `.default()` schema fallback.
* **Evidence:** `backend/src/config/env.ts` lines 18–25 (Sprint 10 baseline).
* **Impact:** Repository read access could expose database connection credentials.
* **Status:** **FIXED** (Removed hardcoded default in Sprint 11; added strict production weak-secret startup guard).

---

### DEF-002: Transitive Dependency Vulnerability in PostCSS
* **ID:** `DEF-002`
* **Severity:** P3 (Low / Third-Party Upstream)
* **Story ID:** `HARD-003`
* **Feature:** Dependency Hygiene & Security Audit
* **Environment:** All environments
* **Preconditions:** Run `npm audit` on monorepo root.
* **Steps to Reproduce:**
  1. Execute `npm audit`.
  2. Inspect report for `postcss` advisory GHSA-qx2v-qp2m-jg93.
* **Expected Result:** Zero production vulnerabilities.
* **Actual Result:**
  High severity vulnerability in transitive `postcss` packaged inside Next.js 15. Fix requires upgrading to Next.js 16 (`next@16.3.5`), which is a major breaking upgrade.
* **Evidence:** `npm audit` log output.
* **Impact:** Low in practice; the platform does not process user-submitted CSS through PostCSS stringify.
* **Status:** **DEFERRED** (Pending non-breaking Next.js 15 security patch).

---

### DEF-003: Dockerignore Exclusion of TypeScript Config
* **ID:** `DEF-003`
* **Severity:** P3 (Low)
* **Story ID:** `HARD-001`
* **Feature:** Containerization & Multi-Stage Builds
* **Environment:** Docker build environment
* **Preconditions:** Build backend/frontend containers using standard `.dockerignore`.
* **Steps to Reproduce:**
  1. Inspect `backend/.dockerignore` and `frontend/.dockerignore`.
  2. Notice pattern `tsconfig*.json`.
* **Expected Result:** `tsconfig.json` must be copied into container `builder` stage for `tsc` compilation.
* **Actual Result:** `tsconfig*.json` pattern excluded TypeScript config files from Docker context.
* **Evidence:** `.dockerignore` line 14.
* **Impact:** Docker image compilation would fail during `npm run build` in builder stage.
* **Status:** **FIXED** (Removed `tsconfig*.json` exclusion in Sprint 11).

---

### DEF-004: CSRF Header and Cookie Convention Alignment
* **ID:** `DEF-004`
* **Severity:** P3 (Documentation & Test Convention)
* **Story ID:** `AUTH-006`
* **Feature:** Double-Submit CSRF Guard
* **Environment:** All mutating API endpoints
* **Preconditions:** Send `POST`, `PUT`, `DELETE`, or `PATCH` request to protected endpoints.
* **Steps to Reproduce:**
  1. Make mutating request with `x-csrf-token` header mismatched or missing `csrfToken` cookie.
* **Expected Result:** Request blocked with `403 Forbidden`.
* **Actual Result:**
  Request is strictly blocked with `403 Forbidden` (`AUTHORIZATION_ERROR`). Note: Cookie is named `csrfToken` (camelCase) while request header is `x-csrf-token` (kebab-case).
* **Evidence:** `backend/src/middleware/csrfGuard.ts`.
* **Impact:** Informational for API consumers and test harnesses.
* **Status:** **CONFIRMED / DOCS** (Operating as designed).
