import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../../src/app.js";
import { connectDatabase, disconnectDatabase } from "../../src/config/database.js";
import { seedCurriculum } from "../../src/seeds/seedCurriculum.js";

describe("Progress Ledger & Rollup Aggregation Engine Integration Tests", () => {
  let mongod: MongoMemoryServer;
  const app = createApp();

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await connectDatabase(mongod.getUri());
    await seedCurriculum();
  });

  afterAll(async () => {
    await disconnectDatabase();
    if (mongod) await mongod.stop();
  });

  const userA = {
    email: "prog_user_a@example.com",
    password: "Password123!",
    displayName: "Learner Alpha",
  };

  const userB = {
    email: "prog_user_b@example.com",
    password: "Password123!",
    displayName: "Learner Beta",
  };

  let cookiesA: string[] = [];
  let csrfTokenA: string = "";

  let cookiesB: string[] = [];
  let csrfTokenB: string = "";

  it("registers and sets up two separate learners for isolation verification", async () => {
    // Register Learner Alpha
    const regA = await request(app)
      .post("/api/v1/auth/register")
      .set("x-skip-rate-limit", "true")
      .send(userA);
    expect(regA.status).toBe(201);
    cookiesA = regA.headers["set-cookie"] || [];
    csrfTokenA = regA.body.data.csrfToken;

    // Register Learner Beta
    const regB = await request(app)
      .post("/api/v1/auth/register")
      .set("x-skip-rate-limit", "true")
      .send(userB);
    expect(regB.status).toBe(201);
    cookiesB = regB.headers["set-cookie"] || [];
    csrfTokenB = regB.body.data.csrfToken;
  });

  it("GET /api/v1/progress/summary rejects unauthenticated requests with 401", async () => {
    const res = await request(app).get("/api/v1/progress/summary");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/v1/progress/toggle rejects requests without CSRF token with 403", async () => {
    const res = await request(app)
      .post("/api/v1/progress/toggle")
      .send({ topicId: "p1-w1-d1-t1", canonicalDayId: "p1-w1-d1" });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/v1/progress/toggle validates payload and rejects invalid slugs", async () => {
    const res = await request(app)
      .post("/api/v1/progress/toggle")
      .set("Cookie", cookiesA)
      .set("x-csrf-token", csrfTokenA)
      .send({ topicId: "bad-slug", canonicalDayId: "p1-w1-d1" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("Learner Alpha checks subtopics on Day 1 and checks day rollup response", async () => {
    // 1. Toggle topic 1
    const res1 = await request(app)
      .post("/api/v1/progress/toggle")
      .set("Cookie", cookiesA)
      .set("x-csrf-token", csrfTokenA)
      .send({ topicId: "p1-w1-d1-t1", canonicalDayId: "p1-w1-d1" });

    expect(res1.status).toBe(200);
    expect(res1.body.success).toBe(true);
    expect(res1.body.data.isCompleted).toBe(true);
    expect(res1.body.data.dayProgress.completed).toBe(1);
    expect(res1.body.data.dayProgress.total).toBe(5);
    expect(res1.body.data.dayCompleted).toBe(false);

    // 2. Toggle topic 2
    const res2 = await request(app)
      .post("/api/v1/progress/toggle")
      .set("Cookie", cookiesA)
      .set("x-csrf-token", csrfTokenA)
      .send({ topicId: "p1-w1-d1-t2", canonicalDayId: "p1-w1-d1" });

    expect(res2.status).toBe(200);
    expect(res2.body.data.dayProgress.completed).toBe(2);
  });

  it("GET /api/v1/progress/day/:dayId returns day progress and completed subtopic IDs", async () => {
    const res = await request(app)
      .get("/api/v1/progress/day/p1-w1-d1")
      .set("Cookie", cookiesA);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.canonicalDayId).toBe("p1-w1-d1");
    expect(res.body.data.completedCount).toBe(2);
    expect(res.body.data.totalCount).toBe(5);
    expect(res.body.data.percentage).toBe(40);
    expect(res.body.data.isCompleted).toBe(false);
    expect(res.body.data.completedTopicIds).toContain("p1-w1-d1-t1");
    expect(res.body.data.completedTopicIds).toContain("p1-w1-d1-t2");
  });

  it("Guarantees learner isolation: Learner Beta has 0 progress on p1-w1-d1", async () => {
    const resB = await request(app)
      .get("/api/v1/progress/day/p1-w1-d1")
      .set("Cookie", cookiesB);

    expect(resB.status).toBe(200);
    expect(resB.body.data.completedCount).toBe(0);
    expect(resB.body.data.completedTopicIds.length).toBe(0);
  });

  it("GET /api/v1/progress/summary computes rollup across phases and day completion map", async () => {
    // Alpha completes remaining topics of Day 1
    await request(app)
      .post("/api/v1/progress/toggle")
      .set("Cookie", cookiesA)
      .set("x-csrf-token", csrfTokenA)
      .send({ topicId: "p1-w1-d1-t3", canonicalDayId: "p1-w1-d1" });

    await request(app)
      .post("/api/v1/progress/toggle")
      .set("Cookie", cookiesA)
      .set("x-csrf-token", csrfTokenA)
      .send({ topicId: "p1-w1-d1-t4", canonicalDayId: "p1-w1-d1" });

    await request(app)
      .post("/api/v1/progress/toggle")
      .set("Cookie", cookiesA)
      .set("x-csrf-token", csrfTokenA)
      .send({ topicId: "p1-w1-d1-t5", canonicalDayId: "p1-w1-d1" });

    const summaryRes = await request(app)
      .get("/api/v1/progress/summary")
      .set("Cookie", cookiesA);

    expect(summaryRes.status).toBe(200);
    expect(summaryRes.body.success).toBe(true);
    expect(summaryRes.body.data.totalCompleted).toBe(5);
    expect(summaryRes.body.data.totalTopics).toBe(813);
    expect(summaryRes.body.data.dayCompletionStatus["p1-w1-d1"]).toBe(true);
    expect(summaryRes.body.data.dayCompletionStatus["p1-w1-d2"]).toBe(false);

    // Verify Phase 1 Rollup
    const phase1 = summaryRes.body.data.phaseProgress.find((p: any) => p.phaseNumber === 1);
    expect(phase1).toBeDefined();
    expect(phase1.completed).toBe(5);
    expect(phase1.total).toBe(115);
    expect(phase1.percentage).toBeGreaterThan(0);
  });
});
