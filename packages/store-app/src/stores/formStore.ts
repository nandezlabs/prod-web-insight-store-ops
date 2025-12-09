import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FormResponse } from "../types/form";
import {
  saveFormResponseToIndexedDB,
  loadFormResponsesFromIndexedDB,
  deleteFormResponseFromIndexedDB,
} from "../services/db";

interface FormStoreState {
  responses: FormResponse[];
  syncQueue: string[]; // Form response IDs pending sync
  addResponse: (response: FormResponse) => void;
  updateResponse: (id: string, data: Partial<FormResponse>) => void;
  deleteResponse: (id: string) => void;
  addToSyncQueue: (responseId: string) => void;
  removeFromSyncQueue: (responseId: string) => void;
  loadResponses: () => Promise<void>;
  getResponseById: (id: string) => FormResponse | undefined;
  getResponsesByFormId: (formId: string) => FormResponse[];
}

export const useFormStore = create<FormStoreState>()(
  persist(
    (set, get) => ({
      responses: [],
      syncQueue: [],

      addResponse: (response) => {
        const responses = [...get().responses, response];
        set({ responses });
        saveFormResponseToIndexedDB(response);

        // Add to sync queue if not yet synced
        if (response.status !== "synced") {
          get().addToSyncQueue(response.id);
        }
      },

      updateResponse: (id, data) => {
        const responses = get().responses.map((response) =>
          response.id === id
            ? { ...response, ...data, updatedAt: new Date().toISOString() }
            : response
        );
        set({ responses });

        const updatedResponse = responses.find((r) => r.id === id);
        if (updatedResponse) {
          saveFormResponseToIndexedDB(updatedResponse);

          // Add to sync queue if status changed to submitted
          if (data.status === "submitted") {
            get().addToSyncQueue(id);
          }
        }
      },

      deleteResponse: (id) => {
        const responses = get().responses.filter(
          (response) => response.id !== id
        );
        set({ responses });
        deleteFormResponseFromIndexedDB(id);
        get().removeFromSyncQueue(id);
      },

      addToSyncQueue: (responseId) => {
        const syncQueue = get().syncQueue;
        if (!syncQueue.includes(responseId)) {
          set({ syncQueue: [...syncQueue, responseId] });
        }
      },

      removeFromSyncQueue: (responseId) => {
        set({ syncQueue: get().syncQueue.filter((id) => id !== responseId) });
      },

      loadResponses: async () => {
        const responses = await loadFormResponsesFromIndexedDB();
        if (responses.length > 0) {
          set({ responses });

          // Rebuild sync queue from unsynced responses
          const syncQueue = responses
            .filter((r) => r.status === "submitted")
            .map((r) => r.id);
          set({ syncQueue });
        }
      },

      getResponseById: (id) => {
        return get().responses.find((r) => r.id === id);
      },

      getResponsesByFormId: (formId) => {
        return get().responses.filter((r) => r.formId === formId);
      },
    }),
    {
      name: "form-storage",
    }
  )
);
