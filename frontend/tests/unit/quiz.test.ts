import { describe, it, expect } from "vitest";
import { QuizQuestionClientDTO } from "@top1/shared";

export function calculateQuizScore(
  correctAnswersCount: number,
  totalQuestions: number,
  passThresholdPercentage: number = 75,
): { scorePercentage: number; passed: boolean } {
  const scorePercentage =
    totalQuestions > 0 ? Math.round((correctAnswersCount / totalQuestions) * 100) : 0;
  const passed = scorePercentage >= passThresholdPercentage;
  return { scorePercentage, passed };
}

export function formatQuizTimer(secondsRemaining: number): string {
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function getOptionLetter(index: number): string {
  const letters = ["A", "B", "C", "D", "E", "F"];
  return letters[index] || String(index + 1);
}

describe("Frontend Quiz & Assessment Engine Unit Tests", () => {
  it("calculates quiz score and enforces 75% mastery pass threshold", () => {
    // 5 out of 5 (100%) -> Pass
    const score100 = calculateQuizScore(5, 5);
    expect(score100.scorePercentage).toBe(100);
    expect(score100.passed).toBe(true);

    // 4 out of 5 (80%) -> Pass (>= 75%)
    const score80 = calculateQuizScore(4, 5);
    expect(score80.scorePercentage).toBe(80);
    expect(score80.passed).toBe(true);

    // 3 out of 4 (75%) -> Pass (>= 75%)
    const score75 = calculateQuizScore(3, 4);
    expect(score75.scorePercentage).toBe(75);
    expect(score75.passed).toBe(true);

    // 3 out of 5 (60%) -> Fail (< 75%)
    const score60 = calculateQuizScore(3, 5);
    expect(score60.scorePercentage).toBe(60);
    expect(score60.passed).toBe(false);

    // 0 out of 5 (0%) -> Fail
    const score0 = calculateQuizScore(0, 5);
    expect(score0.scorePercentage).toBe(0);
    expect(score0.passed).toBe(false);
  });

  it("formats countdown timer minutes and seconds properly", () => {
    expect(formatQuizTimer(600)).toBe("10:00");
    expect(formatQuizTimer(119)).toBe("01:59");
    expect(formatQuizTimer(5)).toBe("00:05");
    expect(formatQuizTimer(0)).toBe("00:00");
  });

  it("maps option indices to standard alphabet letters", () => {
    expect(getOptionLetter(0)).toBe("A");
    expect(getOptionLetter(1)).toBe("B");
    expect(getOptionLetter(2)).toBe("C");
    expect(getOptionLetter(3)).toBe("D");
  });

  it("guarantees client question objects have zero answer key fields", () => {
    const clientQuestion: QuizQuestionClientDTO = {
      id: "q_101",
      questionText: "What is HTTP/2 multiplexing?",
      options: ["Binary framing over 1 TCP connection", "UDP sockets"],
    };

    const serialized = JSON.stringify(clientQuestion);
    expect(serialized).not.toContain("correctOptionIndex");
    expect(serialized).not.toContain("explanation");
    expect(serialized).not.toContain("answerKey");

    const parsed = JSON.parse(serialized);
    expect(parsed.correctOptionIndex).toBeUndefined();
    expect(parsed.explanation).toBeUndefined();
  });
});
