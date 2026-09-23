import mongoose from "mongoose";
import { QuizBankModel, IQuizBank } from "../../models/quizBank.model.js";
import { QuizQuestionModel, IQuizQuestion } from "../../models/quizQuestion.model.js";
import { QuizAttemptModel } from "../../models/quizAttempt.model.js";
import { QuizHighScoreModel } from "../../models/quizHighScore.model.js";
import { UserModel } from "../../models/user.model.js";
import {
  QuizBankDTO,
  QuizStartResponseDTO,
  QuizQuestionClientDTO,
  QuizSubmitRequestDTO,
  QuizResultDTO,
  QuestionExplanationDTO,
  QuizHighScoreDTO,
} from "@top1/shared";
import { AppError } from "../../utils/appError.js";
import { logger } from "../../utils/logger.js";
import { streaksService } from "../streaks/streaks.service.js";

export class QuizService {
  /**
   * List all active quiz banks with learner's high scores
   */
  async getQuizBanks(userId: string): Promise<QuizBankDTO[]> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [banks, highScores] = await Promise.all([
      QuizBankModel.find({ isActive: true }).sort({ phaseNumber: 1, canonicalId: 1 }),
      QuizHighScoreModel.find({ userId: userObjectId }),
    ]);

    const scoreMap = new Map<string, { highScore: number; passed: boolean }>();
    highScores.forEach((hs) => {
      scoreMap.set(hs.quizBankId.toString(), {
        highScore: hs.highScorePercentage,
        passed: hs.passed,
      });
    });

