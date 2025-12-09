// Sync Service - Handles auto-sync logic and retry mechanism
// CONTEXT: Process offline queue when online, retry with exponential backoff

import { useSyncStore } from "../stores/syncStore";
import type { SyncQueueItem, SyncResult } from "../types";
import { api } from "../../../services/api";

// Retry configuration
const MAX_ATTEMPTS = 5;
const RETRY_DELAYS = [5000, 15000, 30000, 60000, 120000]; // ms
const AUTO_RETRY_INTERVAL = 30000; // 30 seconds

let syncInterval: number | null = null;
let isSyncInProgress = false;

// Toast notification helper (can be replaced with actual toast implementation)
const showToast = {
  success: (message: string) => console.log("✅", message),
  error: (message: string) => console.error("❌", message),
};

/**
 * Start the sync process
 */
export async function startSync(): Promise<void> {
  const store = useSyncStore.getState();

  if (!store.isOnline || store.isSyncing || isSyncInProgress) {
    return;
  }

  const pendingItems = store.queue.filter(
    (item) => item.status === "pending" || item.status === "failed"
  );

  if (pendingItems.length === 0) {
    return;
  }

  isSyncInProgress = true;
  store.setSyncing(true);

  try {
    // Process items in FIFO order
    for (const item of pendingItems) {
      // Skip if max attempts reached
      if (item.attempts >= MAX_ATTEMPTS) {
        store.updateItemStatus(
          item.id,
          "failed",
          `Maximum retry attempts (${MAX_ATTEMPTS}) reached`
        );
        continue;
      }

      // Check if we should retry based on exponential backoff
      if (item.lastAttempt && item.attempts > 0) {
        const delay =
          RETRY_DELAYS[Math.min(item.attempts - 1, RETRY_DELAYS.length - 1)];
        const timeSinceLastAttempt = Date.now() - item.lastAttempt;

        if (delay && timeSinceLastAttempt < delay) {
          continue; // Not time to retry yet
        }
      }

      await syncItem(item);
    }
  } finally {
    isSyncInProgress = false;
    store.setSyncing(false);
  }
}

/**
 * Sync a single item
 */
async function syncItem(item: SyncQueueItem): Promise<SyncResult> {
  const store = useSyncStore.getState();

  // Update status to syncing
  store.updateItemStatus(item.id, "syncing");
  store.incrementAttempts(item.id);

  try {
    let result: SyncResult;

    switch (item.type) {
      case "checklist":
        result = await syncChecklist(item);
        break;
      case "replacement":
        result = await syncReplacement(item);
        break;
      case "photo":
        result = await syncPhoto(item);
        break;
      default:
        result = {
          success: false,
          itemId: item.id,
          error: `Unknown sync type: ${item.type}`,
        };
    }

    if (result.success) {
      store.updateItemStatus(item.id, "synced");
      store.removeFromQueue(item.id);
      showToast.success(`${capitalizeType(item.type)} synced successfully`);
    } else {
      handleSyncError(item, result.error || "Unknown error");
    }

    return result;
  } catch (error: any) {
    const errorMessage = error.message || "Sync failed";
    handleSyncError(item, errorMessage);

    return {
      success: false,
      itemId: item.id,
      error: errorMessage,
    };
  }
}

/**
 * Sync a checklist item
 */
