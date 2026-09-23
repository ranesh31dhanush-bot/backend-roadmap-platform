import { Request, Response, NextFunction } from "express";
import { MigrationService } from "./migration.service.js";
import { legacyMigrationPayloadSchema } from "./migration.schema.js";

export class MigrationController {
  /**
   * POST /api/v1/migration/import
   * Atomically ingests legacy localStorage data snapshot into the cloud database.
   */
  public static async importLegacyData(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const payload = legacyMigrationPayloadSchema.parse(req.body);
      const userId = req.user!.userId;

      const result = await MigrationService.importLegacyData(userId, payload);

      res.status(200).json({
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/migration/status
   * Checks whether the authenticated learner has already imported their legacy progress.
   */
  public static async getMigrationStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const status = await MigrationService.getMigrationStatus(userId);

      res.status(200).json({
        success: true,
        data: status,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
