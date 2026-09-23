"use client";

import React from "react";
import Link from "next/link";
import { VelocityStatsDTO } from "@top1/shared";

interface VelocityWidgetProps {
  stats: VelocityStatsDTO;
  isLoading?: boolean;
}

function StatCard({
  label,
  value,
  sub,
  color = "#00e676",
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 flex flex-col gap-1">
      <span className="text-[10px] font-semibold text-[#8b949e] uppercase tracking-wider">
        {label}
      </span>
      <span className="text-xl font-bold tracking-tight" style={{ color }}>
        {value}
      </span>
      {sub && <span className="text-[11px] text-[#6e7681]">{sub}</span>}
    </div>
  );
}

export function VelocityWidget({ stats, isLoading }: VelocityWidgetProps) {
  if (isLoading) {
    return (
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 shadow-xl space-y-4 animate-pulse">
        <div className="h-4 bg-[#21262d] rounded w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-[#21262d] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const progressPct = Math.min(stats.globalPercentage, 100);
  const progressColor =
    progressPct >= 75 ? "#00e676" : progressPct >= 40 ? "#58a6ff" : "#f78166";

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <span>⚡</span>
            <span>Personal Velocity Dashboard</span>
          </h2>
          <p className="text-xs text-[#8b949e] mt-0.5">
            {stats.startDate
              ? `Tracking since ${stats.startDate} · ${stats.daysSinceStart} days active`
              : "Start your learning journey to see velocity stats"}
          </p>
        </div>
        <Link
          href="/projects"
          className="text-xs text-[#58a6ff] hover:text-[#00e676] font-medium transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          View Capstone Projects →
        </Link>
      </div>

      {/* Overall Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-[#8b949e]">
            Global Progress: {stats.topicsCompleted} / {stats.totalTopics} topics
          </span>
          <span className="font-black text-sm" style={{ color: progressColor }}>
            {stats.globalPercentage}%
          </span>
        </div>
        <div className="w-full bg-[#0d1117] border border-[#30363d] rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full transition-all duration-700 rounded-full"
            style={{
              width: `${Math.max(progressPct, 0.5)}%`,
              background: `linear-gradient(90deg, #58a6ff, ${progressColor})`,
            }}
          />
        </div>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          label="Current Streak"
          value={`${stats.currentStreak}d`}
          sub="consecutive days"
          color="#f0a500"
        />
        <StatCard
          label="Longest Streak"
          value={`${stats.longestStreak}d`}
          sub="personal best"
          color="#d29922"
        />
        <StatCard
          label="Avg Topics/Day"
          value={
            stats.avgTopicsPerDay > 0
              ? stats.avgTopicsPerDay.toFixed(1)
              : "—"
          }
          sub="pace indicator"
          color="#58a6ff"
        />
        <StatCard
          label="Est. Days Left"
          value={
            stats.estimatedDaysRemaining === null
              ? "—"
              : stats.estimatedDaysRemaining === 0
              ? "Done!"
              : `${stats.estimatedDaysRemaining}d`
          }
          sub={
            stats.projectedCompletionDate
              ? `target: ${stats.projectedCompletionDate}`
              : "keep going!"
          }
          color={stats.estimatedDaysRemaining === 0 ? "#00e676" : "#bc8cff"}
        />
        <StatCard
          label="Global Completion"
          value={`${stats.globalPercentage}%`}
          sub={`${stats.topicsCompleted} of ${stats.totalTopics}`}
          color={progressColor}
        />
      </div>

      {/* Motivational Footnote */}
      {stats.avgTopicsPerDay > 0 && stats.estimatedDaysRemaining !== null && stats.estimatedDaysRemaining > 0 && (
        <p className="text-[10px] text-[#6e7681] border-t border-[#21262d] pt-3">
          At your current pace of{" "}
          <span className="text-[#58a6ff] font-bold">{stats.avgTopicsPerDay.toFixed(1)} topics/day</span>, you
          will complete the full 813-topic curriculum by{" "}
          <span className="text-[#00e676] font-bold">{stats.projectedCompletionDate}</span>.
        </p>
      )}
      {stats.topicsCompleted === 0 && (
        <p className="text-[10px] text-[#6e7681] border-t border-[#21262d] pt-3">
          Complete your first topic in the{" "}
          <Link href="/workspace" className="text-[#58a6ff] hover:text-[#00e676]">
            Daily Workspace
          </Link>{" "}
          to start tracking your velocity.
        </p>
      )}
    </div>
  );
}
