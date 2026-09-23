import Link from "next/link";
import { Terminal, Shield, Cpu, Flame, Database, Code } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto">
      {/* Top Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-primary text-xs font-mono mb-6">
        <Terminal className="w-3.5 h-3.5" />
        <span>SPRINT 0 — ARCHITECTURE FOUNDATION READY</span>
      </div>

      {/* Main Title */}
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-4">
        Top 1% Backend Developer Roadmap
      </h1>

      <p className="text-text-secondary text-lg md:text-xl max-w-2xl mb-8">
        Build deep. Ship real things. Write about it. The production-grade 52-week career accelerator for elite backend engineers.
      </p>

      {/* Feature Pills */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl mb-10 text-left">
        <div className="p-4 rounded-xl bg-surface border border-border flex items-start gap-3">
          <Database className="w-5 h-5 text-accent-emerald shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-sm text-text-primary">5 Phases & 52 Weeks</div>
            <div className="text-xs text-text-muted">813 curated topics & milestones</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-sm text-text-primary">Zero-Knowledge Quizzes</div>
            <div className="text-xs text-text-muted">Server-evaluated mastery checks</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border flex items-start gap-3">
          <Flame className="w-5 h-5 text-accent-amber shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-sm text-text-primary">21-Day Habit Engine</div>
            <div className="text-xs text-text-muted">Daily streaks & Pomodoro focus</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border flex items-start gap-3">
          <Code className="w-5 h-5 text-accent-cyan shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-sm text-text-primary">Markdown Notes</div>
            <div className="text-xs text-text-muted">XSS-safe autosave & code snippets</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border flex items-start gap-3">
          <Cpu className="w-5 h-5 text-accent-rose shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-sm text-text-primary">Dynamic Scheduling</div>
            <div className="text-xs text-text-muted">Adaptive calendar & pause shifts</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border flex items-start gap-3">
          <Terminal className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-sm text-text-primary">Modular Monolith</div>
            <div className="text-xs text-text-muted">Node.js + Next.js + MongoDB</div>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
        <Link
          href="/register"
          className="w-full sm:w-auto px-8 py-3 rounded-lg bg-[#00e676] text-black font-mono font-bold text-sm hover:bg-[#00c853] transition-all shadow-lg shadow-[#00e676]/20"
        >
          🚀 Start Free Roadmap
        </Link>
        <Link
          href="/login"
          className="w-full sm:w-auto px-8 py-3 rounded-lg bg-[#21262d] text-[#c9d1d9] border border-[#30363d] font-mono text-sm hover:bg-[#30363d] transition-all"
        >
          🔑 Log In
        </Link>
      </div>

      {/* Footer Info */}
      <div className="text-xs text-text-muted font-mono">
        Status: Sprint 2 (Canonical Curriculum & Onboarding) Active • MongoDB Backed
      </div>
    </main>
  );
}
