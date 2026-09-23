import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../../stores/authStore";
import { UserDTO } from "@top1/shared";

function addDaysToDateStr(dateStr: string, days: number): string {
  const parts = dateStr.split("-").map(Number);
  const start = new Date(Date.UTC(parts[0]!, parts[1]! - 1, parts[2]!));
  const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
  return end.toISOString().split("T")[0]!;
}

describe("Frontend Onboarding Logic & Store Hydration", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      csrfToken: null,
    });
  });

  const initialUser: UserDTO = {
    id: "learner_456",
    email: "new_learner@example.com",
    displayName: "New Learner",
    role: "learner",
    isOnboarded: false,
    activeCurriculumVersion: "1.0.0",
    badges: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it("calculates 52-week graduation date precisely (+363 days)", () => {
    const startDate = "2026-09-22";
    const completionDate = addDaysToDateStr(startDate, 363);
    expect(completionDate).toBe("2027-09-20");
  });

  it("hydrates auth state with isOnboarded = true on onboarding completion", () => {
    useAuthStore.getState().setUser(initialUser);
    expect(useAuthStore.getState().user?.isOnboarded).toBe(false);

    // Simulate onboarding completion
    const updatedUser = {
      ...initialUser,
      isOnboarded: true,
    };
    useAuthStore.getState().setUser(updatedUser);

    expect(useAuthStore.getState().user?.isOnboarded).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });
});
