import { Request, Response, NextFunction } from "express";
import { onboardingService } from "./onboarding.service.js";
import { startOnboardingSchema } from "./onboarding.schema.js";
import { AppError } from "../../utils/appError.js";

export class OnboardingController {
  async start(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        throw AppError.unauthorized("Authentication required");
      }

      const validatedData = startOnboardingSchema.parse(req.body);
      const result = await onboardingService.startOnboarding(req.user.userId, validatedData);

      res.status(200).json({
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        throw AppError.unauthorized("Authentication required");
      }

      const result = await onboardingService.getOnboardingStatus(req.user.userId);

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

export const onboardingController = new OnboardingController();
