/**
 * Safe client-side Markdown sanitizer & HTML generator.
 * Strict zero-trust escaping: All raw HTML is escaped before markdown tokens are processed.
 * Malicious protocols (javascript:, data:, etc.) are blocked.
 */

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function sanitizeUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return "#unsafe-link-blocked";
  }
  if (!lower.startsWith("http://") && !lower.startsWith("https://")) {
    return "#invalid-protocol";
  }
  return trimmed;
}

export function renderMarkdownToHtml(markdown: string): string {
  if (!markdown || !markdown.trim()) {
    return "<p class=\"text-[#8b949e] italic text-xs\">No notes written yet. Start typing to auto-save...</p>";
  }

  // 1. Separate code blocks to preserve whitespace and prevent token parsing inside code
  const codeBlocks: string[] = [];
  let content = markdown.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    const escapedCode = escapeHtml(code);
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(
      `<pre class="bg-[#0d1117] border border-[#30363d] rounded-lg p-3.5 my-3 overflow-x-auto text-xs font-mono text-[#c9d1d9]"><div class="text-[10px] text-[#8b949e] uppercase font-bold mb-1 select-none">${escapeHtml(
        lang || "code",
      )}</div><code>${escapedCode}</code></pre>`,
    );
    return placeholder;
  });

  // 2. Escape all remaining raw HTML to prevent XSS
  content = escapeHtml(content);

  // 3. Process inline code
  content = content.replace(/`([^`]+)`/g, (_match, inlineCode) => {
    return `<code class="px-1.5 py-0.5 rounded bg-[#21262d] text-[#58a6ff] font-mono text-xs border border-[#30363d]">${inlineCode}</code>`;
  });

  // 4. Process safe links [text](url)
  content = content.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_match, text, url) => {
      const safe = sanitizeUrl(url);
      return `<a href="${safe}" target="_blank" rel="noopener noreferrer" class="text-[#58a6ff] hover:text-[#00e676] underline font-medium transition-colors">${text} ↗</a>`;
    },
  );

  // 5. Process Bold and Italics
  content = content.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
  content = content.replace(/\*([^*]+)\*/g, '<em class="italic text-[#c9d1d9]">$1</em>');

  // 6. Split by lines and process line-level elements (Headers, Blockquotes, Lists)
  const lines = content.split("\n");
  const outputLines: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check code block placeholder
    if (line.includes("__CODE_BLOCK_")) {
      if (inList) {
        outputLines.push("</ul>");
        inList = false;
      }
      outputLines.push(line);
      continue;
    }

    // Headers
    if (line.startsWith("### ")) {
      if (inList) {
        outputLines.push("</ul>");
        inList = false;
      }
      outputLines.push(
        `<h3 class="text-sm font-bold font-mono text-[#58a6ff] mt-4 mb-2 flex items-center gap-1.5"><span>▸</span>${line.slice(
          4,
        )}</h3>`,
      );
      continue;
    }
    if (line.startsWith("## ")) {
      if (inList) {
        outputLines.push("</ul>");
        inList = false;
      }
      outputLines.push(
        `<h2 class="text-base font-bold font-mono text-white mt-5 mb-2 pb-1 border-b border-[#30363d]">${line.slice(
          3,
        )}</h2>`,
      );
      continue;
    }
    if (line.startsWith("# ")) {
      if (inList) {
        outputLines.push("</ul>");
        inList = false;
      }
      outputLines.push(
        `<h1 class="text-lg font-bold font-mono text-white mt-6 mb-3 pb-2 border-b border-[#30363d]">${line.slice(
          2,
        )}</h1>`,
      );
      continue;
    }

    // Blockquotes
    if (line.startsWith("&gt; ") || line.startsWith("> ")) {
      if (inList) {
        outputLines.push("</ul>");
        inList = false;
      }
      const quoteContent = line.replace(/^(&gt;|>)\s?/, "");
      outputLines.push(
        `<blockquote class="border-l-2 border-[#58a6ff] bg-[#161b22]/60 px-3 py-2 my-2 rounded-r text-xs text-[#8b949e] italic">${quoteContent}</blockquote>`,
      );
      continue;
    }

    // Unordered lists
    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList) {
        outputLines.push('<ul class="space-y-1 my-2 list-disc list-inside text-xs text-[#c9d1d9]">');
        inList = true;
      }
      outputLines.push(`<li class="leading-relaxed">${line.slice(2)}</li>`);
      continue;
    }

    // Blank line ends list
    if (!line.trim()) {
      if (inList) {
        outputLines.push("</ul>");
        inList = false;
      }
      outputLines.push('<div class="h-2"></div>');
      continue;
    }

    // Normal paragraph line
    if (inList) {
      outputLines.push("</ul>");
      inList = false;
    }
    outputLines.push(`<p class="text-xs leading-relaxed text-[#c9d1d9] my-1">${line}</p>`);
  }

  if (inList) {
    outputLines.push("</ul>");
  }

  let finalHtml = outputLines.join("\n");

  // Restore code blocks
  codeBlocks.forEach((block, idx) => {
    finalHtml = finalHtml.replace(`__CODE_BLOCK_${idx}__`, block);
  });

  return finalHtml;
}