    // Count questions per bank
    const questionCounts = await QuizQuestionModel.aggregate([
      { $group: { _id: "$quizBankId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map<string, number>();
    questionCounts.forEach((qc) => {
      countMap.set(qc._id.toString(), qc.count);
    });

    return banks.map((b) => {
      const userScore = scoreMap.get(b._id.toString());
      return {
        id: b._id.toString(),
        slug: b.slug,
        title: b.title,
        description: b.description,
        tier: b.tier,
        canonicalId: b.canonicalId,
        phaseNumber: b.phaseNumber,
        durationMinutes: b.durationMinutes,
        passThresholdPercentage: b.passThresholdPercentage,
        questionCount: countMap.get(b._id.toString()) || 0,
        highScore: userScore?.highScore,
        passed: userScore?.passed,
      };
    });
  }

  /**
   * Find a quiz bank by canonical ID (e.g. p1-w1-d1 or phase-1)
   */
  async getQuizByCanonicalId(userId: string, canonicalId: string): Promise<QuizBankDTO | null> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const bank = await QuizBankModel.findOne({ canonicalId, isActive: true });
    if (!bank) return null;

    const [highScoreDoc, questionCount] = await Promise.all([
      QuizHighScoreModel.findOne({ userId: userObjectId, quizBankId: bank._id }),
      QuizQuestionModel.countDocuments({ quizBankId: bank._id }),
    ]);

    return {
      id: bank._id.toString(),
      slug: bank.slug,
      title: bank.title,
      description: bank.description,
      tier: bank.tier,
      canonicalId: bank.canonicalId,
      phaseNumber: bank.phaseNumber,
      durationMinutes: bank.durationMinutes,
      passThresholdPercentage: bank.passThresholdPercentage,
      questionCount,
      highScore: highScoreDoc?.highScorePercentage,
      passed: highScoreDoc?.passed,
    };
  }

  /**
   * Start a Quiz Attempt — ZERO-KNOWLEDGE QUESTION DELIVERY
   * Strictly strips correctOptionIndex, explanation, and answer keys.
   */
  async startQuiz(userId: string, quizBankIdentifier: string): Promise<QuizStartResponseDTO> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Resolve Quiz Bank by ID, slug, or canonicalId
    let bank: IQuizBank | null = null;
    if (mongoose.Types.ObjectId.isValid(quizBankIdentifier)) {
      bank = await QuizBankModel.findById(quizBankIdentifier);
    }
    if (!bank) {
      bank = await QuizBankModel.findOne({
        $or: [{ slug: quizBankIdentifier }, { canonicalId: quizBankIdentifier }],
        isActive: true,
      });
    }

    if (!bank) {
      throw AppError.notFound(`Quiz bank '${quizBankIdentifier}' not found`);
    }

    // Fetch questions for this quiz bank
    const questions = await QuizQuestionModel.find({ quizBankId: bank._id }).sort({ order: 1 });
    if (questions.length === 0) {
      throw AppError.badRequest(`Quiz bank '${bank.title}' has no questions configured`);
    }

    // Initialize new in-progress attempt
    const attempt = await QuizAttemptModel.create({
      userId: userObjectId,
      quizBankId: bank._id,
      canonicalId: bank.canonicalId,
      status: "in_progress",
      startedAt: new Date(),
      totalQuestions: questions.length,
      correctAnswersCount: 0,
      scorePercentage: 0,
      passed: false,
      answers: [],
    });

    logger.info(
      { userId, quizBankId: bank._id, attemptId: attempt._id },
      "Quiz attempt started with zero-knowledge question projection",
    );

    // ZERO-KNOWLEDGE PROJECTION: Return ONLY public question fields
    const safeQuestions: QuizQuestionClientDTO[] = questions.map((q) => ({
      id: q._id.toString(),
      questionText: q.questionText,
      options: q.options,
    }));

    return {
      attemptId: attempt._id.toString(),
      quizBankId: bank._id.toString(),
      quizTitle: bank.title,
      tier: bank.tier,
      durationMinutes: bank.durationMinutes,
      passThresholdPercentage: bank.passThresholdPercentage,
      questions: safeQuestions,
      startedAt: attempt.startedAt.toISOString(),
    };
  }

  /**
   * Submit Quiz Answers — SERVER-SIDE GRADING & SCORING
   * Evaluates answers against server database truth, calculates >=75% mastery, persists attempt and high score.
   */
  async submitQuiz(
    userId: string,
    quizBankId: string,
    payload: QuizSubmitRequestDTO,
  ): Promise<QuizResultDTO> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    if (!mongoose.Types.ObjectId.isValid(payload.attemptId)) {
      throw AppError.badRequest("Invalid attempt ID format");
    }
    const attemptObjectId = new mongoose.Types.ObjectId(payload.attemptId);

    // 1. Fetch attempt and enforce strict learner ownership
    const attempt = await QuizAttemptModel.findOne({
      _id: attemptObjectId,
      userId: userObjectId,
    });

    if (!attempt) {
      throw AppError.notFound("Quiz attempt not found or unauthorized");
    }

    // 2. Submission Idempotency: Reject duplicate submissions
    if (attempt.status === "submitted") {
      throw AppError.conflict("This quiz attempt has already been submitted and graded");
    }
    if (attempt.status === "expired") {
      throw AppError.badRequest("This quiz attempt has expired");
    }

    // 3. Fetch Quiz Bank
    const bank = await QuizBankModel.findById(attempt.quizBankId);
    if (!bank) {
      throw AppError.notFound("Associated quiz bank not found");
    }

    // 4. Fetch private question documents with answer keys
    const questions = await QuizQuestionModel.find({ quizBankId: bank._id }).sort({ order: 1 });
    const questionMap = new Map<string, IQuizQuestion>();
    questions.forEach((q) => {
      questionMap.set(q._id.toString(), q);
    });

    // 5. Server-Side Grading
    let correctCount = 0;
    const gradedAnswers: Array<{
      questionId: mongoose.Types.ObjectId;
      selectedOptionIndex: number;
      isCorrect: boolean;
    }> = [];

    const explanations: QuestionExplanationDTO[] = [];

    // Map learner answers by question ID
    const submissionMap = new Map<string, number>();
    (payload.answers || []).forEach((ans) => {
      submissionMap.set(ans.questionId, ans.selectedOptionIndex);
    });

    questions.forEach((q) => {
      const qIdStr = q._id.toString();
      const selectedIndex = submissionMap.has(qIdStr) ? submissionMap.get(qIdStr)! : -1;
      const isCorrect = selectedIndex === q.correctOptionIndex;

      if (isCorrect) {
        correctCount += 1;
      }

      gradedAnswers.push({
        questionId: q._id,
        selectedOptionIndex: selectedIndex,
        isCorrect,
      });

      explanations.push({
        questionId: qIdStr,
        questionText: q.questionText,
        selectedOptionIndex: selectedIndex,
        correctOptionIndex: q.correctOptionIndex,
        isCorrect,
        explanation: q.explanation,
      });
    });

    const totalQuestions = questions.length;
    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passThreshold = bank.passThresholdPercentage || 75;
    const passed = scorePercentage >= passThreshold;

    const submittedAt = new Date();
    const timeSpentSeconds =
      payload.timeSpentSeconds ??
      Math.max(0, Math.floor((submittedAt.getTime() - attempt.startedAt.getTime()) / 1000));

    // 6. Persist Attempt Result
    attempt.status = "submitted";
    attempt.submittedAt = submittedAt;
    attempt.timeSpentSeconds = timeSpentSeconds;
    attempt.scorePercentage = scorePercentage;
    attempt.passed = passed;
    attempt.totalQuestions = totalQuestions;
    attempt.correctAnswersCount = correctCount;
    attempt.answers = gradedAnswers;
    await attempt.save();

    // Synchronize streak from strictly completed days (all subtopics + day test)
    streaksService.syncLearnerStreakFromCompletedDays(userId).catch((e) =>
      logger.warn({ err: e }, "Failed to sync streak activity on quiz submission"),
    );

    // 7. Update High Score Ledger ($max logic)
    const existingHighScore = await QuizHighScoreModel.findOne({
      userId: userObjectId,
      quizBankId: bank._id,
    });

    let highestScore = scorePercentage;

    if (existingHighScore) {
      highestScore = Math.max(existingHighScore.highScorePercentage, scorePercentage);
      await QuizHighScoreModel.updateOne(
        { _id: existingHighScore._id },
        {
          $max: { highScorePercentage: scorePercentage },
          $set: {
            passed: existingHighScore.passed || passed,
            lastAttemptAt: submittedAt,
          },
          $inc: { attemptsCount: 1 },
        },
      );
    } else {
      await QuizHighScoreModel.create({
        userId: userObjectId,
        quizBankId: bank._id,
        canonicalId: bank.canonicalId,
        highScorePercentage: scorePercentage,
        passed,
        attemptsCount: 1,
        lastAttemptAt: submittedAt,
      });
    }

    // 8. Phase Exam Gating & Badge Unlocking
    let badgeUnlocked: string | undefined;
    if (bank.tier === "phase_exam" && passed) {
      badgeUnlocked = `phase-${bank.phaseNumber || 1}-mastery`;
      await UserModel.updateOne(
        { _id: userObjectId },
        { $addToSet: { badges: badgeUnlocked } },
      );
      logger.info({ userId, badge: badgeUnlocked }, "Phase certification badge awarded");
    }

    logger.info(
      {
        userId,
        quizBankId: bank._id,
        scorePercentage,
        passed,
        correctCount,
        totalQuestions,
      },
      "Quiz submitted and graded successfully",
    );

    return {
      attemptId: attempt._id.toString(),
      quizBankId: bank._id.toString(),
      quizTitle: bank.title,
      scorePercentage,
      passed,
      totalQuestions,
      correctAnswersCount: correctCount,
      timeSpentSeconds,
      explanations,
      highScore: highestScore,
      badgeUnlocked,
    };
  }

