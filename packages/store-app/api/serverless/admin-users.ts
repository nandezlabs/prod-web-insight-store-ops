/**
 * Admin User Management API
 *
 * Endpoints for managing store users (CRUD operations)
 * Requires admin authentication
 */

import { Client } from "@notionhq/client";
import { getCorsHeaders } from "./utils/cors";
import { verifyToken, parseAuthHeader, JWTPayload } from "./utils/auth";
import { checkRateLimit, RATE_LIMITS } from "./utils/rateLimit";
import crypto from "crypto";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DB_STORE_USERS = process.env.DB_STORE_USERS!;
const DB_ANALYTICS_LOGS = process.env.DB_ANALYTICS_LOGS!;

interface NotionUser {
  id: string;
  storeId: string;
  storeName: string;
  pin: string;
  role: string;
  status: string;
  lastLogin?: string;
  location?: { latitude: number; longitude: number };
  geofenceRadius?: number;
}

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

    // GET - List all users or get single user
    if (method === "GET") {
      const userId = req.query?.id || req.queryStringParameters?.id;

      if (userId) {
        // Get single user
        const user = await getUserById(userId);

        if (!user) {
          res.writeHead(404, {
            ...headers,
            "Content-Type": "application/json",
          });
          res.end(
            JSON.stringify({
              success: false,
              error: "User not found",
            })
          );
          return;
        }

        res.writeHead(200, { ...headers, "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            user: sanitizeUser(user),
          })
        );
      } else {
        // List all users
        const users = await getAllUsers();

        res.writeHead(200, { ...headers, "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            users: users.map(sanitizeUser),
            count: users.length,
          })
        );
      }
      return;
    }

    // POST - Create new user
    if (method === "POST") {
      const body =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;

      // Validate required fields
      if (!body.storeId || !body.storeName || !body.pin) {
        res.writeHead(400, { ...headers, "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            error: "Missing required fields: storeId, storeName, pin",
          })
        );
        return;
      }

      // Check if store ID already exists
      const existingUser = await getUserByStoreId(body.storeId);
      if (existingUser) {
        res.writeHead(409, { ...headers, "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            error: "Store ID already exists",
          })
        );
        return;
      }

      // Hash PIN using crypto
      const hashedPin = hashPin(body.pin);

      // Create user in Notion
      const newUser = await createUser({
        storeId: body.storeId,
        storeName: body.storeName,
        pin: hashedPin,
        role: body.role || "store",
        status: body.status || "Active",
        location: body.location,
        geofenceRadius: body.geofenceRadius || 100,
      });

      // Log creation
      await logEvent("user_created", {
        userId: newUser.id,
        storeId: body.storeId,
        adminId: user.id,
        adminStoreId: user.storeId,
      });

      res.writeHead(201, { ...headers, "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: true,
          user: sanitizeUser(newUser),
          message: "User created successfully",
        })
      );
      return;
    }

    // PUT - Update user
    if (method === "PUT") {
      const body =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const userId = body.id || req.query?.id || req.queryStringParameters?.id;

      if (!userId) {
        res.writeHead(400, { ...headers, "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            error: "User ID required",
          })
        );
        return;
      }

      // If PIN is being updated, hash it
      if (body.pin) {
        body.pin = hashPin(body.pin);
      }

      // Update user in Notion
      const updatedUser = await updateUser(userId, body);

      // Log update
      await logEvent("user_updated", {
        userId,
        changes: Object.keys(body),
        adminId: user.id,
        adminStoreId: user.storeId,
      });

      res.writeHead(200, { ...headers, "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: true,
          user: sanitizeUser(updatedUser),
          message: "User updated successfully",
        })
      );
      return;
    }

    // DELETE - Deactivate user (soft delete)
    if (method === "DELETE") {
      const userId = req.query?.id || req.queryStringParameters?.id;

      if (!userId) {
        res.writeHead(400, { ...headers, "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            error: "User ID required",
          })
        );
        return;
      }

      // Soft delete by setting status to Inactive
      const updatedUser = await updateUser(userId, { status: "Inactive" });

      // Log deletion
      await logEvent("user_deleted", {
        userId,
        adminId: user.id,
        adminStoreId: user.storeId,
      });

      res.writeHead(200, { ...headers, "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: true,
          message: "User deactivated successfully",
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
    console.error("Admin users API error:", error);
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

async function getAllUsers(): Promise<NotionUser[]> {
  const response = await notion.databases.query({
    database_id: DB_STORE_USERS,
    sorts: [{ property: "Store Name", direction: "ascending" }],
  });

  return response.results.map(parseNotionUser);
}

async function getUserById(userId: string): Promise<NotionUser | null> {
  try {
    const page = await notion.pages.retrieve({ page_id: userId });
    return parseNotionUser(page);
  } catch (error) {
    return null;
  }
}

async function getUserByStoreId(storeId: string): Promise<NotionUser | null> {
  const response = await notion.databases.query({
    database_id: DB_STORE_USERS,
    filter: {
      property: "Store ID",
      rich_text: { equals: storeId },
    },
  });

  return response.results.length > 0
    ? parseNotionUser(response.results[0])
    : null;
}

async function createUser(data: Partial<NotionUser>): Promise<NotionUser> {
  const properties: any = {
    "Store ID": { rich_text: [{ text: { content: data.storeId || "" } }] },
    "Store Name": { title: [{ text: { content: data.storeName || "" } }] },
    PIN: { rich_text: [{ text: { content: data.pin || "" } }] },
    Role: { select: { name: data.role || "store" } },
    Status: { select: { name: data.status || "Active" } },
  };

  if (data.location) {
    properties["Location"] = {
      type: "location",
      location: {
        latitude: data.location.latitude,
        longitude: data.location.longitude,
      },
    };
  }

  if (data.geofenceRadius) {
    properties["Geofence Radius"] = { number: data.geofenceRadius };
  }

  const page = await notion.pages.create({
    parent: { database_id: DB_STORE_USERS },
    properties,
  });

  return parseNotionUser(page);
}

async function updateUser(
  userId: string,
  updates: Partial<NotionUser>
): Promise<NotionUser> {
  const properties: any = {};

  if (updates.storeName) {
    properties["Store Name"] = {
      title: [{ text: { content: updates.storeName } }],
    };
  }
  if (updates.pin) {
    properties["PIN"] = { rich_text: [{ text: { content: updates.pin } }] };
  }
  if (updates.role) {
    properties["Role"] = { select: { name: updates.role } };
  }
  if (updates.status) {
    properties["Status"] = { select: { name: updates.status } };
  }
  if (updates.location) {
    properties["Location"] = {
      type: "location",
      location: {
        latitude: updates.location.latitude,
        longitude: updates.location.longitude,
      },
    };
  }
  if (updates.geofenceRadius !== undefined) {
    properties["Geofence Radius"] = { number: updates.geofenceRadius };
  }

  const page = await notion.pages.update({
    page_id: userId,
    properties,
  });

  return parseNotionUser(page);
}

function parseNotionUser(page: any): NotionUser {
  const props = page.properties;

  return {
    id: page.id,
    storeId: props["Store ID"]?.rich_text?.[0]?.text?.content || "",
    storeName: props["Store Name"]?.title?.[0]?.text?.content || "",
    pin: props["PIN"]?.rich_text?.[0]?.text?.content || "",
    role: props["Role"]?.select?.name || "store",
    status: props["Status"]?.select?.name || "Inactive",
    lastLogin: props["Last Login"]?.date?.start,
    location: props["Location"]?.location
      ? {
          latitude: props["Location"].location.latitude,
          longitude: props["Location"].location.longitude,
        }
      : undefined,
    geofenceRadius: props["Geofence Radius"]?.number,
  };
}

function sanitizeUser(user: NotionUser) {
  const { pin, ...sanitized } = user;
  return sanitized;
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
