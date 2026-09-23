import mongoose from "mongoose";
import { CurriculumNodeModel, ICurriculumNode } from "../../models/curriculumNode.model.js";
import { UserModel } from "../../models/user.model.js";
import { QuizBankModel } from "../../models/quizBank.model.js";
import { QuizQuestionModel } from "../../models/quizQuestion.model.js";
import { curriculumCache } from "../curriculum/curriculumCache.js";
import { AuditLogService } from "./auditLog.service.js";
import {
  AdminCurriculumNodeDTO,
  AdminUpdateCurriculumNodeDTO,
  AdminCreateCurriculumNodeDTO,
  CurriculumVersionSummaryDTO,
  AdminMetricsDTO,
} from "@top1/shared";
import { AppError } from "../../utils/appError.js";
import { logger } from "../../utils/logger.js";

export class CurriculumAdminService {
  /**
   * Queries curriculum nodes with optional filters for version, phase, or search term.
   */
  public static async getNodes(options: {
    version?: string;
    phaseNumber?: number;
    search?: string;
  }): Promise<AdminCurriculumNodeDTO[]> {
    const filter: Record<string, any> = {};

    if (options.version) {
      filter.version = options.version;
    } else {
      filter.status = "published";
    }

    if (options.phaseNumber) {
      filter.phaseNumber = options.phaseNumber;
    }

    if (options.search) {
      const searchRegex = new RegExp(options.search, "i");
      filter.$or = [
        { title: searchRegex },
        { canonicalDayId: searchRegex },
        { description: searchRegex },
        { "subtopics.text": searchRegex },
      ];
    }

    const nodes = await CurriculumNodeModel.find(filter)
      .sort({ globalDayNumber: 1 })
      .lean();

    return nodes.map((n) => ({
      id: (n._id as any).toString(),
      version: n.version,
      canonicalDayId: n.canonicalDayId,
      phaseNumber: n.phaseNumber,
      phaseName: n.phaseName,
      phaseColor: n.phaseColor,
      weekNumber: n.weekNumber,
      weekIndexInPhase: n.weekIndexInPhase,
      weekTitle: n.weekTitle,
      dayNumberInWeek: n.dayNumberInWeek,
      globalDayNumber: n.globalDayNumber,
      isRestDay: n.isRestDay,
      title: n.title,
      description: n.description,
      skipDirectives: n.skipDirectives || [],
      salaryMeta: n.salaryMeta || null,
      projects: (n.projects || []).map((p: any) => ({ name: p.name, desc: p.desc, tags: p.tags || [] })),
      subtopics: (n.subtopics || []).map((s: any) => ({ topicId: s.topicId, text: s.text })),
      resources: (n.resources || []).map((r: any) => ({ type: r.type, title: r.title, url: r.url })),
      quizBankKey: n.quizBankKey || null,
      status: n.status,
      createdAt: (n.createdAt as Date).toISOString(),
      updatedAt: (n.updatedAt as Date).toISOString(),
    }));
  }

  /**
   * Fetches single curriculum node by MongoDB ID or canonicalDayId.
   */
  public static async getNodeById(idOrSlug: string, version = "1.0.0"): Promise<AdminCurriculumNodeDTO> {
    let node: ICurriculumNode | null = null;

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      node = await CurriculumNodeModel.findById(idOrSlug);
    }

    if (!node) {
      node = await CurriculumNodeModel.findOne({ canonicalDayId: idOrSlug, version });
    }

    if (!node) {
      throw AppError.notFound(`Curriculum node '${idOrSlug}' not found`);
    }

