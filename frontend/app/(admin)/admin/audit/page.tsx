"use client";

import React, { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { AdminAuditLogDTO } from "@top1/shared";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AdminAuditLogDTO[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [entityType, setEntityType] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        setError(null);
        const res = await adminApi.getAuditLogs({
          entityType: entityType || undefined,
          page,
          limit: 25,
        });
        setLogs(res.logs);
        setTotal(res.total);
      } catch (err: any) {
        setError(err.message || "Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, [page, entityType]);

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Security & Admin Audit Trail</h1>
        <p className="text-xs text-slate-400 mt-1">
          Immutable ledger of administrative actions, state transitions, operator identities, and IP addresses.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Entity Filter:</span>
          <select
            value={entityType}
            onChange={(e) => {
              setEntityType(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Entity Types</option>
            <option value="CurriculumNode">CurriculumNode</option>
            <option value="CurriculumVersion">CurriculumVersion</option>
            <option value="quiz_question">quiz_question</option>
            <option value="quiz_bank">quiz_bank</option>
          </select>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Showing <strong className="text-white">{logs.length}</strong> of <strong className="text-white">{total}</strong> recorded audit events
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400 flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            Loading audit records...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-400">{error}</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400">
            No audit records found matching the filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950/80 text-slate-400 font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-44">Timestamp</th>
                  <th className="py-3 px-4 w-44">Admin Email</th>
                  <th className="py-3 px-4 w-28">Action</th>
                  <th className="py-3 px-4 w-36">Entity Type</th>
                  <th className="py-3 px-4">Entity ID</th>
                  <th className="py-3 px-4 w-28">IP Address</th>
                  <th className="py-3 px-4 w-20 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() => toggleExpand(log.id)}
                        className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-200">
                          {log.adminEmail}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                              log.action.includes("CREATE") || log.action === "create"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : log.action.includes("PUBLISH") || log.action === "publish"
                                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
                                : log.action.includes("DELETE") || log.action === "delete"
                                ? "bg-red-500/10 text-red-400 border border-red-500/30"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-indigo-300">
                          {log.entityType}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-300 truncate max-w-xs">
                          {log.entityId}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                          {log.ipAddress || "—"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button className="text-xs text-emerald-400 hover:text-emerald-300 font-mono">
                            {isExpanded ? "Hide ▲" : "Diff ▼"}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Diffs */}
                      {isExpanded && (
                        <tr className="bg-slate-950/80">
                          <td colSpan={7} className="p-4 border-b border-slate-800">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                  State Before Mutation:
                                </div>
                                <pre className="bg-slate-900 p-3 rounded-lg text-xs font-mono text-amber-300/90 overflow-x-auto max-h-60 border border-slate-800">
                                  {log.beforeState ? JSON.stringify(log.beforeState, null, 2) : "None (New Entity Created)"}
                                </pre>
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                  State After Mutation:
                                </div>
                                <pre className="bg-slate-900 p-3 rounded-lg text-xs font-mono text-emerald-300/90 overflow-x-auto max-h-60 border border-slate-800">
                                  {log.afterState ? JSON.stringify(log.afterState, null, 2) : "None (Entity Deleted)"}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {total > 25 && (
          <div className="p-4 border-t border-slate-800/80 flex items-center justify-between bg-slate-950/40">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-medium"
            >
              Previous Page
            </button>
            <span className="text-xs font-mono text-slate-400">
              Page {page} of {Math.ceil(total / 25)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 25 >= total}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-medium"
            >
              Next Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
