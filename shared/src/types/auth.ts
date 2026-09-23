export type UserRole = "learner" | "admin";

export interface UserDTO {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  isOnboarded: boolean;
  activeCurriculumVersion: string;
  badges: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  sessionId: string;
}

export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
}
