import { create } from "zustand";
import { openDB, type IDBPDatabase } from "idb";
import type {
  FormData,
  FormState,
  SavedFormState,
  QueuedSubmission,
  FormSubmissionPayload,
} from "../types";
import * as formService from "../services/formService";
import { useAuthStore } from "../../auth/stores/authStore";

const DB_NAME = "forms-db";
const DB_VERSION = 1;
const FORMS_STORE = "saved-forms";
const QUEUE_STORE = "submission-queue";

const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

// Initialize IndexedDB
async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(FORMS_STORE)) {
        db.createObjectStore(FORMS_STORE, { keyPath: "formId" });
      }
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: "id" });
      }
    },
  });
}

interface FormStoreState extends FormState {
  // Actions
  loadSchema: (formId: string) => Promise<void>;
  setFieldValue: (fieldId: string, value: any) => void;
  nextSection: () => void;
  previousSection: () => void;
  goToSection: (index: number) => void;
  validateCurrentSection: () => boolean;
  validateField: (fieldId: string, value: any, field: any) => string | null;
  submitForm: () => Promise<void>;
  saveToIndexedDB: () => Promise<void>;
  loadFromIndexedDB: (formId: string) => Promise<void>;
  clearForm: () => void;
  syncQueue: () => Promise<void>;
  setOnlineStatus: (isOnline: boolean) => void;
}

