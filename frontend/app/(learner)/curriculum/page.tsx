"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { fetchApi } from "@/lib/api/client";
import {
  LearnerRoadmapResponse,
  RoadmapDayDTO,
  ProgressSummaryDTO,
} from "@top1/shared";
import { ScheduleModal } from "@/components/ScheduleModal";
import { CommandPalette } from "@/components/CommandPalette";
import { QuizRunnerModal } from "@/components/quiz/QuizRunnerModal";
import Link from "next/link";

export default function CurriculumRoadmapPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [roadmapData, setRoadmapData] = useState<LearnerRoadmapResponse | null>(null);
  const [progressSummary, setProgressSummary] = useState<ProgressSummaryDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // UI state
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});
  const [selectedDay, setSelectedDay] = useState<RoadmapDayDTO | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [activePhaseExamCanonicalId, setActivePhaseExamCanonicalId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    async function loadRoadmapAndProgress() {
      try {
        setLoading(true);
        const [roadmap, summary] = await Promise.all([
          fetchApi<LearnerRoadmapResponse>("/schedule/roadmap"),
          fetchApi<ProgressSummaryDTO>("/progress/summary"),
        ]);
        setRoadmapData(roadmap);
        setProgressSummary(summary);

        // Auto-expand Phase 1, Week 1 by default
        if (roadmap.phases[0]?.weeks[0]) {
          const firstWeekKey = `p${roadmap.phases[0].phaseNumber}-w${roadmap.phases[0].weeks[0].weekNumber}`;
          setExpandedWeeks((prev) => ({ ...prev, [firstWeekKey]: true }));
        }

        // Set initial selected day to current day or day 1
        const allDays = roadmap.phases.flatMap((p) => p.weeks.flatMap((w) => w.days));
        const current = allDays.find((d) => d.isCurrentDay) || allDays[0];
        if (current) {
          setSelectedDay(current);
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load interactive roadmap");
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      loadRoadmapAndProgress();
    }
  }, [authLoading, isAuthenticated, router]);

  // Toggle week accordion
  const toggleWeek = (weekKey: string) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [weekKey]: !prev[weekKey],
    }));
  };

  // Deep-link to a day from search or click
  const handleSelectDayById = (canonicalDayId: string) => {
    if (!roadmapData) return;
    for (const phase of roadmapData.phases) {
      for (const week of phase.weeks) {
        const found = week.days.find((d) => d.canonicalDayId === canonicalDayId);
        if (found) {
          const weekKey = `p${phase.phaseNumber}-w${week.weekNumber}`;
          setExpandedWeeks((prev) => ({ ...prev, [weekKey]: true }));
          setSelectedDay(found);

          // Scroll to day element
          setTimeout(() => {
            const el = document.getElementById(canonicalDayId);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 100);
          return;
        }
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117] text-[#c9d1d9]">
        <div className="text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-2 border-[#00e676] border-t-transparent rounded-full mx-auto" />
          <p className="text-xs font-mono text-[#8b949e]">Generating personalized 52-week calendar projection...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !roadmapData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117] text-[#c9d1d9] p-4">
        <div className="max-w-md w-full bg-[#161b22] border border-red-500/50 rounded-xl p-6 text-center font-mono">
          <p className="text-red-400 font-bold mb-4">⚠️ {errorMsg || "Unable to load roadmap."}</p>
          <Link
            href="/onboarding"
            className="px-4 py-2 rounded bg-[#00e676] text-black text-xs font-bold hover:bg-[#00c853]"
          >
            Go to Onboarding
          </Link>
        </div>
      </div>
    );
  }

  const { schedule, phases } = roadmapData;
  const dayCompletedMap = progressSummary?.dayCompletionStatus || {};

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">
      {/* Modals */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        schedule={schedule}
        onScheduleUpdated={(updatedSchedule) => {
          setRoadmapData((prev) => (prev ? { ...prev, schedule: updatedSchedule } : null));
        }}
      />

      <CommandPalette
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        phases={phases}
        onSelectDay={handleSelectDayById}
      />

      {activePhaseExamCanonicalId && (
        <QuizRunnerModal
          isOpen={!!activePhaseExamCanonicalId}
          onClose={() => setActivePhaseExamCanonicalId(null)}
          canonicalId={activePhaseExamCanonicalId}
        />
      )}

      {/* Top Navbar */}
      <header className="border-b border-[#30363d] bg-[#161b22]/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/dashboard" className="text-[#00e676] font-bold tracking-tight text-lg hover:opacity-80">
              TOP 1%
            </Link>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#21262d] text-[#8b949e] font-medium border border-[#30363d]">
              52-WEEK ROADMAP
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {progressSummary && (
              <div className="hidden md:flex items-center space-x-2 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-1 text-xs">
                <span className="text-[#8b949e]">Completed:</span>
                <span className="font-bold text-[#00e676]">{progressSummary.totalCompleted}</span>
                <span className="text-[#8b949e]">/ {progressSummary.totalTopics}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#00e676]/10 text-[#00e676] font-semibold">
                  {progressSummary.globalPercentage}%
                </span>
              </div>
            )}

            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#0d1117] border border-[#30363d] text-[#8b949e] hover:text-white hover:border-[#8b949e] flex items-center space-x-2 transition-colors"
            >
              <span>🔍</span>
              <span className="hidden sm:inline">Search Topics</span>
              <kbd className="text-[10px] px-1 rounded bg-[#21262d]">⌘K</kbd>
            </button>

            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-white flex items-center space-x-1.5 transition-colors"
            >
              <span>📅</span>
              <span>Manage Schedule</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Roadmap Workspace Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Dynamic Schedule Banner */}
        <div className="bg-gradient-to-r from-[#161b22] to-[#0d1117] border border-[#30363d] rounded-xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                  schedule.isPaused
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : "bg-[#00e676]/20 text-[#00e676] border border-[#00e676]/40"
                }`}
              >
                {schedule.isPaused ? "⏸️ Course Paused" : "▶️ Active Journey"}
              </span>
              <span className="text-xs text-[#8b949e]">
                Version {roadmapData.version}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-2">
              Interactive Career Roadmap
            </h1>
            <p className="text-xs text-[#8b949e] mt-1">
              Role Goal: <strong className="text-white">{schedule.targetRole}</strong> • Total Duration: 52 Weeks (364 Days)
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-xs font-mono">
            <div>
              <span className="text-[#8b949e]">Start Date:</span>
              <p className="font-bold text-white">{schedule.startDate}</p>
            </div>
            <div className="border-l border-[#30363d] pl-4">
              <span className="text-[#8b949e]">Target Graduation:</span>
              <p className="font-bold text-[#00e676]">{schedule.projectedEndDate}</p>
            </div>
            <div className="border-l border-[#30363d] pl-4">
              <span className="text-[#8b949e]">Remaining:</span>
              <p className="font-bold text-white">{schedule.daysRemaining}d</p>
            </div>
          </div>
        </div>

        {/* 2-Column Content: Left Roadmap Phases, Right Active Day Drawer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* LEFT 2 COLS: PHASES & WEEKS HIERARCHY */}
          <div className="lg:col-span-2 space-y-8">
            {phases.map((phase) => {
              const phaseRollup = progressSummary?.phaseProgress.find(
                (p) => p.phaseNumber === phase.phaseNumber,
              );

              return (
                <div
                  key={phase.phaseNumber}
                  className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-lg"
                >
                  {/* Phase Header */}
                  <div className="p-5 border-b border-[#30363d] bg-[#0d1117]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <span
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: phase.phaseColor || "#00e676" }}
                      />
                      <div>
                        <h2 className="text-base font-bold font-mono text-white">
                          Phase {phase.phaseNumber}: {phase.phaseName}
                        </h2>
                        <p className="text-xs text-[#8b949e]">
                          {phase.totalWeeks} Modules • {phase.totalDays} Days • {phase.totalTopics} Topics
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {phaseRollup && (
                        <div className="text-right font-mono">
                          <span className="text-xs text-[#00e676] font-bold">
                            {phaseRollup.completed} / {phaseRollup.total} ({phaseRollup.percentage}%)
                          </span>
                          <div className="w-24 bg-[#21262d] rounded-full h-1.5 mt-1 overflow-hidden">
                            <div
                              className="bg-[#00e676] h-full transition-all"
                              style={{ width: `${phaseRollup.percentage}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setActivePhaseExamCanonicalId(`phase-${phase.phaseNumber}`)}
                        className="px-3 py-1.5 text-xs font-mono rounded-lg bg-gradient-to-r from-amber-500/20 to-[#00e676]/20 hover:from-amber-500/30 hover:to-[#00e676]/30 border border-amber-500/40 text-amber-300 font-bold transition-all flex items-center space-x-1"
                      >
                        <span>🎖️</span>
                        <span>Phase Exam</span>
                      </button>

                      {phase.salaryMeta && (
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-[#00e676] bg-[#00e676]/10 px-2.5 py-1 rounded border border-[#00e676]/30">
                            {phase.salaryMeta.min}–{phase.salaryMeta.max} LPA
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Weeks Accordions */}
                  <div className="divide-y divide-[#30363d]">
                    {phase.weeks.map((week) => {
                      const weekKey = `p${phase.phaseNumber}-w${week.weekNumber}`;
                      const isExpanded = !!expandedWeeks[weekKey];

                      return (
                        <div key={weekKey} className="transition-colors">
                          {/* Week Header Toggle */}
                          <button
                            type="button"
                            onClick={() => toggleWeek(weekKey)}
                            className="w-full p-4 flex items-center justify-between hover:bg-[#21262d] text-left transition-colors font-mono"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-xs text-[#8b949e] font-bold">
                                {isExpanded ? "▼" : "▶"}
                              </span>
                              <div>
                                <span className="text-xs font-bold text-white">
                                  Week {week.weekNumber}: {week.weekTitle}
                                </span>
                                <p className="text-[11px] text-[#8b949e]">
                                  {week.days.length} Study Days • Projected: {week.days[0]?.projectedDate} – {week.days[week.days.length - 1]?.projectedDate}
                                </p>
                              </div>
                            </div>

                            <span className="text-xs px-2 py-0.5 rounded bg-[#0d1117] text-[#58a6ff] border border-[#30363d]">
                              {week.days.length}d
                            </span>
                          </button>

                          {/* Week Days Row */}
                          {isExpanded && (
                            <div className="p-4 bg-[#0d1117] space-y-2.5">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {week.days.map((day) => {
                                  const isSelected = selectedDay?.canonicalDayId === day.canonicalDayId;
                                  const isDayDone = !!dayCompletedMap[day.canonicalDayId];

                                  return (
                                    <div
                                      id={day.canonicalDayId}
                                      key={day.canonicalDayId}
                                      onClick={() => setSelectedDay(day)}
                                      className={`p-3 rounded-lg border cursor-pointer font-mono text-xs transition-all ${
                                        isSelected
                                          ? "bg-[#00e676]/15 border-[#00e676] text-white shadow-md shadow-[#00e676]/10"
                                          : isDayDone
                                          ? "bg-[#00e676]/5 border-[#00e676]/40 text-[#c9d1d9]"
                                          : day.isCurrentDay
                                          ? "bg-[#58a6ff]/10 border-[#58a6ff] text-white"
                                          : "bg-[#161b22] border-[#30363d] hover:border-[#8b949e] text-[#c9d1d9]"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-1.5">
                                          <span className="font-bold text-[#58a6ff]">
                                            {day.canonicalDayId}
                                          </span>
                                          {isDayDone && (
                                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#00e676] text-black font-black">
                                              ✓ DONE
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[11px] text-[#8b949e]">
                                          📅 {day.projectedDate}
                                        </span>
                                      </div>

                                      <p className="font-bold text-white text-xs mt-1 truncate">
                                        {day.title}
                                      </p>

                                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#30363d]/60 text-[10px]">
                                        <span className="text-[#8b949e]">
                                          {day.subtopics?.length || 0} topics
                                        </span>
                                        {day.isCurrentDay && (
                                          <span className="px-1.5 py-0.2 rounded bg-[#58a6ff] text-black font-bold">
                                            TODAY
                                          </span>
                                        )}
                                        {day.isRestDay && (
                                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                                            REST DAY
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT 1 COL: SELECTED DAY DETAILS, WORKSPACE ACTION & RESOURCES */}
          <div className="lg:col-span-1 sticky top-24 space-y-6">
            {selectedDay ? (
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-xl font-mono text-xs space-y-4">
                {/* Day Header */}
                <div className="border-b border-[#30363d] pb-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-[#0d1117] text-[#58a6ff] font-bold border border-[#30363d]">
                      {selectedDay.canonicalDayId}
                    </span>
                    <span className="text-[#8b949e]">
                      📅 {selectedDay.projectedDate}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-2">
                    {selectedDay.title}
                  </h3>
                  {selectedDay.description && (
                    <p className="text-[#8b949e] text-xs mt-1 leading-relaxed">
                      {selectedDay.description}
                    </p>
                  )}
                </div>

                {/* Direct Action: Jump to Daily Learning Workspace */}
                <Link
                  href={`/workspace?day=${selectedDay.canonicalDayId}`}
                  className="block w-full text-center py-2.5 px-4 rounded-lg bg-[#00e676] hover:bg-[#00c853] text-black font-bold text-xs shadow-md shadow-[#00e676]/20 transition-all font-mono"
                >
                  🚀 Open Daily Workspace ({selectedDay.canonicalDayId})
                </Link>

                {/* Subtopics Checklist Preview */}
                <div>
                  <h4 className="text-xs font-bold text-white mb-2 flex items-center space-x-1">
                    <span>📌</span>
                    <span>Subtopics & Concepts ({selectedDay.subtopics?.length || 0})</span>
                  </h4>
                  <ul className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {(selectedDay.subtopics || []).map((st) => (
                      <li
                        key={st.topicId}
                        className="p-2 rounded bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] text-[11px]"
                      >
                        • {st.text}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Skip Directives */}
                {selectedDay.skipDirectives && selectedDay.skipDirectives.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2 text-[10px] font-semibold text-[#8b949e] uppercase tracking-wider">
                      <span>SKIP</span>
                      <div className="flex-1 h-[1px] bg-[#30363d]" />
                    </div>
                    <div className="bg-[#f85149]/10 border border-[#f85149]/20 rounded-xl p-3.5 space-y-2">
                      <div className="text-xs font-semibold text-[#f85149]">
                        Do not waste time on:
                      </div>
                      <div className="space-y-1">
                        {selectedDay.skipDirectives.map((skip, sIdx) => (
                          <div key={sIdx} className="text-xs text-red-300/80 flex items-start space-x-2 leading-relaxed">
                            <span className="text-[#f85149] font-bold">✕</span>
                            <span>{skip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Resource Links Catalog */}
                <div>
                  <h4 className="text-xs font-bold text-white mb-2 flex items-center space-x-1">
                    <span>🔗</span>
                    <span>Curated Resources ({selectedDay.resources?.length || 0})</span>
                  </h4>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {(selectedDay.resources || []).map((res, rIdx) => {
                      const icon =
                        res.type === "yt" || res.type === "video"
                          ? "📹"
                          : res.type === "github"
                          ? "🐙"
                          : res.type === "doc"
                          ? "📚"
                          : "📄";
                      return (
                        <a
                          key={rIdx}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-2 rounded bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-[#58a6ff] hover:text-[#00e676] text-[11px] transition-colors truncate"
                        >
                          <span className="mr-1.5">{icon}</span>
                          {res.title}
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 text-center font-mono text-xs text-[#8b949e]">
                Select any study day from the roadmap to inspect its concepts and curated resources.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
