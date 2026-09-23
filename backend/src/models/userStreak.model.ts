import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserStreak extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  activityDates: string[];
  freezeAvailable: boolean;
  freezeUsedAt: string | null;
  lastFreezeResetMonth: string;
  createdAt: Date;
  updatedAt: Date;
}

const userStreakSchema = new Schema<IUserStreak>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastActiveDate: {
      type: String,
      default: null,
    },
    activityDates: {
      type: [String],
      default: [],
    },
    freezeAvailable: {
      type: Boolean,
      default: true,
    },
    freezeUsedAt: {
      type: String,
      default: null,
    },
    lastFreezeResetMonth: {
      type: String,
      default: () => new Date().toISOString().slice(0, 7), // "YYYY-MM"
    },
  },
  {
    timestamps: true,
    collection: "user_streaks",
  },
);

export const UserStreakModel: Model<IUserStreak> =
  (mongoose.models.UserStreak as Model<IUserStreak>) ||
  mongoose.model<IUserStreak>("UserStreak", userStreakSchema);
