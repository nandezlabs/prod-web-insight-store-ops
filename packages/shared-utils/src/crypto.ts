/**
 * Cryptography Utilities
 */

/**
 * Generate random string
 */
export function generateRandomString(length: number): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate UUID v4
 */
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Hash string using simple hash function
 * Note: Not cryptographically secure, use for non-security purposes only
 */
export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Base64 encode
 */
export function base64Encode(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (error) {
    console.error("Base64 encoding error:", error);
    return "";
  }
}

/**
 * Base64 decode
 */
export function base64Decode(str: string): string {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch (error) {
    console.error("Base64 decoding error:", error);
    return "";
  }
}

/**
 * Generate secure token (for client-side use)
 */
export function generateToken(length = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

/**
 * Mask sensitive data (e.g., credit card, phone)
 */
export function maskString(str: string, visibleChars = 4): string {
  if (str.length <= visibleChars) return str;
  const masked = "*".repeat(str.length - visibleChars);
  return masked + str.slice(-visibleChars);
}
