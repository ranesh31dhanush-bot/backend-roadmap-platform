import { z } from "zod";

export const resourceLinkSchema = z.object({
  type: z.string().default("article"),
  title: z.string().min(1, "Resource title is required").max(300),
  url: z
    .string()
    .url("Resource URL must be a valid URL")
    .refine((u) => u.startsWith("http://") || u.startsWith("https://"), {
      message: "Resource URL must use http:// or https:// protocol",
    }),
});

export const subtopicItemSchema = z.object({
  topicId: z.string().min(1, "topicId is required"),
  text: z.string().min(1, "Subtopic text is required").max(500),
});

export const projectMetaSchema = z.object({
  name: z.string().min(1).max(200),
  desc: z.string().max(1000),
  tags: z.array(z.string()).default([]),
});

export const salaryMetaSchema = z.object({
  min: z.string().default(""),
  mid: z.string().default(""),
  max: z.string().default(""),
  roles: z.array(z.string()).default([]),
  note: z.string().default(""),
});

export const updateCurriculumNodeSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(5000).optional(),
  phaseName: z.string().min(1).max(100).optional(),
  phaseColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color").optional(),
  weekTitle: z.string().min(1).max(200).optional(),
  isRestDay: z.boolean().optional(),
  skipDirectives: z.array(z.string()).optional(),
  salaryMeta: salaryMetaSchema.nullable().optional(),
  projects: z.array(projectMetaSchema).optional(),
  subtopics: z.array(subtopicItemSchema).optional(),
  resources: z.array(resourceLinkSchema).optional(),
  quizBankKey: z.string().nullable().optional(),
  status: z.enum(["published", "draft", "archived"]).optional(),
});

export const createCurriculumNodeSchema = z.object({
  version: z.string().min(1, "Curriculum version is required"),
  canonicalDayId: z
    .string()
    .regex(/^p[1-5]-w\d+-d[1-7]$/, "canonicalDayId must match p{P}-w{W}-d{D}"),
  phaseNumber: z.number().int().min(1).max(5),
  phaseName: z.string().min(1).max(100),
  phaseColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#00e676"),
  weekNumber: z.number().int().min(1).max(52),
  weekIndexInPhase: z.number().int().min(1).default(1),
  weekTitle: z.string().min(1).max(200),
  dayNumberInWeek: z.number().int().min(1).max(7),
  globalDayNumber: z.number().int().min(1).max(365),
  isRestDay: z.boolean().default(false),
  title: z.string().min(1, "Title is required").max(300),
  description: z.string().max(5000).default(""),
  skipDirectives: z.array(z.string()).default([]),
  salaryMeta: salaryMetaSchema.nullable().default(null),
  projects: z.array(projectMetaSchema).default([]),
  subtopics: z.array(subtopicItemSchema).default([]),
  resources: z.array(resourceLinkSchema).default([]),
  quizBankKey: z.string().nullable().default(null),
  status: z.enum(["published", "draft", "archived"]).default("draft"),
});

export const draftVersionRequestSchema = z.object({
  sourceVersion: z.string().min(1, "Source version is required"),
  newDraftVersion: z
    .string()
    .regex(
      /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/,
      "Version must follow semantic versioning format (e.g. 1.1.0 or 1.1.0-draft)",
    ),
});

export const publishVersionRequestSchema = z.object({
  version: z.string().min(1, "Version to publish is required"),
});

export const createQuizQuestionSchema = z.object({
  canonicalId: z.string().min(1, "canonicalId is required").optional(),
  questionText: z.string().min(5, "Question text must be at least 5 characters").max(2000),
  options: z
    .array(z.string().min(1, "Option text cannot be empty"))
    .min(2, "Question must have at least 2 options")
    .max(6, "Question cannot exceed 6 options"),
  correctOptionIndex: z.number().int().min(0),
  explanation: z.string().min(5, "Explanation must be at least 5 characters").max(5000),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
  order: z.number().int().min(1).optional(),
});

export const updateQuizQuestionSchema = z.object({
  questionText: z.string().min(5).max(2000).optional(),
  options: z
    .array(z.string().min(1))
    .min(2)
    .max(6)
    .optional(),
  correctOptionIndex: z.number().int().min(0).optional(),
  explanation: z.string().min(5).max(5000).optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  order: z.number().int().min(1).optional(),
});

// Types
export type UpdateCurriculumNodeInput = z.infer<typeof updateCurriculumNodeSchema>;
export type CreateCurriculumNodeInput = z.infer<typeof createCurriculumNodeSchema>;
export type DraftVersionInput = z.infer<typeof draftVersionRequestSchema>;
export type PublishVersionInput = z.infer<typeof publishVersionRequestSchema>;
export type CreateQuizQuestionInput = z.infer<typeof createQuizQuestionSchema>;
export type UpdateQuizQuestionInput = z.infer<typeof updateQuizQuestionSchema>;
