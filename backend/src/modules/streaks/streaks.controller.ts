import { Request, Response, NextFunction } from "express";
import { streaksService } from "./streaks.service.js";
import { recordActivitySchema, consumeFreezeSchema } from "./streaks.schema.js";
import { AppError } from "../../utils/appError.js";

export class StreaksController {
  async getStreak(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        throw AppError.unauthorized("Authentication required");
      }

      const timezone = req.query.tz as string | undefined;
      const streak = await streaksService.getStreak(req.user.userId, timezone);

      res.status(200).json({
        success: true,
        data: streak,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  async recordActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        throw AppError.unauthorized("Authentication required");
      }

      const body = recordActivitySchema.parse(req.body || {});
      const streak = await streaksService.recordActivity(
        req.user.userId,
        body.date,
        body.timezone,
      );

      res.status(200).json({
        success: true,
        data: streak,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  async consumeFreeze(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        throw AppError.unauthorized("Authentication required");
      }

      const body = consumeFreezeSchema.parse(req.body || {});
      const streak = await streaksService.consumeFreeze(req.user.userId, body.date);

      res.status(200).json({
        success: true,
        data: streak,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const streaksController = new StreaksController();
