# Testing Architecture & Quality Assurance Strategy

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 4 — System Architecture  
**Author:** Winston (BMAD System Architect)  
**Date:** September 21, 2026  
**Status:** Completed Architecture  

---

## 1. Testing Pyramid & Tooling Matrix

```
                      AUTOMATED TESTING PYRAMID
  
                   / \
                  / E2E \       ──► Playwright (10 Critical Journeys)
                 / Tests \
                /─────────\
               /Integration\    ──► Supertest + mongodb-memory-server
              /    Tests    \
             /───────────────\
            /   Unit Tests    \ ──► Vitest (Pure Domain Services & UI Components)
           /───────────────────\
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          TESTING SUITE SPECIFICATION                        │
├───────────────┬──────────────────────────┬──────────────────────────────────┤
│ TEST TIER     │ FRAMEWORK / RUNNER       │ TARGET DOMAIN & SCOPE            │
├───────────────┼──────────────────────────┼──────────────────────────────────┤
│ **Unit**      │ Vitest / ts-jest         │ Schedule calculations, quiz      │
│               │                          │ scoring algorithms, migration    │
│               │                          │ mappers, React custom hooks.     │
├───────────────┼──────────────────────────┼──────────────────────────────────┤
│ **Integration**│ Supertest + Memory DB   │ Express route controllers,       │
│               │ (`mongodb-memory-server`)│ database repository queries,     │
│               │                          │ auth cookie exchange pipelines.  │
├───────────────┼──────────────────────────┼──────────────────────────────────┤
│ **End-to-End**│ Playwright               │ Full browser user journeys across│
│               │                          │ desktop, tablet, and mobile.     │
└───────────────┴──────────────────────────┴──────────────────────────────────┘
```

---

## 2. Critical E2E Test Journey Catalog

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CRITICAL E2E JOURNEYS                              │
├────┬────────────────────────────┬───────────────────────────────────────────┤
│ ID │ JOURNEY NAME               │ KEY VALIDATION ASSERTIONS                 │
├────┼────────────────────────────┼───────────────────────────────────────────┤
│ E1 │ Registration & Onboarding  │ Account created $\rightarrow$ Start date set $\rightarrow$ lands Day 1.│
│ E2 │ Subtopic Toggle & Rollup   │ Checkbox toggles $\rightarrow$ Day/Week/Global stats increment.│
│ E3 │ Reschedule Date Remap      │ Start date changes $\rightarrow$ Dates remap, notes intact.│
│ E4 │ Course Pause / Resume      │ Pause recorded $\rightarrow$ Resumes 7d later $\rightarrow$ End date $+7$d.│
│ E5 │ Quiz Security & Scoring    │ Session created (no answers) $\rightarrow$ Submit $\rightarrow$ Score 80%.│
│ E6 │ Markdown Notes Auto-Save   │ Types note $\rightarrow$ 1200ms idle $\rightarrow$ Persisted in cloud.   │
│ E7 │ LocalStorage Migration     │ Legacy payload detected $\rightarrow$ Imported $\rightarrow$ State merged.│
│ E8 │ Admin Curriculum Publish   │ Admin edits subtopic $\rightarrow$ Published $\rightarrow$ Live for users. │
└────┴────────────────────────────┴───────────────────────────────────────────┘
```
