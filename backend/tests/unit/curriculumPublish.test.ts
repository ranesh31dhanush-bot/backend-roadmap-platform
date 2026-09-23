import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { connectDatabase, disconnectDatabase } from "../../src/config/database.js";
import { CurriculumAdminService } from "../../src/modules/admin/curriculumAdmin.service.js";
import { CurriculumNodeModel } from "../../src/models/curriculumNode.model.js";
import { curriculumCache } from "../../src/modules/curriculum/curriculumCache.js";

describe("ADMN-002 & ADMN-003: Curriculum Node Editor & Semantic Publishing Unit Tests", () => {
  let mongod: MongoMemoryServer;
  const adminId = new mongoose.Types.ObjectId().toString();
  const adminEmail = "admin@platform.dev";

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await connectDatabase(mongod.getUri());
  });

  afterAll(async () => {
    await disconnectDatabase();
    if (mongod) await mongod.stop();
  });

  beforeEach(async () => {
    await CurriculumNodeModel.deleteMany({});
    curriculumCache.invalidateAll();
  });

  it("creates a new draft curriculum node and prevents duplicate canonicalDayId in the same version", async () => {
    const created = await CurriculumAdminService.createNode(
      adminId,
      adminEmail,
      {
        version: "1.0.0",
        canonicalDayId: "p1-w1-d1",
        phaseNumber: 1,
        phaseName: "Backend Foundations",
        phaseColor: "#00e676",
        weekNumber: 1,
        weekIndexInPhase: 1,
        weekTitle: "Networking & HTTP",
        dayNumberInWeek: 1,
        globalDayNumber: 1,
        title: "TCP/IP & Sockets Deep Dive",
        description: "Understanding raw socket programming and handshake lifecycle.",
        subtopics: [{ topicId: "p1-w1-d1-t1", text: "Three-way handshake" }],
        resources: [{ type: "article", title: "RFC 793", url: "https://tools.ietf.org/html/rfc793" }],
        status: "draft",
      },
    );

    expect(created.id).toBeDefined();
    expect(created.canonicalDayId).toBe("p1-w1-d1");
    expect(created.status).toBe("draft");

    // Attempting to insert duplicate canonicalDayId in same version must throw conflict error
    await expect(
      CurriculumAdminService.createNode(adminId, adminEmail, {
        version: "1.0.0",
        canonicalDayId: "p1-w1-d1",
        phaseNumber: 1,
        phaseName: "Backend Foundations",
        weekNumber: 1,
        weekTitle: "Networking & HTTP",
        dayNumberInWeek: 1,
        globalDayNumber: 1,
        title: "Duplicate Day",
      }),
    ).rejects.toThrow(/already exists in version/);
  });

  it("updates an existing node and invalidates curriculum cache when status is published", async () => {
    const node = await CurriculumNodeModel.create({
      version: "1.0.0",
      canonicalDayId: "p1-w1-d2",
      phaseNumber: 1,
      phaseName: "Backend Foundations",
      phaseColor: "#00e676",
      weekNumber: 1,
      weekIndexInPhase: 1,
      weekTitle: "Networking & HTTP",
      dayNumberInWeek: 2,
      globalDayNumber: 2,
      isRestDay: false,
      title: "HTTP/1.1 vs HTTP/2",
      description: "Multiplexing and framing.",
      status: "published",
    });

    // Populate cache simulation
    curriculumCache.set("phases", [{ phaseNumber: 1, name: "Test" }]);
    expect(curriculumCache.get("phases")).toBeDefined();

    const updated = await CurriculumAdminService.updateNode(
      adminId,
      adminEmail,
      node._id.toString(),
      {
        title: "HTTP/1.1 vs HTTP/2 & HTTP/3 QUIC",
      },
    );

    expect(updated.title).toBe("HTTP/1.1 vs HTTP/2 & HTTP/3 QUIC");
    // Cache must have been invalidated
    expect(curriculumCache.get("phases")).toBeNull();
  });

  it("drafts a new curriculum version from an existing published version and publishes it atomically", async () => {
    // Seed version 1.0.0 with 2 published nodes
    await CurriculumNodeModel.create([
      {
        version: "1.0.0",
        canonicalDayId: "p1-w1-d1",
        phaseNumber: 1,
        phaseName: "Foundations",
        phaseColor: "#00e676",
        weekNumber: 1,
        weekIndexInPhase: 1,
        weekTitle: "Networking",
        dayNumberInWeek: 1,
        globalDayNumber: 1,
        isRestDay: false,
        title: "Day 1",
        status: "published",
      },
      {
        version: "1.0.0",
        canonicalDayId: "p1-w1-d2",
        phaseNumber: 1,
        phaseName: "Foundations",
        phaseColor: "#00e676",
        weekNumber: 1,
        weekIndexInPhase: 1,
        weekTitle: "Networking",
        dayNumberInWeek: 2,
        globalDayNumber: 2,
        isRestDay: false,
        title: "Day 2",
        status: "published",
      },
    ]);

    // Create Draft Version 1.1.0-draft
    const draftRes = await CurriculumAdminService.createDraftVersion(
      adminId,
      adminEmail,
      "1.0.0",
      "1.1.0-draft",
    );

    expect(draftRes.version).toBe("1.1.0-draft");
    expect(draftRes.clonedNodesCount).toBe(2);
    expect(draftRes.status).toBe("draft");

    // Verify cloned nodes are in draft status
    const draftNodes = await CurriculumNodeModel.find({ version: "1.1.0-draft" });
    expect(draftNodes.length).toBe(2);
    expect(draftNodes.every((n) => n.status === "draft")).toBe(true);

    // Original 1.0.0 nodes remain published and untouched
    const originalNodes = await CurriculumNodeModel.find({ version: "1.0.0" });
    expect(originalNodes.length).toBe(2);
    expect(originalNodes.every((n) => n.status === "published")).toBe(true);

    // Now publish the draft version
    const pubRes = await CurriculumAdminService.publishVersion(
      adminId,
      adminEmail,
      "1.1.0-draft",
    );

    expect(pubRes.version).toBe("1.1.0-draft");
    expect(pubRes.publishedNodesCount).toBe(2);

    const publishedDraftNodes = await CurriculumNodeModel.find({ version: "1.1.0-draft" });
    expect(publishedDraftNodes.every((n) => n.status === "published")).toBe(true);
  });
});
