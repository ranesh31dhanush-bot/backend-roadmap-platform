import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICapstoneProject extends Document {
  _id: mongoose.Types.ObjectId;
  canonicalId: string;
  title: string;
  description: string;
  phase: number;
  order: number;
  difficulty: "intermediate" | "advanced" | "expert";
  techStack: string[];
  objectives: string[];
  architectureDiagram?: string;
  performanceBenchmark?: string;
  createdAt: Date;
  updatedAt: Date;
}

const capstoneProjectSchema = new Schema<ICapstoneProject>(
  {
    canonicalId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
    phase: {
      type: Number,
      required: true,
      index: true,
    },
    order: {
      type: Number,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["intermediate", "advanced", "expert"],
      required: true,
    },
    techStack: {
      type: [String],
      default: [],
    },
    objectives: {
      type: [String],
      default: [],
    },
    architectureDiagram: {
      type: String,
      default: null,
    },
    performanceBenchmark: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "capstone_projects",
  },
);

capstoneProjectSchema.index({ order: 1 });

export const CapstoneProjectModel: Model<ICapstoneProject> =
  (mongoose.models.CapstoneProject as Model<ICapstoneProject>) ||
  mongoose.model<ICapstoneProject>("CapstoneProject", capstoneProjectSchema);
