import mongoose, { Schema, Document, Model } from "mongoose";
import { CurriculumDayNodeDTO } from "@top1/shared";

export interface ICurriculumNode extends Document, Omit<CurriculumDayNodeDTO, "id"> {
  _id: mongoose.Types.ObjectId;
  status: "published" | "draft" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

const subtopicSchema = new Schema(
  {
    topicId: { type: String, required: true },
    text: { type: String, required: true },
  },
  { _id: false },
);

const resourceSchema = new Schema(
  {
    type: { type: String, default: "article" },
    title: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false },
);

const projectSchema = new Schema(
  {
    name: { type: String, required: true },
    desc: { type: String, required: true },
    tags: { type: [String], default: [] },
  },
  { _id: false },
);

const salaryMetaSchema = new Schema(
  {
    min: { type: String, default: "" },
    mid: { type: String, default: "" },
    max: { type: String, default: "" },
    roles: { type: [String], default: [] },
    note: { type: String, default: "" },
  },
  { _id: false },
);

const curriculumNodeSchema = new Schema<ICurriculumNode>(
  {
    version: {
      type: String,
      required: true,
      default: "1.0.0",
      index: true,
    },
    canonicalDayId: {
      type: String,
      required: true,
      trim: true,
    },
    phaseNumber: {
      type: Number,
      required: true,
      index: true,
    },
    phaseName: {
      type: String,
      required: true,
    },
    phaseColor: {
      type: String,
      default: "#00e676",
    },
    weekNumber: {
      type: Number,
      required: true,
      index: true,
    },
    weekIndexInPhase: {
      type: Number,
      default: 1,
    },
    weekTitle: {
      type: String,
      required: true,
    },
    dayNumberInWeek: {
      type: Number,
      required: true,
    },
    globalDayNumber: {
      type: Number,
      required: true,
      index: true,
    },
    isRestDay: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    skipDirectives: {
      type: [String],
      default: [],
    },
    salaryMeta: {
      type: salaryMetaSchema,
      default: null,
    },
    projects: {
      type: [projectSchema],
      default: [],
    },
    subtopics: {
      type: [subtopicSchema],
      default: [],
    },
    resources: {
      type: [resourceSchema],
      default: [],
    },
    quizBankKey: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["published", "draft", "archived"],
      default: "published",
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "curriculum_nodes",
  },
);

// Compound Unique Index: One canonicalDayId per curriculum version
curriculumNodeSchema.index({ version: 1, canonicalDayId: 1 }, { unique: true });
curriculumNodeSchema.index({ version: 1, phaseNumber: 1, weekNumber: 1 });
curriculumNodeSchema.index({ version: 1, status: 1 });

export const CurriculumNodeModel: Model<ICurriculumNode> =
  (mongoose.models.CurriculumNode as Model<ICurriculumNode>) ||
  mongoose.model<ICurriculumNode>("CurriculumNode", curriculumNodeSchema);
