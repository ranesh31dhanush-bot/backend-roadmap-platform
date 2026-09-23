"use client";

import React from "react";
import { UserStreakDTO } from "@top1/shared";

interface HabitMatrix21Props {
  streakData: UserStreakDTO | null;
  loading?: boolean;
}

export const HabitMatrix21: React.FC<HabitMatrix21Props> = ({
  streakData,
  loading = false,
}) => {
  if (loading || !streakData) {
    return (
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 font-mono text-xs text-[#8b949e] animate-pulse">
        <div className="h-4 bg-[#21262d] rounded w-1/3 mb-4" />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 21 }).map((_, i) => (
            <div key={i} className="h-12 bg-[#21262d] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const { currentStreak, longestStreak, freezeAvailable, habitMatrix } = streakData;
  const completedIn21Days = habitMatrix.filter((d) => d.isActive).length;

  const getMilestoneCopy = (streak: number) => {
    if (streak >= 21) {
      return "🏆 21-Day Habit Cycle Mastered! Your daily engineering habit is rock solid.";
    }
    if (streak >= 14) {
      return `🔥 Day ${streak}/21 — Deep habit forming! You're in the Top 1% consistency tier.`;
    }
    if (streak >= 7) {
      return `⚡ Day ${streak}/21 — Momentum is building! 1 full week completed.`;
    }
    if (streak >= 1) {
      return `🌱 Day ${streak}/21 — Starting the spark! Keep the flame alive tomorrow.`;
    }
    return "💡 Start today's learning session to ignite your 21-day study streak!";
  };

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-5 shadow-xl">
      {/* Header & Telemetry Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#30363d] gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-base">🔥</span>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              21-Day Habit Building Matrix
            </h2>
          </div>
          <p className="text-xs text-[#8b949e] mt-1">
            Neuroplastic consistency tracking across your rolling 21-day learning window.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Current Streak */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3.5 py-2 text-center min-w-[90px]">
            <span className="text-[10px] text-[#8b949e] uppercase block">Current</span>
            <span className="text-base font-black text-[#00e676] flex items-center justify-center space-x-1">
              <span>🔥</span>
              <span>{currentStreak}d</span>
            </span>
          </div>

          {/* Longest Streak */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3.5 py-2 text-center min-w-[90px]">
            <span className="text-[10px] text-[#8b949e] uppercase block">Record</span>
            <span className="text-base font-black text-[#58a6ff] flex items-center justify-center space-x-1">
              <span>🏆</span>
              <span>{longestStreak}d</span>
            </span>
          </div>

          {/* Monthly Freeze Pill */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3.5 py-2 text-center min-w-[90px]">
            <span className="text-[10px] text-[#8b949e] uppercase block">Monthly Freeze</span>
            <span
              className={`text-xs font-bold flex items-center justify-center space-x-1 ${
                freezeAvailable ? "text-cyan-400" : "text-[#8b949e]"
              }`}
            >
              <span>❄️</span>
              <span>{freezeAvailable ? "Available" : "Used"}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Motivational Milestone Banner */}
      <div className="bg-gradient-to-r from-[#00e676]/10 to-[#58a6ff]/10 border border-[#00e676]/30 rounded-lg p-3 text-xs text-white flex items-center justify-between">
        <span className="font-semibold">{getMilestoneCopy(currentStreak)}</span>
        <span className="text-[11px] text-[#8b949e] hidden md:inline">
          {completedIn21Days} / 21 Days Active
        </span>
      </div>

      {/* 3x7 Habit Matrix Grid */}
      <div>
        <div className="grid grid-cols-7 gap-2.5">
          {habitMatrix.map((item) => {
            const isCompleted = item.status === "completed";
            const isFrozen = item.status === "frozen";
            const isFuture = item.status === "future";

            return (
              <div
                key={item.dayIndex}
                title={`${item.date} — Status: ${item.status.toUpperCase()}`}
                className={`group relative rounded-xl border p-2 flex flex-col items-center justify-between min-h-[58px] transition-all select-none ${
                  isCompleted
                    ? "bg-[#00e676]/15 border-[#00e676] text-white shadow-lg shadow-[#00e676]/10"
                    : isFrozen
                    ? "bg-cyan-950/40 border-cyan-500 text-cyan-200"
                    : isFuture
                    ? "bg-[#0d1117]/30 border-[#21262d] text-[#484f58]"
                    : "bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:border-[#8b949e]"
                }`}
              >
                {/* Day Number */}
                <span className={`text-[10px] font-bold ${isFuture ? "text-[#484f58]" : ""}`}>
                  Day {item.dayIndex}
                </span>

                {/* Status Visual Icon */}
                <span className="text-base my-0.5">
                  {isCompleted ? "🔥" : isFrozen ? "❄️" : isFuture ? "○" : "·"}
                </span>

                {/* Date Label */}
                <span className={`text-[9px] truncate w-full text-center ${isFuture ? "text-[#484f58]" : "text-[#8b949e]"}`}>
                  {item.date.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="pt-2 border-t border-[#30363d] flex items-center justify-between text-[11px] text-[#8b949e] flex-wrap gap-2">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5">
            <span className="text-xs">🔥</span>
            <span>Study Day Completed</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="text-xs">❄️</span>
            <span>Monthly Freeze Protected</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-[#30363d] inline-block" />
            <span>Missed Day</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="text-xs text-[#484f58]">○</span>
            <span>Upcoming Day</span>
          </span>
        </div>

        <span>Resets monthly on the 1st</span>
      </div>
    </div>
  );
};
