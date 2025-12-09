/**
 * Financial Data Management API
 * P&L reports data entry and retrieval
 */

import { Client } from "@notionhq/client";
import { getCorsHeaders } from "./utils/cors";
import { verifyToken, parseAuthHeader } from "./utils/auth";
import { checkRateLimit, RATE_LIMITS } from "./utils/rateLimit";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DB_FINANCIALS =
  process.env.DB_FINANCIALS || process.env.NOTION_FINANCIALS_DATABASE_ID || "";

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

    const { id, storeId, period, year, category } = req.query || {};
    const body = req.body
      ? typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body
      : {};

    // GET - List financial entries or get single entry
    if (req.method === "GET") {
      if (id) {
        const page = await notion.pages.retrieve({ page_id: id as string });
        res.writeHead(200, { ...headers, "Content-Type": "application/json" });
        res.end(JSON.stringify({ entry: parseFinancialEntry(page) }));
        return;
      }

      const filters: any[] = [];
      if (storeId)
        filters.push({ property: "Store ID", rich_text: { equals: storeId } });
      if (period)
        filters.push({ property: "Period", select: { equals: period } });
      if (year)
        filters.push({
          property: "Year",
          number: { equals: parseInt(year as string) },
        });
      if (category)
        filters.push({ property: "Category", select: { equals: category } });

      const response = await notion.databases.query({
        database_id: DB_FINANCIALS,
        filter: filters.length > 0 ? { and: filters } : undefined,
        sorts: [
          { property: "Year", direction: "descending" },
          { property: "Period", direction: "descending" },
        ],
      });

      res.writeHead(200, { ...headers, "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          entries: response.results.map(parseFinancialEntry),
          total: response.results.length,
        })
      );
      return;
    }

    // POST - Create financial entry
    if (req.method === "POST") {
      const {
        storeId,
        storeName,
        period,
        year,
        category,
        revenue,
        cogs,
        laborCost,
        rent,
        utilities,
        other,
        notes,
      } = body;

      if (!storeId || !period || !year || !category) {
        res.writeHead(400, { ...headers, "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Store ID, period, year, and category required",
          })
        );
        return;
      }

      const properties: any = {
        "Store ID": { rich_text: [{ text: { content: storeId } }] },
        "Store Name": {
          rich_text: [{ text: { content: storeName || storeId } }],
        },
        Period: { select: { name: period } },
        Year: { number: year },
        Category: { select: { name: category } },
      };

      if (revenue !== undefined) properties["Revenue"] = { number: revenue };
      if (cogs !== undefined) properties["COGS"] = { number: cogs };
      if (laborCost !== undefined)
        properties["Labor Cost"] = { number: laborCost };
      if (rent !== undefined) properties["Rent"] = { number: rent };
      if (utilities !== undefined)
        properties["Utilities"] = { number: utilities };
      if (other !== undefined) properties["Other Expenses"] = { number: other };
      if (notes)
        properties["Notes"] = { rich_text: [{ text: { content: notes } }] };

      const page = await notion.pages.create({
        parent: { database_id: DB_FINANCIALS },
        properties,
      });

      res.writeHead(201, { ...headers, "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ success: true, entry: parseFinancialEntry(page) })
      );
      return;
    }

    // PUT - Update financial entry
    if (req.method === "PUT") {
      if (!id) {
        res.writeHead(400, { ...headers, "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Entry ID required" }));
        return;
      }

      const properties: any = {};
      const { revenue, cogs, laborCost, rent, utilities, other, notes } = body;

      if (revenue !== undefined) properties["Revenue"] = { number: revenue };
      if (cogs !== undefined) properties["COGS"] = { number: cogs };
      if (laborCost !== undefined)
        properties["Labor Cost"] = { number: laborCost };
      if (rent !== undefined) properties["Rent"] = { number: rent };
      if (utilities !== undefined)
        properties["Utilities"] = { number: utilities };
      if (other !== undefined) properties["Other Expenses"] = { number: other };
      if (notes !== undefined)
        properties["Notes"] = { rich_text: [{ text: { content: notes } }] };

      const page = await notion.pages.update({
        page_id: id as string,
        properties,
      });

      res.writeHead(200, { ...headers, "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ success: true, entry: parseFinancialEntry(page) })
      );
      return;
    }

    // DELETE - Delete financial entry
    if (req.method === "DELETE") {
      if (!id) {
        res.writeHead(400, { ...headers, "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Entry ID required" }));
        return;
      }

      await notion.pages.update({
        page_id: id as string,
        archived: true,
      });

      res.writeHead(200, { ...headers, "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, message: "Entry deleted" }));
      return;
    }

    res.writeHead(405, { ...headers, "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
  } catch (error: any) {
    console.error("Financial data error:", error);
    res.writeHead(500, { ...headers, "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ error: "Internal server error", message: error.message })
    );
  }
}

function parseFinancialEntry(page: any) {
  const props = page.properties;

  const revenue = props["Revenue"]?.number || 0;
  const cogs = props["COGS"]?.number || 0;
  const laborCost = props["Labor Cost"]?.number || 0;
  const rent = props["Rent"]?.number || 0;
  const utilities = props["Utilities"]?.number || 0;
  const other = props["Other Expenses"]?.number || 0;

  const totalExpenses = cogs + laborCost + rent + utilities + other;
  const netIncome = revenue - totalExpenses;
  const margin = revenue > 0 ? (netIncome / revenue) * 100 : 0;

  return {
    id: page.id,
    storeId: props["Store ID"]?.rich_text?.[0]?.plain_text || "",
    storeName: props["Store Name"]?.rich_text?.[0]?.plain_text || "",
    period: props["Period"]?.select?.name || "",
    year: props["Year"]?.number || new Date().getFullYear(),
    category: props["Category"]?.select?.name || "",
    revenue,
    cogs,
    laborCost,
    rent,
    utilities,
    other,
    totalExpenses,
    netIncome,
    margin: parseFloat(margin.toFixed(2)),
    notes: props["Notes"]?.rich_text?.[0]?.plain_text || "",
    createdAt: props["Created"]?.created_time,
    updatedAt: props["Last Updated"]?.last_edited_time,
  };
}
