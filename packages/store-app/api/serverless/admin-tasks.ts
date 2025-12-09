/**
 * Task Management API - Admin
 * Create, assign, and manage tasks for stores
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

    if (!token || !verifyToken(token) || verifyToken(token)?.role !== "admin") {
      res.writeHead(401, { ...headers, "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Admin authentication required" }));
      return;
    }

    const { id, storeId, assignedTo, status, priority, dueDate } =
      req.query || {};
    const body = req.body
      ? typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body
      : {};

    // GET - List tasks or get single task
    if (req.method === "GET") {
      if (id) {
        const page = await notion.pages.retrieve({ page_id: id as string });
        res.writeHead(200, { ...headers, "Content-Type": "application/json" });
        res.end(JSON.stringify({ task: parseTask(page) }));
        return;
      }

      const filters: any[] = [];
      if (storeId)
        filters.push({ property: "Store ID", rich_text: { equals: storeId } });
      if (assignedTo)
        filters.push({
          property: "Assigned To",
          rich_text: { equals: assignedTo },
        });
      if (status)
        filters.push({ property: "Status", select: { equals: status } });
      if (priority)
        filters.push({ property: "Priority", select: { equals: priority } });

      const response = await notion.databases.query({
        database_id: DB_TASKS,
        filter: filters.length > 0 ? { and: filters } : undefined,
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

    // POST - Create task
    if (req.method === "POST") {
      const {
        title,
        description,
        storeId,
        storeName,
        assignedTo,
        priority = "Medium",
        dueDate,
        recurring,
        recurrencePattern,
        category,
        templateId,
      } = body;

      if (!title || !storeId) {
        res.writeHead(400, { ...headers, "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Title and Store ID required" }));
        return;
      }

      const properties: any = {
        Title: { title: [{ text: { content: title } }] },
        "Store ID": { rich_text: [{ text: { content: storeId } }] },
        "Store Name": {
          rich_text: [{ text: { content: storeName || storeId } }],
        },
        Status: { select: { name: "Pending" } },
        Priority: { select: { name: priority } },
      };

      if (description)
        properties["Description"] = {
          rich_text: [{ text: { content: description } }],
        };
      if (assignedTo)
        properties["Assigned To"] = {
          rich_text: [{ text: { content: assignedTo } }],
        };
      if (dueDate) properties["Due Date"] = { date: { start: dueDate } };
      if (category) properties["Category"] = { select: { name: category } };
      if (recurring !== undefined)
        properties["Recurring"] = { checkbox: recurring };
      if (recurrencePattern)
        properties["Recurrence Pattern"] = {
          rich_text: [{ text: { content: recurrencePattern } }],
        };
      if (templateId)
        properties["Template ID"] = {
          rich_text: [{ text: { content: templateId } }],
        };

      const page = await notion.pages.create({
        parent: { database_id: DB_TASKS },
        properties,
      });

      res.writeHead(201, { ...headers, "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, task: parseTask(page) }));
      return;
    }

    // PUT - Update task
    if (req.method === "PUT") {
      if (!id) {
        res.writeHead(400, { ...headers, "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Task ID required" }));
        return;
      }

      const properties: any = {};
      const {
        title,
        description,
        status,
        priority,
        assignedTo,
        dueDate,
        completedAt,
      } = body;

      if (title !== undefined)
        properties["Title"] = { title: [{ text: { content: title } }] };
      if (description !== undefined)
        properties["Description"] = {
          rich_text: [{ text: { content: description } }],
        };
      if (status !== undefined)
        properties["Status"] = { select: { name: status } };
      if (priority !== undefined)
        properties["Priority"] = { select: { name: priority } };
      if (assignedTo !== undefined)
        properties["Assigned To"] = {
          rich_text: [{ text: { content: assignedTo } }],
        };
      if (dueDate !== undefined)
        properties["Due Date"] = { date: { start: dueDate } };
      if (completedAt !== undefined)
        properties["Completed At"] = { date: { start: completedAt } };

      const page = await notion.pages.update({
        page_id: id as string,
        properties,
      });

      res.writeHead(200, { ...headers, "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, task: parseTask(page) }));
      return;
    }

    // DELETE - Delete task
    if (req.method === "DELETE") {
      if (!id) {
        res.writeHead(400, { ...headers, "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Task ID required" }));
        return;
      }

      await notion.pages.update({
        page_id: id as string,
        archived: true,
      });

      res.writeHead(200, { ...headers, "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, message: "Task deleted" }));
      return;
    }

    res.writeHead(405, { ...headers, "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
  } catch (error: any) {
    console.error("Task management error:", error);
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
    assignedTo: props["Assigned To"]?.rich_text?.[0]?.plain_text || "",
    status: props["Status"]?.select?.name || "Pending",
    priority: props["Priority"]?.select?.name || "Medium",
    category: props["Category"]?.select?.name || "",
    dueDate: props["Due Date"]?.date?.start || "",
    completedAt: props["Completed At"]?.date?.start || "",
    recurring: props["Recurring"]?.checkbox || false,
    recurrencePattern:
      props["Recurrence Pattern"]?.rich_text?.[0]?.plain_text || "",
    templateId: props["Template ID"]?.rich_text?.[0]?.plain_text || "",
    createdAt: props["Created"]?.created_time,
    updatedAt: props["Last Updated"]?.last_edited_time,
  };
}
