import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../../src/app.js";
import { connectDatabase, disconnectDatabase } from "../../src/config/database.js";

describe("Notes API & Concurrency Integration Tests", () => {
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
    email: "notes_alpha@example.com",
    password: "Password123!",
    displayName: "Learner Alpha",
  };

  const userB = {
    email: "notes_beta@example.com",
    password: "Password123!",
    displayName: "Learner Beta",
  };

  let cookiesA: string[] = [];
  let csrfTokenA: string = "";

  let cookiesB: string[] = [];
  let csrfTokenB: string = "";

  it("registers learners for isolation and authentication tests", async () => {
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

  it("GET /api/v1/notes/p1-w1-d1 rejects unauthenticated requests with 401", async () => {
    const res = await request(app).get("/api/v1/notes/p1-w1-d1");
    expect(res.status).toBe(401);
  });

  it("PUT /api/v1/notes/p1-w1-d1 rejects mutating requests without CSRF token with 403", async () => {
    const res = await request(app)
      .put("/api/v1/notes/p1-w1-d1")
      .set("Cookie", cookiesA)
      .send({ content: "# Test", version: 1 });
    expect(res.status).toBe(403);
  });

  it("GET /api/v1/notes/p1-w1-d1 returns empty default note with version 1", async () => {
    const res = await request(app)
      .get("/api/v1/notes/p1-w1-d1")
      .set("Cookie", cookiesA);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.dayCanonicalId).toBe("p1-w1-d1");
    expect(res.body.data.content).toBe("");
    expect(res.body.data.version).toBe(1);
    expect(res.body.data.wordCount).toBe(0);
  });

  it("PUT /api/v1/notes/p1-w1-d1 saves initial note with version 1", async () => {
    const res = await request(app)
      .put("/api/v1/notes/p1-w1-d1")
      .set("Cookie", cookiesA)
      .set("x-csrf-token", csrfTokenA)
      .send({
        content: "### Day 1 Learnings\nNode.js single-threaded event loop.",
        version: 1,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.saved).toBe(true);
    expect(res.body.data.version).toBe(1);
    expect(res.body.data.wordCount).toBe(8);
  });

  it("PUT /api/v1/notes/p1-w1-d1 updates note and increments version to 2", async () => {
    const res = await request(app)
      .put("/api/v1/notes/p1-w1-d1")
      .set("Cookie", cookiesA)
      .set("x-csrf-token", csrfTokenA)
      .send({
        content: "### Day 1 Learnings\nNode.js single-threaded event loop with libuv worker threads.",
        version: 1,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.saved).toBe(true);
    expect(res.body.data.version).toBe(2);
    expect(res.body.data.wordCount).toBe(12);
  });

  it("PUT /api/v1/notes/p1-w1-d1 rejects stale version 1 with 409 Conflict", async () => {
    const res = await request(app)
      .put("/api/v1/notes/p1-w1-d1")
      .set("Cookie", cookiesA)
      .set("x-csrf-token", csrfTokenA)
      .send({
        content: "Stale write from another browser tab.",
        version: 1,
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("CONFLICT");
    expect(res.body.error.details.currentVersion).toBe(2);
    expect(res.body.error.details.latestContent).toContain("libuv worker threads");
  });

  it("GET /api/v1/notes searches notes across days", async () => {
    // Add another note for User A
    await request(app)
      .put("/api/v1/notes/p1-w1-d2")
      .set("Cookie", cookiesA)
      .set("x-csrf-token", csrfTokenA)
      .send({
        content: "Understanding PostgreSQL query execution planner and indexes.",
        version: 1,
      });

    const searchRes = await request(app)
      .get("/api/v1/notes?q=PostgreSQL")
      .set("Cookie", cookiesA);

    expect(searchRes.status).toBe(200);
    expect(searchRes.body.data.notes.length).toBe(1);
    expect(searchRes.body.data.notes[0].dayCanonicalId).toBe("p1-w1-d2");
  });

  it("verifies cross-user isolation: User B cannot see User A's notes", async () => {
    const res = await request(app)
      .get("/api/v1/notes/p1-w1-d1")
      .set("Cookie", cookiesB);

    expect(res.status).toBe(200);
    // User B receives empty default note
    expect(res.body.data.content).toBe("");
    expect(res.body.data.version).toBe(1);

    const listB = await request(app)
      .get("/api/v1/notes")
      .set("Cookie", cookiesB);

    expect(listB.body.data.notes.length).toBe(0);
  });
});
