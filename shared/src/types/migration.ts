export interface LegacyQuizScoreItemDTO {
  score?: number;
  total?: number;
  pct: number;
  date?: string;
}

export interface LegacyMigrationPayloadDTO {
  startDate?: string | null;
  done?: Record<string, boolean>; // e.g. "s::1::0::0": true
  notes?: Record<string, string>; // e.g. "2026-09-01": "Note content..."
  qscores?: Record<string, LegacyQuizScoreItemDTO>; // e.g. "daily::Node.js Event Loop": { ... }
  chatLinks?: Record<string, string>; // e.g. "2026-09-01": "https://chatgpt.com/..."
  pdfLinks?: Record<string, string>; // e.g. "2026-09-01": "https://drive.google.com/..."
  pausedAt?: string | null;
  totalPauseDays?: number | null;
}

export interface MigrationImportResultDTO {
  status: "COMPLETED";
  migratedAt: string;
  importedTopics: number;
  importedNotes: number;
  importedLinks: number;
  importedQuizzes: number;
  scheduleSet: boolean;
  skippedItems: string[];
}

export interface MigrationStatusDTO {
  isMigrated: boolean;
  migratedAt: string | null;
  stats?: {
    importedTopics: number;
    importedNotes: number;
    importedLinks: number;
    importedQuizzes: number;
  };
}
