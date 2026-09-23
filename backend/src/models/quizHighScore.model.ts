import mongoose, { Schema, Document } from "mongoose";

export interface IQuizHighScore extends Document {
  userId: mongoose.Types.ObjectId;
  quizBankId: mongoose.Types.ObjectId;
  canonicalId: string;
  highScorePercentage: number;
  passed: boolean;
  attemptsCount: number;
  lastAttemptAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const quizHighScoreSchema = new Schema<IQuizHighScore>(
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
    highScorePercentage: {
      type: Number,
      required: true,
      default: 0,
    },
    passed: {
      type: Boolean,
      required: true,
      default: false,
    },
    attemptsCount: {
      type: Number,
      required: true,
      default: 1,
    },
    lastAttemptAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "quiz_high_scores",
  },
);

quizHighScoreSchema.index({ userId: 1, quizBankId: 1 }, { unique: true });
quizHighScoreSchema.index({ userId: 1, canonicalId: 1 });

export const QuizHighScoreModel =
  (mongoose.models.QuizHighScore as mongoose.Model<IQuizHighScore>) ||
  mongoose.model<IQuizHighScore>("QuizHighScore", quizHighScoreSchema);
