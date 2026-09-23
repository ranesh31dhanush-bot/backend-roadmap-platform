import { z } from "zod";

export const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const recordActivitySchema = z.object({
  date: z.string().regex(dateRegex, "Date must be formatted as YYYY-MM-DD").optional(),
  timezone: z.string().optional(),
});

export const consumeFreezeSchema = z.object({
  date: z.string().regex(dateRegex, "Date must be formatted as YYYY-MM-DD").optional(),
});

export type RecordActivityInput = z.infer<typeof recordActivitySchema>;
