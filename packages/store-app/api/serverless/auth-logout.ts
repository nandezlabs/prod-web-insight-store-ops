/**
 * Serverless Function: Store Logout
 *
 * Handles logout for store users with analytics tracking.
 * Compatible with Vercel and Netlify serverless deployments.
 *
 * POST /api/auth/logout
 * Headers: Authorization: Bearer {token}
 * Request body: { reason: 'manual' | 'geofence' | 'admin' }
 */

import { Client } from "@notionhq/client";
import { applyCorsHeaders } from "./utils/cors";
import { verifyToken, parseAuthHeader, JWTPayload } from "./utils/auth";

// Environment variables
const NOTION_API_KEY = process.env.NOTION_API_KEY || "";

// Initialize Notion client
const notion = new Client({ auth: NOTION_API_KEY });

/**
 * Require authentication - extract and verify token
 */
function requireAuth(authHeader: string | undefined): {
  authenticated: boolean;
  user?: JWTPayload;
  error?: string;
} {
  if (!authHeader) {
    return { authenticated: false, error: "No authorization header" };
  }

  // Extract bearer token
  const token = parseAuthHeader(authHeader);
  if (!token) {
    return { authenticated: false, error: "Invalid authorization format" };
  }

  const user = verifyToken(token);

  if (!user) {
    return { authenticated: false, error: "Invalid or expired token" };
  }

  return { authenticated: true, user };
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
    // Don't throw - logging failure shouldn't break logout
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
    // Verify authentication
    const auth = requireAuth(req.headers.authorization);

    if (!auth.authenticated || !auth.user) {
      res.status(401).json({
        success: false,
        error: auth.error || "Unauthorized",
      });
      return;
    }

    const user = auth.user;

    // Parse request body
    const { reason } = req.body || {};

    // Validate logout reason
    const validReasons = ["manual", "geofence", "admin"];
    const logoutReason = validReasons.includes(reason) ? reason : "manual";

    // Get client info
    const ip =
      req.headers["x-forwarded-for"] ||
      req.connection?.remoteAddress ||
      "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    // Log logout event
    await logAnalyticsEvent(user.storeId, user.storeName, "Logout", true, {
      reason: logoutReason,
      role: user.role,
      ip,
      userAgent,
    });

    // Return success
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error: any) {
    console.error("Logout error:", error);

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
