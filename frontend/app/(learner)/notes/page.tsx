"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { searchNotes } from "@/lib/api/notes";
import { DayNoteDTO } from "@top1/shared";
import { MarkdownRenderer } from "@/components/notes/MarkdownRenderer";

export default function NotesExplorerPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [notes, setNotes] = useState<DayNoteDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedNote, setSelectedNote] = useState<DayNoteDTO | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    async function loadAllNotes() {
      try {
        setLoading(true);
        setErrorMsg(null);
        const res = await searchNotes(searchQuery);
        setNotes(res.notes);

        if (res.notes.length > 0 && !selectedNote) {
          setSelectedNote(res.notes[0]);
        } else if (res.notes.length === 0) {
          setSelectedNote(null);
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load notes");
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      loadAllNotes();
    }
  }, [authLoading, isAuthenticated, router, searchQuery]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117] text-[#c9d1d9]">
        <div className="text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-2 border-[#00e676] border-t-transparent rounded-full mx-auto" />
          <p className="text-xs font-mono text-[#8b949e]">Loading Notes Explorer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col font-mono">
      {/* Top Header */}
      <header className="border-b border-[#30363d] bg-[#161b22]/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="text-[#00e676] font-mono font-black text-lg hover:opacity-80 transition-opacity"
            >
              TOP 1%
            </Link>
            <span className="text-[#30363d]">/</span>
            <span className="text-xs font-mono text-white font-bold">Notes Explorer</span>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <Link
              href="/curriculum"
              className="px-3 py-1.5 rounded bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d] transition-all"
            >
              🗺️ Roadmap
            </Link>
            <Link
              href="/workspace"
              className="px-3 py-1.5 rounded bg-[#00e676] hover:bg-[#00c853] text-black font-bold transition-all"
            >
              ⚡ Daily Workspace
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Banner & Search Input */}
        <div className="bg-gradient-to-r from-[#161b22] to-[#0d1117] border border-[#30363d] rounded-xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center space-x-2">
                <span>📝</span>
                <span>Learner Knowledge Base & Notes</span>
              </h1>
              <p className="text-xs text-[#8b949e] mt-1.5">
                Centralized notes from all 52 weeks of curriculum and daily workspace sessions.
              </p>
            </div>

            <div className="text-xs bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-1.5 text-[#8b949e]">
              Total Written Notes: <span className="text-[#00e676] font-bold">{notes.length}</span>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all your notes by keyword (e.g. CAP Theorem, Kafka, Event Loop)..."
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-3 pl-10 text-xs text-white placeholder:text-[#8b949e] focus:outline-none focus:border-[#00e676] transition-colors"
            />
            <span className="absolute left-3.5 top-3 text-xs text-[#8b949e]">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-xs text-[#8b949e] hover:text-white"
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-950/80 border border-red-500/50 rounded-lg p-3 text-xs text-red-200">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* 2-Column Layout: Notes List on Left, Markdown Detail on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Notes List Column */}
          <div className="lg:col-span-1 bg-[#161b22] border border-[#30363d] rounded-xl p-4 space-y-3">
            <h2 className="text-xs font-bold text-white border-b border-[#30363d] pb-2 flex items-center justify-between">
              <span>Saved Modules</span>
              <span className="text-[10px] text-[#8b949e]">{notes.length} found</span>
            </h2>

            {loading ? (
              <div className="p-8 text-center text-xs text-[#8b949e]">
                <div className="animate-spin h-5 w-5 border-2 border-[#00e676] border-t-transparent rounded-full mx-auto mb-2" />
                Searching notes...
              </div>
            ) : notes.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8b949e] space-y-3">
                <p>No notes matching your search.</p>
                <Link
                  href="/workspace"
                  className="inline-block px-3 py-1.5 rounded bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] text-[11px]"
                >
                  Write notes in Workspace →
                </Link>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {notes.map((note) => {
                  const isSelected =
                    selectedNote?.dayCanonicalId === note.dayCanonicalId;
                  const snippet =
                    note.content.length > 90
                      ? note.content.slice(0, 90) + "..."
                      : note.content;

                  return (
                    <div
                      key={note.dayCanonicalId}
                      onClick={() => setSelectedNote(note)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-[#00e676]/10 border-[#00e676] text-white shadow"
                          : "bg-[#0d1117] border-[#30363d] hover:border-[#8b949e] text-[#c9d1d9]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono text-[#58a6ff]">
                          {note.dayCanonicalId.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-[#8b949e]">
                          {note.wordCount} words
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8b949e] mt-1.5 line-clamp-2 leading-relaxed">
                        {snippet || "(Empty note)"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Note Detail Column */}
          <div className="lg:col-span-2 bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4 shadow-lg min-h-[500px]">
            {selectedNote ? (
              <div className="space-y-4">
                {/* Detail Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#30363d] gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2.5 py-0.5 rounded font-mono font-bold bg-[#58a6ff]/20 text-[#58a6ff] border border-[#58a6ff]/40">
                        {selectedNote.dayCanonicalId.toUpperCase()}
                      </span>
                      <span className="text-[11px] text-[#8b949e]">
                        Version {selectedNote.version}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8b949e] mt-1">
                      Last updated: {new Date(selectedNote.updatedAt).toLocaleString()}
                    </p>
                  </div>

                  <Link
                    href={`/workspace?day=${selectedNote.dayCanonicalId}`}
                    className="px-3.5 py-2 rounded bg-[#00e676] hover:bg-[#00c853] text-black font-bold text-xs flex items-center space-x-1.5 self-start transition-all"
                  >
                    <span>⚡</span>
                    <span>Open in Daily Workspace</span>
                  </Link>
                </div>

                {/* Rendered Markdown Preview */}
                <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-6 min-h-[400px] overflow-y-auto">
                  <MarkdownRenderer content={selectedNote.content} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center text-[#8b949e] space-y-3">
                <span className="text-3xl">📝</span>
                <p className="text-xs">Select a day note on the left to read full markdown learnings.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
