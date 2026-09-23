"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/authStore";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      checkAuth();
    }
  }, [checkAuth]);

  return <>{children}</>;
}
