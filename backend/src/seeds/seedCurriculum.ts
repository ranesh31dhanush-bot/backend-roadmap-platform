import fs from "fs";
import path from "path";
import { CurriculumNodeModel } from "../models/curriculumNode.model.js";
import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { logger } from "../utils/logger.js";

export interface SeedValidationResult {
  valid: boolean;
  errors: string[];
  totalNodes: number;
  uniqueCanonicalIds: number;
  totalTopics: number;
  totalResources: number;
  phases: number;
  weeks: number;
  days: number;
}

export function validateCurriculumData(nodes: any[]): SeedValidationResult {
  const errors: string[] = [];
  const canonicalIdSet = new Set<string>();
  const topicIdSet = new Set<string>();
  const phaseSet = new Set<number>();
  const weekSet = new Set<string>();

  let totalTopics = 0;
  let totalResources = 0;

  nodes.forEach((node, index) => {
    // Check required fields
    if (!node.canonicalDayId || typeof node.canonicalDayId !== "string") {
      errors.push(`Node at index ${index} missing valid canonicalDayId`);
      return;
    }
    if (!node.version || typeof node.version !== "string") {
      errors.push(`Node ${node.canonicalDayId} missing version`);
    }
    if (typeof node.phaseNumber !== "number" || node.phaseNumber < 1 || node.phaseNumber > 5) {
      errors.push(`Node ${node.canonicalDayId} has invalid phaseNumber: ${node.phaseNumber}`);
    }
    if (!node.phaseName) {
      errors.push(`Node ${node.canonicalDayId} missing phaseName`);
    }
    if (typeof node.weekNumber !== "number") {
      errors.push(`Node ${node.canonicalDayId} has invalid weekNumber`);
    }
    if (!node.title) {
      errors.push(`Node ${node.canonicalDayId} missing title`);
    }

    // Uniqueness check for canonicalDayId
    if (canonicalIdSet.has(node.canonicalDayId)) {
      errors.push(`Duplicate canonicalDayId found: ${node.canonicalDayId}`);
    }
    canonicalIdSet.add(node.canonicalDayId);

    // Format validation: pX-wY-dZ
    const slugRegex = /^p[1-5]-w\d+-d[1-7]$/;
    if (!slugRegex.test(node.canonicalDayId)) {
      errors.push(`Invalid canonical slug format for day node: ${node.canonicalDayId}`);
    }

    phaseSet.add(node.phaseNumber);
    weekSet.add(`p${node.phaseNumber}-w${node.weekNumber}`);

    // Subtopics validation
    if (Array.isArray(node.subtopics)) {
      node.subtopics.forEach((st: any, stIdx: number) => {
        totalTopics++;
        if (!st.topicId || !st.text) {
          errors.push(`Node ${node.canonicalDayId} subtopic ${stIdx} missing topicId or text`);
        } else {
          if (topicIdSet.has(st.topicId)) {
            errors.push(`Duplicate topicId found: ${st.topicId}`);
          }
          topicIdSet.add(st.topicId);
          // Format validation: pX-wY-dZ-tN
          const topicSlugRegex = /^p[1-5]-w\d+-d[1-7]-t\d+$/;
          if (!topicSlugRegex.test(st.topicId)) {
            errors.push(`Invalid topic slug format: ${st.topicId}`);
          }
          if (!st.topicId.startsWith(node.canonicalDayId)) {
            errors.push(`Topic ${st.topicId} does not match parent day slug ${node.canonicalDayId}`);
          }
        }
      });
    }

    // Resources count
    if (Array.isArray(node.resources)) {
      totalResources += node.resources.length;
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    totalNodes: nodes.length,
    uniqueCanonicalIds: canonicalIdSet.size,
    totalTopics,
    totalResources,
    phases: phaseSet.size,
    weeks: weekSet.size,
    days: canonicalIdSet.size,
  };
}

export async function seedCurriculum(customNodes?: any[]): Promise<{
  success: boolean;
  insertedCount: number;
  matchedCount: number;
  stats: SeedValidationResult;
}> {
  let nodes = customNodes;

  if (!nodes) {
    const candidatePaths = [
      path.resolve(process.cwd(), "src/seeds/curriculum_canonical_v1.json"),
      path.resolve(process.cwd(), "backend/src/seeds/curriculum_canonical_v1.json"),
      path.resolve(__dirname || "", "curriculum_canonical_v1.json"),
    ];

    let foundPath: string | null = null;
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }

    if (!foundPath) {
      throw new Error(`Curriculum seed JSON not found in any candidate path: ${candidatePaths.join(", ")}`);
    }

    const rawData = fs.readFileSync(foundPath, "utf8");
    nodes = JSON.parse(rawData);
  }

  // 1. Validation
  const validation = validateCurriculumData(nodes!);
  if (!validation.valid) {
    logger.error({ errors: validation.errors }, "Curriculum seed validation failed!");
    throw new Error(`Curriculum validation failed with ${validation.errors.length} errors: ${validation.errors.slice(0, 5).join("; ")}`);
  }

  logger.info(
    {
      version: "1.0.0",
      phases: validation.phases,
      weeks: validation.weeks,
      days: validation.days,
      topics: validation.totalTopics,
      resources: validation.totalResources,
    },
    "Curriculum validation PASS. Starting idempotent bulk write...",
  );

  // 2. Idempotent bulk write
  const operations = nodes!.map((node: any) => ({
    updateOne: {
      filter: { version: node.version, canonicalDayId: node.canonicalDayId },
      update: { $set: node },
      upsert: true,
    },
  }));

  const bulkResult = await CurriculumNodeModel.bulkWrite(operations, { ordered: false });

  logger.info(
    {
      upsertedCount: bulkResult.upsertedCount,
      modifiedCount: bulkResult.modifiedCount,
      matchedCount: bulkResult.matchedCount,
    },
    "Curriculum seeding completed successfully.",
  );

  return {
    success: true,
    insertedCount: bulkResult.upsertedCount,
    matchedCount: bulkResult.matchedCount,
    stats: validation,
  };
}

// Standalone execution entrypoint
if (process.argv[1] && (process.argv[1].includes("seedCurriculum.ts") || process.argv[1].includes("seedCurriculum.js"))) {
  (async () => {
    try {
      await connectDatabase();
      const result = await seedCurriculum();

      console.log("\n==================================================");
      console.log("             CURRICULUM SEED REPORT               ");
      console.log("==================================================");
      console.log(`Version:             1.0.0`);
      console.log(`Phases:              ${result.stats.phases}`);
      console.log(`Weeks:               ${result.stats.weeks}`);
      console.log(`Days:                ${result.stats.days}`);
      console.log(`Topics/Subtopics:    ${result.stats.totalTopics}`);
      console.log(`Resource Links:      ${result.stats.totalResources}`);
      console.log(`--------------------------------------------------`);
      console.log(`Upserted (New):      ${result.insertedCount}`);
      console.log(`Matched (Existing):  ${result.matchedCount}`);
      console.log(`Validation:          PASS`);
      console.log(`Duplicate IDs:       0`);
      console.log(`Orphan Nodes:        0`);
      console.log(`Status:              SUCCESS`);
      console.log("==================================================\n");

      await disconnectDatabase();
      process.exit(0);
    } catch (err) {
      console.error("Curriculum seeding failed:", err);
      await disconnectDatabase().catch(() => {});
      process.exit(1);
    }
  })();
}
