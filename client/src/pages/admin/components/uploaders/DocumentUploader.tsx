import React from "react";
import FileUploadZone from "./FileUploadZone";
import { X, FileText, MonitorPlay } from "lucide-react";

interface DocumentUploaderProps {
  label?: string;
  value: { filePath: string; fileName: string; fileSize?: number } | null;
  type: "pdf" | "ppt" | "any";
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
  isUploading?: boolean;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  label,
  value,
  type = "any",
  onUpload,
  onRemove,
  isUploading,
}) => {
  const getAcceptTypes = () => {
    if (type === "pdf") return { "application/pdf": [".pdf"] };
    if (type === "ppt")
      return {
        "application/vnd.ms-powerpoint": [".ppt"],
        "application/vnd.openxmlformats-officedocument.presentationml.presentation":
          [".pptx"],
      };
    return undefined; // Default any? Or specific?
  };

  const getIcon = () => {
    if (type === "pdf") return <FileText className="w-8 h-8 text-red-500" />;
    if (type === "ppt")
      return <MonitorPlay className="w-8 h-8 text-orange-500" />;
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  const defaultLabel =
    type === "pdf"
      ? "Upload PDF Document"
      : type === "ppt"
      ? "Upload Presentation (PPT/PPTX)"
      : "Upload Document";

  return (
    <div className="w-full space-y-3">
      <FileUploadZone
        label={label || defaultLabel}
        acceptedFileTypes={getAcceptTypes()}
        maxSize={50 * 1024 * 1024} // 50MB
        onUpload={onUpload}
        onRemove={onRemove}
        currentFile={null} // Keep dropzone visible
      />

      {isUploading && (
        <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-sm text-gray-600">Uploading document...</span>
        </div>
      )}

      {!isUploading && value && (
        <div className="relative group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all mt-2">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="p-2 bg-gray-50 rounded-lg flex-shrink-0">
              {getIcon()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-gray-900 truncate">
                {value.fileName || "Document"}
              </span>
              <a
                className="text-xs text-blue-600 truncate underline cursor-pointer hover:text-blue-800"
                href={value.filePath}
                target="_blank"
                rel="noreferrer"
              >
                View File
              </a>
            </div>
          </div>

          <button
            type="button"
            onClick={onRemove}
            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
            title="Remove File"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;
