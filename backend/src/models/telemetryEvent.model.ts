import mongoose, { Schema, Document, Model } from "mongoose";
import { TelemetryEventType } from "@top1/shared";

export interface ITelemetryEvent extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  eventType: TelemetryEventType;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  occurredAt: Date;
  createdAt: Date;
}

const telemetryEventSchema = new Schema<ITelemetryEvent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        "topic_completed",
        "topic_uncompleted",
        "day_completed",
        "quiz_started",
        "quiz_completed",
        "pomodoro_completed",
        "streak_extended",
        "page_viewed",
        "note_saved",
      ],
      index: true,
    },
    resourceId: {
      type: String,
      trim: true,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: null,
    },
    occurredAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "telemetry_events",
  },
);

// Compound index for per-user event queries with time ordering
telemetryEventSchema.index({ userId: 1, occurredAt: -1 });
telemetryEventSchema.index({ userId: 1, eventType: 1, occurredAt: -1 });

export const TelemetryEventModel: Model<ITelemetryEvent> =
  (mongoose.models.TelemetryEvent as Model<ITelemetryEvent>) ||
  mongoose.model<ITelemetryEvent>("TelemetryEvent", telemetryEventSchema);
