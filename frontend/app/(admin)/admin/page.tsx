"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/api/admin";
import { AdminMetricsDTO, CurriculumVersionSummaryDTO } from "@top1/shared";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetricsDTO | null>(null);
  const [versions, setVersions] = useState<CurriculumVersionSummaryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [m, v] = await Promise.all([
          adminApi.getDashboardMetrics(),
          adminApi.getVersions(),
        ]);
        setMetrics(m);
        setVersions(v.versions);
      } catch (err: any) {
        setError(err.message || "Failed to load admin metrics");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-800 animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-800/60 animate-pulse rounded-xl border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
        <div className="font-semibold text-base mb-1">Error Loading Dashboard</div>
        <div className="text-sm opacity-90">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Control Center</h1>
          <p className="text-sm text-slate-400 mt-1">
            Canonical curriculum management, zero-knowledge quiz authoring, and semantic publishing engine.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/curriculum"
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-red-600/20"
          >
            Curriculum Editor
          </Link>
          <Link
            href="/admin/quizzes"
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors border border-slate-700"
          >
            Quiz Banks
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/90 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Learners</div>
          <div className="text-3xl font-bold text-white tracking-tight">{metrics?.totalLearners ?? 0}</div>
          <div className="text-xs text-emerald-400 flex items-center gap-1">
            <span>●</span> {metrics?.activeLearners ?? 0} Onboarded & Active
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/90 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Curriculum Days</div>
          <div className="text-3xl font-bold text-white tracking-tight">{metrics?.totalCurriculumNodes ?? 0}</div>
          <div className="text-xs text-slate-400">{metrics?.totalTopics ?? 0} Total Deep-Dive Subtopics</div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/90 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quiz Questions</div>
          <div className="text-3xl font-bold text-white tracking-tight">{metrics?.totalQuizQuestions ?? 0}</div>
          <div className="text-xs text-indigo-400">{metrics?.totalQuizBanks ?? 0} Quiz Banks (Daily/Weekly/Exams)</div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/90 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Curriculum Versions</div>
          <div className="text-3xl font-bold text-white tracking-tight">{metrics?.curriculumVersionsCount ?? 1}</div>
          <div className="text-xs text-amber-400 font-mono">Active Version: v{metrics?.activeCurriculumVersion}</div>
        </div>
      </div>

      {/* Curriculum Versions Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Curriculum Releases & Drafts</h2>
            <p className="text-xs text-slate-400">
              Immutable version history. Active learners remain pinned to their enrolled version.
            </p>
          </div>
          <Link
            href="/admin/curriculum"
            className="text-xs font-medium text-red-400 hover:text-red-300 flex items-center gap-1"
          >
            Manage Versions →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-950/60 text-slate-400 font-mono border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Nodes / Days</th>
                <th className="py-3 px-4">Topics</th>
                <th className="py-3 px-4">Phases / Weeks</th>
                <th className="py-3 px-4">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {versions.map((v) => (
                <tr key={v.version} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">v{v.version}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium ${
                        v.status === "published"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : v.status === "draft"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : "bg-slate-500/10 text-slate-400 border border-slate-500/30"
                      }`}
                    >
                      {v.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono">{v.nodeCount}</td>
                  <td className="py-3.5 px-4 font-mono">{v.totalTopics}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-400">
                    {v.phaseCount} Phases / {v.weekCount} Weeks
                  </td>
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-400">
                    {new Date(v.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Access Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/curriculum"
          className="group block p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-red-500/40 transition-all space-y-3"
        >
          <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors">
              Curriculum Node Editor
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Edit topics, subtopics, resources, and skip directives with live JSON preview and cache invalidation.
            </p>
          </div>
        </Link>

        <Link
          href="/admin/quizzes"
          className="group block p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-3"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
              Zero-Knowledge Question Banks
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Author question options, designate correct answer indices, and write comprehensive markdown explanations.
            </p>
          </div>
        </Link>

        <Link
          href="/admin/audit"
          className="group block p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
              Security & Audit Trail
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Inspect immutable audit records with before/after state diffs, timestamps, and operator IP addresses.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
