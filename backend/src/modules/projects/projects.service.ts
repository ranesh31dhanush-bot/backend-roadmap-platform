import { CapstoneProjectModel, ICapstoneProject } from "../../models/capstoneProject.model.js";
import { CapstoneProjectDTO, CapstoneProjectListResponse } from "@top1/shared";
import { logger } from "../../utils/logger.js";

function toDTO(doc: ICapstoneProject): CapstoneProjectDTO {
  return {
    id: doc._id.toString(),
    canonicalId: doc.canonicalId,
    title: doc.title,
    description: doc.description,
    phase: doc.phase,
    order: doc.order,
    difficulty: doc.difficulty,
    techStack: doc.techStack,
    objectives: doc.objectives,
    architectureDiagram: doc.architectureDiagram,
    performanceBenchmark: doc.performanceBenchmark,
  };
}

export class ProjectsService {
  /**
   * Return all capstone project specifications sorted by display order.
   */
  async getAllProjects(): Promise<CapstoneProjectListResponse> {
    const docs = await CapstoneProjectModel.find({}).sort({ order: 1 }).lean<ICapstoneProject[]>();
    logger.debug({ count: docs.length }, "Fetched capstone projects");
    return {
      projects: docs.map(toDTO),
      total: docs.length,
    };
  }
}

export const projectsService = new ProjectsService();
