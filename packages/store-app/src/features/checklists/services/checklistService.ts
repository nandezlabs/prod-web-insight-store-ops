/**
 * Checklist Service
 *
 * Handles API calls to fetch and manage completed checklists.
 * Uses Notion API through PHP proxy for fetching checklist data.
 */

import { openDB, type IDBPDatabase } from "idb";
import type { Checklist, ChecklistFilters } from "../types";

const DB_NAME = "checklistsDB";
const DB_VERSION = 1;
const STORE_NAME = "checklists";

/**
 * Initialize IndexedDB for offline caching
 */
async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("completedDate", "completedDate");
        store.createIndex("type", "type");
        store.createIndex("status", "status");
      }
    },
  });
}

/**
 * Cache checklists to IndexedDB
 */
async function cacheChecklists(checklists: Checklist[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, "readwrite");

  await Promise.all([
    ...checklists.map((checklist) => tx.store.put(checklist)),
    tx.done,
  ]);
}

/**
 * Get cached checklists from IndexedDB
 */
async function getCachedChecklists(): Promise<Checklist[]> {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

/**
 * Get single cached checklist by ID
 */
async function getCachedChecklist(id: string): Promise<Checklist | null> {
  const db = await getDB();
  const checklist = await db.get(STORE_NAME, id);
  return checklist || null;
}

/**
 * Calculate date range based on filter
 */
function getDateRange(
  dateRange: ChecklistFilters["dateRange"],
  customStartDate?: string,
  customEndDate?: string
): { start: string; end: string } {
  const now = new Date();
  const end = now.toISOString();
  let start: Date;

  switch (dateRange) {
    case "Last 7 days":
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "Last 30 days":
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "Last 90 days":
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case "Custom":
      return {
        start: customStartDate || new Date(0).toISOString(),
        end: customEndDate || end,
      };
    case "All":
    default:
      start = new Date(0); // Unix epoch
      break;
  }

  return { start: start.toISOString(), end };
}

/**
 * Apply filters to checklist array (for offline filtering)
 */
function applyFilters(
  checklists: Checklist[],
  filters: ChecklistFilters
): Checklist[] {
  let filtered = [...checklists];

  // Filter by type
  if (filters.types.length > 0) {
    filtered = filtered.filter((c) => filters.types.includes(c.type));
  }

  // Filter by status
  if (filters.statuses.length > 0) {
    filtered = filtered.filter((c) => filters.statuses.includes(c.status));
  }

  // Filter by user
  if (filters.completedByUsers.length > 0) {
    filtered = filtered.filter((c) =>
      filters.completedByUsers.includes(c.completedBy)
    );
  }

  // Filter by search query
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.section.toLowerCase().includes(query)
    );
  }

  // Filter by date range
  const { start, end } = getDateRange(
    filters.dateRange,
    filters.customStartDate,
    filters.customEndDate
  );
  filtered = filtered.filter((c) => {
    const completedDate = new Date(c.completedDate).getTime();
    return (
      completedDate >= new Date(start).getTime() &&
      completedDate <= new Date(end).getTime()
    );
  });

  // Sort by completed date (newest first)
  filtered.sort(
    (a, b) =>
      new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime()
  );

  return filtered;
}

/**
 * Fetch checklists from API with filters and pagination
 */
export async function fetchChecklists(
  filters: ChecklistFilters,
  page: number = 1,
  pageSize: number = 20
): Promise<{ checklists: Checklist[]; total: number; hasMore: boolean }> {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!navigator.onLine) {
    // Offline: use cached data
    const cached = await getCachedChecklists();
    const filtered = applyFilters(cached, filters);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      checklists: filtered.slice(start, end),
      total: filtered.length,
      hasMore: end < filtered.length,
    };
  }

  try {
    const { start, end } = getDateRange(
      filters.dateRange,
      filters.customStartDate,
      filters.customEndDate
    );

    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      startDate: start,
      endDate: end,
    });

    if (filters.types.length > 0) {
      queryParams.append("types", filters.types.join(","));
    }
    if (filters.statuses.length > 0) {
      queryParams.append("statuses", filters.statuses.join(","));
    }
    if (filters.completedByUsers.length > 0) {
      queryParams.append("users", filters.completedByUsers.join(","));
    }
    if (filters.searchQuery) {
      queryParams.append("search", filters.searchQuery);
    }

    const response = await fetch(
      `${apiUrl}/notion-proxy.php?action=queryChecklists&${queryParams}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch checklists");
    }

    const data = await response.json();

    // Cache the results
    if (data.checklists && data.checklists.length > 0) {
      await cacheChecklists(data.checklists);
    }

    return {
      checklists: data.checklists || [],
      total: data.total || 0,
      hasMore: data.hasMore || false,
    };
  } catch (error) {
    console.error("Error fetching checklists:", error);

    // Fallback to cached data
    const cached = await getCachedChecklists();
    const filtered = applyFilters(cached, filters);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      checklists: filtered.slice(start, end),
      total: filtered.length,
      hasMore: end < filtered.length,
    };
  }
}

/**
 * Fetch single checklist detail by ID
 */
export async function fetchChecklistDetail(
  id: string
): Promise<Checklist | null> {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!navigator.onLine) {
    // Offline: use cached data
    return getCachedChecklist(id);
  }

  try {
    const response = await fetch(
      `${apiUrl}/notion-proxy.php?action=getChecklist&id=${id}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch checklist detail");
    }

    const data = await response.json();
    const checklist = data.checklist;

    // Cache the result
    if (checklist) {
      await cacheChecklists([checklist]);
    }

    return checklist || null;
  } catch (error) {
    console.error("Error fetching checklist detail:", error);

    // Fallback to cached data
    return getCachedChecklist(id);
  }
}

/**
 * Export checklist to PDF (future implementation)
 */
export async function exportToPDF(checklist: Checklist): Promise<void> {
  // TODO: Implement PDF export using a library like jsPDF or html2canvas
  console.log("Exporting checklist to PDF:", checklist.id);
  alert("PDF export feature coming soon!");
}

/**
 * Download photo from URL
 */
export async function downloadPhoto(
  url: string,
  filename: string
): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Error downloading photo:", error);
    throw new Error("Failed to download photo");
  }
}
