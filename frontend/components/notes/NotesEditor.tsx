"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { fetchDayNote, saveDayNote } from "@/lib/api/notes";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ApiClientError } from "@/lib/api/client";

interface NotesEditorProps {
  canonicalDayId: string;
}

type SaveStatus = "idle" | "editing" | "saving" | "saved" | "conflict" | "error";

export const NotesEditor: React.FC<NotesEditorProps> = ({ canonicalDayId }) => {
  const [content, setContent] = useState<string>("");
  const [serverVersion, setServerVersion] = useState<number>(1);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [wordCount, setWordCount] = useState<number>(0);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Stale Conflict State
  const [conflictData, setConflictData] = useState<{
    currentVersion: number;
    latestContent: string;
  } | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestContentRef = useRef<string>("");
  const latestVersionRef = useRef<number>(1);

  latestContentRef.current = content;
  latestVersionRef.current = serverVersion;

  // 1. Fetch Day Note on canonicalDayId change
  useEffect(() => {
    let isMounted = true;

    async function loadNote() {
      try {
        setLoading(true);
        setStatus("idle");
        setErrorMessage(null);
        setConflictData(null);

        const note = await fetchDayNote(canonicalDayId);
        if (isMounted) {
          setContent(note.content || "");
          setServerVersion(note.version || 1);
          setWordCount(note.wordCount || 0);
          setLastSavedAt(note.updatedAt || null);
          setStatus("saved");
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(err.message || "Failed to load notes");
          setStatus("error");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadNote();

    return () => {
      isMounted = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [canonicalDayId]);

  // 2. Perform Save
  const performSave = useCallback(
    async (textToSave: string, versionToUse: number) => {
      try {
        setStatus("saving");
        setErrorMessage(null);

        const res = await saveDayNote(canonicalDayId, textToSave, versionToUse);

        setServerVersion(res.version);
        setWordCount(res.wordCount);
        setLastSavedAt(res.updatedAt);
        setStatus("saved");
        setConflictData(null);
      } catch (err: any) {
        if (err instanceof ApiClientError && err.code === "CONFLICT") {
          setStatus("conflict");
          const details = err.details as any;
          setConflictData({
            currentVersion: details?.currentVersion || versionToUse + 1,
            latestContent: details?.latestContent || "",
          });
          setErrorMessage("Conflict detected: Note was modified in another session.");
        } else {
          setStatus("error");
          setErrorMessage(err.message || "Autosave failed.");
        }
      }
    },
    [canonicalDayId],
  );

  // 3. Handle Text Change with 1200ms Debounce
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setContent(newText);

    // Compute word count
    const words = newText.trim() ? newText.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setStatus("editing");

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSave(newText, latestVersionRef.current);
    }, 1200);
  };

  // 4. Resolve Conflict Actions
  const handleReloadServerVersion = () => {
    if (conflictData) {
      setContent(conflictData.latestContent);
      setServerVersion(conflictData.currentVersion);
      const words = conflictData.latestContent.trim()
        ? conflictData.latestContent.trim().split(/\s+/).length
        : 0;
      setWordCount(words);
      setConflictData(null);
      setStatus("saved");
    }
  };

  const handleForceOverwrite = () => {
    if (conflictData) {
      // Use latest server version to overwrite
      performSave(content, conflictData.currentVersion);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 text-center text-xs font-mono text-[#8b949e] space-y-2">
        <div className="animate-spin h-5 w-5 border-2 border-[#00e676] border-t-transparent rounded-full mx-auto" />
        <p>Loading day notes...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl shadow-lg overflow-hidden font-mono text-xs flex flex-col">
      {/* Editor Header: Tabs & Status Telemetry */}
      <div className="bg-[#0d1117] border-b border-[#30363d] px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
        {/* Left: Edit / Preview Switcher */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === "edit"
                ? "bg-[#21262d] text-white border border-[#30363d]"
                : "text-[#8b949e] hover:text-white"
            }`}
          >
            <span>✏️</span>
            <span>Write</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === "preview"
                ? "bg-[#21262d] text-white border border-[#30363d]"
                : "text-[#8b949e] hover:text-white"
            }`}
          >
            <span>👁️</span>
            <span>Preview</span>
          </button>
        </div>

        {/* Right: Autosave Status Badge & Telemetry */}
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="text-[#8b949e] hidden sm:inline">
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </span>

          <span className="text-[#30363d] hidden sm:inline">|</span>

          {/* Status Indicators */}
          {status === "editing" && (
            <span className="text-amber-400 font-bold flex items-center space-x-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Editing...</span>
            </span>
          )}

          {status === "saving" && (
            <span className="text-[#58a6ff] font-bold flex items-center space-x-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#58a6ff] animate-ping" />
              <span>Saving...</span>
            </span>
          )}

          {status === "saved" && (
            <span className="text-[#00e676] font-bold flex items-center space-x-1">
              <span>✓</span>
              <span>Saved</span>
            </span>
          )}

          {status === "conflict" && (
            <span className="text-red-400 font-bold flex items-center space-x-1">
              <span>⚠️</span>
              <span>Conflict (v{serverVersion})</span>
            </span>
          )}

          {status === "error" && (
            <span className="text-red-400 font-bold flex items-center space-x-1">
              <span>✕</span>
              <span>Save Failed</span>
            </span>
          )}
        </div>
      </div>

      {/* 409 Conflict Banner */}
      {status === "conflict" && conflictData && (
        <div className="bg-red-950/90 border-b border-red-500/60 p-4 space-y-3">
          <div className="flex items-start space-x-2 text-red-200">
            <span className="text-base">⚠️</span>
            <div className="space-y-1">
              <p className="font-bold">Concurrency Conflict Detected</p>
              <p className="text-[11px] text-red-300">
                This note was modified in another browser tab or session (Server Version: v
                {conflictData.currentVersion}).
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 pt-1">
            <button
              type="button"
              onClick={handleReloadServerVersion}
              className="px-3 py-1 rounded bg-[#21262d] text-white hover:bg-[#30363d] border border-[#30363d] text-xs font-bold transition-all"
            >
              📥 Load Server Version
            </button>
            <button
              type="button"
              onClick={handleForceOverwrite}
              className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all"
            >
              ⚠️ Overwrite with My Local Changes
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && status === "error" && (
        <div className="bg-red-950/60 border-b border-red-500/40 p-2.5 text-center text-red-300 text-[11px]">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => performSave(content, serverVersion)}
            className="ml-2 underline text-white font-bold"
          >
            Retry Save
          </button>
        </div>
      )}

      {/* Main Body: Textarea vs Markdown Preview */}
      <div className="p-4 flex-1 min-h-[280px]">
        {activeTab === "edit" ? (
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder="Write your technical learnings, code snippets, and architecture thoughts in Markdown..."
            rows={12}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-4 font-mono text-xs text-[#c9d1d9] focus:outline-none focus:border-[#00e676] resize-y leading-relaxed transition-colors placeholder:text-[#8b949e]/50"
          />
        ) : (
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 min-h-[250px] overflow-y-auto">
            <MarkdownRenderer content={content} />
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-[#0d1117] border-t border-[#30363d] px-4 py-2 flex items-center justify-between text-[10px] text-[#8b949e]">
        <span>Supports GitHub Flavored Markdown (Headers, Code blocks, Lists, Bold, Links)</span>
        {lastSavedAt && <span>Last saved: {new Date(lastSavedAt).toLocaleTimeString()}</span>}
      </div>
    </div>
  );
};
