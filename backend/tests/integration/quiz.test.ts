import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../../src/app.js";
import { connectDatabase, disconnectDatabase } from "../../src/config/database.js";
import { seedCurriculum } from "../../src/seeds/seedCurriculum.js";
import { seedQuizBanks } from "../../src/seeds/seedQuizBanks.js";
import { QuizBankModel } from "../../src/models/quizBank.model.js";
import { QuizQuestionModel } from "../../src/models/quizQuestion.model.js";

describe("Zero-Knowledge Quizzes & Assessment Engine Integration Tests", () => {
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

  const userA = {
    email: "quiz_learner_a@example.com",
    password: "Password123!",
    displayName: "Quiz Master Alpha",
  };

  const userB = {
    email: "quiz_learner_b@example.com",
    password: "Password123!",
    displayName: "Quiz Challenger Beta",
  };

  let cookiesA: string[] = [];
  let csrfTokenA: string = "";

  let cookiesB: string[] = [];
  let csrfTokenB: string = "";

  it("registers learners Alpha and Beta for assessment isolation tests", async () => {
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

  it("GET /api/v1/quizzes/banks lists available quiz banks with question counts", async () => {
    const res = await request(app)
      .get("/api/v1/quizzes/banks")
      .set("Cookie", cookiesA);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);

    const day1Quiz = res.body.data.find((b: any) => b.canonicalId === "p1-w1-d1");
    expect(day1Quiz).toBeDefined();
    expect(day1Quiz.questionCount).toBe(5);
    expect(day1Quiz.durationMinutes).toBe(10);
  });

  it("GET /api/v1/quizzes/canonical/:canonicalId returns quiz details", async () => {
    const res = await request(app)
      .get("/api/v1/quizzes/canonical/p1-w1-d1")
      .set("Cookie", cookiesA);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.canonicalId).toBe("p1-w1-d1");
    expect(res.body.data.tier).toBe("daily");
  });

  it("GET /api/v1/quizzes/banks rejects unauthenticated requests with 401", async () => {
    const res = await request(app).get("/api/v1/quizzes/banks");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/v1/quizzes/:id/start rejects requests without CSRF token with 403", async () => {
    const bank = await QuizBankModel.findOne({ canonicalId: "p1-w1-d1" });
    const res = await request(app).post(`/api/v1/quizzes/${bank!._id}/start`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  let activeAttemptId: string = "";
  let activeQuizBankId: string = "";

  it("POST /api/v1/quizzes/:id/start: STRICT ZERO-KNOWLEDGE SECURITY INSPECTION", async () => {
    const bank = await QuizBankModel.findOne({ canonicalId: "p1-w1-d1" });
    activeQuizBankId = bank!._id.toString();

    const res = await request(app)
      .post(`/api/v1/quizzes/${activeQuizBankId}/start`)
      .set("Cookie", cookiesA)
      .set("x-csrf-token", csrfTokenA);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.attemptId).toBeDefined();
    expect(res.body.data.questions.length).toBe(5);

    activeAttemptId = res.body.data.attemptId;

    // RAW STRING INSPECTION: Ensure no secret answer key or explanation leaked in HTTP payload
    const rawJsonString = JSON.stringify(res.body);

    expect(rawJsonString).not.toContain("correctOptionIndex");
    expect(rawJsonString).not.toContain("explanation");
    expect(rawJsonString).not.toContain("answerKey");
    expect(rawJsonString).not.toContain("isCorrect");

    // Inspect individual questions
    res.body.data.questions.forEach((q: any) => {
      expect(q.id).toBeDefined();
      expect(q.questionText).toBeDefined();
      expect(Array.isArray(q.options)).toBe(true);
      expect(q.correctOptionIndex).toBeUndefined();
      expect(q.explanation).toBeUndefined();
    });
  });

  it("POST /api/v1/quizzes/:id/submit grades answers server-side with >=75% mastery threshold", async () => {
    const questions = await QuizQuestionModel.find({ quizBankId: activeQuizBankId }).sort({ order: 1 });

    // Submit 4 out of 5 correct (80%)
    const answers = questions.map((q, idx) => ({
      questionId: q._id.toString(),
      selectedOptionIndex: idx === 0 ? (q.correctOptionIndex + 1) % 4 : q.correctOptionIndex,
    }));

    const res = await request(app)
      .post(`/api/v1/quizzes/${activeQuizBankId}/submit`)
      .set("Cookie", cookiesA)
      .set("x-csrf-token", csrfTokenA)
      .send({
        attemptId: activeAttemptId,
        answers,
        timeSpentSeconds: 110,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.scorePercentage).toBe(80);
    expect(res.body.data.passed).toBe(true);
    expect(res.body.data.correctAnswersCount).toBe(4);
    expect(res.body.data.totalQuestions).toBe(5);
    expect(res.body.data.highScore).toBe(80);
    expect(res.body.data.explanations.length).toBe(5);

    // Explanations and correct indices ARE returned upon successful grading
    res.body.data.explanations.forEach((exp: any) => {
      expect(exp.correctOptionIndex).toBeDefined();
      expect(exp.explanation).toBeDefined();
    });
  });

  it("Prevents cross-learner tampering: User Beta cannot access or submit User Alpha's attempt", async () => {
    // 1. Beta tries to submit Alpha's attempt
    const submitRes = await request(app)
      .post(`/api/v1/quizzes/${activeQuizBankId}/submit`)
      .set("Cookie", cookiesB)
      .set("x-csrf-token", csrfTokenB)
      .send({
        attemptId: activeAttemptId,
        answers: [{ questionId: "q1", selectedOptionIndex: 0 }],
      });

    expect(submitRes.status).toBe(404); // Not found or unauthorized

    // 2. Beta tries to read Alpha's attempt result
    const getRes = await request(app)
      .get(`/api/v1/quizzes/attempts/${activeAttemptId}`)
      .set("Cookie", cookiesB);

    expect(getRes.status).toBe(404);
  });

  it("Phase Certification Exam unlock: Passing Phase 1 Exam unlocks phase-1-mastery badge", async () => {
    const phaseExam = await QuizBankModel.findOne({ canonicalId: "phase-1" });
    expect(phaseExam).not.toBeNull();

    // Start Phase Exam
    const startRes = await request(app)
      .post(`/api/v1/quizzes/${phaseExam!._id}/start`)
      .set("Cookie", cookiesA)
      .set("x-csrf-token", csrfTokenA);

    expect(startRes.status).toBe(200);
    const attemptId = startRes.body.data.attemptId;

    const questions = await QuizQuestionModel.find({ quizBankId: phaseExam!._id }).sort({ order: 1 });

    // Answer 15/15 correct (100%)
    const answers = questions.map((q) => ({
      questionId: q._id.toString(),
      selectedOptionIndex: q.correctOptionIndex,
    }));

    const submitRes = await request(app)
      .post(`/api/v1/quizzes/${phaseExam!._id}/submit`)
      .set("Cookie", cookiesA)
      .set("x-csrf-token", csrfTokenA)
      .send({
        attemptId,
        answers,
        timeSpentSeconds: 450,
      });

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.data.scorePercentage).toBe(100);
    expect(submitRes.body.data.passed).toBe(true);
    expect(submitRes.body.data.badgeUnlocked).toBe("phase-1-mastery");
  });

  it("GET /api/v1/quizzes/high-scores returns all high scores for learner", async () => {
    const res = await request(app)
      .get("/api/v1/quizzes/high-scores")
      .set("Cookie", cookiesA);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);

    const phase1Score = res.body.data.find((s: any) => s.canonicalId === "phase-1");
    expect(phase1Score).toBeDefined();
    expect(phase1Score.highScorePercentage).toBe(100);
    expect(phase1Score.passed).toBe(true);
  });
});
