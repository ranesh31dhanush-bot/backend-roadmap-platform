import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectDatabase, disconnectDatabase } from "../../src/config/database.js";
import { seedCurriculum } from "../../src/seeds/seedCurriculum.js";
import { progressService } from "../../src/modules/progress/progress.service.js";
import { TopicProgressModel } from "../../src/models/topicProgress.model.js";
import { toggleProgressSchema } from "../../src/modules/progress/progress.schema.js";

describe("Topic Progress Ledger Unit Tests", () => {
  let mongod: MongoMemoryServer;
  const testUserId = new mongoose.Types.ObjectId().toString();

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await connectDatabase(mongod.getUri());
    await seedCurriculum();
  });

  afterAll(async () => {
    await disconnectDatabase();
    if (mongod) await mongod.stop();
  });

  beforeEach(async () => {
    await TopicProgressModel.deleteMany({});
  });

  it("validates valid and invalid topic / day slugs with Zod", () => {
    const valid = toggleProgressSchema.safeParse({
      topicId: "p1-w1-d1-t1",
      canonicalDayId: "p1-w1-d1",
    });
    expect(valid.success).toBe(true);

    const invalidTopic = toggleProgressSchema.safeParse({
      topicId: "invalid-topic-slug",
      canonicalDayId: "p1-w1-d1",
    });
    expect(invalidTopic.success).toBe(false);

    const invalidDay = toggleProgressSchema.safeParse({
      topicId: "p1-w1-d1-t1",
      canonicalDayId: "invalid-day-slug",
    });
    expect(invalidDay.success).toBe(false);
  });

  it("atomically toggles topic progress on and off (idempotent ledger state)", async () => {
    const canonicalDayId = "p1-w1-d1";
    const topicId = "p1-w1-d1-t1";

    // 1. Toggle ON
    const firstToggle = await progressService.toggleTopicProgress(testUserId, topicId, canonicalDayId);
    expect(firstToggle.topicId).toBe(topicId);
    expect(firstToggle.isCompleted).toBe(true);
    expect(firstToggle.dayProgress.completed).toBe(1);
    expect(firstToggle.dayProgress.total).toBe(5);
    expect(firstToggle.dayCompleted).toBe(false);
    expect(firstToggle.globalProgress.completed).toBe(1);

    const record = await TopicProgressModel.findOne({ userId: testUserId, topicId });
    expect(record).not.toBeNull();
    expect(record?.canonicalDayId).toBe(canonicalDayId);

    // 2. Toggle OFF
    const secondToggle = await progressService.toggleTopicProgress(testUserId, topicId, canonicalDayId);
    expect(secondToggle.isCompleted).toBe(false);
    expect(secondToggle.dayProgress.completed).toBe(0);
    expect(secondToggle.globalProgress.completed).toBe(0);

    const recordAfter = await TopicProgressModel.findOne({ userId: testUserId, topicId });
    expect(recordAfter).toBeNull();
  });

  it("marks dayCompleted=true when all subtopics in a day are checked", async () => {
    const canonicalDayId = "p1-w1-d1";
    const subtopicIds = [
      "p1-w1-d1-t1",
      "p1-w1-d1-t2",
      "p1-w1-d1-t3",
      "p1-w1-d1-t4",
      "p1-w1-d1-t5",
    ];

    for (let i = 0; i < subtopicIds.length - 1; i++) {
      const res = await progressService.toggleTopicProgress(testUserId, subtopicIds[i], canonicalDayId);
      expect(res.dayCompleted).toBe(false);
      expect(res.dayProgress.completed).toBe(i + 1);
    }

    // Toggle 5th topic
    const finalRes = await progressService.toggleTopicProgress(testUserId, subtopicIds[4], canonicalDayId);
    expect(finalRes.dayCompleted).toBe(true);
    expect(finalRes.dayProgress.completed).toBe(5);
    expect(finalRes.dayProgress.percentage).toBe(100);
  });

  it("throws badRequest if topic does not belong to the requested day", async () => {
    await expect(
      progressService.toggleTopicProgress(testUserId, "p1-w1-d2-t1", "p1-w1-d1")
    ).rejects.toThrow("Topic 'p1-w1-d2-t1' does not belong to day 'p1-w1-d1'");
  });

  it("throws notFound if canonical day does not exist in curriculum", async () => {
    await expect(
      progressService.toggleTopicProgress(testUserId, "p1-w99-d1-t1", "p1-w99-d1")
    ).rejects.toThrow("Curriculum day 'p1-w99-d1' not found");
  });
});
