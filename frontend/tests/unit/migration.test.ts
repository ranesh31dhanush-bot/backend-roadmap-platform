import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  hasLegacyData,
  extractLegacyPayload,
  getDetectedStats,
  clearLegacyLocalStorage,
  LEGACY_STORAGE_KEYS,
} from "../../lib/migration/localStorageExtractor";
import { LegacyMigrationPayloadDTO } from "@top1/shared";

describe("Sprint 8: Frontend LocalStorage Extractor & Migration Safety Unit Tests", () => {
  const mockStorage: Record<string, string> = {};

  beforeEach(() => {
    // Clear mock storage
    for (const key of Object.keys(mockStorage)) {
      delete mockStorage[key];
    }

    // Mock global window.localStorage
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        for (const key of Object.keys(mockStorage)) {
          delete mockStorage[key];
        }
      },
    });
  });

  it("returns false when localStorage has no legacy keys", () => {
    expect(hasLegacyData()).toBe(false);
  });

  it("returns true when any legacy key is present and non-empty", () => {
    localStorage.setItem("done", JSON.stringify({ "s::1::0::0": true }));
    expect(hasLegacyData()).toBe(true);

    localStorage.removeItem("done");
    expect(hasLegacyData()).toBe(false);

    localStorage.setItem("startDate", "2026-09-01");
    expect(hasLegacyData()).toBe(true);
  });

  it("extracts a typed, clean snapshot payload from localStorage", () => {
    localStorage.setItem("startDate", "2026-09-01");
    localStorage.setItem("done", JSON.stringify({ "s::1::0::0": true, "s::1::0::1": true }));
    localStorage.setItem("notes", JSON.stringify({ "2026-09-01": "My notes on event loop" }));
    localStorage.setItem("chatLinks", JSON.stringify({ "2026-09-01": "https://chatgpt.com/share/test" }));
    localStorage.setItem("pdfLinks", JSON.stringify({ "2026-09-01": "https://drive.google.com/test" }));
    localStorage.setItem(
      "qscores",
      JSON.stringify({ "daily::Node.js Event Loop": { score: 5, total: 5, pct: 100 } }),
    );

    const payload = extractLegacyPayload();

    expect(payload.startDate).toBe("2026-09-01");
    expect(payload.done?.["s::1::0::0"]).toBe(true);
    expect(payload.notes?.["2026-09-01"]).toBe("My notes on event loop");
    expect(payload.chatLinks?.["2026-09-01"]).toBe("https://chatgpt.com/share/test");
    expect(payload.pdfLinks?.["2026-09-01"]).toBe("https://drive.google.com/test");
    expect(payload.qscores?.["daily::Node.js Event Loop"]?.pct).toBe(100);
  });

  it("correctly computes detected statistics breakdown", () => {
    const payload: LegacyMigrationPayloadDTO = {
      startDate: "2026-09-01",
      done: { "s::1::0::0": true, "s::1::0::1": true, "s::1::0::2": false },
      notes: { "2026-09-01": "Note 1", "2026-09-02": "" },
      chatLinks: { "2026-09-01": "https://chatgpt.com/1" },
      pdfLinks: { "2026-09-01": "https://drive.google.com/1" },
      qscores: { "daily::1": { pct: 80 } },
    };

    const stats = getDetectedStats(payload);

    expect(stats.hasData).toBe(true);
    expect(stats.topicsCount).toBe(2);
    expect(stats.notesCount).toBe(1);
    expect(stats.linksCount).toBe(2);
    expect(stats.quizzesCount).toBe(1);
    expect(stats.startDate).toBe("2026-09-01");
  });

  it("clears only legacy keys and sets top1_legacy_migrated flag on success", () => {
    for (const key of LEGACY_STORAGE_KEYS) {
      localStorage.setItem(key, "legacy_value");
    }
    // Unrelated key that must not be cleared
    localStorage.setItem("user_theme", "dark");

    clearLegacyLocalStorage();

    for (const key of LEGACY_STORAGE_KEYS) {
      expect(localStorage.getItem(key)).toBeNull();
    }
    expect(localStorage.getItem("user_theme")).toBe("dark");
    expect(localStorage.getItem("top1_legacy_migrated")).toBe("true");
  });
});
