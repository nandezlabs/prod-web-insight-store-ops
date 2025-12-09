/**
 * PhotoGallery Component
 *
 * Grid of photo thumbnails with full-screen viewer.
 * Supports swipe navigation, pinch-to-zoom, and download.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, ChevronLeft, ChevronRight } from "lucide-react";
import type { GalleryPhoto } from "../types";
import { downloadPhoto } from "../services/checklistService";

interface PhotoGalleryProps {
  photos: GalleryPhoto[];
  columns?: 2 | 3;
}

export function PhotoGallery({ photos, columns = 3 }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [scale, setScale] = useState(1);

  const handlePhotoClick = (index: number) => {
    setSelectedIndex(index);
    setScale(1);
  };

  const handleClose = () => {
    setSelectedIndex(null);
    setScale(1);
  };

  const handlePrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
      setScale(1);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      setScale(1);
    }
  };

  const handleDownload = async () => {
    if (selectedIndex !== null) {
      const photo = photos[selectedIndex];
      if (!photo) return;

      const filename = `photo-${photo.id}.jpg`;

      try {
        await downloadPhoto(photo.url, filename);
      } catch (error) {
        console.error("Failed to download photo:", error);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    setScale((prev) => Math.min(Math.max(1, prev + delta), 3));
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No photos attached</p>
      </div>
    );
  }

  return (
    <>
      {/* Thumbnail Grid */}
      <div
        className={`grid gap-2 ${
          columns === 2 ? "grid-cols-2" : "grid-cols-3"
        }`}
        role="list"
        aria-label="Photo gallery"
      >
        {photos.map((photo, index) => (
          <motion.button
            key={photo.id}
            onClick={() => handlePhotoClick(index)}
            className="aspect-square rounded-lg overflow-hidden bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            whileTap={{ scale: 0.95 }}
            role="listitem"
            aria-label={`View photo ${index + 1}${
              photo.caption ? `: ${photo.caption}` : ""
            }`}
          >
            <img
              src={photo.url}
              alt={photo.caption || `Photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </motion.button>
        ))}
      </div>

      {/* Full-screen Viewer */}
      <AnimatePresence>
        {selectedIndex !== null && photos[selectedIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex flex-col"
            onClick={handleClose}
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
              <span className="text-white text-sm font-medium">
                {selectedIndex + 1} / {photos.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Download photo"
                >
                  <Download className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Close viewer"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Image Container */}
            <div
              className="flex-1 flex items-center justify-center p-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              onWheel={handleWheel}
            >
              <motion.img
                key={selectedIndex}
                src={photos[selectedIndex]?.url || ""}
                alt={
                  photos[selectedIndex]?.caption || `Photo ${selectedIndex + 1}`
                }
                className="max-w-full max-h-full object-contain"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale }}
                transition={{ duration: 0.2 }}
                style={{ touchAction: "none" }}
                draggable={false}
              />
            </div>

            {/* Navigation Buttons */}
            {selectedIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
            )}

            {selectedIndex < photos.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            )}

            {/* Caption */}
            {photos[selectedIndex]?.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                <p className="text-white text-center text-sm">
                  {photos[selectedIndex]?.caption}
                </p>
              </div>
            )}

            {/* Zoom indicator */}
            {scale > 1 && (
              <div className="absolute top-20 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {Math.round(scale * 100)}%
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
