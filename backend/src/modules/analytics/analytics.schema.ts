import { z } from "zod";

const TELEMETRY_EVENT_TYPES = [
  "topic_completed",
  "topic_uncompleted",
  "day_completed",
  "quiz_started",
  "quiz_completed",
  "pomodoro_completed",
  "streak_extended",
  "page_viewed",
  "note_saved",
] as const;

export const ingestEventSchema = z.object({
  eventType: z.enum(TELEMETRY_EVENT_TYPES, {
    errorMap: () => ({ message: `eventType must be one of: ${TELEMETRY_EVENT_TYPES.join(", ")}` }),
  }),
  resourceId: z.string().trim().max(128).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type IngestEventInput = z.infer<typeof ingestEventSchema>;
