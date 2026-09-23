import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/appError.js";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";
import { ApiErrorResponse } from "@top1/shared";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): void {
  const requestId = req.id;

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request data",
        details: err.flatten().fieldErrors,
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    };

    logger.warn({ requestId, err: err.flatten() }, "Validation error");
    res.status(400).json(errorResponse);
    return;
  }

  // Handle Operational AppError
  if (err instanceof AppError) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    };

    if (err.statusCode >= 500) {
      logger.error({ requestId, err }, "Operational server error");
    } else {
      logger.warn({ requestId, err: { message: err.message, code: err.code } }, "Client error");
    }

    res.status(err.statusCode).json(errorResponse);
    return;
  }

  // Handle JSON Syntax Errors in Body Parser
  if ("type" in err && err.type === "entity.parse.failed") {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Malformed JSON payload in request body",
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    };
    res.status(400).json(errorResponse);
    return;
  }

  // Unhandled / Internal Errors
  logger.error({ requestId, err: { name: err.name, message: err.message, stack: err.stack } }, "Unhandled Exception");

  const isDev = env.NODE_ENV === "development";
  const errorResponse: ApiErrorResponse = {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: isDev ? err.message : "An unexpected server error occurred",
      details: isDev ? err.stack : undefined,
    },
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
    },
  };

  res.status(500).json(errorResponse);
}

export function notFoundHandler(req: Request, res: Response): void {
  const errorResponse: ApiErrorResponse = {
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
    meta: {
      requestId: req.id,
      timestamp: new Date().toISOString(),
    },
  };

  res.status(404).json(errorResponse);
}
