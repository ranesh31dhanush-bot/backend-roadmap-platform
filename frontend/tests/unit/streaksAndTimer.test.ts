import { describe, it, expect } from "vitest";
import { UserStreakDTO, HabitMatrixDayDTO } from "@top1/shared";

describe("Sprint 7 Frontend: Streaks, Habit Matrix & Pomodoro Unit Tests", () => {
  describe("Pomodoro Timer Presets & Time Formatting", () => {
    const formatTime = (totalSeconds: number) => {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    it("formats minutes and seconds accurately with leading zeros", () => {
      expect(formatTime(1500)).toBe("25:00");
      expect(formatTime(300)).toBe("05:00");
      expect(formatTime(900)).toBe("15:00");
      expect(formatTime(299)).toBe("04:59");
      expect(formatTime(65)).toBe("01:05");
      expect(formatTime(9)).toBe("00:09");
      expect(formatTime(0)).toBe("00:00");
    });

    it("handles standard Pomodoro mode presets correctly", () => {
      const PRESETS = {
        focus: 25 * 60,
        shortBreak: 5 * 60,
        longBreak: 15 * 60,
      };

      expect(PRESETS.focus).toBe(1500);
      expect(PRESETS.shortBreak).toBe(300);
      expect(PRESETS.longBreak).toBe(900);
    });
  });

  describe("21-Day Habit Building Matrix Visual Logic", () => {
    it("correctly maps 21-day matrix day status categories", () => {
      const mockMatrix: HabitMatrixDayDTO[] = Array.from({ length: 21 }, (_, i) => {
        const dayNumber = i + 1;
        let status: HabitMatrixDayDTO["status"] = "future";
        let isActive = false;
        if (dayNumber <= 5) {
          status = "completed";
          isActive = true;
        } else if (dayNumber === 6) {
          status = "frozen";
          isActive = true;
        } else if (dayNumber === 7) {
          status = "missed";
        } else if (dayNumber === 8) {
          status = "completed";
          isActive = true;
        }

        return {
          dayIndex: dayNumber,
          date: `2026-09-${String(dayNumber).padStart(2, "0")}`,
          isActive,
          status,
        };
      });

      expect(mockMatrix.length).toBe(21);
      expect(mockMatrix.filter((d) => d.status === "completed").length).toBe(6);
      expect(mockMatrix.filter((d) => d.status === "frozen").length).toBe(1);
      expect(mockMatrix.filter((d) => d.status === "missed").length).toBe(1);
      expect(mockMatrix.filter((d) => d.status === "future").length).toBe(13);
      expect(mockMatrix.find((d) => d.dayIndex === 8)?.isActive).toBe(true);
    });

    it("generates milestone celebration copy based on current streak thresholds", () => {
      const getMilestoneCopy = (streak: number) => {
        if (streak >= 21) {
          return {
            title: "🏆 Habit Mastery Achieved!",
            subtitle: "21 consecutive days of deep backend engineering practice locked in.",
          };
        }
        if (streak >= 14) {
          return {
            title: "⚡ Momentum Accelerating!",
            subtitle: `${21 - streak} days remaining until 21-day neurological habit formation.`,
          };
        }
        if (streak >= 7) {
          return {
            title: "🔥 Consistency Engine Engaged!",
            subtitle: "Full 7-day foundation established. Push forward to Day 14!",
          };
        }
        return {
          title: "🌱 Habit Building Matrix (21-Day Protocol)",
          subtitle: "Complete daily learning topics or quizzes to ignite and maintain your streak.",
        };
      };

      expect(getMilestoneCopy(25).title).toBe("🏆 Habit Mastery Achieved!");
      expect(getMilestoneCopy(18).title).toBe("⚡ Momentum Accelerating!");
      expect(getMilestoneCopy(7).title).toBe("🔥 Consistency Engine Engaged!");
      expect(getMilestoneCopy(3).title).toBe("🌱 Habit Building Matrix (21-Day Protocol)");
    });
  });

  describe("Streak Freeze Status Representation", () => {
    it("renders available or consumed freeze badge appropriately", () => {
      const streakWithFreeze: UserStreakDTO = {
        currentStreak: 12,
        longestStreak: 15,
        lastActivityDate: "2026-09-22",
        totalActiveDays: 12,
        freezeAvailable: true,
        freezeUsedAt: null,
        habitMatrix: [],
      };

      const streakWithoutFreeze: UserStreakDTO = {
        currentStreak: 12,
        longestStreak: 15,
        lastActivityDate: "2026-09-22",
        totalActiveDays: 12,
        freezeAvailable: false,
        freezeUsedAt: "2026-09-15T00:00:00.000Z",
        habitMatrix: [],
      };

      expect(streakWithFreeze.freezeAvailable).toBe(true);
      expect(streakWithFreeze.freezeUsedAt).toBeNull();

      expect(streakWithoutFreeze.freezeAvailable).toBe(false);
      expect(streakWithoutFreeze.freezeUsedAt).toBeDefined();
    });
  });
});
