"use client";

import React, { useState } from "react";
import { QuestionExplanationDTO } from "@top1/shared";

interface ExplanationAccordionProps {
  explanations: QuestionExplanationDTO[];
}

export const ExplanationAccordion: React.FC<ExplanationAccordionProps> = ({
  explanations,
}) => {
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({});

  const toggleExpand = (idx: number) => {
    setExpandedIndices((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <div className="space-y-3 font-mono">
      <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
        Question Review & Explanations ({explanations.length})
      </h4>

      <div className="space-y-2">
        {explanations.map((exp, idx) => {
          const isExpanded = !!expandedIndices[idx];

          return (
            <div
              key={exp.questionId || idx}
              className={`rounded-xl border transition-all overflow-hidden ${
                exp.isCorrect
                  ? "bg-[#00e676]/5 border-[#00e676]/30"
                  : "bg-red-950/20 border-red-500/30"
              }`}
            >
              {/* Accordion Toggle Header */}
              <button
                type="button"
                onClick={() => toggleExpand(idx)}
                className="w-full p-3.5 text-left flex items-start justify-between space-x-3 text-xs"
              >
                <div className="flex items-start space-x-2.5 flex-1">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5 ${
                      exp.isCorrect
                        ? "bg-[#00e676] text-black"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {exp.isCorrect ? "✓" : "✕"}
                  </span>
                  <div className="flex-1">
                    <span className="font-bold text-white line-clamp-1">
                      Q{idx + 1}: {exp.questionText}
                    </span>
                    <span
                      className={`text-[11px] font-semibold block mt-0.5 ${
                        exp.isCorrect ? "text-[#00e676]" : "text-red-400"
                      }`}
                    >
                      {exp.isCorrect
                        ? "Correct"
                        : `Your Answer: Option ${exp.selectedOptionIndex + 1} • Correct: Option ${
                            exp.correctOptionIndex + 1
                          }`}
                    </span>
                  </div>
                </div>

                <span className="text-xs text-[#8b949e] font-bold ml-2">
                  {isExpanded ? "▲" : "▼"}
                </span>
              </button>

              {/* Expanded Explanation Body */}
              {isExpanded && (
                <div className="p-4 border-t border-[#30363d] bg-[#0d1117] text-xs space-y-3 leading-relaxed">
                  <div>
                    <span className="text-[#8b949e] block mb-1">Full Question:</span>
                    <p className="text-white font-medium">{exp.questionText}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#161b22] border border-[#30363d]">
                    <span className="text-[#00e676] font-bold block mb-1">
                      💡 Deep-Dive Explanation:
                    </span>
                    <p className="text-[#c9d1d9]">{exp.explanation}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
