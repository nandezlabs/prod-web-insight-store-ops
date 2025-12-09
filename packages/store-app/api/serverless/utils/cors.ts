/**
 * CORS Helper Utility
 *
 * Provides consistent CORS configuration for all serverless functions.
 * Supports Vercel and Netlify deployments.
 */

/**
 * Default allowed origins
 */
const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
];

/**
 * Get allowed origins from environment
 */
export function getAllowedOrigins(): string[] {
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS.split(",").map((origin) =>
      origin.trim()
    );
  }
  return DEFAULT_ALLOWED_ORIGINS;
}

/**
 * Get CORS headers for a given origin
 */
export function getCorsHeaders(
  origin: string,
  methods: string[] = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
): Record<string, string> {
  const allowedOrigins = getAllowedOrigins();
  const allowedOrigin = allowedOrigins.includes(origin)
    ? origin
    : allowedOrigins[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": methods.join(", "),
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400", // 24 hours
  };
}

/**
 * Apply CORS headers to response
 */
export function applyCorsHeaders(
  res: any,
  origin: string,
  methods?: string[]
): void {
  const headers = getCorsHeaders(origin, methods);
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
}

/**
 * Handle OPTIONS preflight request
 */
export function handlePreflight(req: any, res: any): boolean {
  if (req.method === "OPTIONS") {
    applyCorsHeaders(res, req.headers.origin || "");
    res.status(200).end();
    return true;
  }
  return false;
}

/**
 * CORS middleware for serverless functions
 * Returns true if request was handled (OPTIONS), false otherwise
 */
export function corsMiddleware(
  req: any,
  res: any,
  methods?: string[]
): boolean {
  const origin = req.headers.origin || "";
  applyCorsHeaders(res, origin, methods);
  return handlePreflight(req, res);
}
