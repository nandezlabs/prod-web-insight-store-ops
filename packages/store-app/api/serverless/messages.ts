/**
 * Messages API - Internal Messaging System
 * Direct messaging between users/stores
 */

import { Client } from "@notionhq/client";
import { getCorsHeaders } from "./utils/cors";
import { verifyToken, parseAuthHeader } from "./utils/auth";
import { checkRateLimit, RATE_LIMITS } from "./utils/rateLimit";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DB_MESSAGES = process.env.NOTION_DB_MESSAGES || "";
const DB_CONVERSATIONS = process.env.NOTION_DB_CONVERSATIONS || "";

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

    const { id, conversationId, action } = req.query || {};
    const body = req.body
      ? typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body
      : {};

    // GET conversations list
    if (req.method === "GET" && action === "conversations") {
      const conversations = await notion.databases.query({
        database_id: DB_CONVERSATIONS,
        filter: {
          or: [
            { property: "Participant1", rich_text: { equals: user.id } },
            { property: "Participant2", rich_text: { equals: user.id } },
          ],
        },
        sorts: [{ property: "LastMessageAt", direction: "descending" }],
      });

      const conversationList = await Promise.all(
        conversations.results.map(async (conv: any) => {
          const parsed = parseConversation(conv);

          // Get last message
          const messagesResponse = await notion.databases.query({
            database_id: DB_MESSAGES,
            filter: {
              property: "ConversationID",
              rich_text: { equals: parsed.id },
            },
            sorts: [{ property: "CreatedAt", direction: "descending" }],
            page_size: 1,
          });

          const lastMessage = messagesResponse.results[0]
            ? parseMessage(messagesResponse.results[0])
            : null;

          // Count unread messages
          const unreadResponse = await notion.databases.query({
            database_id: DB_MESSAGES,
            filter: {
              and: [
                {
                  property: "ConversationID",
                  rich_text: { equals: parsed.id },
                },
                {
                  property: "SenderID",
                  rich_text: { does_not_equal: user.id },
                },
                { property: "Read", checkbox: { equals: false } },
              ],
            },
          });

          return {
            ...parsed,
            lastMessage,
            unreadCount: unreadResponse.results.length,
          };
        })
      );

      res.writeHead(200, { ...headers, "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          conversations: conversationList,
          total: conversationList.length,
        })
      );
      return;
    }

    // GET messages in a conversation
    if (req.method === "GET" && conversationId) {
      const messagesResponse = await notion.databases.query({
        database_id: DB_MESSAGES,
        filter: {
          property: "ConversationID",
          rich_text: { equals: conversationId as string },
        },
        sorts: [{ property: "CreatedAt", direction: "ascending" }],
      });

      const messages = messagesResponse.results.map(parseMessage);

      res.writeHead(200, { ...headers, "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          messages,
          total: messages.length,
        })
      );
      return;
    }

    // POST - Create conversation or send message
    if (req.method === "POST") {
      const { recipientId, content } = body;

      if (!recipientId || !content) {
        res.writeHead(400, { ...headers, "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Missing required fields" }));
        return;
      }

      // Find or create conversation
      let convoId = conversationId as string;

      if (!convoId) {
        // Check if conversation exists
        const existingConversations = await notion.databases.query({
          database_id: DB_CONVERSATIONS,
          filter: {
            or: [
              {
                and: [
                  { property: "Participant1", rich_text: { equals: user.id } },
                  {
                    property: "Participant2",
                    rich_text: { equals: recipientId },
                  },
                ],
              },
              {
                and: [
                  {
                    property: "Participant1",
                    rich_text: { equals: recipientId },
                  },
                  { property: "Participant2", rich_text: { equals: user.id } },
                ],
              },
            ],
          },
        });

        if (existingConversations.results.length > 0) {
          convoId = existingConversations.results[0].id;
        } else {
          // Create new conversation
          const newConversation = await notion.pages.create({
            parent: { database_id: DB_CONVERSATIONS },
            properties: {
              Participant1: { rich_text: [{ text: { content: user.id } }] },
              Participant2: { rich_text: [{ text: { content: recipientId } }] },
              CreatedAt: { date: { start: new Date().toISOString() } },
              LastMessageAt: { date: { start: new Date().toISOString() } },
            },
          });
          convoId = newConversation.id;
        }
      }

      // Create message
      const message = await notion.pages.create({
        parent: { database_id: DB_MESSAGES },
        properties: {
          ConversationID: { rich_text: [{ text: { content: convoId } }] },
          SenderID: { rich_text: [{ text: { content: user.id } }] },
          SenderName: {
            rich_text: [{ text: { content: user.storeName || user.id } }],
          },
          Content: { rich_text: [{ text: { content: content } }] },
          Read: { checkbox: false },
          CreatedAt: { date: { start: new Date().toISOString() } },
        },
      });

      // Update conversation last message time
      await notion.pages.update({
        page_id: convoId,
        properties: {
          LastMessageAt: { date: { start: new Date().toISOString() } },
        },
      });

      res.writeHead(201, { ...headers, "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: parseMessage(message),
          conversationId: convoId,
        })
      );
      return;
    }

    // PUT - Mark message(s) as read
    if (req.method === "PUT" && action === "mark-read") {
      if (conversationId) {
        // Mark all messages in conversation as read
        const messages = await notion.databases.query({
          database_id: DB_MESSAGES,
          filter: {
            and: [
              {
                property: "ConversationID",
                rich_text: { equals: conversationId as string },
              },
              { property: "SenderID", rich_text: { does_not_equal: user.id } },
              { property: "Read", checkbox: { equals: false } },
            ],
          },
        });

        await Promise.all(
          messages.results.map((msg) =>
            notion.pages.update({
              page_id: msg.id,
              properties: {
                Read: { checkbox: true },
                ReadAt: { date: { start: new Date().toISOString() } },
              },
            })
          )
        );

        res.writeHead(200, { ...headers, "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            message: "Messages marked as read",
            count: messages.results.length,
          })
        );
        return;
      }

      if (id) {
        // Mark single message as read
        await notion.pages.update({
          page_id: id as string,
          properties: {
            Read: { checkbox: true },
            ReadAt: { date: { start: new Date().toISOString() } },
          },
        });

        res.writeHead(200, { ...headers, "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: true, message: "Message marked as read" })
        );
        return;
      }
    }

    // DELETE - Delete message
    if (req.method === "DELETE" && id) {
      const page = await notion.pages.retrieve({ page_id: id as string });
      const message = parseMessage(page);

      // Only sender can delete
      if (message.senderId !== user.id) {
        res.writeHead(403, { ...headers, "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Can only delete your own messages" }));
        return;
      }

      await notion.pages.update({
        page_id: id as string,
        archived: true,
      });

      res.writeHead(200, { ...headers, "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, message: "Message deleted" }));
      return;
    }

    res.writeHead(405, { ...headers, "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
  } catch (error: any) {
    console.error("Messages error:", error);
    res.writeHead(500, { ...headers, "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ error: error.message || "Internal server error" })
    );
  }
}

function parseConversation(page: any) {
  const props = page.properties;

  return {
    id: page.id,
    participant1: props.Participant1?.rich_text?.[0]?.text?.content || "",
    participant2: props.Participant2?.rich_text?.[0]?.text?.content || "",
    createdAt: props.CreatedAt?.date?.start || "",
    lastMessageAt: props.LastMessageAt?.date?.start || "",
  };
}

function parseMessage(page: any) {
  const props = page.properties;

  return {
    id: page.id,
    conversationId: props.ConversationID?.rich_text?.[0]?.text?.content || "",
    senderId: props.SenderID?.rich_text?.[0]?.text?.content || "",
    senderName: props.SenderName?.rich_text?.[0]?.text?.content || "",
    content: props.Content?.rich_text?.[0]?.text?.content || "",
    read: props.Read?.checkbox || false,
    readAt: props.ReadAt?.date?.start || null,
    createdAt: props.CreatedAt?.date?.start || "",
  };
}
