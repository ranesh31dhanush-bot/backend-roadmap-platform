# Backend Architecture Specification (Node.js, Express & TypeScript)

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 4 — System Architecture  
**Author:** Winston (BMAD System Architect)  
**Date:** September 21, 2026  
**Status:** Completed Architecture  

---

## 1. Backend Layering Pattern

The backend follows a **Strict 4-Layer Modular Architecture**:

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │ 1. TRANSPORT & ROUTING LAYER (Controllers & Routers)                   │
 │ • Validates incoming HTTP requests (Zod schemas).                      │
 │ • Extracts headers, tokens, and cookies; passes DTOs to Services.      │
 ├────────────────────────────────────────────────────────────────────────┤
 │ 2. DOMAIN & BUSINESS LOGIC LAYER (Services)                            │
 │ • Pure business logic (e.g., pause delta calculation, streak rules).   │
 │ • Orchestrates transactions, publishes Domain Events.                  │
 ├────────────────────────────────────────────────────────────────────────┤
 │ 3. DATA ACCESS LAYER (Repositories)                                    │
 │ • Encapsulates all Mongoose queries, projections, and atomic updates.  │
 │ • Shields Service layer from database driver specifics.                │
 ├────────────────────────────────────────────────────────────────────────┤
 │ 4. PERSISTENCE LAYER (Mongoose Models & MongoDB Schemas)               │
 │ • Schema definitions, validation rules, indexes, and hooks.            │
 └────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Express Middleware Pipeline Order

Every incoming request flows through a deterministic middleware sequence:

```
 [Incoming HTTP Request]
       │
       ▼
 1. Request Correlation ID Middleware (`x-correlation-id` generated or propagated)
       │
       ▼
 2. Security Headers (`helmet({ contentSecurityPolicy: ... })`)
       │
       ▼
 3. CORS Middleware (Strict origin whitelist, `credentials: true`)
       │
       ▼
 4. Request Rate Limiter (`express-rate-limit` / in-memory or Redis)
       │
       ▼
 5. Body Parsers (`express.json({ limit: '1mb' })`, `cookieParser()`)
       │
       ▼
 6. Authentication Middleware (`requireAuth` / token verification)
       │
       ▼
 7. Role-Based Authorization Guard (`requireRole('ADMIN')` where applicable)
       │
       ▼
 8. Schema Validation Middleware (Zod request validator)
       │
       ▼
 9. Domain Controller Execution
       │
       ▼
 10. Global Centralized Error Handler (`errorHandler`)
```

---

## 3. Centralized Error Handling Strategy

All known operational errors inherit from an `AppError` base class:

```typescript
export class AppError extends Error {
  constructor(
    public override message: string,
    public statusCode: number = 500,
    public errorCode: string = 'INTERNAL_ERROR',
    public isOperational: boolean = true,
    public details: any = null
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
```

### Standardized JSON Error Response Envelope:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Start date must be a valid ISO date string (YYYY-MM-DD)",
    "correlationId": "req-9a8b7c6d-5e4f",
    "timestamp": "2026-09-21T18:30:00.000Z",
    "details": [
      { "field": "startDate", "issue": "Invalid format" }
    ]
  }
}
```

---

## 4. Recommended Backend Directory Structure

```
backend/
├── src/
│   ├── config/                   # Environment validation (envalid) & constants
│   ├── core/                     # Shared kernel primitives
│   │   ├── errors/               # AppError, NotFoundError, UnauthorizedError
│   │   ├── events/               # DomainEventBus, event types
│   │   ├── middleware/           # auth, rbac, rateLimiter, errorHandler, cors
│   │   └── utils/                # logger (pino), crypto, dateUtils
│   ├── modules/                  # Domain Modules (Self-Contained)
│   │   ├── auth/                 # Controllers, Services, Repos, Models, Routes
│   │   ├── user/
│   │   ├── curriculum/
│   │   ├── schedule/
│   │   ├── progress/
│   │   ├── quiz/
│   │   ├── notes/
│   │   ├── streak/
│   │   ├── migration/
│   │   ├── project/
│   │   ├── analytics/
│   │   └── admin/
│   ├── app.ts                    # Express app configuration & middleware mounts
│   └── server.ts                 # HTTP server bootstrap, MongoDB connection & shutdown
├── tests/                        # Unit, integration, and API test suites
└── package.json
```
