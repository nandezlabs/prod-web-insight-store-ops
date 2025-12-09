/**
 * Serverless Function: Admin Dashboard Stats
 *
 * Retrieves aggregated statistics for admin dashboard from multiple Notion databases.
 * Compatible with Vercel and Netlify serverless deployments.
 *
 * GET /api/admin/dashboard
 * Headers: Authorization: Bearer {admin_token}
 */

import { Client } from "@notionhq/client";
import { applyCorsHeaders } from "./utils/cors";
import { verifyToken, parseAuthHeader, JWTPayload } from "./utils/auth";

// Environment variables
const NOTION_API_KEY = process.env.NOTION_API_KEY || "";
const DB_CHECKLISTS = process.env.DB_CHECKLISTS || "";
const DB_STORE_USERS = process.env.DB_STORE_USERS || "";
const DB_REPLACEMENTS = process.env.DB_REPLACEMENTS || "";

// Initialize Notion client
const notion = new Client({ auth: NOTION_API_KEY });

/**
 * Dashboard stats interface
 */
interface DashboardStats {
  checklists: {
    completedToday: number;
    completedThisWeek: number;
    averageCompletionTime: number;
  };
  stores: {
    totalActive: number;
  };
  replacements: {
    pendingRequests: number;
  };
}

/**
 * Require admin authentication
 */
function requireAdminAuth(authHeader: string | undefined): JWTPayload | null {
  if (!authHeader) return null;
  const token = parseAuthHeader(authHeader);
  if (!token) return null;
  const user = verifyToken(token);
  if (!user) return null;

  // Check if user has admin role
  if (user.role !== "Admin" && user.role !== "SuperAdmin") {
    return null;
  }

  return user;
}

/**
 * Get start of day in ISO format
 */
function getStartOfDay(): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
}

/**
 * Get start of week (Monday) in ISO format
 */
function getStartOfWeek(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
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
    // Verify admin authentication
    const user = requireAdminAuth(req.headers.authorization);
    if (!user) {
      res.status(403).json({
        success: false,
        error: "Admin access required",
      });
      return;
    }

    const startOfDay = getStartOfDay();
    const startOfWeek = getStartOfWeek();

    // Query 1: Checklists completed today
    const checklistsTodayResponse: any = await notion.databases.query({
      database_id: DB_CHECKLISTS,
      filter: {
        and: [
          {
            property: "Completed At",
            date: {
              on_or_after: startOfDay,
            },
          },
        ],
      },
    });

    // Query 2: Checklists completed this week
    const checklistsWeekResponse: any = await notion.databases.query({
      database_id: DB_CHECKLISTS,
      filter: {
        and: [
          {
            property: "Status",
            select: {
              equals: "Done",
            },
          },
          {
            property: "Completed At",
            date: {
              on_or_after: startOfWeek,
            },
          },
        ],
      },
    });

    // Calculate average completion time from checklists this week
    let totalCompletionTime = 0;
    let checklistsWithTime = 0;

    checklistsWeekResponse.results.forEach((page: any) => {
      const completionTime =
        page.properties["Completion Time (minutes)"]?.number;
      if (completionTime && completionTime > 0) {
        totalCompletionTime += completionTime;
        checklistsWithTime++;
      }
    });

    const averageCompletionTime =
      checklistsWithTime > 0 ? totalCompletionTime / checklistsWithTime : 0;

    // Query 3: Active stores
    const activeStoresResponse: any = await notion.databases.query({
      database_id: DB_STORE_USERS,
      filter: {
        property: "Status",
        select: {
          equals: "Active",
        },
      },
    });

    // Query 4: Pending replacement requests
    const pendingReplacementsResponse: any = await notion.databases.query({
      database_id: DB_REPLACEMENTS,
      filter: {
        property: "Status",
        select: {
          equals: "Pending",
        },
      },
    });

    // Build dashboard stats
    const stats: DashboardStats = {
      checklists: {
        completedToday: checklistsTodayResponse.results.length,
        completedThisWeek: checklistsWeekResponse.results.length,
        averageCompletionTime: Math.round(averageCompletionTime * 10) / 10,
      },
      stores: {
        totalActive: activeStoresResponse.results.length,
      },
      replacements: {
        pendingRequests: pendingReplacementsResponse.results.length,
      },
    };

    res.status(200).json({
      success: true,
      data: stats,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Dashboard handler error:", error);

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
