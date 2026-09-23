import { describe, it, expect } from "vitest";
import { SlugTranslator } from "../../src/modules/migration/slugTranslator.js";
import { ICurriculumNode } from "../../src/models/curriculumNode.model.js";
import { IQuizBank } from "../../src/models/quizBank.model.js";
import mongoose from "mongoose";

describe("Sprint 8: SlugTranslator Unit Tests (MIGR-002)", () => {
  // Create mock curriculum nodes
  const mockNodes: ICurriculumNode[] = [
    {
      _id: new mongoose.Types.ObjectId(),
      version: "1.0.0",
      canonicalDayId: "p1-w1-d1",
      phaseNumber: 1,
      phaseName: "Foundation",
      phaseColor: "#3fb950",
      weekNumber: 1,
      weekIndexInPhase: 1,
      weekTitle: "Node.js Core Architecture",
      dayNumberInWeek: 1,
      globalDayNumber: 1,
      isRestDay: false,
      title: "Node.js Event Loop Architecture",
      description: "Deep dive into libuv",
      subtopics: [
        { topicId: "p1-w1-d1-t1", text: "Call Stack & Microtasks" },
        { topicId: "p1-w1-d1-t2", text: "Libuv Thread Pool" },
        { topicId: "p1-w1-d1-t3", text: "Timers & Poll Phases" },
      ],
      resources: [],
      projects: [],
      skipDirectives: [],
      status: "published",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any,
    {
      _id: new mongoose.Types.ObjectId(),
      version: "1.0.0",
      canonicalDayId: "p1-w1-d2",
      phaseNumber: 1,
      phaseName: "Foundation",
      phaseColor: "#3fb950",
      weekNumber: 1,
      weekIndexInPhase: 1,
      weekTitle: "Node.js Core Architecture",
      dayNumberInWeek: 2,
      globalDayNumber: 2,
      isRestDay: false,
      title: "Node.js Streams & Buffers",
      description: "Backpressure and memory management",
      subtopics: [
        { topicId: "p1-w1-d2-t1", text: "Readable & Writable Streams" },
        { topicId: "p1-w1-d2-t2", text: "Pipeline & Backpressure" },
      ],
      resources: [],
      projects: [],
      skipDirectives: [],
      status: "published",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any,
  ];

  const nodesByWeekAndDay = new Map<string, ICurriculumNode>();
  const nodesByDayOffset = new Map<number, ICurriculumNode>();

  mockNodes.forEach((node, index) => {
    nodesByWeekAndDay.set(`${node.weekNumber}-${node.dayNumberInWeek}`, node);
    nodesByDayOffset.set(index, node);
  });

  const mockQuizBanks: IQuizBank[] = [
    {
      _id: new mongoose.Types.ObjectId(),
      canonicalId: "p1-w1-d1",
      title: "Daily Quiz — Node.js Event Loop",
      tier: "daily",
      type: "DAILY",
      phaseNumber: 1,
      weekNumber: 1,
      dayNumberInWeek: 1,
      questionCount: 5,
      passThresholdPercentage: 75,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any,
    {
      _id: new mongoose.Types.ObjectId(),
      canonicalId: "weekly-1",
      title: "Week 1 Assessment — Node.js Core",
      tier: "weekly",
      type: "WEEKLY",
      phaseNumber: 1,
      weekNumber: 1,
      dayNumberInWeek: 7,
      questionCount: 10,
      passThresholdPercentage: 75,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any,
    {
      _id: new mongoose.Types.ObjectId(),
      canonicalId: "phase-1",
      title: "Phase 1 Final Exam",
      tier: "phase_exam",
      type: "PHASE",
      phaseNumber: 1,
      weekNumber: 12,
      dayNumberInWeek: 7,
      questionCount: 15,
      passThresholdPercentage: 75,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any,
  ];

  describe("Slot Key Translation (s::wn::di::ti)", () => {
    it("translates valid slot key into exact canonical topic slug", () => {
      const result = SlugTranslator.translateSlotKey("s::1::0::0", nodesByWeekAndDay);
      expect(result).not.toBeNull();
      expect(result?.topicId).toBe("p1-w1-d1-t1");
      expect(result?.canonicalDayId).toBe("p1-w1-d1");
      expect(result?.phaseNumber).toBe(1);
      expect(result?.weekNumber).toBe(1);

      const result2 = SlugTranslator.translateSlotKey("s::1::0::1", nodesByWeekAndDay);
      expect(result2?.topicId).toBe("p1-w1-d1-t2");

      const result3 = SlugTranslator.translateSlotKey("s::1::1::0", nodesByWeekAndDay);
      expect(result3?.topicId).toBe("p1-w1-d2-t1");
      expect(result3?.canonicalDayId).toBe("p1-w1-d2");
    });

    it("returns null for malformed or unmappable slot keys", () => {
      expect(SlugTranslator.translateSlotKey("invalid_key", nodesByWeekAndDay)).toBeNull();
      expect(SlugTranslator.translateSlotKey("s::1", nodesByWeekAndDay)).toBeNull();
      expect(SlugTranslator.translateSlotKey("s::99::99::99", nodesByWeekAndDay)).toBeNull();
    });
  });

  describe("Date-to-Canonical-DayId Translation", () => {
    it("translates legacy date string using start date offset", () => {
      const canonicalDayId = SlugTranslator.translateDateToCanonicalDayId(
        "2026-09-01",
        "2026-09-01",
        mockNodes,
        nodesByDayOffset,
      );
      expect(canonicalDayId).toBe("p1-w1-d1");

      const canonicalDayId2 = SlugTranslator.translateDateToCanonicalDayId(
        "2026-09-02",
        "2026-09-01",
        mockNodes,
        nodesByDayOffset,
      );
      expect(canonicalDayId2).toBe("p1-w1-d2");
    });

    it("matches direct canonical ID strings", () => {
      const direct = SlugTranslator.translateDateToCanonicalDayId(
        "p1-w1-d1",
        null,
        mockNodes,
        nodesByDayOffset,
      );
      expect(direct).toBe("p1-w1-d1");
    });

    it("returns null for unmappable future or corrupted dates", () => {
      expect(
        SlugTranslator.translateDateToCanonicalDayId("2030-01-01", "2026-09-01", mockNodes, nodesByDayOffset),
      ).toBeNull();
      expect(
        SlugTranslator.translateDateToCanonicalDayId("invalid-date", "2026-09-01", mockNodes, nodesByDayOffset),
      ).toBeNull();
    });
  });

  describe("Quiz Score Key Translation", () => {
    it("resolves daily quiz bank keys", () => {
      const resolved = SlugTranslator.translateQuizScoreKey(
        "daily::Node.js Event Loop",
        mockQuizBanks,
      );
      expect(resolved).not.toBeNull();
      expect(resolved?.canonicalId).toBe("p1-w1-d1");
    });

    it("resolves weekly test keys", () => {
      const resolved = SlugTranslator.translateQuizScoreKey("weekly::1", mockQuizBanks);
      expect(resolved).not.toBeNull();
      expect(resolved?.canonicalId).toBe("weekly-1");
    });

    it("resolves phase exam keys", () => {
      const resolved = SlugTranslator.translateQuizScoreKey("phase::1", mockQuizBanks);
      expect(resolved).not.toBeNull();
      expect(resolved?.canonicalId).toBe("phase-1");
    });

    it("returns null for unknown quiz keys", () => {
      expect(SlugTranslator.translateQuizScoreKey("unknown::topic", mockQuizBanks)).toBeNull();
    });
  });
});
