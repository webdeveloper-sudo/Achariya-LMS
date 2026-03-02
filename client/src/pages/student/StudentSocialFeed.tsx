import {
  Heart,
  MessageCircle,
  TrendingUp,
  Trophy,
  Book,
  Crown,
  Swords,
  Hand,
  Megaphone,
  Flame,
  UserCircle,
  ArrowLeft,
  Share2,
  Zap,
  Sparkles,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { studentApi } from "../../api";
import { useStudentStore } from "../../store/useStudentStore";
import AchievementSharePopup from "../../components/AchievementSharePopup";
import SocialShareToast from "../../components/SocialShareToast";

const StudentSocialFeed = () => {
  const { student } = useStudentStore();
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [shareAchievementData, setShareAchievementData] = useState({
    title: "",
    type: "",
  });

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const res = await studentApi.getFeed();
      if (res.data && res.data.feed) {
        setFeedItems(res.data.feed);
      }
    } catch (error) {
      console.error("Failed to fetch feed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareAchievement = () => {
    setShareAchievementData({
      title: "My Latest Achievement",
      type: "Manual Post",
    });
    setShowSharePopup(true);
  };

  const handleSocialShare = async () => {
    try {
      await studentApi.postAchievement(shareAchievementData);
      setShowSharePopup(false);
      setShowShareToast(true);
      fetchFeed(); // Refresh feed
    } catch (err) {
      console.error("Failed to share achievement:", err);
    }
  };

  const handleLike = async (activityId: string) => {
    try {
      const res = await studentApi.likeActivity(activityId);
      if (res.data.success) {
        setFeedItems((prev) =>
          prev.map((item) =>
            item._id === activityId
              ? {
                  ...item,
                  interactions: {
                    ...item.interactions,
                    likes: res.data.likes,
                  },
                }
              : item,
          ),
        );
      }
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  const handleComment = async (activityId: string) => {
    if (!commentText.trim()) return;
    try {
      const res = await studentApi.commentOnActivity(activityId, commentText);
      if (res.data.success) {
        setFeedItems((prev) =>
          prev.map((item) =>
            item._id === activityId
              ? {
                  ...item,
                  interactions: {
                    ...item.interactions,
                    comments: [
                      ...(item.interactions?.comments || []),
                      res.data.comment,
                    ],
                  },
                }
              : item,
          ),
        );
        setCommentText("");
        setActiveCommentId(null);
      }
    } catch (err) {
      console.error("Comment failed:", err);
    }
  };

  const getIcon = (verb: string) => {
    switch (verb) {
      case "EARNED":
        return <Trophy className="w-5 h-5 text-blue-600" />;
      case "COMPLETED":
        return <Book className="w-5 h-5 text-blue-600" />;
      case "WON":
        return <Crown className="w-5 h-5 text-blue-600" />;
      case "CHALLENGED":
        return <Swords className="w-5 h-5 text-blue-600" />;
      case "JOINED":
        return <Hand className="w-5 h-5 text-blue-600" />;
      case "POSTED":
        return <Sparkles className="w-5 h-5 text-indigo-600" />;
      case "RANKED":
        return <TrendingUp className="w-5 h-5 text-emerald-600" />;
      default:
        return <Megaphone className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return `Just now`;
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section - Standardized Industrial Refinement */}
      <div className="bg-gray-50 border-b border-gray-100 pb-12 px-6 sm:px-10 relative overflow-hidden">
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
                Activity <span className="text-gray-400">Stream</span>
              </h1>
              <p className="text-gray-500 text-sm font-medium max-w-2xl leading-relaxed">
                Aggregated longitudinal metrics and authenticated peer
                milestones synchronized within the institutional cohort
                registry.
              </p>
            </div>

            <button
              onClick={handleShareAchievement}
              className="bg-gray-900 text-white px-10 py-4 rounded-md font-bold uppercase tracking-widest text-[10px] hover:bg-blue-900 transition-all shadow-lg flex items-center gap-3 group"
            >
              <Share2
                size={16}
                className="group-hover:rotate-12 transition-transform"
              />
              Publish Achievement
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 -mt-6 pb-24 relative z-20">
        {/* Quick Stats Grid */}
        {/* Quick Stats Grid - Component Architecture */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { label: "Mentors", value: "24", icon: Users },
            { label: "Peers", value: "118", icon: UserCircle },
            { label: "Updates", value: "12", icon: Megaphone },
            { label: "Endorsements", value: "156", icon: Heart },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white p-7 rounded-md border border-gray-300 shadow-sm flex flex-col items-center text-center group hover:border-blue-900 transition-all duration-300 relative overflow-hidden"
            >
              <div className="relative z-10 w-full flex flex-col items-center">
                <div className="p-4 rounded-md mb-5 bg-gray-50 text-gray-400 group-hover:bg-blue-900 group-hover:text-white transition-all border border-gray-100 lucide-icon-container">
                  <stat.icon size={22} />
                </div>
                <p className="text-3xl font-bold text-gray-900 tracking-tighter mb-2">
                  {stat.value}
                </p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-blue-900">
                  {stat.label}
                </p>
              </div>
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none heatmap-industrial"></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-4">
                <Sparkles size={24} className="text-blue-900" />
                Live <span className="text-gray-400">Registry Feed</span>
              </h2>
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-md border border-gray-300 text-[9px] font-bold text-gray-500 uppercase tracking-widest shadow-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
                Network Active
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-md border border-gray-100">
                <div className="w-10 h-10 border-2 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Updating Feed...
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {feedItems.length === 0 ? (
                  <div className="bg-gray-50 p-20 rounded-md border border-gray-100 text-center">
                    <p className="text-gray-400 font-bold text-sm">
                      No recent activity recorded.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {feedItems
                        .slice(
                          (currentPage - 1) * itemsPerPage,
                          currentPage * itemsPerPage,
                        )
                        .map((item) => (
                          <div
                            key={item._id}
                            className="bg-white border border-gray-300 rounded-md p-8 shadow-sm hover:shadow-xl hover:border-blue-900 transition-all group relative overflow-hidden"
                          >
                            <div className="relative z-10 flex flex-col sm:flex-row items-start gap-8">
                              <div className="relative flex-shrink-0">
                                <Link
                                  to={`/student/profile/${item.actorId}`}
                                  className="block group-hover:scale-105 transition-transform duration-500"
                                >
                                  <div className="w-20 h-20 bg-gray-50 rounded-md flex items-center justify-center text-gray-400 font-bold overflow-hidden border border-gray-300 shadow-inner">
                                    {item.actorAvatar ? (
                                      <img
                                        src={item.actorAvatar}
                                        alt={item.actorName}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <UserCircle className="text-gray-300 w-1/2 h-1/2" />
                                    )}
                                  </div>
                                </Link>
                                <div className="absolute -bottom-2 -right-2 p-2 rounded-md bg-white border border-gray-300 shadow-lg text-blue-900 group-hover:bg-blue-900 group-hover:text-white transition-colors lucide-icon-container">
                                  {getIcon(item.verb)}
                                </div>
                              </div>

                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4">
                                  <Link
                                    to={`/student/profile/${item.actorId}`}
                                    className="group/name"
                                  >
                                    <p className="font-bold text-xl text-gray-900 tracking-tight group-hover/name:text-blue-900 transition-colors">
                                      {item.actorName}
                                    </p>
                                  </Link>
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 italic">
                                    <Clock size={10} />{" "}
                                    {getTimeAgo(item.timestamp)}
                                  </span>
                                </div>
                                <div className="text-gray-500 text-[14px] leading-relaxed mb-8 flex flex-wrap items-center">
                                  {item.verb === "EARNED" &&
                                    "Validated Achievement: "}
                                  {item.verb === "WON" &&
                                    "Achieved Distinguished Status: "}
                                  {item.verb === "COMPLETED" &&
                                    "Successfully Concluded: "}
                                  {item.verb === "CHALLENGED" &&
                                    "Initiated Registry Challenge on: "}
                                  {item.verb === "POSTED" &&
                                    "Manual Registry Update: "}
                                  <span className="font-bold text-blue-900 bg-blue-50/50 px-3 py-1 rounded-sm text-[11px] uppercase tracking-widest border border-blue-900/10 mx-2 shadow-sm italic">
                                    {item.object}
                                  </span>
                                  {item.targetName && (
                                    <>
                                      {" "}
                                      within{" "}
                                      <span className="text-gray-900 font-bold underline decoration-gray-300 decoration-2 underline-offset-4">
                                        {item.targetName}
                                      </span>
                                    </>
                                  )}
                                </div>

                                <div className="flex items-center gap-4">
                                  <button
                                    onClick={() => handleLike(item._id)}
                                    className={`flex items-center gap-3 px-6 py-2.5 rounded-md transition-all border ${
                                      item.interactions?.likes?.includes(
                                        (student as any)?._id ||
                                          (student as any)?.id,
                                      )
                                        ? "bg-blue-900 text-white border-blue-900 shadow-lg"
                                        : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-white hover:border-blue-900 hover:text-blue-900"
                                    }`}
                                  >
                                    <Heart
                                      size={16}
                                      fill={
                                        item.interactions?.likes?.includes(
                                          (student as any)?._id ||
                                            (student as any)?.id,
                                        )
                                          ? "currentColor"
                                          : "none"
                                      }
                                    />
                                    <span className="font-bold uppercase tracking-widest text-[10px]">
                                      {item.interactions?.likes?.length || 0}{" "}
                                      Endorsed
                                    </span>
                                  </button>
                                  <button
                                    onClick={() =>
                                      setActiveCommentId(
                                        activeCommentId === item._id
                                          ? null
                                          : item._id,
                                      )
                                    }
                                    className={`flex items-center gap-3 px-6 py-2.5 rounded-md transition-all border ${
                                      activeCommentId === item._id
                                        ? "bg-black text-white border-black shadow-lg"
                                        : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-white hover:border-black hover:text-black"
                                    }`}
                                  >
                                    <MessageCircle size={16} />
                                    <span>
                                      {item.interactions?.comments?.length || 0}{" "}
                                      Insights
                                    </span>
                                  </button>
                                </div>

                                {activeCommentId === item._id && (
                                  <div className="mt-8 space-y-6 border-t border-gray-100 pt-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                    {item.interactions?.comments?.map(
                                      (comment: any, idx: number) => (
                                        <div key={idx} className="flex gap-4">
                                          <div className="w-10 h-10 rounded-md bg-gray-50 flex items-center justify-center text-[12px] font-bold text-gray-900 border border-gray-300 shadow-sm overflow-hidden uppercase shadow-inner">
                                            {comment.userAvatar ? (
                                              <img
                                                src={comment.userAvatar}
                                                alt={comment.userName}
                                                className="w-full h-full object-cover"
                                              />
                                            ) : (
                                              <UserCircle className="text-gray-300 w-1/2 h-1/2" />
                                            )}
                                          </div>
                                          <div className="flex-1 bg-gray-50/50 p-5 rounded-md border border-gray-200 shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                              <div className="flex items-center gap-3">
                                                <p className="text-[12px] font-black tracking-tight text-gray-900 uppercase">
                                                  {comment.userName}
                                                </p>
                                                <span className="text-[9px] font-bold text-blue-900 uppercase bg-white px-2 py-0.5 rounded-sm border border-blue-900 shadow-sm italic">
                                                  {comment.userRole}
                                                </span>
                                              </div>
                                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                                                <Clock size={10} />{" "}
                                                {getTimeAgo(comment.createdAt)}
                                              </span>
                                            </div>
                                            <p className="text-[13px] text-gray-600 leading-relaxed font-medium">
                                              {comment.text}
                                            </p>
                                          </div>
                                        </div>
                                      ),
                                    )}

                                    {(student?.role === "teacher" ||
                                      student?.role === "principal") && (
                                      <div className="flex gap-4 mt-8 pt-6 border-t border-gray-50">
                                        <div className="w-10 h-10 rounded-md bg-blue-900 flex items-center justify-center text-[12px] font-bold text-white overflow-hidden uppercase shadow-lg shadow-blue-200">
                                          {student?.avatar ? (
                                            <img
                                              src={student.avatar}
                                              alt={student.name}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <UserCircle className="text-white/50 w-1/2 h-1/2" />
                                          )}
                                        </div>
                                        <div className="flex-1 relative">
                                          <input
                                            type="text"
                                            value={commentText}
                                            onChange={(e) =>
                                              setCommentText(e.target.value)
                                            }
                                            placeholder="Deploy supportive peer feedback..."
                                            className="w-full bg-white border border-gray-300 rounded-md px-5 py-3 text-[13px] font-bold tracking-tight focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all placeholder:text-gray-300 pr-12 shadow-sm uppercase"
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter")
                                                handleComment(item._id);
                                            }}
                                          />
                                          <button
                                            onClick={() =>
                                              handleComment(item._id)
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-blue-900 hover:bg-blue-50 rounded-md transition-all hover:scale-110 active:scale-95"
                                          >
                                            <Zap
                                              size={18}
                                              fill="currentColor"
                                            />
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Pagination Controls - Industrial Theme */}
                    {Math.ceil(feedItems.length / itemsPerPage) > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-12 pb-8">
                        <button
                          onClick={() => {
                            setCurrentPage((prev) => Math.max(prev - 1, 1));
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          disabled={currentPage === 1}
                          className="p-3 bg-white border border-gray-300 rounded-md text-gray-400 hover:text-blue-900 hover:border-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm group"
                        >
                          <ChevronLeft
                            size={16}
                            className="group-hover:-translate-x-1 transition-transform"
                          />
                        </button>

                        {Array.from(
                          {
                            length: Math.ceil(feedItems.length / itemsPerPage),
                          },
                          (_, i) => i + 1,
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => {
                              setCurrentPage(page);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className={`w-12 h-12 rounded-md font-bold text-[12px] transition-all border shadow-sm ${
                              currentPage === page
                                ? "bg-blue-900 text-white border-blue-900 shadow-lg scale-110"
                                : "bg-white text-gray-500 border-gray-300 hover:border-blue-900 hover:text-blue-900"
                            }`}
                          >
                            {page.toString().padStart(2, "0")}
                          </button>
                        ))}

                        <button
                          onClick={() => {
                            setCurrentPage((prev) =>
                              Math.min(
                                prev + 1,
                                Math.ceil(feedItems.length / itemsPerPage),
                              ),
                            );
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          disabled={
                            currentPage ===
                            Math.ceil(feedItems.length / itemsPerPage)
                          }
                          className="p-3 bg-white border border-gray-300 rounded-md text-gray-400 hover:text-blue-900 hover:border-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm group"
                        >
                          <ChevronRight
                            size={16}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-white rounded-md p-8 sm:p-10 border border-gray-300 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none heatmap-industrial"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-100 shadow-sm lucide-icon-container">
                    <TrendingUp className="w-5 h-5 text-blue-900" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">
                    Institutional{" "}
                    <span className="text-gray-400 font-bold">Trending</span>
                  </h2>
                </div>

                <div className="space-y-5">
                  {[
                    {
                      tag: "#CurriculumMastery",
                      count: "128 Active Tracks",
                      icon: Flame,
                    },
                    {
                      tag: "#InstitutionalYield",
                      count: "42 synchronizations",
                      icon: Zap,
                    },
                    {
                      tag: "#RegistryMilestone",
                      count: "85 authentications",
                      icon: Trophy,
                    },
                  ].map((topic, i) => (
                    <div
                      key={i}
                      className="p-5 bg-gray-50/50 rounded-md border border-gray-200 hover:border-blue-900 transition-all duration-300 cursor-pointer group hover:bg-white shadow-sm"
                    >
                      <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 rounded-sm bg-white border border-gray-200 text-gray-400 group-hover:text-blue-900 group-hover:border-blue-900 transition-all">
                          <topic.icon size={16} />
                        </div>
                        <p className="font-black text-gray-900 text-sm tracking-tight uppercase group-hover:text-blue-900 transition-colors">
                          {topic.tag}
                        </p>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-10 opacity-70">
                        {topic.count}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-12 p-8 bg-blue-900 text-white rounded-md border border-blue-800 text-center shadow-lg relative group">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300 mb-3">
                      Institutional Directive
                    </p>
                    <p className="text-sm font-bold leading-relaxed mb-8 px-2 italic">
                      Synchronize two assessment modules today to maintain
                      longitudinal registry validation.
                    </p>
                    <button className="w-full py-4 bg-white text-blue-900 rounded-md font-bold uppercase tracking-widest text-[10px] hover:bg-black hover:text-white transition-all shadow-md group-hover:scale-105 duration-300">
                      Access Objectives
                    </button>
                  </div>
                  <div className="absolute inset-0 opacity-[0.05] pointer-events-none heatmap-industrial bg-white"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Feed Interaction Layer */}
      <AchievementSharePopup
        isOpen={showSharePopup}
        onClose={() => setShowSharePopup(false)}
        onShare={handleSocialShare}
        achievementTitle={shareAchievementData.title}
      />

      <SocialShareToast
        isVisible={showShareToast}
        message="Achievement posted to feed!"
        onClose={() => setShowShareToast(false)}
      />
    </div>
  );
};

export default StudentSocialFeed;
