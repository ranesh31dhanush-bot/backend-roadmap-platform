"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { fetchApi, ApiClientError } from "@/lib/api/client";
import { Lock, AlertCircle, Loader2, Check } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Reset token is missing or invalid. Please request a new link.");
      return;
    }
    if (!isPasswordValid) {
      setError("Please ensure your new password satisfies all security criteria.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await fetchApi("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      });

      router.push("/login?reset=success");
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to reset password. The link may be expired.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-accent-rose/10 border border-accent-rose/30 flex items-start gap-2.5 text-accent-rose text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5" htmlFor="newPassword">
          New Secure Password
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="newPassword"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-[11px] text-text-muted">
          <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-accent-emerald" : ""}`}>
            <Check className={`w-3 h-3 ${hasMinLength ? "opacity-100" : "opacity-30"}`} />
            <span>8+ characters</span>
          </div>
          <div className={`flex items-center gap-1.5 ${hasUpper ? "text-accent-emerald" : ""}`}>
            <Check className={`w-3 h-3 ${hasUpper ? "opacity-100" : "opacity-30"}`} />
            <span>Uppercase letter</span>
          </div>
          <div className={`flex items-center gap-1.5 ${hasLower ? "text-accent-emerald" : ""}`}>
            <Check className={`w-3 h-3 ${hasLower ? "opacity-100" : "opacity-30"}`} />
            <span>Lowercase letter</span>
          </div>
          <div className={`flex items-center gap-1.5 ${hasNumber ? "text-accent-emerald" : ""}`}>
            <Check className={`w-3 h-3 ${hasNumber ? "opacity-100" : "opacity-30"}`} />
            <span>Number (0-9)</span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !isPasswordValid || !token}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 mt-3"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Updating password...</span>
          </>
        ) : (
          <span>Set New Password</span>
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Set New Password"
      subtitle="Enter a strong new password for your account"
      footerPrompt="Remembered your password?"
      footerLinkText="Sign in"
      footerLinkHref="/login"
    >
      <Suspense fallback={<div className="text-xs text-text-muted text-center py-4">Loading reset form...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
