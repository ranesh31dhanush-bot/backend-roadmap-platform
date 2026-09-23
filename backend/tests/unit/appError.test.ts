import { describe, it, expect } from "vitest";
import { AppError } from "../../src/utils/appError.js";

describe("AppError Taxonomy", () => {
  it("creates a badRequest error with 400 and BAD_REQUEST code", () => {
    const err = AppError.badRequest("Invalid query parameter");
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("BAD_REQUEST");
    expect(err.message).toBe("Invalid query parameter");
    expect(err.isOperational).toBe(true);
  });

  it("creates a validation error with details", () => {
    const details = { email: ["Email is invalid"] };
    const err = AppError.validation("Validation failed", details);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.details).toEqual(details);
  });

  it("creates an unauthorized error with 401", () => {
    const err = AppError.unauthorized();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe("AUTHENTICATION_ERROR");
  });

  it("creates a forbidden error with 403", () => {
    const err = AppError.forbidden();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe("AUTHORIZATION_ERROR");
  });

  it("creates a notFound error with 404", () => {
    const err = AppError.notFound("User not found");
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
  });

  it("creates a conflict error with 409", () => {
    const err = AppError.conflict("Email already in use");
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe("CONFLICT");
  });

  it("creates an internal error with 500 and isOperational=false", () => {
    const err = AppError.internal();
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe("INTERNAL_SERVER_ERROR");
    expect(err.isOperational).toBe(false);
  });
});
