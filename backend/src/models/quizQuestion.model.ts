import mongoose, { Schema, Document } from "mongoose";

export interface IQuizQuestion extends Document {
  quizBankId: mongoose.Types.ObjectId;
  canonicalId: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const quizQuestionSchema = new Schema<IQuizQuestion>(
  {
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
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: [
        (val: string[]) => val.length >= 2 && val.length <= 6,
        "Question must contain between 2 and 6 options",
      ],
    },
    correctOptionIndex: {
      type: Number,
      required: true,
    },
    explanation: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate",
    },
    order: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  {
    timestamps: true,
    collection: "quiz_questions",
  },
);

quizQuestionSchema.index({ quizBankId: 1, order: 1 });

export const QuizQuestionModel =
  (mongoose.models.QuizQuestion as mongoose.Model<IQuizQuestion>) ||
  mongoose.model<IQuizQuestion>("QuizQuestion", quizQuestionSchema);
