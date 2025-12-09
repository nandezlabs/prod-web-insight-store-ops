/**
 * ReasonInput Component
 *
 * Multi-select reason chips with text area for additional details.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { REASON_OPTIONS, MAX_NOTES_LENGTH } from "../types";
import type { ReasonType } from "../types";

interface ReasonInputProps {
  selectedReasons: ReasonType[];
  additionalNotes: string;
  onReasonsChange: (reasons: ReasonType[]) => void;
  onNotesChange: (notes: string) => void;
}

export function ReasonInput({
  selectedReasons,
  additionalNotes,
  onReasonsChange,
  onNotesChange,
}: ReasonInputProps) {
  const [notesError, setNotesError] = useState("");

  const toggleReason = (reason: ReasonType) => {
    if (selectedReasons.includes(reason)) {
      onReasonsChange(selectedReasons.filter((r) => r !== reason));
    } else {
      onReasonsChange([...selectedReasons, reason]);
    }
  };

  const handleNotesChange = (value: string) => {
    if (value.length > MAX_NOTES_LENGTH) {
      setNotesError(`Maximum ${MAX_NOTES_LENGTH} characters allowed`);
      return;
    }

    setNotesError("");
    onNotesChange(value);
  };

  const isOtherSelected = selectedReasons.includes("Other");
  const showNotesError = isOtherSelected && !additionalNotes.trim();

  return (
    <div className="space-y-6">
      {/* Reason chips */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Why should this item be replaced?{" "}
          <span className="text-red-500">*</span>
        </label>

        <div className="flex flex-wrap gap-2">
          {REASON_OPTIONS.map((reason) => {
            const isSelected = selectedReasons.includes(reason);

            return (
              <motion.button
                key={reason}
                type="button"
                onClick={() => toggleReason(reason)}
                className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors min-h-[48px] ${
                  isSelected
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
                whileTap={{ scale: 0.95 }}
                aria-pressed={isSelected}
                aria-label={`${reason}${isSelected ? ", selected" : ""}`}
              >
                {isSelected && <Check className="w-4 h-4" aria-hidden="true" />}
                {reason}
              </motion.button>
            );
          })}
        </div>

        {selectedReasons.length === 0 && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            Please select at least one reason
          </p>
        )}
      </div>

      {/* Additional notes */}
      <div>
        <label
          htmlFor="additional-notes"
          className="block text-sm font-medium text-gray-900 mb-2"
        >
          Additional Details
          {isOtherSelected && <span className="text-red-500 ml-1">*</span>}
        </label>

        <textarea
          id="additional-notes"
          value={additionalNotes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder={
            isOtherSelected
              ? "Please explain the reason for replacement..."
              : "Add any additional context or details..."
          }
          rows={5}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
            showNotesError || notesError ? "border-red-500" : "border-gray-300"
          }`}
          maxLength={MAX_NOTES_LENGTH}
          aria-required={isOtherSelected}
          aria-invalid={showNotesError}
          aria-describedby="notes-counter notes-error"
        />

        <div className="mt-2 flex items-center justify-between">
          <div>
            {showNotesError && (
              <p id="notes-error" className="text-sm text-red-600" role="alert">
                Additional details are required when "Other" is selected
              </p>
            )}
            {notesError && !showNotesError && (
              <p id="notes-error" className="text-sm text-red-600" role="alert">
                {notesError}
              </p>
            )}
          </div>

          <p id="notes-counter" className="text-sm text-gray-500">
            {additionalNotes.length} / {MAX_NOTES_LENGTH}
          </p>
        </div>
      </div>
    </div>
  );
}
