"use client";

import React, { useEffect, useState } from "react";
import { adminApi, AdminQuizBankDTO, AdminQuizQuestionDTO } from "@/lib/api/admin";

export default function AdminQuizzesPage() {
  const [banks, setBanks] = useState<AdminQuizBankDTO[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [selectedBank, setSelectedBank] = useState<AdminQuizBankDTO | null>(null);
  const [questions, setQuestions] = useState<AdminQuizQuestionDTO[]>([]);
  const [_loadingBanks, setLoadingBanks] = useState<boolean>(true);
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Question Edit / Create Modal
  const [editingQuestion, setEditingQuestion] = useState<AdminQuizQuestionDTO | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [questionText, setQuestionText] = useState<string>("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(0);
  const [explanation, setExplanation] = useState<string>("");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Load Banks
  useEffect(() => {
    async function loadBanks() {
      try {
        setLoadingBanks(true);
        const res = await adminApi.getQuizBanks();
        setBanks(res.banks);
        if (res.banks.length > 0) {
          setSelectedBankId(res.banks[0]._id);
          setSelectedBank(res.banks[0]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load quiz banks");
      } finally {
        setLoadingBanks(false);
      }
    }
    loadBanks();
  }, []);

  // Load Questions when bank changes
  useEffect(() => {
    if (!selectedBankId) return;

    async function loadQuestions() {
      try {
        setLoadingQuestions(true);
        const res = await adminApi.getQuizQuestions(selectedBankId);
        setSelectedBank(res.bank);
        setQuestions(res.questions);
      } catch (err: any) {
        setError(err.message || "Failed to load questions");
      } finally {
        setLoadingQuestions(false);
      }
    }

    loadQuestions();
  }, [selectedBankId]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setIsCreating(true);
    setEditingQuestion(null);
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectOptionIndex(0);
    setExplanation("");
    setDifficulty("intermediate");
    setModalError(null);
  };

  // Open Edit Modal
  const handleOpenEdit = (q: AdminQuizQuestionDTO) => {
    setIsCreating(false);
    setEditingQuestion(q);
    setQuestionText(q.questionText);
    setOptions([...q.options]);
    setCorrectOptionIndex(q.correctOptionIndex);
    setExplanation(q.explanation);
    setDifficulty(q.difficulty);
    setModalError(null);
  };

  // Option Helpers
  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOpts = options.filter((_, i) => i !== index);
      setOptions(newOpts);
      if (correctOptionIndex >= newOpts.length) {
        setCorrectOptionIndex(0);
      }
    }
  };

  const updateOption = (index: number, val: string) => {
    const newOpts = [...options];
    newOpts[index] = val;
    setOptions(newOpts);
  };

  // Save Question Handler
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBankId) return;

    // Validation
    const cleanOptions = options.map((o) => o.trim());
    if (cleanOptions.some((o) => !o)) {
      setModalError("All option fields must have non-empty text");
      return;
    }

    if (correctOptionIndex < 0 || correctOptionIndex >= cleanOptions.length) {
      setModalError("Please select a valid correct option");
      return;
    }

    try {
      setSaveLoading(true);
      setModalError(null);

      if (isCreating) {
        const created = await adminApi.createQuizQuestion(selectedBankId, {
          questionText: questionText.trim(),
          options: cleanOptions,
          correctOptionIndex,
          explanation: explanation.trim(),
          difficulty,
        });
        setQuestions([...questions, created]);
      } else if (editingQuestion) {
        const updated = await adminApi.updateQuizQuestion(editingQuestion._id, {
          questionText: questionText.trim(),
          options: cleanOptions,
          correctOptionIndex,
          explanation: explanation.trim(),
          difficulty,
        });
        setQuestions(questions.map((q) => (q._id === updated._id ? updated : q)));
      }

      setEditingQuestion(null);
      setIsCreating(false);
    } catch (err: any) {
      setModalError(err.message || "Failed to save question");
    } finally {
      setSaveLoading(false);
    }
  };

  // Delete Question Handler
  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question? This action is recorded in audit logs.")) {
      return;
    }

    try {
      await adminApi.deleteQuizQuestion(id);
      setQuestions(questions.filter((q) => q._id !== id));
    } catch (err: any) {
      alert(`Failed to delete question: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Quiz Question Banks</h1>
          <p className="text-xs text-slate-400 mt-1">
            Zero-knowledge question authoring, multi-choice answer verification, and markdown explanations.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          disabled={!selectedBankId}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Question to Bank
        </button>
      </div>

      {/* Bank Selector Bar */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Bank:</span>
          <select
            value={selectedBankId}
            onChange={(e) => setSelectedBankId(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            {banks.map((b) => (
              <option key={b._id} value={b._id}>
                [{b.tier.toUpperCase()}] {b.title} ({b.questionCount} questions)
              </option>
            ))}
          </select>
        </div>

        {selectedBank && (
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span>Canonical: <strong className="text-slate-200">{selectedBank.canonicalId}</strong></span>
            <span>Duration: <strong className="text-slate-200">{selectedBank.durationMinutes}m</strong></span>
            <span>Pass Threshold: <strong className="text-emerald-400">{selectedBank.passThresholdPercentage}%</strong></span>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        {loadingQuestions ? (
          <div className="p-12 text-center text-sm text-slate-400 flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            Loading bank questions...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-400">{error}</div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400">
            No questions exist in this bank yet. Click "Add Question to Bank" to create the first one.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {questions.map((q, idx) => (
              <div key={q._id} className="p-5 hover:bg-slate-800/20 transition-colors space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Q#{idx + 1}
                      </span>
                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                          q.difficulty === "beginner"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : q.difficulty === "intermediate"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            : "bg-red-500/10 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {q.difficulty}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">{q.canonicalId}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-white leading-relaxed">{q.questionText}</h3>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(q)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors border border-slate-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q._id)}
                      className="px-2.5 py-1 bg-red-600/10 hover:bg-red-600/20 text-red-400 text-xs font-medium rounded transition-colors border border-red-500/30"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Options List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt, oIdx) => {
                    const isCorrect = oIdx === q.correctOptionIndex;
                    return (
                      <div
                        key={oIdx}
                        className={`p-2 rounded-lg text-xs flex items-center gap-2 border ${
                          isCorrect
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-medium"
                            : "bg-slate-950/60 border-slate-800 text-slate-400"
                        }`}
                      >
                        <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="truncate">{opt}</span>
                        {isCorrect && <span className="ml-auto text-emerald-400 text-[10px] font-bold">✓ CORRECT</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                  <strong className="text-slate-300">Explanation: </strong>
                  {q.explanation}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Question Edit / Create Modal */}
      {(isCreating || editingQuestion) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveQuestion}
            className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl"
          >
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {isCreating ? "Author New Question" : "Edit Quiz Question"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingQuestion(null);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {modalError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                  {modalError}
                </div>
              )}

              {/* Question Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Question Prompt</label>
                <textarea
                  rows={3}
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="What is the primary trade-off of using connection pooling in high-concurrency systems?"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Options Authoring with Radio for Correct Index */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Answer Options (Select the correct radio)
                  </label>
                  {options.length < 6 && (
                    <button
                      type="button"
                      onClick={addOption}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      + Add Option
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {options.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                        correctOptionIndex === idx
                          ? "bg-emerald-500/5 border-emerald-500/40"
                          : "bg-slate-950/60 border-slate-800"
                      }`}
                    >
                      <input
                        type="radio"
                        name="correctOption"
                        checked={correctOptionIndex === idx}
                        onChange={() => setCorrectOptionIndex(idx)}
                        className="text-emerald-500 focus:ring-0 cursor-pointer"
                        title="Mark as correct answer"
                      />
                      <span className="font-mono text-xs text-slate-400 w-5">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => updateOption(idx, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
                        className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(idx)}
                          className="text-slate-500 hover:text-red-400 text-xs px-2"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Detailed Markdown Explanation</label>
                <textarea
                  rows={4}
                  required
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explain why the designated option is correct, citing concurrency principles..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Difficulty */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Difficulty Tier</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-950/60">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingQuestion(null);
                }}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveLoading}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2"
              >
                {saveLoading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {isCreating ? "Create Question" : "Update Question"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
