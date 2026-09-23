import mongoose, { Schema, Document } from "mongoose";
import { QuizTier } from "@top1/shared";

export interface IQuizBank extends Document {
  slug: string;
  title: string;
  description: string;
  tier: QuizTier;
  canonicalId: string;
  phaseNumber?: number;
  durationMinutes: number;
  passThresholdPercentage: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const quizBankSchema = new Schema<IQuizBank>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    tier: {
      type: String,
      required: true,
      enum: ["daily", "weekly", "phase_exam"],
      index: true,
    },
    canonicalId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    phaseNumber: {
      type: Number,
      index: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      default: 10,
    },
    passThresholdPercentage: {
      type: Number,
      required: true,
      default: 75,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "quiz_banks",
  },
);

export const QuizBankModel =
  (mongoose.models.QuizBank as mongoose.Model<IQuizBank>) ||
  mongoose.model<IQuizBank>("QuizBank", quizBankSchema);
