import React, { useRef, useEffect } from "react";
import FileUploadZone from "./FileUploadZone";
import { X, Music } from "lucide-react";

interface AudioUploaderProps {
  label?: string;
  value: { filePath: string; fileName: string; duration?: string } | null;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
  isUploading?: boolean;
}

const AudioUploader: React.FC<AudioUploaderProps> = ({
  label = "Upload Audio",
  value,
  onUpload,
  onRemove,
  isUploading,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (value && audioRef.current) {
      audioRef.current.src = value.filePath;
      audioRef.current.load(); // Reload audio to ensure source update
    }
  }, [value]);

  return (
    <div className="w-full space-y-3">
      <FileUploadZone
        label={label}
        acceptedFileTypes={{ "audio/*": [".mp3", ".wav", ".m4a"] }}
        maxSize={100 * 1024 * 1024} // 100MB
        onUpload={onUpload}
        onRemove={onRemove}
        currentFile={null}
      />

      {isUploading && (
        <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-sm text-gray-600">Uploading audio...</span>
        </div>
      )}

      {!isUploading && value && (
        <div className="bg-white border text-gray-800 border-gray-200 rounded-xl p-4 shadow-sm mt-2 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <Music className="w-6 h-6" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate max-w-[200px]">
                  {value.fileName || "Audio File"}
                </span>
                {/* Duration might not be known until loaded */}
              </div>
            </div>

            <button
              type="button"
              onClick={onRemove}
              className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <audio
            ref={audioRef}
            controls
            preload="metadata"
            className="w-full"
            src={value.filePath}
            onError={(e) => console.error("Audio playback error", e)}
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
};

export default AudioUploader;
