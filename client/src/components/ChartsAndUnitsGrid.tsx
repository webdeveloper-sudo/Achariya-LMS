import React from "react";
import {
  BarChart3,
  PieChart as PieChartIcon,
  Star,
  Layout,
  ChevronRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface ProgressData {
  weeklyActivity: any[];
  courseProgress: any[];
  quizStats: {
    totalQuizzes: number;
    completedQuizzes: number;
    averageScore: number;
  };
}

interface Props {
  data: ProgressData;
}

const ChartsAndUnitsGrid: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  const { weeklyActivity, courseProgress, quizStats } = data;

  const pieData = [
    { name: "Completed", value: quizStats.completedQuizzes, color: "#1e3a8a" },
    {
      name: "Pending",
      value: Math.max(0, quizStats.totalQuizzes - quizStats.completedQuizzes),
      color: "#f3f4f6",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* 1. Weekly Performance Bar Chart */}
      <div className="bg-white rounded-md border border-gray-300 shadow-sm p-8 flex flex-col h-full">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-2 rounded-full border border-gray-400">
            <BarChart3 size={18} className="text-blue-900" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">
            Weekly Intensity
          </h3>
        </div>

        <div className="flex-1 min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyActivity}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 8, fontWeight: "bold", fill: "#9ca3af" }}
              />
              <YAxis hide />
              <RechartsTooltip
                cursor={{ fill: "#f9fafb" }}
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 12px",
                }}
                itemStyle={{
                  color: "#fff",
                  fontSize: "10px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              />
              <Bar
                dataKey="completion"
                fill="#1e3a8a"
                radius={[2, 2, 0, 0]}
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-900 rounded-full"></div>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">
            Synchronization Levels
          </span>
        </div>
      </div>

      {/* 2. Task Completion Pie Chart */}
      <div className="bg-white rounded-md border border-gray-300 shadow-sm p-8 flex flex-col h-full">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-2 rounded-full border border-gray-400">
            <PieChartIcon size={18} className="text-blue-900" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">
            Audit Distribution
          </h3>
        </div>

        <div className="flex-1 min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="none"
                  />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 12px",
                }}
                itemStyle={{
                  color: "#fff",
                  fontSize: "10px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-md border border-gray-100 text-center">
            <p className="text-2xl font-bold text-gray-900 leading-none mb-1">
              {quizStats.completedQuizzes}
            </p>
            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none">
              Completed
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100 text-center">
            <p className="text-2xl font-bold text-blue-900 leading-none mb-1">
              {Math.round(
                (quizStats.completedQuizzes / (quizStats.totalQuizzes || 1)) *
                  100,
              )}
              %
            </p>
            <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest leading-none">
              Net Rate
            </p>
          </div>
        </div>
      </div>

      {/* 3. Focus Units / Curriculum units */}
      <div className="bg-white rounded-md p-8 border border-gray-300 shadow-sm h-full flex flex-col">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-2 rounded-full border border-gray-400">
            <Star size={18} className="text-blue-900" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">
            Focus Units
          </h3>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto max-h-[280px] no-scrollbar">
          {courseProgress?.slice(0, 5).map((course, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-[12px] text-gray-500 truncate max-w-[180px] font-medium tracking-tight">
                  {course.title}
                </p>
                <span className="text-[10px] font-bold text-blue-900 tracking-widest">
                  {Math.round(course.progress)}%
                </span>
              </div>
              <div className="w-full h-1 bg-gray-50 rounded-full overflow-hidden border border-gray-100 progress-bar-industrial">
                <div
                  className="h-full bg-blue-900 transition-all duration-1000 shadow-[0_0_5px_rgba(30,58,138,0.3)]"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          ))}
          {(!courseProgress || courseProgress.length === 0) && (
            <p className="text-[12px] text-gray-400 italic">
              No active units detected.
            </p>
          )}
        </div>

        <div className="mt-auto pt-6">
          <div className="p-4 bg-gray-50 rounded-md border border-gray-100 flex items-center justify-between group cursor-pointer hover:border-blue-100 transition-colors">
            <div className="flex items-center gap-3">
              <Layout
                size={14}
                className="text-gray-400 group-hover:text-blue-900"
              />
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-900">
                Comprehensive Audit
              </span>
            </div>
            <ChevronRight size={14} className="text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsAndUnitsGrid;
