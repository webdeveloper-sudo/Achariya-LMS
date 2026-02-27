import {
  Target,
  Trophy,
  Flame,
  Zap,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const SuggestedActions = () => {
  const navigate = useNavigate();

  const suggestions = [
    {
      id: 1,
      icon: <Flame className="w-6 h-6" />,
      text: "Extend your academic streak to 7 cycles to secure the 'Consistent Scholar' mastery badge.",
      action: "Mastery Hub",
      color: "blue",
      onClick: () => navigate("/student/badges"),
    },
    {
      id: 2,
      icon: <Target className="w-6 h-6" />,
      text: "Curriculum requirements detected. Finalize your daily objectives to unlock institutional units.",
      action: "Objective Panel",
      color: "blue",
      onClick: () => navigate("/student/challenges"),
    },
    {
      id: 3,
      icon: <Trophy className="w-6 h-6" />,
      text: "Rank Variance: 200 units required to enter Sector Top 10. Deployment of assessments recommended.",
      action: "Academic Rank",
      color: "blue",
      onClick: () => navigate("/student/leaderboard"),
    },
  ];

  return (
    <div className="bg-white border border-gray-300 rounded-md p-8 sm:p-10 mb-12 relative overflow-hidden group shadow-sm">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 relative z-10">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight uppercase flex items-center gap-2">
              System Recommendations
              <div className="text-blue-900">
                <Zap className="w-5 h-5 shadow-sm" />
              </div>
            </h3>
            <p className="text-[12px]  text-gray-700 uppercase tracking-widest mt-1">
              AI-Driven Optimization Paths
            </p>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-md flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-900 rounded-full animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.6)]"></div>
          <span className="text-[12px] text-gray-500 uppercase tracking-widest leading-none">
            Heuristic Engine Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {suggestions.map((suggestion, idx) => (
          <button
            key={suggestion.id}
            onClick={suggestion.onClick}
            className="group/btn relative overflow-hidden bg-gray-50/50 hover:bg-white transition-all duration-300 p-8 rounded-md border border-gray-300 hover:border-blue-200 hover:shadow-md text-left flex flex-col h-full animate-in fade-in"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div
              className={`w-12 h-12 border border-1 border-blue-900 rounded-[100%] bg-white mb-8 flex items-center justify-center transition-all text-gray-500 group-hover:text-${suggestion.color}-900 group-hover/btn:scale-110 group-hover/btn:border-blue-100`}
            >
              {suggestion.icon}
            </div>
            <div className="flex-grow mb-8">
              <p className="text-sm text-gray-500 font-medium leading-relaxed group-hover/btn:text-gray-900 transition-colors">
                {suggestion.text}
              </p>
            </div>
            <div className="mt-auto flex items-center justify-start border-t border-gray-100 pt-6">
              <span className="text-[14px] text-blue-900">
                {suggestion.action}
              </span>
              <ChevronRight
                size={15}
                className=" text-blue-900 group-hover/btn:translate-x-1 transition-all"
              />
            </div>

            {/* Subtle decor */}
            <div className="absolute top-4 right-6 opacity-0 group-hover/btn:opacity-5 transition-opacity pointer-events-none">
              <Sparkles size={24} className="text-blue-600" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedActions;
