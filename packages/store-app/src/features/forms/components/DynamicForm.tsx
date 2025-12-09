import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, AlertCircle } from "lucide-react";
import { useFormStore } from "../stores/formStore";
import {
  ProgressIndicator,
  AutoSaveIndicator,
  OnlineStatusIndicator,
  FormField,
} from "./ui";
import { uploadPhoto } from "../services/formService";
import { useAuthStore } from "../../auth/stores/authStore";

interface DynamicFormProps {
  formId: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

export function DynamicForm({
  formId,
  onComplete,
  onCancel,
}: DynamicFormProps) {
  const sessionToken = useAuthStore((state) => state.sessionToken);

  const {
    schema,
    currentSection,
    formData,
    validationErrors,
    autoSaveStatus,
    isOnline,
    queuedSubmissions,
    isSubmitting,
    loadSchema,
    setFieldValue,
    nextSection,
    previousSection,
    submitForm,
    clearForm,
  } = useFormStore();

  // Load schema on mount
  useEffect(() => {
    loadSchema(formId);

    return () => {
      clearForm();
    };
  }, [formId]);

  // Handle photo upload
  const handlePhotoUpload = async (file: File): Promise<string> => {
    if (!sessionToken) {
      throw new Error("No session token");
    }
    return uploadPhoto(file, sessionToken);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      await submitForm();
      onComplete?.();
    } catch (error) {
      console.error("Failed to submit form:", error);
    }
  };

  if (!schema) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  const section = schema.sections[currentSection];
  if (!section) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Section not found</p>
      </div>
    );
  }

  const isFirstSection = currentSection === 0;
  const isLastSection = currentSection === schema.sections.length - 1;

  // Get visible fields (considering showIf conditions)
  const visibleFields = section.fields.filter((field) => {
    if (!field.showIf) return true;
    return formData[field.showIf.field] === field.showIf.value;
  });

  // Get section errors
  const sectionErrors = Object.keys(validationErrors).filter((fieldId) =>
    visibleFields.some((f) => f.id === fieldId)
  );
  const hasErrors = sectionErrors.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
          {/* Form title */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{schema.title}</h1>
            {onCancel && (
              <button
                onClick={onCancel}
                className="text-gray-600 hover:text-gray-900 px-4 py-2"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Progress */}
          <ProgressIndicator
            currentSection={currentSection}
            totalSections={schema.sections.length}
            sectionTitle={section.title}
          />

          {/* Status indicators */}
          <div className="flex items-center justify-between">
            <AutoSaveIndicator status={autoSaveStatus} />
            <OnlineStatusIndicator
              isOnline={isOnline}
              queuedCount={queuedSubmissions.length}
            />
          </div>
        </div>
      </div>

      {/* Form content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Section description */}
            {section.description && (
              <p className="text-gray-600">{section.description}</p>
            )}

            {/* Validation errors summary */}
            {hasErrors && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-900 mb-1">
                      Please fix the following errors:
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                      {sectionErrors.map((fieldId) => {
                        const field = visibleFields.find(
                          (f) => f.id === fieldId
                        );
                        return (
                          <li key={fieldId}>
                            {field?.label}: {validationErrors[fieldId]}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Fields */}
            <div className="space-y-6">
              {visibleFields.map((field) => (
                <FormField
                  key={field.id}
                  field={field}
                  value={formData[field.id]}
                  onChange={(value) => setFieldValue(field.id, value)}
                  error={validationErrors[field.id]}
                  disabled={isSubmitting}
                  onPhotoUpload={handlePhotoUpload}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons - fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            {/* Previous button */}
            {!isFirstSection && (
              <button
                onClick={previousSection}
                disabled={isSubmitting}
                className="
                  flex items-center justify-center gap-2
                  px-6 py-4 min-h-[64px]
                  bg-gray-200 hover:bg-gray-300 active:bg-gray-400
                  text-gray-900 font-medium rounded-lg
                  transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>
            )}

            {/* Next/Submit button */}
            <button
              onClick={isLastSection ? handleSubmit : nextSection}
              disabled={isSubmitting}
              className="
                flex-1 flex items-center justify-center gap-2
                px-6 py-4 min-h-[64px]
                bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                text-white font-medium rounded-lg
                transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Submitting...
                </>
              ) : isLastSection ? (
                <>
                  <Check className="w-5 h-5" />
                  Submit
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
