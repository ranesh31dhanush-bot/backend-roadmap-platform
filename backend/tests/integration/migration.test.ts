import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { createApp } from "../../src/app.js";
import { seedCurriculum } from "../../src/seeds/seedCurriculum.js";
import { seedQuizBanks } from "../../src/seeds/seedQuizBanks.js";
import { QuizBankModel } from "../../src/models/quizBank.model.js";
import { TopicProgressModel } from "../../src/models/topicProgress.model.js";
import { DayNoteModel } from "../../src/models/dayNote.model.js";
import { UserLinkModel } from "../../src/models/userLink.model.js";
import { QuizHighScoreModel } from "../../src/models/quizHighScore.model.js";
import { UserScheduleModel } from "../../src/models/userSchedule.model.js";
import { UserModel } from "../../src/models/user.model.js";

describe("Sprint 8: LocalStorage Legacy Migration Integration Tests (MIGR-001..004)", () => {
  let mongoServer: MongoMemoryServer;
  let app: ReturnType<typeof createApp>;

  let cookiesAlpha: string[] = [];
  let csrfTokenAlpha: string = "";
  let userAlphaId: string;

  let cookiesBeta: string[] = [];
  let csrfTokenBeta: string = "";
  let userBetaId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    app = createApp();

    // 1. Seed Published Canonical Curriculum & Quiz Banks
    await seedCurriculum();
    await seedQuizBanks();

    // 3. Register Learner Alpha
    const regResAlpha = await request(app)
      .post("/api/v1/auth/register")
      .set("x-skip-rate-limit", "true")
      .send({
        email: "migr_alpha@example.com",
        password: "Password123!",
        displayName: "Migration Alpha",
      });

    expect(regResAlpha.status).toBe(201);
    cookiesAlpha = regResAlpha.headers["set-cookie"] || [];
    csrfTokenAlpha = regResAlpha.body.data.csrfToken;
    userAlphaId = regResAlpha.body.data.user.id;

    // 4. Register Learner Beta (Isolation test)
    const regResBeta = await request(app)
      .post("/api/v1/auth/register")
      .set("x-skip-rate-limit", "true")
      .send({
        email: "migr_beta@example.com",
        password: "Password123!",
        displayName: "Migration Beta",
      });

    expect(regResBeta.status).toBe(201);
    cookiesBeta = regResBeta.headers["set-cookie"] || [];
    csrfTokenBeta = regResBeta.body.data.csrfToken;
    userBetaId = regResBeta.body.data.user.id;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("rejects unauthenticated migration status requests with 401", async () => {
    const res = await request(app).get("/api/v1/migration/status");
    expect(res.status).toBe(401);
  });

  it("rejects migration requests missing CSRF token with 403", async () => {
    const res = await request(app)
      .post("/api/v1/migration/import")
      .set("Cookie", cookiesAlpha)
      .send({
        startDate: "2026-09-01",
        done: { "s::1::0::0": true },
      });

    expect(res.status).toBe(403);
  });

  it("rejects malformed payload with 400 validation error", async () => {
    const res = await request(app)
      .post("/api/v1/migration/import")
      .set("Cookie", cookiesAlpha)
      .set("X-CSRF-Token", csrfTokenAlpha)
      .send({
        startDate: "invalid-date-format",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("atomically ingests complete legacy snapshot into cloud database", async () => {
    const legacyPayload = {
      startDate: "2026-09-01",
      done: {
        "s::1::0::0": true,
        "s::1::0::1": true,
        "s::1::1::0": true,
      },
      notes: {
        "2026-09-01": "# Event loop notes\n- Libuv poll phase\n- Microtasks run first",
      },
      chatLinks: {
        "2026-09-01": "https://chatgpt.com/share/66e-test-slug",
      },
      pdfLinks: {
        "2026-09-01": "https://drive.google.com/file/d/test-pdf",
      },
      qscores: {
        "daily::Node.js Event Loop": {
          score: 5,
          total: 5,
          pct: 100,
          date: "2026-09-01",
        },
      },
    };

    const res = await request(app)
      .post("/api/v1/migration/import")
      .set("Cookie", cookiesAlpha)
      .set("X-CSRF-Token", csrfTokenAlpha)
      .send(legacyPayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("COMPLETED");
    expect(res.body.data.importedTopics).toBe(3);
    expect(res.body.data.importedNotes).toBe(1);
    expect(res.body.data.importedLinks).toBe(2);
    expect(res.body.data.importedQuizzes).toBe(1);
    expect(res.body.data.scheduleSet).toBe(true);

    // Verify Schedule Ingestion
    const schedule = await UserScheduleModel.findOne({ userId: userAlphaId });
    expect(schedule).not.toBeNull();
    expect(schedule?.startDate).toBe("2026-09-01");

    // Verify Topic Progress Ingestion
    const topics = await TopicProgressModel.find({ userId: userAlphaId });
    expect(topics.length).toBe(3);
    const topicIds = topics.map((t) => t.topicId);
    expect(topicIds).toContain("p1-w1-d1-t1");
    expect(topicIds).toContain("p1-w1-d1-t2");
    expect(topicIds).toContain("p1-w1-d2-t1");

    // Verify Day Note Ingestion
    const note = await DayNoteModel.findOne({ userId: userAlphaId, canonicalDayId: "p1-w1-d1" });
    expect(note).not.toBeNull();
    expect(note?.content).toContain("Event loop notes");

    // Verify External Links Ingestion
    const links = await UserLinkModel.find({ userId: userAlphaId });
    expect(links.length).toBe(2);
    const chatLink = links.find((l) => l.linkType === "CHATGPT");
    const pdfLink = links.find((l) => l.linkType === "PDF_NOTES");
    expect(chatLink?.url).toBe("https://chatgpt.com/share/66e-test-slug");
    expect(pdfLink?.url).toBe("https://drive.google.com/file/d/test-pdf");

    // Verify Quiz High Score Ingestion
    const quizScore = await QuizHighScoreModel.findOne({ userId: userAlphaId });
    expect(quizScore).not.toBeNull();
    expect(quizScore?.highScorePercentage).toBe(100);
    expect(quizScore?.passed).toBe(true);

    // Verify User model updated
    const userAlpha = await UserModel.findById(userAlphaId);
    expect(userAlpha?.isMigrated).toBe(true);
    expect(userAlpha?.migratedAt).toBeDefined();
  });

  it("is completely idempotent across repeated migration invocations", async () => {
    const legacyPayload = {
      startDate: "2026-09-01",
      done: {
        "s::1::0::0": true,
        "s::1::0::1": true,
      },
      notes: {
        "2026-09-01": "# Event loop notes\n- Libuv poll phase\n- Microtasks run first",
      },
      chatLinks: {
        "2026-09-01": "https://chatgpt.com/share/66e-test-slug",
      },
      qscores: {
        "daily::Node.js Event Loop": {
          pct: 100,
        },
      },
    };

    // Re-invoke import twice
    const res1 = await request(app)
      .post("/api/v1/migration/import")
      .set("Cookie", cookiesAlpha)
      .set("X-CSRF-Token", csrfTokenAlpha)
      .send(legacyPayload);

    const res2 = await request(app)
      .post("/api/v1/migration/import")
      .set("Cookie", cookiesAlpha)
      .set("X-CSRF-Token", csrfTokenAlpha)
      .send(legacyPayload);

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);

    // Verify no duplicates were created
    const topics = await TopicProgressModel.find({ userId: userAlphaId });
    expect(topics.length).toBe(3); // Still 3 from previous test

    const notes = await DayNoteModel.find({ userId: userAlphaId });
    expect(notes.length).toBe(1); // Still 1 note

    const links = await UserLinkModel.find({ userId: userAlphaId, linkType: "CHATGPT" });
    expect(links.length).toBe(1); // Still 1 chat link
  });

  it("enforces strict cross-user isolation during migration", async () => {
    // User Beta has not migrated
    const statusBeta = await request(app)
      .get("/api/v1/migration/status")
      .set("Cookie", cookiesBeta);

    expect(statusBeta.status).toBe(200);
    expect(statusBeta.body.data.isMigrated).toBe(false);
    expect(statusBeta.body.data.stats.importedTopics).toBe(0);

    // Verify User Beta's collections are empty
    const topicsBeta = await TopicProgressModel.find({ userId: userBetaId });
    expect(topicsBeta.length).toBe(0);

    const notesBeta = await DayNoteModel.find({ userId: userBetaId });
    expect(notesBeta.length).toBe(0);
  });
});
