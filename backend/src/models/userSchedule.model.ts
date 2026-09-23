import mongoose, { Schema, Document, Model } from "mongoose";
import { ScheduleStatus } from "@top1/shared";

export interface IUserSchedule extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  startDate: string; // "YYYY-MM-DD"
  curDate: string; // "YYYY-MM-DD"
  curPhase: number;
  targetRole: string;
  status: ScheduleStatus;
  isPaused: boolean;
  pausedAt: string | null;
  totalPauseDays: number;
  projectedCompletionDate: string; // "YYYY-MM-DD"
  currentDayCanonicalId: string;
  curriculumVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

const userScheduleSchema = new Schema<IUserSchedule>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    startDate: {
      type: String,
      required: true,
      trim: true,
    },
    curDate: {
      type: String,
      required: true,
      trim: true,
    },
    curPhase: {
      type: Number,
      default: 1,
    },
    targetRole: {
      type: String,
      default: "Backend Engineer",
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "paused", "completed"],
      default: "active",
      index: true,
    },
    isPaused: {
      type: Boolean,
      default: false,
    },
    pausedAt: {
      type: String,
      default: null,
    },
    totalPauseDays: {
      type: Number,
      default: 0,
    },
    projectedCompletionDate: {
      type: String,
      required: true,
      trim: true,
    },
    currentDayCanonicalId: {
      type: String,
      default: "p1-w1-d1",
      trim: true,
    },
    curriculumVersion: {
      type: String,
      default: "1.0.0",
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "user_schedules",
  },
);

export const UserScheduleModel: Model<IUserSchedule> =
  (mongoose.models.UserSchedule as Model<IUserSchedule>) ||
  mongoose.model<IUserSchedule>("UserSchedule", userScheduleSchema);
