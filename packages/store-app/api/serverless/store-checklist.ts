/**
 * Serverless Function: Store Checklist
 *
 * Handles checklist retrieval and submission with Notion integration.
 * Compatible with Vercel and Netlify serverless deployments.
 *
 * GET /api/store/checklist?section=opening&type=daily
 * POST /api/store/checklist (submit completed checklist)
 * Headers: Authorization: Bearer {token}
 */

import { Client } from "@notionhq/client";
import { applyCorsHeaders } from "./utils/cors";
import { verifyToken, parseAuthHeader, JWTPayload } from "./utils/auth";
import {
  checkRateLimit,
  getClientIP,
  setRateLimitHeaders,
  RATE_LIMITS,
} from "./utils/rateLimit";

// Environment variables
const NOTION_API_KEY = process.env.NOTION_API_KEY || "";
const DB_CHECKLISTS = process.env.DB_CHECKLISTS || "";
const DB_ANALYTICS_LOGS = process.env.DB_ANALYTICS_LOGS || "";

// Initialize Notion client
const notion = new Client({ auth: NOTION_API_KEY });

/**
 * Checklist task interface
 */
interface ChecklistTask {
  id: string;
  section: string;
  type: string;
  taskName: string;
  taskOrder: number;
  description?: string;
  status?: string;
  completedAt?: string;
  completedBy?: string;
}

/**
 * Checklist submission interface
 */
interface ChecklistSubmission {
  checklistId: string;
  responses: Array<{
    taskId: string;
    completed: boolean;
    notes?: string;
  }>;
  completionTime: number;
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
 * Parse Notion page to checklist task
 */
function parseNotionPage(page: any): ChecklistTask {
  const properties = page.properties;

  return {
    id: page.id,
    section: properties["Section"]?.select?.name || "",
    type: properties["Type"]?.select?.name || "",
    taskName: properties["Task Name"]?.title?.[0]?.text?.content || "",
    taskOrder: properties["Task Order"]?.number || 0,
    description:
      properties["Description"]?.rich_text?.[0]?.text?.content || undefined,
    status: properties["Status"]?.select?.name || undefined,
    completedAt: properties["Completed At"]?.date?.start || undefined,
    completedBy:
      properties["Completed By"]?.rich_text?.[0]?.text?.content || undefined,
  };
}

/**
 * Log analytics event
 */
async function logAnalyticsEvent(
  event: string,
  user: JWTPayload,
  metadata: Record<string, any>
): Promise<void> {
  if (!DB_ANALYTICS_LOGS) return;

  try {
    await notion.pages.create({
      parent: { database_id: DB_ANALYTICS_LOGS },
      properties: {
        Event: {
          title: [{ text: { content: event } }],
        },
        "Store ID": {
          rich_text: [{ text: { content: user.storeId } }],
        },
        "Store Name": {
          rich_text: [{ text: { content: user.storeName } }],
        },
        Timestamp: {
          date: { start: new Date().toISOString() },
        },
        Metadata: {
          rich_text: [{ text: { content: JSON.stringify(metadata) } }],
        },
      },
    });
  } catch (error) {
    console.error("Analytics logging error:", error);
  }
}

/**
 * Main handler
 */
async function handler(req: any, res: any) {
  const origin = req.headers.origin || "";

  // Set CORS headers
  applyCorsHeaders(res, origin, ["GET", "POST", "OPTIONS"]);

  // Handle OPTIONS preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Get client IP
  const ip = getClientIP(req);

  // Check rate limit (100 requests per hour)
  const rateLimit = checkRateLimit(ip, {
    maxAttempts: 100,
    windowMs: 60 * 60 * 1000,
  });
  setRateLimitHeaders(res, 100, rateLimit.remaining, rateLimit.resetTime);

  if (!rateLimit.allowed) {
    res.status(429).json({
      success: false,
      error: "Rate limit exceeded",
      retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
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

    // Handle GET request - retrieve checklist
    if (req.method === "GET") {
      const { section, type } = req.query;

      if (!section || !type) {
        res.status(400).json({
          success: false,
          error: "Missing required query parameters: section and type",
        });
        return;
      }

      // Build filter
      const filter: any = {
        and: [
          {
            property: "Section",
            select: {
              equals: section,
            },
          },
          {
            property: "Type",
            select: {
              equals: type,
            },
          },
        ],
      };

      // Query Notion database
      const response: any = await notion.databases.query({
        database_id: DB_CHECKLISTS,
        filter: filter,
        sorts: [
          {
            property: "Task Order",
            direction: "ascending",
          },
        ],
      });

      // Parse results
      const tasks = response.results.map(parseNotionPage);

      res.status(200).json({
        success: true,
        data: tasks,
        count: tasks.length,
      });
      return;
    }

    // Handle POST request - submit completed checklist
    if (req.method === "POST") {
      const body: ChecklistSubmission = req.body;

      if (
        !body.checklistId ||
        !body.responses ||
        !Array.isArray(body.responses)
      ) {
        res.status(400).json({
          success: false,
          error: "Invalid request body",
        });
        return;
      }

      const completedAt = new Date().toISOString();
      const completedBy = `${user.storeName} (${user.storeId})`;

      // Update each task in Notion
      const updatePromises = body.responses
        .filter((r) => r.completed)
        .map((response) =>
          notion.pages.update({
            page_id: response.taskId,
            properties: {
              Status: {
                select: { name: "Done" },
              },
              "Completed At": {
                date: { start: completedAt },
              },
              "Completed By": {
                rich_text: [{ text: { content: completedBy } }],
              },
              Notes: response.notes
                ? {
                    rich_text: [{ text: { content: response.notes } }],
                  }
                : undefined,
            } as any,
          })
        );

      await Promise.all(updatePromises);

      // Log analytics event
      await logAnalyticsEvent("form_submit", user, {
        formType: "checklist",
        checklistId: body.checklistId,
        tasksCompleted: body.responses.filter((r) => r.completed).length,
        totalTasks: body.responses.length,
        completionTime: body.completionTime,
      });

      res.status(200).json({
        success: true,
        message: "Checklist submitted successfully",
        tasksUpdated: body.responses.filter((r) => r.completed).length,
      });
      return;
    }

    // Method not allowed
    res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  } catch (error: any) {
    console.error("Checklist handler error:", error);

    res.status(500).json({
      success: false,
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
