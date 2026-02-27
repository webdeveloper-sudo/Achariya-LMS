import React, { useState, useEffect } from "react";
import { CheckCircle, Loader2, Sparkles, X } from "lucide-react";

interface SocialShareToastProps {
  isVisible: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
}

const SocialShareToast: React.FC<SocialShareToastProps> = ({
  isVisible,
  message,
  onClose,
  duration = 4000,
}) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"uploading" | "completed">("uploading");

  useEffect(() => {
    if (isVisible) {
      setProgress(0);
      setStatus("uploading");

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setStatus("completed");
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 300);

      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-8 right-8 z-[200] w-full max-w-[320px] animate-in slide-in-from-right-10 duration-500">
      <div className="bg-white rounded-[1.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl text-white transition-colors duration-500 ${status === "completed" ? "bg-emerald-500" : "bg-blue-600"}`}
              >
                {status === "completed" ? (
                  <CheckCircle size={16} />
                ) : (
                  <Loader2 size={16} className="animate-spin" />
                )}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {status === "completed" ? "Success" : "Publishing"}
                </p>
                <p className="text-sm font-black italic text-gray-900 leading-none">
                  {message}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-gray-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="relative h-1.5 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
            <div
              className={`h-full transition-all duration-500 ease-out rounded-full ${
                status === "completed" ? "bg-emerald-500" : "bg-blue-600"
              }`}
              style={{ width: `${progress}%` }}
            />
            {status !== "completed" && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">
              {status === "completed"
                ? "Shared to Network"
                : "Uploading Media..."}
            </span>
            <span className="text-[8px] font-black text-blue-600">
              {Math.min(100, Math.round(progress))}%
            </span>
          </div>
        </div>

        {status === "completed" && (
          <div className="bg-emerald-50 px-5 py-2 flex items-center gap-2">
            <Sparkles size={10} className="text-emerald-500 animate-pulse" />
            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">
              Achievement live in social stream
            </span>
          </div>
        )}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `,
        }}
      />
    </div>
  );
};

export default SocialShareToast;
