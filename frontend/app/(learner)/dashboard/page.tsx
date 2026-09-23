"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { fetchApi } from "@/lib/api/client";
import {
  OnboardingStatusResponse,
  PhaseOverviewDTO,
  ProgressSummaryDTO,
  UserStreakDTO,
  VelocityStatsDTO,
} from "@top1/shared";

import { fetchUserStreak } from "@/lib/api/streaks";
import { fetchVelocityStats } from "@/lib/api/analytics";
import { HabitMatrix21 } from "@/components/streaks/HabitMatrix21";
import { VelocityWidget } from "@/components/dashboard/VelocityWidget";
import { LegacyMigrationBanner } from "@/components/migration/LegacyMigrationBanner";
import Link from "next/link";


export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuthStore();
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatusResponse | null>(null);
  const [phases, setPhases] = useState<PhaseOverviewDTO[]>([]);
  const [progressSummary, setProgressSummary] = useState<ProgressSummaryDTO | null>(null);
  const [streakData, setStreakData] = useState<UserStreakDTO | null>(null);
  const [velocityStats, setVelocityStats] = useState<VelocityStatsDTO | null>(null);
  const [loadingVelocity, setLoadingVelocity] = useState<boolean>(true);
  const [loadingData, setLoadingData] = useState<boolean>(true);


  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    async function loadData() {
      try {
        setLoadingData(true);
        const [status, phaseData, summary, streak] = await Promise.all([
          fetchApi<OnboardingStatusResponse>("/onboarding/status"),
          fetchApi<PhaseOverviewDTO[]>("/curriculum/phases"),
          fetchApi<ProgressSummaryDTO>("/progress/summary"),
          fetchUserStreak(),
        ]);

        setOnboardingStatus(status);
        setPhases(phaseData);
        setProgressSummary(summary);
        setStreakData(streak);

        // Load velocity stats in parallel (non-critical, shown in widget)
        fetchVelocityStats()
          .then(setVelocityStats)
          .catch(console.error)
          .finally(() => setLoadingVelocity(false));


        // Routing guard: If not onboarded, redirect to /onboarding
        if (!status.isOnboarded) {
          router.replace("/onboarding");
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoadingData(false);
      }
    }

    if (isAuthenticated) {
      loadData();
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117] text-[#c9d1d9]">
        <div className="animate-spin h-8 w-8 border-2 border-[#00e676] border-t-transparent rounded-full" />
      </div>
    );
  }

  const schedule = onboardingStatus?.schedule;

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">
      {/* Top Navbar */}
      <header className="border-b border-[#30363d] bg-[#161b22]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-[#00e676] font-bold tracking-tight text-lg">TOP 1%</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#21262d] text-[#8b949e] font-medium border border-[#30363d]">
              LEARNER DASHBOARD
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-xs text-[#8b949e] hidden sm:inline">
              👤 {user?.displayName} ({user?.email})
            </span>
            <button
              onClick={logout}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-red-400 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Legacy LocalStorage Migration Banner (Sprint 8: MIGR-001/004) */}
        <LegacyMigrationBanner />

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#161b22] to-[#0d1117] border border-[#30363d] rounded-xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-[#00e676] bg-[#00e676]/10 px-2.5 py-1 rounded-full border border-[#00e676]/30 uppercase tracking-wider">
                Active Learner Journey
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2">
                Welcome back, {user?.displayName || "Engineer"}
              </h1>
              <p className="text-sm text-[#8b949e] mt-1">
                Target Role: <strong className="text-white">{schedule?.targetRole || "Senior Backend Engineer"}</strong> • Start Date:{" "}
                <strong className="text-white">{schedule?.startDate}</strong>
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {streakData && (
                <div className="px-3.5 py-2 rounded-lg bg-[#21262d] border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center space-x-2">
                  <span className="text-base animate-pulse">🔥</span>
                  <span>{streakData.currentStreak} Day Streak</span>
                </div>
              )}

              <Link
                href="/workspace"
                className="px-5 py-2.5 rounded-lg bg-[#00e676] text-black font-semibold text-xs hover:bg-[#00c853] shadow-lg shadow-[#00e676]/20 transition-all flex items-center space-x-1.5"
              >
                <span>⚡</span>
                <span>Daily Workspace</span>
              </Link>

              <Link
                href="/curriculum"
                className="px-4 py-2.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-white font-semibold text-xs border border-[#30363d] transition-all flex items-center space-x-1.5"
              >
                <span>🗺️</span>
                <span>Roadmap</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 21-Day Habit Building Matrix (STRK-002) */}
        {streakData && (
          <HabitMatrix21 streakData={streakData} />
        )}

        {/* ANLT-002: Personal Velocity Dashboard Widget */}
        <VelocityWidget stats={velocityStats!} isLoading={loadingVelocity || !velocityStats} />

        {/* Global Progress Telemetry Widget */}

        {progressSummary && (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <span>📊</span>
                  <span>Overall Curriculum Progress Telemetry</span>
                </h2>
                <p className="text-xs text-[#8b949e] mt-0.5">
                  {progressSummary.totalCompleted} of {progressSummary.totalTopics} total topics mastered
                </p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-bold tracking-tight text-[#00e676]">
                  {progressSummary.globalPercentage}%
                </span>
              </div>
            </div>

            {/* Global Progress Bar */}
            <div className="w-full bg-[#0d1117] border border-[#30363d] rounded-full h-3.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#58a6ff] to-[#00e676] transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(progressSummary.globalPercentage, 0.5)}%` }}
              />
            </div>
          </div>
        )}

        {/* Phase Summary & Progress Cards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white tracking-tight">Curriculum Phases & Progress</h2>
            <Link
              href="/curriculum"
              className="text-xs text-[#58a6ff] hover:text-[#00e676] font-medium transition-colors"
            >
              View Full Interactive Roadmap →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {phases.map((p) => {
              const pRollup = progressSummary?.phaseProgress.find(
                (pr) => pr.phaseNumber === p.phaseNumber,
              );

              return (
                <div
                  key={p.phaseNumber}
                  className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-3 hover:border-[#8b949e] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">
                        Phase {p.phaseNumber}: {p.phaseName}
                      </span>
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: p.phaseColor || "#00e676" }}
                      />
                    </div>

                    <p className="text-xs text-[#8b949e]">
                      {p.totalWeeks} modules • {p.totalDays} study days • {p.totalTopics} topics
                    </p>

                    {/* Phase Progress Bar */}
                    {pRollup && (
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-[#8b949e]">Phase Progress:</span>
                          <span className="text-[#00e676] font-semibold">
                            {pRollup.completed} / {pRollup.total} ({pRollup.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#0d1117] rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#00e676] h-full transition-all"
                            style={{ width: `${pRollup.percentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {p.salaryMeta && (
                    <div className="pt-2 border-t border-[#30363d] flex justify-between items-center text-xs">
                      <span className="text-[#8b949e]">Target Salary:</span>
                      <span className="text-[#00e676] font-semibold">
                        {p.salaryMeta.min}–{p.salaryMeta.max} LPA
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
