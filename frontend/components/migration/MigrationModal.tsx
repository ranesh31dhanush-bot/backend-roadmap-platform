"use client";

import React, { useState, useEffect } from "react";
import { MigrationImportResultDTO } from "@top1/shared";
import {
  extractLegacyPayload,
  getDetectedStats,
  clearLegacyLocalStorage,
  DetectedLegacyStats,
} from "@/lib/migration/localStorageExtractor";
import { importLegacyProgress } from "@/lib/api/migration";

interface MigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMigrationSuccess?: () => void;
}

export const MigrationModal: React.FC<MigrationModalProps> = ({
  isOpen,
  onClose,
  onMigrationSuccess,
}) => {
  const [step, setStep] = useState<"detected" | "importing" | "success">("detected");
  const [stats, setStats] = useState<DetectedLegacyStats | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<MigrationImportResultDTO | null>(null);

  useEffect(() => {
    if (isOpen) {
      const payload = extractLegacyPayload();
      const detected = getDetectedStats(payload);
      setStats(detected);
      setStep("detected");
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartImport = async () => {
    try {
      setStep("importing");
      setErrorMsg(null);

      const payload = extractLegacyPayload();
      const result = await importLegacyProgress(payload);

      if (result && result.status === "COMPLETED") {
        // ONLY clear localStorage after confirmed server success
        clearLegacyLocalStorage();
        setImportResult(result);
        setStep("success");

        if (onMigrationSuccess) {
          onMigrationSuccess();
        }
      } else {
        throw new Error("Server returned incomplete migration status");
      }
    } catch (err: any) {
      // LocalStorage is NOT touched on error
      setStep("detected");
      setErrorMsg(
        err.message || "Failed to import legacy progress. Your local data is completely safe.",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl p-6 font-mono text-xs text-[#c9d1d9] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
          <div className="flex items-center space-x-2.5">
            <span className="text-xl">📦</span>
            <div>
              <h2 className="text-base font-bold text-white">Legacy LocalStorage Migration</h2>
              <p className="text-[11px] text-[#8b949e]">Cloud Ingestion Bridge (Sprint 8)</p>
            </div>
          </div>
          {step !== "importing" && (
            <button
              onClick={onClose}
              className="text-[#8b949e] hover:text-white text-base p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Error Toast */}
        {errorMsg && (
          <div className="p-3.5 rounded-lg bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-start space-x-2">
            <span className="text-base flex-shrink-0">⚠️</span>
            <div className="space-y-1">
              <p className="font-bold">Migration Failed</p>
              <p className="text-[11px] text-red-300 leading-relaxed">{errorMsg}</p>
              <p className="text-[10px] text-[#8b949e] italic">
                Your browser storage was not cleared. You can safely retry anytime.
              </p>
            </div>
          </div>
        )}

        {/* Step 1: Detected */}
        {step === "detected" && stats && (
          <div className="space-y-5">
            <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                  Detected Local Learning Data
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#00e676]/10 text-[#00e676] font-bold">
                  Ready to Ingest
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-2.5">
                  <span className="text-[10px] text-[#8b949e] block">Completed Topics</span>
                  <span className="text-sm font-bold text-[#00e676]">
                    {stats.topicsCount} Topics
                  </span>
                </div>

                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-2.5">
                  <span className="text-[10px] text-[#8b949e] block">Markdown Notes</span>
                  <span className="text-sm font-bold text-[#58a6ff]">
                    {stats.notesCount} Notes
                  </span>
                </div>

                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-2.5">
                  <span className="text-[10px] text-[#8b949e] block">External Links</span>
                  <span className="text-sm font-bold text-[#bc8cff]">
                    {stats.linksCount} Links
                  </span>
                </div>

                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-2.5">
                  <span className="text-[10px] text-[#8b949e] block">Quiz Scores</span>
                  <span className="text-sm font-bold text-amber-300">
                    {stats.quizzesCount} Quizzes
                  </span>
                </div>
              </div>

              {stats.startDate && (
                <div className="pt-2 text-[11px] text-[#8b949e] flex justify-between border-t border-[#30363d]">
                  <span>Original Start Date:</span>
                  <span className="text-white font-bold">{stats.startDate}</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-[#8b949e] leading-relaxed">
              We will atomically map your completed topics, notes, ChatGPT links, and quiz records into
              your authenticated account. Legacy browser storage will only be cleared after full server confirmation.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={handleStartImport}
                className="flex-1 py-3 px-4 rounded-xl bg-[#00e676] hover:bg-[#00c853] text-black font-bold text-xs shadow-lg shadow-[#00e676]/20 transition-all flex items-center justify-center space-x-2"
              >
                <span>⚡</span>
                <span>Import Existing Progress</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-white border border-[#30363d] font-bold text-xs transition-all"
              >
                Later
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Importing */}
        {step === "importing" && (
          <div className="py-8 text-center space-y-4">
            <div className="animate-spin h-10 w-10 border-3 border-[#00e676] border-t-transparent rounded-full mx-auto" />
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-white">Importing to Cloud Database...</h3>
              <p className="text-[11px] text-[#8b949e]">
                Running atomic MongoDB transaction and canonical ID translation pipeline.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === "success" && importResult && (
          <div className="space-y-5 animate-fadeIn">
            <div className="bg-[#00e676]/10 border border-[#00e676]/40 rounded-xl p-4 text-center space-y-2">
              <span className="text-2xl block">🎉</span>
              <h3 className="text-sm font-bold text-white">Migration Complete!</h3>
              <p className="text-[11px] text-[#00e676]">
                All your legacy progress and notes have been securely bound to your cloud profile.
              </p>
            </div>

            <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#30363d]">
                <span className="text-[#8b949e]">Topics Migrated:</span>
                <span className="text-white font-bold">{importResult.importedTopics}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#30363d]">
                <span className="text-[#8b949e]">Notes Migrated:</span>
                <span className="text-white font-bold">{importResult.importedNotes}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#30363d]">
                <span className="text-[#8b949e]">Links Migrated:</span>
                <span className="text-white font-bold">{importResult.importedLinks}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#8b949e]">Quizzes Migrated:</span>
                <span className="text-white font-bold">{importResult.importedQuizzes}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl bg-[#00e676] hover:bg-[#00c853] text-black font-bold text-xs shadow-lg shadow-[#00e676]/20 transition-all"
            >
              Continue to Workspace →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
