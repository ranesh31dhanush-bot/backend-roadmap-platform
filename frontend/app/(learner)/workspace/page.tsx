"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { fetchApi } from "@/lib/api/client";
import { toggleTopicProgress } from "@/lib/api/progress";
import { fetchQuizByCanonicalId } from "@/lib/api/quiz";
import {
  LearnerRoadmapResponse,
  RoadmapDayDTO,
  ProgressSummaryDTO,
  QuizBankDTO,
  QuizResultDTO,
  UserStreakDTO,
} from "@top1/shared";
import { QuizRunnerModal } from "@/components/quiz/QuizRunnerModal";
import { NotesEditor } from "@/components/notes/NotesEditor";
import { CustomLinksManager } from "@/components/notes/CustomLinksManager";
import { PomodoroTimer } from "@/components/timer/PomodoroTimer";
import { fetchUserStreak } from "@/lib/api/streaks";
import { LegacyMigrationBanner } from "@/components/migration/LegacyMigrationBanner";

export default function DailyLearningWorkspacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dayParam = searchParams.get("day");

  const { isAuthenticated, isLoading: authLoading, checkAuth } = useAuthStore();

  const [roadmapData, setRoadmapData] = useState<LearnerRoadmapResponse | null>(null);
  const [currentDay, setCurrentDay] = useState<RoadmapDayDTO | null>(null);
  const [dayList, setDayList] = useState<RoadmapDayDTO[]>([]);
  const [streakData, setStreakData] = useState<UserStreakDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Optimistic Completed Topics Set
  const [completedTopicIds, setCompletedTopicIds] = useState<Set<string>>(new Set());
  const [globalTotalCompleted, setGlobalTotalCompleted] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Quiz Modal State
  const [isQuizModalOpen, setIsQuizModalOpen] = useState<boolean>(false);
  const [dayQuizBank, setDayQuizBank] = useState<QuizBankDTO | null>(null);

  // Load Roadmap & Progress Summary
  useEffect(() => {
    let isMounted = true;

    async function loadWorkspace() {
      let authed = isAuthenticated;
      if (!authed) {
        const user = await checkAuth();
        authed = !!user;
      }

      if (!authed) {
        router.replace("/login");
        return;
      }

      try {
        setLoading(true);
        setErrorMsg(null);

        const [roadmap, summary, streak] = await Promise.all([
          fetchApi<LearnerRoadmapResponse>("/schedule/roadmap"),
          fetchApi<ProgressSummaryDTO>("/progress/summary"),
          fetchUserStreak().catch(() => null),
        ]);

        if (!isMounted) return;

        setRoadmapData(roadmap);
        setCompletedTopicIds(new Set(summary.completedTopicIds));
        setGlobalTotalCompleted(summary.totalCompleted);
        setStreakData(streak);

        // Flatten all 147 days
        const allDays = roadmap.phases.flatMap((p) => p.weeks.flatMap((w) => w.days));
        setDayList(allDays);

        // Determine active target day
        let targetDay: RoadmapDayDTO | undefined;
        if (dayParam) {
          targetDay = allDays.find((d) => d.canonicalDayId === dayParam);
        }
        if (!targetDay) {
          targetDay = allDays.find((d) => d.isCurrentDay) || allDays[0];
        }

        if (targetDay && isMounted) {
          setCurrentDay(targetDay);
          const quiz = await fetchQuizByCanonicalId(targetDay.canonicalDayId);
          if (isMounted) {
            setDayQuizBank(quiz);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err.message || "Failed to load workspace data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadWorkspace();

    return () => {
      isMounted = false;
    };
  }, [authLoading, isAuthenticated, router, dayParam, checkAuth]);

  // Navigate to specific canonical day
  const navigateToDay = useCallback(
    async (targetCanonicalId: string) => {
      const found = dayList.find((d) => d.canonicalDayId === targetCanonicalId);
      if (found) {
        setCurrentDay(found);
        router.push(`/workspace?day=${targetCanonicalId}`, { scroll: false });
        const quiz = await fetchQuizByCanonicalId(targetCanonicalId);
        setDayQuizBank(quiz);
      }
    },
    [dayList, router],
  );

  // Keyboard navigation shortcuts: '[' for Prev Day, ']' for Next Day
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (!currentDay || dayList.length === 0) return;

      const currentIndex = dayList.findIndex(
        (d) => d.canonicalDayId === currentDay.canonicalDayId,
      );
      if (currentIndex === -1) return;

      if (e.key === "[" && currentIndex > 0) {
        e.preventDefault();
        navigateToDay(dayList[currentIndex - 1].canonicalDayId);
      } else if (e.key === "]" && currentIndex < dayList.length - 1) {
        e.preventDefault();
        navigateToDay(dayList[currentIndex + 1].canonicalDayId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentDay, dayList, navigateToDay]);

  // Optimistic Toggle Handler (<16ms feedback + auto-rollback on error)
  const handleToggleTopic = async (topicId: string) => {
    if (!currentDay) return;

    const previousCompleted = new Set(completedTopicIds);
    const isCurrentlyCompleted = previousCompleted.has(topicId);

    // 1. Optimistic Update (Immediate UI state mutation)
    const nextCompleted = new Set(previousCompleted);
    if (isCurrentlyCompleted) {
      nextCompleted.delete(topicId);
      setGlobalTotalCompleted((prev) => Math.max(0, prev - 1));
    } else {
      nextCompleted.add(topicId);
      setGlobalTotalCompleted((prev) => prev + 1);
    }
    setCompletedTopicIds(nextCompleted);
    setSyncError(null);

    // 2. Background Ledger Synchronization
    try {
      setIsSyncing(true);
      const res = await toggleTopicProgress(topicId, currentDay.canonicalDayId);
      // Synchronize with authoritative server state
      setGlobalTotalCompleted(res.globalProgress.completed);
    } catch (err: any) {
      // 3. Rollback on failure
      setCompletedTopicIds(previousCompleted);
      setGlobalTotalCompleted((prev) => (isCurrentlyCompleted ? prev + 1 : Math.max(0, prev - 1)));
      setSyncError(err.message || "Failed to update progress. Changes rolled back.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleQuizCompleted = (result: QuizResultDTO) => {
    setDayQuizBank((prev) =>
      prev
        ? {
            ...prev,
            highScore: Math.max(prev.highScore || 0, result.scorePercentage),
            passed: prev.passed || result.passed,
          }
        : null,
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117] text-[#c9d1d9]">
        <div className="text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-2 border-[#00e676] border-t-transparent rounded-full mx-auto" />
          <p className="text-xs font-mono text-[#8b949e]">Loading Daily Learning Workspace...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !roadmapData || !currentDay) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117] text-[#c9d1d9] p-4">
        <div className="max-w-md w-full bg-[#161b22] border border-red-500/50 rounded-xl p-6 text-center font-mono space-y-4">
          <p className="text-red-400 font-bold">⚠️ {errorMsg || "Workspace day not found."}</p>
          <Link
            href="/curriculum"
            className="inline-block px-4 py-2 rounded bg-[#00e676] text-black text-xs font-bold hover:bg-[#00c853]"
          >
            Back to Interactive Roadmap
          </Link>
        </div>
      </div>
    );
  }

  // Calculate Day Progress metrics
  const daySubtopics = currentDay.subtopics || [];
  const completedInCurrentDay = daySubtopics.filter((st) =>
    completedTopicIds.has(st.topicId),
  ).length;
  const totalInCurrentDay = daySubtopics.length;
  const dayPercentage =
    totalInCurrentDay > 0
      ? Number(((completedInCurrentDay / totalInCurrentDay) * 100).toFixed(0))
      : 0;
  const isDayCompleted = totalInCurrentDay > 0 && completedInCurrentDay === totalInCurrentDay;

  // Global Progress metrics
  const totalCurriculumTopics = 813;
  const globalPercentage = Number(
    ((globalTotalCompleted / totalCurriculumTopics) * 100).toFixed(1),
  );

  // Day Navigation indexes
  const currentDayIndex = dayList.findIndex(
    (d) => d.canonicalDayId === currentDay.canonicalDayId,
  );
  const prevDay = currentDayIndex > 0 ? dayList[currentDayIndex - 1] : null;
  const nextDay = currentDayIndex < dayList.length - 1 ? dayList[currentDayIndex + 1] : null;

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col">
      {/* Quiz Runner Modal */}
      {currentDay && (
        <QuizRunnerModal
          isOpen={isQuizModalOpen}
          onClose={() => setIsQuizModalOpen(false)}
          canonicalId={currentDay.canonicalDayId}
          onQuizCompleted={handleQuizCompleted}
        />
      )}

      {/* Top Telemetry Header */}
      <header className="border-b border-[#30363d] bg-[#161b22]/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="text-[#00e676] font-mono font-black text-lg hover:opacity-80 transition-opacity"
            >
              TOP 1%
            </Link>
            <span className="text-[#30363d]">/</span>
            <Link
              href="/curriculum"
              className="text-xs font-mono text-[#8b949e] hover:text-white transition-colors"
            >
              Roadmap
            </Link>
            <span className="text-[#30363d]">/</span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#21262d] text-[#58a6ff] font-mono border border-[#30363d]">
              {currentDay.canonicalDayId}
            </span>
          </div>

            {/* Center/Right: Telemetry Counters & Navigation */}
            <div className="flex items-center space-x-3">
              {streakData && (
                <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 text-xs font-mono rounded bg-[#21262d] border border-amber-500/30 text-amber-300">
                  <span>🔥</span>
                  <span className="font-bold">{streakData.currentStreak}d</span>
                </div>
              )}

              {/* Notes Explorer Link */}
              <Link
                href="/notes"
                className="hidden sm:flex items-center space-x-1 px-2.5 py-1 text-xs font-mono rounded bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#58a6ff] hover:text-[#00e676] transition-colors"
              >
                <span>📝</span>
                <span>Notes</span>
              </Link>

            {/* Global Progress Pill */}
            <div className="hidden md:flex items-center space-x-2 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-1 font-mono text-xs">
              <span className="text-[#8b949e]">Global:</span>
              <span className="font-bold text-[#00e676]">{globalTotalCompleted}</span>
              <span className="text-[#8b949e]">/ {totalCurriculumTopics}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#00e676]/10 text-[#00e676] font-bold">
                {globalPercentage}%
              </span>
            </div>

            {/* Prev / Next Day Shortcuts */}
            <div className="flex items-center space-x-1.5">
              <button
                disabled={!prevDay}
                onClick={() => prevDay && navigateToDay(prevDay.canonicalDayId)}
                title="Previous Day (Hotkey: [)"
                className="px-2.5 py-1 text-xs font-mono rounded bg-[#21262d] hover:bg-[#30363d] disabled:opacity-30 disabled:cursor-not-allowed border border-[#30363d] text-[#c9d1d9] flex items-center space-x-1"
              >
                <span>←</span>
                <span className="hidden sm:inline">Prev</span>
                <kbd className="text-[10px] px-1 rounded bg-[#0d1117] text-[#8b949e]">[</kbd>
              </button>

              <button
                disabled={!nextDay}
                onClick={() => nextDay && navigateToDay(nextDay.canonicalDayId)}
                title="Next Day (Hotkey: ])"
                className="px-2.5 py-1 text-xs font-mono rounded bg-[#21262d] hover:bg-[#30363d] disabled:opacity-30 disabled:cursor-not-allowed border border-[#30363d] text-[#c9d1d9] flex items-center space-x-1"
              >
                <span className="hidden sm:inline">Next</span>
                <kbd className="text-[10px] px-1 rounded bg-[#0d1117] text-[#8b949e]">]</kbd>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sync Error Toast */}
      {syncError && (
        <div className="bg-red-950/80 border-b border-red-500/50 p-3 text-center text-xs font-mono text-red-200 flex items-center justify-center space-x-2 animate-fadeIn">
          <span>⚠️ {syncError}</span>
          <button
            onClick={() => setSyncError(null)}
            className="ml-3 text-xs underline text-red-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Workspace Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1 w-full">
        {/* Legacy LocalStorage Migration Banner (Sprint 8: MIGR-001/004) */}
        <LegacyMigrationBanner />

        {/* Day Header Banner with Progress Bar */}
        <div className="bg-gradient-to-r from-[#161b22] to-[#0d1117] border border-[#30363d] rounded-xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2.5 py-0.5 rounded font-mono font-bold bg-[#58a6ff]/20 text-[#58a6ff] border border-[#58a6ff]/40">
                  {currentDay.canonicalDayId.toUpperCase()}
                </span>
                <span className="text-xs text-[#8b949e] font-mono">
                  📅 Projected: {currentDay.projectedDate}
                </span>
                {currentDay.isCurrentDay && (
                  <span className="text-xs px-2 py-0.2 rounded bg-[#00e676] text-black font-bold font-mono">
                    TODAY
                  </span>
                )}
                {currentDay.isRestDay && (
                  <span className="text-xs px-2 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold font-mono">
                    REST DAY
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-3">
                {currentDay.title}
              </h1>

              {currentDay.description && (
                <p className="text-sm text-[#8b949e] mt-2 max-w-3xl leading-relaxed">
                  {currentDay.description}
                </p>
              )}
            </div>

            {/* Day Progress Telemetry Card & Quiz Action */}
            <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 min-w-[240px] space-y-3 text-right">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8b949e]">Day Progress:</span>
                <span className={`font-semibold ${isDayCompleted ? "text-[#00e676]" : "text-white"}`}>
                  {completedInCurrentDay} / {totalInCurrentDay} Done
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#21262d] rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isDayCompleted ? "bg-[#00e676]" : "bg-[#58a6ff]"
                  }`}
                  style={{ width: `${dayPercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#8b949e]">
                <span>{dayPercentage}% Complete</span>
                {isSyncing && <span className="text-[#58a6ff] animate-pulse">Syncing...</span>}
              </div>

              {/* Daily Quiz Trigger Button */}
              {dayQuizBank ? (
                <button
                  type="button"
                  onClick={() => setIsQuizModalOpen(true)}
                  className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-[#58a6ff]/20 to-[#00e676]/20 border border-[#58a6ff]/40 hover:border-[#00e676] text-white font-bold text-xs flex items-center justify-between transition-all"
                >
                  <span className="flex items-center space-x-1.5">
                    <span>🧠</span>
                    <span>Daily Quiz</span>
                  </span>
                  {dayQuizBank.highScore !== undefined ? (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                        dayQuizBank.passed
                          ? "bg-[#00e676] text-black"
                          : "bg-amber-500/30 text-amber-300"
                      }`}
                    >
                      {dayQuizBank.highScore}%
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#58a6ff] text-black font-bold">
                      START
                    </span>
                  )}
                </button>
              ) : null}
            </div>
          </div>

          {/* Celebratory Banner when Day is 100% Completed */}
          {isDayCompleted && (
            <div className="bg-[#00e676]/10 border border-[#00e676]/40 rounded-lg p-4 flex items-center justify-between text-xs font-mono text-[#00e676]">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🏆</span>
                <span>
                  <strong>Day Completed!</strong> You mastered all {totalInCurrentDay} concepts for this module.
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {dayQuizBank && (
                  <button
                    onClick={() => setIsQuizModalOpen(true)}
                    className="px-3 py-1.5 rounded bg-[#21262d] text-white font-bold border border-[#30363d] hover:bg-[#30363d]"
                  >
                    🧠 Take Quiz ({dayQuizBank.highScore !== undefined ? `${dayQuizBank.highScore}%` : "5 Qs"})
                  </button>
                )}
                {nextDay && (
                  <button
                    onClick={() => navigateToDay(nextDay.canonicalDayId)}
                    className="px-3 py-1.5 rounded bg-[#00e676] text-black font-bold hover:bg-[#00c853] transition-all"
                  >
                    Next Day ({nextDay.canonicalDayId}) →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Main Layout: Subtopics Checklist on Left, Resources & Navigation on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* LEFT 2 COLS: SUBTOPICS CHECKLIST */}
          <div className="lg:col-span-2 space-y-6">
            {/* SKIP Directives Section (from original roadmap) */}
            {currentDay.skipDirectives && currentDay.skipDirectives.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider">
                  <span>SKIP</span>
                  <div className="flex-1 h-[1px] bg-[#30363d]" />
                </div>
                <div className="bg-[#f85149]/10 border border-[#f85149]/20 rounded-xl p-4 space-y-2.5">
                  <div className="text-xs font-semibold text-[#f85149]">
                    Do not waste time on:
                  </div>
                  <div className="space-y-1.5">
                    {currentDay.skipDirectives.map((item, idx) => (
                      <div key={idx} className="text-xs text-red-300/85 flex items-start space-x-2 leading-relaxed">
                        <span className="text-[#f85149] font-bold">✕</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 shadow-lg space-y-6">
              <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
                <div>
                  <h2 className="text-base font-bold tracking-tight text-white flex items-center space-x-2">
                    <span>📌</span>
                    <span>Concepts & Subtopic Action Items</span>
                  </h2>
                  <p className="text-xs text-[#8b949e] mt-1">
                    Check off each subtopic as you learn and implement code.
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#0d1117] text-[#8b949e] border border-[#30363d] font-medium">
                  {completedInCurrentDay} / {totalInCurrentDay}
                </span>
              </div>

              {/* Subtopic Checklist */}
              <div className="space-y-3">
                {daySubtopics.length === 0 ? (
                  <p className="text-xs text-[#8b949e] italic">
                    No individual subtopics listed for this day.
                  </p>
                ) : (
                  daySubtopics.map((st, idx) => {
                    const isChecked = completedTopicIds.has(st.topicId);
                    return (
                      <div
                        key={st.topicId}
                        onClick={() => handleToggleTopic(st.topicId)}
                        className={`p-4 rounded-xl border text-xs cursor-pointer transition-all duration-150 flex items-start space-x-3.5 select-none ${
                          isChecked
                            ? "bg-[#00e676]/10 border-[#00e676]/50 text-white shadow-sm"
                            : "bg-[#0d1117] border-[#30363d] hover:border-[#8b949e] text-[#c9d1d9]"
                        }`}
                      >
                        {/* Custom Styled Checkbox */}
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors mt-0.5 ${
                            isChecked
                              ? "bg-[#00e676] text-black font-bold"
                              : "border-2 border-[#8b949e] bg-[#161b22]"
                          }`}
                        >
                          {isChecked && "✓"}
                        </div>

                        {/* Subtopic Text */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span
                              className={`leading-relaxed text-sm font-medium ${
                                isChecked ? "line-through text-[#8b949e]" : "text-white"
                              }`}
                            >
                              {st.text}
                            </span>
                            <span className="text-[10px] text-[#8b949e] ml-2 font-medium">
                              #{idx + 1}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-[#58a6ff] block mt-1">
                            {st.topicId}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Skip Directives ("⚠️ What to Skip") */}
            {currentDay.skipDirectives && currentDay.skipDirectives.length > 0 && (
              <div className="bg-amber-950/20 border border-amber-500/40 rounded-xl p-6 font-mono space-y-3">
                <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm">
                  <span>⚠️</span>
                  <h3>What to Skip (Anti-Pattern Guardrail)</h3>
                </div>
                <p className="text-xs text-amber-200/80">
                  Avoid getting bogged down in low-ROI topics or deprecated abstractions:
                </p>
                <ul className="space-y-1.5 list-disc list-inside text-xs text-amber-100">
                  {currentDay.skipDirectives.map((skip, sIdx) => (
                    <li key={sIdx} className="leading-relaxed">
                      {skip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Daily Learner Markdown Notes (NOTE-001 / NOTE-002) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-bold tracking-tight text-white flex items-center space-x-2">
                  <span>📝</span>
                  <span>Daily Markdown Notes</span>
                </h2>
                <Link
                  href="/notes"
                  className="text-xs font-medium text-[#58a6ff] hover:text-[#00e676] transition-colors"
                >
                  View All in Notes Explorer →
                </Link>
              </div>
              <NotesEditor key={currentDay.canonicalDayId} canonicalDayId={currentDay.canonicalDayId} />
            </div>
          </div>

          {/* RIGHT 1 COL: POMODORO, CURATED RESOURCES & DAY PICKER */}
          <div className="lg:col-span-1 space-y-6">
            {/* Built-in Pomodoro Study Timer (STRK-004) */}
            <PomodoroTimer
              key={`pomodoro-${currentDay.canonicalDayId}`}
              canonicalDayId={currentDay.canonicalDayId}
            />

            {/* Custom Reference Links Manager (NOTE-003) */}
            <CustomLinksManager
              key={`links-${currentDay.canonicalDayId}`}
              canonicalDayId={currentDay.canonicalDayId}
            />

            {/* Curated Resources Catalog */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-1.5">
                  <span>🔗</span>
                  <span>Curated Resources ({currentDay.resources?.length || 0})</span>
                </h3>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {(currentDay.resources || []).length === 0 ? (
                  <p className="text-xs text-[#8b949e] italic">No external resources attached.</p>
                ) : (
                  currentDay.resources.map((res, rIdx) => {
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
                        className="block p-3 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] hover:border-[#58a6ff] text-[#58a6ff] hover:text-[#00e676] text-xs transition-all"
                      >
                        <div className="flex items-center space-x-2">
                          <span>{icon}</span>
                          <span className="font-semibold truncate flex-1">{res.title}</span>
                          <span className="text-[10px] text-[#8b949e]">↗</span>
                        </div>
                      </a>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick Days Selector / Navigator */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-1.5">
                <span>🗓️</span>
                <span>Module Navigator</span>
              </h3>
              <p className="text-xs text-[#8b949e]">
                Jump to any study day across the 52-week curriculum:
              </p>
              <div className="grid grid-cols-4 gap-1.5 max-h-64 overflow-y-auto pr-1">
                {dayList.map((d) => {
                  const isCurrent = d.canonicalDayId === currentDay.canonicalDayId;
                  const isDone =
                    (d.subtopics || []).length > 0 &&
                    d.subtopics.every((st) => completedTopicIds.has(st.topicId));

                  return (
                    <button
                      key={d.canonicalDayId}
                      onClick={() => navigateToDay(d.canonicalDayId)}
                      className={`p-1.5 rounded text-[10px] font-mono border transition-all text-center ${
                        isCurrent
                          ? "bg-[#00e676] text-black font-black border-[#00e676]"
                          : isDone
                          ? "bg-[#00e676]/20 text-[#00e676] border-[#00e676]/40 font-bold"
                          : d.isCurrentDay
                          ? "bg-[#58a6ff]/20 text-[#58a6ff] border-[#58a6ff]"
                          : "bg-[#0d1117] text-[#8b949e] border-[#30363d] hover:border-[#8b949e]"
                      }`}
                    >
                      {d.canonicalDayId.split("-").slice(1).join("-")}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
