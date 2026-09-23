import { fetchApi } from "./client";
import {
  DayNoteDTO,
  SaveNoteResponseDTO,
  UserLinkDTO,
  CreateLinkRequestDTO,
  NotesListResponseDTO,
} from "@top1/shared";

export async function fetchDayNote(canonicalDayId: string): Promise<DayNoteDTO> {
  return fetchApi<DayNoteDTO>(`/notes/${canonicalDayId}`);
}

export async function saveDayNote(
  canonicalDayId: string,
  content: string,
  version: number,
): Promise<SaveNoteResponseDTO> {
  return fetchApi<SaveNoteResponseDTO>(`/notes/${canonicalDayId}`, {
    method: "PUT",
    body: JSON.stringify({ content, version }),
  });
}

export async function fetchDayLinks(canonicalDayId: string): Promise<UserLinkDTO[]> {
  return fetchApi<UserLinkDTO[]>(`/links/${canonicalDayId}`);
}

export async function createDayLink(data: CreateLinkRequestDTO): Promise<UserLinkDTO> {
  return fetchApi<UserLinkDTO>("/links", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteDayLink(linkId: string): Promise<{ deleted: boolean }> {
  return fetchApi<{ deleted: boolean }>(`/links/${linkId}`, {
    method: "DELETE",
  });
}

export async function searchNotes(query: string = ""): Promise<NotesListResponseDTO> {
  const param = query ? `?q=${encodeURIComponent(query)}` : "";
  return fetchApi<NotesListResponseDTO>(`/notes${param}`);
}