  /**
   * Get past graded attempt result by attempt ID
   */
  async getAttemptResult(userId: string, attemptId: string): Promise<QuizResultDTO> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      throw AppError.badRequest("Invalid attempt ID format");
    }

    const attempt = await QuizAttemptModel.findOne({
      _id: new mongoose.Types.ObjectId(attemptId),
      userId: userObjectId,
    });

    if (!attempt) {
      throw AppError.notFound("Quiz attempt not found or unauthorized");
    }

    if (attempt.status !== "submitted") {
      throw AppError.badRequest("Quiz attempt has not been submitted yet");
    }

    const bank = await QuizBankModel.findById(attempt.quizBankId);
    if (!bank) {
      throw AppError.notFound("Associated quiz bank not found");
    }

    const questions = await QuizQuestionModel.find({ quizBankId: bank._id }).sort({ order: 1 });
    const questionMap = new Map<string, IQuizQuestion>();
    questions.forEach((q) => questionMap.set(q._id.toString(), q));

    const answerMap = new Map<string, number>();
    attempt.answers.forEach((ans) => {
      answerMap.set(ans.questionId.toString(), ans.selectedOptionIndex);
    });

    const explanations: QuestionExplanationDTO[] = questions.map((q) => {
      const qIdStr = q._id.toString();
      const selectedIndex = answerMap.has(qIdStr) ? answerMap.get(qIdStr)! : -1;
      return {
        questionId: qIdStr,
        questionText: q.questionText,
        selectedOptionIndex: selectedIndex,
        correctOptionIndex: q.correctOptionIndex,
        isCorrect: selectedIndex === q.correctOptionIndex,
        explanation: q.explanation,
      };
    });

    const highScoreDoc = await QuizHighScoreModel.findOne({
      userId: userObjectId,
      quizBankId: bank._id,
    });

    return {
      attemptId: attempt._id.toString(),
      quizBankId: bank._id.toString(),
      quizTitle: bank.title,
      scorePercentage: attempt.scorePercentage,
      passed: attempt.passed,
      totalQuestions: attempt.totalQuestions,
      correctAnswersCount: attempt.correctAnswersCount,
      timeSpentSeconds: attempt.timeSpentSeconds,
      explanations,
      highScore: highScoreDoc?.highScorePercentage || attempt.scorePercentage,
    };
  }

  /**
   * Get all high scores for learner
   */
  async getHighScores(userId: string): Promise<QuizHighScoreDTO[]> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const scores = await QuizHighScoreModel.find({ userId: userObjectId }).sort({ updatedAt: -1 });

    return scores.map((s) => ({
      quizBankId: s.quizBankId.toString(),
      canonicalId: s.canonicalId,
      highScorePercentage: s.highScorePercentage,
      passed: s.passed,
      attemptsCount: s.attemptsCount,
      lastAttemptAt: s.lastAttemptAt.toISOString(),
    }));
  }
}

export const quizService = new QuizService();
