import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { connectDatabase, disconnectDatabase } from "../../src/config/database.js";
import { DayNoteModel } from "../../src/models/dayNote.model.js";
import { notesService } from "../../src/modules/notes/notes.service.js";
import { AppError } from "../../src/utils/appError.js";

describe("Notes Optimistic Concurrency Control Unit Tests", () => {
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
    await DayNoteModel.deleteMany({});
  });

  const userId = new mongoose.Types.ObjectId().toString();
  const canonicalDayId = "p1-w1-d1";

  it("creates initial note with version 1 and calculates word count", async () => {
    const content = "# Learning Node.js\nEvent loop has six phases.";
    const result = await notesService.saveNote(userId, canonicalDayId, content, 1);

    expect(result.saved).toBe(true);
    expect(result.version).toBe(1);
    expect(result.wordCount).toBe(8);
    expect(result.content).toBe(content);
    expect(result.dayCanonicalId).toBe(canonicalDayId);

    const fetched = await notesService.getNote(userId, canonicalDayId);
    expect(fetched.version).toBe(1);
    expect(fetched.content).toBe(content);
    expect(fetched.wordCount).toBe(8);
  });

  it("updates note successfully and increments version from 1 to 2", async () => {
    // 1. Initial creation
    await notesService.saveNote(userId, canonicalDayId, "Initial thoughts", 1);

    // 2. Subsequent update with matching version 1
    const updatedContent = "Initial thoughts plus new deep-dive insights on libuv thread pool.";
    const updateResult = await notesService.saveNote(userId, canonicalDayId, updatedContent, 1);

    expect(updateResult.saved).toBe(true);
    expect(updateResult.version).toBe(2);
    expect(updateResult.wordCount).toBe(10);
    expect(updateResult.content).toBe(updatedContent);

    // 3. Subsequent update with matching version 2
    const v3Content = updatedContent + " And microtask queue order.";
    const v3Result = await notesService.saveNote(userId, canonicalDayId, v3Content, 2);

    expect(v3Result.saved).toBe(true);
    expect(v3Result.version).toBe(3);
  });

  it("rejects stale write with 409 Conflict when client version does not match DB version", async () => {
    // 1. Initial creation (v1)
    await notesService.saveNote(userId, canonicalDayId, "Version 1 content", 1);

    // 2. Tab A saves update -> v2
    await notesService.saveNote(userId, canonicalDayId, "Version 2 from Tab A", 1);

    // 3. Tab B (which still holds version 1) attempts to save
    try {
      await notesService.saveNote(userId, canonicalDayId, "Stale write from Tab B", 1);
      expect.fail("Should have thrown 409 Conflict");
    } catch (err: any) {
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(409);
      expect(err.code).toBe("CONFLICT");
      expect(err.details).toBeDefined();
      expect(err.details.currentVersion).toBe(2);
      expect(err.details.latestContent).toBe("Version 2 from Tab A");
    }

    // Verify DB still contains Tab A's content and was not overwritten
    const current = await notesService.getNote(userId, canonicalDayId);
    expect(current.version).toBe(2);
    expect(current.content).toBe("Version 2 from Tab A");
  });

  it("returns empty default note with version 1 when no note exists yet", async () => {
    const note = await notesService.getNote(userId, "p1-w1-d5");
    expect(note.dayCanonicalId).toBe("p1-w1-d5");
    expect(note.content).toBe("");
    expect(note.version).toBe(1);
    expect(note.wordCount).toBe(0);
  });

  it("searches user notes correctly and excludes other users' notes", async () => {
    const user2 = new mongoose.Types.ObjectId().toString();

    await notesService.saveNote(userId, "p1-w1-d1", "Understanding Kafka partitions and consumer groups", 1);
    await notesService.saveNote(userId, "p1-w1-d2", "Redis distributed locking via Redlock algorithm", 1);
    await notesService.saveNote(user2, "p1-w1-d1", "Kafka notes by another user", 1);

    const kafkaResults = await notesService.searchNotes(userId, "Kafka");
    expect(kafkaResults.length).toBe(1);
    expect(kafkaResults[0].dayCanonicalId).toBe("p1-w1-d1");
    expect(kafkaResults[0].content).toContain("Kafka partitions");

    const allUser1 = await notesService.getAllNotes(userId);
    expect(allUser1.length).toBe(2);

    const allUser2 = await notesService.getAllNotes(user2);
    expect(allUser2.length).toBe(1);
  });
});
