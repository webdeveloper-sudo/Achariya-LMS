import { useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  Target,
  Zap,
  Clock,
  Layout,
  Star,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import CalendarHeatmapComponent from "../../components/CalendarHeatmap";
import ChartsAndUnitsGrid from "../../components/ChartsAndUnitsGrid";

interface ProgressData {
  weeklyActivity: any[];
  timeline: any[];
  heatmapData: any[];
  courseProgress: any[];
  quizStats: {
    totalQuizzes: number;
    completedQuizzes: number;
    averageScore: number;
    totalAttempts: number;
  };
  signupDate: string;
}

const StudentProgress = () => {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await axiosInstance.get("/students/progress");
        setData(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load progress data");
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-6">
        <div className="w-12 h-12 border-2 border-gray-100 border-t-blue-900 rounded-full animate-spin"></div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Synchronizing Analytics...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-md shadow-sm border border-gray-100 text-center max-w-lg">
          <Activity className="w-12 h-12 text-red-500 mx-auto mb-6" />
          <h2 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">
            Data Sync Failure
          </h2>
          <p className="text-gray-500 text-sm mb-8 font-medium">
            {error || "Connection error."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-gray-900 text-white rounded-md font-bold text-[10px] uppercase tracking-widest hover:bg-blue-900 transition-all shadow-sm"
          >
            Retry Analytics
          </button>
        </div>
      </div>
    );
  }

  const { timeline, heatmapData, quizStats } = data;

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section - Inspired by StudentChallenges */}
      <div className="bg-gray-50 border-b border-gray-100  pb-12 px-6 sm:px-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <Link
            to="/student/dashboard"
            className="inline-flex items-center text-gray-500 hover:text-blue-900 mb-5 transition-colors text-[12px] uppercase tracking-widest group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Dashboard
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
                Performance <span className="text-gray-400">Tracker</span>
              </h1>
              <p className="text-gray-500 text-sm font-medium max-w-2xl leading-relaxed">
                Strategic overview of your educational commitment, assessment
                accuracy, and chronological engagement patterns.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-white p-5 px-6 rounded-md border border-gray-300 shadow-sm min-w-[160px]">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Mastery Index
                </p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-gray-900 tracking-tight">
                    {Math.round(quizStats.averageScore)}%
                  </span>
                  <Award size={14} className="text-blue-900 mb-1" />
                </div>
              </div>
              <div className="bg-white p-5 px-6 rounded-md border border-gray-300 shadow-sm min-w-[160px]">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Validated Units
                </p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-gray-900 tracking-tight">
                    {quizStats.completedQuizzes}
                  </span>
                  <Star size={14} className="text-emerald-500 mb-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 pb-24 -mt-6 relative z-20 space-y-8">
        {/* Heatmap Section - Now Full Width */}
        <CalendarHeatmapComponent data={heatmapData} />

        <ChartsAndUnitsGrid data={data} />
        <div>
          {/* Activity Timeline - Inspired by Social Feed */}
          <div className="space-y-4 border border-gray-300 rounded-sm px-6 py-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                <Zap
                  size={40}
                  className="text-blue-900 rounded-[100%] border border-blue-900 p-2"
                />
                Activity Stream
              </h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100 text-[12px] text-gray-400 uppercase tracking-widest">
                <div className="w-2 h-2 bg-blue-900 rounded-full animate-pulse"></div>
                Chronological Log
              </div>
            </div>

            <div className="space-y-4">
              {timeline
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage,
                )
                .map((item: any, idx) => (
                  <div
                    key={item.id || idx}
                    className="bg-white border border-gray-200 rounded-md px-4 py-6 shadow-sm hover:border-blue-100 transition-all group"
                  >
                    <div className="flex items-start gap-6">
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-300 text-gray-500 group-hover:bg-blue-900 group-hover:text-white group-hover:border-blue-900 transition-all duration-300">
                        {item.action === "login" ||
                        item.action === "daily_checkin" ? (
                          <Clock size={20} />
                        ) : item.action === "complete_assessment" ? (
                          <Target size={20} />
                        ) : (
                          <Layout size={20} />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-3">
                            <h4
                              className="font-semibold text-gray-900 tracking-tight group-hover:text-blue-900 transition-colors text-lg"
                              style={{ textTransform: "capitalize" }}
                            >
                              {item.action.replace(/_/g, " ")}
                            </h4>
                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                              {getTimeAgo(item.date)}
                            </span>
                          </div>
                          {item.score > 0 && (
                            <div className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 text-[8px] font-bold text-emerald-600 uppercase tracking-widest">
                              {item.score}% Validated
                            </div>
                          )}
                        </div>
                        <p className="text-gray-500 text-xs font-medium leading-relaxed">
                          Interaction verified with reference:{" "}
                          <span className="text-gray-900 font-bold">
                            {item.refTitle || "Academic Portal"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Activity Stream Pagination - Industrial Theme */}
            {Math.ceil(timeline.length / itemsPerPage) > 1 && (
              <div className="mt-12 flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 800, behavior: "smooth" });
                  }}
                  disabled={currentPage === 1}
                  className="p-3 bg-white border border-gray-300 rounded-md text-gray-400 hover:text-blue-900 hover:border-blue-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm group"
                >
                  <ChevronLeft
                    size={18}
                    className="group-hover:-translate-x-0.5 transition-transform"
                  />
                </button>

                {(() => {
                  const totalPages = Math.ceil(timeline.length / itemsPerPage);
                  let pages = [];
                  if (totalPages <= 3) {
                    pages = Array.from({ length: totalPages }, (_, i) => i + 1);
                  } else if (currentPage === 1) {
                    pages = [1, 2, 3];
                  } else if (currentPage === totalPages) {
                    pages = [totalPages - 2, totalPages - 1, totalPages];
                  } else {
                    pages = [currentPage - 1, currentPage, currentPage + 1];
                  }

                  return pages.map((page) => (
                    <button
                      key={page}
                      onClick={() => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 800, behavior: "smooth" });
                      }}
                      className={`w-12 h-12 rounded-md font-black text-[12px] transition-all border shadow-sm ${
                        currentPage === page
                          ? "bg-blue-900 text-white border-blue-900 shadow-lg scale-110"
                          : "bg-white text-gray-500 border-gray-300 hover:border-blue-900 hover:text-blue-900"
                      }`}
                    >
                      {page.toString().padStart(2, "0")}
                    </button>
                  ));
                })()}

                <button
                  onClick={() => {
                    setCurrentPage((p) =>
                      Math.min(
                        Math.ceil(timeline.length / itemsPerPage),
                        p + 1,
                      ),
                    );
                    window.scrollTo({ top: 800, behavior: "smooth" });
                  }}
                  disabled={
                    currentPage === Math.ceil(timeline.length / itemsPerPage)
                  }
                  className="p-3 bg-white border border-gray-300 rounded-md text-gray-400 hover:text-blue-900 hover:border-blue-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm group"
                >
                  <ChevronRight
                    size={18}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProgress;
