/**
 * Store Management API - Admin CRUD operations for stores
 */

import { Client } from "@notionhq/client";
import { getCorsHeaders } from "./utils/cors";
import { verifyToken, parseAuthHeader } from "./utils/auth";
import { checkRateLimit, RATE_LIMITS } from "./utils/rateLimit";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DB_STORES =
  process.env.DB_STORES || process.env.NOTION_STORE_DATABASE_ID || "";

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

    const { id, storeId, region, status } = req.query || {};
    const body = req.body
      ? typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body
      : {};

    // GET - List stores or get single store
    if (req.method === "GET") {
      if (id) {
        const page = await notion.pages.retrieve({ page_id: id as string });
        res.writeHead(200, { ...headers, "Content-Type": "application/json" });
        res.end(JSON.stringify({ store: parseStore(page) }));
        return;
      }

      const filters: any[] = [];
      if (storeId)
        filters.push({ property: "Store ID", title: { equals: storeId } });
      if (region)
        filters.push({ property: "Region", select: { equals: region } });
      if (status)
        filters.push({ property: "Status", select: { equals: status } });

      const response = await notion.databases.query({
        database_id: DB_STORES,
        filter: filters.length > 0 ? { and: filters } : undefined,
        sorts: [{ property: "Store ID", direction: "ascending" }],
      });

      res.writeHead(200, { ...headers, "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          stores: response.results.map(parseStore),
          total: response.results.length,
        })
      );
      return;
    }

    // POST - Create store
    if (req.method === "POST") {
      const {
        storeId,
        storeName,
        region,
        status = "Active",
        latitude,
        longitude,
        geofenceRadius,
        operatingHours,
      } = body;

      if (!storeId || !storeName) {
        res.writeHead(400, { ...headers, "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Store ID and Store Name required" }));
        return;
      }

      const properties: any = {
        "Store ID": { title: [{ text: { content: storeId } }] },
        "Store Name": { rich_text: [{ text: { content: storeName } }] },
        Status: { select: { name: status } },
      };

      if (region) properties["Region"] = { select: { name: region } };
      if (latitude !== undefined) properties["Latitude"] = { number: latitude };
      if (longitude !== undefined)
        properties["Longitude"] = { number: longitude };
      if (geofenceRadius)
        properties["Geofence Radius"] = { number: geofenceRadius };
      if (operatingHours)
        properties["Operating Hours"] = {
          rich_text: [{ text: { content: JSON.stringify(operatingHours) } }],
        };

      const page = await notion.pages.create({
        parent: { database_id: DB_STORES },
        properties,
      });

      res.writeHead(201, { ...headers, "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, store: parseStore(page) }));
      return;
    }

    // PUT - Update store
    if (req.method === "PUT") {
      if (!id) {
        res.writeHead(400, { ...headers, "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Store ID required" }));
        return;
      }

      const properties: any = {};
      const {
        storeName,
        region,
        status,
        latitude,
        longitude,
        geofenceRadius,
        operatingHours,
      } = body;

      if (storeName)
        properties["Store Name"] = {
          rich_text: [{ text: { content: storeName } }],
        };
      if (region) properties["Region"] = { select: { name: region } };
      if (status) properties["Status"] = { select: { name: status } };
      if (latitude !== undefined) properties["Latitude"] = { number: latitude };
      if (longitude !== undefined)
        properties["Longitude"] = { number: longitude };
      if (geofenceRadius !== undefined)
        properties["Geofence Radius"] = { number: geofenceRadius };
      if (operatingHours)
        properties["Operating Hours"] = {
          rich_text: [{ text: { content: JSON.stringify(operatingHours) } }],
        };

      const page = await notion.pages.update({
        page_id: id as string,
        properties,
      });

      res.writeHead(200, { ...headers, "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, store: parseStore(page) }));
      return;
    }

    // DELETE - Soft delete (set to Closed)
    if (req.method === "DELETE") {
      if (!id) {
        res.writeHead(400, { ...headers, "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Store ID required" }));
        return;
      }

      await notion.pages.update({
        page_id: id as string,
        properties: { Status: { select: { name: "Closed" } } },
      });

      res.writeHead(200, { ...headers, "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, message: "Store closed" }));
      return;
    }

    res.writeHead(405, { ...headers, "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
  } catch (error: any) {
    console.error("Store management error:", error);
    res.writeHead(500, { ...headers, "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ error: "Internal server error", message: error.message })
    );
  }
}

function parseStore(page: any) {
  const props = page.properties;
  let operatingHours;
  try {
    operatingHours = props["Operating Hours"]?.rich_text?.[0]?.plain_text
      ? JSON.parse(props["Operating Hours"].rich_text[0].plain_text)
      : undefined;
  } catch (e) {}

  return {
    id: page.id,
    storeId: props["Store ID"]?.title?.[0]?.plain_text || "",
    storeName: props["Store Name"]?.rich_text?.[0]?.plain_text || "",
    region: props["Region"]?.select?.name,
    status: props["Status"]?.select?.name || "Active",
    latitude: props["Latitude"]?.number,
    longitude: props["Longitude"]?.number,
    geofenceRadius: props["Geofence Radius"]?.number,
    operatingHours,
    createdAt: props["Created"]?.created_time,
    updatedAt: props["Last Updated"]?.last_edited_time,
  };
}
