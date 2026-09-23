import { describe, it, expect } from "vitest";

// Progress calculation helpers
export function calculateDayProgress(
  subtopicIds: string[],
  completedSet: Set<string>,
): { completed: number; total: number; percentage: number; isCompleted: boolean } {
  const total = subtopicIds.length;
  const completed = subtopicIds.filter((id) => completedSet.has(id)).length;
  const percentage = total > 0 ? Number(((completed / total) * 100).toFixed(0)) : 0;
  const isCompleted = total > 0 && completed === total;

  return { completed, total, percentage, isCompleted };
}

export function calculateGlobalProgress(
  completedCount: number,
  totalTopics: number = 813,
): { completed: number; total: number; percentage: number } {
  const percentage = Number(((completedCount / totalTopics) * 100).toFixed(1));
  return { completed: completedCount, total: totalTopics, percentage };
}

export function applyOptimisticToggle(
  previousSet: Set<string>,
  topicId: string,
): { nextSet: Set<string>; isCompleted: boolean } {
  const nextSet = new Set(previousSet);
  if (nextSet.has(topicId)) {
    nextSet.delete(topicId);
    return { nextSet, isCompleted: false };
  } else {
    nextSet.add(topicId);
    return { nextSet, isCompleted: true };
  }
}

describe("Frontend Progress Telemetry & Optimistic Ledger Math", () => {
  it("calculates day progress metrics accurately", () => {
    const subtopics = ["p1-w1-d1-t1", "p1-w1-d1-t2", "p1-w1-d1-t3", "p1-w1-d1-t4", "p1-w1-d1-t5"];
    const completedSet = new Set(["p1-w1-d1-t1", "p1-w1-d1-t3"]);

    const res = calculateDayProgress(subtopics, completedSet);
    expect(res.total).toBe(5);
    expect(res.completed).toBe(2);
    expect(res.percentage).toBe(40);
    expect(res.isCompleted).toBe(false);
  });

  it("marks day as completed when all subtopics are checked", () => {
    const subtopics = ["p1-w1-d1-t1", "p1-w1-d1-t2"];
    const completedSet = new Set(["p1-w1-d1-t1", "p1-w1-d1-t2"]);

    const res = calculateDayProgress(subtopics, completedSet);
    expect(res.completed).toBe(2);
    expect(res.percentage).toBe(100);
    expect(res.isCompleted).toBe(true);
  });

  it("calculates global progress percentage accurately against 813 total topics", () => {
    const res = calculateGlobalProgress(400, 813);
    expect(res.completed).toBe(400);
    expect(res.total).toBe(813);
    expect(res.percentage).toBe(49.2);
  });

  it("performs optimistic toggle on and off and preserves immutability", () => {
    const initialSet = new Set(["p1-w1-d1-t1"]);
    
    // Toggle ON
    const first = applyOptimisticToggle(initialSet, "p1-w1-d1-t2");
    expect(first.isCompleted).toBe(true);
    expect(first.nextSet.has("p1-w1-d1-t2")).toBe(true);
    expect(first.nextSet.has("p1-w1-d1-t1")).toBe(true);
    expect(initialSet.size).toBe(1); // Original unmodified

    // Toggle OFF
    const second = applyOptimisticToggle(first.nextSet, "p1-w1-d1-t1");
    expect(second.isCompleted).toBe(false);
    expect(second.nextSet.has("p1-w1-d1-t1")).toBe(false);
    expect(second.nextSet.has("p1-w1-d1-t2")).toBe(true);
  });
});
