import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { connectDatabase, disconnectDatabase } from "../../src/config/database.js";
import { UserStreakModel } from "../../src/models/userStreak.model.js";
import { streaksService } from "../../src/modules/streaks/streaks.service.js";

describe("Streak & Habit Matrix Calculation Unit Tests", () => {
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
    await UserStreakModel.deleteMany({});
  });

  const userId = new mongoose.Types.ObjectId().toString();

  it("calculates initial streak for a single qualifying active day", async () => {
    const today = "2026-10-15";
    const streak = await streaksService.recordActivity(userId, today);

    expect(streak.currentStreak).toBe(1);
    expect(streak.longestStreak).toBe(1);
    expect(streak.lastActivityDate).toBe(today);
    expect(streak.freezeAvailable).toBe(true);
    expect(streak.freezeUsedAt).toBeNull();
    expect(streak.habitMatrix.length).toBe(21);

    const todayEntry = streak.habitMatrix.find((d) => d.date === today);
    expect(todayEntry).toBeDefined();
    expect(todayEntry?.isActive).toBe(true);
    expect(todayEntry?.status).toBe("completed");
  });

  it("calculates consecutive active days and increments streak correctly", async () => {
    await streaksService.recordActivity(userId, "2026-10-10");
    await streaksService.recordActivity(userId, "2026-10-11");
    await streaksService.recordActivity(userId, "2026-10-12");
    await streaksService.recordActivity(userId, "2026-10-13");
    const result = await streaksService.recordActivity(userId, "2026-10-14");

    expect(result.currentStreak).toBe(5);
    expect(result.longestStreak).toBe(5);
    expect(result.totalActiveDays).toBe(5);
  });

  it("automatically consumes monthly streak freeze on a single missed day and preserves streak", async () => {
    // 3 days active
    await streaksService.recordActivity(userId, "2026-10-10");
    await streaksService.recordActivity(userId, "2026-10-11");
    await streaksService.recordActivity(userId, "2026-10-12");

    // Missed 2026-10-13!
    // Active again on 2026-10-14:
    const result = await streaksService.recordActivity(userId, "2026-10-14");

    // The freeze should have protected 2026-10-13
    expect(result.freezeAvailable).toBe(false);
    expect(result.freezeUsedAt).toBe("2026-10-13");
    expect(result.currentStreak).toBe(5); // 10, 11, 12, (13 freeze), 14 = 5 days
    expect(result.longestStreak).toBe(5);

    const frozenDay = result.habitMatrix.find((d) => d.date === "2026-10-13");
    expect(frozenDay?.status).toBe("frozen");
    expect(frozenDay?.isActive).toBe(true);
  });

  it("resets streak to 0/1 when a second missed day occurs in the same month (no freeze left)", async () => {
    // Active 10, 11, 12
    await streaksService.recordActivity(userId, "2026-10-10");
    await streaksService.recordActivity(userId, "2026-10-11");
    await streaksService.recordActivity(userId, "2026-10-12");

    // Miss 13 (freeze consumed) and active 14
    await streaksService.recordActivity(userId, "2026-10-14");

    // Miss 15 and 16, then active on 17
    const result = await streaksService.recordActivity(userId, "2026-10-17");

    // Streak resets to 1 (only 17 is active), longest streak remains 5
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(5);
    expect(result.freezeAvailable).toBe(false);
  });

  it("replenishes streak freeze in a new calendar month (1 per calendar month)", async () => {
    const userDoc = await UserStreakModel.create({
      userId: new mongoose.Types.ObjectId(userId),
      currentStreak: 10,
      longestStreak: 10,
      lastActiveDate: "2026-09-30",
      activityDates: ["2026-09-28", "2026-09-29", "2026-09-30"],
      freezeAvailable: false,
      freezeUsedAt: "2026-09-25",
      lastFreezeResetMonth: "2026-09",
    });

    const evaluated = streaksService.calculateStreakState(userDoc, "2026-10-01");
    expect(evaluated.freezeAvailable).toBe(true);
    expect(userDoc.lastFreezeResetMonth).toBe("2026-10");
  });

  it("calculates rolling 21-day habit matrix correctly", async () => {
    const today = "2026-10-21";
    await streaksService.recordActivity(userId, "2026-10-19");
    await streaksService.recordActivity(userId, "2026-10-20");
    const result = await streaksService.recordActivity(userId, today);

    expect(result.habitMatrix.length).toBe(21);
    expect(result.habitMatrix[0].dayIndex).toBe(1);
    expect(result.habitMatrix[20].dayIndex).toBe(21);
    expect(result.habitMatrix[20].date).toBe(today);
    expect(result.habitMatrix[20].status).toBe("completed");
  });
});
