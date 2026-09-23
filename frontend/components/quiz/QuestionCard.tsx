"use client";

import React, { useEffect } from "react";
import { QuizQuestionClientDTO } from "@top1/shared";

interface QuestionCardProps {
  question: QuizQuestionClientDTO;
  currentIndex: number;
  totalQuestions: number;
  selectedIndex: number;
  onSelectOption: (optionIndex: number) => void;
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  selectedIndex,
  onSelectOption,
}) => {
  // Keyboard Hotkeys: 1, 2, 3, 4 or A, B, C, D to pick options
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key >= "1" && key <= "6") {
        const idx = parseInt(key, 10) - 1;
        if (idx < question.options.length) {
          onSelectOption(idx);
        }
      } else if (key >= "A" && key <= "F") {
        const idx = key.charCodeAt(0) - 65;
        if (idx < question.options.length) {
          onSelectOption(idx);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [question.options.length, onSelectOption]);

  return (
    <div className="space-y-6 font-mono">
      {/* Question Header */}
      <div>
        <div className="flex items-center justify-between text-xs text-[#8b949e] mb-2">
          <span className="text-[#58a6ff] font-bold">
            QUESTION {currentIndex + 1} OF {totalQuestions}
          </span>
          <span className="text-[11px] text-[#8b949e]">Hotkeys: [1-4] or [A-D]</span>
        </div>
        <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
          {question.questionText}
        </h3>
      </div>

      {/* Options List */}
      <div className="space-y-3">
        {question.options.map((opt, idx) => {
          const isSelected = selectedIndex === idx;
          const letter = OPTION_LETTERS[idx] || String(idx + 1);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectOption(idx)}
              className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-mono transition-all flex items-start space-x-3 select-none ${
                isSelected
                  ? "bg-[#58a6ff]/15 border-[#58a6ff] text-white shadow-md shadow-[#58a6ff]/10"
                  : "bg-[#0d1117] border-[#30363d] hover:border-[#8b949e] text-[#c9d1d9]"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                  isSelected
                    ? "bg-[#58a6ff] text-black"
                    : "bg-[#21262d] text-[#8b949e] border border-[#30363d]"
                }`}
              >
                {letter}
              </span>
              <span className="leading-relaxed flex-1 mt-0.5">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
