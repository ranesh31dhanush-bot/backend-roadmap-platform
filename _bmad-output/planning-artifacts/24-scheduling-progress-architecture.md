# Scheduling & Progress Engine Architecture

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 4 — System Architecture  
**Author:** Winston (BMAD System Architect)  
**Date:** September 21, 2026  
**Status:** Completed Architecture  

---

## 1. Scheduling Engine: Computation vs. Storage

### Core Architectural Decision:
Instead of storing 364 individual date strings per user in the database (which creates massive data duplication and write overhead during rescheduling), the platform stores **only the Schedule Anchor** and computes calendar dates dynamically at runtime.

```
                      SCHEDULE PROJECTION FORMULA
  For any day with sequential offset index n (where 0 <= n < 364):
  
          CalculatedCalendarDate(n) = startDate + n days
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       STORED VS COMPUTED SCHEDULE STATE                     │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ STORED IN DATABASE (`user_schedules`)│ COMPUTED AT RUNTIME (API & CLIENT)   │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ • `startDate`: "2026-09-21"          │ • Calendar date of every week/day    │
│ • `isPaused`: false                  │ • Today's matching day coordinates   │
│ • `pausedAt`: null                   │ • Projected completion date          │
│ • `totalPauseDays`: 0                │ • Days remaining counter             │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

---

## 2. Pause / Resume Algorithm

```
                    PAUSE / RESUME DELTA RECALCULATION
                    
  1. User Pauses:
     SET user_schedules.isPaused = true
     SET user_schedules.pausedAt = todayStr()
     
  2. User Resumes (N days later):
     pauseDeltaDays = floor((currentDate - pausedAt) / 86400000)
     
     newStartDate = addDays(startDate, pauseDeltaDays)
     totalPauseDays = totalPauseDays + pauseDeltaDays
     
     SET user_schedules.startDate = newStartDate
     SET user_schedules.totalPauseDays = totalPauseDays
     SET user_schedules.isPaused = false
     SET user_schedules.pausedAt = null
```

---

## 3. Progress Rollup & Atomic Concurrency Model

### 3.1 Source of Truth
The primary source of truth for completion is the `topic_progress` collection, keyed by `{ userId, topicId }`.

### 3.2 Atomic Idempotent Toggle Operation:
To prevent race conditions during rapid double-clicks on slow connections:

```typescript
// Atomically toggles topic completion status
export async function toggleTopicProgress(userId: ObjectId, topicId: string, dayId: string, phaseNum: number, weekNum: number) {
  const existing = await TopicProgressModel.findOne({ userId, topicId });
  
  if (existing) {
    // Delete record (uncheck)
    await TopicProgressModel.deleteOne({ _id: existing._id });
    return { topicId, isCompleted: false };
  } else {
    // Upsert record (check)
    await TopicProgressModel.updateOne(
      { userId, topicId },
      { $setOnInsert: { userId, topicId, canonicalDayId: dayId, phaseNumber: phaseNum, weekNumber: weekNum, completedAt: new Date() } },
      { upsert: true }
    );
    return { topicId, isCompleted: true };
  }
}
```

### 3.3 Multi-Tier Rollup Calculations:
- **Day Tier:** Completed when `COUNT(TopicProgress WHERE userId == U AND canonicalDayId == D) == TotalTopicsInDay`.
- **Week Tier:** Completed when all active days in week evaluate to complete.
- **Phase Tier:** `(CompletedPhaseTopics / TotalPhaseTopics) * 100`.
- **Global Tier:** `(TotalCompletedTopics / 813) * 100`.
