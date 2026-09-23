import React from "react";
import Link from "next/link";
import { Terminal } from "lucide-react";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerPrompt?: string;
  footerLinkText?: string;
  footerLinkHref?: string;
}

export function AuthCard({
  title,
  subtitle,
  children,
  footerPrompt,
  footerLinkText,
  footerLinkHref,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-2xl backdrop-blur-xl">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2 p-2 rounded-xl bg-surface-elevated border border-border mb-3 hover:border-primary transition-colors">
          <Terminal className="w-5 h-5 text-primary" />
        </Link>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">{title}</h1>
        <p className="text-text-secondary text-sm mt-1">{subtitle}</p>
      </div>

      {/* Form Body */}
      {children}

      {/* Card Footer */}
      {footerPrompt && footerLinkText && footerLinkHref && (
        <div className="mt-6 pt-6 border-t border-border text-center text-xs text-text-muted">
          <span>{footerPrompt} </span>
          <Link href={footerLinkHref} className="text-primary font-medium hover:underline">
            {footerLinkText}
          </Link>
        </div>
      )}
    </div>
  );
}