    return {
      id: node._id.toString(),
      version: node.version,
      canonicalDayId: node.canonicalDayId,
      phaseNumber: node.phaseNumber,
      phaseName: node.phaseName,
      phaseColor: node.phaseColor,
      weekNumber: node.weekNumber,
      weekIndexInPhase: node.weekIndexInPhase,
      weekTitle: node.weekTitle,
      dayNumberInWeek: node.dayNumberInWeek,
      globalDayNumber: node.globalDayNumber,
      isRestDay: node.isRestDay,
      title: node.title,
      description: node.description,
      skipDirectives: node.skipDirectives || [],
      salaryMeta: node.salaryMeta || null,
      projects: (node.projects || []).map((p: any) => ({ name: p.name, desc: p.desc, tags: p.tags || [] })),
      subtopics: (node.subtopics || []).map((s: any) => ({ topicId: s.topicId, text: s.text })),
      resources: (node.resources || []).map((r: any) => ({ type: r.type, title: r.title, url: r.url })),
      quizBankKey: node.quizBankKey || null,
      status: node.status,
      createdAt: node.createdAt.toISOString(),
      updatedAt: node.updatedAt.toISOString(),
    };
  }

  /**
   * Updates an existing curriculum node and records audit log.
   */
  public static async updateNode(
    adminUserId: string,
    adminEmail: string,
    nodeId: string,
    updateData: AdminUpdateCurriculumNodeDTO,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AdminCurriculumNodeDTO> {
    const node = await CurriculumNodeModel.findById(nodeId);
    if (!node) {
      throw AppError.notFound("Curriculum node not found");
    }

    const beforeState = node.toObject();

    if (updateData.title !== undefined) node.title = updateData.title;
    if (updateData.description !== undefined) node.description = updateData.description;
    if (updateData.phaseName !== undefined) node.phaseName = updateData.phaseName;
    if (updateData.phaseColor !== undefined) node.phaseColor = updateData.phaseColor;
    if (updateData.weekTitle !== undefined) node.weekTitle = updateData.weekTitle;
    if (updateData.isRestDay !== undefined) node.isRestDay = updateData.isRestDay;
    if (updateData.skipDirectives !== undefined) node.skipDirectives = updateData.skipDirectives;
    if (updateData.salaryMeta !== undefined) node.salaryMeta = updateData.salaryMeta as any;
    if (updateData.projects !== undefined) node.projects = updateData.projects as any;
    if (updateData.subtopics !== undefined) node.subtopics = updateData.subtopics as any;
    if (updateData.resources !== undefined) node.resources = updateData.resources as any;
    if (updateData.quizBankKey !== undefined) node.quizBankKey = updateData.quizBankKey;
    if (updateData.status !== undefined) node.status = updateData.status;

    await node.save();

    const afterState = node.toObject();

    // Invalidate caches if published node was updated
    if (node.status === "published") {
      curriculumCache.invalidateAll();
    }

    // Record audit log
    await AuditLogService.logAction({
      adminUserId,
      adminEmail,
      action: "CURRICULUM_NODE_UPDATE",
      entityType: "CurriculumNode",
      entityId: node.canonicalDayId,
      beforeState,
      afterState,
      ipAddress,
      userAgent,
    });

    return {
      id: node._id.toString(),
      version: node.version,
      canonicalDayId: node.canonicalDayId,
      phaseNumber: node.phaseNumber,
      phaseName: node.phaseName,
      phaseColor: node.phaseColor,
      weekNumber: node.weekNumber,
      weekIndexInPhase: node.weekIndexInPhase,
      weekTitle: node.weekTitle,
      dayNumberInWeek: node.dayNumberInWeek,
      globalDayNumber: node.globalDayNumber,
      isRestDay: node.isRestDay,
      title: node.title,
      description: node.description,
      skipDirectives: node.skipDirectives || [],
      salaryMeta: node.salaryMeta || null,
      projects: (node.projects || []).map((p: any) => ({ name: p.name, desc: p.desc, tags: p.tags || [] })),
      subtopics: (node.subtopics || []).map((s: any) => ({ topicId: s.topicId, text: s.text })),
      resources: (node.resources || []).map((r: any) => ({ type: r.type, title: r.title, url: r.url })),
      quizBankKey: node.quizBankKey || null,
      status: node.status,
      createdAt: node.createdAt.toISOString(),
      updatedAt: node.updatedAt.toISOString(),
    };
  }

  /**
   * Creates a new curriculum node in draft status and records audit log.
   */
  public static async createNode(
    adminUserId: string,
    adminEmail: string,
    nodeData: AdminCreateCurriculumNodeDTO,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AdminCurriculumNodeDTO> {
    const existing = await CurriculumNodeModel.findOne({
      version: nodeData.version,
      canonicalDayId: nodeData.canonicalDayId,
    });

    if (existing) {
      throw AppError.conflict(
        `Node '${nodeData.canonicalDayId}' already exists in version '${nodeData.version}'`,
      );
    }

    const created = await CurriculumNodeModel.create({
      version: nodeData.version,
      canonicalDayId: nodeData.canonicalDayId,
      phaseNumber: nodeData.phaseNumber,
      phaseName: nodeData.phaseName,
      phaseColor: nodeData.phaseColor || "#00e676",
      weekNumber: nodeData.weekNumber,
      weekIndexInPhase: nodeData.weekIndexInPhase || 1,
      weekTitle: nodeData.weekTitle,
      dayNumberInWeek: nodeData.dayNumberInWeek,
      globalDayNumber: nodeData.globalDayNumber,
      isRestDay: !!nodeData.isRestDay,
      title: nodeData.title,
      description: nodeData.description || "",
      skipDirectives: nodeData.skipDirectives || [],
      salaryMeta: nodeData.salaryMeta || null,
      projects: nodeData.projects || [],
      subtopics: nodeData.subtopics || [],
      resources: nodeData.resources || [],
      quizBankKey: nodeData.quizBankKey || null,
      status: nodeData.status || "draft",
    });

    await AuditLogService.logAction({
      adminUserId,
      adminEmail,
      action: "CURRICULUM_NODE_CREATE",
      entityType: "CurriculumNode",
      entityId: created.canonicalDayId,
      afterState: created.toObject(),
      ipAddress,
      userAgent,
    });

    return {
      id: created._id.toString(),
      version: created.version,
      canonicalDayId: created.canonicalDayId,
      phaseNumber: created.phaseNumber,
      phaseName: created.phaseName,
      phaseColor: created.phaseColor,
      weekNumber: created.weekNumber,
      weekIndexInPhase: created.weekIndexInPhase,
      weekTitle: created.weekTitle,
      dayNumberInWeek: created.dayNumberInWeek,
      globalDayNumber: created.globalDayNumber,
      isRestDay: created.isRestDay,
      title: created.title,
      description: created.description,
      skipDirectives: created.skipDirectives || [],
      salaryMeta: created.salaryMeta || null,
      projects: (created.projects || []).map((p: any) => ({ name: p.name, desc: p.desc, tags: p.tags || [] })),
      subtopics: (created.subtopics || []).map((s: any) => ({ topicId: s.topicId, text: s.text })),
      resources: (created.resources || []).map((r: any) => ({ type: r.type, title: r.title, url: r.url })),
      quizBankKey: created.quizBankKey || null,
      status: created.status,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }

  /**
   * Deletes a node if in draft status and records audit log.
   */
  public static async deleteNode(
    adminUserId: string,
    adminEmail: string,
    nodeId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const node = await CurriculumNodeModel.findById(nodeId);
    if (!node) {
      throw AppError.notFound("Curriculum node not found");
    }

    if (node.status === "published") {
      throw AppError.badRequest("Cannot delete a published curriculum node. Archive or create a new version instead.");
    }

    const beforeState = node.toObject();
    await CurriculumNodeModel.findByIdAndDelete(nodeId);

    await AuditLogService.logAction({
      adminUserId,
      adminEmail,
      action: "CURRICULUM_NODE_DELETE",
      entityType: "CurriculumNode",
      entityId: node.canonicalDayId,
      beforeState,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Lists all curriculum versions with node counts and metadata.
   */
  public static async getVersions(): Promise<CurriculumVersionSummaryDTO[]> {
    const versions = await CurriculumNodeModel.aggregate([
      {
        $group: {
          _id: "$version",
          nodeCount: { $sum: 1 },
          phases: { $addToSet: "$phaseNumber" },
          weeks: { $addToSet: "$weekNumber" },
          totalTopics: { $sum: { $size: { $ifNull: ["$subtopics", []] } } },
          statuses: { $addToSet: "$status" },
          minCreatedAt: { $min: "$createdAt" },
          maxUpdatedAt: { $max: "$updatedAt" },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    return versions.map((v) => ({
      version: v._id,
      status: v.statuses.includes("published") ? "published" : v.statuses.includes("draft") ? "draft" : "archived",
      nodeCount: v.nodeCount,
      phaseCount: v.phases.length,
      weekCount: v.weeks.length,
      totalTopics: v.totalTopics,
      createdAt: v.minCreatedAt ? new Date(v.minCreatedAt).toISOString() : new Date().toISOString(),
      updatedAt: v.maxUpdatedAt ? new Date(v.maxUpdatedAt).toISOString() : new Date().toISOString(),
    }));
  }

  /**
   * Clones an existing curriculum version into a new draft semantic version.
   */
  public static async createDraftVersion(
    adminUserId: string,
    adminEmail: string,
    sourceVersion: string,
    newDraftVersion: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ version: string; clonedNodesCount: number; status: string }> {
    const existingTarget = await CurriculumNodeModel.findOne({ version: newDraftVersion });
    if (existingTarget) {
      throw AppError.conflict(`Curriculum version '${newDraftVersion}' already exists`);
    }

    const sourceNodes = await CurriculumNodeModel.find({ version: sourceVersion }).lean();
    if (sourceNodes.length === 0) {
      throw AppError.notFound(`Source curriculum version '${sourceVersion}' has no nodes`);
    }

    const clonedNodes = sourceNodes.map((node) => {
      const { _id, createdAt, updatedAt, ...rest } = node;
      return {
        ...rest,
        version: newDraftVersion,
        status: "draft",
      };
    });

    await CurriculumNodeModel.insertMany(clonedNodes);

    await AuditLogService.logAction({
      adminUserId,
      adminEmail,
      action: "CURRICULUM_VERSION_DRAFT",
      entityType: "CurriculumVersion",
      entityId: newDraftVersion,
      afterState: { sourceVersion, newDraftVersion, clonedCount: clonedNodes.length },
      ipAddress,
      userAgent,
    });

    return {
      version: newDraftVersion,
      clonedNodesCount: clonedNodes.length,
      status: "draft",
    };
  }

  /**
   * Validates and publishes a draft curriculum version atomically.
   */
  public static async publishVersion(
    adminUserId: string,
    adminEmail: string,
    versionToPublish: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ version: string; publishedNodesCount: number; status: string }> {
    const draftNodes = await CurriculumNodeModel.find({ version: versionToPublish });
    if (draftNodes.length === 0) {
      throw AppError.notFound(`No curriculum nodes found for version '${versionToPublish}'`);
    }

    // 1. Validation: ensure no duplicate canonical IDs in version
    const idSet = new Set<string>();
    for (const node of draftNodes) {
      if (idSet.has(node.canonicalDayId)) {
        throw AppError.badRequest(`Duplicate canonicalDayId '${node.canonicalDayId}' in version '${versionToPublish}'`);
      }
      idSet.add(node.canonicalDayId);
    }

    // 2. Publish nodes
    const updateResult = await CurriculumNodeModel.updateMany(
      { version: versionToPublish },
      { $set: { status: "published" } },
    );

    // 3. Invalidate curriculum caches
    curriculumCache.invalidateAll();

    // 4. Record audit log
    await AuditLogService.logAction({
      adminUserId,
      adminEmail,
      action: "CURRICULUM_VERSION_PUBLISH",
      entityType: "CurriculumVersion",
      entityId: versionToPublish,
      afterState: { version: versionToPublish, publishedNodesCount: updateResult.modifiedCount },
      ipAddress,
      userAgent,
    });

    logger.info(
      { version: versionToPublish, modifiedCount: updateResult.modifiedCount },
      "Curriculum version successfully published and caches cleared",
    );

    return {
      version: versionToPublish,
      publishedNodesCount: updateResult.modifiedCount,
      status: "published",
    };
  }

  /**
   * Retrieves high-level operational statistics for the admin dashboard.
   */
  public static async getAdminMetrics(): Promise<AdminMetricsDTO> {
    const [
      totalLearners,
      activeLearners,
      migratedLearners,
      versionsCount,
      totalNodes,
      quizBanksCount,
      quizQuestionsCount,
    ] = await Promise.all([
      UserModel.countDocuments({ role: "learner" }),
      UserModel.countDocuments({ role: "learner", isOnboarded: true }),
      UserModel.countDocuments({ isMigrated: true }),
      CurriculumNodeModel.distinct("version").then((v) => v.length),
      CurriculumNodeModel.countDocuments({ status: "published" }),
      QuizBankModel.countDocuments({ isActive: true }),
      QuizQuestionModel.countDocuments({}),
    ]);

    const publishedNodes = await CurriculumNodeModel.find({ status: "published" }).select("subtopics").lean();
    const totalTopics = publishedNodes.reduce((acc, node) => acc + (node.subtopics?.length || 0), 0);

    return {
      totalLearners,
      activeLearners,
      migratedLearners,
      curriculumVersionsCount: versionsCount || 1,
      activeCurriculumVersion: "1.0.0",
      totalCurriculumNodes: totalNodes,
      totalTopics,
      totalQuizBanks: quizBanksCount,
      totalQuizQuestions: quizQuestionsCount,
    };
  }
}
