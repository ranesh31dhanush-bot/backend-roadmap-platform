import { fetchApi } from "./client";
import {
  AdminMetricsDTO,
  AdminCurriculumNodeDTO,
  AdminUpdateCurriculumNodeDTO,
  AdminCreateCurriculumNodeDTO,
  CurriculumVersionSummaryDTO,
  AdminAuditLogDTO,
} from "@top1/shared";

export interface AdminQuizQuestionDTO {
  _id: string;
  quizBankId: string;
  canonicalId: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminQuizBankDTO {
  _id: string;
  slug: string;
  title: string;
  description: string;
  tier: "daily" | "weekly" | "phase_exam";
  canonicalId: string;
  phaseNumber?: number;
  durationMinutes: number;
  passThresholdPercentage: number;
  isActive: boolean;
  questionCount: number;
}

export const adminApi = {
  getDashboardMetrics: async (): Promise<AdminMetricsDTO> => {
    return fetchApi<AdminMetricsDTO>("/admin/dashboard");
  },

  getCurriculumNodes: async (params?: {
    version?: string;
    phaseNumber?: number;
    search?: string;
  }): Promise<{ nodes: AdminCurriculumNodeDTO[]; total: number }> => {
    const searchParams = new URLSearchParams();
    if (params?.version) searchParams.append("version", params.version);
    if (params?.phaseNumber) searchParams.append("phaseNumber", params.phaseNumber.toString());
    if (params?.search) searchParams.append("search", params.search);

    const qs = searchParams.toString();
    return fetchApi<{ nodes: AdminCurriculumNodeDTO[]; total: number }>(
      `/admin/curriculum/nodes${qs ? `?${qs}` : ""}`,
    );
  },

  getCurriculumNodeById: async (
    idOrSlug: string,
    version?: string,
  ): Promise<AdminCurriculumNodeDTO> => {
    const qs = version ? `?version=${version}` : "";
    return fetchApi<AdminCurriculumNodeDTO>(`/admin/curriculum/nodes/${idOrSlug}${qs}`);
  },

  updateCurriculumNode: async (
    id: string,
    data: AdminUpdateCurriculumNodeDTO,
  ): Promise<AdminCurriculumNodeDTO> => {
    return fetchApi<AdminCurriculumNodeDTO>(`/admin/curriculum/nodes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  createCurriculumNode: async (
    data: AdminCreateCurriculumNodeDTO,
  ): Promise<AdminCurriculumNodeDTO> => {
    return fetchApi<AdminCurriculumNodeDTO>("/admin/curriculum/nodes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getVersions: async (): Promise<{ versions: CurriculumVersionSummaryDTO[]; total: number }> => {
    return fetchApi<{ versions: CurriculumVersionSummaryDTO[]; total: number }>(
      "/admin/curriculum/versions",
    );
  },

  createDraftVersion: async (
    sourceVersion: string,
    newDraftVersion: string,
  ): Promise<{ version: string; clonedNodesCount: number; status: string }> => {
    return fetchApi<{ version: string; clonedNodesCount: number; status: string }>(
      "/admin/curriculum/versions/draft",
      {
        method: "POST",
        body: JSON.stringify({ sourceVersion, newDraftVersion }),
      },
    );
  },

  publishVersion: async (
    version: string,
  ): Promise<{ version: string; publishedNodesCount: number }> => {
    return fetchApi<{ version: string; publishedNodesCount: number }>(
      "/admin/curriculum/versions/publish",
      {
        method: "POST",
        body: JSON.stringify({ version }),
      },
    );
  },

  getQuizBanks: async (params?: {
    tier?: string;
    phaseNumber?: number;
  }): Promise<{ banks: AdminQuizBankDTO[]; total: number }> => {
    const searchParams = new URLSearchParams();
    if (params?.tier) searchParams.append("tier", params.tier);
    if (params?.phaseNumber) searchParams.append("phaseNumber", params.phaseNumber.toString());

    const qs = searchParams.toString();
    return fetchApi<{ banks: AdminQuizBankDTO[]; total: number }>(
      `/admin/quizzes/banks${qs ? `?${qs}` : ""}`,
    );
  },

  getQuizQuestions: async (
    bankId: string,
  ): Promise<{ bank: AdminQuizBankDTO; questions: AdminQuizQuestionDTO[] }> => {
    return fetchApi<{ bank: AdminQuizBankDTO; questions: AdminQuizQuestionDTO[] }>(
      `/admin/quizzes/banks/${bankId}/questions`,
    );
  },

  createQuizQuestion: async (
    bankId: string,
    data: {
      canonicalId?: string;
      questionText: string;
      options: string[];
      correctOptionIndex: number;
      explanation: string;
      difficulty?: "beginner" | "intermediate" | "advanced";
      order?: number;
    },
  ): Promise<AdminQuizQuestionDTO> => {
    return fetchApi<AdminQuizQuestionDTO>(`/admin/quizzes/banks/${bankId}/questions`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateQuizQuestion: async (
    id: string,
    data: Partial<{
      questionText: string;
      options: string[];
      correctOptionIndex: number;
      explanation: string;
      difficulty: "beginner" | "intermediate" | "advanced";
      order: number;
    }>,
  ): Promise<AdminQuizQuestionDTO> => {
    return fetchApi<AdminQuizQuestionDTO>(`/admin/quizzes/questions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteQuizQuestion: async (id: string): Promise<{ success: boolean; deletedId: string }> => {
    return fetchApi<{ success: boolean; deletedId: string }>(`/admin/quizzes/questions/${id}`, {
      method: "DELETE",
    });
  },

  getAuditLogs: async (params?: {
    entityType?: string;
    entityId?: string;
    adminUserId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ logs: AdminAuditLogDTO[]; total: number; page: number; limit: number }> => {
    const searchParams = new URLSearchParams();
    if (params?.entityType) searchParams.append("entityType", params.entityType);
    if (params?.entityId) searchParams.append("entityId", params.entityId);
    if (params?.adminUserId) searchParams.append("adminUserId", params.adminUserId);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const qs = searchParams.toString();
    return fetchApi<{ logs: AdminAuditLogDTO[]; total: number; page: number; limit: number }>(
      `/admin/audit-logs${qs ? `?${qs}` : ""}`,
    );
  },
};