export const useFormStore = create<FormStoreState>((set, get) => {
  // Auto-save timer
  let autoSaveTimer: number | null = null;

  // Online/offline listener
  const handleOnline = () => {
    set({ isOnline: true });
    get().syncQueue();
  };

  const handleOffline = () => {
    set({ isOnline: false });
  };

  // Set up listeners
  if (typeof window !== "undefined") {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
  }

  return {
    // Initial state
    schema: null,
    currentSection: 0,
    formData: {},
    validationErrors: {},
    autoSaveStatus: { status: "idle" },
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    queuedSubmissions: [],
    isSubmitting: false,

    // Load form schema
    loadSchema: async (formId: string) => {
      try {
        const sessionToken = useAuthStore.getState().sessionToken;
        if (!sessionToken) {
          throw new Error("No session token");
        }

        // Try to load saved progress first
        await get().loadFromIndexedDB(formId);

        const schema = await formService.fetchFormSchema(formId, sessionToken);
        set({ schema });

        // Start auto-save timer
        if (autoSaveTimer) {
          clearInterval(autoSaveTimer);
        }
        autoSaveTimer = setInterval(() => {
          get().saveToIndexedDB();
        }, AUTO_SAVE_INTERVAL);
      } catch (error) {
        console.error("Failed to load form schema:", error);
        throw error;
      }
    },

    // Set field value
    setFieldValue: (fieldId: string, value: any) => {
      const newValidationErrors = { ...get().validationErrors };
      delete newValidationErrors[fieldId];

      set({
        formData: {
          ...get().formData,
          [fieldId]: value,
        },
        validationErrors: newValidationErrors,
      });

      // Trigger auto-save
      get().saveToIndexedDB();
    },

    // Navigate to next section
    nextSection: () => {
      const { schema, currentSection, validateCurrentSection } = get();
      if (!schema) return;

      if (validateCurrentSection()) {
        if (currentSection < schema.sections.length - 1) {
          set({ currentSection: currentSection + 1 });
          get().saveToIndexedDB();
        }
      }
    },

    // Navigate to previous section
    previousSection: () => {
      const { currentSection } = get();
      if (currentSection > 0) {
        set({ currentSection: currentSection - 1 });
        get().saveToIndexedDB();
      }
    },

    // Go to specific section
    goToSection: (index: number) => {
      const { schema } = get();
      if (!schema) return;

      if (index >= 0 && index < schema.sections.length) {
        set({ currentSection: index });
        get().saveToIndexedDB();
      }
    },

    // Validate current section
    validateCurrentSection: () => {
      const { schema, currentSection, formData } = get();
      if (!schema) return false;

      const section = schema.sections[currentSection];
      if (!section) return false;

      const errors: Record<string, string> = {};

      // Get visible fields (considering showIf conditions)
      const visibleFields = section.fields.filter((field) => {
        if (!field.showIf) return true;
        return formData[field.showIf.field] === field.showIf.value;
      });

      // Validate each visible field
      visibleFields.forEach((field) => {
        const error = get().validateField(field.id, formData[field.id], field);
        if (error) {
          errors[field.id] = error;
        }
      });

      set({ validationErrors: errors });
      return Object.keys(errors).length === 0;
    },

    // Validate individual field
    validateField: (_fieldId: string, value: any, field: any) => {
      // Required validation
      if (
        field.required &&
        (value === undefined || value === null || value === "")
      ) {
        return "This field is required";
      }

      // Number validation
      if (
        field.type === "number" &&
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          return "Must be a valid number";
        }
        if (
          field.validation?.min !== undefined &&
          numValue < field.validation.min
        ) {
          return (
            field.validation.alert || `Must be at least ${field.validation.min}`
          );
        }
        if (
          field.validation?.max !== undefined &&
          numValue > field.validation.max
        ) {
          return (
            field.validation.alert || `Must be at most ${field.validation.max}`
          );
        }
      }

      // Text validation
      if (field.type === "text" && field.validation?.maxLength && value) {
        if (value.length > field.validation.maxLength) {
          return `Maximum ${field.validation.maxLength} characters`;
        }
      }

      return null;
    },

    // Submit form
    submitForm: async () => {
      const { schema, formData, isOnline, validateCurrentSection } = get();
      if (!schema) return;

      // Validate all sections
      let allValid = true;
      for (let i = 0; i < schema.sections.length; i++) {
        set({ currentSection: i });
        if (!validateCurrentSection()) {
          allValid = false;
          break;
        }
      }

      if (!allValid) {
        return;
      }

      set({ isSubmitting: true });

      try {
        const authState = useAuthStore.getState();
        const sessionToken = authState.sessionToken;
        const user = authState.user;

        if (!sessionToken || !user) {
          throw new Error("Not authenticated");
        }

        const payload: FormSubmissionPayload = {
          checklistTitle: `${
            schema.title
          } - ${new Date().toLocaleDateString()}`,
          type: schema.type || "General",
          taskItems: JSON.stringify(formData),
          status: "Completed",
          completedBy: user.storeId || "",
          completedDate: new Date().toISOString(),
          section: schema.section || "General",
          photoUrls: extractPhotoUrls(formData),
          signatureData: extractSignatureData(formData),
          completionPercentage: 100,
        };

        if (isOnline) {
          // Submit directly
          await formService.submitForm(payload, sessionToken);
          await formService.logFormCompletion(
            schema.formId,
            schema.title,
            user.storeId || "",
            sessionToken
          );

          // Clear form
          get().clearForm();
        } else {
          // Queue for later
          const queuedSubmission: QueuedSubmission = {
            id: `${schema.formId}-${Date.now()}`,
            formId: schema.formId,
            formTitle: schema.title,
            formType: schema.type || "General",
            formSection: schema.section || "General",
            data: formData,
            timestamp: Date.now(),
            retryCount: 0,
          };

          const db = await getDB();
          await db.add(QUEUE_STORE, queuedSubmission);

          set((state) => ({
            queuedSubmissions: [...state.queuedSubmissions, queuedSubmission],
          }));

          // Clear form
          get().clearForm();
        }
      } catch (error) {
        console.error("Failed to submit form:", error);
        throw error;
      } finally {
        set({ isSubmitting: false });
      }
    },

    // Save to IndexedDB
    saveToIndexedDB: async () => {
      const { schema, currentSection, formData } = get();
      if (!schema) return;

      set({ autoSaveStatus: { status: "saving" } });

      try {
        const savedState: SavedFormState = {
          formId: schema.formId,
          schemaTitle: schema.title,
          currentSection,
          data: formData,
          timestamp: Date.now(),
          completed: false,
        };

        const db = await getDB();
        await db.put(FORMS_STORE, savedState);

        set({
          autoSaveStatus: {
            status: "saved",
            lastSaved: new Date(),
          },
        });

        // Reset to idle after 2 seconds
        setTimeout(() => {
          set({ autoSaveStatus: { status: "idle", lastSaved: new Date() } });
        }, 2000);
      } catch (error) {
        console.error("Failed to save to IndexedDB:", error);
        set({
          autoSaveStatus: {
            status: "error",
            error: "Failed to save",
          },
        });
      }
    },

    // Load from IndexedDB
    loadFromIndexedDB: async (formId: string) => {
      try {
        const db = await getDB();
        const savedState = await db.get(FORMS_STORE, formId);

        if (savedState && !savedState.completed) {
          set({
            currentSection: savedState.currentSection,
            formData: savedState.data,
            autoSaveStatus: {
              status: "saved",
              lastSaved: new Date(savedState.timestamp),
            },
          });
        }
      } catch (error) {
        console.error("Failed to load from IndexedDB:", error);
      }
    },

    // Clear form
    clearForm: () => {
      const { schema } = get();

      if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
        autoSaveTimer = null;
      }

      // Remove from IndexedDB
      if (schema) {
        getDB().then((db) => db.delete(FORMS_STORE, schema.formId));
      }

      set({
        schema: null,
        currentSection: 0,
        formData: {},
        validationErrors: {},
        autoSaveStatus: { status: "idle" },
      });
    },

    // Sync queued submissions
    syncQueue: async () => {
      const { queuedSubmissions, isOnline } = get();
      if (!isOnline || queuedSubmissions.length === 0) return;

      const sessionToken = useAuthStore.getState().sessionToken;
      if (!sessionToken) return;

      const db = await getDB();
      const successfulIds: string[] = [];

      for (const submission of queuedSubmissions) {
        try {
          const payload: FormSubmissionPayload = {
            checklistTitle: `${submission.formTitle} - ${new Date(
              submission.timestamp
            ).toLocaleDateString()}`,
            type: submission.formType,
            taskItems: JSON.stringify(submission.data),
            status: "Completed",
            completedBy: useAuthStore.getState().user?.storeId || "",
            completedDate: new Date(submission.timestamp).toISOString(),
            section: submission.formSection,
            photoUrls: extractPhotoUrls(submission.data),
            signatureData: extractSignatureData(submission.data),
            completionPercentage: 100,
          };

          await formService.submitForm(payload, sessionToken);
          await db.delete(QUEUE_STORE, submission.id);
          successfulIds.push(submission.id);
        } catch (error) {
          console.error(`Failed to sync submission ${submission.id}:`, error);
        }
      }

      // Update state
      set((state) => ({
        queuedSubmissions: state.queuedSubmissions.filter(
          (s) => !successfulIds.includes(s.id)
        ),
      }));
    },

    // Set online status
    setOnlineStatus: (isOnline: boolean) => {
      set({ isOnline });
      if (isOnline) {
        get().syncQueue();
      }
    },
  };
});

// Helper functions
function extractPhotoUrls(formData: FormData): string[] {
  const urls: string[] = [];
  Object.values(formData).forEach((value) => {
    if (
      Array.isArray(value) &&
      value.length > 0 &&
      typeof value[0] === "string" &&
      value[0].startsWith("http")
    ) {
      urls.push(...value);
    }
  });
  return urls;
}

function extractSignatureData(formData: FormData): string | undefined {
  const signature = Object.values(formData).find(
    (value) => typeof value === "string" && value.startsWith("data:image")
  );
  return signature as string | undefined;
}
