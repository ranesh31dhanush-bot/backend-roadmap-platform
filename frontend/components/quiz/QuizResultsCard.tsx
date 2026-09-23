"use client";

import React from "react";
import { QuizResultDTO } from "@top1/shared";
import { ExplanationAccordion } from "./ExplanationAccordion";

interface QuizResultsCardProps {
  result: QuizResultDTO;
  onRetake: () => void;
  onClose: () => void;
}

export const QuizResultsCard: React.FC<QuizResultsCardProps> = ({
  result,
  onRetake,
  onClose,
}) => {
  const isMastered = result.passed; // >= 75%
  const mins = Math.floor(result.timeSpentSeconds / 60);
  const secs = result.timeSpentSeconds % 60;

  return (
    <div className="space-y-6 font-mono">
      {/* Result Hero Header */}
      <div
        className={`p-6 rounded-2xl border text-center space-y-3 ${
          isMastered
            ? "bg-[#00e676]/10 border-[#00e676]/40 shadow-xl shadow-[#00e676]/5"
            : "bg-red-950/20 border-red-500/40 shadow-xl"
        }`}
      >
        <span className="text-3xl sm:text-4xl block">
          {isMastered ? "🏆" : "📚"}
        </span>

        <h2 className="text-xl sm:text-2xl font-bold text-white">
          {isMastered ? "Assessment Mastered!" : "Review Required"}
        </h2>

        {/* Score & Badge */}
        <div className="flex items-center justify-center space-x-3">
          <span
            className={`text-4xl sm:text-5xl font-black ${
              isMastered ? "text-[#00e676]" : "text-red-400"
            }`}
          >
            {result.scorePercentage}%
          </span>
          <div className="text-left">
            <span
              className={`text-xs px-2.5 py-0.5 rounded font-bold uppercase tracking-wider block ${
                isMastered
                  ? "bg-[#00e676] text-black"
                  : "bg-red-500 text-white"
              }`}
            >
              {isMastered ? "PASSED (>=75%)" : "FAILED (<75%)"}
            </span>
            <span className="text-[11px] text-[#8b949e]">
              Personal Best: {result.highScore}%
            </span>
          </div>
        </div>

        {/* Badge Unlock Callout */}
        {result.badgeUnlocked && (
          <div className="p-3 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
            🎖️ Unlocked Certification Badge: {result.badgeUnlocked.toUpperCase()}
          </div>
        )}

        <p className="text-xs text-[#8b949e] max-w-md mx-auto leading-relaxed">
          {isMastered
            ? "Outstanding work! You demonstrated solid command of these backend engineering concepts."
            : "You need at least 75% accuracy to master this module. Review the explanations below and try again."}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#30363d]/60 text-xs">
          <div className="bg-[#0d1117] p-2.5 rounded-lg border border-[#30363d]">
            <span className="text-[#8b949e] block text-[10px]">CORRECT</span>
            <span className="font-bold text-white">
              {result.correctAnswersCount} / {result.totalQuestions}
            </span>
          </div>
          <div className="bg-[#0d1117] p-2.5 rounded-lg border border-[#30363d]">
            <span className="text-[#8b949e] block text-[10px]">TIME SPENT</span>
            <span className="font-bold text-white">
              {mins}m {secs}s
            </span>
          </div>
          <div className="bg-[#0d1117] p-2.5 rounded-lg border border-[#30363d]">
            <span className="text-[#8b949e] block text-[10px]">PASS CRITERIA</span>
            <span className="font-bold text-[#00e676]">75% Accuracy</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onRetake}
          className="flex-1 py-3 px-4 rounded-xl bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-white font-bold text-xs transition-all text-center flex items-center justify-center space-x-1.5"
        >
          <span>🔄</span>
          <span>Retake Quiz</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 px-4 rounded-xl bg-[#00e676] hover:bg-[#00c853] text-black font-bold text-xs transition-all text-center shadow-lg shadow-[#00e676]/10"
        >
          Done & Return to Workspace
        </button>
      </div>

      {/* Explanations Accordion */}
      <ExplanationAccordion explanations={result.explanations} />
    </div>
  );
};
