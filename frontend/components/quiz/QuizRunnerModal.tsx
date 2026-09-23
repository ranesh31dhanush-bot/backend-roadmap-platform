"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  QuizBankDTO,
  QuizStartResponseDTO,
  QuizResultDTO,
  QuizSubmissionItemDTO,
} from "@top1/shared";
import {
  fetchQuizByCanonicalId,
  startQuizAttempt,
  submitQuizAttempt,
} from "@/lib/api/quiz";
import { QuizTimer } from "./QuizTimer";
import { QuestionCard } from "./QuestionCard";
import { QuizResultsCard } from "./QuizResultsCard";

interface QuizRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  canonicalId: string;
  onQuizCompleted?: (result: QuizResultDTO) => void;
}

export const QuizRunnerModal: React.FC<QuizRunnerModalProps> = ({
  isOpen,
  onClose,
  canonicalId,
  onQuizCompleted,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [_quizBank, setQuizBank] = useState<QuizBankDTO | null>(null);

  // Active Runner State
  const [activeQuiz, setActiveQuiz] = useState<QuizStartResponseDTO | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<QuizResultDTO | null>(null);

  // Initialize Quiz when modal opens
  const initializeQuiz = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      setQuizResult(null);
      setSelectedAnswers({});
      setCurrentQuestionIndex(0);

      const bank = await fetchQuizByCanonicalId(canonicalId);
      if (!bank) {
        setErrorMsg(`No quiz bank found for module '${canonicalId}'`);
        setLoading(false);
        return;
      }
      setQuizBank(bank);

      // Start attempt & receive zero-knowledge questions
      const startData = await startQuizAttempt(bank.id);
      setActiveQuiz(startData);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initialize quiz");
    } finally {
      setLoading(false);
    }
  }, [canonicalId]);

  useEffect(() => {
    if (isOpen) {
      initializeQuiz();
    } else {
      setActiveQuiz(null);
      setQuizResult(null);
    }
  }, [isOpen, initializeQuiz]);

  // Handle Option Selection
  const handleSelectOption = (optionIndex: number) => {
    if (!activeQuiz) return;
    const currentQ = activeQuiz.questions[currentQuestionIndex];
    if (!currentQ) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIndex,
    }));
  };

  // Submit Handler
  const handleSubmitQuiz = async () => {
    if (!activeQuiz || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      // Format answers
      const submissionAnswers: QuizSubmissionItemDTO[] = activeQuiz.questions.map((q) => ({
        questionId: q.id,
        selectedOptionIndex: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : -1,
      }));

      const result = await submitQuizAttempt(
        activeQuiz.quizBankId,
        activeQuiz.attemptId,
        submissionAnswers,
      );

      setQuizResult(result);
      if (onQuizCompleted) {
        onQuizCompleted(result);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-mono">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Top Header */}
        <div className="p-5 border-b border-[#30363d] flex items-center justify-between sticky top-0 bg-[#161b22]/95 backdrop-blur z-20">
          <div className="flex items-center space-x-3">
            <span className="text-[#00e676] font-bold text-base">🧠 QUIZ RUNNER</span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#21262d] text-[#58a6ff] border border-[#30363d]">
              {canonicalId.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {activeQuiz && !quizResult && (
              <QuizTimer
                durationMinutes={activeQuiz.durationMinutes}
                onExpire={handleSubmitQuiz}
                isSubmitting={isSubmitting}
              />
            )}
            <button
              onClick={onClose}
              className="text-[#8b949e] hover:text-white text-lg font-bold p-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1">
          {loading && (
            <div className="py-16 text-center space-y-3">
              <div className="animate-spin h-8 w-8 border-2 border-[#00e676] border-t-transparent rounded-full mx-auto" />
              <p className="text-xs text-[#8b949e]">
                Loading zero-knowledge questions and initializing secure attempt...
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/50 text-red-300 text-xs">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Quiz in Progress */}
          {!loading && activeQuiz && !quizResult && (
            <div className="space-y-6">
              {/* Question Navigation Index Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 border-b border-[#30363d]/60">
                {activeQuiz.questions.map((q, qIdx) => {
                  const isAnswered = selectedAnswers[q.id] !== undefined;
                  const isCurrent = currentQuestionIndex === qIdx;

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(qIdx)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center flex-shrink-0 ${
                        isCurrent
                          ? "bg-[#58a6ff] text-black ring-2 ring-[#58a6ff]/40"
                          : isAnswered
                          ? "bg-[#00e676]/20 text-[#00e676] border border-[#00e676]/40"
                          : "bg-[#0d1117] text-[#8b949e] border border-[#30363d]"
                      }`}
                    >
                      {qIdx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Active Question Card */}
              {activeQuiz.questions[currentQuestionIndex] && (
                <QuestionCard
                  question={activeQuiz.questions[currentQuestionIndex]}
                  currentIndex={currentQuestionIndex}
                  totalQuestions={activeQuiz.questions.length}
                  selectedIndex={
                    selectedAnswers[activeQuiz.questions[currentQuestionIndex].id] !== undefined
                      ? selectedAnswers[activeQuiz.questions[currentQuestionIndex].id]
                      : -1
                  }
                  onSelectOption={handleSelectOption}
                />
              )}

              {/* Footer Question Controls */}
              <div className="pt-4 border-t border-[#30363d] flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-white border border-[#30363d]"
                >
                  ← Previous
                </button>

                <div className="text-xs text-[#8b949e]">
                  {Object.keys(selectedAnswers).length} of {activeQuiz.questions.length} Answered
                </div>

                {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentQuestionIndex((prev) =>
                        Math.min(activeQuiz.questions.length - 1, prev + 1),
                      )
                    }
                    className="px-5 py-2 rounded-xl bg-[#58a6ff] hover:bg-[#58a6ff]/80 text-black font-bold text-xs shadow-md shadow-[#58a6ff]/20"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmitQuiz}
                    className="px-6 py-2.5 rounded-xl bg-[#00e676] hover:bg-[#00c853] text-black font-black text-xs shadow-lg shadow-[#00e676]/20 transition-all flex items-center space-x-1.5"
                  >
                    {isSubmitting ? (
                      <span>Grading on Server...</span>
                    ) : (
                      <>
                        <span>Submit Quiz</span>
                        <span>✓</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Graded Result View */}
          {quizResult && (
            <QuizResultsCard
              result={quizResult}
              onRetake={initializeQuiz}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};
