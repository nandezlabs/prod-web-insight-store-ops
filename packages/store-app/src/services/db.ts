import { openDB, DBSchema, IDBPDatabase } from "idb";
import type { Task } from "../stores/taskStore";
import type { FormResponse } from "../types/form";
import type { SyncQueueItem } from "../features/offline/types";

interface StoreDB extends DBSchema {
  tasks: {
    key: string;
    value: Task;
  };
  formResponses: {
    key: string;
    value: FormResponse;
    indexes: { "by-form-id": string; "by-status": string };
  };
  syncQueue: {
    key: string;
    value: SyncQueueItem;
    indexes: { "by-status": string; "by-type": string };
  };
}

const DB_NAME = "store-app-db";
const DB_VERSION = 3; // Incremented for syncQueue store

let dbInstance: IDBPDatabase<StoreDB> | null = null;

async function getDB(): Promise<IDBPDatabase<StoreDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<StoreDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // Create tasks store
      if (!db.objectStoreNames.contains("tasks")) {
        db.createObjectStore("tasks", { keyPath: "id" });
      }

      // Create form responses store (v2)
      if (oldVersion < 2 && !db.objectStoreNames.contains("formResponses")) {
        const formStore = db.createObjectStore("formResponses", {
          keyPath: "id",
        });
        formStore.createIndex("by-form-id", "formId");
        formStore.createIndex("by-status", "status");
      }

      // Create sync queue store (v3)
      if (oldVersion < 3 && !db.objectStoreNames.contains("syncQueue")) {
        const syncStore = db.createObjectStore("syncQueue", {
          keyPath: "id",
        });
        syncStore.createIndex("by-status", "status");
        syncStore.createIndex("by-type", "type");
      }
    },
  });

  return dbInstance;
}

export async function saveTasksToIndexedDB(tasks: Task[]): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction("tasks", "readwrite");

    // Clear existing tasks
    await tx.store.clear();

    // Add all tasks
    await Promise.all(tasks.map((task) => tx.store.add(task)));

    await tx.done;
  } catch (error) {
    console.error("Error saving tasks to IndexedDB:", error);
  }
}

export async function loadTasksFromIndexedDB(): Promise<Task[]> {
  try {
    const db = await getDB();
    return await db.getAll("tasks");
  } catch (error) {
    console.error("Error loading tasks from IndexedDB:", error);
    return [];
  }
}

export async function clearDatabase(): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction(
      ["tasks", "formResponses", "syncQueue"],
      "readwrite"
    );
    await tx.objectStore("tasks").clear();
    await tx.objectStore("formResponses").clear();
    await tx.objectStore("syncQueue").clear();
    await tx.done;
  } catch (error) {
    console.error("Error clearing database:", error);
  }
}

// Form Response operations
export async function saveFormResponseToIndexedDB(
  response: FormResponse
): Promise<void> {
  try {
    const db = await getDB();
    await db.put("formResponses", response);
  } catch (error) {
    console.error("Error saving form response to IndexedDB:", error);
  }
}

export async function loadFormResponsesFromIndexedDB(): Promise<
  FormResponse[]
> {
  try {
    const db = await getDB();
    return await db.getAll("formResponses");
  } catch (error) {
    console.error("Error loading form responses from IndexedDB:", error);
    return [];
  }
}

export async function getFormResponseById(
  id: string
): Promise<FormResponse | undefined> {
  try {
    const db = await getDB();
    return await db.get("formResponses", id);
  } catch (error) {
    console.error("Error getting form response from IndexedDB:", error);
    return undefined;
  }
}

export async function getFormResponsesByFormId(
  formId: string
): Promise<FormResponse[]> {
  try {
    const db = await getDB();
    return await db.getAllFromIndex("formResponses", "by-form-id", formId);
  } catch (error) {
    console.error("Error getting form responses by form ID:", error);
    return [];
  }
}

export async function deleteFormResponseFromIndexedDB(
  id: string
): Promise<void> {
  try {
    const db = await getDB();
    await db.delete("formResponses", id);
  } catch (error) {
    console.error("Error deleting form response from IndexedDB:", error);
  }
}

// Sync Queue operations
export async function saveSyncQueueItemToIndexedDB(
  item: SyncQueueItem
): Promise<void> {
  try {
    const db = await getDB();
    await db.put("syncQueue", item);
  } catch (error) {
    console.error("Error saving sync queue item to IndexedDB:", error);
  }
}

export async function loadSyncQueueFromIndexedDB(): Promise<SyncQueueItem[]> {
  try {
    const db = await getDB();
    return await db.getAll("syncQueue");
  } catch (error) {
    console.error("Error loading sync queue from IndexedDB:", error);
    return [];
  }
}

export async function getSyncQueueItemById(
  id: string
): Promise<SyncQueueItem | undefined> {
  try {
    const db = await getDB();
    return await db.get("syncQueue", id);
  } catch (error) {
    console.error("Error getting sync queue item from IndexedDB:", error);
    return undefined;
  }
}

export async function getSyncQueueItemsByStatus(
  status: string
): Promise<SyncQueueItem[]> {
  try {
    const db = await getDB();
    return await db.getAllFromIndex("syncQueue", "by-status", status);
  } catch (error) {
    console.error("Error getting sync queue items by status:", error);
    return [];
  }
}

export async function getSyncQueueItemsByType(
  type: string
): Promise<SyncQueueItem[]> {
  try {
    const db = await getDB();
    return await db.getAllFromIndex("syncQueue", "by-type", type);
  } catch (error) {
    console.error("Error getting sync queue items by type:", error);
    return [];
  }
}

export async function deleteSyncQueueItemFromIndexedDB(
  id: string
): Promise<void> {
  try {
    const db = await getDB();
    await db.delete("syncQueue", id);
  } catch (error) {
    console.error("Error deleting sync queue item from IndexedDB:", error);
  }
}

export async function clearSyncQueue(): Promise<void> {
  try {
    const db = await getDB();
    await db.clear("syncQueue");
  } catch (error) {
    console.error("Error clearing sync queue:", error);
  }
}
