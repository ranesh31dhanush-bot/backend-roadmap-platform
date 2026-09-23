// ANLT-001 / ANLT-002: Telemetry & Velocity Analytics shared types

export type TelemetryEventType =
  | "topic_completed"
  | "topic_uncompleted"
  | "day_completed"
  | "quiz_started"
  | "quiz_completed"
  | "pomodoro_completed"
  | "streak_extended"
  | "page_viewed"
  | "note_saved";

export interface TelemetryEventPayload {
  eventType: TelemetryEventType;
  resourceId?: string; // topicId, canonicalDayId, quizAttemptId, etc.
  metadata?: Record<string, unknown>;
}

export interface VelocityStatsDTO {
  topicsCompleted: number;
  totalTopics: number;
  globalPercentage: number;
  currentStreak: number;
  longestStreak: number;
  avgTopicsPerDay: number;
  estimatedDaysRemaining: number | null;
  projectedCompletionDate: string | null; // "YYYY-MM-DD"
  startDate: string | null; // "YYYY-MM-DD"
  daysSinceStart: number;
}
