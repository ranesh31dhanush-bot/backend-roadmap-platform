/**
 * PROJ-001 Seed: 4 Capstone Project Specifications
 * Covers all 4 curriculum phases.
 * Run via: npx tsx src/seeds/capstoneProjects.seed.ts
 */
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { CapstoneProjectModel } from "../models/capstoneProject.model.js";
import { logger } from "../utils/logger.js";

const CAPSTONE_PROJECTS = [
  {
    canonicalId: "capstone-p1-url-shortener",
    title: "High-Performance URL Shortener Service",
    description:
      "Build a production-grade URL shortener with custom alias support, click analytics, TTL-based expiration, and rate limiting. Demonstrates mastery of REST API design, indexing strategies, caching fundamentals, and horizontal scaling patterns.",
    phase: 1,
    order: 1,
    difficulty: "intermediate" as const,
    techStack: ["Node.js", "Express", "MongoDB", "TypeScript", "Zod", "Jest"],
    objectives: [
      "Design a collision-resistant short-code generation algorithm (base62)",
      "Implement compound indexes for O(1) redirect lookups",
      "Add IP-based rate limiting without external cache dependencies",
      "Expose click-count analytics via aggregation pipeline",
      "Write a full integration test suite covering edge cases and concurrent writes",
      "Document API with OpenAPI 3.0 specification",
    ],
    architectureDiagram:
      "Client → POST /shorten → ShortenerService → MongoDB (short_urls collection) → Redirect (301/302) → ClickAnalyticsService (async).",
    performanceBenchmark:
      "Redirect P99 latency < 5ms at 10,000 req/s sustained on a single Node.js process with MongoDB Atlas M10.",
  },
  {
    canonicalId: "capstone-p2-task-queue",
    title: "Distributed Task Queue with Priority Scheduling",
    description:
      "Implement a MongoDB-backed task queue supporting multi-priority levels, worker concurrency control, job retries with exponential backoff, dead-letter queue, and a real-time status API. Demonstrates mastery of concurrency primitives, transactional operations, and fault-tolerant system design.",
    phase: 2,
    order: 2,
    difficulty: "advanced" as const,
    techStack: ["Node.js", "TypeScript", "MongoDB Transactions", "Express", "Vitest"],
    objectives: [
      "Implement atomic job claiming using MongoDB findOneAndUpdate with optimistic locking",
      "Support three priority levels (HIGH, NORMAL, LOW) with weighted fair queuing",
      "Build exponential backoff retry with configurable max attempts",
      "Implement dead-letter queue with reason capture for permanently failed jobs",
      "Create a /queue/stats endpoint showing backlog depth, throughput, and error rate",
      "Load-test to validate 500 jobs/sec ingestion with zero message loss",
    ],
    architectureDiagram:
      "Producer → POST /jobs → JobModel (MongoDB) → Worker Pool (N workers) → Claim → Execute → Complete/Retry → Dead-Letter Queue.",
    performanceBenchmark:
      "500 job/sec ingest sustained for 60s with < 0.01% duplicate processing under concurrent worker contention.",
  },
  {
    canonicalId: "capstone-p3-auth-platform",
    title: "Zero-Trust Authentication & Authorization Platform",
    description:
      "Build a complete authentication platform implementing JWT dual-token rotation, OAuth 2.0 PKCE flow, RBAC with resource-level scopes, account lockout, audit logging, and brute-force protection. Demonstrates mastery of identity systems, cryptographic security, and threat modeling.",
    phase: 3,
    order: 3,
    difficulty: "advanced" as const,
    techStack: [
      "Node.js",
      "TypeScript",
      "MongoDB",
      "Passport.js",
      "bcryptjs",
      "jsonwebtoken",
      "Zod",
    ],
    objectives: [
      "Implement httpOnly cookie-based access/refresh token rotation with reuse detection",
      "Build OAuth 2.0 Authorization Code flow with PKCE for Google and GitHub providers",
      "Design RBAC with role inheritance: guest < user < moderator < admin",
      "Add account lockout after 5 consecutive failed attempts with exponential unlock delays",
      "Implement comprehensive audit log capturing all auth events with IP and device fingerprint",
      "Write threat model document covering OWASP Top 10 mitigations",
    ],
    architectureDiagram:
      "Client → AuthService (token issuance) → SessionStore (MongoDB) → RBAC Middleware → Resource APIs → AuditLog (async).",
    performanceBenchmark:
      "Token verification middleware P95 < 1ms; login endpoint handles 1,000 concurrent auth requests without lockout false-positives.",
  },
  {
    canonicalId: "capstone-p4-realtime-collab",
    title: "Real-Time Collaborative API Gateway",
    description:
      "Build a real-time collaborative document editing backend using operational transformation (OT) principles, WebSocket-based presence tracking, conflict resolution, persistent change history, and a REST snapshot API. Demonstrates mastery of distributed state, event sourcing, and real-time architecture.",
    phase: 4,
    order: 4,
    difficulty: "expert" as const,
    techStack: [
      "Node.js",
      "TypeScript",
      "WebSockets (ws)",
      "MongoDB",
      "Event Sourcing",
      "Vitest",
    ],
    objectives: [
      "Implement operational transformation (OT) for concurrent text edits with convergence guarantees",
      "Build WebSocket room management with presence tracking (join/leave/typing indicators)",
      "Design event-sourced change log for full document history with point-in-time recovery",
      "Implement server-authoritative conflict resolution with client-side optimistic UI support",
      "Expose REST snapshot API for document export and versioned state retrieval",
      "Benchmark for 500 concurrent WebSocket connections with < 50ms operation propagation latency",
    ],
    architectureDiagram:
      "Client (WS) → Gateway → Room Manager → OT Engine → ChangeLog (MongoDB event_log) → Broadcast → All Room Participants.",
    performanceBenchmark:
      "500 concurrent WebSocket connections; operation propagation P99 < 50ms; zero divergence across 10,000 concurrent edit operations in chaos test.",
  },
];

export async function seedCapstoneProjects(): Promise<void> {
  let connection: typeof mongoose | null = null;
  try {
    connection = await mongoose.connect(env.MONGODB_URI);
    logger.info("Connected to MongoDB for capstone projects seed");

    let seeded = 0;
    let skipped = 0;

    for (const project of CAPSTONE_PROJECTS) {
      const existing = await CapstoneProjectModel.findOne({ canonicalId: project.canonicalId });
      if (existing) {
        // Update non-canonical fields in case specs have been refined
        await CapstoneProjectModel.updateOne(
          { canonicalId: project.canonicalId },
          {
            $set: {
              title: project.title,
              description: project.description,
              objectives: project.objectives,
              techStack: project.techStack,
              architectureDiagram: project.architectureDiagram,
              performanceBenchmark: project.performanceBenchmark,
            },
          },
        );
        skipped++;
        logger.info({ canonicalId: project.canonicalId }, "Capstone project upserted");
      } else {
        await CapstoneProjectModel.create(project);
        seeded++;
        logger.info({ canonicalId: project.canonicalId }, "Capstone project seeded");
      }
    }

    logger.info({ seeded, skipped }, "Capstone projects seed complete");
  } finally {
    if (connection) {
      await mongoose.disconnect();
    }
  }
}

// Allow running directly
const isMain = process.argv[1]?.endsWith("capstoneProjects.seed.ts") || process.argv[1]?.endsWith("capstoneProjects.seed.js");
if (isMain) {
  seedCapstoneProjects().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
}
