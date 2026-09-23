import { create } from "zustand";
import { UserDTO } from "@top1/shared";
import { fetchApi } from "@/lib/api/client";

interface AuthState {
  user: UserDTO | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  csrfToken: string | null;
  setUser: (user: UserDTO | null, csrfToken?: string) => void;
  setCsrfToken: (token: string) => void;
  checkAuth: () => Promise<UserDTO | null>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  csrfToken: null,

  setUser: (user, csrfToken) =>
    set((state) => ({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      csrfToken: csrfToken !== undefined ? csrfToken : state.csrfToken,
    })),

  setCsrfToken: (csrfToken) => set({ csrfToken }),

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const data = await fetchApi<{ user: UserDTO }>("/auth/me");
      set({ user: data.user, isAuthenticated: true, isLoading: false });
      return data.user;
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return null;
    }
  },

  logout: async () => {
    try {
      await fetchApi("/auth/logout", { method: "POST" });
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false, csrfToken: null });
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  },
}));
