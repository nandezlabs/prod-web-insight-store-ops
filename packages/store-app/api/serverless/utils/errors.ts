/**
 * Error Handling Utilities
 *
 * Custom error classes and response helpers for serverless functions.
 */

/**
 * Base API Error
 */
export class ApiError extends Error {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Authentication Error (401)
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = "Authentication required") {
    super(message, 401, "AUTHENTICATION_ERROR");
  }
}

/**
 * Authorization Error (403)
 */
export class AuthorizationError extends ApiError {
  constructor(message: string = "Insufficient permissions") {
    super(message, 403, "AUTHORIZATION_ERROR");
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends ApiError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND_ERROR");
  }
}

/**
 * Validation Error (400)
 */
export class ValidationError extends ApiError {
  fields?: Record<string, string>;

  constructor(
    message: string = "Validation failed",
    fields?: Record<string, string>
  ) {
    super(message, 400, "VALIDATION_ERROR");
    this.fields = fields;
  }
}

/**
 * Rate Limit Error (429)
 */
export class RateLimitError extends ApiError {
  retryAfter?: number;

  constructor(message: string = "Too many requests", retryAfter?: number) {
    super(message, 429, "RATE_LIMIT_ERROR");
    this.retryAfter = retryAfter;
  }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends ApiError {
  constructor(message: string = "Resource conflict") {
    super(message, 409, "CONFLICT_ERROR");
  }
}

/**
 * Internal Server Error (500)
 */
export class InternalServerError extends ApiError {
  constructor(message: string = "Internal server error") {
    super(message, 500, "INTERNAL_SERVER_ERROR");
  }
}

/**
 * Error response interface
 */
interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  fields?: Record<string, string>;
  retryAfter?: number;
  message?: string;
  stack?: string;
}

/**
 * Send error response
 */
export function sendError(res: any, error: Error | ApiError): void {
  const isProduction = process.env.NODE_ENV === "production";

  // Default error response
  const response: ErrorResponse = {
    success: false,
    error: error.message || "An error occurred",
  };

  // Add status code and details for ApiError
  let statusCode = 500;

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    response.code = error.code;

    // Add validation fields if present
    if (error instanceof ValidationError && error.fields) {
      response.fields = error.fields;
    }

    // Add retry-after if present
    if (error instanceof RateLimitError && error.retryAfter) {
      response.retryAfter = error.retryAfter;
      res.setHeader("Retry-After", error.retryAfter.toString());
    }
  }

  // Include detailed message and stack in development
  if (!isProduction) {
    response.message = error.message;
    response.stack = error.stack;
  }

  // Log error server-side
  console.error(`[${statusCode}] ${error.name}:`, error.message);
  if (error.stack && !isProduction) {
    console.error(error.stack);
  }

  // Send response
  res.status(statusCode).json(response);
}

/**
 * Async error handler wrapper
 */
export function asyncHandler(handler: (req: any, res: any) => Promise<void>) {
  return async (req: any, res: any) => {
    try {
      await handler(req, res);
    } catch (error) {
      sendError(res, error as Error);
    }
  };
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  body: any,
  requiredFields: string[]
): void {
  const missingFields: Record<string, string> = {};

  for (const field of requiredFields) {
    if (!body[field] || body[field] === "") {
      missingFields[field] = `${field} is required`;
    }
  }

  if (Object.keys(missingFields).length > 0) {
    throw new ValidationError("Missing required fields", missingFields);
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate string length
 */
export function validateLength(
  value: string,
  min: number,
  max: number
): boolean {
  return value.length >= min && value.length <= max;
}
