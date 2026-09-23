export type QuizTier = "daily" | "weekly" | "phase_exam";

export interface QuizQuestionClientDTO {
  id: string;
  questionText: string;
  options: string[];
}

export interface QuizSubmissionItemDTO {
  questionId: string;
  selectedOptionIndex: number;
}

export interface QuestionExplanationDTO {
  questionId: string;
  questionText: string;
  selectedOptionIndex: number;
  correctOptionIndex: number;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizResultDTO {
  attemptId: string;
  quizBankId: string;
  quizTitle: string;
  scorePercentage: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswersCount: number;
  timeSpentSeconds: number;
  explanations: QuestionExplanationDTO[];
  highScore: number;
  badgeUnlocked?: string;
}

export interface QuizBankDTO {
  id: string;
  slug: string;
  title: string;
  description: string;
  tier: QuizTier;
  canonicalId: string;
  phaseNumber?: number;
  durationMinutes: number;
  passThresholdPercentage: number;
  questionCount: number;
  highScore?: number;
  passed?: boolean;
}

export interface QuizStartResponseDTO {
  attemptId: string;
  quizBankId: string;
  quizTitle: string;
  tier: QuizTier;
  durationMinutes: number;
  passThresholdPercentage: number;
  questions: QuizQuestionClientDTO[];
  startedAt: string;
}

export interface QuizSubmitRequestDTO {
  attemptId: string;
  answers: QuizSubmissionItemDTO[];
  timeSpentSeconds?: number;
}

export interface QuizHighScoreDTO {
  quizBankId: string;
  canonicalId: string;
  highScorePercentage: number;
  passed: boolean;
  attemptsCount: number;
  lastAttemptAt: string;
}
