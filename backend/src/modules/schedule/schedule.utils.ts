/**
 * Pure UTC Date Math Utilities for O(1) Schedule Projection
 */

export function parseUtcDate(dateStr: string): Date {
  const parts = dateStr.split("-").map(Number);
  const year = parts[0] || new Date().getFullYear();
  const month = (parts[1] || 1) - 1;
  const day = parts[2] || 1;
  return new Date(Date.UTC(year, month, day));
}

export function formatUtcDate(date: Date): string {
  return date.toISOString().split("T")[0]!;
}

export function getTodayUtcStr(): string {
  return formatUtcDate(new Date());
}

/**
 * Calculates calendar date for any global day offset (1-indexed) in O(1) time
 * E.g., Day 1 -> startDate + 0 days
 *       Day 2 -> startDate + 1 days
 *       Day 147 -> startDate + 146 days
 */
export function calculateProjectedDate(startDateStr: string, globalDayNumber: number): string {
  const start = parseUtcDate(startDateStr);
  const offsetDays = Math.max(0, globalDayNumber - 1);
  const projected = new Date(start.getTime() + offsetDays * 24 * 60 * 60 * 1000);
  return formatUtcDate(projected);
}

/**
 * Calculate full completion target date (+363 days / 52 weeks)
 */
export function calculateProjectedEndDate(startDateStr: string): string {
  const start = parseUtcDate(startDateStr);
  const end = new Date(start.getTime() + 363 * 24 * 60 * 60 * 1000);
  return formatUtcDate(end);
}

/**
 * Calculates absolute whole days elapsed between dateA and dateB
 */
export function calculateDaysBetween(startDateStr: string, targetDateStr: string): number {
  const start = parseUtcDate(startDateStr);
  const target = parseUtcDate(targetDateStr);
  const diffMs = target.getTime() - start.getTime();
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
}

/**
 * Calculates days remaining until projected end date
 */
export function calculateDaysRemaining(projectedEndDateStr: string, referenceDateStr = getTodayUtcStr()): number {
  const remaining = calculateDaysBetween(referenceDateStr, projectedEndDateStr);
  return Math.max(0, remaining);
}

/**
 * Shift a date forward by N days
 */
export function addDaysToDateStr(dateStr: string, days: number): string {
  const base = parseUtcDate(dateStr);
  const shifted = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
  return formatUtcDate(shifted);
}

/**
 * Determine which global day (1..147) corresponds to today / active state
 */
export function resolveCurrentDayOffset(
  startDateStr: string,
  isPaused: boolean,
  pausedAt: string | null,
  totalDays: number = 147,
  overrideTodayStr?: string,
): { currentGlobalDayNumber: number; referenceDate: string } {
  const todayStr = overrideTodayStr || getTodayUtcStr();
  const refDate = isPaused && pausedAt ? pausedAt : todayStr;

  const daysElapsed = calculateDaysBetween(startDateStr, refDate);

  if (daysElapsed < 0) {
    // Journey has not started yet
    return { currentGlobalDayNumber: 1, referenceDate: refDate };
  }

  const currentGlobalDayNumber = Math.min(totalDays, daysElapsed + 1);
  return { currentGlobalDayNumber, referenceDate: refDate };
}
