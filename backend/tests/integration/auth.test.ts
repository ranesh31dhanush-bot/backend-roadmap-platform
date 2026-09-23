import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../../src/app.js";
import { connectDatabase, disconnectDatabase } from "../../src/config/database.js";

describe("Authentication & Identity Integration Tests", () => {
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
    email: "top1_dev@example.com",
    password: "Password123!",
    displayName: "Top 1% Engineer",
  };

  let registeredCookies: string[] = [];
  let currentRefreshTokenCookie: string = "";

  it("POST /api/v1/auth/register creates user and sets HttpOnly dual-token cookies", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .set("x-skip-rate-limit", "true")
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.displayName).toBe(testUser.displayName);
    expect(res.body.data.user.role).toBe("learner");
    expect(res.body.data.csrfToken).toBeDefined();

    // Verify secrets are NOT leaked in response
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.body.data.accessToken).toBeUndefined();
    expect(res.body.data.refreshToken).toBeUndefined();

    // Verify cookies set
    const cookies = res.headers["set-cookie"] as unknown as string[];
    expect(cookies).toBeDefined();
    registeredCookies = cookies;

    const cookieStr = cookies.join("; ");
    expect(cookieStr).toContain("accessToken=");
    expect(cookieStr).toContain("refreshToken=");
    expect(cookieStr).toContain("csrfToken=");
    expect(cookieStr).toContain("HttpOnly");
  });

  it("POST /api/v1/auth/register rejects duplicate email with 409 Conflict", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .set("x-skip-rate-limit", "true")
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("CONFLICT");
  });

  it("POST /api/v1/auth/register rejects weak password with 400 Validation Error", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .set("x-skip-rate-limit", "true")
      .send({
        email: "weak_pass@example.com",
        password: "short",
        displayName: "Weak Pass",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("POST /api/v1/auth/login validates credentials and creates new session", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .set("x-skip-rate-limit", "true")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.csrfToken).toBeDefined();

    const cookies = res.headers["set-cookie"] as unknown as string[];
    registeredCookies = cookies;

    // Save refresh token cookie for rotation test
    const refreshCookie = cookies.find((c) => c.startsWith("refreshToken="));
    expect(refreshCookie).toBeDefined();
    currentRefreshTokenCookie = refreshCookie!.split(";")[0]!;
  });

  it("POST /api/v1/auth/login rejects wrong password with 401 Unauthorized", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .set("x-skip-rate-limit", "true")
      .send({
        email: testUser.email,
        password: "IncorrectPassword123!",
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("AUTHENTICATION_ERROR");
  });

  it("GET /api/v1/auth/me returns profile for authenticated user", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", registeredCookies);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it("GET /api/v1/auth/me rejects unauthenticated request with 401", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/v1/auth/refresh rotates token pair and invalidates previous token", async () => {
    const oldRefreshTokenCookie = currentRefreshTokenCookie;

    const res = await request(app)
      .post("/api/v1/auth/refresh")
      .set("x-skip-rate-limit", "true")
      .set("Cookie", [oldRefreshTokenCookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const newCookies = res.headers["set-cookie"] as unknown as string[];
    const newRefreshCookie = newCookies.find((c) => c.startsWith("refreshToken="));
    expect(newRefreshCookie).toBeDefined();
    expect(newRefreshCookie).not.toBe(oldRefreshTokenCookie);

    // Save new token
    currentRefreshTokenCookie = newRefreshCookie!.split(";")[0]!;

    // TEST REUSE DETECTION: Try reusing old rotated token
    const reuseRes = await request(app)
      .post("/api/v1/auth/refresh")
      .set("x-skip-rate-limit", "true")
      .set("Cookie", [oldRefreshTokenCookie]);

    expect(reuseRes.status).toBe(401);
    expect(reuseRes.body.success).toBe(false);
  });

  it("POST /api/v1/auth/forgot-password and /reset-password updates credentials", async () => {
    // 1. Request reset
    const forgotRes = await request(app)
      .post("/api/v1/auth/forgot-password")
      .set("x-skip-rate-limit", "true")
      .send({ email: testUser.email });

    expect(forgotRes.status).toBe(200);
    expect(forgotRes.body.success).toBe(true);
    const resetToken = forgotRes.body.data.resetToken;
    expect(resetToken).toBeDefined();

    // 2. Reset password
    const newPassword = "NewSecurePassword456!";
    const resetRes = await request(app)
      .post("/api/v1/auth/reset-password")
      .set("x-skip-rate-limit", "true")
      .send({
        token: resetToken,
        newPassword,
      });

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.success).toBe(true);

    // 3. Login with new password succeeds
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .set("x-skip-rate-limit", "true")
      .send({
        email: testUser.email,
        password: newPassword,
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);

    // 4. Login with old password fails
    const oldLoginRes = await request(app)
      .post("/api/v1/auth/login")
      .set("x-skip-rate-limit", "true")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(oldLoginRes.status).toBe(401);
  });

  it("POST /api/v1/auth/logout clears cookies and revokes session", async () => {
    const res = await request(app)
      .post("/api/v1/auth/logout")
      .set("Cookie", [currentRefreshTokenCookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const cookies = res.headers["set-cookie"] as unknown as string[];
    const cookieStr = cookies.join("; ");
    expect(cookieStr).toContain("accessToken=;");
    expect(cookieStr).toContain("refreshToken=;");
  });
});
