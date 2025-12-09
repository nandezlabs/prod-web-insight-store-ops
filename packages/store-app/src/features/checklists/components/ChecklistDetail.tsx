/**
 * ChecklistDetail Component
 *
 * Full-screen modal displaying complete checklist details.
 * Shows all task items, photos, signature, and export options.
 */

import {
  X,
  Share2,
  CheckCircle,
  Circle,
  Calendar,
  User,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../components/Button";
import { PhotoGallery } from "./PhotoGallery";
import { SignatureDisplay } from "./SignatureDisplay";
import { formatDateFull } from "../../../utils/helpers";
import type { Checklist, GalleryPhoto } from "../types";
import { exportToPDF } from "../services/checklistService";

interface ChecklistDetailProps {
  checklist: Checklist | null;
  onClose: () => void;
}

/**
 * Get badge color for checklist type
 */
function getTypeBadgeColor(type: Checklist["type"]): string {
  switch (type) {
    case "Opening":
      return "bg-blue-100 text-blue-700";
    case "Daily":
      return "bg-green-100 text-green-700";
    case "Weekly":
      return "bg-purple-100 text-purple-700";
    case "Period":
      return "bg-orange-100 text-orange-700";
    case "Custom":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

/**
 * Group task items by section (if they have a section property)
 * For now, we'll just display them in a single list
 */
export function ChecklistDetail({ checklist, onClose }: ChecklistDetailProps) {
  if (!checklist) return null;

  const handleShare = async () => {
    try {
      await exportToPDF(checklist);
    } catch (error) {
      console.error("Failed to export checklist:", error);
    }
  };

  // Convert photo URLs to GalleryPhoto format
  const galleryPhotos: GalleryPhoto[] = checklist.photoUrls.map(
    (url, index) => ({
      id: `${checklist.id}-photo-${index}`,
      url,
    })
  );

  // Get photos from task items
  const taskPhotos = checklist.taskItems
    .filter((item) => item.type === "photo" && Array.isArray(item.value))
    .flatMap((item, itemIndex) =>
      (item.value as string[]).map((url, photoIndex) => ({
        id: `${checklist.id}-task-${itemIndex}-photo-${photoIndex}`,
        url,
        caption: item.label,
      }))
    );

  const allPhotos = [...galleryPhotos, ...taskPhotos];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="min-h-screen bg-white"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-labelledby="checklist-detail-title"
          aria-modal="true"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 z-10">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${getTypeBadgeColor(
                    checklist.type
                  )}`}
                >
                  {checklist.type}
                </span>
                <h2
                  id="checklist-detail-title"
                  className="text-xl font-bold text-gray-900"
                >
                  {checklist.title}
                </h2>
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close details"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Metadata */}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" aria-hidden="true" />
                <span className="sr-only">Completed on </span>
                <span>{formatDateFull(checklist.completedDate)}</span>
              </div>

              <div className="flex items-center gap-2">
                <User className="w-4 h-4" aria-hidden="true" />
                <span className="sr-only">Completed by </span>
                <span>{checklist.completedBy}</span>
              </div>

              {checklist.dueDate && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  <span className="sr-only">Due date </span>
                  <span>Due: {formatDateFull(checklist.dueDate)}</span>
                </div>
              )}
            </div>

            {/* Share button */}
            <div className="mt-4">
              <Button variant="secondary" size="md" onClick={handleShare}>
                <Share2 className="w-5 h-5" />
                Export to PDF
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-6 space-y-8">
            {/* Task Items */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tasks
              </h3>
              <div className="space-y-4">
                {checklist.taskItems.map((task) => (
                  <div key={task.id} className="bg-gray-50 rounded-lg p-4">
                    {/* Checkbox items */}
                    {task.type === "checkbox" && (
                      <div className="flex items-start gap-3">
                        {task.completed ? (
                          <CheckCircle
                            className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                            aria-label="Completed"
                          />
                        ) : (
                          <Circle
                            className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
                            aria-label="Not completed"
                          />
                        )}
                        <span
                          className={`flex-1 ${
                            task.completed ? "text-gray-900" : "text-gray-500"
                          }`}
                        >
                          {task.label}
                        </span>
                      </div>
                    )}

                    {/* Text items */}
                    {task.type === "text" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {task.label}
                        </label>
                        <p className="text-gray-900">
                          {task.value || (
                            <span className="text-gray-400 italic">
                              No response
                            </span>
                          )}
                        </p>
                      </div>
                    )}

                    {/* Number items */}
                    {task.type === "number" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {task.label}
                        </label>
                        <p className="text-gray-900">
                          {task.value !== null && task.value !== undefined ? (
                            task.value
                          ) : (
                            <span className="text-gray-400 italic">
                              No value
                            </span>
                          )}
                        </p>
                        {task.validationError && (
                          <p className="text-red-600 text-sm mt-1">
                            {task.validationError}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Time items */}
                    {task.type === "time" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {task.label}
                        </label>
                        <p className="text-gray-900">
                          {task.value || (
                            <span className="text-gray-400 italic">
                              No time set
                            </span>
                          )}
                        </p>
                      </div>
                    )}

                    {/* Photo items - displayed in photo gallery below */}
                    {task.type === "photo" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {task.label}
                        </label>
                        <p className="text-gray-500 text-sm">
                          {Array.isArray(task.value)
                            ? `${task.value.length} photo(s)`
                            : "No photos"}
                        </p>
                      </div>
                    )}

                    {/* Signature items - displayed below */}
                    {task.type === "signature" && task.value && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {task.label}
                        </label>
                        <p className="text-gray-500 text-sm mb-2">
                          Signature provided
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Notes */}
            {checklist.notes && (
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Notes
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {checklist.notes}
                  </p>
                </div>
              </section>
            )}

            {/* Photos */}
            {allPhotos.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Photos ({allPhotos.length})
                </h3>
                <PhotoGallery photos={allPhotos} columns={3} />
              </section>
            )}

            {/* Signature */}
            {checklist.signatureData && (
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Signature
                </h3>
                <SignatureDisplay
                  signatureData={checklist.signatureData}
                  showDownload
                />
              </section>
            )}

            {/* Completion Summary */}
            <section className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  Overall Completion
                </span>
                <span className="text-lg font-bold text-blue-900">
                  {Math.round(checklist.completionPercentage)}%
                </span>
              </div>
              <div className="mt-2 w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600"
                  style={{ width: `${checklist.completionPercentage}%` }}
                  role="progressbar"
                  aria-valuenow={checklist.completionPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Overall completion progress"
                />
              </div>
            </section>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
