/**
 * Admin PIN Reset API
 *
 * Endpoint for resetting user PINs
 * Requires admin authentication
 */

import { Client } from "@notionhq/client";
import { getCorsHeaders } from "./utils/cors";
import { verifyToken, parseAuthHeader } from "./utils/auth";
import { checkRateLimit, RATE_LIMITS } from "./utils/rateLimit";
import crypto from "crypto";

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
    // Rate limiting - stricter for PIN reset
    const clientIP =
      req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "unknown";
    const rateLimitResult = checkRateLimit(clientIP, RATE_LIMITS.strict);

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

    // POST - Reset PIN
    if (method === "POST") {
      const body =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;

      // Validate required fields
      if (!body.userId || !body.newPin) {
        res.writeHead(400, { ...headers, "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            error: "userId and newPin are required",
          })
        );
        return;
      }

      // Validate PIN format (4 digits)
      if (!/^\d{4}$/.test(body.newPin)) {
        res.writeHead(400, { ...headers, "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            error: "PIN must be exactly 4 digits",
          })
        );
        return;
      }

      // Hash the new PIN
      const hashedPin = hashPin(body.newPin);

      // Update user PIN in Notion
      await notion.pages.update({
        page_id: body.userId,
        properties: {
          PIN: { rich_text: [{ text: { content: hashedPin } }] },
        },
      });

      // Log PIN reset
      await logEvent("pin_reset", {
        userId: body.userId,
        resetBy: user.id,
        resetByStoreId: user.storeId,
        reason: body.reason || "Admin reset",
      });

      res.writeHead(200, { ...headers, "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: true,
          message: "PIN reset successfully",
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
    console.error("PIN reset API error:", error);
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
function hashPin(pin: string): string {
  return crypto.createHash("sha256").update(pin).digest("hex");
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
