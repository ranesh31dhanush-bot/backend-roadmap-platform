"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { fetchApi } from "@/lib/api/client";
import { PhaseOverviewDTO, StartOnboardingResponse } from "@top1/shared";

const TARGET_ROLES = [
  { id: "junior", title: "Junior Backend Dev", desc: "Entry-level Node.js / SQL engineering", lpa: "3–8 LPA" },
  { id: "sde1", title: "Backend SDE-I", desc: "REST APIs, Redis, Docker, Transactions", lpa: "6–18 LPA" },
  { id: "sde2", title: "Backend SDE-II", desc: "Microservices, Kafka, Distributed Systems", lpa: "18–45 LPA" },
  { id: "architect", title: "Top 1% Systems Architect", desc: "Zero-downtime, High-throughput Architecture", lpa: "45–120+ LPA" },
];

function getTodayString(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getNextMondayString(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() + (day === 0 ? 1 : 8 - day);
  const nextMon = new Date(d.setDate(diff));
  const yyyy = nextMon.getFullYear();
  const mm = String(nextMon.getMonth() + 1).padStart(2, "0");
  const dd = String(nextMon.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDaysToDateStr(dateStr: string, days: number): string {
  const parts = dateStr.split("-").map(Number);
  const start = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
  return end.toISOString().split("T")[0];
}

function formatDateDisplay(dateStr: string): string {
  try {
    const parts = dateStr.split("-").map(Number);
    const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    return d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return dateStr;
  }
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, setUser } = useAuthStore();

  const [step, setStep] = useState<number>(1);
  const [targetRole, setTargetRole] = useState<string>("Backend SDE-I");
  const [startDate, setStartDate] = useState<string>(getTodayString());
  const [phases, setPhases] = useState<PhaseOverviewDTO[]>([]);
  const [loadingPhases, setLoadingPhases] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Authentication Guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Load Curriculum Phases dynamically from API
  useEffect(() => {
    async function loadPhases() {
      try {
        setLoadingPhases(true);
        const data = await fetchApi<PhaseOverviewDTO[]>("/curriculum/phases");
        setPhases(data);
      } catch (err: any) {
        console.error("Failed to load curriculum phases:", err);
      } finally {
        setLoadingPhases(false);
      }
    }
    loadPhases();
  }, []);

  const completionDate = addDaysToDateStr(startDate, 363);

  const handleSubmitJourney = async () => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await fetchApi<StartOnboardingResponse>("/onboarding/start", {
        method: "POST",
        body: JSON.stringify({
          startDate,
          targetRole,
        }),
      });

      if (user) {
        setUser({
          ...user,
          isOnboarded: true,
        });
      }

      // Navigate to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initialize schedule. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117] text-[#c9d1d9]">
        <div className="animate-spin h-8 w-8 border-2 border-[#00e676] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full">
        {/* Header Badge */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#00e676]/10 text-[#00e676] border border-[#00e676]/30">
            ENGINEER ONBOARDING — SPRINT 2
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white font-mono">
            Personalize Your Top 1% Roadmap
          </h1>
          <p className="mt-2 text-sm text-[#8b949e]">
            Set your target engineering milestone and establish your dynamic 52-week calendar anchor.
          </p>
        </div>

        {/* Wizard Card */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl p-6 sm:p-8">
          {/* Step Indicator */}
          <div className="flex items-center justify-between border-b border-[#30363d] pb-5 mb-6">
            {[
              { num: 1, label: "Target Goal" },
              { num: 2, label: "Start Date" },
              { num: 3, label: "Curriculum Preview" },
            ].map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num)}
                className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                  step === s.num
                    ? "text-[#00e676] font-semibold"
                    : step > s.num
                    ? "text-[#58a6ff]"
                    : "text-[#8b949e]"
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                    step === s.num
                      ? "bg-[#00e676] text-black"
                      : step > s.num
                      ? "bg-[#58a6ff]/20 text-[#58a6ff] border border-[#58a6ff]"
                      : "bg-[#21262d] text-[#8b949e] border border-[#30363d]"
                  }`}
                >
                  {step > s.num ? "✓" : s.num}
                </span>
                <span className="hidden sm:inline font-mono">{s.label}</span>
              </button>
            ))}
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-lg bg-red-900/30 border border-red-500/50 text-red-300 text-sm font-mono">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* STEP 1: TARGET ROLE */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white font-mono">Step 1: Select Your Target Milestone</h2>
                <p className="text-xs text-[#8b949e] mt-1">
                  Choose the backend role you are training towards for your portfolio projects and benchmarks.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TARGET_ROLES.map((r) => {
                  const isSelected = targetRole === r.title;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setTargetRole(r.title)}
                      className={`cursor-pointer p-4 rounded-lg border transition-all ${
                        isSelected
                          ? "bg-[#00e676]/10 border-[#00e676] shadow-lg shadow-[#00e676]/10"
                          : "bg-[#0d1117] border-[#30363d] hover:border-[#8b949e]"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-white font-mono text-sm">{r.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-[#21262d] text-[#00e676] font-mono">
                          {r.lpa}
                        </span>
                      </div>
                      <p className="text-xs text-[#8b949e] mt-2">{r.desc}</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-lg bg-[#00e676] text-black font-mono font-bold text-sm hover:bg-[#00c853] transition-all"
                >
                  Continue to Start Date →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: START DATE SELECTION */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white font-mono">Step 2: Choose Your Start Date</h2>
                <p className="text-xs text-[#8b949e] mt-1">
                  Your start date anchors your personal schedule without changing immutable curriculum IDs.
                </p>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setStartDate(getTodayString())}
                  className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold border transition-all ${
                    startDate === getTodayString()
                      ? "bg-[#00e676]/20 border-[#00e676] text-[#00e676]"
                      : "bg-[#0d1117] border-[#30363d] text-[#c9d1d9] hover:border-[#8b949e]"
                  }`}
                >
                  📅 Today ({formatDateDisplay(getTodayString())})
                </button>
                <button
                  type="button"
                  onClick={() => setStartDate(getNextMondayString())}
                  className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold border transition-all ${
                    startDate === getNextMondayString()
                      ? "bg-[#00e676]/20 border-[#00e676] text-[#00e676]"
                      : "bg-[#0d1117] border-[#30363d] text-[#c9d1d9] hover:border-[#8b949e]"
                  }`}
                >
                  🚀 Next Monday ({formatDateDisplay(getNextMondayString())})
                </button>
              </div>

              {/* Custom Date Picker */}
              <div>
                <label className="block text-xs font-mono text-[#8b949e] mb-1">
                  Custom Start Date (YYYY-MM-DD):
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full sm:w-64 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#00e676]"
                />
              </div>

              {/* Schedule Anchor Summary Box */}
              <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 font-mono text-xs space-y-2">
                <div className="text-[#58a6ff] font-bold">● SCHEDULE PROJECTION</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-[#8b949e]">Start Date:</span>
                    <p className="font-bold text-white">{formatDateDisplay(startDate)}</p>
                  </div>
                  <div>
                    <span className="text-[#8b949e]">Completion Date:</span>
                    <p className="font-bold text-[#00e676]">{formatDateDisplay(completionDate)}</p>
                  </div>
                  <div>
                    <span className="text-[#8b949e]">Total Duration:</span>
                    <p className="font-bold text-white">52 Weeks (364 Days)</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-lg bg-[#21262d] text-[#c9d1d9] font-mono text-sm hover:bg-[#30363d]"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-lg bg-[#00e676] text-black font-mono font-bold text-sm hover:bg-[#00c853] transition-all"
                >
                  Review Roadmap Track →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DYNAMIC ROADMAP PREVIEW & CONFIRMATION */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white font-mono">Step 3: Verify Dynamic Curriculum Phases</h2>
                <p className="text-xs text-[#8b949e] mt-1">
                  Seeded directly from MongoDB. Zero hardcoding.
                </p>
              </div>

              {loadingPhases ? (
                <div className="py-8 flex justify-center items-center">
                  <div className="animate-spin h-6 w-6 border-2 border-[#00e676] border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {phases.map((p) => (
                    <div
                      key={p.phaseNumber}
                      className="p-3.5 bg-[#0d1117] border border-[#30363d] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center space-x-3">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: p.phaseColor || "#00e676" }}
                        />
                        <div>
                          <p className="text-sm font-bold text-white font-mono">
                            Phase {p.phaseNumber}: {p.phaseName}
                          </p>
                          <p className="text-xs text-[#8b949e]">
                            {p.totalWeeks} modules • {p.totalDays} study days • {p.totalTopics} topics
                          </p>
                        </div>
                      </div>

                      {p.salaryMeta && (
                        <div className="text-right">
                          <span className="text-xs font-mono font-semibold text-[#00e676] bg-[#00e676]/10 px-2 py-0.5 rounded border border-[#00e676]/30">
                            {p.salaryMeta.min}–{p.salaryMeta.max} LPA
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Confirmation Callout */}
              <div className="p-4 rounded-lg bg-[#21262d] border border-[#30363d] font-mono text-xs">
                <p className="text-white font-bold">Ready to embark on your Top 1% Journey?</p>
                <p className="text-[#8b949e] mt-1">
                  Target Role: <span className="text-[#00e676] font-bold">{targetRole}</span> • Start Date:{" "}
                  <span className="text-white font-bold">{formatDateDisplay(startDate)}</span>
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-lg bg-[#21262d] text-[#c9d1d9] font-mono text-sm hover:bg-[#30363d]"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmitJourney}
                  disabled={submitting}
                  className="px-8 py-3 rounded-lg bg-[#00e676] text-black font-mono font-bold text-sm hover:bg-[#00c853] transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
                      <span>Initializing...</span>
                    </>
                  ) : (
                    <span>🚀 Start My Journey</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
