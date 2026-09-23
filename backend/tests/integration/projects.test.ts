import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../../src/app.js";
import { connectDatabase, disconnectDatabase } from "../../src/config/database.js";
import { CapstoneProjectModel } from "../../src/models/capstoneProject.model.js";

describe("Capstone Projects API — PROJ-001 Integration Tests", () => {
  let mongod: MongoMemoryServer;
  const app = createApp();

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await connectDatabase(mongod.getUri());

    // Seed 2 test capstone projects
    await CapstoneProjectModel.insertMany([
      {
        canonicalId: "capstone-p1-url-shortener",
        title: "High-Performance URL Shortener Service",
        description: "Build a production-grade URL shortener.",
        phase: 1,
        order: 1,
        difficulty: "intermediate",
        techStack: ["Node.js", "MongoDB"],
        objectives: ["Design base62 short-code algorithm", "Implement rate limiting"],
        architectureDiagram: "Client → POST /shorten → DB",
        performanceBenchmark: "P99 < 5ms at 10,000 req/s",
      },
      {
        canonicalId: "capstone-p2-task-queue",
        title: "Distributed Task Queue",
        description: "Implement a MongoDB-backed priority task queue.",
        phase: 2,
        order: 2,
        difficulty: "advanced",
        techStack: ["Node.js", "MongoDB Transactions"],
        objectives: ["Atomic job claiming", "Exponential backoff retry"],
      },
    ]);
  });

  afterAll(async () => {
    await disconnectDatabase();
    if (mongod) await mongod.stop();
  });

  it("GET /api/v1/projects returns 200 with all capstone projects", async () => {
    const res = await request(app).get("/api/v1/projects");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total).toBe(2);
    expect(res.body.data.projects).toHaveLength(2);
  });

  it("projects are sorted by display order ascending", async () => {
    const res = await request(app).get("/api/v1/projects");
    expect(res.status).toBe(200);
    const projects = res.body.data.projects;
    expect(projects[0].order).toBe(1);
    expect(projects[1].order).toBe(2);
  });

  it("each project includes required fields", async () => {
    const res = await request(app).get("/api/v1/projects");
    const project = res.body.data.projects[0];
    expect(project).toHaveProperty("id");
    expect(project).toHaveProperty("canonicalId");
    expect(project).toHaveProperty("title");
    expect(project).toHaveProperty("description");
    expect(project).toHaveProperty("phase");
    expect(project).toHaveProperty("difficulty");
    expect(project).toHaveProperty("techStack");
    expect(project).toHaveProperty("objectives");
    expect(Array.isArray(project.techStack)).toBe(true);
    expect(Array.isArray(project.objectives)).toBe(true);
  });

  it("phase 1 project has correct difficulty 'intermediate'", async () => {
    const res = await request(app).get("/api/v1/projects");
    const p1 = res.body.data.projects.find((p: { phase: number }) => p.phase === 1);
    expect(p1).toBeDefined();
    expect(p1.difficulty).toBe("intermediate");
    expect(p1.performanceBenchmark).toBeTruthy();
  });

  it("GET /api/v1/projects is a public endpoint — no authentication required", async () => {
    // No cookies, no Authorization header
    const res = await request(app).get("/api/v1/projects");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("response includes meta.requestId and meta.timestamp", async () => {
    const res = await request(app).get("/api/v1/projects");
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.requestId).toBeTruthy();
    expect(res.body.meta.timestamp).toBeTruthy();
  });
});
