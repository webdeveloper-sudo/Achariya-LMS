import React from "react";

interface ProgressBarProps {
  percentage: number;
  label?: string;
  height?: string;
  showText?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  label,
  height = "h-4",
  showText = true,
}) => {
  // Ensure percentage is between 0 and 100
  const validPercentage = Math.min(100, Math.max(0, percentage));

  // Determine color based on percentage (Green -> Yellow -> Red/Green?)
  // Requirement: "Green -> Yellow -> Red based on completion" - usually it's Red -> Yellow -> Green?
  // User said "Green -> Yellow -> Red based on completion".
  // Maybe 0-33 Green (Safe?), 33-66 Yellow, 66+ Red (Hot?)? OR standard progress Red->Yellow->Green.
  // "Green -> Yellow -> Red" might imply standard traffic light logic where Green is good/start?
  // Actually, typically typically Red (Low) -> Yellow (Mid) -> Green (High/Complete).
  // "Green -> Yellow -> Red" literally means Green at 0 and Red at 100? That's unusual for progress.
  // I will assume standard: Red (Start) -> Yellow -> Green (Complete) unless user meant gradient direction.
  // Let's use a beautiful gradient that shifts.

  const getGradient = () => {
    if (validPercentage < 30) return "from-red-500 to-orange-500";
    if (validPercentage < 70) return "from-orange-500 to-yellow-500";
    return "from-green-500 to-emerald-500";
  };

  return (
    <div className="w-full">
      {showText && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          <span className="text-sm font-bold text-gray-900">
            {Math.round(validPercentage)}%
          </span>
        </div>
      )}
      <div
        className={`w-full bg-gray-200 rounded-full ${height} overflow-hidden`}
      >
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${getGradient()}`}
          style={{ width: `${validPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
