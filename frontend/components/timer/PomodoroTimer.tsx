"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { recordStreakActivity } from "@/lib/api/streaks";

export type PomodoroPreset = "focus_25" | "break_5" | "long_break_15";

interface PomodoroTimerProps {
  canonicalDayId?: string;
  onSessionComplete?: (preset: PomodoroPreset) => void;
  className?: string;
}

const PRESET_DURATIONS: Record<PomodoroPreset, number> = {
  focus_25: 25 * 60,
  break_5: 5 * 60,
  long_break_15: 15 * 60,
};

const PRESET_LABELS: Record<PomodoroPreset, string> = {
  focus_25: "25m Focus",
  break_5: "5m Break",
  long_break_15: "15m Rest",
};

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  onSessionComplete,
  className = "",
}) => {
  const [preset, setPreset] = useState<PomodoroPreset>("focus_25");
  const [secondsRemaining, setSecondsRemaining] = useState<number>(PRESET_DURATIONS.focus_25);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [completedCycles, setCompletedCycles] = useState<number>(0);

  const endTimeRef = useRef<number | null>(null);
  const remainingWhenPausedRef = useRef<number>(PRESET_DURATIONS.focus_25);
  const originalTitleRef = useRef<string>("");

  // Play pleasant chime via Web Audio API
  const playChime = useCallback(() => {
    if (isMuted || typeof window === "undefined") return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(440, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 1.2);
      osc2.stop(ctx.currentTime + 1.2);
    } catch {
      // Audio autoplay policy fallback
    }
  }, [isMuted]);

  // Store original title
  useEffect(() => {
    if (typeof document !== "undefined" && !originalTitleRef.current) {
      originalTitleRef.current = document.title || "Top 1% Backend Roadmap";
    }
  }, []);

  // Format seconds into MM:SS
  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Switch Presets
  const handleSelectPreset = (newPreset: PomodoroPreset) => {
    setPreset(newPreset);
    const newDuration = PRESET_DURATIONS[newPreset];
    setSecondsRemaining(newDuration);
    remainingWhenPausedRef.current = newDuration;
    setIsRunning(false);
    setIsPaused(false);
    endTimeRef.current = null;

    if (typeof document !== "undefined" && originalTitleRef.current) {
      document.title = originalTitleRef.current;
    }
  };

  // Start Timer
  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    endTimeRef.current = Date.now() + remainingWhenPausedRef.current * 1000;
  };

  // Pause Timer
  const handlePause = () => {
    setIsPaused(true);
    setIsRunning(false);
    remainingWhenPausedRef.current = secondsRemaining;
    endTimeRef.current = null;
  };

  // Resume Timer
  const handleResume = () => {
    setIsRunning(true);
    setIsPaused(false);
    endTimeRef.current = Date.now() + secondsRemaining * 1000;
  };

  // Reset Timer
  const handleReset = () => {
    const duration = PRESET_DURATIONS[preset];
    setSecondsRemaining(duration);
    remainingWhenPausedRef.current = duration;
    setIsRunning(false);
    setIsPaused(false);
    endTimeRef.current = null;

    if (typeof document !== "undefined" && originalTitleRef.current) {
      document.title = originalTitleRef.current;
    }
  };

  // Timestamp-based countdown loop
  useEffect(() => {
    if (!isRunning || !endTimeRef.current) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const distance = Math.max(0, Math.ceil((endTimeRef.current! - now) / 1000));

      setSecondsRemaining(distance);

      // Update Tab Title
      if (typeof document !== "undefined") {
        document.title = `(${formatTime(distance)}) Top 1% Roadmap`;
      }

      // Session Complete
      if (distance <= 0) {
        clearInterval(interval);
        setIsRunning(false);
        setIsPaused(false);
        endTimeRef.current = null;
        remainingWhenPausedRef.current = PRESET_DURATIONS[preset];

        playChime();

        if (preset === "focus_25") {
          setCompletedCycles((c) => c + 1);
          // Record streak activity on focus completion
          recordStreakActivity().catch(() => {});
        }

        if (onSessionComplete) {
          onSessionComplete(preset);
        }

        if (typeof document !== "undefined" && originalTitleRef.current) {
          document.title = `⏰ Time's up! — ${originalTitleRef.current}`;
        }
      }
    }, 250);

    return () => {
      clearInterval(interval);
    };
  }, [isRunning, preset, playChime, onSessionComplete]);

  const totalDuration = PRESET_DURATIONS[preset];
  const progressPercentage = Math.min(
    100,
    Math.max(0, ((totalDuration - secondsRemaining) / totalDuration) * 100),
  );

  return (
    <div
      className={`bg-[#161b22] border border-[#30363d] rounded-xl p-4 font-mono text-xs shadow-xl space-y-3.5 ${className}`}
    >
      {/* Header & Presets */}
      <div className="flex items-center justify-between gap-2 border-b border-[#30363d] pb-2.5">
        <div className="flex items-center space-x-1.5">
          <span className="text-sm">⏱️</span>
          <span className="font-bold text-white uppercase text-[11px] tracking-wider">
            Focus Pomodoro
          </span>
          {completedCycles > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#00e676]/20 text-[#00e676] font-bold">
              {completedCycles} {completedCycles === 1 ? "block" : "blocks"}
            </span>
          )}
        </div>

        {/* Audio Mute Toggle */}
        <button
          type="button"
          onClick={() => setIsMuted(!isMuted)}
          title={isMuted ? "Unmute chime" : "Mute chime"}
          className="text-[#8b949e] hover:text-white text-xs p-1"
        >
          {isMuted ? "🔇" : "🔔"}
        </button>
      </div>

      {/* Preset Selector Tabs */}
      <div className="grid grid-cols-3 gap-1.5 bg-[#0d1117] p-1 rounded-lg border border-[#30363d]">
        {(["focus_25", "break_5", "long_break_15"] as PomodoroPreset[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => handleSelectPreset(p)}
            className={`py-1 rounded text-[10px] font-bold transition-all ${
              preset === p
                ? "bg-[#21262d] text-[#00e676] border border-[#30363d] shadow"
                : "text-[#8b949e] hover:text-white"
            }`}
          >
            {PRESET_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Big Countdown Timer Display & Progress Bar */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 text-center space-y-2.5">
        <div className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-white">
          {formatTime(secondsRemaining)}
        </div>

        {/* Progress Line */}
        <div className="w-full bg-[#21262d] rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              preset === "focus_25" ? "bg-[#00e676]" : "bg-[#58a6ff]"
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Control Actions (Start / Pause / Resume / Reset) */}
      <div className="flex items-center justify-between gap-2 pt-1">
        {!isRunning && !isPaused && (
          <button
            type="button"
            onClick={handleStart}
            className="flex-1 py-2 rounded-lg bg-[#00e676] hover:bg-[#00c853] text-black font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1"
          >
            <span>▶</span>
            <span>Start Session</span>
          </button>
        )}

        {isRunning && (
          <button
            type="button"
            onClick={handlePause}
            className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all flex items-center justify-center space-x-1"
          >
            <span>⏸</span>
            <span>Pause</span>
          </button>
        )}

        {isPaused && (
          <button
            type="button"
            onClick={handleResume}
            className="flex-1 py-2 rounded-lg bg-[#00e676] hover:bg-[#00c853] text-black font-bold text-xs transition-all flex items-center justify-center space-x-1"
          >
            <span>▶</span>
            <span>Resume</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleReset}
          className="px-3 py-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-white border border-[#30363d] text-xs font-bold transition-all"
        >
          ↺ Reset
        </button>
      </div>
    </div>
  );
};
