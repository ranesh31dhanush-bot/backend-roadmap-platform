import { z } from "zod";
import { canonicalDayIdRegex } from "../notes/notes.schema.js";

const safeUrlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

export const createLinkSchema = z.object({
  canonicalDayId: z.string().regex(canonicalDayIdRegex, "Invalid canonical day ID format"),
  title: z.string().min(1, "Title cannot be empty").max(120, "Title cannot exceed 120 characters"),
  url: z
    .string()
    .min(1, "URL cannot be empty")
    .max(2000, "URL cannot exceed 2000 characters")
    .refine((val) => {
      const lower = val.trim().toLowerCase();
      // Block dangerous schemes
      if (
        lower.startsWith("javascript:") ||
        lower.startsWith("data:") ||
        lower.startsWith("vbscript:") ||
        lower.startsWith("file:")
      ) {
        return false;
      }
      return safeUrlRegex.test(val.trim());
    }, {
      message: "URL must be a valid http:// or https:// address",
    }),
  linkType: z.enum(["CHATGPT", "PDF_NOTES", "REPO", "DOC", "OTHER"]).default("OTHER"),
});

export const getLinksParamsSchema = z.object({
  dayId: z.string().regex(canonicalDayIdRegex, "Invalid canonical day ID format"),
});

export const deleteLinkParamsSchema = z.object({
  id: z.string().min(1, "Link ID is required"),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
