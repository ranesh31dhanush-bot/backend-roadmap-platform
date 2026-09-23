import { z } from "zod";

const topicSlugRegex = /^p[1-5]-w\d+-d[1-7]-t\d+$/;
const daySlugRegex = /^p[1-5]-w\d+-d[1-7]$/;

export const toggleProgressSchema = z.object({
  topicId: z
    .string()
    .regex(topicSlugRegex, { message: "topicId must be a valid canonical topic slug (e.g. p1-w1-d1-t1)" }),
  canonicalDayId: z
    .string()
    .regex(daySlugRegex, { message: "canonicalDayId must be a valid canonical day slug (e.g. p1-w1-d1)" }),
});

export type ToggleProgressInput = z.infer<typeof toggleProgressSchema>;
