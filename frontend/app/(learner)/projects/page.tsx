"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CapstoneProjectDTO } from "@top1/shared";
import { fetchCapstoneProjects } from "@/lib/api/projects";

const DIFFICULTY_CONFIG = {
  intermediate: { label: "Intermediate", color: "#58a6ff", bg: "rgba(88,166,255,0.1)" },
  advanced: { label: "Advanced", color: "#f0a500", bg: "rgba(240,165,0,0.1)" },
  expert: { label: "Expert", color: "#f78166", bg: "rgba(247,129,102,0.1)" },
};

const PHASE_COLORS = ["#58a6ff", "#00e676", "#f0a500", "#bc8cff"];


function CapstoneCard({ project }: { project: CapstoneProjectDTO }) {
  const difficulty = DIFFICULTY_CONFIG[project.difficulty];
  const phaseColor = PHASE_COLORS[(project.phase - 1) % PHASE_COLORS.length]!;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden hover:border-[#8b949e] transition-all duration-200 flex flex-col shadow-lg">
      {/* Phase Stripe */}
      <div className="h-1.5 w-full" style={{ background: phaseColor }} />

      <div className="p-6 flex flex-col gap-4 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border"
                style={{ color: phaseColor, borderColor: phaseColor, background: `${phaseColor}15` }}
              >
                PHASE {project.phase}
              </span>
              <span
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border"
                style={{
                  color: difficulty.color,
                  borderColor: difficulty.color,
                  background: difficulty.bg,
                }}
              >
                {difficulty.label.toUpperCase()}
              </span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight leading-snug">
              {project.title}
            </h2>
          </div>
          <span className="text-2xl font-black text-[#21262d]">
            #{String(project.order).padStart(2, "0")}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-[#8b949e] leading-relaxed">
          {project.description}
        </p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="text-[11px] px-2 py-0.5 rounded bg-[#0d1117] border border-[#30363d] text-[#8b949e]"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Objectives (collapsible) */}
        <div className="pt-2 border-t border-[#30363d]">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-[#58a6ff] hover:text-[#00e676] font-medium transition-colors flex items-center gap-1.5"
          >
            <span>{expanded ? "▲ Hide" : "▼ Show"}</span>
            <span>{project.objectives.length} Objectives</span>
          </button>

          {expanded && (
            <ul className="mt-3 space-y-1.5 pl-2 border-l border-[#30363d]">
              {project.objectives.map((obj, i) => (
                <li key={i} className="flex gap-2 text-xs text-[#c9d1d9]">
                  <span className="text-[#00e676]">▹</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Performance Benchmark */}
        {project.performanceBenchmark && (
          <div className="rounded-lg bg-[#0d1117] border border-[#30363d] p-3 mt-auto">
            <p className="text-[10px] font-bold text-[#bc8cff] mb-1 uppercase tracking-wider">
              Performance Benchmark
            </p>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              {project.performanceBenchmark}
            </p>
          </div>
        )}
      </div>

      {/* Architecture Diagram Footer */}
      {project.architectureDiagram && (
        <div className="border-t border-[#21262d] px-6 py-3">
          <p className="text-[10px] font-bold text-[#6e7681] mb-1 uppercase tracking-wider">
            System Flow
          </p>
          <p className="text-[10px] font-mono text-[#6e7681] leading-relaxed break-words">
            {project.architectureDiagram}
          </p>
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<CapstoneProjectDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCapstoneProjects()
      .then((res) => setProjects(res.projects))
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">
      {/* Header Nav */}
      <header className="border-b border-[#30363d] bg-[#161b22]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/dashboard" className="text-[#00e676] font-mono font-black text-lg hover:opacity-80 transition-opacity">
              TOP 1%
            </Link>
            <span className="text-xs px-2 py-0.5 rounded bg-[#21262d] text-[#8b949e] font-mono border border-[#30363d]">
              CAPSTONE PROJECTS
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="text-xs font-mono text-[#8b949e] hover:text-white transition-colors"
            >
              ← Dashboard
            </Link>
            <Link
              href="/workspace"
              className="px-3 py-1.5 text-xs font-mono rounded bg-[#00e676] text-black font-bold hover:bg-[#00c853] transition-all"
            >
              Daily Workspace ⚡
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <div className="inline-block">
            <span className="text-xs font-mono font-semibold text-[#00e676] bg-[#00e676]/10 px-3 py-1 rounded border border-[#00e676]/30">
              SPRINT 10 — PROJ-001
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-mono text-white">
            Capstone Projects
          </h1>
          <p className="text-sm text-[#8b949e] max-w-2xl mx-auto font-mono leading-relaxed">
            Four production-grade engineering projects — one per curriculum phase. Build these to
            demonstrate mastery, build your portfolio, and unlock the Top 1% credential.
          </p>
        </div>

        {/* Phase Legend */}
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { phase: 1, name: "Foundations", color: PHASE_COLORS[0]! },
            { phase: 2, name: "Distributed Systems", color: PHASE_COLORS[1]! },
            { phase: 3, name: "Security & Identity", color: PHASE_COLORS[2]! },
            { phase: 4, name: "Real-Time Architecture", color: PHASE_COLORS[3]! },
          ].map(({ phase, name, color }) => (
            <div
              key={phase}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono"
              style={{ borderColor: `${color}50`, background: `${color}0a` }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span style={{ color }}>Phase {phase}:</span>
              <span className="text-[#8b949e]">{name}</span>
            </div>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-[#161b22] border border-[#30363d] rounded-xl h-80 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-[#161b22] border border-red-500/30 rounded-xl p-8 text-center space-y-3">
            <p className="text-red-400 font-mono text-sm">Failed to load capstone projects</p>
            <p className="text-[#6e7681] font-mono text-xs">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchCapstoneProjects()
                  .then((res) => setProjects(res.projects))
                  .catch((err) => setError(String(err)))
                  .finally(() => setLoading(false));
              }}
              className="px-4 py-2 text-xs font-mono rounded bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-white transition-all"
            >
              Retry
            </button>
          </div>
        )}

        {/* Project Grid */}
        {!loading && !error && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <CapstoneCard key={project.canonicalId} project={project} />
            ))}
          </div>
        )}

        {/* Empty state (data not seeded yet) */}
        {!loading && !error && projects.length === 0 && (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-12 text-center space-y-3">
            <p className="text-4xl">🏗️</p>
            <p className="font-mono font-bold text-white">Capstone projects loading soon</p>
            <p className="text-xs text-[#6e7681] font-mono">
              The admin team is seeding project specifications. Check back shortly.
            </p>
          </div>
        )}

        {/* CTA Footer */}
        <div className="bg-gradient-to-r from-[#161b22] to-[#0d1117] border border-[#30363d] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="font-mono">
            <p className="text-sm font-bold text-white">Ready to build?</p>
            <p className="text-xs text-[#8b949e] mt-0.5">
              Start with Phase 1 topics in the Daily Workspace, then tackle the URL Shortener capstone.
            </p>
          </div>
          <Link
            href="/workspace"
            className="px-6 py-3 text-sm font-mono font-bold rounded-lg bg-[#00e676] text-black hover:bg-[#00c853] transition-all shadow-lg shadow-[#00e676]/20 whitespace-nowrap"
          >
            Start Learning ⚡
          </Link>
        </div>
      </main>
    </div>
  );
}
