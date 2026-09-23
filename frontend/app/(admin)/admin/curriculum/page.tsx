"use client";

import React, { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import {
  AdminCurriculumNodeDTO,
  AdminUpdateCurriculumNodeDTO,
  CurriculumVersionSummaryDTO,
} from "@top1/shared";

export default function AdminCurriculumPage() {
  const [nodes, setNodes] = useState<AdminCurriculumNodeDTO[]>([]);
  const [versions, setVersions] = useState<CurriculumVersionSummaryDTO[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>("1.0.0");
  const [selectedPhase, setSelectedPhase] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Modal State
  const [editingNode, setEditingNode] = useState<AdminCurriculumNodeDTO | null>(null);
  const [formData, setFormData] = useState<AdminUpdateCurriculumNodeDTO>({});
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showJsonPreview, setShowJsonPreview] = useState<boolean>(false);

  // Version Draft & Publish Modals
  const [showDraftModal, setShowDraftModal] = useState<boolean>(false);
  const [newDraftVersionName, setNewDraftVersionName] = useState<string>("");
  const [draftLoading, setDraftLoading] = useState<boolean>(false);

  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [publishLoading, setPublishLoading] = useState<boolean>(false);

  // Load versions
  useEffect(() => {
    async function fetchVersions() {
      try {
        const v = await adminApi.getVersions();
        setVersions(v.versions);
        if (v.versions.length > 0 && !v.versions.some((ver) => ver.version === selectedVersion)) {
          setSelectedVersion(v.versions[0].version);
        }
      } catch (err: any) {
        console.error("Failed to load versions:", err);
      }
    }
    fetchVersions();
  }, []);

  // Load nodes
  useEffect(() => {
    async function loadNodes() {
      try {
        setLoading(true);
        setError(null);
        const res = await adminApi.getCurriculumNodes({
          version: selectedVersion,
          phaseNumber: selectedPhase,
          search: searchQuery.trim() || undefined,
        });
        setNodes(res.nodes);
      } catch (err: any) {
        setError(err.message || "Failed to load curriculum nodes");
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadNodes();
    }, 200);

    return () => clearTimeout(timer);
  }, [selectedVersion, selectedPhase, searchQuery]);

  // Open Edit Node
  const handleOpenEdit = (node: AdminCurriculumNodeDTO) => {
    setEditingNode(node);
    setFormData({
      title: node.title,
      description: node.description,
      phaseName: node.phaseName,
      phaseColor: node.phaseColor,
      weekTitle: node.weekTitle,
      isRestDay: node.isRestDay,
      skipDirectives: [...(node.skipDirectives || [])],
      subtopics: [...(node.subtopics || [])],
      resources: [...(node.resources || [])],
      status: node.status,
    });
    setSaveSuccess(null);
    setSaveError(null);
    setShowJsonPreview(false);
  };

  // Save Node Changes
  const handleSaveNode = async () => {
    if (!editingNode) return;
    try {
      setSaveLoading(true);
      setSaveError(null);
      setSaveSuccess(null);

      const updated = await adminApi.updateCurriculumNode(editingNode.id, formData);
      setSaveSuccess("Node updated successfully! Cache invalidated.");
      setEditingNode(updated);

      // Refresh node in local state
      setNodes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    } catch (err: any) {
      setSaveError(err.message || "Failed to save node");
    } finally {
      setSaveLoading(false);
    }
  };

  // Draft Version Handler
  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDraftVersionName.trim()) return;

    try {
      setDraftLoading(true);
      const res = await adminApi.createDraftVersion(selectedVersion, newDraftVersionName.trim());
      setShowDraftModal(false);
      setNewDraftVersionName("");

      // Refresh version list and select new draft
      const v = await adminApi.getVersions();
      setVersions(v.versions);
      setSelectedVersion(res.version);
    } catch (err: any) {
      alert(`Failed to draft version: ${err.message}`);
    } finally {
      setDraftLoading(false);
    }
  };

  // Publish Version Handler
  const handlePublishVersion = async () => {
    try {
      setPublishLoading(true);
      await adminApi.publishVersion(selectedVersion);
      setShowPublishModal(false);

      // Refresh version list
      const v = await adminApi.getVersions();
      setVersions(v.versions);
      alert(`Version ${selectedVersion} successfully published! All learner caches invalidated.`);
    } catch (err: any) {
      alert(`Failed to publish version: ${err.message}`);
    } finally {
      setPublishLoading(false);
    }
  };

  // Subtopic Helpers
  const addSubtopic = () => {
    if (!editingNode) return;
    const currentSubtopics = formData.subtopics || [];
    const newTopicId = `${editingNode.canonicalDayId}-t${currentSubtopics.length + 1}`;
    setFormData({
      ...formData,
      subtopics: [...currentSubtopics, { topicId: newTopicId, text: "" }],
    });
  };

  const removeSubtopic = (index: number) => {
    const currentSubtopics = formData.subtopics || [];
    setFormData({
      ...formData,
      subtopics: currentSubtopics.filter((_, i) => i !== index),
    });
  };

  const updateSubtopicText = (index: number, text: string) => {
    const currentSubtopics = [...(formData.subtopics || [])];
    currentSubtopics[index] = { ...currentSubtopics[index], text };
    setFormData({ ...formData, subtopics: currentSubtopics });
  };

  // Resource Helpers
  const addResource = () => {
    setFormData({
      ...formData,
      resources: [
        ...(formData.resources || []),
        { type: "article", title: "New Resource Documentation", url: "https://" },
      ],
    });
  };

  const removeResource = (index: number) => {
    const currentResources = formData.resources || [];
    setFormData({
      ...formData,
      resources: currentResources.filter((_, i) => i !== index),
    });
  };

  const updateResourceField = (index: number, field: "type" | "title" | "url", value: string) => {
    const currentResources = [...(formData.resources || [])];
    currentResources[index] = { ...currentResources[index], [field]: value };
    setFormData({ ...formData, resources: currentResources });
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Curriculum Node & Tree Editor</h1>
          <p className="text-xs text-slate-400 mt-1">
            Canonical node attributes, subtopics hierarchy, verified resources, and atomic semantic publishing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDraftModal(true)}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700 flex items-center gap-1.5"
          >
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Draft New Version
          </button>
          <button
            onClick={() => setShowPublishModal(true)}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Publish Version
          </button>
        </div>
      </div>

      {/* Control Bar: Version Selector, Phase Filter & Search */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
        {/* Version Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Version:</span>
          <select
            value={selectedVersion}
            onChange={(e) => setSelectedVersion(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono rounded-lg px-3 py-1.5 focus:outline-none focus:border-red-500"
          >
            {versions.map((v) => (
              <option key={v.version} value={v.version}>
                v{v.version} ({v.status}) — {v.nodeCount} nodes
              </option>
            ))}
          </select>
        </div>

        {/* Phase Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setSelectedPhase(undefined)}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              selectedPhase === undefined ? "bg-red-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All Phases
          </button>
          {[1, 2, 3, 4, 5].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPhase(p)}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                selectedPhase === p ? "bg-red-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Phase {p}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <input
            type="text"
            placeholder="Search Day ID, title, topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
          <svg
            className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Nodes Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400 flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            Loading curriculum nodes...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-400">{error}</div>
        ) : nodes.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400">
            No curriculum nodes matched the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950/80 text-slate-400 font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-16">Day #</th>
                  <th className="py-3 px-4 w-28">Canonical ID</th>
                  <th className="py-3 px-4">Title & Description</th>
                  <th className="py-3 px-4 w-28">Phase / Week</th>
                  <th className="py-3 px-4 w-24">Subtopics</th>
                  <th className="py-3 px-4 w-24">Resources</th>
                  <th className="py-3 px-4 w-24">Status</th>
                  <th className="py-3 px-4 w-20 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {nodes.map((node) => (
                  <tr key={node.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                      #{node.globalDayNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-xs text-indigo-400">
                      {node.canonicalDayId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white text-sm">{node.title}</div>
                      <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {node.description || "No description provided."}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-1.5"
                        style={{ backgroundColor: node.phaseColor || "#00e676" }}
                      />
                      P{node.phaseNumber} • W{node.weekNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                      {node.subtopics?.length || 0} topics
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                      {node.resources?.length || 0} links
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                          node.status === "published"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {node.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(node)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors border border-slate-700"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Node Edit Drawer / Modal */}
      {editingNode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                    {editingNode.canonicalDayId}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Version: v{editingNode.version} (Global Day #{editingNode.globalDayNumber})
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">Edit Curriculum Node</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowJsonPreview(!showJsonPreview)}
                  className="px-3 py-1.5 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors border border-slate-700"
                >
                  {showJsonPreview ? "Form View" : "JSON Preview"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingNode(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {saveSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                  {saveSuccess}
                </div>
              )}
              {saveError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                  {saveError}
                </div>
              )}

              {showJsonPreview ? (
                <pre className="bg-slate-950 p-4 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto border border-slate-800">
                  {JSON.stringify(formData, null, 2)}
                </pre>
              ) : (
                <div className="space-y-6">
                  {/* Basic Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Title</label>
                      <input
                        type="text"
                        value={formData.title || ""}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Week Title</label>
                      <input
                        type="text"
                        value={formData.weekTitle || ""}
                        onChange={(e) => setFormData({ ...formData, weekTitle: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Description</label>
                    <textarea
                      rows={3}
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  {/* Subtopics Manager */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Subtopics ({formData.subtopics?.length || 0})
                      </label>
                      <button
                        type="button"
                        onClick={addSubtopic}
                        className="text-xs text-red-400 hover:text-red-300 font-medium"
                      >
                        + Add Subtopic
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.subtopics?.map((sub, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-500 w-24 shrink-0 truncate">
                            {sub.topicId}
                          </span>
                          <input
                            type="text"
                            value={sub.text}
                            onChange={(e) => updateSubtopicText(idx, e.target.value)}
                            placeholder="Detailed learning objective / concept..."
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeSubtopic(idx)}
                            className="text-slate-500 hover:text-red-400 text-xs px-2 py-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resources Manager */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Verified Resources ({formData.resources?.length || 0})
                      </label>
                      <button
                        type="button"
                        onClick={addResource}
                        className="text-xs text-red-400 hover:text-red-300 font-medium"
                      >
                        + Add Resource
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.resources?.map((res, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                          <select
                            value={res.type}
                            onChange={(e) => updateResourceField(idx, "type", e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded px-2 py-1"
                          >
                            <option value="article">Article</option>
                            <option value="documentation">Documentation</option>
                            <option value="video">Video</option>
                            <option value="book">Book</option>
                            <option value="course">Course</option>
                          </select>
                          <input
                            type="text"
                            value={res.title}
                            onChange={(e) => updateResourceField(idx, "title", e.target.value)}
                            placeholder="Resource title"
                            className="w-1/3 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                          />
                          <input
                            type="url"
                            value={res.url}
                            onChange={(e) => updateResourceField(idx, "url", e.target.value)}
                            placeholder="https://..."
                            className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                          />
                          <button
                            type="button"
                            onClick={() => removeResource(idx)}
                            className="text-slate-500 hover:text-red-400 text-xs px-2"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-950/60">
              <button
                type="button"
                onClick={() => setEditingNode(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSaveNode}
                disabled={saveLoading}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors shadow-lg shadow-red-600/20 flex items-center gap-2"
              >
                {saveLoading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Draft Version Modal */}
      {showDraftModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateDraft}
            className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-base font-bold text-white">Create Draft Version</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clones all {nodes.length} nodes from source version <strong className="text-white">v{selectedVersion}</strong> into an isolated draft stage.
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">New Version Tag (SemVer)</label>
              <input
                type="text"
                placeholder="e.g. 1.1.0 or 1.1.0-draft"
                value={newDraftVersionName}
                onChange={(e) => setNewDraftVersionName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDraftModal(false)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={draftLoading}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
              >
                {draftLoading ? "Cloning..." : "Create Draft"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Publish Version Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Publish Version v{selectedVersion}?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will atomically mark all nodes in version <strong className="text-emerald-400">v{selectedVersion}</strong> as <span className="font-mono">published</span> and immediately invalidate all in-memory curriculum caches.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublishVersion}
                disabled={publishLoading}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20"
              >
                {publishLoading ? "Publishing..." : "Confirm & Publish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