async function syncChecklist(item: SyncQueueItem): Promise<SyncResult> {
  try {
    const { data } = item;

    // 1. Upload photos first if any
    let photoUrls: string[] = [];
    if (data.photos && data.photos.length > 0) {
      photoUrls = await uploadPhotos(data.photos);
    }

    // 2. Create checklist page in Notion
    const checklistData = {
      ...data,
      photoUrls,
    };

    const response = await api.post<{ id: string }>(
      "/checklists",
      checklistData
    );

    // 3. Log to analytics (if needed)
    if (response.data?.id) {
      await api.post("/analytics/log", {
        event: "checklist_submitted",
        checklistId: response.data.id,
        timestamp: Date.now(),
      });
    }

    return {
      success: true,
      itemId: item.id,
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

/**
 * Sync a replacement item
 */
async function syncReplacement(item: SyncQueueItem): Promise<SyncResult> {
  try {
    const { data } = item;

    // 1. Upload photos if any
    let photoUrls: string[] = [];
    if (data.photos && data.photos.length > 0) {
      photoUrls = await uploadPhotos(data.photos);
    }

    // 2. Create replacement page
    const replacementData = {
      ...data,
      photoUrls,
    };

    const response = await api.post<{ id: string }>(
      "/replacements",
      replacementData
    );

    // 3. Log event
    if (response.data?.id) {
      await api.post("/analytics/log", {
        event: "replacement_created",
        replacementId: response.data.id,
        timestamp: Date.now(),
      });
    }

    return {
      success: true,
      itemId: item.id,
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

/**
 * Sync a photo item
 */
async function syncPhoto(item: SyncQueueItem): Promise<SyncResult> {
  try {
    const { data } = item;

    // Upload photo to storage
    const url = await uploadSinglePhoto(data.photo);

    // Update parent record with photo URL
    if (data.parentType && data.parentId) {
      await api.put(`/${data.parentType}/${data.parentId}`, {
        photoUrl: url,
      });
    }

    return {
      success: true,
      itemId: item.id,
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

/**
 * Upload multiple photos
 */
async function uploadPhotos(photos: File[] | string[]): Promise<string[]> {
  const uploadPromises = photos.map((photo) => uploadSinglePhoto(photo));
  return await Promise.all(uploadPromises);
}

/**
 * Upload a single photo
 */
async function uploadSinglePhoto(photo: File | string): Promise<string> {
  const formData = new FormData();

  if (typeof photo === "string") {
    // Convert base64 to blob if needed
    const blob = await fetch(photo).then((r) => r.blob());
    formData.append("photo", blob);
  } else {
    formData.append("photo", photo);
  }

  // Note: This needs a custom fetch call since api.post doesn't support FormData options
  const response = await fetch(
    `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = (await response.json()) as { url: string };
  return data.url;
}

/**
 * Handle sync errors with appropriate actions
 */
function handleSyncError(item: SyncQueueItem, errorMessage: string): void {
  const store = useSyncStore.getState();

  // Check error type and handle accordingly
  if (errorMessage.includes("auth") || errorMessage.includes("unauthorized")) {
    // Auth error - force re-login
    store.updateItemStatus(
      item.id,
      "failed",
      "Authentication required. Please log in again."
    );
    showToast.error("Session expired. Please log in again.");
    // Trigger logout
    window.location.href = "/login";
  } else if (errorMessage.includes("quota") || errorMessage.includes("limit")) {
    // Quota error - pause sync
    store.updateItemStatus(item.id, "failed", errorMessage);
    showToast.error("Storage quota exceeded. Please free up space.");
  } else if (errorMessage.includes("validation")) {
    // Validation error - mark as failed, user needs to fix
    store.updateItemStatus(item.id, "failed", errorMessage);
    showToast.error("Validation error. Please check the data and try again.");
  } else if (errorMessage.includes("conflict")) {
    // Conflict - add to conflict resolver
    store.updateItemStatus(item.id, "failed", errorMessage);
    // Conflict resolution would be handled separately
  } else {
    // Network or server error - retry automatically
    store.updateItemStatus(item.id, "failed", errorMessage);

    if (item.attempts < MAX_ATTEMPTS) {
      const attemptIndex = Math.min(item.attempts, RETRY_DELAYS.length - 1);
      const nextDelay = RETRY_DELAYS[attemptIndex];
      if (nextDelay) {
        showToast.error(
          `Sync failed. Retrying in ${Math.round(nextDelay / 1000)}s...`
        );
      }
    } else {
      showToast.error("Sync failed after maximum retries.");
    }
  }
}

/**
 * Retry a specific failed item
 */
export async function retryItem(itemId: string): Promise<void> {
  const store = useSyncStore.getState();
  const item = store.queue.find((i) => i.id === itemId);

  if (!item) {
    return;
  }

  // Reset attempts and status
  store.updateItemStatus(itemId, "pending");

  // Trigger sync
  await startSync();
}

/**
 * Start automatic retry interval
 */
export function startAutoRetry(): void {
  if (syncInterval) {
    return;
  }

  syncInterval = setInterval(() => {
    const store = useSyncStore.getState();

    if (store.isOnline && !store.isSyncing) {
      const failedItems = store.getFailedItems();

      if (failedItems.length > 0) {
        startSync();
      }
    }
  }, AUTO_RETRY_INTERVAL);
}

/**
 * Stop automatic retry interval
 */
export function stopAutoRetry(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

/**
 * Utility function to capitalize type
 */
function capitalizeType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

// Start auto-retry on module load
if (typeof window !== "undefined") {
  startAutoRetry();
}
