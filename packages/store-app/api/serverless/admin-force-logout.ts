/**
 * Serverless Function: Admin Force Logout
 *
 * Allows admins to remotely logout store users.
 * Compatible with Vercel and Netlify serverless deployments.
 *
 * POST /api/admin/force-logout
 * Headers: Authorization: Bearer {admin_token}
 * Body: { storeId: string, reason: string }
 */

import { Client } from "@notionhq/client";
import { applyCorsHeaders } from "./utils/cors";
import { verifyToken, parseAuthHeader, JWTPayload } from "./utils/auth";

// Environment variables
const NOTION_API_KEY = process.env.NOTION_API_KEY || "";
const DB_STORE_USERS = process.env.DB_STORE_USERS || "";
const DB_ANALYTICS_LOGS = process.env.DB_ANALYTICS_LOGS || "";

// Initialize Notion client
const notion = new Client({ auth: NOTION_API_KEY });

/**
 * Force logout request
 */
interface ForceLogoutRequest {
  storeId: string;
  reason: string;
}

/**
 * Require admin authentication
 */
function requireAdminAuth(authHeader: string | undefined): JWTPayload | null {
  if (!authHeader) return null;
  const token = parseAuthHeader(authHeader);
  if (!token) return null;
  const user = verifyToken(token);
  if (!user) return null;

  // Check if user has admin role
  if (user.role !== "Admin" && user.role !== "SuperAdmin") {
    return null;
  }

  return user;
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

  try {
    // Verify admin authentication
    const adminUser = requireAdminAuth(req.headers.authorization);
    if (!adminUser) {
      res.status(403).json({
        success: false,
        error: "Admin access required",
      });
      return;
    }

    // Validate request body
    const body: ForceLogoutRequest = req.body;

    if (!body.storeId || !body.reason) {
      res.status(400).json({
        success: false,
        error: "Missing required fields: storeId and reason",
      });
      return;
    }

    // Query Notion for the store
    const queryResponse: any = await notion.databases.query({
      database_id: DB_STORE_USERS,
      filter: {
        property: "Store ID",
        rich_text: {
          equals: body.storeId,
        },
      },
    });

    if (queryResponse.results.length === 0) {
      res.status(404).json({
        success: false,
        error: "Store not found",
      });
      return;
    }

    const storePage = queryResponse.results[0];
    const storeName =
      storePage.properties["Store Name"]?.title?.[0]?.text?.content ||
      body.storeId;

    // Update store status to Inactive (forces logout on next API call)
    await notion.pages.update({
      page_id: storePage.id,
      properties: {
        Status: {
          select: { name: "Inactive" },
        },
        "Force Logout Reason": {
          rich_text: [
            {
              text: {
                content: `${body.reason} (by ${
                  adminUser.storeName
                } at ${new Date().toISOString()})`,
              },
            },
          ],
        },
      } as any,
    });

    // Log force logout event
    await logAnalyticsEvent("force_logout", adminUser, {
      targetStoreId: body.storeId,
      targetStoreName: storeName,
      reason: body.reason,
      adminStoreId: adminUser.storeId,
      adminStoreName: adminUser.storeName,
      adminRole: adminUser.role,
    });

    res.status(200).json({
      success: true,
      message: "Store logged out successfully",
      storeId: body.storeId,
      storeName: storeName,
    });
  } catch (error: any) {
    console.error("Force logout handler error:", error);

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
