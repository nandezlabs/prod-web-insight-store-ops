/**
 * Serverless Function: Store Inventory
 *
 * Retrieves active inventory items with optional category filtering.
 * Compatible with Vercel and Netlify serverless deployments.
 *
 * GET /api/store/inventory?category=entree
 * Headers: Authorization: Bearer {token}
 */

import { Client } from "@notionhq/client";
import { applyCorsHeaders } from "./utils/cors";
import { verifyToken, parseAuthHeader, JWTPayload } from "./utils/auth";

// Environment variables
const NOTION_API_KEY = process.env.NOTION_API_KEY || "";
const DB_INVENTORY = process.env.DB_INVENTORY || "";

// Initialize Notion client
const notion = new Client({ auth: NOTION_API_KEY });

/**
 * Inventory item interface
 */
interface InventoryItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  status: string;
  standardAmount?: number;
  unit?: string;
  notes?: string;
}

/**
 * Require authentication
 */
function requireAuth(authHeader: string | undefined): JWTPayload | null {
  if (!authHeader) return null;
  const token = parseAuthHeader(authHeader);
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Parse Notion page to inventory item
 */
function parseNotionPage(page: any): InventoryItem {
  const properties = page.properties;

  return {
    id: page.id,
    itemCode: properties["Item Code"]?.rich_text?.[0]?.text?.content || "",
    itemName: properties["Item Name"]?.title?.[0]?.text?.content || "",
    category: properties["Category"]?.select?.name || "",
    status: properties["Status"]?.select?.name || "",
    standardAmount: properties["Standard Amount"]?.number || undefined,
    unit: properties["Unit"]?.select?.name || undefined,
    notes: properties["Notes"]?.rich_text?.[0]?.text?.content || undefined,
  };
}

/**
 * Main handler
 */
async function handler(req: any, res: any) {
  const origin = req.headers.origin || "";

  // Set CORS headers
  applyCorsHeaders(res, origin, ["GET", "OPTIONS"]);

  // Handle OPTIONS preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Only allow GET
  if (req.method !== "GET") {
    res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
    return;
  }

  try {
    // Verify authentication
    const user = requireAuth(req.headers.authorization);
    if (!user) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
      return;
    }

    // Get category filter from query params
    const { category } = req.query;

    // Build filter - always require Active status
    const filter: any = {
      and: [
        {
          property: "Status",
          select: {
            equals: "Active",
          },
        },
      ],
    };

    // Add category filter if provided
    if (category) {
      filter.and.push({
        property: "Category",
        select: {
          equals: category,
        },
      });
    }

    // Query Notion database
    const response: any = await notion.databases.query({
      database_id: DB_INVENTORY,
      filter: filter,
      sorts: [
        {
          property: "Category",
          direction: "ascending",
        },
        {
          property: "Item Name",
          direction: "ascending",
        },
      ],
    });

    // Parse results
    const items = response.results.map(parseNotionPage);

    res.status(200).json({
      success: true,
      data: items,
      count: items.length,
      filters: {
        status: "Active",
        category: category || "all",
      },
    });
  } catch (error: any) {
    console.error("Inventory handler error:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

// For Vercel
export { handler as GET };

// For Netlify
export { handler };
