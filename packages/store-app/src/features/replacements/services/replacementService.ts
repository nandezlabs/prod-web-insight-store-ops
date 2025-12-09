/**
 * Replacement Service
 *
 * Handles API calls for inventory items and replacement requests.
 */

import { openDB, type IDBPDatabase } from "idb";
import type {
  InventoryItem,
  ReplacementRequest,
  ReplacementDraft,
} from "../types";

const DB_NAME = "replacementsDB";
const DB_VERSION = 1;
const ITEMS_STORE = "inventoryItems";
const REQUESTS_STORE = "requests";
const DRAFT_STORE = "draft";

/**
 * Initialize IndexedDB
 */
async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(ITEMS_STORE)) {
        const itemStore = db.createObjectStore(ITEMS_STORE, { keyPath: "id" });
        itemStore.createIndex("category", "category");
        itemStore.createIndex("status", "status");
      }

      if (!db.objectStoreNames.contains(REQUESTS_STORE)) {
        const requestStore = db.createObjectStore(REQUESTS_STORE, {
          keyPath: "id",
        });
        requestStore.createIndex("status", "status");
        requestStore.createIndex("requestDate", "requestDate");
      }

      if (!db.objectStoreNames.contains(DRAFT_STORE)) {
        db.createObjectStore(DRAFT_STORE);
      }
    },
  });
}

/**
 * Fetch inventory items from API
 */
export async function fetchInventoryItems(): Promise<InventoryItem[]> {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!navigator.onLine) {
    // Offline: use cached data
    const db = await getDB();
    return db.getAll(ITEMS_STORE);
  }

  try {
    const response = await fetch(
      `${apiUrl}/notion-proxy.php?action=queryInventory`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch inventory items");
    }

    const data = await response.json();
    const items = data.items || [];

    // Cache items
    const db = await getDB();
    const tx = db.transaction(ITEMS_STORE, "readwrite");
    await Promise.all([
      ...items.map((item: InventoryItem) => tx.store.put(item)),
      tx.done,
    ]);

    return items;
  } catch (error) {
    console.error("Error fetching inventory items:", error);

    // Fallback to cache
    const db = await getDB();
    return db.getAll(ITEMS_STORE);
  }
}

/**
 * Fetch user's replacement requests
 */
export async function fetchUserRequests(
  storeId: string
): Promise<ReplacementRequest[]> {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!navigator.onLine) {
    // Offline: use cached data
    const db = await getDB();
    const allRequests = await db.getAll(REQUESTS_STORE);
    return allRequests.filter((req) => req.requestedBy === storeId);
  }

  try {
    const response = await fetch(
      `${apiUrl}/notion-proxy.php?action=queryReplacements&storeId=${storeId}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch requests");
    }

    const data = await response.json();
    const requests = data.requests || [];

    // Cache requests
    const db = await getDB();
    const tx = db.transaction(REQUESTS_STORE, "readwrite");
    await Promise.all([
      ...requests.map((req: ReplacementRequest) => tx.store.put(req)),
      tx.done,
    ]);

    return requests;
  } catch (error) {
    console.error("Error fetching requests:", error);

    // Fallback to cache
    const db = await getDB();
    const allRequests = await db.getAll(REQUESTS_STORE);
    return allRequests.filter((req) => req.requestedBy === storeId);
  }
}

/**
 * Compress image file
 */
async function compressImage(
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to compress image"));
            }
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload photos to server
 */
export async function uploadPhotos(photos: File[]): Promise<string[]> {
  const apiUrl = import.meta.env.VITE_API_URL;
  const photoUrls: string[] = [];

  for (const photo of photos) {
    try {
      // Compress image
      const compressedBlob = await compressImage(photo);

      // Create form data
      const formData = new FormData();
      formData.append("photo", compressedBlob, photo.name);
      formData.append("action", "uploadPhoto");

      const response = await fetch(`${apiUrl}/upload.php`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload photo");
      }

      const data = await response.json();
      photoUrls.push(data.url);
    } catch (error) {
      console.error("Error uploading photo:", error);
      // Continue with other photos
    }
  }

  return photoUrls;
}

/**
 * Submit replacement request
 */
export async function submitRequest(
  request: Omit<ReplacementRequest, "id" | "status" | "requestDate">,
  photos: File[]
): Promise<ReplacementRequest> {
  const apiUrl = import.meta.env.VITE_API_URL;

  // Upload photos first
  const photoUrls = photos.length > 0 ? await uploadPhotos(photos) : [];

  // Create request object
  const fullRequest: Omit<ReplacementRequest, "id"> = {
    ...request,
    photoUrls: [...request.photoUrls, ...photoUrls],
    status: "Pending",
    requestDate: new Date().toISOString(),
  };

  try {
    const response = await fetch(
      `${apiUrl}/notion-proxy.php?action=createReplacement`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fullRequest),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to submit request");
    }

    const data = await response.json();
    const createdRequest = data.request;

    // Cache the request
    const db = await getDB();
    await db.put(REQUESTS_STORE, createdRequest);

    // Log analytics event
    await logReplacementRequest(createdRequest);

    return createdRequest;
  } catch (error) {
    console.error("Error submitting request:", error);
    throw error;
  }
}

/**
 * Log replacement request to analytics
 */
async function logReplacementRequest(
  request: ReplacementRequest
): Promise<void> {
  const apiUrl = import.meta.env.VITE_API_URL;

  try {
    await fetch(`${apiUrl}/notion-proxy.php?action=logEvent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventType: "replacement_request",
        storeId: request.requestedBy,
        storeName: request.requestedByName,
        metadata: {
          originalItem: request.originalItem,
          suggestedReplacement: request.suggestedReplacement,
          reasons: request.reasons.join(", "),
          priority: request.priority,
        },
      }),
    });
  } catch (error) {
    console.error("Error logging analytics:", error);
    // Don't throw - analytics failure shouldn't break submission
  }
}

/**
 * Save draft to IndexedDB
 */
export async function saveDraft(draft: ReplacementDraft): Promise<void> {
  const db = await getDB();
  await db.put(DRAFT_STORE, draft, "current");
}

/**
 * Load draft from IndexedDB
 */
export async function loadDraft(): Promise<ReplacementDraft | null> {
  const db = await getDB();
  const draft = await db.get(DRAFT_STORE, "current");
  return draft || null;
}

/**
 * Clear draft from IndexedDB
 */
export async function clearDraft(): Promise<void> {
  const db = await getDB();
  await db.delete(DRAFT_STORE, "current");
}

/**
 * Get recently selected items (from localStorage)
 */
export function getRecentItems(): InventoryItem[] {
  try {
    const recent = localStorage.getItem("recentReplacementItems");
    return recent ? JSON.parse(recent) : [];
  } catch {
    return [];
  }
}

/**
 * Add item to recent items
 */
export function addRecentItem(item: InventoryItem): void {
  try {
    const recent = getRecentItems();

    // Remove if already exists
    const filtered = recent.filter((i) => i.id !== item.id);

    // Add to front
    const updated = [item, ...filtered].slice(0, 5); // Keep max 5

    localStorage.setItem("recentReplacementItems", JSON.stringify(updated));
  } catch (error) {
    console.error("Error saving recent item:", error);
  }
}
