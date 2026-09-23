import mongoose, { Schema, Document } from "mongoose";

export interface IQuizAttemptAnswer {
  questionId: mongoose.Types.ObjectId;
  selectedOptionIndex: number;
  isCorrect: boolean;
}

export interface IQuizAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  quizBankId: mongoose.Types.ObjectId;
  canonicalId: string;
  status: "in_progress" | "submitted" | "expired";
  startedAt: Date;
  submittedAt?: Date;
  timeSpentSeconds: number;
  scorePercentage: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswersCount: number;
  answers: IQuizAttemptAnswer[];
  createdAt: Date;
  updatedAt: Date;
}

const quizAttemptAnswerSchema = new Schema<IQuizAttemptAnswer>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "QuizQuestion",
      required: true,
    },
    selectedOptionIndex: {
      type: Number,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
  },
  { _id: false },
);

const quizAttemptSchema = new Schema<IQuizAttempt>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    quizBankId: {
      type: Schema.Types.ObjectId,
      ref: "QuizBank",
      required: true,
      index: true,
    },
    canonicalId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["in_progress", "submitted", "expired"],
      default: "in_progress",
      index: true,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
    },
    timeSpentSeconds: {
      type: Number,
      default: 0,
    },
    scorePercentage: {
      type: Number,
      default: 0,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    totalQuestions: {
      type: Number,
      required: true,
      default: 0,
    },
    correctAnswersCount: {
      type: Number,
      required: true,
      default: 0,
    },
    answers: {
      type: [quizAttemptAnswerSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "quiz_attempts",
  },
);

// Compound indexes for quiz query patterns
// Per-user attempt history ordered by creation time
quizAttemptSchema.index({ userId: 1, quizBankId: 1, createdAt: -1 });
// In-progress attempt lookup (used during quiz submission to validate attempt ownership)
quizAttemptSchema.index({ userId: 1, status: 1 });


export const QuizAttemptModel =
  (mongoose.models.QuizAttempt as mongoose.Model<IQuizAttempt>) ||
  mongoose.model<IQuizAttempt>("QuizAttempt", quizAttemptSchema);
