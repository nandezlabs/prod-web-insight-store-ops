import { useRef, useState } from "react";
import { Camera, X, Loader2 } from "lucide-react";

interface PhotoFieldProps {
  id: string;
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  maxPhotos?: number;
  disabled?: boolean;
  onUpload: (file: File) => Promise<string>;
}

export function PhotoField({
  id,
  label,
  value = [],
  onChange,
  error,
  maxPhotos = 5,
  disabled = false,
  onUpload,
}: PhotoFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files
        .slice(0, maxPhotos - value.length)
        .map(onUpload);
      const urls = await Promise.all(uploadPromises);
      onChange([...value, ...urls]);
    } catch (err) {
      console.error("Failed to upload photos:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  const canAddMore = value.length < maxPhotos;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-lg font-medium text-gray-900">
        {label}
        <span className="text-sm text-gray-500 ml-2">
          ({value.length} / {maxPhotos})
        </span>
      </label>

      {/* Photo grid */}
      <div className="grid grid-cols-3 gap-2">
        {value.map((url, index) => (
          <div key={index} className="relative aspect-square">
            <img
              src={url}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              disabled={disabled}
              className="
                absolute -top-2 -right-2 w-8 h-8
                bg-red-600 hover:bg-red-700 active:bg-red-800
                rounded-full flex items-center justify-center
                shadow-lg transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        ))}

        {/* Add photo button */}
        {canAddMore && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className={`
              aspect-square rounded-lg border-2 border-dashed
              flex flex-col items-center justify-center gap-2
              transition-colors
              ${error ? "border-red-500" : "border-gray-300"}
              ${
                disabled || uploading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:border-blue-500 active:bg-gray-50"
              }
            `}
          >
            {uploading ? (
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            ) : (
              <>
                <Camera className="w-8 h-8 text-gray-400" />
                <span className="text-xs text-gray-500">Add Photo</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleCapture}
        disabled={disabled}
        className="hidden"
      />

      {/* Error message */}
      {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
    </div>
  );
}
