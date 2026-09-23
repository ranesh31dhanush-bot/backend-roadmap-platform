import { Request, Response, NextFunction } from "express";
import { progressService } from "./progress.service.js";
import { toggleProgressSchema } from "./progress.schema.js";
import { AppError } from "../../utils/appError.js";

export class ProgressController {
  async toggle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        throw AppError.unauthorized("Authentication required");
      }

      const validated = toggleProgressSchema.parse(req.body);
      const result = await progressService.toggleTopicProgress(
        req.user.userId,
        validated.topicId,
        validated.canonicalDayId,
      );

      res.status(200).json({
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  async getDayProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        throw AppError.unauthorized("Authentication required");
      }

      const dayId = req.params.dayId as string;
      if (!dayId) {
        throw AppError.badRequest("Canonical day ID is required");
      }

      const result = await progressService.getDayProgress(req.user.userId, dayId);

      res.status(200).json({
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        throw AppError.unauthorized("Authentication required");
      }

      const result = await progressService.getProgressSummary(req.user.userId);

      res.status(200).json({
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const progressController = new ProgressController();
