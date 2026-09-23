import { CurriculumDayNodeDTO, ResourceLinkDTO, SubtopicDTO, ProjectMetaDTO, SalaryMetaDTO } from "./curriculum.js";
import { QuizTier } from "./quiz.js";

export interface AdminCurriculumNodeDTO extends CurriculumDayNodeDTO {
  id: string;
  status: "published" | "draft" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface AdminUpdateCurriculumNodeDTO {
  title?: string;
  description?: string;
  phaseName?: string;
  phaseColor?: string;
  weekTitle?: string;
  isRestDay?: boolean;
  skipDirectives?: string[];
  salaryMeta?: SalaryMetaDTO | null;
  projects?: ProjectMetaDTO[];
  subtopics?: SubtopicDTO[];
  resources?: ResourceLinkDTO[];
  quizBankKey?: string | null;
  status?: "published" | "draft" | "archived";
}

export interface AdminCreateCurriculumNodeDTO {
  version: string;
  canonicalDayId: string;
  phaseNumber: number;
  phaseName: string;
  phaseColor?: string;
  weekNumber: number;
  weekIndexInPhase?: number;
  weekTitle: string;
  dayNumberInWeek: number;
  globalDayNumber: number;
  isRestDay?: boolean;
  title: string;
  description?: string;
  skipDirectives?: string[];
  salaryMeta?: SalaryMetaDTO | null;
  projects?: ProjectMetaDTO[];
  subtopics?: SubtopicDTO[];
  resources?: ResourceLinkDTO[];
  quizBankKey?: string | null;
  status?: "published" | "draft" | "archived";
}

export interface CurriculumVersionSummaryDTO {
  version: string;
  status: "published" | "draft" | "archived";
  nodeCount: number;
  phaseCount: number;
  weekCount: number;
  totalTopics: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminDraftVersionRequestDTO {
  sourceVersion: string;
  newDraftVersion: string;
}

export interface AdminPublishVersionRequestDTO {
  version: string;
}

export interface AdminQuizQuestionDTO {
  id: string;
  quizBankId: string;
  canonicalId: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCreateQuizQuestionDTO {
  quizBankId: string;
  canonicalId: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  order?: number;
}

export interface AdminUpdateQuizQuestionDTO {
  questionText?: string;
  options?: string[];
  correctOptionIndex?: number;
  explanation?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  order?: number;
}

export interface AdminAuditLogDTO {
  id: string;
  adminUserId: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeState?: any;
  afterState?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AdminMetricsDTO {
  totalLearners: number;
  activeLearners: number;
  migratedLearners: number;
  curriculumVersionsCount: number;
  activeCurriculumVersion: string;
  totalCurriculumNodes: number;
  totalTopics: number;
  totalQuizBanks: number;
  totalQuizQuestions: number;
}
