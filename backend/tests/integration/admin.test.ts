import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../../src/app.js";
import { connectDatabase, disconnectDatabase } from "../../src/config/database.js";
import { seedCurriculum } from "../../src/seeds/seedCurriculum.js";
import { seedQuizBanks } from "../../src/seeds/seedQuizBanks.js";
import { UserModel } from "../../src/models/user.model.js";
import { CurriculumNodeModel } from "../../src/models/curriculumNode.model.js";
import { QuizBankModel } from "../../src/models/quizBank.model.js";

describe("Sprint 9: Admin Backoffice & Publishing Integration Tests", () => {
  let mongod: MongoMemoryServer;
  const app = createApp();

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await connectDatabase(mongod.getUri());
    await seedCurriculum();
    await seedQuizBanks();
  });

  afterAll(async () => {
    await disconnectDatabase();
    if (mongod) await mongod.stop();
  });

  // Learner user
  const learnerData = {
    email: "learner_regular@example.com",
    password: "Password123!",
    displayName: "Regular Learner",
  };

  // Admin user
  const adminData = {
    email: "admin_superuser@example.com",
    password: "Password123!",
    displayName: "Admin Operator",
  };

  let learnerCookies: string[] = [];
  let learnerCsrf: string = "";

  let adminCookies: string[] = [];
  let adminCsrf: string = "";

  it("registers regular learner and elevates admin account", async () => {
    // Register learner
    const regL = await request(app)
      .post("/api/v1/auth/register")
      .set("x-skip-rate-limit", "true")
      .send(learnerData);
    expect(regL.status).toBe(201);
    learnerCookies = regL.headers["set-cookie"] || [];
    learnerCsrf = regL.body.data.csrfToken;

    // Register admin user
    const regA = await request(app)
      .post("/api/v1/auth/register")
      .set("x-skip-rate-limit", "true")
      .send(adminData);
    expect(regA.status).toBe(201);

    // Promote admin in DB
    await UserModel.updateOne({ email: adminData.email }, { role: "admin" });

    // Login as admin to get refreshed role token
    const loginA = await request(app)
      .post("/api/v1/auth/login")
      .set("x-skip-rate-limit", "true")
      .send({ email: adminData.email, password: adminData.password });
    expect(loginA.status).toBe(200);
    adminCookies = loginA.headers["set-cookie"] || [];
    adminCsrf = loginA.body.data.csrfToken;
  });

  describe("ADMN-001: RBAC & Route Protection", () => {
    it("rejects unauthenticated request to /api/v1/admin/dashboard with 401", async () => {
      const res = await request(app).get("/api/v1/admin/dashboard");
      expect(res.status).toBe(401);
    });

    it("rejects regular learner request to /api/v1/admin/dashboard with 403 Forbidden", async () => {
      const res = await request(app)
        .get("/api/v1/admin/dashboard")
        .set("Cookie", learnerCookies);
      expect(res.status).toBe(403);
    });

    it("allows authenticated admin to access /api/v1/admin/dashboard with 200 and KPI metrics", async () => {
      const res = await request(app)
        .get("/api/v1/admin/dashboard")
        .set("Cookie", adminCookies);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalLearners).toBeGreaterThanOrEqual(1);
      expect(res.body.data.totalCurriculumNodes).toBeGreaterThan(0);
      expect(res.body.data.totalQuizBanks).toBeGreaterThan(0);
    });
  });

  describe("ADMN-002: Curriculum Node Management & Live Updates", () => {
    let targetNodeId: string;
    let targetCanonicalId: string;

    it("lists curriculum nodes with phase filters for admin", async () => {
      const res = await request(app)
        .get("/api/v1/admin/curriculum/nodes?phaseNumber=1")
        .set("Cookie", adminCookies);
      expect(res.status).toBe(200);
      expect(res.body.data.nodes.length).toBeGreaterThan(0);
      targetNodeId = res.body.data.nodes[0].id;
      targetCanonicalId = res.body.data.nodes[0].canonicalDayId;
    });

    it("updates a curriculum node with subtopics, resources, and validates cache invalidation", async () => {
      const updatePayload = {
        title: "TCP & Raw Sockets (Admin Master Edition)",
        description: "Deep dive into kernel networking stack and epoll readiness.",
        subtopics: [
          { topicId: `${targetCanonicalId}-t1`, text: "Three-way handshake internals" },
          { topicId: `${targetCanonicalId}-t2`, text: "epoll vs kqueue edge triggering" },
        ],
        resources: [
          { type: "documentation", title: "Linux epoll(7) man page", url: "https://man7.org/linux/man-pages/man7/epoll.7.html" },
        ],
      };

      const res = await request(app)
        .put(`/api/v1/admin/curriculum/nodes/${targetNodeId}`)
        .set("Cookie", adminCookies)
        .set("x-csrf-token", adminCsrf)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("TCP & Raw Sockets (Admin Master Edition)");
      expect(res.body.data.subtopics.length).toBe(2);

      // Verify learner public API sees fresh data
      const learnerRes = await request(app)
        .get(`/api/v1/curriculum/nodes/${targetCanonicalId}`)
        .set("Cookie", learnerCookies);
      expect(learnerRes.status).toBe(200);
      expect(learnerRes.body.data.title).toBe("TCP & Raw Sockets (Admin Master Edition)");
    });
  });

  describe("ADMN-003: Curriculum Versioning Draft & Semantic Publish", () => {
    it("drafts a new semantic version 1.1.0-draft from current version", async () => {
      const res = await request(app)
        .post("/api/v1/admin/curriculum/versions/draft")
        .set("Cookie", adminCookies)
        .set("x-csrf-token", adminCsrf)
        .send({
          sourceVersion: "1.0.0",
          newDraftVersion: "1.1.0-draft",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.version).toBe("1.1.0-draft");
      expect(res.body.data.clonedNodesCount).toBeGreaterThan(0);
      expect(res.body.data.status).toBe("draft");
    });

    it("publishes version 1.1.0-draft atomically and invalidates caches", async () => {
      const res = await request(app)
        .post("/api/v1/admin/curriculum/versions/publish")
        .set("Cookie", adminCookies)
        .set("x-csrf-token", adminCsrf)
        .send({
          version: "1.1.0-draft",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.version).toBe("1.1.0-draft");
      expect(res.body.data.publishedNodesCount).toBeGreaterThan(0);

      // Verify versions list shows both versions
      const verRes = await request(app)
        .get("/api/v1/admin/curriculum/versions")
        .set("Cookie", adminCookies);
      expect(verRes.status).toBe(200);
      expect(verRes.body.data.versions.some((v: any) => v.version === "1.1.0-draft")).toBe(true);
    });
  });

  describe("ADMN-004: Quiz Bank Question Authoring & Zero-Knowledge Verification", () => {
    let bankId: string;
    let createdQuestionId: string;

    it("lists quiz banks and authors a new question with explanation and answer key", async () => {
      const bankRes = await request(app)
        .get("/api/v1/admin/quizzes/banks?tier=daily")
        .set("Cookie", adminCookies);
      expect(bankRes.status).toBe(200);
      expect(bankRes.body.data.banks.length).toBeGreaterThan(0);
      bankId = bankRes.body.data.banks[0]._id;
      const bankSlug = bankRes.body.data.banks[0].slug;

      const qPayload = {
        questionText: "What is the consequence of TCP TIME_WAIT state accumulation under high load?",
        options: [
          "Socket descriptor exhaustion",
          "CPU branch misprediction",
          "Automatic TLS downgrade",
          "Instant memory reallocation",
        ],
        correctOptionIndex: 0,
        explanation: "Accumulation of TIME_WAIT sockets consumes ephemeral ports and socket descriptors.",
        difficulty: "advanced",
      };

      const qRes = await request(app)
        .post(`/api/v1/admin/quizzes/banks/${bankId}/questions`)
        .set("Cookie", adminCookies)
        .set("x-csrf-token", adminCsrf)
        .send(qPayload);

      expect(qRes.status).toBe(201);
      expect(qRes.body.data.questionText).toBe(qPayload.questionText);
      expect(qRes.body.data.correctOptionIndex).toBe(0);
      expect(qRes.body.data.explanation).toBe(qPayload.explanation);
      createdQuestionId = qRes.body.data._id;

      // Admin question listing contains correct answer key
      const adminQuestionsRes = await request(app)
        .get(`/api/v1/admin/quizzes/banks/${bankId}/questions`)
        .set("Cookie", adminCookies);
      expect(adminQuestionsRes.status).toBe(200);
      const retrieved = adminQuestionsRes.body.data.questions.find((q: any) => q._id === createdQuestionId);
      expect(retrieved.correctOptionIndex).toBe(0);
      expect(retrieved.explanation).toBeDefined();

      // STRICT ZERO-KNOWLEDGE REGRESSION CHECK:
      // Normal learner calling quiz-start endpoint MUST NEVER receive correctOptionIndex or explanation!
      const learnerStartRes = await request(app)
        .post(`/api/v1/quizzes/${bankSlug}/start`)
        .set("Cookie", learnerCookies)
        .set("x-csrf-token", learnerCsrf);

      expect(learnerStartRes.status).toBe(200);
      const learnerQuestions = learnerStartRes.body.data.questions;
      expect(learnerQuestions.length).toBeGreaterThan(0);
      for (const q of learnerQuestions) {
        expect((q as any).correctOptionIndex).toBeUndefined();
        expect((q as any).explanation).toBeUndefined();
        expect(q.options).toBeDefined();
        expect(q.questionText).toBeDefined();
      }
    });

    it("updates quiz question and deletes question cleanly", async () => {
      const updateRes = await request(app)
        .put(`/api/v1/admin/quizzes/questions/${createdQuestionId}`)
        .set("Cookie", adminCookies)
        .set("x-csrf-token", adminCsrf)
        .send({
          difficulty: "intermediate",
        });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.difficulty).toBe("intermediate");

      const delRes = await request(app)
        .delete(`/api/v1/admin/quizzes/questions/${createdQuestionId}`)
        .set("Cookie", adminCookies)
        .set("x-csrf-token", adminCsrf);
      expect(delRes.status).toBe(200);
      expect(delRes.body.data.success).toBe(true);
    });
  });

  describe("ADMN-005: Admin Audit Log Ledger", () => {
    it("retrieves recorded audit trail of all administrative actions with before/after state", async () => {
      const res = await request(app)
        .get("/api/v1/admin/audit-logs")
        .set("Cookie", adminCookies);

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBeGreaterThanOrEqual(4);
      expect(res.body.data.logs.length).toBeGreaterThanOrEqual(4);

      const logs = res.body.data.logs;
      expect(logs.some((l: any) => l.action === "CURRICULUM_NODE_UPDATE")).toBe(true);
      expect(logs.some((l: any) => l.action === "CURRICULUM_VERSION_DRAFT")).toBe(true);
      expect(logs.some((l: any) => l.action === "CURRICULUM_VERSION_PUBLISH")).toBe(true);
      expect(logs.some((l: any) => l.entityType === "quiz_question")).toBe(true);
    });
  });
});
