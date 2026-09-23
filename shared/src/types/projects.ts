// PROJ-001: Capstone Projects shared types

export interface CapstoneProjectDTO {
  id: string;
  canonicalId: string;
  title: string;
  description: string;
  phase: number;
  order: number;
  difficulty: "intermediate" | "advanced" | "expert";
  techStack: string[];
  objectives: string[];
  architectureDiagram?: string;
  performanceBenchmark?: string;
}

export interface CapstoneProjectListResponse {
  projects: CapstoneProjectDTO[];
  total: number;
}
