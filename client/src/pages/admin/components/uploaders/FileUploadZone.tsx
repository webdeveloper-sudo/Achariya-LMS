import React, { useCallback } from "react";
import { useDropzone, Accept } from "react-dropzone";
import {
  Upload,
  X,
  File,
  FileText,
  Music,
  Video,
  Image as ImageIcon,
} from "lucide-react";

interface FileUploadZoneProps {
  acceptedFileTypes?: Accept;
  maxSize: number;
  onUpload: (file: File) => void;
  onRemove?: () => void;
  currentFile?: {
    name?: string;
    fileName?: string;
    fileSize?: number;
    type?: string;
    mimeType?: string;
    [key: string]: any;
  } | null;
  label?: string;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  acceptedFileTypes,
  maxSize,
  onUpload,
  onRemove,
  currentFile,
  label,
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles?.length > 0) {
        onUpload(acceptedFiles[0]);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: acceptedFileTypes,
      maxSize: maxSize, // in bytes
      multiple: false,
    });

  const getIcon = (type?: string) => {
    if (!type) return <File className="w-8 h-8 text-gray-400" />;
    if (type.includes("pdf"))
      return <FileText className="w-8 h-8 text-red-500" />;
    if (type.includes("presentation") || type.includes("powerpoint"))
      return <FileText className="w-8 h-8 text-orange-500" />;
    if (type.includes("audio"))
      return <Music className="w-8 h-8 text-purple-500" />;
    if (type.includes("video"))
      return <Video className="w-8 h-8 text-blue-500" />;
    if (type.includes("image"))
      return <ImageIcon className="w-8 h-8 text-green-500" />;
    return <File className="w-8 h-8 text-gray-500" />;
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {currentFile ? (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center gap-3">
            {getIcon(currentFile.mimeType || currentFile.type || "")}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                {currentFile.fileName || currentFile.name}
              </span>
              <span className="text-xs text-gray-500">
                {currentFile.fileSize
                  ? (currentFile.fileSize / 1024 / 1024).toFixed(2) + " MB"
                  : ""}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRemove}
              className="p-1 hover:bg-gray-200 rounded-full text-gray-500 hover:text-red-500 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors
                        ${
                          isDragActive
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                        }
                    `}
        >
          <input {...getInputProps()} />
          <Upload
            className={`w-8 h-8 mb-2 ${
              isDragActive ? "text-blue-500" : "text-gray-400"
            }`}
          />
          <p className="text-sm text-gray-600 font-medium">
            {isDragActive ? "Drop file here" : "Drag & drop or click to upload"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Max {maxSize / 1024 / 1024}MB
          </p>
          {fileRejections.length > 0 && (
            <p className="text-xs text-red-500 mt-2">
              File too large or invalid type
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;
