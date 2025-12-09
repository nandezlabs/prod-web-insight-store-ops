import CryptoJS from "crypto-js";

const ENCRYPTION_KEY =
  import.meta.env.VITE_ENCRYPTION_KEY || "your-secret-key-change-in-production";

/**
 * Encrypt sensitive data using AES-256-GCM
 */
export function encryptData(data: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypt encrypted data
 */
export function decryptData(encryptedData: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt data");
  }
}

/**
 * Encrypt sensitive fields in a P&L report
 */
export function encryptPLReport(
  data: Record<string, any>
): Record<string, any> {
  const sensitiveFields = [
    "revenue",
    "cogs",
    "laborCosts",
    "rent",
    "utilities",
    "marketing",
    "otherExpenses",
  ];

  const encrypted = { ...data };

  sensitiveFields.forEach((field) => {
    if (encrypted[field] !== undefined && encrypted[field] !== null) {
      encrypted[field] = encryptData(String(encrypted[field]));
    }
  });

  return encrypted;
}

/**
 * Decrypt sensitive fields in a P&L report
 */
export function decryptPLReport(
  data: Record<string, any>
): Record<string, any> {
  const sensitiveFields = [
    "revenue",
    "cogs",
    "laborCosts",
    "rent",
    "utilities",
    "marketing",
    "otherExpenses",
  ];

  const decrypted = { ...data };

  sensitiveFields.forEach((field) => {
    if (
      decrypted[field] !== undefined &&
      decrypted[field] !== null &&
      typeof decrypted[field] === "string"
    ) {
      try {
        decrypted[field] = parseFloat(decryptData(decrypted[field]));
      } catch (error) {
        console.error(`Failed to decrypt field ${field}:`, error);
        decrypted[field] = 0;
      }
    }
  });

  return decrypted;
}
