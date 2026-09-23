"use client";

import React, { useEffect, useState } from "react";

interface QuizTimerProps {
  durationMinutes: number;
  onExpire: () => void;
  isSubmitting: boolean;
}

export const QuizTimer: React.FC<QuizTimerProps> = ({
  durationMinutes,
  onExpire,
  isSubmitting,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(durationMinutes * 60);

  useEffect(() => {
    if (isSubmitting) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitting, onExpire]);

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const isUrgent = secondsRemaining < 120; // Under 2 mins

  return (
    <div
      className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold flex items-center space-x-2 transition-colors ${
        isUrgent
          ? "bg-red-950/40 border-red-500 text-red-400 animate-pulse"
          : "bg-[#0d1117] border-[#30363d] text-[#58a6ff]"
      }`}
    >
      <span>⏱️</span>
      <span>
        {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </span>
      {isUrgent && <span className="text-[10px] text-red-300">LOW TIME</span>}
    </div>
  );
};
