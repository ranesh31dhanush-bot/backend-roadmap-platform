import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITopicProgress extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  topicId: string;
  canonicalDayId: string;
  phaseNumber: number;
  weekNumber: number;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const topicProgressSchema = new Schema<ITopicProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    topicId: {
      type: String,
      required: true,
      trim: true,
    },
    canonicalDayId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    phaseNumber: {
      type: Number,
      required: true,
      index: true,
    },
    weekNumber: {
      type: Number,
      required: true,
      index: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "topic_progress",
  },
);

// Compound Unique Index: One progress record per learner per canonical topicId
topicProgressSchema.index({ userId: 1, topicId: 1 }, { unique: true });
topicProgressSchema.index({ userId: 1, canonicalDayId: 1 });
topicProgressSchema.index({ userId: 1, phaseNumber: 1 });

export const TopicProgressModel: Model<ITopicProgress> =
  (mongoose.models.TopicProgress as Model<ITopicProgress>) ||
  mongoose.model<ITopicProgress>("TopicProgress", topicProgressSchema);
