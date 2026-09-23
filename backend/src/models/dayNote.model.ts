import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDayNote extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  canonicalDayId: string;
  content: string;
  version: number;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const dayNoteSchema = new Schema<IDayNote>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    canonicalDayId: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: "",
      maxlength: 50000,
    },
    version: {
      type: Number,
      default: 1,
      required: true,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "day_notes",
  },
);

// Compound Unique Index: One note per learner per canonical day
dayNoteSchema.index({ userId: 1, canonicalDayId: 1 }, { unique: true });
dayNoteSchema.index({ userId: 1, updatedAt: -1 });

export const DayNoteModel: Model<IDayNote> =
  (mongoose.models.DayNote as Model<IDayNote>) ||
  mongoose.model<IDayNote>("DayNote", dayNoteSchema);
