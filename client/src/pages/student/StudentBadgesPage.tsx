import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Loader2,
  Trophy,
  Lock,
  ShieldCheck,
  Star,
  Zap,
  Clock,
  BookOpen,
  Users,
  Moon,
  Sunrise,
  GraduationCap,
  Swords,
  RotateCcw,
  ArrowLeft,
  Activity,
  Award,
  AlertCircle,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  isEarned: boolean;
  earnedAt?: string;
  creditReward: number;
  category: string;
}

const ICON_MAP: Record<string, any> = {
  SPEED_MASTER: Zap,
  HIGH_PERFORMER: Star,
  CONSISTENT: Clock,
  EXCELLENCE: Trophy,
  MENTOR: Users,
  COURSE_CRUSHER: BookOpen,
  NIGHT_OWL: Moon,
  EARLY_BIRD: Sunrise,
  QUIZ_WHIZ: GraduationCap,
  RIVAL_DOMINATOR: Swords,
};

const StudentBadges = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBadges = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/gamification/badges");
      if (res.data && res.data.badges) {
        setBadges(res.data.badges);
        setError(null);
      }
    } catch (err: any) {
      console.error("Failed to fetch badges:", err);
      setError(
        err.response?.data?.message || "Failed to load academic recognitions",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await axiosInstance.post("/gamification/sync-badges");
      await fetchBadges();
    } catch (err: any) {
      console.error("Sync failed:", err);
      alert(err.response?.data?.message || "Synchronization failed");
    } finally {
      setSyncing(false);
    }
  };

  const categories = Array.from(new Set(badges.map((b) => b.category)));
  const earnedCount = badges.filter((b) => b.isEarned).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-6">
        <div className="w-12 h-12 border-2 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Synchronizing Achievements...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-md shadow-sm border border-gray-100 text-center max-w-lg">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-6" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Vault Synchronicity Error
          </h2>
          <p className="text-gray-500 text-sm mb-8 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-gray-900 text-white rounded-md font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-sm"
          >
            Retry Analytics
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section - Standardized Industrial Refinement */}
      <div className="bg-gray-50 border-b border-gray-100 pb-12 px-6 sm:px-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex justify-between items-start mb-8">
            <Link
              to="/student/dashboard"
              className="inline-flex items-center text-gray-500 hover:text-blue-900 transition-colors text-[12px] uppercase tracking-widest group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Dashboard
            </Link>

            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-3 px-8 py-3 bg-gray-900 hover:bg-blue-900 text-white rounded-md font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg disabled:opacity-50"
            >
              {syncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              {syncing ? "Updating Registry..." : "Sync Achievements"}
            </button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
                Academic <span className="text-gray-400">Accomplishments</span>
              </h1>
              <p className="text-gray-500 text-sm font-medium max-w-2xl leading-relaxed">
                Official recognition of curriculum mastery, consistent academic
                intensity, and distinguished engagement patterns authenticated
                by the central registry.
              </p>
            </div>

            <div className="bg-white p-6 px-10 rounded-md border border-gray-300 shadow-sm min-w-[240px]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                  Authenticated Registry
                </p>
                <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold text-gray-900 tracking-tighter leading-none">
                  {earnedCount}
                </p>
                <span className="text-2xl text-gray-300 font-bold">/</span>
                <span className="text-2xl text-gray-400 font-bold">
                  {badges.length}
                </span>
                <span className="text-[10px] font-bold text-blue-900 uppercase tracking-widest ml-1 italic">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 pb-24 -mt-6 relative z-20">
        {/* Progress Matrix - Standardized */}
        <div className="bg-white rounded-md border border-gray-300 p-8 sm:p-10 mb-16 shadow-lg shadow-gray-100/50">
          <div className="flex justify-between items-end mb-6">
            <div className="flex items-center gap-6">
              <div className="bg-gray-50 p-3 rounded-md border border-gray-100 shadow-sm lucide-icon-container">
                <Activity size={24} className="text-blue-900" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                  Institutional Completion Index
                </h3>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                  Aggregate Milestone Metrics{" "}
                  <span className="w-1 h-1 bg-gray-200 rounded-full"></span>{" "}
                  <span className="text-blue-900">VERIFIED</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-4xl text-blue-900 tracking-tighter">
                {badges.length > 0
                  ? Math.round((earnedCount / badges.length) * 100)
                  : 0}
                %
              </span>
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                Global Achievement
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-100 border border-gray-200 rounded-full h-2.5 overflow-hidden progress-bar-industrial">
            <div
              className="bg-blue-900 h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(30,58,138,0.3)]"
              style={{
                width: `${badges.length > 0 ? (earnedCount / badges.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Badge Categories */}
        {categories.length > 0 ? (
          categories.map((category) => {
            const categoryBadges = badges.filter(
              (b) => b.category === category,
            );
            const categoryEarned = categoryBadges.filter(
              (b) => b.isEarned,
            ).length;

            return (
              <div key={category} className="mb-16">
                <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <Award size={18} className="text-blue-600" />
                    <h2 className="text-lg font-bold text-gray-900 tracking-tight uppercase">
                      {category} Recognition
                    </h2>
                  </div>
                  <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded border border-gray-100">
                    Sector Completion: {categoryEarned} /{" "}
                    {categoryBadges.length}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {categoryBadges.map((badge) => {
                    const Icon = ICON_MAP[badge.id] || ShieldCheck;
                    return (
                      <div
                        key={badge.id}
                        className={`group relative rounded-md p-10 border transition-all duration-500 ${
                          badge.isEarned
                            ? "bg-white border-blue-900 shadow-xl ring-1 ring-blue-50/50"
                            : "bg-gray-50/50 border-gray-300 grayscale opacity-70"
                        }`}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div
                            className={`w-20 h-20 rounded-md flex items-center justify-center text-4xl mb-8 transition-all duration-500 group-hover:scale-110 shadow-sm lucide-icon-container ${
                              badge.isEarned
                                ? "bg-white border border-gray-300"
                                : "bg-white border border-gray-200"
                            }`}
                          >
                            <span className="relative z-10 group-hover:rotate-6 transition-transform">
                              {badge.icon}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-gray-900 mb-3 tracking-tight group-hover:text-blue-900 transition-colors uppercase">
                            {badge.name}
                          </h3>
                          <p className="text-[12px] text-gray-500 font-medium leading-relaxed min-h-[48px] mb-8">
                            {badge.description}
                          </p>

                          <div className="w-full mt-auto pt-8 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <Icon
                                size={16}
                                className={
                                  badge.isEarned
                                    ? "text-blue-900"
                                    : "text-gray-400"
                                }
                              />
                              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-widest">
                                +{badge.creditReward} Yield
                              </span>
                            </div>

                            {badge.isEarned ? (
                              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-emerald-900 text-white rounded-sm text-[8px] font-bold uppercase tracking-widest shadow-sm">
                                <CheckCircle size={10} /> VERIFIED
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-gray-400 px-2.5 py-1.5 bg-gray-100 rounded-sm">
                                <Lock size={10} />
                                <span className="text-[8px] font-bold uppercase tracking-widest">
                                  LOCKED
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {badge.isEarned && (
                          <div className="absolute top-5 right-5 text-[9px] font-bold text-gray-300 uppercase tracking-widest italic group-hover:text-blue-900/20 transition-colors">
                            {badge.earnedAt
                              ? new Date(badge.earnedAt).toLocaleDateString()
                              : "Active"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-24 bg-gray-50 rounded-md border border-dashed border-gray-300">
            <Activity className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
              Achievement registry currently undergoing maintenance or zero
              objective state.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const CheckCircle = ({ size }: { size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default StudentBadges;
