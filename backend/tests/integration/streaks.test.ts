import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../../src/app.js";
import { connectDatabase, disconnectDatabase } from "../../src/config/database.js";

describe("Streaks & Habit API Integration Tests", () => {
  let mongod: MongoMemoryServer;
  const app = createApp();

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await connectDatabase(mongod.getUri());
  });

  afterAll(async () => {
    await disconnectDatabase();
    if (mongod) await mongod.stop();
  });

  const userA = {
    email: "streak_alpha@example.com",
    password: "Password123!",
    displayName: "Streak Alpha",
  };

  const userB = {
    email: "streak_beta@example.com",
    password: "Password123!",
    displayName: "Streak Beta",
  };

  let cookiesA: string[] = [];
  let csrfTokenA: string = "";

  let cookiesB: string[] = [];
  let csrfTokenB: string = "";

  it("registers learners for streak integration tests", async () => {
    const regA = await request(app)
      .post("/api/v1/auth/register")
      .set("x-skip-rate-limit", "true")
      .send(userA);
    expect(regA.status).toBe(201);
    cookiesA = regA.headers["set-cookie"] || [];
    csrfTokenA = regA.body.data.csrfToken;

    const regB = await request(app)
      .post("/api/v1/auth/register")
      .set("x-skip-rate-limit", "true")
      .send(userB);
    expect(regB.status).toBe(201);
    cookiesB = regB.headers["set-cookie"] || [];
    csrfTokenB = regB.body.data.csrfToken;
  });

  it("GET /api/v1/streaks rejects unauthenticated requests with 401", async () => {
    const res = await request(app).get("/api/v1/streaks");
    expect(res.status).toBe(401);
  });

  it("POST /api/v1/streaks/activity rejects mutating requests without CSRF token with 403", async () => {
    const res = await request(app)
      .post("/api/v1/streaks/activity")
      .set("Cookie", cookiesA)
      .send({ date: "2026-10-01" });
    expect(res.status).toBe(403);
  });

  it("GET /api/v1/streaks returns initial streak and habit matrix for new learner", async () => {
    const res = await request(app)
      .get("/api/v1/streaks")
      .set("Cookie", cookiesA);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.currentStreak).toBe(0);
    expect(res.body.data.longestStreak).toBe(0);
    expect(res.body.data.freezeAvailable).toBe(true);
    expect(res.body.data.habitMatrix.length).toBe(21);
  });

  it("POST /api/v1/streaks/activity records activity and increments streak", async () => {
    const res = await request(app)
      .post("/api/v1/streaks/activity")
      .set("Cookie", cookiesA)
      .set("x-csrf-token", csrfTokenA)
      .send({
        date: "2026-10-05",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.currentStreak).toBe(1);
    expect(res.body.data.longestStreak).toBe(1);
    expect(res.body.data.lastActivityDate).toBe("2026-10-05");
  });

  it("POST /api/v1/streaks/freeze manually consumes an available freeze", async () => {
    const res = await request(app)
      .post("/api/v1/streaks/freeze")
      .set("Cookie", cookiesA)
      .set("x-csrf-token", csrfTokenA)
      .send({
        date: "2026-10-04",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.freezeAvailable).toBe(false);
    expect(res.body.data.freezeUsedAt).toBe("2026-10-04");

    // Attempt second freeze in same month -> 400 Bad Request
    const res2 = await request(app)
      .post("/api/v1/streaks/freeze")
      .set("Cookie", cookiesA)
      .set("x-csrf-token", csrfTokenA)
      .send({
        date: "2026-10-03",
      });

    expect(res2.status).toBe(400);
    expect(res2.body.error.message).toContain("1 per month limit");
  });

  it("verifies cross-user isolation: User B has independent streak state", async () => {
    const resB = await request(app)
      .get("/api/v1/streaks")
      .set("Cookie", cookiesB);

    expect(resB.status).toBe(200);
    expect(resB.body.data.currentStreak).toBe(0);
    expect(resB.body.data.freezeAvailable).toBe(true);
    expect(resB.body.data.totalActiveDays).toBe(0);
  });
});
