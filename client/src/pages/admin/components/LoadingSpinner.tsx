import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "medium",
  message = "Loading...",
}) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Loader2
        className={`animate-spin text-blue-600 ${sizeClasses[size]} mb-2`}
      />
      {message && <p className="text-gray-500 text-sm">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
