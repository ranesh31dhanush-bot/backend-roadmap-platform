import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const startOnboardingSchema = z.object({
  startDate: z
    .string()
    .regex(dateRegex, { message: "startDate must be formatted as YYYY-MM-DD" })
    .refine(
      (val) => {
        const d = new Date(val);
        if (isNaN(d.getTime())) return false;
        // Limit range: within past 1 year to future 1 year
        const now = new Date();
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        const oneYearFuture = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
        return d >= oneYearAgo && d <= oneYearFuture;
      },
      { message: "startDate must be a valid calendar date within 1 year of today" },
    ),
  targetRole: z
    .string()
    .min(2, { message: "targetRole must be at least 2 characters" })
    .max(100, { message: "targetRole cannot exceed 100 characters" })
    .optional()
    .default("Backend Engineer"),
});

export type StartOnboardingInput = z.infer<typeof startOnboardingSchema>;
