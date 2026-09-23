"use client";

import React, { useState, useEffect } from "react";
import { fetchDayLinks, createDayLink, deleteDayLink } from "@/lib/api/notes";
import { UserLinkDTO, CustomLinkType } from "@top1/shared";

interface CustomLinksManagerProps {
  canonicalDayId: string;
}

export const CustomLinksManager: React.FC<CustomLinksManagerProps> = ({
  canonicalDayId,
}) => {
  const [links, setLinks] = useState<UserLinkDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [linkType, setLinkType] = useState<CustomLinkType>("OTHER");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadLinks() {
      try {
        setLoading(true);
        setErrorMsg(null);
        const data = await fetchDayLinks(canonicalDayId);
        if (isMounted) {
          setLinks(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err.message || "Failed to load custom links");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadLinks();

    return () => {
      isMounted = false;
    };
  }, [canonicalDayId]);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedUrl = url.trim();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setFormError("Title is required");
      return;
    }

    if (!trimmedUrl) {
      setFormError("URL is required");
      return;
    }

    if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
      setFormError("URL must begin with http:// or https://");
      return;
    }

    try {
      setSubmitting(true);
      const newLink = await createDayLink({
        canonicalDayId,
        title: trimmedTitle,
        url: trimmedUrl,
        linkType,
      });

      setLinks((prev) => [newLink, ...prev]);
      setTitle("");
      setUrl("");
      setLinkType("OTHER");
      setIsAdding(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to add link");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    const previous = [...links];
    setLinks((prev) => prev.filter((l) => l.id !== linkId));

    try {
      await deleteDayLink(linkId);
    } catch (err: any) {
      setLinks(previous);
      setErrorMsg(err.message || "Failed to delete link");
    }
  };

  const getTypeIcon = (type: CustomLinkType) => {
    switch (type) {
      case "CHATGPT":
        return "🤖";
      case "PDF_NOTES":
        return "📑";
      case "REPO":
        return "🐙";
      case "DOC":
        return "📚";
      default:
        return "🔗";
    }
  };

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg font-mono text-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
        <div className="flex items-center space-x-2">
          <span>🔗</span>
          <h3 className="font-bold text-white">Custom Reference Links ({links.length})</h3>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] hover:text-[#00e676] border border-[#30363d] text-[11px] font-bold transition-all"
        >
          {isAdding ? "✕ Cancel" : "+ Add Link"}
        </button>
      </div>

      {/* Add Link Form */}
      {isAdding && (
        <form
          onSubmit={handleAddLink}
          className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3.5 space-y-3"
        >
          {formError && (
            <p className="text-[11px] text-red-400 font-semibold">⚠️ {formError}</p>
          )}

          <div>
            <label className="block text-[10px] text-[#8b949e] uppercase font-bold mb-1">
              Link Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. My ChatGPT Breakdown or Architecture Diagram"
              className="w-full bg-[#161b22] border border-[#30363d] rounded p-2 text-xs text-white focus:outline-none focus:border-[#00e676]"
            />
          </div>

          <div>
            <label className="block text-[10px] text-[#8b949e] uppercase font-bold mb-1">
              URL (HTTPS / HTTP)
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://chatgpt.com/share/... or https://github.com/..."
              className="w-full bg-[#161b22] border border-[#30363d] rounded p-2 text-xs text-white focus:outline-none focus:border-[#00e676]"
            />
          </div>

          <div>
            <label className="block text-[10px] text-[#8b949e] uppercase font-bold mb-1">
              Category
            </label>
            <select
              value={linkType}
              onChange={(e) => setLinkType(e.target.value as CustomLinkType)}
              className="w-full bg-[#161b22] border border-[#30363d] rounded p-2 text-xs text-white focus:outline-none focus:border-[#00e676]"
            >
              <option value="CHATGPT">🤖 ChatGPT Share Link</option>
              <option value="PDF_NOTES">📑 PDF Notes / Summary</option>
              <option value="REPO">🐙 GitHub Repository / Gist</option>
              <option value="DOC">📚 Official Documentation</option>
              <option value="OTHER">🔗 Other Reference</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 rounded text-xs text-[#8b949e] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3 py-1 rounded bg-[#00e676] text-black font-bold text-xs hover:bg-[#00c853] disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Link"}
            </button>
          </div>
        </form>
      )}

      {/* Error Message */}
      {errorMsg && (
        <p className="text-[11px] text-red-400">⚠️ {errorMsg}</p>
      )}

      {/* Links List */}
      {loading ? (
        <p className="text-xs text-[#8b949e] italic">Loading links...</p>
      ) : links.length === 0 ? (
        <p className="text-xs text-[#8b949e] italic">
          No custom reference links added yet. Save your ChatGPT discussions, GitHub code, or PDF summaries here!
        </p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {links.map((link) => (
            <div
              key={link.id}
              className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d] flex items-center justify-between gap-2 hover:border-[#58a6ff]/50 transition-colors group"
            >
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 min-w-0 flex-1 text-[#58a6ff] hover:text-[#00e676] transition-colors"
              >
                <span className="text-sm">{getTypeIcon(link.linkType)}</span>
                <span className="font-bold truncate text-xs">{link.title}</span>
                <span className="text-[10px] text-[#8b949e] group-hover:text-[#58a6ff]">↗</span>
              </a>

              <button
                type="button"
                onClick={() => handleDeleteLink(link.id)}
                title="Delete link"
                className="text-[#8b949e] hover:text-red-400 p-1 text-[11px] transition-colors"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
