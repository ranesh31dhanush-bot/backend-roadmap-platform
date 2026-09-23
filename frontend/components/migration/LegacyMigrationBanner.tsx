"use client";

import React, { useState, useEffect } from "react";
import { hasLegacyData } from "@/lib/migration/localStorageExtractor";
import { MigrationModal } from "./MigrationModal";

interface LegacyMigrationBannerProps {
  onMigrationComplete?: () => void;
}

export const LegacyMigrationBanner: React.FC<LegacyMigrationBannerProps> = ({
  onMigrationComplete,
}) => {
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const alreadyDismissed = sessionStorage.getItem("top1_migration_banner_dismissed");
      const alreadyMigrated = localStorage.getItem("top1_legacy_migrated");

      if (!alreadyDismissed && !alreadyMigrated && hasLegacyData()) {
        setShowBanner(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("top1_migration_banner_dismissed", "true");
    }
  };

  const handleSuccess = () => {
    setShowBanner(false);
    if (onMigrationComplete) {
      onMigrationComplete();
    }
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-amber-500/15 via-[#58a6ff]/15 to-[#00e676]/15 border border-amber-500/40 rounded-xl p-4 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center space-x-3">
          <span className="text-xl animate-bounce">📦</span>
          <div>
            <h3 className="font-bold text-white flex items-center space-x-1.5">
              <span>Legacy Study Progress Detected!</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                LocalStorage
              </span>
            </h3>
            <p className="text-[11px] text-[#8b949e] mt-0.5">
              We detected previous roadmap checkmarks and notes in this browser. Import them safely to your cloud account.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="py-2 px-3.5 rounded-lg bg-[#00e676] hover:bg-[#00c853] text-black font-bold text-xs shadow-md shadow-[#00e676]/20 transition-all flex items-center space-x-1.5"
          >
            <span>⚡</span>
            <span>Import Existing Progress</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="py-2 px-2.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-white border border-[#30363d] text-xs font-bold transition-all"
            title="Dismiss for this session"
          >
            ✕
          </button>
        </div>
      </div>

      <MigrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMigrationSuccess={handleSuccess}
      />
    </>
  );
};
