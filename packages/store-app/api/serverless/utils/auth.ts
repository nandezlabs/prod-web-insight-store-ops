/**
 * Authentication Utilities
 *
 * Shared JWT verification and authentication helpers for serverless functions.
 */

import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "";

/**
 * JWT Payload interface
 */
export interface JWTPayload {
  id: string;
  storeId: string;
  storeName: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest("base64url");

    if (signature !== expectedSignature) return null;

    // Decode payload
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8")
    );

    // Check expiration
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

/**
 * Parse Authorization header and extract token
 */
export function parseAuthHeader(authHeader: string): string | null {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  return match[1];
}

/**
 * Verify request authentication and return user payload
 */
export function authenticateRequest(req: any): JWTPayload | null {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) return null;

  const token = parseAuthHeader(authHeader);
  if (!token) return null;

  return verifyToken(token);
}

/**
 * Generate JWT token
 */
export function generateToken(storeData: {
  id: string;
  storeId: string;
  storeName: string;
  role: string;
}): string {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const payload = {
    id: storeData.id,
    storeId: storeData.storeId,
    storeName: storeData.storeName,
    role: storeData.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString(
    "base64url"
  );
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url"
  );
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${base64Header}.${base64Payload}`)
    .digest("base64url");

  return `${base64Header}.${base64Payload}.${signature}`;
}
