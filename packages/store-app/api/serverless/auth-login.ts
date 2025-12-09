/**
 * Serverless Function: Store Login
 *
 * Handles PIN-based authentication for store users with Notion integration.
 * Compatible with Vercel and Netlify serverless deployments.
 *
 * POST /api/auth/login
 * Request body: { storeId: string, pin: string }
 */

import { Client } from "@notionhq/client";
import crypto from "crypto";
import { getCorsHeaders, applyCorsHeaders } from "./utils/cors";
import {
  checkRateLimit,
  getClientIP,
  setRateLimitHeaders,
  RATE_LIMITS,
} from "./utils/rateLimit";
import { generateToken } from "./utils/auth";

// Environment variables
const NOTION_API_KEY = process.env.NOTION_API_KEY || "";
const DB_STORE_USERS = process.env.DB_STORE_USERS || "";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "";

// Initialize Notion client
const notion = new Client({ auth: NOTION_API_KEY });

/**
 * Verify PIN against encrypted hash
 */
function verifyPIN(pin: string, encryptedHash: string): boolean {
  try {
    // Decrypt the stored hash
    const parts = encryptedHash.split(":");
    if (parts.length !== 2) return false;

    const iv = Buffer.from(parts[0], "hex");
    const encrypted = Buffer.from(parts[1], "hex");
    const key = Buffer.from(ENCRYPTION_KEY, "utf-8").subarray(0, 32);

    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    const storedHash = decrypted.toString();

    // Hash the provided PIN
    const hash = crypto.createHash("sha256").update(pin).digest("hex");

    return hash === storedHash;
  } catch (error) {
    console.error("PIN verification error:", error);
    return false;
  }
}

/**
 * Log analytics event to Notion
 */
async function logAnalyticsEvent(
  storeId: string,
  storeName: string,
  eventType: string,
  success: boolean,
  metadata: Record<string, any> = {}
): Promise<void> {
  const DB_ANALYTICS_LOGS = process.env.DB_ANALYTICS_LOGS;
  if (!DB_ANALYTICS_LOGS) return;

  try {
    await notion.pages.create({
      parent: { database_id: DB_ANALYTICS_LOGS },
      properties: {
        "Event Type": { select: { name: eventType } },
        "Store ID": { rich_text: [{ text: { content: storeId } }] },
        "Store Name": { title: [{ text: { content: storeName } }] },
        Success: { checkbox: success },
        Timestamp: { date: { start: new Date().toISOString() } },
        Metadata: {
          rich_text: [{ text: { content: JSON.stringify(metadata) } }],
        },
      },
    });
  } catch (error) {
    console.error("Failed to log analytics:", error);
    // Don't throw - logging failure shouldn't break login
  }
}

/**
 * Main handler function
 */
export default async function handler(req: any, res: any) {
  const origin = req.headers.origin || req.headers.referer || "";

  // Set CORS headers
  applyCorsHeaders(res, origin, ["POST", "OPTIONS"]);

  // Handle OPTIONS preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== "POST") {
    res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
    return;
  }

  try {
    // Rate limiting
    const ip = getClientIP(req);
    const rateLimit = checkRateLimit(ip, RATE_LIMITS.login);

    setRateLimitHeaders(
      res,
      RATE_LIMITS.login.maxAttempts,
      rateLimit.remaining,
      rateLimit.resetTime
    );

    if (!rateLimit.allowed) {
      res.status(429).json({
        success: false,
        error: "Too many login attempts. Please try again in 15 minutes.",
      });
      return;
    }

    // Parse request body
    const { storeId, pin } = req.body;

    // Validate input
    if (!storeId || !pin) {
      res.status(400).json({
        success: false,
        error: "Store ID and PIN are required",
      });
      return;
    }

    if (typeof pin !== "string" || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      res.status(400).json({
        success: false,
        error: "Invalid PIN format",
      });
      return;
    }

    // Query Notion Store Users database
    const response = await notion.databases.query({
      database_id: DB_STORE_USERS,
      filter: {
        property: "Store ID",
        rich_text: {
          equals: storeId,
        },
      },
    });

    // Check if store found
    if (response.results.length === 0) {
      await logAnalyticsEvent(storeId, "Unknown", "Login Attempt", false, {
        reason: "Store not found",
        ip,
      });

      res.status(404).json({
        success: false,
        error: "Store not found",
      });
      return;
    }

    const storePage: any = response.results[0];
    const properties = storePage.properties;

    // Extract store data
    const storeData = {
      id: storePage.id,
      storeId: properties["Store ID"]?.rich_text?.[0]?.text?.content || storeId,
      storeName: properties["Store Name"]?.title?.[0]?.text?.content || "",
      role: properties["Role"]?.select?.name || "user",
      status: properties["Status"]?.select?.name || "Inactive",
      pinHash: properties["PIN Hash"]?.rich_text?.[0]?.text?.content || "",
    };

    // Verify PIN
    if (!verifyPIN(pin, storeData.pinHash)) {
      await logAnalyticsEvent(
        storeData.storeId,
        storeData.storeName,
        "Login Attempt",
        false,
        {
          reason: "Invalid PIN",
          ip,
        }
      );

      res.status(401).json({
        success: false,
        error: "Invalid PIN",
      });
      return;
    }

    // Check if store is active
    if (storeData.status !== "Active") {
      await logAnalyticsEvent(
        storeData.storeId,
        storeData.storeName,
        "Login Attempt",
        false,
        {
          reason: "Store inactive",
          status: storeData.status,
          ip,
        }
      );

      res.status(403).json({
        success: false,
        error: "Store account is not active",
      });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      id: storeData.id,
      storeId: storeData.storeId,
      storeName: storeData.storeName,
      role: storeData.role,
    });

    // Update Last Login date in Notion
    try {
      await notion.pages.update({
        page_id: storePage.id,
        properties: {
          "Last Login": {
            date: {
              start: new Date().toISOString(),
            },
          },
        },
      });
    } catch (error) {
      console.error("Failed to update last login:", error);
      // Don't fail the login if this update fails
    }

    // Log successful login
    await logAnalyticsEvent(
      storeData.storeId,
      storeData.storeName,
      "Login",
      true,
      {
        role: storeData.role,
        ip,
      }
    );

    // Return success response
    res.status(200).json({
      success: true,
      token,
      store: {
        id: storeData.id,
        storeId: storeData.storeId,
        name: storeData.storeName,
        role: storeData.role,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

// For Vercel
export { handler as POST };

// For Netlify
export { handler };
