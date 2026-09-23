"use client";

import React, { useMemo } from "react";
import { renderMarkdownToHtml } from "@/lib/markdown";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = "",
}) => {
  const sanitizedHtml = useMemo(() => {
    return renderMarkdownToHtml(content);
  }, [content]);

  return (
    <div
      className={`markdown-preview font-mono leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};
