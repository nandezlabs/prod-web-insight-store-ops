/**
 * Bulk Store Operations API
 */

import { Client } from "@notionhq/client";
import { getCorsHeaders } from "./utils/cors";
import { verifyToken, parseAuthHeader } from "./utils/auth";
import { checkRateLimit, RATE_LIMITS } from "./utils/rateLimit";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    const origin = req.headers.origin || req.headers.Origin || "";
    res.writeHead(204, getCorsHeaders(origin));
    res.end();
    return;
  }

  const origin = req.headers.origin || req.headers.Origin || "";
  const headers = getCorsHeaders(origin);

  try {
    const clientIP =
      req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "unknown";
    const rateLimitResult = checkRateLimit(clientIP, RATE_LIMITS.strict);

    if (!rateLimitResult.allowed) {
      res.writeHead(429, { ...headers, "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Too many requests" }));
      return;
    }

    const authHeader =
      req.headers.authorization || req.headers.Authorization || "";
    const token = parseAuthHeader(authHeader);

    if (!token || !verifyToken(token) || verifyToken(token)?.role !== "admin") {
      res.writeHead(401, { ...headers, "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Admin authentication required" }));
      return;
    }

    if (req.method !== "POST") {
      res.writeHead(405, { ...headers, "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { action, storeIds, params } = body;

    if (
      !action ||
      !storeIds ||
      !Array.isArray(storeIds) ||
      storeIds.length === 0
    ) {
      res.writeHead(400, { ...headers, "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Action and storeIds required" }));
      return;
    }

    const successful: string[] = [];
    const failed: Array<{ id: string; error: string }> = [];

    for (const storeId of storeIds) {
      try {
        let updateProps: any = {};

        switch (action) {
          case "activate":
            updateProps = { Status: { select: { name: "Active" } } };
            break;
          case "deactivate":
            updateProps = { Status: { select: { name: "Inactive" } } };
            break;
          case "close":
            updateProps = { Status: { select: { name: "Closed" } } };
            break;
          case "assign-region":
            if (!params?.region) throw new Error("Region parameter required");
            updateProps = { Region: { select: { name: params.region } } };
            break;
          default:
            throw new Error(`Unknown action: ${action}`);
        }

        await notion.pages.update({
          page_id: storeId,
          properties: updateProps,
        });

        successful.push(storeId);
      } catch (error: any) {
        failed.push({ id: storeId, error: error.message });
      }
    }

    res.writeHead(200, { ...headers, "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: true,
        action,
        totalRequested: storeIds.length,
        successful: successful.length,
        failed: failed.length,
        results: { successful, failed },
      })
    );
  } catch (error: any) {
    console.error("Bulk store operation error:", error);
    res.writeHead(500, { ...headers, "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ error: "Internal server error", message: error.message })
    );
  }
}
