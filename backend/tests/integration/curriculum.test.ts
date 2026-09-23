import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../../src/app.js";
import { connectDatabase, disconnectDatabase } from "../../src/config/database.js";
import { seedCurriculum } from "../../src/seeds/seedCurriculum.js";
import { curriculumCache } from "../../src/modules/curriculum/curriculumCache.js";

describe("Curriculum API Integration Tests", () => {
  let mongod: MongoMemoryServer;
  const app = createApp();

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await connectDatabase(uri);
    // Seed initial dataset
    await seedCurriculum();
  });

  afterAll(async () => {
    await disconnectDatabase();
    if (mongod) await mongod.stop();
  });

  it("GET /api/v1/curriculum returns complete overview and phase metadata", async () => {
    const res = await request(app).get("/api/v1/curriculum");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalPhases).toBe(5);
    expect(res.body.data.totalDays).toBe(147);
    expect(res.body.data.totalTopics).toBe(813);
    expect(res.body.data.phases.length).toBe(5);
    expect(res.body.data.phases[0].phaseName).toBe("Foundation");
  });

  it("GET /api/v1/curriculum/phases returns phase summaries with projects and salary milestones", async () => {
    const res = await request(app).get("/api/v1/curriculum/phases");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(5);

    const phase1 = res.body.data[0];
    expect(phase1.phaseNumber).toBe(1);
    expect(phase1.salaryMeta).toBeDefined();
    expect(phase1.salaryMeta.roles.length).toBeGreaterThan(0);
    expect(phase1.projects.length).toBe(3);
  });

  it("GET /api/v1/curriculum/tree returns all 147 canonical day nodes with subtopics and resources", async () => {
    const res = await request(app).get("/api/v1/curriculum/tree");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.nodes.length).toBe(147);
    expect(res.body.data.nodes[0].canonicalDayId).toBe("p1-w1-d1");
    expect(res.body.data.nodes[0].subtopics.length).toBe(5);
  });

  it("GET /api/v1/curriculum/nodes/:canonicalId returns specific day node", async () => {
    const res = await request(app).get("/api/v1/curriculum/nodes/p1-w1-d1");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.canonicalDayId).toBe("p1-w1-d1");
    expect(res.body.data.title).toContain("Node.js Event Loop");
    expect(res.body.data.subtopics.length).toBe(5);
    expect(res.body.data.subtopics[0].topicId).toBe("p1-w1-d1-t1");
    expect(res.body.data.resources.length).toBeGreaterThan(0);
  });

  it("GET /api/v1/curriculum/nodes/:canonicalId returns 404 for nonexistent node", async () => {
    const res = await request(app).get("/api/v1/curriculum/nodes/p99-w99-d99");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("utilizes in-memory cache on repeat reads", async () => {
    // Clear cache
    curriculumCache.invalidateAll();
    expect(curriculumCache.size).toBe(0);

    // 1st request populates cache
    await request(app).get("/api/v1/curriculum");
    expect(curriculumCache.size).toBeGreaterThan(0);

    // 2nd request hits cache
    const res = await request(app).get("/api/v1/curriculum");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
