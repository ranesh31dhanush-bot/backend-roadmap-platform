import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../../stores/authStore";
import { UserDTO } from "@top1/shared";

describe("Frontend Auth Store", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      csrfToken: null,
    });
  });

  const mockUser: UserDTO = {
    id: "user_123",
    email: "learner@example.com",
    displayName: "Learner One",
    role: "learner",
    isOnboarded: false,
    activeCurriculumVersion: "1.0.0",
    badges: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it("initializes with unauthenticated state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("sets user and csrfToken on successful login", () => {
    useAuthStore.getState().setUser(mockUser, "csrf_sample_token");
    const state = useAuthStore.getState();

    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.csrfToken).toBe("csrf_sample_token");
  });
});
