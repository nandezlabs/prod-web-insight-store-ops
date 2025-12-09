/**
 * Comments API - Admin & Store
 * Threaded comments with @mentions and read receipts
 */

import { Client } from "@notionhq/client";
import { getCorsHeaders } from "./utils/cors";
import { verifyToken, parseAuthHeader } from "./utils/auth";
import { checkRateLimit, RATE_LIMITS } from "./utils/rateLimit";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DB_COMMENTS = process.env.NOTION_DB_COMMENTS || "";

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

    const { id, resourceType, resourceId, parentId } = req.query || {};
    const body = req.body
      ? typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body
      : {};

    // GET - List comments or get single comment
    if (req.method === "GET") {
      if (id) {
        const page = await notion.pages.retrieve({ page_id: id as string });
        res.writeHead(200, { ...headers, "Content-Type": "application/json" });
        res.end(JSON.stringify({ comment: parseComment(page) }));
        return;
      }

      // List comments for a resource (form, task, checklist, etc.)
      const filters: any[] = [];

      if (resourceType && resourceId) {
        filters.push({
          property: "ResourceType",
          select: { equals: resourceType },
        });
        filters.push({
          property: "ResourceID",
          rich_text: { equals: resourceId },
        });
      }

      if (parentId) {
        filters.push({ property: "ParentID", rich_text: { equals: parentId } });
      } else {
        // Only get top-level comments (no parent)
        filters.push({ property: "ParentID", rich_text: { is_empty: true } });
      }

      const response = await notion.databases.query({
        database_id: DB_COMMENTS,
        filter: filters.length > 0 ? { and: filters } : undefined,
        sorts: [{ property: "CreatedAt", direction: "ascending" }],
      });

      const comments = response.results.map(parseComment);

      // Load replies for each comment
      const commentsWithReplies = await Promise.all(
        comments.map(async (comment) => {
          const repliesResponse = await notion.databases.query({
            database_id: DB_COMMENTS,
            filter: {
              property: "ParentID",
              rich_text: { equals: comment.id },
            },
            sorts: [{ property: "CreatedAt", direction: "ascending" }],
          });

          return {
            ...comment,
            replies: repliesResponse.results.map(parseComment),
            replyCount: repliesResponse.results.length,
          };
        })
      );

      res.writeHead(200, { ...headers, "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          comments: commentsWithReplies,
          total: commentsWithReplies.length,
        })
      );
      return;
    }

    // POST - Create comment
    if (req.method === "POST") {
      const {
        resourceType,
        resourceId,
        content,
        parentId,
        mentions = [],
      } = body;

      if (!resourceType || !resourceId || !content) {
        res.writeHead(400, { ...headers, "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Missing required fields" }));
        return;
      }

      const page = await notion.pages.create({
        parent: { database_id: DB_COMMENTS },
        properties: {
          ResourceType: { select: { name: resourceType } },
          ResourceID: { rich_text: [{ text: { content: resourceId } }] },
          Content: { rich_text: [{ text: { content: content } }] },
          ParentID: parentId
            ? { rich_text: [{ text: { content: parentId } }] }
            : { rich_text: [] },
          AuthorID: { rich_text: [{ text: { content: user.id } }] },
          AuthorName: {
            rich_text: [{ text: { content: user.storeName || user.id } }],
          },
          Mentions: {
            rich_text: [{ text: { content: JSON.stringify(mentions) } }],
          },
          ReadBy: {
            rich_text: [{ text: { content: JSON.stringify([user.id]) } }],
          },
          CreatedAt: { date: { start: new Date().toISOString() } },
          UpdatedAt: { date: { start: new Date().toISOString() } },
        },
      });

      // TODO: Send notifications to mentioned users
      // This would integrate with the notification-service.ts

      res.writeHead(201, { ...headers, "Content-Type": "application/json" });
      res.end(JSON.stringify({ comment: parseComment(page) }));
      return;
    }

    // PUT - Update comment or mark as read
    if (req.method === "PUT" && id) {
      const page = await notion.pages.retrieve({ page_id: id as string });
      const comment = parseComment(page);

      // Verify ownership for edits
      if (body.content && comment.authorId !== user.id) {
        res.writeHead(403, { ...headers, "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Can only edit your own comments" }));
        return;
      }

      const updates: any = {};

      if (body.content) {
        updates.Content = { rich_text: [{ text: { content: body.content } }] };
        updates.UpdatedAt = { date: { start: new Date().toISOString() } };
        updates.Edited = { checkbox: true };
      }

      // Mark as read
      if (body.markRead) {
        const readBy = comment.readBy || [];
        if (!readBy.includes(user.id)) {
          readBy.push(user.id);
          updates.ReadBy = {
            rich_text: [{ text: { content: JSON.stringify(readBy) } }],
          };
        }
      }

      const updatedPage = await notion.pages.update({
        page_id: id as string,
        properties: updates,
      });

      res.writeHead(200, { ...headers, "Content-Type": "application/json" });
      res.end(JSON.stringify({ comment: parseComment(updatedPage) }));
      return;
    }

    // DELETE - Delete comment
    if (req.method === "DELETE" && id) {
      const page = await notion.pages.retrieve({ page_id: id as string });
      const comment = parseComment(page);

      // Verify ownership or admin
      if (comment.authorId !== user.id && user.role !== "admin") {
        res.writeHead(403, { ...headers, "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Can only delete your own comments" }));
        return;
      }

      await notion.pages.update({
        page_id: id as string,
        archived: true,
      });

      res.writeHead(200, { ...headers, "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, message: "Comment deleted" }));
      return;
    }

    res.writeHead(405, { ...headers, "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
  } catch (error: any) {
    console.error("Comments error:", error);
    res.writeHead(500, { ...headers, "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ error: error.message || "Internal server error" })
    );
  }
}

function parseComment(page: any) {
  const props = page.properties;

  return {
    id: page.id,
    resourceType: props.ResourceType?.select?.name || "",
    resourceId: props.ResourceID?.rich_text?.[0]?.text?.content || "",
    content: props.Content?.rich_text?.[0]?.text?.content || "",
    parentId: props.ParentID?.rich_text?.[0]?.text?.content || null,
    authorId: props.AuthorID?.rich_text?.[0]?.text?.content || "",
    authorName: props.AuthorName?.rich_text?.[0]?.text?.content || "",
    mentions: props.Mentions?.rich_text?.[0]?.text?.content
      ? JSON.parse(props.Mentions.rich_text[0].text.content)
      : [],
    readBy: props.ReadBy?.rich_text?.[0]?.text?.content
      ? JSON.parse(props.ReadBy.rich_text[0].text.content)
      : [],
    edited: props.Edited?.checkbox || false,
    createdAt: props.CreatedAt?.date?.start || "",
    updatedAt: props.UpdatedAt?.date?.start || "",
  };
}
