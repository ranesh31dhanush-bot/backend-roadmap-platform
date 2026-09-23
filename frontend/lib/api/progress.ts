import { fetchApi } from "./client";
import {
  ToggleProgressResponse,
  DayProgressDTO,
  ProgressSummaryDTO,
} from "@top1/shared";

export async function toggleTopicProgress(
  topicId: string,
  canonicalDayId: string,
): Promise<ToggleProgressResponse> {
  return fetchApi<ToggleProgressResponse>("/progress/toggle", {
    method: "POST",
    body: JSON.stringify({ topicId, canonicalDayId }),
  });
}

export async function fetchDayProgress(canonicalDayId: string): Promise<DayProgressDTO> {
  return fetchApi<DayProgressDTO>(`/progress/day/${canonicalDayId}`);
}

export async function fetchProgressSummary(): Promise<ProgressSummaryDTO> {
  return fetchApi<ProgressSummaryDTO>("/progress/summary");
}
