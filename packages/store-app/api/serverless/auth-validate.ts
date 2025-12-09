/**
 * Serverless Function: Validate Session
 *
 * Validates JWT token and returns user info with current store status.
 * Compatible with Vercel and Netlify serverless deployments.
 *
 * GET or POST /api/auth/validate
 * Headers: Authorization: Bearer {token}
 */

import { Client } from "@notionhq/client";
import { applyCorsHeaders } from "./utils/cors";
import { verifyToken, parseAuthHeader, JWTPayload } from "./utils/auth";

// Environment variables
const NOTION_API_KEY = process.env.NOTION_API_KEY || "";
const DB_STORE_USERS = process.env.DB_STORE_USERS || "";

// Initialize Notion client
const notion = new Client({ auth: NOTION_API_KEY });

/**
 * Main handler function
 */
export default async function handler(req: any, res: any) {
  const origin = req.headers.origin || req.headers.referer || "";

  // Set CORS headers
  applyCorsHeaders(res, origin, ["GET", "POST", "OPTIONS"]);

  // Handle OPTIONS preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Allow GET or POST
  if (req.method !== "POST" && req.method !== "GET") {
    res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
    return;
  }

  try {
    // Get authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        valid: false,
        error: "No authorization header",
      });
      return;
    }

    // Extract bearer token
    const token = parseAuthHeader(authHeader);
    if (!token) {
      res.status(401).json({
        success: false,
        valid: false,
        error: "Invalid authorization format",
      });
      return;
    }

    const user = verifyToken(token);

    if (!user) {
      res.status(401).json({
        success: false,
        valid: false,
        error: "Invalid or expired token",
      });
      return;
    }

    // Query Notion to get current store status and info
    try {
      const storePage: any = await notion.pages.retrieve({
        page_id: user.id,
      });

      const properties = storePage.properties;

      // Extract store data
      const storeData = {
        id: storePage.id,
        storeId:
          properties["Store ID"]?.rich_text?.[0]?.text?.content || user.storeId,
        name:
          properties["Store Name"]?.title?.[0]?.text?.content || user.storeName,
        role: properties["Role"]?.select?.name || user.role,
        status: properties["Status"]?.select?.name || "Inactive",
        // Geofence data for location checking
        latitude: properties["Latitude"]?.number || null,
        longitude: properties["Longitude"]?.number || null,
        geofenceRadius: properties["Geofence Radius (meters)"]?.number || 100,
      };

      // Check if store is still active
      if (storeData.status !== "Active") {
        res.status(403).json({
          success: false,
          valid: false,
          error: "Store account is no longer active",
          status: storeData.status,
        });
        return;
      }

      // Return valid session with store info
      res.status(200).json({
        success: true,
        valid: true,
        store: {
          id: storeData.id,
          storeId: storeData.storeId,
          name: storeData.name,
          role: storeData.role,
          status: storeData.status,
          geofence:
            storeData.latitude && storeData.longitude
              ? {
                  latitude: storeData.latitude,
                  longitude: storeData.longitude,
                  radius: storeData.geofenceRadius,
                }
              : null,
        },
        expiresAt: new Date(user.exp * 1000).toISOString(),
      });
    } catch (notionError: any) {
      // If store not found in Notion, token is valid but store may be deleted
      console.error("Notion query error:", notionError);

      res.status(404).json({
        success: false,
        valid: true, // Token is technically valid
        error: "Store not found in database",
      });
      return;
    }
  } catch (error: any) {
    console.error("Validation error:", error);

    res.status(500).json({
      success: false,
      valid: false,
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

// For Vercel
export { handler as GET, handler as POST };

// For Netlify
export { handler };
