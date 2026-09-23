import { z } from "zod";

export const canonicalDayIdRegex = /^p[1-5]-w[0-9]+-d[1-7]$/;

export const saveNoteSchema = z.object({
  content: z.string().max(50000, "Note content cannot exceed 50,000 characters"),
  version: z.number().int().min(0, "Version must be a non-negative integer"),
});

export const getNoteParamsSchema = z.object({
  dayId: z.string().regex(canonicalDayIdRegex, "Invalid canonical day ID format"),
});

export const searchNotesSchema = z.object({
  q: z.string().optional().default(""),
});

export type SaveNoteInput = z.infer<typeof saveNoteSchema>;
export type SearchNotesInput = z.infer<typeof searchNotesSchema>;
