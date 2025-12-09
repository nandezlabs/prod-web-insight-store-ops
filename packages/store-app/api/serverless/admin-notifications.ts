/**
 * Admin Notifications API
 * Manages notifications across all stores and users
 */

import { Client } from "@notionhq/client";
import { getCorsHeaders } from "./utils/cors";
import { verifyToken, parseAuthHeader } from "./utils/auth";
import { checkRateLimit, RATE_LIMITS } from "./utils/rateLimit";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DB_NOTIFICATIONS = process.env.NOTION_DB_NOTIFICATIONS || "";

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

    const user = verifyToken(token);
    const { id, recipientId, recipientType, status, type, priority } =
      req.query || {};
    const body = req.body
      ? typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body
      : {};

    // GET - List notifications or get single notification
    if (req.method === "GET") {
      if (id) {
        const page = await notion.pages.retrieve({ page_id: id as string });
        res.writeHead(200, { ...headers, "Content-Type": "application/json" });
        res.end(JSON.stringify({ notification: parseNotification(page) }));
        return;
      }

      const filters: any[] = [];
      if (recipientId)
        filters.push({
          property: "RecipientValue",
          rich_text: { equals: recipientId },
        });
      if (recipientType)
        filters.push({
          property: "RecipientType",
          select: { equals: recipientType },
        });
      if (status)
        filters.push({ property: "Status", select: { equals: status } });
      if (type) filters.push({ property: "Type", select: { equals: type } });
      if (priority)
        filters.push({ property: "Priority", select: { equals: priority } });

      const response = await notion.databases.query({
        database_id: DB_NOTIFICATIONS,
        filter: filters.length > 0 ? { and: filters } : undefined,
        sorts: [{ property: "CreatedAt", direction: "descending" }],
      });

      res.writeHead(200, { ...headers, "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          notifications: response.results.map(parseNotification),
          total: response.results.length,
        })
      );
      return;
    }

    // POST - Create notification
    if (req.method === "POST") {
      const {
        type,
        title,
        message,
        recipientType,
        recipientValue,
        priority = "medium",
        actionUrl,
        metadata = {},
      } = body;

      if (!type || !title || !message || !recipientType || !recipientValue) {
        res.writeHead(400, { ...headers, "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Missing required fields" }));
        return;
      }

      const page = await notion.pages.create({
        parent: { database_id: DB_NOTIFICATIONS },
        properties: {
          Type: { select: { name: type } },
          Title: { title: [{ text: { content: title } }] },
          Message: { rich_text: [{ text: { content: message } }] },
          RecipientType: { select: { name: recipientType } },
          RecipientValue: {
            rich_text: [{ text: { content: recipientValue } }],
          },
          Priority: { select: { name: priority } },
          Status: { select: { name: "unread" } },
          Metadata: {
            rich_text: [{ text: { content: JSON.stringify(metadata) } }],
          },
          CreatedBy: {
            rich_text: [{ text: { content: user?.id || "system" } }],
          },
          CreatedAt: { date: { start: new Date().toISOString() } },
        },
      });

      res.writeHead(201, { ...headers, "Content-Type": "application/json" });
      res.end(JSON.stringify({ notification: parseNotification(page) }));
      return;
    }

    // PUT - Update notification
    if (req.method === "PUT" && id) {
      const updates: any = {};

      if (body.status) {
        updates.Status = { select: { name: body.status } };
        if (body.status === "read") {
          updates.ReadAt = { date: { start: new Date().toISOString() } };
        }
      }

      if (body.priority) {
        updates.Priority = { select: { name: body.priority } };
      }

      const page = await notion.pages.update({
        page_id: id as string,
        properties: updates,
      });

      res.writeHead(200, { ...headers, "Content-Type": "application/json" });
      res.end(JSON.stringify({ notification: parseNotification(page) }));
      return;
    }

    // DELETE - Archive notification
    if (req.method === "DELETE" && id) {
      await notion.pages.update({
        page_id: id as string,
        archived: true,
      });

      res.writeHead(200, { ...headers, "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ success: true, message: "Notification deleted" })
      );
      return;
    }

    res.writeHead(405, { ...headers, "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
  } catch (error: any) {
    console.error("Admin notifications error:", error);
    res.writeHead(500, { ...headers, "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ error: error.message || "Internal server error" })
    );
  }
}

function parseNotification(page: any) {
  const props = page.properties;

  return {
    id: page.id,
    type: props.Type?.select?.name || "",
    title: props.Title?.title?.[0]?.text?.content || "",
    message: props.Message?.rich_text?.[0]?.text?.content || "",
    recipientType: props.RecipientType?.select?.name || "user",
    recipientValue: props.RecipientValue?.rich_text?.[0]?.text?.content || "",
    priority: props.Priority?.select?.name || "medium",
    status: props.Status?.select?.name || "unread",
    actionUrl: props.ActionUrl?.url || undefined,
    metadata: props.Metadata?.rich_text?.[0]?.text?.content
      ? JSON.parse(props.Metadata.rich_text[0].text.content)
      : {},
    createdBy: props.CreatedBy?.rich_text?.[0]?.text?.content || "",
    createdAt: props.CreatedAt?.date?.start || "",
    readAt: props.ReadAt?.date?.start || undefined,
  };
}
