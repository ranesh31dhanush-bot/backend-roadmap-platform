import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

interface DatabaseHealth {
  status: "connected" | "disconnected" | "connecting";
  latencyMs?: number;
}

export async function connectDatabase(uri?: string): Promise<typeof mongoose> {
  const connectionUri = uri || env.MONGODB_URI;

  mongoose.connection.on("connected", () => {
    logger.info({ uri: connectionUri.replace(/\/\/.*@/, "//***:***@") }, "MongoDB connection established");
  });

  mongoose.connection.on("error", (err) => {
    logger.error({ err }, "MongoDB connection error");
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB connection disconnected");
  });

  return mongoose.connect(connectionUri, {
    maxPoolSize: env.MONGODB_POOL_SIZE,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    autoIndex: env.NODE_ENV !== "production",
  });
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected gracefully");
  }
}

export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const readyState = mongoose.connection.readyState;

  if (readyState === 1) {
    const start = Date.now();
    try {
      if (mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
      }
      return {
        status: "connected",
        latencyMs: Date.now() - start,
      };
    } catch {
      return { status: "disconnected" };
    }
  }

  if (readyState === 2) {
    return { status: "connecting" };
  }

  return { status: "disconnected" };
}
