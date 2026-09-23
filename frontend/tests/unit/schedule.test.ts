import { describe, it, expect } from "vitest";

function calculateProjectedDate(startDateStr: string, globalDayNumber: number): string {
  const parts = startDateStr.split("-").map(Number);
  const start = new Date(Date.UTC(parts[0]!, parts[1]! - 1, parts[2]!));
  const offsetDays = Math.max(0, globalDayNumber - 1);
  const projected = new Date(start.getTime() + offsetDays * 24 * 60 * 60 * 1000);
  return projected.toISOString().split("T")[0]!;
}

function calculatePauseResumeShift(startDateStr: string, pausedAtStr: string, resumeDateStr: string): { newStartDate: string; daysPaused: number } {
  const pausedParts = pausedAtStr.split("-").map(Number);
  const resumeParts = resumeDateStr.split("-").map(Number);

  const p = new Date(Date.UTC(pausedParts[0]!, pausedParts[1]! - 1, pausedParts[2]!));
  const r = new Date(Date.UTC(resumeParts[0]!, resumeParts[1]! - 1, resumeParts[2]!));

  const daysPaused = Math.max(0, Math.floor((r.getTime() - p.getTime()) / (24 * 60 * 60 * 1000)));

  const startParts = startDateStr.split("-").map(Number);
  const s = new Date(Date.UTC(startParts[0]!, startParts[1]! - 1, startParts[2]!));
  const newStart = new Date(s.getTime() + daysPaused * 24 * 60 * 60 * 1000);

  return {
    newStartDate: newStart.toISOString().split("T")[0]!,
    daysPaused,
  };
}

describe("Frontend Dynamic Schedule Math", () => {
  it("computes exact day projection for any canonical day index", () => {
    const startDate = "2026-09-22";
    expect(calculateProjectedDate(startDate, 1)).toBe("2026-09-22");
    expect(calculateProjectedDate(startDate, 14)).toBe("2026-10-05");
    expect(calculateProjectedDate(startDate, 147)).toBe("2027-02-15");
  });

  it("calculates forward date shift accurately after pause/resume", () => {
    const startDate = "2026-09-22";
    const pausedAt = "2026-10-01";
    const resumedAt = "2026-10-15"; // 14 days paused

    const result = calculatePauseResumeShift(startDate, pausedAt, resumedAt);
    expect(result.daysPaused).toBe(14);
    expect(result.newStartDate).toBe("2026-10-06");
  });
});
