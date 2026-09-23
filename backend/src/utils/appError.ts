export type ErrorCode =
  | "VALIDATION_ERROR"
  | "AUTHENTICATION_ERROR"
  | "AUTHORIZATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMIT_EXCEEDED"
  | "BAD_REQUEST"
  | "INTERNAL_SERVER_ERROR"
  | "DATABASE_ERROR"
  | "MAINTENANCE";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    code: ErrorCode = "INTERNAL_SERVER_ERROR",
    isOperational: boolean = true,
    details?: unknown,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: unknown): AppError {
    return new AppError(message, 400, "BAD_REQUEST", true, details);
  }

  static validation(message: string, details?: unknown): AppError {
    return new AppError(message, 400, "VALIDATION_ERROR", true, details);
  }

  static unauthorized(message: string = "Authentication required", details?: unknown): AppError {
    return new AppError(message, 401, "AUTHENTICATION_ERROR", true, details);
  }

  static forbidden(message: string = "Access forbidden", details?: unknown): AppError {
    return new AppError(message, 403, "AUTHORIZATION_ERROR", true, details);
  }

  static notFound(message: string = "Resource not found", details?: unknown): AppError {
    return new AppError(message, 404, "NOT_FOUND", true, details);
  }

  static conflict(message: string, details?: unknown): AppError {
    return new AppError(message, 409, "CONFLICT", true, details);
  }

  static rateLimit(message: string = "Too many requests. Please try again later.", details?: unknown): AppError {
    return new AppError(message, 429, "RATE_LIMIT_EXCEEDED", true, details);
  }

  static internal(message: string = "An unexpected error occurred", details?: unknown): AppError {
    return new AppError(message, 500, "INTERNAL_SERVER_ERROR", false, details);
  }
}
