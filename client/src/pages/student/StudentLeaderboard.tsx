import {
  Trophy,
  Calendar,
  GraduationCap,
  Crown,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Target,
} from "lucide-react";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { studentApi } from "../../api";

const StudentLeaderboard = () => {
  const [activeTab, setActiveTab] = useState<"weekly" | "alltime" | "class">(
    "weekly",
  );
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id || user._id;
  const userClass = user.class;

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await studentApi.getLeaderboard(activeTab as any);

      if (res.data && res.data.leaderboard) {
        setLeaderboard(res.data.leaderboard);
        setUserRank(res.data.userRank);
        setTotalStudents(res.data.totalStudents || 0);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard", error);
    } finally {
      setLoading(false);
    }
  };

  const Top3Podium = () => {
    if (leaderboard.length < 1) return null;

    const top3 = leaderboard.slice(0, 3);
    const podiumOrder = [
      top3[1], // 2nd place
      top3[0], // 1st place
      top3[2], // 3rd place
    ];

    return (
      <div className="flex items-end bg-gray-50 justify-center pt-10 border border-gray-300  pb-16 gap-6 sm:gap-12 max-w-6xl mx-auto px-6">
        {podiumOrder.map((item, idx) => {
          if (!item) return <div key={idx} className="flex-1"></div>;

          const actualRank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
          const isWinner = actualRank === 1;
          const isYou =
            activeTab === "class"
              ? item.name === userClass
              : item._id === userId;

          return (
            <div
              key={idx}
              className={`flex-1 flex flex-col items-center transition-all duration-700`}
            >
              {/* Avatar Section */}
              <div className="relative mb-8">
                <div
                  className={`relative rounded-md p-1.5 border shadow-sm ${
                    actualRank === 1
                      ? "border-blue-200 bg-blue-50/50 w-28 h-28 sm:w-32 sm:h-32"
                      : "border-gray-200 bg-gray-50 w-24 h-24 sm:w-28 sm:h-28"
                  }`}
                >
                  <div className="w-full h-full bg-white rounded flex items-center justify-center overflow-hidden border border-gray-300 lucide-icon-container">
                    {activeTab !== "class" ? (
                      <Link
                        to={`/student/profile/${item._id}`}
                        className="w-full h-full block hover:opacity-80 transition-opacity"
                      >
                        {item.avatar ? (
                          <img
                            src={item.avatar}
                            alt={item.name}
                            className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all"
                          />
                        ) : (
                          <span
                            className={`font-bold flex items-center justify-center h-full tracking-tighter ${actualRank === 1 ? "text-blue-900 text-4xl" : "text-gray-400 text-3xl"}`}
                          >
                            {item.name?.charAt(0)}
                          </span>
                        )}
                      </Link>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        {item.avatar ? (
                          <img
                            src={item.avatar}
                            alt={item.name}
                            className="w-full h-full object-cover grayscale-[20%]"
                          />
                        ) : (
                          <span
                            className={`font-bold tracking-tighter ${actualRank === 1 ? "text-blue-900 text-4xl" : "text-gray-400 text-3xl"}`}
                          >
                            {item.name?.charAt(0)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Rank Badge */}
                  <div
                    className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-10 h-10 rounded-md flex items-center justify-center shadow-lg border-2 border-white ${
                      actualRank === 1 ? "bg-blue-900" : "bg-gray-800"
                    }`}
                  >
                    {actualRank === 1 ? (
                      <Crown size={18} className="text-white" />
                    ) : (
                      <span className="text-white text-[12px] font-bold">
                        {actualRank}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Podium Base */}
              <div
                className={`w-full flex flex-col items-center text-center p-8 rounded-md shadow-sm border border-gray-300 bg-white relative overflow-hidden transition-all duration-500 hover:border-blue-900 hover:shadow-xl ${
                  actualRank === 1
                    ? "h-56 sm:h-64 border-b-4 border-b-blue-900"
                    : actualRank === 2
                      ? "h-44 sm:h-52 border-b-4 border-b-gray-800"
                      : "h-36 sm:h-44 border-b-4 border-b-gray-400"
                }`}
              >
                <div className="relative z-10 w-full overflow-hidden">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                    Institutional Rank #{actualRank}
                  </span>
                  {activeTab !== "class" ? (
                    <Link
                      to={`/student/profile/${item._id}`}
                      className="hover:text-blue-900 transition-colors"
                    >
                      <p
                        className={`font-bold tracking-tight mb-1.5 truncate px-2 text-gray-900 ${isWinner ? "text-xl" : "text-base"} ${isYou ? "text-blue-900" : ""}`}
                      >
                        {item.name}
                      </p>
                    </Link>
                  ) : (
                    <p
                      className={`font-bold tracking-tight mb-1.5 truncate px-2 text-gray-900 ${isWinner ? "text-xl" : "text-base"} ${isYou ? "text-blue-900" : ""}`}
                    >
                      {item.name}
                    </p>
                  )}
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {activeTab === "class"
                      ? `${item.studentCount} Enrollments`
                      : item.class || "Academic Unit"}
                  </p>

                  <div className="mt-8 pt-6 border-t border-gray-50 flex flex-col items-center">
                    <span
                      className={`text-3xl font-bold tracking-tighter ${isWinner ? "text-blue-900" : "text-gray-900"}`}
                    >
                      {Math.round(item.score)}
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-gray-400 mt-1">
                      Verified Credits
                    </span>
                  </div>
                </div>

                {/* Industrial Grid Pattern Effect */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none heatmap-industrial"></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen ">
      {/* Header Section */}
      <div className=" border-b border-gray-100 pb-12 px-6 sm:px-10 relative overflow-hidden">
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
                Academic <span className="text-gray-400">Leaderboard</span>
              </h1>
              <p className="text-gray-500 text-sm font-medium max-w-2xl leading-relaxed">
                Strategic recognition of academic excellence and consistent
                longitudinal engagement across the institutional curriculum.
              </p>
            </div>

            {userRank && (
              <div className="bg-white p-6 px-10 rounded-md border border-gray-300 shadow-sm flex items-center gap-8">
                <div className="flex flex-col">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 leading-none">
                    Your Rank
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold text-gray-900 tracking-tighter">
                      #{userRank}
                    </p>
                    <span className="text-blue-900 font-bold uppercase tracking-widest text-[10px]">
                      Registry
                    </span>
                  </div>
                </div>
                <div className="w-px h-10 bg-gray-100 hidden sm:block"></div>
                <div className="hidden sm:flex flex-col">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 leading-none">
                    Status
                  </p>
                  <p className="text-lg font-bold text-emerald-600 uppercase tracking-tight leading-none">
                    Top {Math.round((userRank / totalStudents) * 100) || 5}%
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tabs - Standardized */}
          <div className="mt-14 flex flex-wrap gap-4 items-center">
            {[
              {
                id: "weekly",
                label: "Weekly Review",
                icon: Calendar,
              },
              {
                id: "alltime",
                label: "Global Records",
                icon: Trophy,
              },
              {
                id: "class",
                label: "Class Standings",
                icon: GraduationCap,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-8 py-3 rounded-md font-bold text-[10px] uppercase tracking-widest transition-all duration-300 border ${
                  activeTab === tab.id
                    ? "bg-blue-900 text-white border-blue-900 shadow-md"
                    : "bg-white text-gray-500 border-gray-300 hover:border-blue-300 hover:text-blue-900"
                }`}
              >
                <tab.icon
                  size={14}
                  className={
                    activeTab === tab.id ? "text-white" : "text-gray-400"
                  }
                />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="w-10 h-10 border-2 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
              Updating Ranks...
            </p>
          </div>
        ) : (
          <>
            {/* Podium for top 3 */}
            <Top3Podium />

            {/* List for the rest */}
            <div className="max-w-5xl mx-auto mt-12 space-y-4">
              {leaderboard.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-md border border-gray-100 text-center">
                  <div className="bg-white p-6 rounded-full mb-6 border border-gray-100">
                    <Trophy className="w-10 h-10 text-gray-200" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No Records Found
                  </h3>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] max-w-xs mx-auto">
                    Performance data for this period is not yet available.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {leaderboard
                      .slice(3)
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((item: any, index: number) => {
                        const rank = (currentPage - 1) * itemsPerPage + index + 4;
                        const isYou =
                          activeTab === "class"
                            ? item.name === userClass
                            : item._id === userId;

                        return (
                          <div
                            key={item._id || index}
                            className={`group flex items-center justify-between p-6 sm:p-8 rounded-md border transition-all duration-300 ${
                              isYou
                                ? "bg-blue-50/20 border-blue-900 shadow-lg"
                                : "bg-white border-gray-300 hover:border-blue-400 shadow-sm"
                            }`}
                          >
                            <div className="flex items-center gap-10">
                              <div
                                className={`w-14 h-14 rounded-md flex items-center justify-center font-bold text-lg border shadow-sm transition-all ${
                                  isYou
                                    ? "bg-blue-900 text-white border-blue-900"
                                    : "bg-gray-900 text-white border-gray-800"
                                }`}
                              >
                                #{rank}
                              </div>

                              <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-gray-50 rounded flex items-center justify-center text-gray-400 font-bold overflow-hidden border border-gray-300 lucide-icon-container">
                                  {activeTab !== "class" ? (
                                    <Link
                                      to={`/student/profile/${item._id}`}
                                      className="w-full h-full block hover:opacity-80 transition-opacity"
                                    >
                                      {item.avatar ? (
                                        <img
                                          src={item.avatar}
                                          alt={item.name}
                                          className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all"
                                        />
                                      ) : (
                                        <span className="text-lg flex items-center justify-center h-full tracking-tighter">
                                          {item.name?.charAt(0)}
                                        </span>
                                      )}
                                    </Link>
                                  ) : item.avatar ? (
                                    <img
                                      src={item.avatar}
                                      alt={item.name}
                                      className="w-full h-full object-cover grayscale-[20%]"
                                    />
                                  ) : (
                                    <span className="text-lg tracking-tighter">
                                      {item.name?.charAt(0)}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-4">
                                    {activeTab !== "class" ? (
                                      <Link
                                        to={`/student/profile/${item._id}`}
                                        className="hover:text-blue-900 transition-colors"
                                      >
                                        <p
                                          className={`text-base font-bold tracking-tight ${isYou ? "text-blue-900" : "text-gray-900"}`}
                                        >
                                          {item.name}
                                        </p>
                                      </Link>
                                    ) : (
                                      <p
                                        className={`text-base font-bold tracking-tight ${isYou ? "text-blue-900" : "text-gray-900"}`}
                                      >
                                        {item.name}
                                      </p>
                                    )}
                                    {isYou && (
                                      <span className="text-[8px] font-bold bg-blue-900 text-white px-2 py-0.5 rounded border border-blue-800 uppercase tracking-widest shadow-sm">
                                        Registry Record
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                    {activeTab === "class"
                                      ? `${item.studentCount} Active Enrollments`
                                      : item.class || "Academic Record Unit"}
                                    <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                    <span className="text-blue-900 italic">
                                      VERIFIED
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-14">
                              <div className="text-right">
                                <p className="text-3xl font-bold tracking-tighter text-gray-900">
                                  {Math.round(item.score)}
                                </p>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">
                                  Institutional Credits
                                </p>
                              </div>
                              <div className="w-12 h-12 rounded-md bg-gray-50 flex items-center justify-center text-gray-300 group-hover:text-blue-900 group-hover:bg-blue-50 transition-all border border-gray-100">
                                <ChevronRight
                                  size={20}
                                  className="group-hover:translate-x-0.5 transition-transform"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Leaderboard Pagination - Industrial Sliding Window */}
                  {Math.ceil(leaderboard.slice(3).length / itemsPerPage) > 1 && (
                    <div className="mt-16 flex items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          setCurrentPage((p) => Math.max(1, p - 1));
                          window.scrollTo({ top: 1000, behavior: 'smooth' });
                        }}
                        disabled={currentPage === 1}
                        className="p-3 bg-white border border-gray-300 rounded-md text-gray-400 hover:text-blue-900 hover:border-blue-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm group"
                      >
                        <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                      </button>

                      {(() => {
                        const totalSecondaryPages = Math.ceil(leaderboard.slice(3).length / itemsPerPage);
                        let pages = [];
                        if (totalSecondaryPages <= 3) {
                          pages = Array.from({ length: totalSecondaryPages }, (_, i) => i + 1);
                        } else if (currentPage === 1) {
                          pages = [1, 2, 3];
                        } else if (currentPage === totalSecondaryPages) {
                          pages = [totalSecondaryPages - 2, totalSecondaryPages - 1, totalSecondaryPages];
                        } else {
                          pages = [currentPage - 1, currentPage, currentPage + 1];
                        }

                        return pages.map((page) => (
                          <button
                            key={page}
                            onClick={() => {
                              setCurrentPage(page);
                              window.scrollTo({ top: 1000, behavior: 'smooth' });
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
                          setCurrentPage((p) => Math.min(Math.ceil(leaderboard.slice(3).length / itemsPerPage), p + 1));
                          window.scrollTo({ top: 1000, behavior: 'smooth' });
                        }}
                        disabled={currentPage === Math.ceil(leaderboard.slice(3).length / itemsPerPage)}
                        className="p-3 bg-white border border-gray-300 rounded-md text-gray-400 hover:text-blue-900 hover:border-blue-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm group"
                      >
                        <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="mt-20 flex flex-col items-center">
              <div className="bg-gray-50 px-10 py-4 rounded-md border border-gray-300 flex items-center gap-5 shadow-sm">
                <div className="p-2 bg-blue-900 text-white rounded">
                  <Target size={16} />
                </div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Academic Ecosystem:{" "}
                  <span className="text-gray-900 font-black">
                    {totalStudents > 0
                      ? `${totalStudents.toLocaleString()} Active Learners`
                      : "Synchronizing Registry..."}
                  </span>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentLeaderboard;
