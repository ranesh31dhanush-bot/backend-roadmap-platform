import http from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { logger } from "./utils/logger.js";

async function bootstrap(): Promise<void> {
  try {
    // 1. Connect to Database
    logger.info("Initializing database connection...");
    await connectDatabase();

    // 2. Create Express App
    const app = createApp();
    const server = http.createServer(app);

    // 3. Start Listening
    server.listen(env.PORT, () => {
      logger.info(
        {
          port: env.PORT,
          env: env.NODE_ENV,
          frontendUrl: env.FRONTEND_URL,
        },
        `🚀 Backend server running on port ${env.PORT}`,
      );
    });

    // 4. Graceful Shutdown Signal Handling
    const shutdown = async (signal: string) => {
      logger.info({ signal }, "Graceful shutdown initiated");

      server.close(async () => {
        logger.info("HTTP server closed");
        try {
          await disconnectDatabase();
          logger.info("Database connection closed");
          process.exit(0);
        } catch (err) {
          logger.error({ err }, "Error during database disconnect");
          process.exit(1);
        }
      });

      // Force shutdown after 10s if stuck
      setTimeout(() => {
        logger.error("Forceful shutdown timeout reached");
        process.exit(1);
      }, 10000).unref();
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    process.on("unhandledRejection", (reason) => {
      logger.error({ reason }, "Unhandled Promise Rejection");
    });

    process.on("uncaughtException", (error) => {
      logger.fatal({ error }, "Uncaught Exception");
      process.exit(1);
    });
  } catch (error) {
    logger.fatal({ error }, "Failed to bootstrap backend application");
    process.exit(1);
  }
}

bootstrap();
