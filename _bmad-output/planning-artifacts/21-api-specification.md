# REST API Architecture & Endpoint Contracts (`/api/v1`)

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 4 — System Architecture  
**Author:** Winston (BMAD System Architect)  
**Date:** September 21, 2026  
**Status:** Completed Architecture  

---

## 1. Global API Standards

- **Base URL:** `/api/v1`
- **Protocol:** HTTPS only
- **Data Format:** `application/json` (UTF-8)
- **Authentication:** `Bearer <JWT_ACCESS_TOKEN>` in Authorization header OR HttpOnly access token cookie.
- **CSRF Protection:** Non-GET mutating requests require `X-CSRF-Token` header.
- **Success Response Envelope:**
```json
{
  "success": true,
  "data": { ... },
  "meta": { "timestamp": "2026-09-21T18:30:00.000Z" }
}
```

---

## 2. Core Endpoint Specifications

### 2.1 Authentication & Identity (`/api/v1/auth`)

#### `POST /api/v1/auth/register`
- **Purpose:** Create new learner account.
- **Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "Jane Doe"
}
```
- **Response (201 Created):** Sets HttpOnly cookies (`accessToken`, `refreshToken`) + returns user profile DTO.

#### `POST /api/v1/auth/login`
- **Purpose:** Authenticate existing user.
- **Request Body:** `{ "email": "user@example.com", "password": "SecurePassword123!" }`
- **Response (200 OK):** Sets session cookies + returns user profile.

#### `POST /api/v1/auth/google`
- **Purpose:** Google OAuth 2.0 token verification & authentication.
- **Request Body:** `{ "idToken": "eyJhbGciOiJSUzI1Ni..." }`
- **Response (200 OK):** Returns authenticated user session.

---

### 2.2 Schedule & Calendar Engine (`/api/v1/schedule`)

#### `GET /api/v1/schedule/me`
- **Purpose:** Fetch learner's active schedule, calculated calendar projection, and pause status.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "startDate": "2026-09-21",
    "curDate": "2026-09-23",
    "curPhase": 1,
    "isPaused": false,
    "pausedAt": null,
    "totalPauseDays": 0,
    "projectedEndDate": "2027-09-20",
    "daysRemaining": 322
  }
}
```

#### `POST /api/v1/schedule/reschedule`
- **Purpose:** Remap start date while preserving all topic checkmarks and notes.
- **Request Body:** `{ "newStartDate": "2026-10-01" }`
- **Response (200 OK):** Returns updated schedule object with remapped dates.

#### `POST /api/v1/schedule/pause`
- **Purpose:** Freeze active learning journey.
- **Response (200 OK):** `{ "isPaused": true, "pausedAt": "2026-09-21" }`

#### `POST /api/v1/schedule/resume`
- **Purpose:** Unpause course, calculate pause delta ($\Delta$), and shift start date forward.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "isPaused": false,
    "daysPaused": 14,
    "newStartDate": "2026-10-05",
    "newEndDate": "2027-10-04"
  }
}
```

---

### 2.3 Progress Tracking (`/api/v1/progress`)

#### `POST /api/v1/progress/toggle`
- **Purpose:** Idempotent toggle of an individual subtopic checkbox.
- **Request Body:** `{ "topicId": "p1-w1-d1-t1", "canonicalDayId": "p1-w1-d1" }`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "topicId": "p1-w1-d1-t1",
    "isCompleted": true,
    "dayCompleted": false,
    "dayProgress": { "completed": 4, "total": 5 },
    "globalProgress": { "completed": 44, "total": 813, "percentage": 5 }
  }
}
```

#### `GET /api/v1/progress/summary`
- **Purpose:** Fetch complete user progress state across all phases and weeks.
- **Response (200 OK):** Returns dictionary of completed topic IDs + phase completion percentages.

---

### 2.4 Secure Assessment Engine (`/api/v1/quizzes`)

#### `POST /api/v1/quizzes/session`
- **Purpose:** Generate a quiz question pool WITHOUT answer keys.
- **Request Body:** `{ "quizType": "daily", "key": "Node.js Event Loop" }`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "sessionId": "qs-7a8b9c",
    "title": "Daily Quiz — Node.js Event Loop",
    "questions": [
      {
        "questionId": "q-ev-01",
        "questionText": "What happens when process.nextTick() is invoked?",
        "options": [
          "Executes in the next timer phase",
          "Executes immediately after current operation, before microtask queue",
          "Delegates to libuv thread pool",
          "Blocks the event loop indefinitely"
        ]
      }
    ]
  }
}
```

#### `POST /api/v1/quizzes/submit`
- **Purpose:** Server-side answer evaluation, score calculation, and rationale delivery.
- **Request Body:**
```json
{
  "sessionId": "qs-7a8b9c",
  "quizType": "daily",
  "quizKey": "Node.js Event Loop",
  "answers": [
    { "questionId": "q-ev-01", "selectedIndex": 1 }
  ]
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "score": 5,
    "total": 5,
    "percentage": 100,
    "grade": "Outstanding! 🏆",
    "passed": true,
    "evaluations": [
      {
        "questionId": "q-ev-01",
        "selectedIndex": 1,
        "correctIndex": 1,
        "isCorrect": true,
        "explanation": "process.nextTick() executes immediately after the current operation finishes..."
      }
    ]
  }
}
```

---

### 2.5 Notes & External Links (`/api/v1/notes`)

#### `PUT /api/v1/notes/day/:dayId`
- **Purpose:** Debounced auto-save of sanitized markdown notes.
- **Request Body:** `{ "content": "# My learnings today\n- Event loop has 6 phases..." }`
- **Response (200 OK):** `{ "saved": true, "wordCount": 142, "updatedAt": "2026-09-21T18:30:00.000Z" }`

#### `PUT /api/v1/notes/links/:dayId`
- **Purpose:** Save or update custom ChatGPT or PDF notes URL.
- **Request Body:** `{ "linkType": "CHATGPT", "url": "https://chatgpt.com/share/66e..." }`
- **Response (200 OK):** Returns updated link object.

---

### 2.6 LocalStorage Migration Bridge (`/api/v1/migration`)

#### `POST /api/v1/migration/import`
- **Purpose:** Atomic, idempotent import of legacy browser `localStorage` payload.
- **Request Body:**
```json
{
  "startDate": "2026-09-01",
  "done": { "s::1::0::0": true, "s::1::0::1": true },
  "notes": { "2026-09-01": "Legacy note text" },
  "qscores": { "daily::Node.js Event Loop": { "pct": 80, "score": 4, "total": 5 } },
  "chatLinks": { "2026-09-01": "https://chatgpt.com/share/..." },
  "pdfLinks": {}
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "importedTopics": 42,
    "importedNotes": 14,
    "importedQuizzes": 8,
    "status": "COMPLETED"
  }
}
```
