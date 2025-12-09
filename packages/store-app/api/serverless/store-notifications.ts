/**
 * Store Notifications API
 * Store-side notification viewing and management
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
    const user = verifyToken(token || "");

    if (!user) {
      res.writeHead(401, { ...headers, "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Authentication required" }));
      return;
    }

    const { id, status, type, action } = req.query || {};
    const body = req.body
      ? typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body
      : {};

    // GET - Unread count
    if (req.method === "GET" && action === "unread-count") {
      const filter: any = {
        and: [
          {
            or: [
              {
                and: [
                  { property: "RecipientType", select: { equals: "user" } },
                  {
                    property: "RecipientValue",
                    rich_text: { equals: user.id },
                  },
                ],
              },
              {
                and: [
                  { property: "RecipientType", select: { equals: "store" } },
                  {
                    property: "RecipientValue",
                    rich_text: { equals: user.storeId },
                  },
                ],
              },
              {
                and: [
                  { property: "RecipientType", select: { equals: "role" } },
                  {
                    property: "RecipientValue",
                    rich_text: { equals: user.role },
                  },
                ],
              },
            ],
          },
          { property: "Status", select: { equals: "unread" } },
        ],
      };

      const response = await notion.databases.query({
        database_id: DB_NOTIFICATIONS,
        filter,
        page_size: 1,
      });

      res.writeHead(200, { ...headers, "Content-Type": "application/json" });
      res.end(JSON.stringify({ count: response.results.length }));
      return;
    }

    // GET - List notifications or get single
    if (req.method === "GET") {
      if (id) {
        const page = await notion.pages.retrieve({ page_id: id as string });
        const notification = parseNotification(page);

        // Verify access
        const hasAccess =
          (notification.recipientType === "user" &&
            notification.recipientValue === user.id) ||
          (notification.recipientType === "store" &&
            notification.recipientValue === user.storeId) ||
          (notification.recipientType === "role" &&
            notification.recipientValue === user.role);

        if (!hasAccess) {
          res.writeHead(403, {
            ...headers,
            "Content-Type": "application/json",
          });
          res.end(JSON.stringify({ error: "Access denied" }));
          return;
        }

        res.writeHead(200, { ...headers, "Content-Type": "application/json" });
        res.end(JSON.stringify({ notification }));
        return;
      }

      // List notifications for user/store/role
      const filters: any[] = [
        {
          or: [
            {
              and: [
                { property: "RecipientType", select: { equals: "user" } },
                { property: "RecipientValue", rich_text: { equals: user.id } },
              ],
            },
            {
              and: [
                { property: "RecipientType", select: { equals: "store" } },
                {
                  property: "RecipientValue",
                  rich_text: { equals: user.storeId },
                },
              ],
            },
            {
              and: [
                { property: "RecipientType", select: { equals: "role" } },
                {
                  property: "RecipientValue",
                  rich_text: { equals: user.role },
                },
              ],
            },
          ],
        },
      ];

      if (status)
        filters.push({ property: "Status", select: { equals: status } });
      if (type) filters.push({ property: "Type", select: { equals: type } });

      const response = await notion.databases.query({
        database_id: DB_NOTIFICATIONS,
        filter: { and: filters },
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

    // PUT - Mark as read or update
    if (req.method === "PUT") {
      // Mark all as read
      if (action === "mark-all-read") {
        const filter: any = {
          and: [
            {
              or: [
                {
                  and: [
                    { property: "RecipientType", select: { equals: "user" } },
                    {
                      property: "RecipientValue",
                      rich_text: { equals: user.id },
                    },
                  ],
                },
                {
                  and: [
                    { property: "RecipientType", select: { equals: "store" } },
                    {
                      property: "RecipientValue",
                      rich_text: { equals: user.storeId },
                    },
                  ],
                },
              ],
            },
            { property: "Status", select: { equals: "unread" } },
          ],
        };

        const response = await notion.databases.query({
          database_id: DB_NOTIFICATIONS,
          filter,
        });

        await Promise.all(
          response.results.map((page) =>
            notion.pages.update({
              page_id: page.id,
              properties: {
                Status: { select: { name: "read" } },
                ReadAt: { date: { start: new Date().toISOString() } },
              },
            })
          )
        );

        res.writeHead(200, { ...headers, "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            message: "All notifications marked as read",
            count: response.results.length,
          })
        );
        return;
      }

      // Mark specific notifications as read
      if (body.notificationIds && Array.isArray(body.notificationIds)) {
        await Promise.all(
          body.notificationIds.map(async (notifId: string) => {
            const page = await notion.pages.retrieve({ page_id: notifId });
            const notification = parseNotification(page);

            // Verify access
            const hasAccess =
              (notification.recipientType === "user" &&
                notification.recipientValue === user.id) ||
              (notification.recipientType === "store" &&
                notification.recipientValue === user.storeId) ||
              (notification.recipientType === "role" &&
                notification.recipientValue === user.role);

            if (!hasAccess) return null;

            return notion.pages.update({
              page_id: notifId,
              properties: {
                Status: { select: { name: "read" } },
                ReadAt: { date: { start: new Date().toISOString() } },
              },
            });
          })
        );

        res.writeHead(200, { ...headers, "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            message: "Notifications marked as read",
          })
        );
        return;
      }

      // Update single notification
      if (id) {
        const page = await notion.pages.retrieve({ page_id: id as string });
        const notification = parseNotification(page);

        // Verify access
        const hasAccess =
          (notification.recipientType === "user" &&
            notification.recipientValue === user.id) ||
          (notification.recipientType === "store" &&
            notification.recipientValue === user.storeId) ||
          (notification.recipientType === "role" &&
            notification.recipientValue === user.role);

        if (!hasAccess) {
          res.writeHead(403, {
            ...headers,
            "Content-Type": "application/json",
          });
          res.end(JSON.stringify({ error: "Access denied" }));
          return;
        }

        const updates: any = {};
        if (body.status) {
          updates.Status = { select: { name: body.status } };
          if (body.status === "read") {
            updates.ReadAt = { date: { start: new Date().toISOString() } };
          }
        }

        const updatedPage = await notion.pages.update({
          page_id: id as string,
          properties: updates,
        });

        res.writeHead(200, { ...headers, "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ notification: parseNotification(updatedPage) })
        );
        return;
      }
    }

    res.writeHead(405, { ...headers, "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
  } catch (error: any) {
    console.error("Store notifications error:", error);
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
