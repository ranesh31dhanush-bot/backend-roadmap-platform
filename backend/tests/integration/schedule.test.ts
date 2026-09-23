import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../../src/app.js";
import { connectDatabase, disconnectDatabase } from "../../src/config/database.js";
import { seedCurriculum } from "../../src/seeds/seedCurriculum.js";

describe("Adaptive Scheduling & Interactive Roadmap Integration Tests", () => {
  let mongod: MongoMemoryServer;
  const app = createApp();

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await connectDatabase(uri);
    await seedCurriculum();
  });

  afterAll(async () => {
    await disconnectDatabase();
    if (mongod) await mongod.stop();
  });

  const testUser = {
    email: "schedule_learner@example.com",
    password: "Password123!",
    displayName: "Schedule Explorer",
  };

  let authCookies: string[] = [];
  let csrfToken: string = "";

  it("registers user and completes onboarding to initialize schedule anchor", async () => {
    // 1. Register
    const regRes = await request(app)
      .post("/api/v1/auth/register")
      .set("x-skip-rate-limit", "true")
      .send(testUser);

    expect(regRes.status).toBe(201);
    authCookies = regRes.headers["set-cookie"] || [];
    csrfToken = regRes.body.data.csrfToken;

    // 2. Onboard
    const onbdRes = await request(app)
      .post("/api/v1/onboarding/start")
      .set("Cookie", authCookies)
      .set("x-csrf-token", csrfToken)
      .send({
        startDate: "2026-09-22",
        targetRole: "Senior Backend Engineer",
      });

    expect(onbdRes.status).toBe(200);
    expect(onbdRes.body.success).toBe(true);
  });

  it("GET /api/v1/schedule/me requires authentication", async () => {
    const res = await request(app).get("/api/v1/schedule/me");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/v1/schedule/me returns active schedule and date calculations", async () => {
    const res = await request(app)
      .get("/api/v1/schedule/me")
      .set("Cookie", authCookies);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.startDate).toBe("2026-09-22");
    expect(res.body.data.projectedEndDate).toBe("2027-09-20");
    expect(res.body.data.isPaused).toBe(false);
    expect(res.body.data.currentDayCanonicalId).toBeDefined();
    expect(res.body.data.daysRemaining).toBeGreaterThan(0);
  });

  it("POST /api/v1/schedule/reschedule shifts start date and projected end date", async () => {
    const newStartDate = "2026-10-01";
    const res = await request(app)
      .post("/api/v1/schedule/reschedule")
      .set("Cookie", authCookies)
      .set("x-csrf-token", csrfToken)
      .send({ newStartDate });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.schedule.startDate).toBe(newStartDate);
    expect(res.body.data.schedule.projectedEndDate).toBe("2027-09-29");
  });

  it("POST /api/v1/schedule/pause freezes active journey", async () => {
    const res = await request(app)
      .post("/api/v1/schedule/pause")
      .set("Cookie", authCookies)
      .set("x-csrf-token", csrfToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isPaused).toBe(true);
    expect(res.body.data.pausedAt).toBeDefined();
  });

  it("POST /api/v1/schedule/resume unpauses course and shifts dates forward", async () => {
    const res = await request(app)
      .post("/api/v1/schedule/resume")
      .set("Cookie", authCookies)
      .set("x-csrf-token", csrfToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isPaused).toBe(false);
    expect(res.body.data.newStartDate).toBeDefined();
    expect(res.body.data.newEndDate).toBeDefined();
  });

  it("GET /api/v1/schedule/roadmap returns 52-week curriculum with dynamic learner calendar dates", async () => {
    const res = await request(app)
      .get("/api/v1/schedule/roadmap")
      .set("Cookie", authCookies);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.version).toBe("1.0.0");
    expect(res.body.data.phases.length).toBe(5);

    // Verify Phase 1, Week 1, Day 1
    const phase1 = res.body.data.phases[0];
    expect(phase1.phaseNumber).toBe(1);
    expect(phase1.weeks.length).toBeGreaterThan(0);

    const week1 = phase1.weeks[0];
    expect(week1.days.length).toBe(7);

    const day1 = week1.days[0];
    expect(day1.canonicalDayId).toBe("p1-w1-d1");
    expect(day1.projectedDate).toBeDefined();
    expect(typeof day1.isCurrentDay).toBe("boolean");
    expect(day1.subtopics.length).toBe(5);
    expect(day1.resources.length).toBeGreaterThan(0);
  });
});
