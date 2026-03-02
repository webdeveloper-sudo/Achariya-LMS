import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Trophy,
  Award,
  TrendingUp,
  Clock,
  ArrowLeft,
  Sparkles,
  Target,
  Medal,
  BookOpen,
} from "lucide-react";
import { studentApi } from "../../api";

const PublicProfilePage = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!studentId) return;
      try {
        const res = await studentApi.getPublicProfile(studentId);
        setProfileData(res.data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setError("Could not load student profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-2 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
          Retrieving Academic Record...
        </p>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-gray-50 p-10 rounded-md border border-gray-100 max-w-sm shadow-sm">
          <p className="text-gray-900 font-bold mb-6">
            {error || "Profile not found."}
          </p>
          <Link
            to="/student/dashboard"
            className="inline-flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest text-[10px] hover:text-blue-700"
          >
            <ArrowLeft size={16} /> Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { profile, activity } = profileData;

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
    <div className="min-h-screen bg-white p-6 sm:p-10 max-w-6xl mx-auto">
      <Link
        to={-1 as any}
        className="inline-flex items-center text-gray-400 hover:text-blue-600 mb-10 transition-colors font-bold text-[10px] uppercase tracking-widest"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Sidebar: Profile Summary */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-white border border-gray-300 rounded-md p-8 shadow-sm text-center">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="w-full h-full bg-gray-50 rounded-full flex items-center justify-center text-4xl text-gray-300 font-bold overflow-hidden border border-gray-100">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Trophy className="text-gray-300 w-1/2 h-1/2" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-md shadow-lg border border-white">
                <Trophy size={16} />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
              {profile.name}
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">
              {profile.class} {profile.section} â€¢ {profile.rank}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
              <div className="text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Credits
                </p>
                <p className="text-xl font-bold text-blue-600">
                  {profile.credits}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Streak
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {profile.streak} Days
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-300 rounded-md p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">
                Achievements
              </h3>
            </div>
            {profile.badges.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {profile.badges.map((badge: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-md text-[10px] font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2"
                  >
                    <Sparkles size={12} className="text-blue-500" />
                    {badge.name}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] font-medium text-gray-400 italic">
                No badges earned yet.
              </p>
            )}
          </div>

          {/* Conditional Power-ups Section (Only if present in response) */}
          {profile.powerUps && profile.powerUps.length > 0 && (
            <div className="bg-white border border-gray-300 rounded-md p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">
                  System Enhancements
                </h3>
              </div>
              <div className="space-y-4">
                {profile.powerUps.map((pu: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles size={14} className="text-blue-600" />
                      <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">
                        {pu.powerUpId.replace(/_/g, " ")}
                      </span>
                    </div>
                    {pu.expiresAt && (
                      <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">
                        Active
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Content: Activity & Stats */}
        <div className="lg:col-span-8 space-y-10">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                label: "Courses",
                val: profile.enrolledCount,
                icon: BookOpen,
                color: "blue",
              },
              {
                label: "Completed",
                val: profile.completedModules || 0,
                icon: Target,
                color: "gray",
              },
              {
                label: "Rank",
                val: `#${profile.rank || "---"}`,
                icon: Medal,
                color: "gray",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white border border-gray-300 rounded-md p-6 shadow-sm flex items-center gap-5"
              >
                <div className="bg-gray-50 p-2.5 rounded border border-gray-100">
                  <stat.icon size={18} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                    {stat.label}
                  </p>
                  <p className="text-xl font-bold text-gray-900 tracking-tight">
                    {stat.val}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Activity Feed */}
          <div className="bg-white border border-gray-300 rounded-md shadow-sm">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">
                  Recent Activity
                </h3>
              </div>
            </div>

            <div className="divide-y divide-gray-50">
              {activity.length > 0 ? (
                activity.map((item: any) => (
                  <div
                    key={item._id}
                    className="p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="mt-1 bg-blue-50 p-2 rounded border border-blue-100 text-blue-600">
                      <Clock size={14} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900 leading-relaxed mb-1">
                        <span className="font-bold">{profile.name}</span>{" "}
                        {item.verb.toLowerCase()} {item.object}
                        {item.targetName && (
                          <span className="text-gray-400">
                            {" "}
                            in {item.targetName}
                          </span>
                        )}
                      </p>
                      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                        {getTimeAgo(item.timestamp || item.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center opacity-50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    No recent activity found.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;
