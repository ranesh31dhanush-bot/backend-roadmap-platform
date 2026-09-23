import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserCredentials extends Document {
  userId: mongoose.Types.ObjectId;
  passwordHash: string;
  updatedAt: Date;
}

const userCredentialsSchema = new Schema<IUserCredentials>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  },
);

export const UserCredentialsModel: Model<IUserCredentials> =
  (mongoose.models.UserCredentials as Model<IUserCredentials>) ||
  mongoose.model<IUserCredentials>("UserCredentials", userCredentialsSchema);
