import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../../src/app.js";
import { connectDatabase, disconnectDatabase } from "../../src/config/database.js";

describe("Custom External Links Integration Tests", () => {
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
    email: "links_alpha@example.com",
    password: "Password123!",
    displayName: "Learner Alpha",
  };

  const userB = {
    email: "links_beta@example.com",
    password: "Password123!",
    displayName: "Learner Beta",
  };

  let cookiesA: string[] = [];
  let csrfTokenA: string = "";

  let cookiesB: string[] = [];
  let csrfTokenB: string = "";

  let createdLinkId: string = "";

  it("registers learners for link tests", async () => {
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

  it("POST /api/v1/links creates custom link with valid HTTPS URL", async () => {
    const res = await request(app)
      .post("/api/v1/links")
      .set("Cookie", cookiesA)
      .set("x-csrf-token", csrfTokenA)
      .send({
        canonicalDayId: "p1-w1-d1",
        title: "Node.js Event Loop Deep Dive",
        url: "https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick",
        linkType: "DOC",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Node.js Event Loop Deep Dive");
    expect(res.body.data.url).toBe("https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick");
    expect(res.body.data.linkType).toBe("DOC");
    expect(res.body.data.id).toBeDefined();

    createdLinkId = res.body.data.id;
  });

  it("POST /api/v1/links rejects dangerous javascript: URLs with 400", async () => {
    const res = await request(app)
      .post("/api/v1/links")
      .set("Cookie", cookiesA)
      .set("x-csrf-token", csrfTokenA)
      .send({
        canonicalDayId: "p1-w1-d1",
        title: "XSS Attempt",
        url: "javascript:alert(document.cookie)",
        linkType: "OTHER",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/v1/links rejects data: and file: URLs with 400", async () => {
    const resData = await request(app)
      .post("/api/v1/links")
      .set("Cookie", cookiesA)
      .set("x-csrf-token", csrfTokenA)
      .send({
        canonicalDayId: "p1-w1-d1",
        title: "Data URL",
        url: "data:text/html,<script>alert(1)</script>",
        linkType: "OTHER",
      });

    expect(resData.status).toBe(400);

    const resFile = await request(app)
      .post("/api/v1/links")
      .set("Cookie", cookiesA)
      .set("x-csrf-token", csrfTokenA)
      .send({
        canonicalDayId: "p1-w1-d1",
        title: "File URL",
        url: "file:///etc/passwd",
        linkType: "OTHER",
      });

    expect(resFile.status).toBe(400);
  });

  it("GET /api/v1/links/p1-w1-d1 fetches user links", async () => {
    const res = await request(app)
      .get("/api/v1/links/p1-w1-d1")
      .set("Cookie", cookiesA);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].id).toBe(createdLinkId);
  });

  it("DELETE /api/v1/links/:id prevents cross-user deletion (User B cannot delete User A's link)", async () => {
    const res = await request(app)
      .delete(`/api/v1/links/${createdLinkId}`)
      .set("Cookie", cookiesB)
      .set("x-csrf-token", csrfTokenB);

    expect(res.status).toBe(404);
  });

  it("DELETE /api/v1/links/:id allows owner to delete link", async () => {
    const res = await request(app)
      .delete(`/api/v1/links/${createdLinkId}`)
      .set("Cookie", cookiesA)
      .set("x-csrf-token", csrfTokenA);

    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(true);

    const getRes = await request(app)
      .get("/api/v1/links/p1-w1-d1")
      .set("Cookie", cookiesA);

    expect(getRes.body.data.length).toBe(0);
  });
});
