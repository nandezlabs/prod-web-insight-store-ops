/**
 * Task Management API - Store
 * View and complete assigned tasks
 */

import { Client } from "@notionhq/client";
import { getCorsHeaders } from "./utils/cors";
import { verifyToken, parseAuthHeader } from "./utils/auth";
import { checkRateLimit, RATE_LIMITS } from "./utils/rateLimit";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DB_TASKS =
  process.env.DB_TASKS || process.env.NOTION_TASKS_DATABASE_ID || "";

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
    const rateLimitResult = checkRateLimit(clientIP, RATE_LIMITS.api);

    if (!rateLimitResult.allowed) {
      res.writeHead(429, { ...headers, "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Too many requests" }));
      return;
    }

    const authHeader =
      req.headers.authorization || req.headers.Authorization || "";
    const token = parseAuthHeader(authHeader);

    if (!token) {
      res.writeHead(401, { ...headers, "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Authentication required" }));
      return;
    }

    const user = verifyToken(token);
    if (!user) {
      res.writeHead(401, { ...headers, "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid token" }));
      return;
    }

    const { id, status } = req.query || {};
    const body = req.body
      ? typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body
      : {};

    // GET - List tasks for this store
    if (req.method === "GET") {
      const filters: any[] = [
        { property: "Store ID", rich_text: { equals: user.storeId } },
      ];

      if (status)
        filters.push({ property: "Status", select: { equals: status } });

      const response = await notion.databases.query({
        database_id: DB_TASKS,
        filter: { and: filters },
        sorts: [
          { property: "Due Date", direction: "ascending" },
          { property: "Priority", direction: "descending" },
        ],
      });

      res.writeHead(200, { ...headers, "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          tasks: response.results.map(parseTask),
          total: response.results.length,
        })
      );
      return;
    }

    // PUT - Update task status (complete/in-progress)
    if (req.method === "PUT") {
      if (!id) {
        res.writeHead(400, { ...headers, "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Task ID required" }));
        return;
      }

      const { status, notes } = body;
      const properties: any = {};

      if (status) {
        properties["Status"] = { select: { name: status } };
        if (status === "Completed") {
          properties["Completed At"] = {
            date: { start: new Date().toISOString() },
          };
        }
      }

      if (notes) {
        properties["Completion Notes"] = {
          rich_text: [{ text: { content: notes } }],
        };
      }

      const page = await notion.pages.update({
        page_id: id as string,
        properties,
      });

      res.writeHead(200, { ...headers, "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, task: parseTask(page) }));
      return;
    }

    res.writeHead(405, { ...headers, "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
  } catch (error: any) {
    console.error("Store tasks error:", error);
    res.writeHead(500, { ...headers, "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ error: "Internal server error", message: error.message })
    );
  }
}

function parseTask(page: any) {
  const props = page.properties;
  return {
    id: page.id,
    title: props["Title"]?.title?.[0]?.plain_text || "",
    description: props["Description"]?.rich_text?.[0]?.plain_text || "",
    storeId: props["Store ID"]?.rich_text?.[0]?.plain_text || "",
    storeName: props["Store Name"]?.rich_text?.[0]?.plain_text || "",
    status: props["Status"]?.select?.name || "Pending",
    priority: props["Priority"]?.select?.name || "Medium",
    category: props["Category"]?.select?.name || "",
    dueDate: props["Due Date"]?.date?.start || "",
    completedAt: props["Completed At"]?.date?.start || "",
    completionNotes:
      props["Completion Notes"]?.rich_text?.[0]?.plain_text || "",
    createdAt: props["Created"]?.created_time,
  };
}
