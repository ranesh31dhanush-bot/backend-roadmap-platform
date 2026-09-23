import mongoose, { Schema, Document, Model } from "mongoose";
import { UserRole } from "@top1/shared";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  googleId?: string;
  isOnboarded: boolean;
  activeCurriculumVersion: string;
  badges: string[];
  isMigrated: boolean;
  migratedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["learner", "admin"],
      default: "learner",
      required: true,
      index: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    activeCurriculumVersion: {
      type: String,
      default: "1.0.0",
    },
    badges: {
      type: [String],
      default: [],
    },
    isMigrated: {
      type: Boolean,
      default: false,
    },
    migratedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const UserModel: Model<IUser> =
  (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>("User", userSchema);
