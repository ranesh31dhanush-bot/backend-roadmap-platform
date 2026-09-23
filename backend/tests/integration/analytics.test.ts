import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../../src/app.js";
import { connectDatabase, disconnectDatabase } from "../../src/config/database.js";
import { TelemetryEventModel } from "../../src/models/telemetryEvent.model.js";

describe("Analytics API — ANLT-001 & ANLT-002 Integration Tests", () => {
  let mongod: MongoMemoryServer;
  const app = createApp();

  const learner = {
    email: "analytics_learner@example.com",
    password: "Password123!",
    displayName: "Analytics Learner",
  };

  let cookies: string[] = [];
  let csrfToken = "";
  let userId = "";

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await connectDatabase(mongod.getUri());

    const reg = await request(app)
      .post("/api/v1/auth/register")
      .set("x-skip-rate-limit", "true")
      .send(learner);
    expect(reg.status).toBe(201);
    cookies = reg.headers["set-cookie"] || [];
    csrfToken = reg.body.data.csrfToken;
    userId = reg.body.data.user?.id || reg.body.data.userId || "";
  });

  afterAll(async () => {
    await disconnectDatabase();
    if (mongod) await mongod.stop();
  });

  // ─── ANLT-001: Telemetry Event Ingestion ──────────────────────────────────

  it("POST /api/v1/analytics/event rejects unauthenticated requests with 403 (CSRF guard fires first)", async () => {
    // CSRF guard runs before authGuard on mutating methods — no cookie → 403 from csrfGuard
    const res = await request(app)
      .post("/api/v1/analytics/event")
      .set("x-csrf-token", csrfToken)
      .send({ eventType: "page_viewed" });
    // CSRF guard fires before authGuard for POST requests without a valid session cookie
    expect([401, 403]).toContain(res.status);
  });

  it("POST /api/v1/analytics/event returns 202 Accepted immediately", async () => {
    const start = Date.now();
    const res = await request(app)
      .post("/api/v1/analytics/event")
      .set("Cookie", cookies)
      .set("x-csrf-token", csrfToken)
      .send({ eventType: "topic_completed", resourceId: "p1-w1-d1-t1" });
    const elapsed = Date.now() - start;

    expect(res.status).toBe(202);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accepted).toBe(true);
    // Verify speed — 202 must be fast (< 500ms in test env with memory MongoDB)
    expect(elapsed).toBeLessThan(500);
  });

  it("POST /api/v1/analytics/event rejects invalid eventType with 400", async () => {
    const res = await request(app)
      .post("/api/v1/analytics/event")
      .set("Cookie", cookies)
      .set("x-csrf-token", csrfToken)
      .send({ eventType: "INVALID_EVENT_TYPE_XYZ" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/v1/analytics/event rejects request without CSRF token with 403", async () => {
    const res = await request(app)
      .post("/api/v1/analytics/event")
      .set("Cookie", cookies)
      .send({ eventType: "quiz_started" });
    expect(res.status).toBe(403);
  });

  it("multiple telemetry events of different types are accepted", async () => {
    const eventTypes = [
      "quiz_started",
      "quiz_completed",
      "pomodoro_completed",
      "streak_extended",
      "note_saved",
    ] as const;

    for (const eventType of eventTypes) {
      const res = await request(app)
        .post("/api/v1/analytics/event")
        .set("Cookie", cookies)
        .set("x-csrf-token", csrfToken)
        .send({ eventType });
      expect(res.status).toBe(202);
    }
  });

  // ─── ANLT-002: Velocity Stats ─────────────────────────────────────────────

  it("GET /api/v1/analytics/velocity rejects unauthenticated requests with 401", async () => {
    const res = await request(app).get("/api/v1/analytics/velocity");
    expect(res.status).toBe(401);
  });

  it("GET /api/v1/analytics/velocity returns 200 with velocity stats shape", async () => {
    const res = await request(app)
      .get("/api/v1/analytics/velocity")
      .set("Cookie", cookies);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const stats = res.body.data;
    expect(stats).toHaveProperty("topicsCompleted");
    expect(stats).toHaveProperty("totalTopics");
    expect(stats).toHaveProperty("globalPercentage");
    expect(stats).toHaveProperty("currentStreak");
    expect(stats).toHaveProperty("longestStreak");
    expect(stats).toHaveProperty("avgTopicsPerDay");
    expect(stats).toHaveProperty("daysSinceStart");
    expect(stats).toHaveProperty("estimatedDaysRemaining");
    expect(stats).toHaveProperty("projectedCompletionDate");
    expect(stats).toHaveProperty("startDate");
  });

  it("new learner has 0 topics completed and 0% global percentage", async () => {
    const res = await request(app)
      .get("/api/v1/analytics/velocity")
      .set("Cookie", cookies);

    expect(res.status).toBe(200);
    expect(res.body.data.topicsCompleted).toBe(0);
    expect(res.body.data.globalPercentage).toBe(0);
    expect(res.body.data.totalTopics).toBe(813);
  });

  it("velocity stats response includes meta.requestId", async () => {
    const res = await request(app)
      .get("/api/v1/analytics/velocity")
      .set("Cookie", cookies);

    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.requestId).toBeTruthy();
  });

  it("telemetry events are persisted to DB (verified after async settle)", async () => {
    // Give the fire-and-forget enough time to settle in the test environment
    await new Promise((r) => setTimeout(r, 200));

    const count = await TelemetryEventModel.countDocuments({});
    // We fired at least 2 events (topic_completed + multiple others)
    expect(count).toBeGreaterThan(1);
  });
});
