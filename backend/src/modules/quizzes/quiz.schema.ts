import { z } from "zod";

export const startQuizSchema = z.object({
  quizBankIdOrCanonicalId: z.string().min(1, "Quiz identifier is required"),
});

export const quizSubmissionAnswerSchema = z.object({
  questionId: z.string().min(1, "questionId is required"),
  selectedOptionIndex: z.number().int().min(0).max(10),
});

export const submitQuizSchema = z.object({
  attemptId: z.string().min(1, "attemptId is required"),
  answers: z.array(quizSubmissionAnswerSchema).min(1, "At least one answer is required"),
  timeSpentSeconds: z.number().int().min(0).optional(),
});

export type StartQuizInput = z.infer<typeof startQuizSchema>;
export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
