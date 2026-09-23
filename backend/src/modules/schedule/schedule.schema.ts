import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const rescheduleSchema = z.object({
  newStartDate: z
    .string()
    .regex(dateRegex, { message: "newStartDate must be formatted as YYYY-MM-DD" })
    .refine(
      (val) => {
        const d = new Date(val);
        if (isNaN(d.getTime())) return false;
        const now = new Date();
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        const oneYearFuture = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
        return d >= oneYearAgo && d <= oneYearFuture;
      },
      { message: "newStartDate must be a valid calendar date within 1 year of today" },
    ),
});

export type RescheduleInput = z.infer<typeof rescheduleSchema>;
