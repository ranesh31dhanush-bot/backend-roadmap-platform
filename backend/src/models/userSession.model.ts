import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserSession extends Document {
  userId: mongoose.Types.ObjectId;
  refreshTokenHash: string;
  familyId: string;
  isRevoked: boolean;
  userAgent: string;
  ip: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSessionSchema = new Schema<IUserSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    refreshTokenHash: {
      type: String,
      required: true,
      index: true,
    },
    familyId: {
      type: String,
      required: true,
      index: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    userAgent: {
      type: String,
      default: "Unknown",
    },
    ip: {
      type: String,
      default: "Unknown",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// TTL index to automatically prune expired sessions
userSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound indexes for authentication query patterns
// Token reuse detection: revoke entire family — updateMany({ familyId })
userSessionSchema.index({ familyId: 1, isRevoked: 1 });
// Per-user active session lookup
userSessionSchema.index({ userId: 1, isRevoked: 1, expiresAt: 1 });
// Compound index for user + family queries
userSessionSchema.index({ userId: 1, familyId: 1 });

export const UserSessionModel: Model<IUserSession> =
  (mongoose.models.UserSession as Model<IUserSession>) ||
  mongoose.model<IUserSession>("UserSession", userSessionSchema);
