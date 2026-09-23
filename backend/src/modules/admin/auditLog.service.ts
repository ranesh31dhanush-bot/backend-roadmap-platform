import mongoose from "mongoose";
import { AdminAuditLogModel, IAdminAuditLog } from "../../models/adminAuditLog.model.js";
import { AdminAuditLogDTO } from "@top1/shared";
import { logger } from "../../utils/logger.js";

export interface LogActionParams {
  adminUserId: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeState?: any;
  afterState?: any;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogService {
  /**
   * Records an immutable admin action log.
   */
  public static async logAction(params: LogActionParams): Promise<IAdminAuditLog> {
    const adminObjectId = new mongoose.Types.ObjectId(params.adminUserId);

    const logEntry = await AdminAuditLogModel.create({
      adminUserId: adminObjectId,
      adminEmail: params.adminEmail,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      beforeState: params.beforeState || null,
      afterState: params.afterState || null,
      metadata: params.metadata || null,
      ipAddress: params.ipAddress || "",
      userAgent: params.userAgent || "",
    });

    logger.info(
      {
        adminEmail: params.adminEmail,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
      },
      "Admin audit event recorded",
    );

    return logEntry;
  }

  /**
   * Fetches paginated audit logs with optional filters.
   */
  public static async getAuditLogs(options: {
    entityType?: string;
    entityId?: string;
    adminUserId?: string;
    page?: number;
    limit?: number;
    skip?: number;
  }): Promise<{ logs: AdminAuditLogDTO[]; total: number; page: number; limit: number }> {
    const query: Record<string, any> = {};

    if (options.entityType) query.entityType = options.entityType;
    if (options.entityId) query.entityId = options.entityId;
    if (options.adminUserId) query.adminUserId = new mongoose.Types.ObjectId(options.adminUserId);

    const page = options.page || 1;
    const limit = Math.min(100, options.limit || 50);
    const skip = options.skip !== undefined ? options.skip : (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AdminAuditLogModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AdminAuditLogModel.countDocuments(query),
    ]);

    const mapped: AdminAuditLogDTO[] = logs.map((l) => ({
      id: (l._id as any).toString(),
      adminUserId: l.adminUserId.toString(),
      adminEmail: l.adminEmail,
      action: l.action,
      entityType: l.entityType,
      entityId: l.entityId,
      beforeState: l.beforeState,
      afterState: l.afterState,
      metadata: (l as any).metadata,
      ipAddress: l.ipAddress,
      userAgent: l.userAgent,
      createdAt: (l.createdAt as Date).toISOString(),
    }));

    return { logs: mapped, total, page, limit };
  }
}
