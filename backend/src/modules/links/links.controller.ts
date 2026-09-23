import { Request, Response, NextFunction } from "express";
import { linksService } from "./links.service.js";
import {
  createLinkSchema,
  getLinksParamsSchema,
  deleteLinkParamsSchema,
} from "./links.schema.js";
import { AppError } from "../../utils/appError.js";

export class LinksController {
  async getLinks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        throw AppError.unauthorized("Authentication required");
      }

      const params = getLinksParamsSchema.parse(req.params);
      const links = await linksService.getLinks(req.user.userId, params.dayId);

      res.status(200).json({
        success: true,
        data: links,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  async createLink(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        throw AppError.unauthorized("Authentication required");
      }

      const body = createLinkSchema.parse(req.body);
      const link = await linksService.createLink(req.user.userId, body);

      res.status(201).json({
        success: true,
        data: link,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteLink(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        throw AppError.unauthorized("Authentication required");
      }

      const params = deleteLinkParamsSchema.parse(req.params);
      const result = await linksService.deleteLink(req.user.userId, params.id);

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

export const linksController = new LinksController();
