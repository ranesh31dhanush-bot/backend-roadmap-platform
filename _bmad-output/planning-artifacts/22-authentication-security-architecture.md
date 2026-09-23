# Authentication & Security Architecture Specification

**Project:** Top 1% Backend Roadmap Platform  
**BMAD Phase:** Phase 4 — System Architecture  
**Author:** Winston (BMAD System Architect)  
**Date:** September 21, 2026  
**Status:** Completed Architecture  

---

## 1. Authentication & Session Strategy

```
                       DUAL-TOKEN COOKIE ROTATION FLOW
  ┌────────────┐                                              ┌────────────┐
  │   CLIENT   │                                              │   SERVER   │
  └─────┬──────┘                                              └─────┬──────┘
        │ 1. POST /api/v1/auth/login (Credentials)                  │
        ├──────────────────────────────────────────────────────────►│
        │ 2. Set HttpOnly Cookies:                                  │
        │    • accessToken  (JWT, 15m expiry, RS256/HS256)          │
        │    • refreshToken (Opaque/UUID, 7d expiry)                │
        │    • csrfToken    (Readable cookie for X-CSRF-Token header)│
        │◄──────────────────────────────────────────────────────────┤
        │                                                           │
        │ 3. Authenticated Request (accessToken sent automatically) │
        ├──────────────────────────────────────────────────────────►│ ──► [200 OK]
        │                                                           │
        │ 4. accessToken Expires (401 Unauthorized received)        │
        │◄──────────────────────────────────────────────────────────┤
        │                                                           │
        │ 5. POST /api/v1/auth/refresh-token (refreshToken cookie)  │
        ├──────────────────────────────────────────────────────────►│
        │ 6. Rotate refreshToken + Issue new accessToken cookie     │
        │◄──────────────────────────────────────────────────────────┤
```

### Security Properties:
1. **Zero JavaScript Token Access:** Access and refresh tokens are stored exclusively in `HttpOnly`, `SameSite=Strict`, `Secure` cookies, eliminating token theft via Cross-Site Scripting (XSS).
2. **Refresh Token Family Invalidation:** If an expired or re-used refresh token is presented, the server revokes the entire token family immediately, mitigating token replay attacks.

---

## 2. Authorization & Role-Based Access Control (RBAC)

Two distinct roles are enforced via declarative middleware guards:

```typescript
export function requireRole(allowedRoles: ('USER' | 'ADMIN')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw new AppError('Forbidden: Insufficient privileges', 403, 'FORBIDDEN');
    }
    next();
  };
}
```

- **`Role: USER`:** Access to learner curriculum, personal progress, notes, schedule, quizzes.
- **`Role: ADMIN`:** Access to `/api/v1/admin/*` endpoints (curriculum CRUD, question studio, user inspector).

---

## 3. Defense-in-Depth Security Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DEFENSE-IN-DEPTH MATRIX                           │
├───────────────────┬─────────────────────────────────────────────────────────┤
│ THREAT CATEGORY   │ ARCHITECTURAL MITIGATION MECHANISM                      │
├───────────────────┼─────────────────────────────────────────────────────────┤
│ **XSS**           │ Content Security Policy (CSP), HttpOnly cookies,        │
│                   │ server-side markdown sanitization (`sanitize-html`).    │
├───────────────────┼─────────────────────────────────────────────────────────┤
│ **CSRF**          │ `SameSite=Strict` cookies + Double-Submit Cookie with   │
│                   │ `X-CSRF-Token` header verification on mutating methods. │
├───────────────────┼─────────────────────────────────────────────────────────┤
│ **NoSQL Injection│ Mongoose strict typing + `express-mongo-sanitize`       │
│                   │ stripping `$` and `.` characters from query payloads.   │
├───────────────────┼─────────────────────────────────────────────────────────┤
│ **Brute-Force**   │ Strict rate limiting: 5 req/min on `/auth/login` and    │
│                   │ `/auth/forgot-password`; 100 req/min on global API.     │
├───────────────────┼─────────────────────────────────────────────────────────┤
│ **Password Safety** bcrypt hashing with cost factor 12 (computation ~300ms)│
│                   │ zero plaintext password storage or logging.             │
├───────────────────┼─────────────────────────────────────────────────────────┤
│ **Quiz Leaks**    │ Server-evaluated quizzes; answers and explanations are  │
│                   │ stripped prior to client delivery.                      │
└───────────────────┴─────────────────────────────────────────────────────────┘
```
