import { Link } from "react-router-dom";
import {
  ArrowLeft,
  TrendingUp,
  Calendar,
  Activity,
  Zap,
  BarChart3,
  Clock,
} from "lucide-react";
import { sampleData } from "../../data/sampleData";

const PrincipalStudentActivity = () => {
  // Calculate activity stats
  const weeklyData = [
    { day: "Monday", active: 85, inactive: 15 },
    { day: "Tuesday", active: 78, inactive: 22 },
    { day: "Wednesday", active: 92, inactive: 8 },
    { day: "Thursday", active: 88, inactive: 12 },
    { day: "Friday", active: 95, inactive: 5 },
    { day: "Saturday", active: 42, inactive: 58 },
    { day: "Sunday", active: 35, inactive: 65 },
  ];

  const totalStudents = sampleData.students.length;
  const avgWeeklyActive = Math.round(
    weeklyData.reduce((sum, d) => sum + d.active, 0) / weeklyData.length,
  );

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="border-b border-gray-100 pb-12">
        <Link
          to="/principal/dashboard"
          className="inline-flex items-center text-[13px] hover:text-[#008000] mb-10 transition-colors capitalize"
          style={{ color: "#008000" }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Executive Dashboard
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-center sm:text-left">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6 justify-center sm:justify-start">
              <div className="bg-green-50 p-2 rounded border border-green-100">
                <Clock className="w-5 h-5" style={{ color: "#008000" }} />
              </div>
              <span
                className="text-[13px] capitalize"
                style={{ color: "#008000" }}
              >
                Engagement Telemetry
              </span>
            </div>
            <h1 className="text-4xl text-gray-900 mb-6 leading-tight capitalize">
              Activity <span className="text-gray-400">Dynamics</span>
            </h1>
            <p className="text-gray-600 text-[15px] max-w-xl leading-relaxed mx-auto sm:mx-0">
              Real-time monitoring of participant engagement cycles. Tracking
              institutional activation patterns and periodic utilization.
            </p>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white rounded-md border border-gray-100 shadow-sm p-8">
        <div className="flex items-center gap-4 mb-8">
          <div
            className="bg-green-50 p-2.5 rounded border border-green-100"
            style={{ color: "#008000" }}
          >
            <Zap size={20} fill="#008000" className="opacity-20" />
          </div>
          <div>
            <h2 className="text-xl text-gray-900 capitalize">
              Engagement Diagnostics
            </h2>
            <p className="text-gray-400 text-[11px] capitalize mt-1">
              Operational Efficiency Insights
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {[
            "Weekday engagement maintained at optimal threshold (78-95%)",
            "Peak institutional activity identified on Friday (95%)",
            "Weekend utilization indicates potential for asynchronous expansion",
            "Mid-week synchronization spike detected on Wednesday (92%)",
          ].map((insight, i) => (
            <div key={i} className="flex gap-4 group">
              <span className="text-gray-200 group-hover:text-[#008000] transition-colors font-mono pt-1 text-sm">
                0{i + 1}
              </span>
              <p className="text-[13px] text-gray-600 leading-relaxed capitalize">
                {insight}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { label: "Total Asset Userpool", val: totalStudents, icon: Activity },
          {
            label: "Periodic Efficiency",
            val: `${avgWeeklyActive}%`,
            icon: TrendingUp,
          },
          { label: "Peak Engagement Cycle", val: "Friday", icon: Calendar },
        ].map((stat, i) => (
          <div
            key={i}
            className="group bg-white rounded-md p-8 border border-gray-100 shadow-sm transition-all text-center sm:text-left"
          >
            <div className="bg-gray-50 text-gray-400 w-12 h-12 rounded flex items-center justify-center mb-6 mx-auto sm:mx-0 group-hover:bg-green-50 group-hover:text-[#008000] transition-colors">
              <stat.icon size={22} />
            </div>
            <p className="text-[11px] text-gray-400 capitalize mb-2 font-medium">
              {stat.label}
            </p>
            <p className="text-4xl text-gray-900 tracking-tight tabular-nums capitalize">
              {stat.val}
            </p>
          </div>
        ))}
      </div>

      {/* Weekly Breakdown */}
      <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div
              className="bg-gray-50 p-2.5 rounded border border-gray-100"
              style={{ color: "#008000" }}
            >
              <BarChart3 size={20} />
            </div>
            <div>
              <h2 className="text-xl text-gray-900 capitalize">
                Daily Utilization Breakdown
              </h2>
              <p className="text-gray-400 text-[11px] capitalize mt-1">
                Institutional Usage Frequency Traces
              </p>
            </div>
          </div>
          <Activity size={18} className="text-gray-200 hidden sm:block" />
        </div>

        <div className="p-8 space-y-10">
          {weeklyData.map((day) => (
            <div key={day.day} className="group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-[15px] text-gray-900 capitalize font-medium group-hover:text-[#008000] transition-colors">
                    {day.day}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-tighter font-mono">
                    Cycle Data
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <span
                    className="inline-flex items-center gap-2 text-[11px] font-medium"
                    style={{ color: "#008000" }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: "#008000" }}
                    ></div>
                    {day.active}% Engaged
                  </span>
                  <span className="inline-flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                    {day.inactive}% Latent
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-50 rounded-md h-3.5 overflow-hidden flex border border-gray-100">
                <div
                  className="transition-all duration-1000 shadow-[inset_0_0_10px_rgba(0,128,0,0.1)] flex items-center justify-center"
                  style={{
                    width: `${day.active}%`,
                    backgroundColor: "#008000",
                  }}
                >
                  {day.active > 30 && (
                    <span className="text-[9px] text-white opacity-40 font-bold tabular-nums">
                      {day.active}%
                    </span>
                  )}
                </div>
                <div
                  className="bg-gray-100 flex items-center justify-center transition-all duration-1000"
                  style={{ width: `${day.inactive}%` }}
                >
                  {day.inactive > 30 && (
                    <span className="text-[9px] text-gray-400 font-bold tabular-nums">
                      {day.inactive}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrincipalStudentActivity;
