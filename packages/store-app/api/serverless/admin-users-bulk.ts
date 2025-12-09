/**
 * Admin Bulk User Operations API
 *
 * Endpoint for bulk operations on multiple users
 * Requires admin authentication
 */

import { Client } from "@notionhq/client";
import { getCorsHeaders } from "./utils/cors";
import { verifyToken, parseAuthHeader } from "./utils/auth";
import { checkRateLimit, RATE_LIMITS } from "./utils/rateLimit";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DB_STORE_USERS = process.env.DB_STORE_USERS!;
const DB_ANALYTICS_LOGS = process.env.DB_ANALYTICS_LOGS!;

export default async function handler(req: any, res: any) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    const origin = req.headers.origin || req.headers.Origin || "";
    res.writeHead(204, getCorsHeaders(origin));
    res.end();
    return;
  }

  const origin = req.headers.origin || req.headers.Origin || "";
  const headers = getCorsHeaders(origin);

  try {
    // Rate limiting
    const clientIP =
      req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "unknown";
    const rateLimitResult = checkRateLimit(clientIP, RATE_LIMITS.api);

    if (!rateLimitResult.allowed) {
      res.writeHead(429, { ...headers, "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: false,
          error: "Too many requests. Please try again later.",
          resetTime: rateLimitResult.resetTime,
        })
      );
      return;
    }

    // Authenticate admin
    const authHeader =
      req.headers.authorization || req.headers.Authorization || "";
    const token = parseAuthHeader(authHeader);

    if (!token) {
      res.writeHead(401, { ...headers, "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: false,
          error: "Authorization token required",
        })
      );
      return;
    }

    const user = verifyToken(token);

    if (!user || user.role !== "admin") {
      res.writeHead(401, { ...headers, "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: false,
          error: "Admin authentication required",
        })
      );
      return;
    }

    const method = req.method || req.httpMethod;

    // POST - Bulk operations
    if (method === "POST") {
      const body =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;

      // Validate required fields
      if (
        !body.userIds ||
        !Array.isArray(body.userIds) ||
        body.userIds.length === 0
      ) {
        res.writeHead(400, { ...headers, "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            error: "userIds array is required and must not be empty",
          })
        );
        return;
      }

      if (!body.operation) {
        res.writeHead(400, { ...headers, "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            error: "operation is required (activate, deactivate, delete)",
          })
        );
        return;
      }

      const { userIds, operation } = body;
      const results = {
        success: [] as string[],
        failed: [] as { id: string; error: string }[],
      };

      // Process each user
      for (const userId of userIds) {
        try {
          switch (operation) {
            case "activate":
              await updateUserStatus(userId, "Active");
              results.success.push(userId);
              break;

            case "deactivate":
              await updateUserStatus(userId, "Inactive");
              results.success.push(userId);
              break;

            case "delete":
              await updateUserStatus(userId, "Inactive");
              results.success.push(userId);
              break;

            default:
              results.failed.push({
                id: userId,
                error: `Invalid operation: ${operation}`,
              });
          }
        } catch (error: any) {
          results.failed.push({
            id: userId,
            error: error.message || "Update failed",
          });
        }
      }

      // Log bulk operation
      await logEvent("bulk_user_operation", {
        operation,
        totalUsers: userIds.length,
        successful: results.success.length,
        failed: results.failed.length,
        adminId: user.id,
        adminStoreId: user.storeId,
      });

      res.writeHead(200, { ...headers, "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: true,
          message: `Bulk ${operation} completed`,
          results,
          summary: {
            total: userIds.length,
            successful: results.success.length,
            failed: results.failed.length,
          },
        })
      );
      return;
    }

    // Method not allowed
    res.writeHead(405, { ...headers, "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: false,
        error: `Method ${method} not allowed`,
      })
    );
  } catch (error: any) {
    console.error("Admin bulk users API error:", error);
    res.writeHead(500, { ...headers, "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      })
    );
  }
}

// Helper functions
async function updateUserStatus(userId: string, status: string): Promise<void> {
  await notion.pages.update({
    page_id: userId,
    properties: {
      Status: { select: { name: status } },
    },
  });
}

async function logEvent(eventType: string, metadata: any) {
  try {
    await notion.pages.create({
      parent: { database_id: DB_ANALYTICS_LOGS },
      properties: {
        "Event Type": { select: { name: eventType } },
        Timestamp: { date: { start: new Date().toISOString() } },
        Metadata: {
          rich_text: [{ text: { content: JSON.stringify(metadata) } }],
        },
      },
    });
  } catch (error) {
    console.error("Failed to log event:", error);
  }
}
