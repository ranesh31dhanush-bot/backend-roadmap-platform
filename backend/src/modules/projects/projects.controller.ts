import { Request, Response, NextFunction } from "express";
import { projectsService } from "./projects.service.js";
import { ApiSuccessResponse, CapstoneProjectListResponse } from "@top1/shared";

export class ProjectsController {
  /**
   * GET /api/v1/projects
   * Returns all capstone project specifications.
   * Public endpoint — no auth required.
   */
  async listProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await projectsService.getAllProjects();
      const response: ApiSuccessResponse<CapstoneProjectListResponse> = {
        success: true,
        data,
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

export const projectsController = new ProjectsController();
