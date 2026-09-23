import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { connectDatabase, disconnectDatabase } from "../../src/config/database.js";
import { QuizAdminService } from "../../src/modules/admin/quizAdmin.service.js";
import { QuizBankModel } from "../../src/models/quizBank.model.js";
import { QuizQuestionModel } from "../../src/models/quizQuestion.model.js";
import { AdminAuditLogModel } from "../../src/models/adminAuditLog.model.js";

describe("ADMN-004: Quiz Question Bank Authoring Unit Tests", () => {
  let mongod: MongoMemoryServer;
  const adminId = new mongoose.Types.ObjectId().toString();
  const adminEmail = "admin@platform.dev";
  let sampleBankId: string;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await connectDatabase(mongod.getUri());
  });

  afterAll(async () => {
    await disconnectDatabase();
    if (mongod) await mongod.stop();
  });

  beforeEach(async () => {
    await QuizBankModel.deleteMany({});
    await QuizQuestionModel.deleteMany({});
    await AdminAuditLogModel.deleteMany({});

    const bank = await QuizBankModel.create({
      slug: "daily-p1-w1-d1",
      title: "TCP & UDP Protocols Quiz",
      description: "Foundational networking assessment",
      tier: "daily",
      canonicalId: "p1-w1-d1",
      phaseNumber: 1,
      durationMinutes: 10,
      passThresholdPercentage: 75,
      isActive: true,
    });
    sampleBankId = bank._id.toString();
  });

  it("creates a quiz question with correct option validation and records audit log", async () => {
    const question = await QuizAdminService.createQuestion(
      sampleBankId,
      {
        questionText: "Which flag combination indicates a connection reset in TCP?",
        options: ["SYN+ACK", "RST", "FIN+ACK", "PSH"],
        correctOptionIndex: 1,
        explanation: "RST indicates abnormal connection termination or rejected connection attempt.",
        difficulty: "intermediate",
      },
      adminId,
      adminEmail,
      "127.0.0.1",
    );

    expect(question._id).toBeDefined();
    expect(question.questionText).toBe("Which flag combination indicates a connection reset in TCP?");
    expect(question.correctOptionIndex).toBe(1);
    expect(question.options.length).toBe(4);

    // Verify audit log recorded
    const auditLogs = await AdminAuditLogModel.find({ entityType: "quiz_question" });
    expect(auditLogs.length).toBe(1);
    expect(auditLogs[0].action).toBe("create");
    expect(auditLogs[0].adminEmail).toBe(adminEmail);
  });

  it("rejects question creation if correctOptionIndex is out of bounds", async () => {
    await expect(
      QuizAdminService.createQuestion(
        sampleBankId,
        {
          questionText: "Invalid option index test",
          options: ["Opt 1", "Opt 2"],
          correctOptionIndex: 5, // Out of bounds!
          explanation: "Invalid index",
        },
        adminId,
        adminEmail,
      ),
    ).rejects.toThrow(/correctOptionIndex/);
  });

  it("updates and deletes a quiz question with audit tracking", async () => {
    const question = await QuizAdminService.createQuestion(
      sampleBankId,
      {
        questionText: "What is the HTTP/2 framing mechanism?",
        options: ["Binary framing layer", "Plain text lines", "XML streams"],
        correctOptionIndex: 0,
        explanation: "HTTP/2 introduces a binary framing layer dividing messages into frames.",
      },
      adminId,
      adminEmail,
    );

    // Update Question
    const updated = await QuizAdminService.updateQuestion(
      question._id.toString(),
      {
        difficulty: "advanced",
        explanation: "Updated explanation for binary framing.",
      },
      adminId,
      adminEmail,
    );

    expect(updated.difficulty).toBe("advanced");
    expect(updated.explanation).toBe("Updated explanation for binary framing.");

    // Delete Question
    const delRes = await QuizAdminService.deleteQuestion(
      question._id.toString(),
      adminId,
      adminEmail,
    );
    expect(delRes.success).toBe(true);

    const check = await QuizQuestionModel.findById(question._id);
    expect(check).toBeNull();

    // Verify 3 audit logs (create, update, delete)
    const logs = await AdminAuditLogModel.find({ entityType: "quiz_question" });
    expect(logs.length).toBe(3);
  });
});
