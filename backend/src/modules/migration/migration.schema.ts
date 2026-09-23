import { z } from "zod";

export const legacyQuizScoreItemSchema = z.object({
  score: z.number().min(0).max(100).optional(),
  total: z.number().min(1).max(100).optional(),
  pct: z.number().min(0).max(100),
  date: z.string().max(30).optional(),
});

export const legacyMigrationPayloadSchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format")
    .optional()
    .nullable(),
  done: z.record(z.string().max(50), z.boolean()).optional(),
  notes: z.record(z.string().max(50), z.string().max(50000)).optional(),
  qscores: z.record(z.string().max(100), legacyQuizScoreItemSchema).optional(),
  chatLinks: z.record(z.string().max(50), z.string().max(2000)).optional(),
  pdfLinks: z.record(z.string().max(50), z.string().max(2000)).optional(),
  pausedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Paused date must be in YYYY-MM-DD format")
    .optional()
    .nullable(),
  totalPauseDays: z.number().min(0).max(3650).optional().nullable(),
});

export type LegacyMigrationPayloadInput = z.infer<typeof legacyMigrationPayloadSchema>;
