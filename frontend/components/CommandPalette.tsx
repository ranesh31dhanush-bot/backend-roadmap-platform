"use client";

import React, { useState, useEffect, useRef } from "react";
import { LearnerRoadmapPhaseDTO } from "@top1/shared";

interface SearchResult {
  canonicalDayId: string;
  dayTitle: string;
  topicText?: string;
  phaseName: string;
  weekTitle: string;
  projectedDate: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  phases: LearnerRoadmapPhaseDTO[];
  onSelectDay: (canonicalDayId: string) => void;
}

export function CommandPalette({ isOpen, onClose, phases, onSelectDay }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global keydown listener for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Flatten and search topics
  const results: SearchResult[] = [];
  const q = query.trim().toLowerCase();

  if (q.length > 0) {
    for (const phase of phases) {
      for (const week of phase.weeks) {
        for (const day of week.days) {
          // Check day title
          if (day.title.toLowerCase().includes(q) || day.canonicalDayId.toLowerCase().includes(q)) {
            results.push({
              canonicalDayId: day.canonicalDayId,
              dayTitle: day.title,
              phaseName: phase.phaseName,
              weekTitle: week.weekTitle,
              projectedDate: day.projectedDate,
            });
          }

          // Check subtopics
          if (day.subtopics) {
            for (const st of day.subtopics) {
              if (st.text.toLowerCase().includes(q)) {
                results.push({
                  canonicalDayId: day.canonicalDayId,
                  dayTitle: day.title,
                  topicText: st.text,
                  phaseName: phase.phaseName,
                  weekTitle: week.weekTitle,
                  projectedDate: day.projectedDate,
                });
              }
            }
          }

          if (results.length >= 25) break; // limit to 25 items
        }
        if (results.length >= 25) break;
      }
      if (results.length >= 25) break;
    }
  }

  const handleKeyDownInList = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      onSelectDay(results[selectedIndex].canonicalDayId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl max-w-2xl w-full p-4 text-[#c9d1d9] font-mono">
        {/* Search Input Bar */}
        <div className="flex items-center space-x-3 border-b border-[#30363d] pb-3">
          <span className="text-base text-[#00e676]">🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search all 813 topics, concepts, modules, or canonical IDs (e.g. 'event loop', 'p1-w1-d1')..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownInList}
            className="w-full bg-transparent text-white text-sm focus:outline-none placeholder-[#8b949e]"
          />
          <kbd className="px-2 py-0.5 rounded bg-[#21262d] border border-[#30363d] text-[10px] text-[#8b949e]">
            ESC
          </kbd>
        </div>

        {/* Search Results List */}
        <div className="max-h-80 overflow-y-auto mt-3 divide-y divide-[#21262d]">
          {query.trim().length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8b949e]">
              Type a topic keyword or canonical slug to search the entire 52-week curriculum.
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8b949e]">
              No matching curriculum topics found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            results.map((res, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${res.canonicalDayId}-${idx}`}
                  onClick={() => {
                    onSelectDay(res.canonicalDayId);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center justify-between ${
                    isSelected ? "bg-[#00e676]/10 border border-[#00e676]/40 text-white" : "hover:bg-[#21262d]"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-[#0d1117] border border-[#30363d] text-[#58a6ff] font-bold">
                        {res.canonicalDayId}
                      </span>
                      <span className="text-xs font-bold text-white">{res.dayTitle}</span>
                    </div>
                    {res.topicText && (
                      <p className="text-xs text-[#00e676]">
                        ↳ Concept: {res.topicText}
                      </p>
                    )}
                    <p className="text-[11px] text-[#8b949e]">
                      {res.phaseName} • {res.weekTitle}
                    </p>
                  </div>

                  <span className="text-[11px] text-[#8b949e] whitespace-nowrap pl-2">
                    📅 {res.projectedDate}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="pt-3 border-t border-[#30363d] mt-2 flex justify-between text-[10px] text-[#8b949e]">
          <span>Use ↑ ↓ arrows to navigate</span>
          <span>↵ Enter to open</span>
        </div>
      </div>
    </div>
  );
}
