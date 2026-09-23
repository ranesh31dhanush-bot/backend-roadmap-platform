import { Request, Response, NextFunction } from "express";
import { CurriculumAdminService } from "./curriculumAdmin.service.js";
import { QuizAdminService } from "./quizAdmin.service.js";
import { AuditLogService } from "./auditLog.service.js";
import {
  updateCurriculumNodeSchema,
  createCurriculumNodeSchema,
  draftVersionRequestSchema,
  publishVersionRequestSchema,
  createQuizQuestionSchema,
  updateQuizQuestionSchema,
} from "./admin.schema.js";
import { AppError } from "../../utils/appError.js";

export class AdminController {
  /**
   * GET /api/v1/admin/dashboard
   */
  static async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const metrics = await CurriculumAdminService.getAdminMetrics();
      res.status(200).json({
        success: true,
        data: metrics,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/curriculum/nodes
   */
  static async getCurriculumNodes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { version, phaseNumber, search } = req.query;
      const nodes = await CurriculumAdminService.getNodes({
        version: version as string,
        phaseNumber: phaseNumber ? parseInt(phaseNumber as string, 10) : undefined,
        search: search as string,
      });

      res.status(200).json({
        success: true,
        data: {
          nodes,
          total: nodes.length,
        },
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/curriculum/nodes/:id
   */
  static async getCurriculumNodeById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const node = await CurriculumAdminService.getNodeById(req.params.id as string, req.query.version as string);
      res.status(200).json({
        success: true,
        data: node,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/admin/curriculum/nodes/:id
   */
  static async updateCurriculumNode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = updateCurriculumNodeSchema.safeParse(req.body);
      if (!parsed.success) {
        throw AppError.validation("Invalid curriculum update payload", parsed.error.issues);
      }

      const adminUser = (req as any).user;
      const updated = await CurriculumAdminService.updateNode(
        adminUser.userId,
        adminUser.email,
        req.params.id as string,
        parsed.data,
        req.ip,
        req.headers["user-agent"],
      );

      res.status(200).json({
        success: true,
        data: updated,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/admin/curriculum/nodes
   */
  static async createCurriculumNode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = createCurriculumNodeSchema.safeParse(req.body);
      if (!parsed.success) {
        throw AppError.validation("Invalid curriculum node payload", parsed.error.issues);
      }

      const adminUser = (req as any).user;
      const created = await CurriculumAdminService.createNode(
        adminUser.userId,
        adminUser.email,
        parsed.data,
        req.ip,
        req.headers["user-agent"],
      );

      res.status(201).json({
        success: true,
        data: created,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/curriculum/versions
   */
  static async getVersions(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const versions = await CurriculumAdminService.getVersions();
      res.status(200).json({
        success: true,
        data: {
          versions,
          total: versions.length,
        },
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/admin/curriculum/versions/draft
   */
  static async createDraftVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = draftVersionRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        throw AppError.validation("Invalid draft version payload", parsed.error.issues);
      }

      const adminUser = (req as any).user;
      const draft = await CurriculumAdminService.createDraftVersion(
        adminUser.userId,
        adminUser.email,
        parsed.data.sourceVersion,
        parsed.data.newDraftVersion,
        req.ip,
        req.headers["user-agent"],
      );

      res.status(201).json({
        success: true,
        data: draft,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/admin/curriculum/versions/publish
   */
  static async publishVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = publishVersionRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        throw AppError.validation("Invalid publish version payload", parsed.error.issues);
      }

      const adminUser = (req as any).user;
      const published = await CurriculumAdminService.publishVersion(
        adminUser.userId,
        adminUser.email,
        parsed.data.version,
        req.ip,
        req.headers["user-agent"],
      );

      res.status(200).json({
        success: true,
        data: published,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/quizzes/banks
   */
  static async getQuizBanks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tier, phaseNumber } = req.query;
      const banks = await QuizAdminService.listQuizBanks({
        tier: tier as string,
        phaseNumber: phaseNumber ? parseInt(phaseNumber as string, 10) : undefined,
      });
      res.status(200).json({
        success: true,
        data: {
          banks,
          total: banks.length,
        },
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/quizzes/banks/:bankId/questions
   */
  static async getQuizQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await QuizAdminService.getQuestionsByBankId(req.params.bankId as string);
      res.status(200).json({
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/admin/quizzes/banks/:bankId/questions
   */
  static async createQuizQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = createQuizQuestionSchema.safeParse(req.body);
      if (!parsed.success) {
        throw AppError.validation("Invalid quiz question payload", parsed.error.issues);
      }

      const adminUser = (req as any).user;
      const question = await QuizAdminService.createQuestion(
        req.params.bankId as string,
        parsed.data,
        adminUser.userId,
        adminUser.email,
        req.ip,
      );

      res.status(201).json({
        success: true,
        data: question,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/quizzes/questions/:id
   */
  static async getQuizQuestionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const question = await QuizAdminService.getQuestionById(req.params.id as string);
      res.status(200).json({
        success: true,
        data: question,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/admin/quizzes/questions/:id
   */
  static async updateQuizQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = updateQuizQuestionSchema.safeParse(req.body);
      if (!parsed.success) {
        throw AppError.validation("Invalid quiz question update payload", parsed.error.issues);
      }

      const adminUser = (req as any).user;
      const updated = await QuizAdminService.updateQuestion(
        req.params.id as string,
        parsed.data,
        adminUser.userId,
        adminUser.email,
        req.ip,
      );

      res.status(200).json({
        success: true,
        data: updated,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/v1/admin/quizzes/questions/:id
   */
  static async deleteQuizQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminUser = (req as any).user;
      const result = await QuizAdminService.deleteQuestion(
        req.params.id as string,
        adminUser.userId,
        adminUser.email,
        req.ip,
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

  /**
   * GET /api/v1/admin/audit-logs
   */
  static async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { entityType, entityId, adminUserId, page, limit } = req.query;
      const result = await AuditLogService.getAuditLogs({
        entityType: entityType as any,
        entityId: entityId as string,
        adminUserId: adminUserId as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 50,
      });

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
