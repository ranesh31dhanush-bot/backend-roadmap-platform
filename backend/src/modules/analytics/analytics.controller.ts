import { Request, Response, NextFunction } from "express";
import { analyticsService } from "./analytics.service.js";
import { ingestEventSchema } from "./analytics.schema.js";
import { ApiSuccessResponse, VelocityStatsDTO } from "@top1/shared";

export class AnalyticsController {
  /**
   * POST /api/v1/analytics/event
   * ANLT-001: Fire-and-forget telemetry event ingestion.
   * Returns 202 Accepted immediately — never blocks on DB write.
   */
  async ingestEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = ingestEventSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid telemetry event payload",
            details: parsed.error.flatten().fieldErrors,
          },
        });
        return;
      }

      const userId = req.user!.userId;
      // Fire-and-forget — service does not await
      analyticsService.ingestEvent(userId, parsed.data);

      // Respond immediately — this is the critical 202 path
      res.status(202).json({
        success: true,
        data: { accepted: true },
        meta: {
          requestId: req.id,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/analytics/velocity
   * ANLT-002: Returns personal velocity stats for the dashboard widget.
   */
  async getVelocityStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const stats = await analyticsService.getVelocityStats(userId);

      const response: ApiSuccessResponse<VelocityStatsDTO> = {
        success: true,
        data: stats,
        meta: {
          requestId: req.id,
          timestamp: new Date().toISOString(),
        },
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const analyticsController = new AnalyticsController();
