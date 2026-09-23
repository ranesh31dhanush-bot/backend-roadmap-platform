import { Request, Response, NextFunction } from "express";
import { scheduleService } from "./schedule.service.js";
import { rescheduleSchema } from "./schedule.schema.js";
import { AppError } from "../../utils/appError.js";

export class ScheduleController {
  async getMySchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        throw AppError.unauthorized("Authentication required");
      }

      const data = await scheduleService.getSchedule(req.user.userId);
      res.status(200).json({
        success: true,
        data,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  async reschedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        throw AppError.unauthorized("Authentication required");
      }

      const { newStartDate } = rescheduleSchema.parse(req.body);
      const data = await scheduleService.reschedule(req.user.userId, newStartDate);

      res.status(200).json({
        success: true,
        data: { schedule: data },
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  async pause(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        throw AppError.unauthorized("Authentication required");
      }

      const data = await scheduleService.pauseCourse(req.user.userId);
      res.status(200).json({
        success: true,
        data,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  async resume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        throw AppError.unauthorized("Authentication required");
      }

      const data = await scheduleService.resumeCourse(req.user.userId);
      res.status(200).json({
        success: true,
        data,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  async getRoadmap(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        throw AppError.unauthorized("Authentication required");
      }

      const data = await scheduleService.getLearnerRoadmap(req.user.userId);
      res.status(200).json({
        success: true,
        data,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const scheduleController = new ScheduleController();
