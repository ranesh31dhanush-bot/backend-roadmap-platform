export interface ResourceLinkDTO {
  type: "article" | "doc" | "video" | "yt" | "github" | "paper" | "rfc" | string;
  title: string;
  url: string;
}

export interface SubtopicDTO {
  topicId: string; // e.g. "p1-w1-d1-t1"
  text: string;
}

export interface ProjectMetaDTO {
  name: string;
  desc: string;
  tags?: string[];
}

export interface SalaryMetaDTO {
  min: string;
  mid: string;
  max: string;
  roles: string[];
  note: string;
}

export interface CurriculumDayNodeDTO {
  id?: string;
  version: string;
  canonicalDayId: string; // e.g. "p1-w1-d1"
  phaseNumber: number; // 1..5
  phaseName: string;
  phaseColor: string;
  weekNumber: number;
  weekIndexInPhase: number;
  weekTitle: string;
  dayNumberInWeek: number; // 1..7
  globalDayNumber: number; // 1..147
  isRestDay: boolean;
  title: string;
  description: string;
  skipDirectives: string[];
  salaryMeta: SalaryMetaDTO | null;
  projects: ProjectMetaDTO[];
  subtopics: SubtopicDTO[];
  resources: ResourceLinkDTO[];
  quizBankKey: string | null;
}

export interface PhaseOverviewDTO {
  phaseNumber: number;
  phaseName: string;
  phaseColor: string;
  totalWeeks: number;
  totalDays: number;
  totalTopics: number;
  salaryMeta: SalaryMetaDTO | null;
  projects: ProjectMetaDTO[];
  weeks: Array<{
    weekNumber: number;
    weekTitle: string;
    dayCount: number;
    topicCount: number;
  }>;
}

export interface CurriculumOverviewDTO {
  version: string;
  totalPhases: number;
  totalWeeks: number;
  totalDays: number;
  totalTopics: number;
  phases: PhaseOverviewDTO[];
}

export interface CurriculumTreeDTO {
  version: string;
  status: "draft" | "published" | "archived";
  publishedAt?: string;
  nodes: CurriculumDayNodeDTO[];
}
