import { Trophy, Zap } from "lucide-react";

interface StreakWidgetProps {
  currentStreak: number;
}

const StreakWidget = ({ currentStreak }: StreakWidgetProps) => {
  // Determine next milestone
  const getNextMilestone = () => {
    if (currentStreak < 7) return { target: 7, name: "WEEK WARRIOR" };
    if (currentStreak < 30) return { target: 30, name: "MONTHLY MASTER" };
    if (currentStreak < 100) return { target: 100, name: "CENTURY CHAMPION" };
    return { target: 365, name: "ANNUAL LEGEND" };
  };

  const milestone = getNextMilestone();
  const progress = (currentStreak / milestone.target) * 100;

  return (
    <div className="relative overflow-hidden bg-white border border-gray-300 rounded-md p-8 shadow-sm group">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50/50 blur-3xl rounded-full -z-0 group-hover:scale-110 transition-transform duration-700"></div>

      <div className="flex items-center justify-between relative z-10"></div>

      {/* Progress to next milestone */}
      <div className="relative z-10 space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[11px]  text-gray-700 uppercase tracking-widest mb-1.5">
              Current Milestone
            </p>
            <p className="text-xl font-bold text-gray-900 tracking-tight uppercase">
              {milestone.name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-semibold text-gray-600 tracking-tight">
              {currentStreak}
              <span className="text-gray-600 mx-1">/</span>
              {milestone.target}
            </p>
          </div>
        </div>

        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden border border-gray-100">
          <div
            className="absolute top-0 left-0 h-full bg-blue-900 transition-all duration-1000 shadow-[0_0_8px_rgba(37,99,235,0.4)]"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <Zap size={11} className="text-blue-900" />
            <span className="text-[11px] text-gray-800 uppercase tracking-widest">
              Synchronization Active
            </span>
          </div>
          <span className="text-[14px] text-blue-900 uppercase tracking-widest">
            <span>{Math.round(progress)}%</span> Complete
          </span>
        </div>
      </div>

      {currentStreak >= 7 && (
        <div className="mt-8 flex items-center justify-center gap-3 py-3 bg-emerald-50 border border-emerald-100 rounded-md animate-in fade-in">
          <Trophy className="w-4 h-4 text-emerald-600" />
          <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">
            Performance Standard: Elite
          </p>
        </div>
      )}
    </div>
  );
};

export default StreakWidget;
