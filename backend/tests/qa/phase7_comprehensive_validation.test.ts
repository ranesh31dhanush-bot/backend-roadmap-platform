import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../../src/app.js";
import { connectDatabase, disconnectDatabase } from "../../src/config/database.js";
import { UserModel } from "../../src/models/user.model.js";
import { AdminAuditLogModel } from "../../src/models/adminAuditLog.model.js";
import { CurriculumNodeModel } from "../../src/models/curriculumNode.model.js";

describe("Phase 7: Independent QA Validation Suite", () => {
  let mongod: MongoMemoryServer;
  const app = createApp();

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await connectDatabase(uri);

    // Seed test curriculum nodes for day 1 and day 2
    await CurriculumNodeModel.create([
      {
        canonicalDayId: "p1-w1-d1",
        version: "1.0.0",
        status: "published",
        phaseNumber: 1,
        phaseName: "Phase 1",
        weekNumber: 1,
        weekTitle: "Week 1",
        dayNumberInWeek: 1,
        globalDayNumber: 1,
        title: "Day 1: Foundations",
        subtopics: [{ topicId: "p1-w1-d1-t1", text: "Architecture Basics" }],
      },
      {
        canonicalDayId: "p1-w1-d2",
        version: "1.0.0",
        status: "published",
        phaseNumber: 1,
        phaseName: "Phase 1",
        weekNumber: 1,
        weekTitle: "Week 1",
        dayNumberInWeek: 2,
        globalDayNumber: 2,
        title: "Day 2: Foundations Part 2",
        subtopics: [{ topicId: "p1-w1-d2-t1", text: "Data Structures" }],
      },
    ]);
  });

  afterAll(async () => {
    await disconnectDatabase();
    if (mongod) await mongod.stop();
  });

  const userA = {
    email: "qa_user_a@test.com",
    password: "Password123!",
    displayName: "QA Learner A",
  };

  const userB = {
    email: "qa_user_b@test.com",
    password: "Password123!",
    displayName: "QA Learner B",
  };

  const adminUser = {
    email: "qa_admin@test.com",
    password: "AdminPassword123!",
    displayName: "QA Backoffice Admin",
  };

  let userACookies: string[] = [];
  let userBCookies: string[] = [];
  let adminCookies: string[] = [];
  let userAId: string = "";
  let userBId: string = "";

  // Helper to extract cookies from response
  const getCookies = (res: request.Response) => {
    const raw = res.headers["set-cookie"];
    if (Array.isArray(raw)) return raw.map((c) => c.split(";")[0]);
    if (typeof raw === "string") return [raw.split(";")[0]];
    return [];
  };

  // Helper to get CSRF token from cookies
  const getCsrfToken = (cookies: string[]) => {
    const csrfCookie = cookies.find((c) => c.startsWith("csrfToken="));
    return csrfCookie ? csrfCookie.replace("csrfToken=", "") : "";
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 1. AUTHENTICATION & IDENTITY QA
  // ───────────────────────────────────────────────────────────────────────────
  describe("1. Authentication & Session QA", () => {
    it("registers User A and sets dual HttpOnly cookies + CSRF cookie", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .set("x-skip-rate-limit", "true")
        .send(userA);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(userA.email);
      userAId = res.body.data.user.id;

      userACookies = getCookies(res);
      expect(userACookies.some((c) => c.startsWith("accessToken="))).toBe(true);
      expect(userACookies.some((c) => c.startsWith("refreshToken="))).toBe(true);
      expect(userACookies.some((c) => c.startsWith("csrfToken="))).toBe(true);
    });

    it("rejects duplicate registration with identical email", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .set("x-skip-rate-limit", "true")
        .send(userA);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("CONFLICT");
    });

    it("registers User B and Admin User", async () => {
      const resB = await request(app)
        .post("/api/v1/auth/register")
        .set("x-skip-rate-limit", "true")
        .send(userB);

      expect(resB.status).toBe(201);
      userBId = resB.body.data.user.id;
      userBCookies = getCookies(resB);

      const resAdmin = await request(app)
        .post("/api/v1/auth/register")
        .set("x-skip-rate-limit", "true")
        .send(adminUser);

      expect(resAdmin.status).toBe(201);
      adminCookies = getCookies(resAdmin);

      // Elevate adminUser role in MongoDB directly for testing
      await UserModel.updateOne({ email: adminUser.email }, { $set: { role: "admin" } });
    });

    it("rejects login with incorrect password", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .set("x-skip-rate-limit", "true")
        .send({ email: userA.email, password: "WrongPassword999!" });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("AUTHENTICATION_ERROR");
    });

    it("GET /api/v1/auth/me returns current user identity", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Cookie", userACookies);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(userA.email);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 2. MANDATORY USER ISOLATION QA
  // ───────────────────────────────────────────────────────────────────────────
  describe("2. Mandatory User Isolation QA (User A vs User B)", () => {
    it("User A creates notes for Day 1; User B cannot read User A notes", async () => {
      const csrfA = getCsrfToken(userACookies);
      // User A creates/saves note
      const saveRes = await request(app)
        .put("/api/v1/notes/p1-w1-d1")
        .set("Cookie", userACookies)
        .set("x-csrf-token", csrfA)
        .send({ content: "User A Confidential Notes", version: 1 });

      expect([200, 201]).toContain(saveRes.status);

      // User B reads note for same day
      const resB = await request(app)
        .get("/api/v1/notes/p1-w1-d1")
        .set("Cookie", userBCookies);

      expect(resB.status).toBe(200);
      // User B must get empty note or their own note, NEVER User A content
      if (resB.body.data) {
        expect(resB.body.data.content).not.toBe("User A Confidential Notes");
      }
    });

    it("User A creates external link; User B cannot view or delete it", async () => {
      const csrfA = getCsrfToken(userACookies);
      const linkRes = await request(app)
        .post("/api/v1/links")
        .set("Cookie", userACookies)
        .set("x-csrf-token", csrfA)
        .send({
          canonicalDayId: "p1-w1-d1",
          url: "https://example.com/user-a-resource",
          title: "User A Link",
          category: "article",
        });

      expect(linkRes.status).toBe(201);
      const linkId = linkRes.body.data._id || linkRes.body.data.id;

      // User B queries their links
      const listResB = await request(app)
        .get("/api/v1/links/p1-w1-d1")
        .set("Cookie", userBCookies);

      expect(listResB.status).toBe(200);
      const bLinks = Array.isArray(listResB.body.data) ? listResB.body.data : [];
      expect(bLinks.some((l: any) => l.title === "User A Link")).toBe(false);

      // User B attempts to delete User A's link directly
      const csrfB = getCsrfToken(userBCookies);
      const deleteResB = await request(app)
        .delete(`/api/v1/links/${linkId}`)
        .set("Cookie", userBCookies)
        .set("x-csrf-token", csrfB);

      // Must be 403 Forbidden or 404 Not Found
      expect([403, 404]).toContain(deleteResB.status);
    });

    it("User A toggles topic progress; User B progress remains isolated", async () => {
      const csrfA = getCsrfToken(userACookies);
      const toggleRes = await request(app)
        .post("/api/v1/progress/toggle")
        .set("Cookie", userACookies)
        .set("x-csrf-token", csrfA)
        .send({
          topicId: "p1-w1-d1-t1",
          canonicalDayId: "p1-w1-d1",
        });

      expect(toggleRes.status).toBe(200);

      // User B progress summary should show 0 completed
      const summaryB = await request(app)
        .get("/api/v1/progress/summary")
        .set("Cookie", userBCookies);

      expect(summaryB.status).toBe(200);
      expect(summaryB.body.data.totalCompleted).toBe(0);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 3. QUIZ SECURITY & ANTI-CHEATING QA
  // ───────────────────────────────────────────────────────────────────────────
  describe("3. Quiz Security & Zero-Knowledge QA", () => {
    it("STRICT ZERO-KNOWLEDGE: Quiz start payload NEVER leaks correctOptionIndex or explanation", async () => {
      const csrfA = getCsrfToken(userACookies);
      const startRes = await request(app)
        .post("/api/v1/quizzes/p1-w1-d1/start")
        .set("Cookie", userACookies)
        .set("x-csrf-token", csrfA);

      if (startRes.status === 200) {
        const questions = startRes.body.data.questions || [];
        for (const q of questions) {
          expect(q).not.toHaveProperty("correctOptionIndex");
          expect(q).not.toHaveProperty("explanation");
          // Inspect raw JSON string as well
          const raw = JSON.stringify(q);
          expect(raw).not.toContain("correctOptionIndex");
        }
      }
    });

    it("blocks quiz submission from unauthenticated requests", async () => {
      const res = await request(app)
        .post("/api/v1/quizzes/fake-attempt-id/submit")
        .send({ answers: [] });

      // Unauthenticated request is rejected with 401 or 403 (CSRF guard)
      expect([401, 403]).toContain(res.status);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 4. NOTES OPTIMISTIC CONCURRENCY CONTROL (OCC) QA
  // ───────────────────────────────────────────────────────────────────────────
  describe("4. Notes Optimistic Concurrency Control (OCC) QA", () => {
    it("enforces OCC versioning: rejects stale update with 409 Conflict", async () => {
      const csrfA = getCsrfToken(userACookies);

      // Save initial version
      const v1Res = await request(app)
        .put("/api/v1/notes/p1-w1-d2")
        .set("Cookie", userACookies)
        .set("x-csrf-token", csrfA)
        .send({ content: "Version 1 Notes", version: 1 });

      expect([200, 201]).toContain(v1Res.status);
      const newVersion = v1Res.body.data.version;

      // Update to next version
      const v2Res = await request(app)
        .put("/api/v1/notes/p1-w1-d2")
        .set("Cookie", userACookies)
        .set("x-csrf-token", csrfA)
        .send({ content: "Version 2 Notes", version: newVersion });

      expect(v2Res.status).toBe(200);

      // Stale update using old version 1 must receive 409 Conflict
      const staleRes = await request(app)
        .put("/api/v1/notes/p1-w1-d2")
        .set("Cookie", userACookies)
        .set("x-csrf-token", csrfA)
        .send({ content: "Stale Overwrite Attempt", version: 1 });

      expect(staleRes.status).toBe(409);
      expect(staleRes.body.success).toBe(false);
      expect(staleRes.body.error.code).toBe("CONFLICT");
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 5. EXTERNAL LINKS PROTOCOL SANITIZATION QA
  // ───────────────────────────────────────────────────────────────────────────
  describe("5. External Links Security QA", () => {
    it("rejects dangerous URI schemes (javascript:) with 400 Bad Request", async () => {
      const csrfA = getCsrfToken(userACookies);
      const res = await request(app)
        .post("/api/v1/links")
        .set("Cookie", userACookies)
        .set("x-csrf-token", csrfA)
        .send({
          canonicalDayId: "p1-w1-d1",
          url: "javascript:alert(document.cookie)",
          title: "XSS Link",
          category: "article",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("accepts valid https URLs", async () => {
      const csrfA = getCsrfToken(userACookies);
      const res = await request(app)
        .post("/api/v1/links")
        .set("Cookie", userACookies)
        .set("x-csrf-token", csrfA)
        .send({
          canonicalDayId: "p1-w1-d1",
          url: "https://martinfowler.com/articles/patterns-of-distributed-systems/",
          title: "Patterns of Distributed Systems",
          category: "article",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 6. ADMIN AUTHORIZATION & AUDIT TRAIL QA
  // ───────────────────────────────────────────────────────────────────────────
  describe("6. Admin RBAC & Audit Trail QA", () => {
    it("blocks anonymous visitor from /api/v1/admin with 401 Unauthorized", async () => {
      const res = await request(app).get("/api/v1/admin/curriculum/nodes");
      expect(res.status).toBe(401);
    });

    it("blocks learner account from /api/v1/admin with 403 Forbidden", async () => {
      const res = await request(app)
        .get("/api/v1/admin/curriculum/nodes")
        .set("Cookie", userACookies);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("AUTHORIZATION_ERROR");
    });

    it("permits admin account to access /api/v1/admin/curriculum/nodes", async () => {
      // Re-login as admin to ensure updated JWT with admin role
      const loginAdmin = await request(app)
        .post("/api/v1/auth/login")
        .set("x-skip-rate-limit", "true")
        .send({ email: adminUser.email, password: adminUser.password });

      expect(loginAdmin.status).toBe(200);
      adminCookies = getCookies(loginAdmin);

      const res = await request(app)
        .get("/api/v1/admin/curriculum/nodes")
        .set("Cookie", adminCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 7. ANALYTICS TELEMETRY NON-BLOCKING QA
  // ───────────────────────────────────────────────────────────────────────────
  describe("7. Telemetry & Analytics QA", () => {
    it("POST /api/v1/analytics/event returns 202 Accepted immediately", async () => {
      const csrfA = getCsrfToken(userACookies);
      const start = Date.now();
      const res = await request(app)
        .post("/api/v1/analytics/event")
        .set("Cookie", userACookies)
        .set("x-csrf-token", csrfA)
        .send({
          eventType: "page_viewed",
          resourceId: "p1-w1-d1",
          metadata: { route: "/workspace" },
        });
      const duration = Date.now() - start;

      expect(res.status).toBe(202);
      expect(res.body.success).toBe(true);
      expect(duration).toBeLessThan(150); // fast fire-and-forget response
    });

    it("GET /api/v1/analytics/velocity returns velocity stats structure", async () => {
      const res = await request(app)
        .get("/api/v1/analytics/velocity")
        .set("Cookie", userACookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("topicsCompleted");
      expect(res.body.data).toHaveProperty("globalPercentage");
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 8. ERROR HANDLING & INFORMATION LEAKAGE QA
  // ───────────────────────────────────────────────────────────────────────────
  describe("8. Error Handling & Information Leakage QA", () => {
    it("returns standard 404 with NO stack trace on unknown endpoint", async () => {
      const res = await request(app).get("/api/v1/non-existent-route-xyz");
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body).not.toHaveProperty("stack");
      const raw = JSON.stringify(res.body);
      expect(raw).not.toContain("mongodb://");
      expect(raw).not.toContain("node_modules");
    });

    it("returns 400 validation error without leaking internals on malformed payload", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .set("x-skip-rate-limit", "true")
        .send({ email: "invalid-email-format", password: "short" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body).not.toHaveProperty("stack");
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 9. ONBOARDING & SCHEDULING QA
  // ───────────────────────────────────────────────────────────────────────────
  describe("9. Onboarding & Scheduling QA", () => {
    it("User A completes onboarding with custom start date", async () => {
      const csrfA = getCsrfToken(userACookies);
      const res = await request(app)
        .post("/api/v1/onboarding/start")
        .set("Cookie", userACookies)
        .set("x-csrf-token", csrfA)
        .send({ startDate: "2026-10-01" });

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
      expect(res.body.data.schedule.startDate).toBe("2026-10-01");
    });

    it("User A fetches their schedule at GET /api/v1/schedule/me", async () => {
      const res = await request(app)
        .get("/api/v1/schedule/me")
        .set("Cookie", userACookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isPaused).toBe(false);
    });

    it("User A pauses and resumes course schedule", async () => {
      const csrfA = getCsrfToken(userACookies);
      // Pause
      const pauseRes = await request(app)
        .post("/api/v1/schedule/pause")
        .set("Cookie", userACookies)
        .set("x-csrf-token", csrfA)
        .send({});

      expect(pauseRes.status).toBe(200);
      expect(pauseRes.body.data.isPaused).toBe(true);

      // Resume
      const resumeRes = await request(app)
        .post("/api/v1/schedule/resume")
        .set("Cookie", userACookies)
        .set("x-csrf-token", csrfA)
        .send({});

      expect(resumeRes.status).toBe(200);
      expect(resumeRes.body.data.isPaused).toBe(false);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 10. STREAKS & FREEZE RULES QA
  // ───────────────────────────────────────────────────────────────────────────
  describe("10. Streaks & Freeze Rules QA", () => {
    it("records daily activity and increments streak", async () => {
      const csrfA = getCsrfToken(userACookies);
      const res = await request(app)
        .post("/api/v1/streaks/activity")
        .set("Cookie", userACookies)
        .set("x-csrf-token", csrfA)
        .send({ activityType: "study" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.currentStreak).toBeGreaterThanOrEqual(1);
    });

    it("enforces monthly freeze token limit (1 freeze per calendar month)", async () => {
      const csrfA = getCsrfToken(userACookies);
      // First freeze consumption
      const firstFreeze = await request(app)
        .post("/api/v1/streaks/freeze")
        .set("Cookie", userACookies)
        .set("x-csrf-token", csrfA);

      expect([200, 400]).toContain(firstFreeze.status);

      // Second freeze in same month must fail if quota already used
      if (firstFreeze.status === 200) {
        const secondFreeze = await request(app)
          .post("/api/v1/streaks/freeze")
          .set("Cookie", userACookies)
          .set("x-csrf-token", csrfA);

        expect(secondFreeze.status).toBe(400);
      }
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 11. CAPSTONE PROJECTS READ-ONLY SPECIFICATION QA
  // ───────────────────────────────────────────────────────────────────────────
  describe("11. Capstone Projects QA", () => {
    it("public GET /api/v1/projects returns catalog without authentication", async () => {
      const res = await request(app).get("/api/v1/projects");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.projects)).toBe(true);
    });

    it("learner cannot mutate capstone catalog via POST (404 / read-only)", async () => {
      const csrfA = getCsrfToken(userACookies);
      const res = await request(app)
        .post("/api/v1/projects")
        .set("Cookie", userACookies)
        .set("x-csrf-token", csrfA)
        .send({ title: "Unauthorized Capstone" });

      expect([404, 405]).toContain(res.status);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 12. LEGACY LOCALSTORAGE MIGRATION QA
  // ───────────────────────────────────────────────────────────────────────────
  describe("12. Legacy LocalStorage Data Migration QA", () => {
    it("User B imports valid legacy localStorage data atomically", async () => {
      const csrfB = getCsrfToken(userBCookies);
      const legacyPayload = {
        done: { "p1-w1-d1-t1": true },
        notes: { "p1-w1-d1": "Legacy note imported" },
        qscores: { "p1-w1-d1": { pct: 85 } },
        startDate: "2026-09-01",
      };

      const res = await request(app)
        .post("/api/v1/migration/import")
        .set("Cookie", userBCookies)
        .set("x-csrf-token", csrfB)
        .send(legacyPayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("COMPLETED");
    });

    it("GET /api/v1/migration/status confirms migrated state for User B", async () => {
      const res = await request(app)
        .get("/api/v1/migration/status")
        .set("Cookie", userBCookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isMigrated).toBe(true);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 13. ADMIN PUBLISHING & AUDIT LEDGER QA
  // ───────────────────────────────────────────────────────────────────────────
  describe("13. Admin Publishing & Audit Trail QA", () => {
    it("admin draft & publish workflow records immutable audit entries", async () => {
      const csrfAdmin = getCsrfToken(adminCookies);

      // Create draft version
      const draftRes = await request(app)
        .post("/api/v1/admin/curriculum/versions/draft")
        .set("Cookie", adminCookies)
        .set("x-csrf-token", csrfAdmin)
        .send({ sourceVersion: "1.0.0", newDraftVersion: "1.2.0-draft" });

      expect(draftRes.status).toBe(201);

      // Publish draft version
      const pubRes = await request(app)
        .post("/api/v1/admin/curriculum/versions/publish")
        .set("Cookie", adminCookies)
        .set("x-csrf-token", csrfAdmin)
        .send({ version: "1.2.0-draft" });

      expect(pubRes.status).toBe(200);

      // Check admin audit log records in DB
      const logs = await AdminAuditLogModel.find({ adminEmail: adminUser.email });
      expect(logs.length).toBeGreaterThanOrEqual(1);
      expect(logs.some((l) => l.action.includes("CURRICULUM"))).toBe(true);
    });
  });
});
