import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center text-accent-rose mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h1 className="text-3xl font-bold text-text-primary mb-2">404 — Page Not Found</h1>
      <p className="text-text-secondary text-sm max-w-md mb-6">
        The requested roadmap coordinate or resource could not be found.
      </p>
      <Link
        href="/"
        className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
      >
        Return to Home
      </Link>
    </main>
  );
}
