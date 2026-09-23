import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectDatabase, disconnectDatabase } from "../../src/config/database.js";
import {
  validateCurriculumData,
  seedCurriculum,
} from "../../src/seeds/seedCurriculum.js";
import { CurriculumNodeModel } from "../../src/models/curriculumNode.model.js";

describe("Curriculum Seed Unit Tests", () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await connectDatabase(uri);
  });

  afterAll(async () => {
    await disconnectDatabase();
    if (mongod) await mongod.stop();
  });

  it("validates valid curriculum nodes correctly", () => {
    const validNodes = [
      {
        version: "1.0.0",
        canonicalDayId: "p1-w1-d1",
        phaseNumber: 1,
        phaseName: "Foundation",
        phaseColor: "#00e676",
        weekNumber: 1,
        weekIndexInPhase: 1,
        weekTitle: "Node.js Internals",
        dayNumberInWeek: 1,
        globalDayNumber: 1,
        isRestDay: false,
        title: "Event Loop",
        description: "Deep dive into libuv and event loop phases",
        subtopics: [
          { topicId: "p1-w1-d1-t1", text: "Timers phase" },
          { topicId: "p1-w1-d1-t2", text: "I/O Poll phase" },
        ],
        resources: [{ type: "yt", title: "Event Loop Video", url: "https://example.com/yt" }],
      },
    ];

    const result = validateCurriculumData(validNodes);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
    expect(result.totalNodes).toBe(1);
    expect(result.totalTopics).toBe(2);
    expect(result.uniqueCanonicalIds).toBe(1);
  });

  it("rejects invalid or duplicate canonicalDayId", () => {
    const duplicateNodes = [
      {
        version: "1.0.0",
        canonicalDayId: "p1-w1-d1",
        phaseNumber: 1,
        phaseName: "Foundation",
        weekNumber: 1,
        title: "Day 1",
        subtopics: [],
      },
      {
        version: "1.0.0",
        canonicalDayId: "p1-w1-d1", // duplicate!
        phaseNumber: 1,
        phaseName: "Foundation",
        weekNumber: 1,
        title: "Day 1 duplicate",
        subtopics: [],
      },
    ];

    const result = validateCurriculumData(duplicateNodes);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Duplicate canonicalDayId"))).toBe(true);
  });

  it("rejects invalid slug formats or orphaned subtopic IDs", () => {
    const invalidSlugNodes = [
      {
        version: "1.0.0",
        canonicalDayId: "phase1-day1", // invalid slug format
        phaseNumber: 1,
        phaseName: "Foundation",
        weekNumber: 1,
        title: "Day 1",
        subtopics: [
          { topicId: "p1-w1-d2-t1", text: "Mismatched parent day topic" },
        ],
      },
    ];

    const result = validateCurriculumData(invalidSlugNodes);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Invalid canonical slug format"))).toBe(true);
  });

  it("seeds full canonical curriculum idempotently into MongoDB", async () => {
    // 1st Seed Run
    const seedResult1 = await seedCurriculum();
    expect(seedResult1.success).toBe(true);
    expect(seedResult1.stats.valid).toBe(true);
    expect(seedResult1.stats.phases).toBe(5);
    expect(seedResult1.stats.totalNodes).toBe(147);
    expect(seedResult1.stats.totalTopics).toBe(813);

    const count1 = await CurriculumNodeModel.countDocuments({ version: "1.0.0" });
    expect(count1).toBe(147);

    // 2nd Seed Run (Idempotency test)
    const seedResult2 = await seedCurriculum();
    expect(seedResult2.success).toBe(true);
    expect(seedResult2.insertedCount).toBe(0); // 0 new inserts
    expect(seedResult2.matchedCount).toBe(147); // all 147 matched and safely updated

    const count2 = await CurriculumNodeModel.countDocuments({ version: "1.0.0" });
    expect(count2).toBe(147); // Total document count unchanged
  });
});
