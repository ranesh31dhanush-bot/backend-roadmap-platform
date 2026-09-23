import { CurriculumNodeModel, ICurriculumNode } from "../../models/curriculumNode.model.js";
import {
  CurriculumDayNodeDTO,
  CurriculumOverviewDTO,
  CurriculumTreeDTO,
  PhaseOverviewDTO,
} from "@top1/shared";
import { curriculumCache } from "./curriculumCache.js";
import { AppError } from "../../utils/appError.js";
import { logger } from "../../utils/logger.js";

function toDayNodeDTO(doc: ICurriculumNode): CurriculumDayNodeDTO {
  return {
    id: doc._id.toString(),
    version: doc.version,
    canonicalDayId: doc.canonicalDayId,
    phaseNumber: doc.phaseNumber,
    phaseName: doc.phaseName,
    phaseColor: doc.phaseColor,
    weekNumber: doc.weekNumber,
    weekIndexInPhase: doc.weekIndexInPhase,
    weekTitle: doc.weekTitle,
    dayNumberInWeek: doc.dayNumberInWeek,
    globalDayNumber: doc.globalDayNumber,
    isRestDay: doc.isRestDay,
    title: doc.title,
    description: doc.description,
    skipDirectives: doc.skipDirectives || [],
    salaryMeta: doc.salaryMeta || null,
    projects: doc.projects || [],
    subtopics: (doc.subtopics || []).map((s) => ({
      topicId: s.topicId,
      text: s.text,
    })),
    resources: (doc.resources || []).map((r) => ({
      type: r.type,
      title: r.title,
      url: r.url,
    })),
    quizBankKey: doc.quizBankKey || null,
  };
}

export class CurriculumService {
  /**
   * Get full curriculum tree for a published version (In-memory cached)
   */
  async getCurriculumTree(version = "1.0.0"): Promise<CurriculumTreeDTO> {
    const cacheKey = `tree:${version}`;
    const cached = curriculumCache.get<CurriculumTreeDTO>(cacheKey);
    if (cached) {
      return cached;
    }

    const docs = await CurriculumNodeModel.find({
      version,
      status: "published",
    }).sort({ globalDayNumber: 1 });

    const nodes = docs.map(toDayNodeDTO);

    const tree: CurriculumTreeDTO = {
      version,
      status: "published",
      nodes,
    };

    curriculumCache.set(cacheKey, tree);
    logger.debug({ version, nodesCount: nodes.length }, "Curriculum tree fetched and cached");
    return tree;
  }

  /**
   * Get high-level overview of phases and weeks (In-memory cached)
   */
  async getCurriculumOverview(version = "1.0.0"): Promise<CurriculumOverviewDTO> {
    const cacheKey = `overview:${version}`;
    const cached = curriculumCache.get<CurriculumOverviewDTO>(cacheKey);
    if (cached) {
      return cached;
    }

    const tree = await this.getCurriculumTree(version);
    const phaseMap = new Map<number, PhaseOverviewDTO>();
    const weekMap = new Map<string, { weekNumber: number; weekTitle: string; dayCount: number; topicCount: number }>();

    let totalTopics = 0;

    tree.nodes.forEach((node) => {
      const pNum = node.phaseNumber;
      if (!phaseMap.has(pNum)) {
        phaseMap.set(pNum, {
          phaseNumber: pNum,
          phaseName: node.phaseName,
          phaseColor: node.phaseColor,
          totalWeeks: 0,
          totalDays: 0,
          totalTopics: 0,
          salaryMeta: node.salaryMeta,
          projects: node.projects,
          weeks: [],
        });
      }

      const pEntry = phaseMap.get(pNum)!;
      pEntry.totalDays += 1;
      const subtopicsCount = node.subtopics ? node.subtopics.length : 0;
      pEntry.totalTopics += subtopicsCount;
      totalTopics += subtopicsCount;

      const weekKey = `${pNum}-${node.weekNumber}`;
      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, {
          weekNumber: node.weekNumber,
          weekTitle: node.weekTitle,
          dayCount: 0,
          topicCount: 0,
        });
      }
      const wEntry = weekMap.get(weekKey)!;
      wEntry.dayCount += 1;
      wEntry.topicCount += subtopicsCount;
    });

    // Assemble weeks into phase entries
    tree.nodes.forEach((node) => {
      const pNum = node.phaseNumber;
      const weekKey = `${pNum}-${node.weekNumber}`;
      const pEntry = phaseMap.get(pNum)!;
      const wEntry = weekMap.get(weekKey);
      if (wEntry && !pEntry.weeks.some((w) => w.weekNumber === wEntry.weekNumber)) {
        pEntry.weeks.push(wEntry);
        pEntry.totalWeeks = pEntry.weeks.length;
      }
    });

    const phases = Array.from(phaseMap.values()).sort((a, b) => a.phaseNumber - b.phaseNumber);

    const overview: CurriculumOverviewDTO = {
      version,
      totalPhases: phases.length,
      totalWeeks: weekMap.size,
      totalDays: tree.nodes.length,
      totalTopics,
      phases,
    };

    curriculumCache.set(cacheKey, overview);
    return overview;
  }

  /**
   * Get single node by canonical day ID (In-memory cached)
   */
  async getNodeByCanonicalId(canonicalDayId: string, version = "1.0.0"): Promise<CurriculumDayNodeDTO> {
    const cacheKey = `node:${version}:${canonicalDayId}`;
    const cached = curriculumCache.get<CurriculumDayNodeDTO>(cacheKey);
    if (cached) {
      return cached;
    }

    const doc = await CurriculumNodeModel.findOne({
      version,
      canonicalDayId,
      status: "published",
    });

    if (!doc) {
      throw AppError.notFound(`Curriculum node '${canonicalDayId}' not found in version ${version}`);
    }

    const dto = toDayNodeDTO(doc);
    curriculumCache.set(cacheKey, dto);
    return dto;
  }

  /**
   * Invalidate cache for a curriculum version
   */
  invalidateCache(version?: string): void {
    if (version) {
      curriculumCache.invalidate(`tree:${version}`);
      curriculumCache.invalidate(`overview:${version}`);
      curriculumCache.invalidate(`node:${version}`);
    } else {
      curriculumCache.invalidateAll();
    }
  }
}

export const curriculumService = new CurriculumService();
