/**
 * Replacement Store
 *
 * Zustand store for managing replacement request form state.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ReplacementState, ReplacementDraft } from "../types";
import {
  fetchInventoryItems,
  fetchUserRequests,
  submitRequest,
  saveDraft as saveDraftToDb,
  loadDraft as loadDraftFromDb,
  clearDraft as clearDraftFromDb,
  getRecentItems,
  addRecentItem,
} from "../services/replacementService";
import { useAuthStore } from "../../auth/stores/authStore";

const initialDraft: ReplacementDraft = {
  currentStep: 1,
  originalItem: null,
  suggestedReplacement: null,
  reasons: [],
  additionalNotes: "",
  photoUrls: [],
  photos: [],
  priority: "Medium",
  lastSaved: new Date().toISOString(),
};

export const useReplacementStore = create<ReplacementState>()(
  persist(
    (set, get) => ({
      // Form state
      draft: initialDraft,
      currentStep: 1,

      // Data
      inventoryItems: [],
      recentItems: [],
      userRequests: [],
      selectedRequest: null,

      // UI state
      isLoading: false,
      isSubmitting: false,
      error: null,

      // Navigation
      setCurrentStep: (step) => {
        set({ currentStep: step });
        set((state) => ({
          draft: { ...state.draft, currentStep: step },
        }));
      },

      nextStep: () => {
        const { currentStep, validateCurrentStep } = get();

        if (validateCurrentStep() && currentStep < 5) {
          get().setCurrentStep(currentStep + 1);
        }
      },

      previousStep: () => {
        const { currentStep } = get();

        if (currentStep > 1) {
          get().setCurrentStep(currentStep - 1);
        }
      },

      // Draft actions
      setOriginalItem: (item) => {
        set((state) => ({
          draft: { ...state.draft, originalItem: item },
        }));

        if (item) {
          addRecentItem(item);
          set({ recentItems: getRecentItems() });
        }

        get().saveDraft();
      },

      setSuggestedReplacement: (item) => {
        set((state) => ({
          draft: { ...state.draft, suggestedReplacement: item },
        }));

        if (item) {
          addRecentItem(item);
          set({ recentItems: getRecentItems() });
        }

        get().saveDraft();
      },

      setReasons: (reasons) => {
        set((state) => ({
          draft: { ...state.draft, reasons },
        }));
        get().saveDraft();
      },

      setAdditionalNotes: (notes) => {
        set((state) => ({
          draft: { ...state.draft, additionalNotes: notes },
        }));
        get().saveDraft();
      },

      addPhoto: (file) => {
        set((state) => ({
          draft: {
            ...state.draft,
            photos: [...state.draft.photos, file],
          },
        }));
        get().saveDraft();
      },

      removePhoto: (index) => {
        set((state) => ({
          draft: {
            ...state.draft,
            photos: state.draft.photos.filter((_, i) => i !== index),
            photoUrls: state.draft.photoUrls.filter((_, i) => i !== index),
          },
        }));
        get().saveDraft();
      },

      setPriority: (priority) => {
        set((state) => ({
          draft: { ...state.draft, priority },
        }));
        get().saveDraft();
      },

      // Data actions
      fetchInventoryItems: async () => {
        set({ isLoading: true, error: null });

        try {
          const items = await fetchInventoryItems();
          set({
            inventoryItems: items,
            recentItems: getRecentItems(),
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to load inventory items",
            isLoading: false,
          });
        }
      },

      fetchUserRequests: async () => {
        const user = useAuthStore.getState().user;
        if (!user || !user.storeId) return;

        set({ isLoading: true, error: null });

        try {
          const requests = await fetchUserRequests(user.storeId);
          set({
            userRequests: requests,
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to load requests",
            isLoading: false,
          });
        }
      },

      submitRequest: async () => {
        const { draft, validateCurrentStep } = get();
        const user = useAuthStore.getState().user;

        if (!user) {
          set({ error: "User not authenticated" });
          return;
        }

        if (!validateCurrentStep()) {
          set({ error: "Please complete all required fields" });
          return;
        }

        if (!draft.originalItem) {
          set({ error: "Please select an item to replace" });
          return;
        }

        set({ isSubmitting: true, error: null });

        try {
          const request = {
            originalItem: draft.originalItem.name,
            originalItemId: draft.originalItem.id,
            suggestedReplacement: draft.suggestedReplacement?.name || "",
            suggestedReplacementId: draft.suggestedReplacement?.id || "",
            reasons: draft.reasons,
            additionalNotes: draft.additionalNotes,
            photoUrls: draft.photoUrls,
            priority: draft.priority,
            requestedBy: user.storeId || "",
            requestedByName: user.storeName || "",
          };

          await submitRequest(request, draft.photos);

          // Clear draft and reset
          await get().clearDraft();
          set({
            draft: initialDraft,
            currentStep: 1,
            isSubmitting: false,
          });

          // Refresh user requests
          await get().fetchUserRequests();
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to submit request",
            isSubmitting: false,
          });
        }
      },

      // Draft persistence
      saveDraft: () => {
        const { draft } = get();
        const updatedDraft = {
          ...draft,
          lastSaved: new Date().toISOString(),
        };

        set({ draft: updatedDraft });
        saveDraftToDb(updatedDraft);
      },

      loadDraft: async () => {
        const draft = await loadDraftFromDb();

        if (draft) {
          set({
            draft,
            currentStep: draft.currentStep,
            recentItems: getRecentItems(),
          });
        }
      },

      clearDraft: async () => {
        await clearDraftFromDb();
        set({
          draft: initialDraft,
          currentStep: 1,
        });
      },

      // Validation
      validateCurrentStep: () => {
        const { currentStep, draft } = get();

        switch (currentStep) {
          case 1: // Select item
            return draft.originalItem !== null;

          case 2: // Reason
            if (draft.reasons.length === 0) return false;
            if (
              draft.reasons.includes("Other") &&
              !draft.additionalNotes.trim()
            ) {
              return false;
            }
            return true;

          case 3: // Photos (optional)
            return true;

          case 4: // Suggested replacement (optional)
            return true;

          case 5: // Review
            return draft.originalItem !== null && draft.reasons.length > 0;

          default:
            return false;
        }
      },

      // Utility
      clearError: () => {
        set({ error: null });
      },

      selectRequest: (request) => {
        set({ selectedRequest: request });
      },
    }),
    {
      name: "replacement-store",
      partialize: (state) => ({
        // Don't persist draft (use IndexedDB instead)
        recentItems: state.recentItems,
      }),
    }
  )
);
