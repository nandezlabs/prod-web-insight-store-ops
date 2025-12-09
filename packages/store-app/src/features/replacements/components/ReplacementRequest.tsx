/**
 * ReplacementRequest Component
 *
 * 5-step wizard for submitting replacement requests.
 * Step 1: Select item | Step 2: Reason | Step 3: Photos | Step 4: Suggest replacement | Step 5: Review
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Send, Edit2 } from "lucide-react";
import { Button } from "../../../components/Button";
import { ItemSearch } from "./ItemSearch";
import { ReasonInput } from "./ReasonInput";
import { PhotoCapture } from "./PhotoCapture";
import { useReplacementStore } from "../stores/replacementStore";
import { Toast } from "../../../components/Toast";
import { FORM_STEPS } from "../types";

export function ReplacementRequest() {
  const navigate = useNavigate();
  const {
    draft,
    currentStep,
    inventoryItems,
    recentItems,
    isLoading,
    isSubmitting,
    error,
    fetchInventoryItems,
    loadDraft,
    setCurrentStep,
    nextStep,
    previousStep,
    setOriginalItem,
    setSuggestedReplacement,
    setReasons,
    setAdditionalNotes,
    addPhoto,
    removePhoto,
    submitRequest,
    validateCurrentStep,
    clearError,
  } = useReplacementStore();

  // Load data and draft on mount
  useEffect(() => {
    fetchInventoryItems();
    loadDraft();
  }, [fetchInventoryItems, loadDraft]);

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep === 5) {
      handleSubmit();
    } else {
      nextStep();
    }
  };

  const handleSubmit = async () => {
    try {
      await submitRequest();

      // Show success message and navigate
      navigate("/dashboard", {
        state: { message: "Replacement request submitted successfully!" },
      });
    } catch (err) {
      // Error is handled in store
    }
  };

  const canGoNext = validateCurrentStep();
  const canGoBack = currentStep > 1 && !isSubmitting;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-xl font-bold text-gray-900 mb-4">
          Request Replacement
        </h1>

        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-900">
              Step {currentStep} of {FORM_STEPS.length}
            </span>
            <span className="text-gray-600">
              {FORM_STEPS[currentStep - 1]?.title ?? ""}
            </span>
          </div>

          <div className="flex gap-1">
            {FORM_STEPS.map((step) => (
              <div
                key={step.id}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  step.id < currentStep
                    ? "bg-green-500"
                    : step.id === currentStep
                    ? "bg-blue-500"
                    : "bg-gray-200"
                }`}
                role="progressbar"
                aria-valuenow={currentStep}
                aria-valuemin={1}
                aria-valuemax={FORM_STEPS.length}
                aria-label={`Step ${step.id}: ${step.title}`}
              />
            ))}
          </div>

          <p className="text-sm text-gray-600">
            {FORM_STEPS[currentStep - 1]?.description ?? ""}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Error message */}
        {error && (
          <div className="mb-4">
            <Toast message={error} variant="error" onClose={clearError} />
          </div>
        )}

        {/* Step 1: Select Item */}
        {currentStep === 1 && (
          <ItemSearch
            items={inventoryItems}
            recentItems={recentItems}
            selectedItem={draft.originalItem}
            onSelect={setOriginalItem}
            isLoading={isLoading}
          />
        )}

        {/* Step 2: Reason */}
        {currentStep === 2 && (
          <ReasonInput
            selectedReasons={draft.reasons}
            additionalNotes={draft.additionalNotes}
            onReasonsChange={setReasons}
            onNotesChange={setAdditionalNotes}
          />
        )}

        {/* Step 3: Photos */}
        {currentStep === 3 && (
          <div>
            <PhotoCapture
              photos={draft.photos}
              onAddPhoto={addPhoto}
              onRemovePhoto={removePhoto}
            />

            <p className="mt-4 text-sm text-gray-600 text-center">
              Photos are optional but help expedite review
            </p>
          </div>
        )}

        {/* Step 4: Suggest Replacement */}
        {currentStep === 4 && (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Optionally suggest a replacement item. This helps us find the best
              alternative.
            </p>

            <ItemSearch
              items={inventoryItems}
              recentItems={recentItems}
              selectedItem={draft.suggestedReplacement}
              onSelect={setSuggestedReplacement}
              isLoading={isLoading}
            />

            {draft.suggestedReplacement && (
              <button
                onClick={() => setSuggestedReplacement(null)}
                className="mt-4 text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Clear suggestion
              </button>
            )}
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="space-y-4">
            {/* Original Item */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Item to Replace
                </h3>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  aria-label="Edit item selection"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              </div>
              <p className="text-base font-semibold text-gray-900">
                {draft.originalItem?.name ?? "N/A"}
              </p>
              <p className="text-sm text-gray-600">
                Code: {draft.originalItem?.code ?? "N/A"}
              </p>
            </div>

            {/* Reasons */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">Reasons</h3>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  aria-label="Edit reasons"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {draft.reasons.map((reason) => (
                  <span
                    key={reason}
                    className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {reason}
                  </span>
                ))}
              </div>
              {draft.additionalNotes && (
                <p className="text-sm text-gray-900 mt-2 whitespace-pre-wrap">
                  {draft.additionalNotes}
                </p>
              )}
            </div>

            {/* Photos */}
            {draft.photos.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">
                    Photos ({draft.photos.length})
                  </h3>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    aria-label="Edit photos"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {draft.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={URL.createObjectURL(photo)}
                      alt={`Photo ${index + 1}`}
                      className="aspect-square rounded-lg object-cover"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Replacement */}
            {draft.suggestedReplacement && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">
                    Suggested Replacement
                  </h3>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    aria-label="Edit suggested replacement"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {draft.suggestedReplacement?.name ?? "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  Code: {draft.suggestedReplacement?.code ?? "N/A"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 flex gap-3">
        {canGoBack && (
          <Button
            variant="secondary"
            size="lg"
            onClick={previousStep}
            disabled={isSubmitting}
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </Button>
        )}

        <div className="flex-1">
          <Button
            variant="primary"
            size="lg"
            onClick={handleNext}
            disabled={!canGoNext || isSubmitting}
            loading={isSubmitting}
          >
            {currentStep === 5 ? (
              <>
                <Send className="w-5 h-5" />
                Submit Request
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Spacer for fixed footer */}
      <div className="h-24" />
    </div>
  );
}
