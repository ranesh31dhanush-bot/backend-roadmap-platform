import { fetchApi } from "./client";
import {
  QuizBankDTO,
  QuizStartResponseDTO,
  QuizResultDTO,
  QuizSubmissionItemDTO,
  QuizHighScoreDTO,
} from "@top1/shared";

export async function fetchQuizBanks(): Promise<QuizBankDTO[]> {
  return fetchApi<QuizBankDTO[]>("/quizzes/banks");
}

export async function fetchQuizByCanonicalId(canonicalId: string): Promise<QuizBankDTO | null> {
  return fetchApi<QuizBankDTO>(`/quizzes/canonical/${canonicalId}`).catch(() => null);
}

export async function startQuizAttempt(quizBankId: string): Promise<QuizStartResponseDTO> {
  return fetchApi<QuizStartResponseDTO>(`/quizzes/${quizBankId}/start`, {
    method: "POST",
  });
}

export async function submitQuizAttempt(
  quizBankId: string,
  attemptId: string,
  answers: QuizSubmissionItemDTO[],
  timeSpentSeconds?: number,
): Promise<QuizResultDTO> {
  return fetchApi<QuizResultDTO>(`/quizzes/${quizBankId}/submit`, {
    method: "POST",
    body: JSON.stringify({ attemptId, answers, timeSpentSeconds }),
  });
}

export async function fetchQuizResult(attemptId: string): Promise<QuizResultDTO> {
  return fetchApi<QuizResultDTO>(`/quizzes/attempts/${attemptId}`);
}

export async function fetchQuizHighScores(): Promise<QuizHighScoreDTO[]> {
  return fetchApi<QuizHighScoreDTO[]>("/quizzes/high-scores");
}
