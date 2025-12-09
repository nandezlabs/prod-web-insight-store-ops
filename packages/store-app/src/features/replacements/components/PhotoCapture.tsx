/**
 * PhotoCapture Component
 *
 * Camera access with photo preview, retake, and compression.
 * Supports up to 3 photos with fallback to file upload.
 */

import { useRef, useState } from "react";
import { Camera, X, Upload } from "lucide-react";
import { Button } from "../../../components/Button";
import { MAX_PHOTOS, MAX_FILE_SIZE } from "../types";

interface PhotoCaptureProps {
  photos: File[];
  onAddPhoto: (file: File) => void;
  onRemovePhoto: (index: number) => void;
}

export function PhotoCapture({
  photos,
  onAddPhoto,
  onRemovePhoto,
}: PhotoCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    setError("");

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      return;
    }

    // Check max photos
    if (photos.length >= MAX_PHOTOS) {
      setError(`Maximum ${MAX_PHOTOS} photos allowed`);
      return;
    }

    onAddPhoto(file);
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const canAddMore = photos.length < MAX_PHOTOS;

  return (
    <div className="space-y-4">
      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
            >
              <img
                src={URL.createObjectURL(photo)}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />

              <button
                onClick={() => onRemovePhoto(index)}
                className="absolute top-1 right-1 p-1.5 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                aria-label={`Remove photo ${index + 1}`}
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      {canAddMore && (
        <div className="space-y-3">
          {/* Camera button (mobile) */}
          <Button variant="secondary" size="lg" onClick={handleCameraClick}>
            <Camera className="w-5 h-5" />
            Take Photo ({photos.length}/{MAX_PHOTOS})
          </Button>

          {/* Upload button (fallback) */}
          <Button variant="secondary" size="lg" onClick={handleUploadClick}>
            <Upload className="w-5 h-5" />
            Upload Photo ({photos.length}/{MAX_PHOTOS})
          </Button>

          {/* Hidden file inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            className="hidden"
            aria-label="Capture photo with camera"
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            className="hidden"
            aria-label="Upload photo from device"
          />
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          className="p-3 bg-red-50 border border-red-200 rounded-lg"
          role="alert"
        >
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Max photos reached */}
      {!canAddMore && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Maximum of {MAX_PHOTOS} photos reached. Remove a photo to add
            another.
          </p>
        </div>
      )}

      {/* Helper text */}
      {photos.length === 0 && (
        <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Camera
            className="w-12 h-12 text-gray-400 mx-auto mb-3"
            aria-hidden="true"
          />
          <p className="text-sm text-gray-600 mb-1">
            Take photos to support your request
          </p>
          <p className="text-xs text-gray-500">
            Optional • Up to {MAX_PHOTOS} photos • Max{" "}
            {MAX_FILE_SIZE / 1024 / 1024}MB each
          </p>
        </div>
      )}
    </div>
  );
}
