import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { connectDatabase, disconnectDatabase } from "../../src/config/database.js";
import { AuditLogService } from "../../src/modules/admin/auditLog.service.js";
import { AdminAuditLogModel } from "../../src/models/adminAuditLog.model.js";

describe("ADMN-005: Admin Audit Logging Engine Unit Tests", () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await connectDatabase(mongod.getUri());
  });

  afterAll(async () => {
    await disconnectDatabase();
    if (mongod) await mongod.stop();
  });

  beforeEach(async () => {
    await AdminAuditLogModel.deleteMany({});
  });

  it("successfully records an immutable admin action log with before/after state diffs", async () => {
    const adminId = new mongoose.Types.ObjectId().toString();
    const log = await AuditLogService.logAction({
      adminUserId: adminId,
      adminEmail: "admin@platform.dev",
      action: "CURRICULUM_NODE_UPDATE",
      entityType: "CurriculumNode",
      entityId: "p1-w1-d1",
      beforeState: { title: "Old Title", isRestDay: false },
      afterState: { title: "New Title", isRestDay: false },
      metadata: { fieldCount: 1 },
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0 Vitest",
    });

    expect(log).toBeDefined();
    expect(log._id).toBeDefined();
    expect(log.adminEmail).toBe("admin@platform.dev");
    expect(log.action).toBe("CURRICULUM_NODE_UPDATE");
    expect(log.entityType).toBe("CurriculumNode");
    expect(log.entityId).toBe("p1-w1-d1");
    expect(log.beforeState).toEqual({ title: "Old Title", isRestDay: false });
    expect(log.afterState).toEqual({ title: "New Title", isRestDay: false });
    expect(log.ipAddress).toBe("127.0.0.1");

    // Verify stored in MongoDB
    const count = await AdminAuditLogModel.countDocuments();
    expect(count).toBe(1);
  });

  it("retrieves paginated audit logs with entityType filtering", async () => {
    const adminId = new mongoose.Types.ObjectId().toString();

    // Insert multiple audit logs
    await AuditLogService.logAction({
      adminUserId: adminId,
      adminEmail: "admin@platform.dev",
      action: "CREATE_NODE",
      entityType: "CurriculumNode",
      entityId: "p1-w1-d1",
    });

    await AuditLogService.logAction({
      adminUserId: adminId,
      adminEmail: "admin@platform.dev",
      action: "CREATE_QUESTION",
      entityType: "quiz_question",
      entityId: "q-101",
    });

    await AuditLogService.logAction({
      adminUserId: adminId,
      adminEmail: "admin@platform.dev",
      action: "PUBLISH_VERSION",
      entityType: "CurriculumVersion",
      entityId: "1.1.0",
    });

    // Query All
    const all = await AuditLogService.getAuditLogs({ page: 1, limit: 10 });
    expect(all.total).toBe(3);
    expect(all.logs.length).toBe(3);

    // Query with filter
    const quizOnly = await AuditLogService.getAuditLogs({ entityType: "quiz_question" });
    expect(quizOnly.total).toBe(1);
    expect(quizOnly.logs[0].entityType).toBe("quiz_question");
    expect(quizOnly.logs[0].entityId).toBe("q-101");
  });
});
