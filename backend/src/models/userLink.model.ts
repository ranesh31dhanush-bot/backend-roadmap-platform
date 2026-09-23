import mongoose, { Schema, Document, Model } from "mongoose";

export type LinkType = "CHATGPT" | "PDF_NOTES" | "REPO" | "DOC" | "OTHER";

export interface IUserLink extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  canonicalDayId: string;
  title: string;
  url: string;
  linkType: LinkType;
  createdAt: Date;
  updatedAt: Date;
}

const userLinkSchema = new Schema<IUserLink>(
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
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    url: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    linkType: {
      type: String,
      enum: ["CHATGPT", "PDF_NOTES", "REPO", "DOC", "OTHER"],
      default: "OTHER",
    },
  },
  {
    timestamps: true,
    collection: "external_links",
  },
);

userLinkSchema.index({ userId: 1, canonicalDayId: 1 });
userLinkSchema.index({ userId: 1, createdAt: -1 });

export const UserLinkModel: Model<IUserLink> =
  (mongoose.models.UserLink as Model<IUserLink>) ||
  mongoose.model<IUserLink>("UserLink", userLinkSchema);
