import { describe, it, expect } from "vitest";
import {
  parseUtcDate,
  formatUtcDate,
  calculateProjectedDate,
  calculateProjectedEndDate,
  calculateDaysBetween,
  calculateDaysRemaining,
  addDaysToDateStr,
  resolveCurrentDayOffset,
} from "../../src/modules/schedule/schedule.utils.js";

describe("Schedule Utilities Unit Tests", () => {
  it("parses and formats UTC dates consistently without timezone drift", () => {
    const dateStr = "2026-09-22";
    const d = parseUtcDate(dateStr);
    expect(formatUtcDate(d)).toBe("2026-09-22");
    expect(d.getUTCFullYear()).toBe(2026);
    expect(d.getUTCMonth()).toBe(8); // 0-indexed September
    expect(d.getUTCDate()).toBe(22);
  });

  it("calculates O(1) projected date for sequential global day offsets", () => {
    const startDate = "2026-09-22";
    // Day 1 is startDate
    expect(calculateProjectedDate(startDate, 1)).toBe("2026-09-22");
    // Day 2 is startDate + 1 day
    expect(calculateProjectedDate(startDate, 2)).toBe("2026-09-23");
    // Day 7 is startDate + 6 days
    expect(calculateProjectedDate(startDate, 7)).toBe("2026-09-28");
    // Day 147 is startDate + 146 days
    expect(calculateProjectedDate(startDate, 147)).toBe("2027-02-15");
  });

  it("calculates 52-week projected completion date (+363 days)", () => {
    const startDate = "2026-09-22";
    expect(calculateProjectedEndDate(startDate)).toBe("2027-09-20");
  });

  it("calculates elapsed days between two dates across month and year boundaries", () => {
    expect(calculateDaysBetween("2026-09-01", "2026-09-15")).toBe(14);
    expect(calculateDaysBetween("2026-09-22", "2026-10-06")).toBe(14);
    expect(calculateDaysBetween("2026-12-25", "2027-01-05")).toBe(11);
  });

  it("calculates days remaining until completion date", () => {
    expect(calculateDaysRemaining("2027-09-20", "2026-09-20")).toBe(365);
    expect(calculateDaysRemaining("2027-09-20", "2027-09-25")).toBe(0); // Clamped to 0 if past
  });

  it("adds days to date string accurately", () => {
    expect(addDaysToDateStr("2026-09-22", 14)).toBe("2026-10-06");
    expect(addDaysToDateStr("2026-12-30", 5)).toBe("2027-01-04");
  });

  it("resolves current global day offset when active vs paused", () => {
    const startDate = "2026-09-20";

    // Day 1 when today == startDate
    const res1 = resolveCurrentDayOffset(startDate, false, null, 147, "2026-09-20");
    expect(res1.currentGlobalDayNumber).toBe(1);

    // Day 3 when 2 days elapsed
    const res2 = resolveCurrentDayOffset(startDate, false, null, 147, "2026-09-22");
    expect(res2.currentGlobalDayNumber).toBe(3);

    // When paused at Day 3, remains Day 3 even if today is 10 days later
    const res3 = resolveCurrentDayOffset(startDate, true, "2026-09-22", 147, "2026-10-02");
    expect(res3.currentGlobalDayNumber).toBe(3);
    expect(res3.referenceDate).toBe("2026-09-22");
  });
});
