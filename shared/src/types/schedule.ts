import { CurriculumDayNodeDTO, ProjectMetaDTO, SalaryMetaDTO } from "./curriculum.js";

export type ScheduleStatus = "active" | "paused" | "completed";

export interface UserScheduleDTO {
  id?: string;
  userId: string;
  startDate: string; // "YYYY-MM-DD"
  curDate: string; // "YYYY-MM-DD"
  curPhase: number;
  targetRole?: string;
  isPaused: boolean;
  status: ScheduleStatus;
  pausedAt: string | null;
  totalPauseDays: number;
  projectedCompletionDate: string; // "YYYY-MM-DD"
  currentDayCanonicalId: string;
}

export interface ScheduleDetailsDTO {
  startDate: string; // "YYYY-MM-DD"
  curDate: string; // "YYYY-MM-DD"
  curPhase: number;
  isPaused: boolean;
  pausedAt: string | null;
  totalPauseDays: number;
  projectedEndDate: string; // "YYYY-MM-DD"
  daysRemaining: number;
  currentDayCanonicalId: string;
  targetRole: string;
}

export interface DayProjectionDTO {
  canonicalId: string;
  dayNumber: number;
  projectedDate: string; // "YYYY-MM-DD"
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
}

export interface StartOnboardingRequest {
  startDate: string; // "YYYY-MM-DD"
  targetRole?: string;
}

export interface StartOnboardingResponse {
  schedule: UserScheduleDTO;
  isOnboarded: boolean;
}

export interface OnboardingStatusResponse {
  isOnboarded: boolean;
  schedule: UserScheduleDTO | null;
}

export interface RescheduleRequest {
  newStartDate: string; // "YYYY-MM-DD"
}

export interface RescheduleResponse {
  schedule: ScheduleDetailsDTO;
}

export interface PauseCourseResponse {
  isPaused: boolean;
  pausedAt: string;
}

export interface ResumeCourseResponse {
  isPaused: boolean;
  daysPaused: number;
  newStartDate: string;
  newEndDate: string;
}

export interface RoadmapDayDTO extends CurriculumDayNodeDTO {
  projectedDate: string; // "YYYY-MM-DD"
  isCurrentDay: boolean;
  isPast: boolean;
  isFuture: boolean;
}

export interface LearnerRoadmapWeekDTO {
  weekNumber: number;
  weekTitle: string;
  days: RoadmapDayDTO[];
}

export interface LearnerRoadmapPhaseDTO {
  phaseNumber: number;
  phaseName: string;
  phaseColor: string;
  totalWeeks: number;
  totalDays: number;
  totalTopics: number;
  salaryMeta: SalaryMetaDTO | null;
  projects: ProjectMetaDTO[];
  weeks: LearnerRoadmapWeekDTO[];
}

export interface LearnerRoadmapResponse {
  version: string;
  schedule: ScheduleDetailsDTO;
  phases: LearnerRoadmapPhaseDTO[];
}
