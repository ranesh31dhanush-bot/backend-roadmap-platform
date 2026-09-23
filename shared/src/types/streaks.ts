export interface HabitMatrixDayDTO {
  dayIndex: number; // 1..21
  date: string; // YYYY-MM-DD
  isActive: boolean;
  status: "completed" | "missed" | "frozen" | "future";
}

export interface UserStreakDTO {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  freezeAvailable: boolean;
  freezeUsedAt: string | null;
  habitMatrix: HabitMatrixDayDTO[];
  totalActiveDays: number;
}

export interface RecordActivityRequestDTO {
  date?: string;
  timezone?: string;
}

export interface PomodoroSessionDTO {
  preset: "focus_25" | "break_5" | "long_break_15";
  durationSeconds: number;
  completedAt: string;
}
