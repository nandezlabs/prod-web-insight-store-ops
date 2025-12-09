/**
 * Financial Reports API
 * Period comparisons, drill-down, and aggregated reporting
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

    if (req.method !== "GET") {
      res.writeHead(405, { ...headers, "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }

    const { reportType, storeId, year, compareYear } = req.query || {};

    // Fetch all relevant financial data
    let allResults: any[] = [];
    let hasMore = true;
    let startCursor: string | undefined;

    const filters: any[] = [];
    if (storeId)
      filters.push({ property: "Store ID", rich_text: { equals: storeId } });

    while (hasMore) {
      const response: any = await notion.databases.query({
        database_id: DB_FINANCIALS,
        filter: filters.length > 0 ? { and: filters } : undefined,
        start_cursor: startCursor,
        sorts: [{ property: "Year", direction: "descending" }],
      });

      allResults = allResults.concat(response.results);
      hasMore = response.has_more;
      startCursor = response.next_cursor;
    }

    const entries = allResults.map(parseFinancialEntry);

    // Generate report based on type
    let report;
    switch (reportType) {
      case "mtd":
        report = generateMTDReport(entries, year as string);
        break;
      case "ytd":
        report = generateYTDReport(entries, year as string);
        break;
      case "yoy":
        report = generateYoYReport(
          entries,
          year as string,
          compareYear as string
        );
        break;
      case "store-comparison":
        report = generateStoreComparisonReport(entries, year as string);
        break;
      default:
        report = generateSummaryReport(entries);
    }

    res.writeHead(200, { ...headers, "Content-Type": "application/json" });
    res.end(JSON.stringify(report));
  } catch (error: any) {
    console.error("Financial reports error:", error);
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
    netIncome: revenue - totalExpenses,
  };
}

function generateMTDReport(entries: any[], year: string) {
  const currentYear = parseInt(year) || new Date().getFullYear();
  const currentMonth = new Date().toLocaleString("default", { month: "long" });

  const mtdEntries = entries.filter(
    (e) => e.year === currentYear && e.period === currentMonth
  );

  return {
    reportType: "MTD",
    period: currentMonth,
    year: currentYear,
    data: aggregateData(mtdEntries),
    byStore: groupByStore(mtdEntries),
  };
}

function generateYTDReport(entries: any[], year: string) {
  const currentYear = parseInt(year) || new Date().getFullYear();
  const ytdEntries = entries.filter((e) => e.year === currentYear);

  return {
    reportType: "YTD",
    year: currentYear,
    data: aggregateData(ytdEntries),
    byPeriod: groupByPeriod(ytdEntries),
    byStore: groupByStore(ytdEntries),
  };
}

function generateYoYReport(entries: any[], year: string, compareYear: string) {
  const currentYear = parseInt(year) || new Date().getFullYear();
  const prevYear = parseInt(compareYear) || currentYear - 1;

  const currentYearData = entries.filter((e) => e.year === currentYear);
  const prevYearData = entries.filter((e) => e.year === prevYear);

  const current = aggregateData(currentYearData);
  const previous = aggregateData(prevYearData);

  return {
    reportType: "YoY",
    currentYear,
    previousYear: prevYear,
    current,
    previous,
    growth: {
      revenue: calculateGrowth(previous.revenue, current.revenue),
      netIncome: calculateGrowth(previous.netIncome, current.netIncome),
      margin: current.margin - previous.margin,
    },
    byPeriod: compareByPeriod(currentYearData, prevYearData),
  };
}

function generateStoreComparisonReport(entries: any[], year: string) {
  const currentYear = parseInt(year) || new Date().getFullYear();
  const yearEntries = entries.filter((e) => e.year === currentYear);
  const byStore = groupByStore(yearEntries);

  return {
    reportType: "Store Comparison",
    year: currentYear,
    stores: Object.entries(byStore)
      .map(([storeId, data]: [string, any]) => ({
        storeId,
        storeName: data.storeName,
        ...data,
      }))
      .sort((a, b) => b.revenue - a.revenue),
  };
}

function generateSummaryReport(entries: any[]) {
  return {
    reportType: "Summary",
    totalEntries: entries.length,
    data: aggregateData(entries),
    byYear: groupByYear(entries),
  };
}

function aggregateData(entries: any[]) {
  const total = entries.reduce(
    (acc, e) => ({
      revenue: acc.revenue + e.revenue,
      cogs: acc.cogs + e.cogs,
      laborCost: acc.laborCost + e.laborCost,
      rent: acc.rent + e.rent,
      utilities: acc.utilities + e.utilities,
      other: acc.other + e.other,
      totalExpenses: acc.totalExpenses + e.totalExpenses,
      netIncome: acc.netIncome + e.netIncome,
    }),
    {
      revenue: 0,
      cogs: 0,
      laborCost: 0,
      rent: 0,
      utilities: 0,
      other: 0,
      totalExpenses: 0,
      netIncome: 0,
    }
  );

  return {
    ...total,
    margin: total.revenue > 0 ? (total.netIncome / total.revenue) * 100 : 0,
    count: entries.length,
  };
}

function groupByStore(entries: any[]) {
  return entries.reduce((acc, e) => {
    if (!acc[e.storeId]) {
      acc[e.storeId] = { storeName: e.storeName, entries: [] };
    }
    acc[e.storeId].entries.push(e);
    return acc;
  }, {} as Record<string, any>);
}

function groupByPeriod(entries: any[]) {
  const grouped = entries.reduce((acc, e) => {
    if (!acc[e.period]) acc[e.period] = [];
    acc[e.period].push(e);
    return acc;
  }, {} as Record<string, any[]>);

  return Object.entries(grouped).map(([period, data]) => ({
    period,
    ...aggregateData(data as any[]),
  }));
}

function groupByYear(entries: any[]) {
  const grouped = entries.reduce((acc, e) => {
    if (!acc[e.year]) acc[e.year] = [];
    acc[e.year].push(e);
    return acc;
  }, {} as Record<number, any[]>);

  return Object.entries(grouped).map(([year, data]) => ({
    year: parseInt(year),
    ...aggregateData(data as any[]),
  }));
}

function compareByPeriod(current: any[], previous: any[]) {
  const periods = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return periods.map((period) => {
    const currentData = current.filter((e) => e.period === period);
    const previousData = previous.filter((e) => e.period === period);

    const currentAgg = aggregateData(currentData);
    const previousAgg = aggregateData(previousData);

    return {
      period,
      current: currentAgg,
      previous: previousAgg,
      growth: calculateGrowth(previousAgg.revenue, currentAgg.revenue),
    };
  });
}

function calculateGrowth(previous: number, current: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return parseFloat((((current - previous) / previous) * 100).toFixed(2));
}
