"use client";

import React, { useState } from "react";
import { fetchApi } from "@/lib/api/client";
import { ScheduleDetailsDTO, RescheduleResponse, PauseCourseResponse, ResumeCourseResponse } from "@top1/shared";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ScheduleDetailsDTO;
  onScheduleUpdated: (updated: ScheduleDetailsDTO) => void;
}

export function ScheduleModal({ isOpen, onClose, schedule, onScheduleUpdated }: ScheduleModalProps) {
  const [activeTab, setActiveTab] = useState<"reschedule" | "pause">("reschedule");
  const [newStartDate, setNewStartDate] = useState<string>(schedule.startDate);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReschedule = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const res = await fetchApi<RescheduleResponse>("/schedule/reschedule", {
        method: "POST",
        body: JSON.stringify({ newStartDate }),
      });
      onScheduleUpdated(res.schedule);
      setSuccessMsg("Schedule start date successfully updated!");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reschedule start date");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePause = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      if (schedule.isPaused) {
        const res = await fetchApi<ResumeCourseResponse>("/schedule/resume", { method: "POST" });
        const updated: ScheduleDetailsDTO = {
          ...schedule,
          isPaused: false,
          pausedAt: null,
          startDate: res.newStartDate,
          projectedEndDate: res.newEndDate,
        };
        onScheduleUpdated(updated);
        setSuccessMsg(`Course resumed! Dates shifted forward by ${res.daysPaused} days.`);
      } else {
        const res = await fetchApi<PauseCourseResponse>("/schedule/pause", { method: "POST" });
        const updated: ScheduleDetailsDTO = {
          ...schedule,
          isPaused: true,
          pausedAt: res.pausedAt,
        };
        onScheduleUpdated(updated);
        setSuccessMsg("Course paused. Your streak & progress are frozen until you resume.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update pause state");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl max-w-lg w-full p-6 text-[#c9d1d9] font-mono">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#30363d] pb-4 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-[#00e676] text-lg">⚙️</span>
            <h2 className="text-base font-bold text-white">Schedule Management</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#8b949e] hover:text-white text-sm font-bold px-2 py-1 rounded"
          >
            ✕
          </button>
        </div>

        {/* Current State Summary */}
        <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-xs mb-4 grid grid-cols-2 gap-2">
          <div>
            <span className="text-[#8b949e]">Start Date:</span>
            <p className="font-bold text-white">{schedule.startDate}</p>
          </div>
          <div>
            <span className="text-[#8b949e]">Projected Completion:</span>
            <p className="font-bold text-[#00e676]">{schedule.projectedEndDate}</p>
          </div>
          <div>
            <span className="text-[#8b949e]">Days Remaining:</span>
            <p className="font-bold text-white">{schedule.daysRemaining} days</p>
          </div>
          <div>
            <span className="text-[#8b949e]">Course Status:</span>
            <p className={`font-bold ${schedule.isPaused ? "text-amber-400" : "text-[#00e676]"}`}>
              {schedule.isPaused ? "⏸️ PAUSED" : "▶️ ACTIVE"}
            </p>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex space-x-2 border-b border-[#30363d] mb-4">
          <button
            onClick={() => setActiveTab("reschedule")}
            className={`pb-2 px-3 text-xs font-bold transition-colors ${
              activeTab === "reschedule"
                ? "text-[#00e676] border-b-2 border-[#00e676]"
                : "text-[#8b949e] hover:text-white"
            }`}
          >
            📅 Reschedule Start Date
          </button>
          <button
            onClick={() => setActiveTab("pause")}
            className={`pb-2 px-3 text-xs font-bold transition-colors ${
              activeTab === "pause"
                ? "text-[#00e676] border-b-2 border-[#00e676]"
                : "text-[#8b949e] hover:text-white"
            }`}
          >
            ⏸️ Pause / Resume Course
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded bg-red-900/30 border border-red-500/50 text-red-300 text-xs">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded bg-emerald-900/30 border border-emerald-500/50 text-emerald-300 text-xs">
            ✅ {successMsg}
          </div>
        )}

        {/* TAB 1: RESCHEDULE */}
        {activeTab === "reschedule" && (
          <div className="space-y-4 text-xs">
            <p className="text-[#8b949e]">
              Shift your start date. All topic checkmarks, notes, and canonical progress will remain permanently attached to their curriculum nodes.
            </p>

            <div>
              <label className="block text-[#8b949e] mb-1 font-bold">New Start Date (YYYY-MM-DD):</label>
              <input
                type="date"
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-white focus:outline-none focus:border-[#00e676]"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleReschedule}
                disabled={loading}
                className="px-4 py-2 rounded bg-[#00e676] text-black font-bold text-xs hover:bg-[#00c853] transition-all disabled:opacity-50"
              >
                {loading ? "Updating..." : "Confirm Reschedule"}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: PAUSE / RESUME */}
        {activeTab === "pause" && (
          <div className="space-y-4 text-xs">
            <p className="text-[#8b949e]">
              Taking a vacation or facing work deadlines? Freeze your learning journey. When you resume, your start and graduation dates will automatically shift forward by the exact number of paused days.
            </p>

            <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded">
              <span className="text-[#8b949e]">Current Pause Status:</span>
              <p className="text-white font-bold mt-1">
                {schedule.isPaused
                  ? `Course is PAUSED since ${schedule.pausedAt}`
                  : `Course is ACTIVE. Total lifetime pause: ${schedule.totalPauseDays} days`}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleTogglePause}
                disabled={loading}
                className={`px-4 py-2 rounded font-bold text-xs transition-all disabled:opacity-50 ${
                  schedule.isPaused
                    ? "bg-[#00e676] text-black hover:bg-[#00c853]"
                    : "bg-amber-500 text-black hover:bg-amber-400"
                }`}
              >
                {loading
                  ? "Processing..."
                  : schedule.isPaused
                  ? "▶️ Resume Learning Journey"
                  : "⏸️ Pause Learning Journey"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
