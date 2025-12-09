/**
 * Serverless Function: Admin Forms Management
 *
 * Manages form definitions with full CRUD operations.
 * Compatible with Vercel and Netlify serverless deployments.
 *
 * GET /api/admin/forms - List all forms
 * GET /api/admin/forms?id=xxx - Get single form
 * POST /api/admin/forms - Create or update form
 * DELETE /api/admin/forms?id=xxx - Archive form
 * Headers: Authorization: Bearer {admin_token}
 */

import { Client } from "@notionhq/client";
import { applyCorsHeaders } from "./utils/cors";
import { verifyToken, parseAuthHeader, JWTPayload } from "./utils/auth";

// Environment variables
const NOTION_API_KEY = process.env.NOTION_API_KEY || "";
const DB_FORMS = process.env.DB_FORMS || "";
const DB_ANALYTICS_LOGS = process.env.DB_ANALYTICS_LOGS || "";

// Initialize Notion client
const notion = new Client({ auth: NOTION_API_KEY });

/**
 * Form interface
 */
interface Form {
  id: string;
  formId: string;
  title: string;
  section: string;
  schema: any;
  version: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Form request body
 */
interface FormRequest {
  formId?: string;
  title: string;
  section: string;
  schema: any;
  version: string;
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
 * Parse Notion page to form object
 */
function parseNotionPage(page: any): Form {
  const properties = page.properties;

  // Parse schema JSON
  let schema = {};
  try {
    const schemaText =
      properties["Schema"]?.rich_text?.[0]?.text?.content || "{}";
    schema = JSON.parse(schemaText);
  } catch (error) {
    console.error("Schema parse error:", error);
  }

  return {
    id: page.id,
    formId: properties["Form ID"]?.rich_text?.[0]?.text?.content || "",
    title: properties["Title"]?.title?.[0]?.text?.content || "",
    section: properties["Section"]?.select?.name || "",
    schema: schema,
    version: properties["Version"]?.rich_text?.[0]?.text?.content || "1.0",
    status: properties["Status"]?.select?.name || "Active",
    createdAt: properties["Created At"]?.date?.start || undefined,
    updatedAt: properties["Updated At"]?.date?.start || undefined,
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
  applyCorsHeaders(res, origin, ["GET", "POST", "DELETE", "OPTIONS"]);

  // Handle OPTIONS preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
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

    // Handle GET request - retrieve forms
    if (req.method === "GET") {
      const { id } = req.query;

      // Get single form by ID
      if (id) {
        try {
          const page: any = await notion.pages.retrieve({ page_id: id });
          const form = parseNotionPage(page);

          res.status(200).json({
            success: true,
            data: form,
          });
          return;
        } catch (error: any) {
          res.status(404).json({
            success: false,
            error: "Form not found",
          });
          return;
        }
      }

      // Get all non-archived forms
      const response: any = await notion.databases.query({
        database_id: DB_FORMS,
        filter: {
          property: "Status",
          select: {
            does_not_equal: "Archived",
          },
        },
        sorts: [
          {
            property: "Section",
            direction: "ascending",
          },
          {
            property: "Title",
            direction: "ascending",
          },
        ],
      });

      const forms = response.results.map(parseNotionPage);

      res.status(200).json({
        success: true,
        data: forms,
        count: forms.length,
      });
      return;
    }

    // Handle POST request - create or update form
    if (req.method === "POST") {
      const body: FormRequest = req.body;

      if (!body.title || !body.section || !body.schema) {
        res.status(400).json({
          success: false,
          error: "Missing required fields: title, section, schema",
        });
        return;
      }

      const now = new Date().toISOString();
      const schemaJson = JSON.stringify(body.schema);

      // Update existing form
      if (body.formId) {
        try {
          // Find form by Form ID
          const queryResponse: any = await notion.databases.query({
            database_id: DB_FORMS,
            filter: {
              property: "Form ID",
              rich_text: {
                equals: body.formId,
              },
            },
          });

          if (queryResponse.results.length === 0) {
            res.status(404).json({
              success: false,
              error: "Form not found",
            });
            return;
          }

          const pageId = queryResponse.results[0].id;

          await notion.pages.update({
            page_id: pageId,
            properties: {
              Title: {
                title: [{ text: { content: body.title } }],
              },
              Section: {
                select: { name: body.section },
              },
              Schema: {
                rich_text: [{ text: { content: schemaJson } }],
              },
              Version: {
                rich_text: [{ text: { content: body.version || "1.0" } }],
              },
              "Updated At": {
                date: { start: now },
              },
            } as any,
          });

          // Log update event
          await logAnalyticsEvent("form_update", user, {
            formId: body.formId,
            title: body.title,
            section: body.section,
            version: body.version,
          });

          res.status(200).json({
            success: true,
            message: "Form updated successfully",
            formId: body.formId,
          });
          return;
        } catch (error: any) {
          console.error("Form update error:", error);
          res.status(500).json({
            success: false,
            error: "Failed to update form",
          });
          return;
        }
      }

      // Create new form
      const newFormId = `form_${Date.now()}`;

      await notion.pages.create({
        parent: { database_id: DB_FORMS },
        properties: {
          Title: {
            title: [{ text: { content: body.title } }],
          },
          "Form ID": {
            rich_text: [{ text: { content: newFormId } }],
          },
          Section: {
            select: { name: body.section },
          },
          Schema: {
            rich_text: [{ text: { content: schemaJson } }],
          },
          Version: {
            rich_text: [{ text: { content: body.version || "1.0" } }],
          },
          Status: {
            select: { name: "Active" },
          },
          "Created At": {
            date: { start: now },
          },
          "Updated At": {
            date: { start: now },
          },
        },
      });

      // Log creation event
      await logAnalyticsEvent("form_create", user, {
        formId: newFormId,
        title: body.title,
        section: body.section,
        version: body.version,
      });

      res.status(201).json({
        success: true,
        message: "Form created successfully",
        formId: newFormId,
      });
      return;
    }

    // Handle DELETE request - archive form
    if (req.method === "DELETE") {
      const { id } = req.query;

      if (!id) {
        res.status(400).json({
          success: false,
          error: "Form ID is required",
        });
        return;
      }

      try {
        await notion.pages.update({
          page_id: id,
          properties: {
            Status: {
              select: { name: "Archived" },
            },
            "Updated At": {
              date: { start: new Date().toISOString() },
            },
          } as any,
        });

        // Log archive event
        await logAnalyticsEvent("form_archive", user, {
          formId: id,
        });

        res.status(200).json({
          success: true,
          message: "Form archived successfully",
        });
        return;
      } catch (error: any) {
        res.status(404).json({
          success: false,
          error: "Form not found",
        });
        return;
      }
    }

    // Method not allowed
    res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  } catch (error: any) {
    console.error("Forms handler error:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

// For Vercel
export { handler as GET, handler as POST, handler as DELETE };

// For Netlify
export { handler };
