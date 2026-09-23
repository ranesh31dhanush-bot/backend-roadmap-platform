import { Request, Response, NextFunction } from "express";
import { quizService } from "./quiz.service.js";
import { submitQuizSchema } from "./quiz.schema.js";
import { AppError } from "../../utils/appError.js";

export class QuizController {
  async getBanks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw AppError.unauthorized("Authentication required");
      }

      const banks = await quizService.getQuizBanks(req.user.userId);
      res.status(200).json({
        success: true,
        data: banks,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  async getByCanonicalId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw AppError.unauthorized("Authentication required");
      }

      const canonicalId = req.params.canonicalId as string;
      if (!canonicalId) {
        throw AppError.badRequest("Canonical ID is required");
      }

      const bank = await quizService.getQuizByCanonicalId(req.user.userId, canonicalId);
      if (!bank) {
        throw AppError.notFound(`Quiz for canonicalId '${canonicalId}' not found`);
      }

      res.status(200).json({
        success: true,
        data: bank,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  async start(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw AppError.unauthorized("Authentication required");
      }

      const quizBankId = (req.params.quizBankId || req.body.quizBankId) as string;
      if (!quizBankId) {
        throw AppError.badRequest("quizBankId parameter is required");
      }

      const startData = await quizService.startQuiz(req.user.userId, quizBankId);
      res.status(200).json({
        success: true,
        data: startData,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw AppError.unauthorized("Authentication required");
      }

      const quizBankId = req.params.quizBankId as string;
      if (!quizBankId) {
        throw AppError.badRequest("quizBankId parameter is required");
      }

      const validatedPayload = submitQuizSchema.parse(req.body);
      const result = await quizService.submitQuiz(req.user.userId, quizBankId, validatedPayload);

      res.status(200).json({
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  async getAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw AppError.unauthorized("Authentication required");
      }

      const attemptId = req.params.attemptId as string;
      if (!attemptId) {
        throw AppError.badRequest("attemptId parameter is required");
      }

      const result = await quizService.getAttemptResult(req.user.userId, attemptId);
      res.status(200).json({
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  async getHighScores(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw AppError.unauthorized("Authentication required");
      }

      const scores = await quizService.getHighScores(req.user.userId);
      res.status(200).json({
        success: true,
        data: scores,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const quizController = new QuizController();
