export interface TopicProgressDTO {
  id?: string;
  userId: string;
  topicId: string; // e.g. "p1-w1-d1-t1"
  canonicalDayId: string; // e.g. "p1-w1-d1"
  phaseNumber: number;
  weekNumber: number;
  completedAt: string;
}

export interface ToggleProgressRequest {
  topicId: string; // e.g. "p1-w1-d1-t1"
  canonicalDayId: string; // e.g. "p1-w1-d1"
}

export interface DayProgressDTO {
  canonicalDayId: string;
  completedTopicIds: string[];
  completedCount: number;
  totalCount: number;
  percentage: number;
  isCompleted: boolean;
}

export interface PhaseProgressRollupDTO {
  phaseNumber: number;
  phaseName: string;
  completed: number;
  total: number;
  percentage: number;
}

export interface ToggleProgressResponse {
  topicId: string;
  isCompleted: boolean;
  dayCompleted: boolean;
  dayProgress: {
    completed: number;
    total: number;
    percentage: number;
  };
  globalProgress: {
    completed: number;
    total: number;
    percentage: number;
  };
}

export interface ProgressSummaryDTO {
  completedTopicIds: string[];
  totalCompleted: number;
  totalTopics: number;
  globalPercentage: number;
  phaseProgress: PhaseProgressRollupDTO[];
  dayCompletionStatus: Record<string, boolean>; // canonicalDayId -> boolean
}
