/**
 * Serverless Function: Store Replacement Request
 *
 * Submits replacement request for inventory items to Notion.
 * Compatible with Vercel and Netlify serverless deployments.
 *
 * POST /api/store/replacement
 * Headers: Authorization: Bearer {token}
 * Body: { itemId: string, reason: string, priority: 'Low' | 'Medium' | 'High' }
 */

import { Client } from "@notionhq/client";
import crypto from "crypto";
import { applyCorsHeaders } from "./utils/cors";
import { verifyToken, parseAuthHeader, JWTPayload } from "./utils/auth";
import {
  checkRateLimit,
  getClientIP,
  setRateLimitHeaders,
  RATE_LIMITS,
} from "./utils/rateLimit";

// Environment variables
const NOTION_API_KEY = process.env.NOTION_API_KEY || "";
const DB_REPLACEMENTS = process.env.DB_REPLACEMENTS || "";
const DB_ANALYTICS_LOGS = process.env.DB_ANALYTICS_LOGS || "";

// Initialize Notion client
const notion = new Client({ auth: NOTION_API_KEY });

/**
 * Replacement request interface
 */
interface ReplacementRequest {
  itemId: string;
  reason: string;
  priority: "Low" | "Medium" | "High";
}

/**
 * Require authentication
 */
function requireAuth(authHeader: string | undefined): JWTPayload | null {
  if (!authHeader) return null;
  const token = parseAuthHeader(authHeader);
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Generate UUID v4
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = crypto.randomBytes(1)[0] % 16 | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Log analytics event
 */
async function logAnalyticsEvent(
  event: string,
  user: JWTPayload,
  metadata: Record<string, any>
): Promise<void> {
  if (!DB_ANALYTICS_LOGS) return;

  try {
    await notion.pages.create({
      parent: { database_id: DB_ANALYTICS_LOGS },
      properties: {
        Event: {
          title: [{ text: { content: event } }],
        },
        "Store ID": {
          rich_text: [{ text: { content: user.storeId } }],
        },
        "Store Name": {
          rich_text: [{ text: { content: user.storeName } }],
        },
        Timestamp: {
          date: { start: new Date().toISOString() },
        },
        Metadata: {
          rich_text: [{ text: { content: JSON.stringify(metadata) } }],
        },
      },
    });
  } catch (error) {
    console.error("Analytics logging error:", error);
  }
}

/**
 * Main handler
 */
async function handler(req: any, res: any) {
  const origin = req.headers.origin || "";

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

  // Get client IP
  const ip = getClientIP(req);

  // Check rate limit (50 requests per hour)
  const rateLimit = checkRateLimit(ip, RATE_LIMITS.api);
  setRateLimitHeaders(
    res,
    RATE_LIMITS.api.maxAttempts,
    rateLimit.remaining,
    rateLimit.resetTime
  );

  if (!rateLimit.allowed) {
    res.status(429).json({
      success: false,
      error: "Rate limit exceeded",
      retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
    });
    return;
  }

  try {
    // Verify authentication
    const user = requireAuth(req.headers.authorization);
    if (!user) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
      return;
    }

    // Validate request body
    const body: ReplacementRequest = req.body;

    if (!body.itemId || !body.reason || !body.priority) {
      res.status(400).json({
        success: false,
        error: "Missing required fields: itemId, reason, priority",
      });
      return;
    }

    if (!["Low", "Medium", "High"].includes(body.priority)) {
      res.status(400).json({
        success: false,
        error: "Invalid priority. Must be Low, Medium, or High",
      });
      return;
    }

    // Generate unique request ID
    const requestId = generateUUID();

    // Create replacement request in Notion
    await notion.pages.create({
      parent: { database_id: DB_REPLACEMENTS },
      properties: {
        "Request ID": {
          title: [{ text: { content: requestId } }],
        },
        "Original Item": {
          relation: [{ id: body.itemId }],
        },
        "Requested By": {
          rich_text: [
            { text: { content: `${user.storeName} (${user.storeId})` } },
          ],
        },
        "Request Date": {
          date: { start: new Date().toISOString() },
        },
        Reason: {
          rich_text: [{ text: { content: body.reason } }],
        },
        Priority: {
          select: { name: body.priority },
        },
        Status: {
          select: { name: "Pending" },
        },
      },
    });

    // Log analytics event
    await logAnalyticsEvent("item_replace", user, {
      requestId,
      itemId: body.itemId,
      priority: body.priority,
      reason: body.reason.substring(0, 100), // Limit reason length in logs
    });

    res.status(201).json({
      success: true,
      requestId,
      message: "Replacement request submitted successfully",
    });
  } catch (error: any) {
    console.error("Replacement handler error:", error);

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
