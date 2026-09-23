import { LegacyMigrationPayloadDTO } from "@top1/shared";

export const LEGACY_STORAGE_KEYS = [
  "startDate",
  "done",
  "notes",
  "qscores",
  "chatLinks",
  "pdfLinks",
  "pausedAt",
  "totalPauseDays",
  "curDate",
  "curPhase",
] as const;

export interface DetectedLegacyStats {
  topicsCount: number;
  notesCount: number;
  linksCount: number;
  quizzesCount: number;
  startDate: string | null;
  hasData: boolean;
}

function getStorage(): Storage | null {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  if (typeof localStorage !== "undefined") {
    return localStorage;
  }
  return null;
}

/**
 * Checks if any legacy localStorage key exists and contains non-empty data.
 */
export function hasLegacyData(): boolean {
  const storage = getStorage();
  if (!storage) {
    return false;
  }

  try {
    const doneRaw = storage.getItem("done");
    if (doneRaw) {
      const parsed = JSON.parse(doneRaw);
      if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) return true;
    }

    const notesRaw = storage.getItem("notes");
    if (notesRaw) {
      const parsed = JSON.parse(notesRaw);
      if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) return true;
    }

    const qscoresRaw = storage.getItem("qscores");
    if (qscoresRaw) {
      const parsed = JSON.parse(qscoresRaw);
      if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) return true;
    }

    const chatLinksRaw = storage.getItem("chatLinks");
    if (chatLinksRaw) {
      const parsed = JSON.parse(chatLinksRaw);
      if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) return true;
    }

    const pdfLinksRaw = storage.getItem("pdfLinks");
    if (pdfLinksRaw) {
      const parsed = JSON.parse(pdfLinksRaw);
      if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) return true;
    }

    const startDate = storage.getItem("startDate");
    if (startDate && startDate.trim().length > 0) return true;

    return false;
  } catch {
    return false;
  }
}

/**
 * Extracts all legacy localStorage keys into an immutable snapshot payload.
 */
export function extractLegacyPayload(): LegacyMigrationPayloadDTO {
  const storage = getStorage();
  if (!storage) {
    return {};
  }

  const payload: LegacyMigrationPayloadDTO = {};

  try {
    const startDate = storage.getItem("startDate");
    if (startDate && /^\d{4}-\d{2}-\d{2}$/.test(startDate.trim())) {
      payload.startDate = startDate.trim();
    }

    const doneRaw = storage.getItem("done");
    if (doneRaw) {
      const parsed = JSON.parse(doneRaw);
      if (parsed && typeof parsed === "object") {
        payload.done = parsed;
      }
    }

    const notesRaw = storage.getItem("notes");
    if (notesRaw) {
      const parsed = JSON.parse(notesRaw);
      if (parsed && typeof parsed === "object") {
        payload.notes = parsed;
      }
    }

    const qscoresRaw = storage.getItem("qscores");
    if (qscoresRaw) {
      const parsed = JSON.parse(qscoresRaw);
      if (parsed && typeof parsed === "object") {
        payload.qscores = parsed;
      }
    }

    const chatLinksRaw = storage.getItem("chatLinks");
    if (chatLinksRaw) {
      const parsed = JSON.parse(chatLinksRaw);
      if (parsed && typeof parsed === "object") {
        payload.chatLinks = parsed;
      }
    }

    const pdfLinksRaw = storage.getItem("pdfLinks");
    if (pdfLinksRaw) {
      const parsed = JSON.parse(pdfLinksRaw);
      if (parsed && typeof parsed === "object") {
        payload.pdfLinks = parsed;
      }
    }

    const pausedAt = storage.getItem("pausedAt");
    if (pausedAt && /^\d{4}-\d{2}-\d{2}$/.test(pausedAt.trim())) {
      payload.pausedAt = pausedAt.trim();
    }

    const totalPauseDaysRaw = storage.getItem("totalPauseDays");
    if (totalPauseDaysRaw) {
      const parsed = parseInt(totalPauseDaysRaw, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        payload.totalPauseDays = parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to extract legacy payload from localStorage:", err);
  }

  return payload;
}

/**
 * Computes summary statistics from an extracted legacy payload.
 */
export function getDetectedStats(payload: LegacyMigrationPayloadDTO): DetectedLegacyStats {
  const topicsCount = Object.values(payload.done || {}).filter(Boolean).length;
  const notesCount = Object.values(payload.notes || {}).filter(
    (n) => typeof n === "string" && n.trim().length > 0,
  ).length;
  const chatCount = Object.values(payload.chatLinks || {}).filter(
    (l) => typeof l === "string" && l.startsWith("http"),
  ).length;
  const pdfCount = Object.values(payload.pdfLinks || {}).filter(
    (l) => typeof l === "string" && l.startsWith("http"),
  ).length;
  const linksCount = chatCount + pdfCount;
  const quizzesCount = Object.keys(payload.qscores || {}).length;

  const hasData = topicsCount > 0 || notesCount > 0 || linksCount > 0 || quizzesCount > 0 || !!payload.startDate;

  return {
    topicsCount,
    notesCount,
    linksCount,
    quizzesCount,
    startDate: payload.startDate || null,
    hasData,
  };
}

/**
 * CRITICAL DATA-SAFETY FUNCTION:
 * Clears legacy localStorage keys ONLY AFTER explicit confirmation from server.
 */
export function clearLegacyLocalStorage(): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    for (const key of LEGACY_STORAGE_KEYS) {
      storage.removeItem(key);
    }
    // Set a marker to avoid re-prompting on this browser
    storage.setItem("top1_legacy_migrated", "true");
  } catch (err) {
    console.warn("Failed to clean up legacy keys after migration:", err);
  }
}
