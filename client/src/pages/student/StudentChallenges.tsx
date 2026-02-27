import { useEffect, useState, useCallback } from "react";
import {
  CheckCircle,
  Gift,
  Loader2,
  AlertCircle,
  RefreshCw,
  Lock,
  Star,
  Calendar,
  Zap,
  ArrowLeft,
  TrendingUp,
  Award,
  CircleDashed,
} from "lucide-react";

import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import AchievementSharePopup from "../../components/AchievementSharePopup";
import SocialShareToast from "../../components/SocialShareToast";

interface ChallengeItem {
  _id: string;
  title: string;
  description: string;
  icon: string;
  type: "daily" | "weekly";
  reward: number;
  progress: number;
  total: number;
  completed: boolean;
  claimed: boolean;
}

interface ChallengeData {
  daily: ChallengeItem[];
  weekly: ChallengeItem[];
  resets: { dailyMs: number; weeklyMs: number };
}

const formatCountdown = (ms: number) => {
  if (ms <= 0) return "REINITIALIZING...";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h > 24) {
    const d = Math.floor(h / 24);
    const rem = h % 24;
    return `${d}d ${rem}h`;
  }
  return `${h}h ${m}m`;
};

const StudentChallenges = () => {
  const [activeTab, setActiveTab] = useState<"daily" | "weekly">("daily");
  const [data, setData] = useState<ChallengeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [claimMsg, setClaimMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState({ dailyMs: 0, weeklyMs: 0 });

  // Social Share State
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [shareAchievementData] = useState({
    title: "",
    type: "",
  });

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/students/challenges");
      setData(res.data);
      setCountdown({
        dailyMs: res.data.resets.dailyMs,
        weeklyMs: res.data.resets.weeklyMs,
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to load academic objectives",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSocialShare = async () => {
    try {
      await axiosInstance.post(
        "/social/share-achievement",
        shareAchievementData,
      );
      setShowSharePopup(false);
      setShowShareToast(true);
    } catch (err) {
      console.error("Failed to share achievement:", err);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => ({
        dailyMs: Math.max(0, prev.dailyMs - 1000),
        weeklyMs: Math.max(0, prev.weeklyMs - 1000),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClaim = async (ch: ChallengeItem) => {
    setClaiming(ch._id);
    setClaimMsg(null);
    try {
      const res = await axiosInstance.post(
        `/students/challenges/${ch._id}/claim`,
      );
      setClaimMsg(res.data.message || `+${ch.reward} credits earned!`);

      fetchChallenges();
      setTimeout(() => setClaimMsg(null), 4000);
    } catch (err: any) {
      setClaimMsg(
        err.response?.data?.message || "Internal validation failure.",
      );
      setTimeout(() => setClaimMsg(null), 4000);
    } finally {
      setClaiming(null);
    }
  };

  const challenges = data?.[activeTab] || [];
  const earnedToday = (data?.daily || [])
    .filter((c) => c.claimed)
    .reduce((s, c) => s + c.reward, 0);
  const earnedWeek = (data?.weekly || [])
    .filter((c) => c.claimed)
    .reduce((s, c) => s + c.reward, 0);
  const completedCount = challenges.filter((c) => c.completed).length;
  const allComplete =
    challenges.length > 0 && challenges.every((c) => c.completed);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-6">
        <div className="w-12 h-12 border-2 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Synchronizing Objectives...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-md shadow-sm border border-gray-100 text-center max-w-lg">
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-red-400 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
            Connection Interrupted
          </h2>
          <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
            {error}
          </p>
          <button
            onClick={fetchChallenges}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-md font-bold uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all"
          >
            <RefreshCw size={14} /> Retry Sync
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Toast Notification - Standardized */}
      {claimMsg && (
        <div className="fixed top-8 right-8 z-[100] bg-gray-900 text-white px-8 py-5 rounded-md shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] flex items-center gap-4 animate-in fade-in slide-in-from-right-8 border border-white/10">
          <div className="p-2 bg-emerald-500 text-white rounded shadow-sm">
            <CheckCircle className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest">
            {claimMsg}
          </p>
        </div>
      )}

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
                Self-Study <span className="text-gray-400">Objectives</span>
              </h1>
              <p className="text-gray-500 text-sm font-medium max-w-2xl leading-relaxed">
                Strategic targets designed to optimize academic focus and
                consistency. Complete these longitudinal tasks to finalize your
                institutional credit yield.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-white p-6 px-10 rounded-md border border-gray-300 shadow-sm min-w-[180px]">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 leading-none">
                  Daily Yield
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900 tracking-tighter">
                    +{earnedToday}
                  </span>
                  <span className="text-[10px] font-bold text-blue-900 uppercase tracking-widest">
                    Credits
                  </span>
                </div>
              </div>
              <div className="bg-white p-6 px-10 rounded-md border border-gray-300 shadow-sm min-w-[180px]">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 leading-none">
                  Weekly Yield
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900 tracking-tighter">
                    +{earnedWeek}
                  </span>
                  <span className="text-[10px] font-bold text-blue-900 uppercase tracking-widest">
                    Credits
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 pb-24 -mt-6 relative z-20">
        {/* Tab Selection - Standardized Industrial */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {[
            {
              id: "daily",
              icon: Calendar,
              label: "Circadian Tasks",
              reset: countdown.dailyMs,
            },
            {
              id: "weekly",
              icon: TrendingUp,
              label: "Longitudinal Goals",
              reset: countdown.weeklyMs,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-8 p-8 rounded-md border transition-all duration-300 group ${
                activeTab === tab.id
                  ? "bg-white border-blue-900 shadow-xl ring-1 ring-blue-50/50"
                  : "bg-white border-gray-300 text-gray-400 hover:border-blue-400"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-md flex items-center justify-center transition-all border shadow-sm ${activeTab === tab.id ? "bg-blue-900 text-white border-blue-800" : "bg-gray-50 text-gray-400 border-gray-100"}`}
              >
                <tab.icon
                  size={24}
                  className="group-hover:scale-110 transition-transform"
                />
              </div>
              <div className="text-left">
                <span
                  className={`block text-[11px] font-bold uppercase tracking-[0.2em] mb-1.5 ${activeTab === tab.id ? "text-blue-900" : "text-gray-400"}`}
                >
                  {tab.label}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  Registry Reset:{" "}
                  <span className="text-gray-900 font-black">
                    {formatCountdown(tab.reset)}
                  </span>
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Status Summary Grid - Refined */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              label: "Authenticated",
              value: `${completedCount}/${challenges.length}`,
              icon: CheckCircle,
              color: "emerald",
            },
            {
              label: "In Sync",
              value: challenges.filter((c) => !c.completed && c.progress > 0)
                .length,
              icon: Zap,
              color: "blue",
            },
            {
              label: "Unverified Yield",
              value: `+${challenges.filter((c) => !c.claimed && c.completed).reduce((s, c) => s + c.reward, 0)}`,
              icon: Gift,
              color: "blue",
            },
            {
              label: "Pending Protocol",
              value: challenges.filter((c) => !c.completed).length,
              icon: CircleDashed,
              color: "gray",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-md border border-gray-300 shadow-sm flex flex-col items-center text-center group hover:border-blue-900 transition-all duration-300 hover:shadow-xl"
            >
              <div className="p-4 bg-gray-50 rounded-md mb-6 text-gray-400 group-hover:bg-blue-900 group-hover:text-white transition-all shadow-sm border border-gray-100 lucide-icon-container">
                <stat.icon size={20} />
              </div>
              <p className="text-3xl font-bold text-gray-900 tracking-tighter mb-1">
                {stat.value}
              </p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Objectives Feed - Standardized */}
        <div className="space-y-6">
          {challenges.length === 0 ? (
            <div className="bg-gray-50 p-24 rounded-md border border-gray-300 text-center shadow-inner">
              <div className="bg-white w-20 h-20 rounded-md flex items-center justify-center mx-auto mb-8 border border-gray-200 lucide-icon-container">
                <Lock size={32} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Registry Empthy
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                No active objectives established in this cycle.
              </p>
            </div>
          ) : (
            challenges.map((challenge, idx) => {
              const weight = Math.min(
                (challenge.progress / challenge.total) * 100,
                100,
              );
              const isClaiming = claiming === challenge._id;

              return (
                <div
                  key={challenge._id || idx}
                  className={`group bg-white rounded-md p-8 sm:p-10 border transition-all duration-300 ${
                    challenge.claimed
                      ? "border-emerald-200 bg-emerald-50/10"
                      : challenge.completed
                        ? "border-blue-900 bg-blue-50/20 shadow-xl ring-1 ring-blue-50/50"
                        : "border-gray-300 hover:border-blue-400 shadow-sm"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                    <div className="flex items-start gap-8">
                      <div
                        className={`w-16 h-16 rounded-md flex items-center justify-center flex-shrink-0 border transition-all shadow-sm ${
                          challenge.claimed
                            ? "bg-emerald-900 text-white border-emerald-800"
                            : challenge.completed
                              ? "bg-blue-900 text-white border-blue-800"
                              : "bg-gray-900 text-white border-gray-800"
                        }`}
                      >
                        {challenge.claimed ? (
                          <CheckCircle size={28} />
                        ) : (
                          <Gift size={28} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-4 mb-2.5">
                          <h3 className="text-xl font-bold text-gray-900 tracking-tight truncate group-hover:text-blue-900 transition-colors">
                            {challenge.title}
                          </h3>
                          {challenge.claimed && (
                            <span className="text-[8px] font-bold bg-emerald-900 text-white px-2.5 py-1 rounded-sm uppercase tracking-widest shadow-sm">
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-[13px] font-medium leading-relaxed max-w-xl">
                          {challenge.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-10 min-w-[320px]">
                      <div className="flex items-center gap-10">
                        <div className="text-right">
                          <p className="text-3xl font-bold text-gray-900 tracking-tighter leading-none">
                            +{challenge.reward}
                          </p>
                          <p className="text-[9px] font-bold text-blue-900 uppercase tracking-widest mt-1.5">
                            Yield Credits
                          </p>
                        </div>
                        <div className="w-px h-10 bg-gray-100"></div>
                        <div className="text-right">
                          <div className="flex items-baseline justify-end gap-1">
                            <p className="text-2xl font-bold text-gray-900 tracking-tighter leading-none">
                              {challenge.progress}
                            </p>
                            <span className="text-[12px] font-bold text-gray-400">
                              / {challenge.total}
                            </span>
                          </div>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">
                            Target Sync
                          </p>
                        </div>
                      </div>

                      <div className="w-full sm:w-48 flex-shrink-0">
                        {challenge.claimed ? (
                          <div className="flex items-center justify-center gap-2 text-emerald-900 font-bold uppercase tracking-[0.2em] text-[10px] py-4 bg-emerald-50 rounded-md border border-emerald-200">
                            PROTOCOL FINALIZED
                          </div>
                        ) : challenge.completed ? (
                          <button
                            onClick={() => handleClaim(challenge)}
                            disabled={isClaiming}
                            className="w-full py-4 bg-blue-900 text-white rounded-md font-bold uppercase tracking-widest text-[10px] shadow-lg hover:bg-blue-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                          >
                            {isClaiming ? (
                              <Loader2 className="animate-spin" size={12} />
                            ) : (
                              <>
                                <Award size={14} /> CLAIM YIELD
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="space-y-3">
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200 progress-bar-industrial">
                              <div
                                className="h-full bg-blue-900 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(30,58,138,0.2)]"
                                style={{ width: `${weight}%` }}
                              ></div>
                            </div>
                            <p className="text-[9px] font-bold text-gray-400 text-center uppercase tracking-widest">
                              <span className="text-blue-900">
                                {Math.round(weight)}%
                              </span>{" "}
                              longitudinal synchronization
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Milestone Completion Banner */}
        {allComplete && (
          <div className="mt-12 bg-gray-900 text-white rounded-md p-10 flex flex-col items-center text-center relative overflow-hidden group shadow-md border border-white/5">
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-md flex items-center justify-center mx-auto mb-6 border border-white/10">
                <Star size={32} className="text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2 tracking-tight">
                Cycle Complete
              </h2>
              <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-lg mx-auto mb-8">
                All established objectives for this cycle have been validated.
                Your progress has been logged in the central academic record.
              </p>
              <button
                onClick={fetchChallenges}
                className="px-8 py-4 bg-white text-gray-900 rounded-md font-bold uppercase tracking-widest text-[9px] hover:bg-blue-100 transition-all"
              >
                Refresh Log
              </button>
            </div>
            {/* Subtle Design Accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
          </div>
        )}
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

export default StudentChallenges;
