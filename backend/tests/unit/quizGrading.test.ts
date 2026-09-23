import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectDatabase, disconnectDatabase } from "../../src/config/database.js";
import { seedCurriculum } from "../../src/seeds/seedCurriculum.js";
import { seedQuizBanks } from "../../src/seeds/seedQuizBanks.js";
import { quizService } from "../../src/modules/quizzes/quiz.service.js";
import { QuizBankModel } from "../../src/models/quizBank.model.js";
import { QuizQuestionModel } from "../../src/models/quizQuestion.model.js";
import { QuizAttemptModel } from "../../src/models/quizAttempt.model.js";
import { submitQuizSchema } from "../../src/modules/quizzes/quiz.schema.js";

describe("Quiz Grading & Zero-Knowledge Unit Tests", () => {
  let mongod: MongoMemoryServer;
  const testUserId = new mongoose.Types.ObjectId().toString();

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

  beforeEach(async () => {
    await QuizAttemptModel.deleteMany({});
  });

  it("validates valid and invalid quiz submission payloads with Zod", () => {
    const valid = submitQuizSchema.safeParse({
      attemptId: new mongoose.Types.ObjectId().toString(),
      answers: [
        { questionId: new mongoose.Types.ObjectId().toString(), selectedOptionIndex: 0 },
        { questionId: new mongoose.Types.ObjectId().toString(), selectedOptionIndex: 2 },
      ],
      timeSpentSeconds: 120,
    });
    expect(valid.success).toBe(true);

    const emptyAnswers = submitQuizSchema.safeParse({
      attemptId: new mongoose.Types.ObjectId().toString(),
      answers: [],
    });
    expect(emptyAnswers.success).toBe(false);

    const negativeOption = submitQuizSchema.safeParse({
      attemptId: new mongoose.Types.ObjectId().toString(),
      answers: [{ questionId: "q1", selectedOptionIndex: -1 }],
    });
    expect(negativeOption.success).toBe(false);
  });

  it("projects questions with zero-knowledge guarantees (no answer keys or explanations)", async () => {
    const startData = await quizService.startQuiz(testUserId, "p1-w1-d1");

    expect(startData.attemptId).toBeDefined();
    expect(startData.quizBankId).toBeDefined();
    expect(startData.questions.length).toBe(5);

    // Verify every question contains ONLY safe client fields
    startData.questions.forEach((q: any) => {
      expect(q.id).toBeDefined();
      expect(q.questionText).toBeDefined();
      expect(Array.isArray(q.options)).toBe(true);
      expect(q.options.length).toBeGreaterThanOrEqual(2);

      // CRITICAL ZERO-KNOWLEDGE ASSERTIONS
      expect(q.correctOptionIndex).toBeUndefined();
      expect(q.explanation).toBeUndefined();
      expect(q.answerKey).toBeUndefined();
      expect(q.isCorrect).toBeUndefined();
    });
  });

  it("grades 100% correct answers accurately and marks passed=true", async () => {
    const bank = await QuizBankModel.findOne({ canonicalId: "p1-w1-d1" });
    expect(bank).not.toBeNull();

    const questions = await QuizQuestionModel.find({ quizBankId: bank!._id }).sort({ order: 1 });
    const startData = await quizService.startQuiz(testUserId, bank!._id.toString());

    // Submit all correct options
    const answers = questions.map((q) => ({
      questionId: q._id.toString(),
      selectedOptionIndex: q.correctOptionIndex,
    }));

    const result = await quizService.submitQuiz(testUserId, bank!._id.toString(), {
      attemptId: startData.attemptId,
      answers,
      timeSpentSeconds: 95,
    });

    expect(result.scorePercentage).toBe(100);
    expect(result.passed).toBe(true);
    expect(result.correctAnswersCount).toBe(5);
    expect(result.totalQuestions).toBe(5);
    expect(result.explanations.length).toBe(5);
    expect(result.explanations.every((e) => e.isCorrect)).toBe(true);
  });

  it("enforces mastery boundary: 80% (4/5) is passed=true (>=75%), 60% (3/5) is passed=false (<75%)", async () => {
    const bank = await QuizBankModel.findOne({ canonicalId: "p1-w1-d1" });
    const questions = await QuizQuestionModel.find({ quizBankId: bank!._id }).sort({ order: 1 });

    // 1. Test 80% (4 correct, 1 wrong) -> Passed
    const start1 = await quizService.startQuiz(testUserId, bank!._id.toString());
    const answers80 = questions.map((q, idx) => ({
      questionId: q._id.toString(),
      selectedOptionIndex: idx === 0 ? (q.correctOptionIndex + 1) % 4 : q.correctOptionIndex,
    }));

    const res80 = await quizService.submitQuiz(testUserId, bank!._id.toString(), {
      attemptId: start1.attemptId,
      answers: answers80,
    });

    expect(res80.scorePercentage).toBe(80);
    expect(res80.passed).toBe(true);
    expect(res80.correctAnswersCount).toBe(4);

    // 2. Test 60% (3 correct, 2 wrong) -> Failed (<75%)
    const start2 = await quizService.startQuiz(testUserId, bank!._id.toString());
    const answers60 = questions.map((q, idx) => ({
      questionId: q._id.toString(),
      selectedOptionIndex: idx < 2 ? (q.correctOptionIndex + 1) % 4 : q.correctOptionIndex,
    }));

    const res60 = await quizService.submitQuiz(testUserId, bank!._id.toString(), {
      attemptId: start2.attemptId,
      answers: answers60,
    });

    expect(res60.scorePercentage).toBe(60);
    expect(res60.passed).toBe(false);
    expect(res60.correctAnswersCount).toBe(3);
  });

  it("rejects duplicate submissions on the same attempt with Conflict (409)", async () => {
    const bank = await QuizBankModel.findOne({ canonicalId: "p1-w1-d1" });
    const start = await quizService.startQuiz(testUserId, bank!._id.toString());
    const questions = await QuizQuestionModel.find({ quizBankId: bank!._id }).sort({ order: 1 });

    const answers = questions.map((q) => ({
      questionId: q._id.toString(),
      selectedOptionIndex: q.correctOptionIndex,
    }));

    // First submission succeeds
    await quizService.submitQuiz(testUserId, bank!._id.toString(), {
      attemptId: start.attemptId,
      answers,
    });

    // Second submission must reject with 409
    await expect(
      quizService.submitQuiz(testUserId, bank!._id.toString(), {
        attemptId: start.attemptId,
        answers,
      }),
    ).rejects.toThrow("This quiz attempt has already been submitted and graded");
  });
});
