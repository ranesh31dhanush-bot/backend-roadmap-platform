import { Request, Response, NextFunction } from "express";
import { curriculumService } from "./curriculum.service.js";

export class CurriculumController {
  async getOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const version = (req.query.version as string) || "1.0.0";
      const overview = await curriculumService.getCurriculumOverview(version);
      res.status(200).json({
        success: true,
        data: overview,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  async getTree(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const version = (req.query.version as string) || "1.0.0";
      const tree = await curriculumService.getCurriculumTree(version);
      res.status(200).json({
        success: true,
        data: tree,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  async getPhases(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const version = (req.query.version as string) || "1.0.0";
      const overview = await curriculumService.getCurriculumOverview(version);
      res.status(200).json({
        success: true,
        data: overview.phases,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  async getNodeByCanonicalId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const canonicalId = req.params.canonicalId as string;
      const version = (req.query.version as string) || "1.0.0";
      const node = await curriculumService.getNodeByCanonicalId(canonicalId, version);
      res.status(200).json({
        success: true,
        data: node,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const curriculumController = new CurriculumController();
