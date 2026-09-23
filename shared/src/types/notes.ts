export interface DayNoteDTO {
  id?: string;
  dayCanonicalId: string;
  canonicalDayId?: string;
  content: string;
  version: number;
  wordCount: number;
  updatedAt: string;
  createdAt?: string;
}

export interface SaveNoteRequestDTO {
  content: string;
  version: number;
}

export interface SaveNoteResponseDTO {
  saved: boolean;
  dayCanonicalId: string;
  canonicalDayId?: string;
  content: string;
  version: number;
  wordCount: number;
  updatedAt: string;
}

export type CustomLinkType = "CHATGPT" | "PDF_NOTES" | "REPO" | "DOC" | "OTHER";

export interface UserLinkDTO {
  id: string;
  dayCanonicalId: string;
  canonicalDayId?: string;
  title: string;
  url: string;
  linkType: CustomLinkType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLinkRequestDTO {
  canonicalDayId: string;
  dayCanonicalId?: string;
  title: string;
  url: string;
  linkType: CustomLinkType;
}

export interface NoteSearchResultDTO {
  id: string;
  dayCanonicalId: string;
  canonicalDayId?: string;
  contentSnippet: string;
  wordCount: number;
  updatedAt: string;
}

export interface NotesListResponseDTO {
  notes: DayNoteDTO[];
  total: number;
}
