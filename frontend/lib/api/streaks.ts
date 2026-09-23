import { fetchApi } from "./client";
import { UserStreakDTO } from "@top1/shared";

export async function fetchUserStreak(timezone?: string): Promise<UserStreakDTO> {
  const tzParam = timezone
    ? `?tz=${encodeURIComponent(timezone)}`
    : typeof Intl !== "undefined"
    ? `?tz=${encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone)}`
    : "";
  return fetchApi<UserStreakDTO>(`/streaks${tzParam}`);
}

export async function recordStreakActivity(
  date?: string,
  timezone?: string,
): Promise<UserStreakDTO> {
  const tz = timezone || (typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined);
  return fetchApi<UserStreakDTO>("/streaks/activity", {
    method: "POST",
    body: JSON.stringify({ date, timezone: tz }),
  });
}

export async function consumeStreakFreeze(date?: string): Promise<UserStreakDTO> {
  return fetchApi<UserStreakDTO>("/streaks/freeze", {
    method: "POST",
    body: JSON.stringify({ date }),
  });
}
