import React, { useEffect } from "react";
import { CheckCircle, Info, X } from "lucide-react";

interface SimpleToastProps {
  isVisible: boolean;
  message: string;
  type?: "success" | "info" | "error";
  onClose: () => void;
  duration?: number;
}

const SimpleToast: React.FC<SimpleToastProps> = ({
  isVisible,
  message,
  type = "success",
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const bgClass =
    type === "success"
      ? "bg-emerald-600"
      : type === "error"
        ? "bg-red-600"
        : "bg-blue-600";

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[250] animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div
        className={`${bgClass} text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10`}
      >
        {type === "success" ? <CheckCircle size={18} /> : <Info size={18} />}
        <span className="text-[11px] font-bold uppercase tracking-widest whitespace-nowrap">
          {message}
        </span>
        <button
          onClick={onClose}
          className="ml-2 opacity-50 hover:opacity-100 transition-opacity"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default SimpleToast;
