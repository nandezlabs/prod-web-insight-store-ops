/**
 * Admin User Activity API
 *
 * Endpoint for querying user activity logs
 * Requires admin authentication
 */

import { Client } from "@notionhq/client";
import { getCorsHeaders } from "./utils/cors";
import { verifyToken, parseAuthHeader } from "./utils/auth";
import { checkRateLimit, RATE_LIMITS } from "./utils/rateLimit";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
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

    // GET - Query user activity
    if (method === "GET") {
      const query = req.query || req.queryStringParameters || {};
      const userId = query.userId;
      const eventType = query.eventType;
      const startDate = query.startDate;
      const endDate = query.endDate;
      const limit = parseInt(query.limit) || 50;

      // Build Notion filter
      const filters: any[] = [];

      if (userId) {
        filters.push({
          property: "Metadata",
          rich_text: { contains: userId },
        });
      }

      if (eventType) {
        filters.push({
          property: "Event Type",
          select: { equals: eventType },
        });
      }

      if (startDate) {
        filters.push({
          property: "Timestamp",
          date: { on_or_after: startDate },
        });
      }

      if (endDate) {
        filters.push({
          property: "Timestamp",
          date: { on_or_before: endDate },
        });
      }

      const filter =
        filters.length > 0
          ? filters.length === 1
            ? filters[0]
            : { and: filters }
          : undefined;

      // Query Analytics & Logs database
      const response = await notion.databases.query({
        database_id: DB_ANALYTICS_LOGS,
        filter,
        sorts: [{ property: "Timestamp", direction: "descending" }],
        page_size: Math.min(limit, 100),
      });

      const logs = response.results.map(parseLogEntry);

      res.writeHead(200, { ...headers, "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: true,
          logs,
          count: logs.length,
          hasMore: response.has_more,
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
    console.error("User activity API error:", error);
    res.writeHead(500, { ...headers, "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      })
    );
  }
}

// Helper function
function parseLogEntry(page: any) {
  const props = page.properties;

  let metadata = {};
  try {
    const metadataText =
      props["Metadata"]?.rich_text?.[0]?.text?.content || "{}";
    metadata = JSON.parse(metadataText);
  } catch (e) {
    // If JSON parse fails, keep empty object
  }

  return {
    id: page.id,
    eventType: props["Event Type"]?.select?.name || "",
    timestamp: props["Timestamp"]?.date?.start || "",
    metadata,
  };
}
