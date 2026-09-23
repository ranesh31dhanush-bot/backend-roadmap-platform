import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../../src/app.js";
import { connectDatabase, disconnectDatabase } from "../../src/config/database.js";
import { UserModel } from "../../src/models/user.model.js";
import { UserScheduleModel } from "../../src/models/userSchedule.model.js";

describe("Onboarding Engine Integration Tests", () => {
  let mongod: MongoMemoryServer;
  const app = createApp();

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await connectDatabase(uri);
  });

  afterAll(async () => {
    await disconnectDatabase();
    if (mongod) await mongod.stop();
  });

  const testUser = {
    email: "onboarding_learner@example.com",
    password: "Password123!",
    displayName: "New Learner",
  };

  let authCookies: string[] = [];
  let csrfToken: string = "";

  it("registers a new user with isOnboarded = false", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .set("x-skip-rate-limit", "true")
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.isOnboarded).toBe(false);

    authCookies = res.headers["set-cookie"] || [];
    csrfToken = res.body.data.csrfToken;
  });

  it("GET /api/v1/onboarding/status requires authentication", async () => {
    const res = await request(app).get("/api/v1/onboarding/status");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/v1/onboarding/status returns isOnboarded: false for new learner", async () => {
    const res = await request(app)
      .get("/api/v1/onboarding/status")
      .set("Cookie", authCookies);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isOnboarded).toBe(false);
    expect(res.body.data.schedule).toBeNull();
  });

  it("POST /api/v1/onboarding/start rejects invalid date formats", async () => {
    const res = await request(app)
      .post("/api/v1/onboarding/start")
      .set("Cookie", authCookies)
      .set("x-csrf-token", csrfToken)
      .send({
        startDate: "invalid-date",
        targetRole: "Backend Engineer",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("POST /api/v1/onboarding/start successfully initializes schedule and marks user onboarded", async () => {
    const startDate = "2026-10-01";
    const res = await request(app)
      .post("/api/v1/onboarding/start")
      .set("Cookie", authCookies)
      .set("x-csrf-token", csrfToken)
      .send({
        startDate,
        targetRole: "Senior Backend Engineer",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isOnboarded).toBe(true);
    expect(res.body.data.schedule.startDate).toBe(startDate);
    expect(res.body.data.schedule.targetRole).toBe("Senior Backend Engineer");
    expect(res.body.data.schedule.status).toBe("active");
    expect(res.body.data.schedule.currentDayCanonicalId).toBe("p1-w1-d1");
    expect(res.body.data.schedule.projectedCompletionDate).toBe("2027-09-29");

    // Verify User collection updated
    const userInDb = await UserModel.findOne({ email: testUser.email });
    expect(userInDb?.isOnboarded).toBe(true);

    // Verify UserSchedule document in MongoDB
    const scheduleCount = await UserScheduleModel.countDocuments({ userId: userInDb?._id });
    expect(scheduleCount).toBe(1);
  });

  it("POST /api/v1/onboarding/start is idempotent on duplicate submissions", async () => {
    const res = await request(app)
      .post("/api/v1/onboarding/start")
      .set("Cookie", authCookies)
      .set("x-csrf-token", csrfToken)
      .send({
        startDate: "2026-10-01",
        targetRole: "Senior Backend Engineer",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isOnboarded).toBe(true);

    const userInDb = await UserModel.findOne({ email: testUser.email });
    const scheduleCount = await UserScheduleModel.countDocuments({ userId: userInDb?._id });
    expect(scheduleCount).toBe(1); // 0 duplicate schedules created
  });

  it("GET /api/v1/onboarding/status returns active schedule after onboarding", async () => {
    const res = await request(app)
      .get("/api/v1/onboarding/status")
      .set("Cookie", authCookies);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isOnboarded).toBe(true);
    expect(res.body.data.schedule).toBeDefined();
    expect(res.body.data.schedule.startDate).toBe("2026-10-01");
  });
});
