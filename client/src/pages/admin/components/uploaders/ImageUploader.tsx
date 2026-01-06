import React from "react";
import FileUploadZone from "./FileUploadZone";
import { X, Image as ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  label?: string;
  value: string | { filePath: string; fileName?: string } | null;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
  isUploading?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  label = "Upload Image",
  value,
  onUpload,
  onRemove,
  isUploading,
}) => {
  // Determine the image source URL
  // If value is a string, it's the URL. If object, it might have filePath or url propery.
  // We need to handle relative paths if they come from our backend (often storing 'uploads/xyz.jpg')
  const getImageUrl = () => {
    if (!value) return null;
    if (typeof value === "string") return value;
    // Prefer filePath, fallback to url, or blob if present
    return value.filePath || (value as any).url || (value as any).preview;
  };

  const imageUrl = getImageUrl();

  // Helper to ensure full URL if needed (adjust based on your API structure)
  // If the path starts with 'http' or 'data:', return as is.
  // If it's a relative path, prepend API URL or static path.
  // Assuming backend serves static files at /uploads (?) or via API.
  // For now I'll assume the inputs are usable URLs or relative to root.

  return (
    <div className="w-full space-y-3">
      <FileUploadZone
        label={label}
        acceptedFileTypes={{
          "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"],
        }}
        maxSize={5 * 1024 * 1024} // 5MB
        onUpload={onUpload}
        onRemove={onRemove}
        currentFile={null} // Always show dropzone to allow allow 'Change Image' behavior
      />

      {isUploading && (
        <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-sm text-gray-600">Uploading image...</span>
        </div>
      )}

      {!isUploading && imageUrl && (
        <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm mt-2 transition-all hover:shadow-md">
          {/* Image Preview */}
          <div className="aspect-video w-full flex items-center justify-center bg-gray-100 overflow-hidden relative">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).onerror = null; // prevent infinite loop
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/600x400?text=Image+Not+Found";
              }}
            />

            {/* Overlay for quick actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-start justify-end p-2">
              <button
                type="button"
                onClick={onRemove}
                className="p-1.5 bg-white/90 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-lg shadow-sm backdrop-blur-sm transition-all transform scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100"
                title="Remove Image"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* File Info Footer */}
          <div className="px-4 py-2 bg-white border-t flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-500 truncate flex-1">
              {typeof value === "object" ? value.fileName : "Image URL"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
