# Quiz Assessment & Security Architecture Specification

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 4 — System Architecture  
**Author:** Winston (BMAD System Architect)  
**Date:** September 21, 2026  
**Status:** Completed Architecture  

---

## 1. Zero-Trust Assessment Pipeline

To eliminate client-side answer extraction, the quiz system operates under a **Zero-Knowledge Delivery Model**:

```
                       SECURE QUIZ EVALUATION FLOW
  ┌────────────┐                                              ┌────────────┐
  │   CLIENT   │                                              │   SERVER   │
  └─────┬──────┘                                              └─────┬──────┘
        │ 1. POST /api/v1/quizzes/session (quizType, key)           │
        ├──────────────────────────────────────────────────────────►│
        │                                                           │ ──► [Server Selects 5/10/15 Qs]
        │                                                           │ ──► [Strips correctOptionIndex]
        │                                                           │ ──► [Strips explanation]
        │ 2. Return Questions (NO ANSWERS) + signed Session Token   │
        │◄──────────────────────────────────────────────────────────┤
        │                                                           │
        │ [Learner Takes Quiz Offline / In UI]                      │
        │                                                           │
        │ 3. POST /api/v1/quizzes/submit (sessionId, answers)       │
        ├──────────────────────────────────────────────────────────►│
        │                                                           │ ──► [Server Evaluates Answers]
        │                                                           │ ──► [Computes Score & Grade]
        │                                                           │ ──► [Logs QuizAttempt Record]
        │                                                           │ ──► [Updates QuizHighScore]
        │ 4. Return Score + Full Explanations + Correct Indices     │
        │◄──────────────────────────────────────────────────────────┤
```

---

## 2. Server-Side Scoring & Tier Rubrics

| Quiz Tier | Question Count | Question Pool Selection Source | Pass Mark Threshold |
|---|---|---|---|
| **Daily Quiz** | 5 Randomized Qs | Matching `bankSlug` based on daily topical tags | 60% (Pass) / 75% (Strong) |
| **Weekly Assessment**| 10 Randomized Qs | Cumulative pool of active week's topic banks | 70% |
| **Phase Certification**| 15 Comprehensive Qs| Comprehensive phase question pool | 75% |

### Letter Grade Calculation:
- $\ge 90\%$: `Outstanding! 🏆`
- $75\% - 89\%$: `Strong Pass ✅`
- $60\% - 74\%$: `Passed 👍`
- $< 60\%$: `Needs Review 📚` (Triggers guidance note: *"Review today's topics before advancing"*).

---

## 3. Anti-Cheating & Replay Defenses

1. **Session Expiry:** A quiz session token expires automatically after 60 minutes.
2. **Rate Limiting:** Session creation is restricted to 15 quiz sessions per user per hour, preventing brute-force automated question scraping.
3. **High-Score Preservation:** Retakes are unlimited, but `quiz_high_scores` is updated using `$max: { percentage: newScore }` so a lower subsequent score never degrades the learner's best record.
