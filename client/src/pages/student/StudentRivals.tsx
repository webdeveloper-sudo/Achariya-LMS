import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Swords,
  Trophy,
  HeartOff,
  GraduationCap,
  Laptop,
  ArrowLeft,
  Zap,
  Flame,
  Shield,
  Search,
  Loader2,
  CircleDashed,
  Medal,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { useStudentStore } from "../../store/useStudentStore";

const StudentRivals = () => {
  const { student } = useStudentStore();
  const [selectedTab, setSelectedTab] = useState<"active" | "history">(
    "active",
  );
  const [rivals, setRivals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRival, setSelectedRival] = useState<any>(null);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    const fetchRivals = async () => {
      try {
        const res = await axiosInstance.get("/social/rivals");
        setRivals(res.data.rivals || []);
      } catch (err) {
        console.error("Failed to fetch rivals:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRivals();
  }, []);

  const activeRivals = [
    {
      id: 1,
      name: "Aisha Khan",
      class: "10-A",
      avatar: GraduationCap,
      wins: 3,
      losses: 1,
      status: "active",
      score: "12 vs 8",
      activity: "Quiz Battle - Calculus",
      rank: 2,
    },
    {
      id: 2,
      name: "Vikram Joshi",
      class: "CS Year 2",
      avatar: Laptop,
      wins: 2,
      losses: 2,
      status: "active",
      score: "10 vs 10",
      activity: "Quiz Battle - Physics",
      rank: 4,
    },
  ];

  const completedRivals = [
    {
      id: 3,
      name: "Rahul Patel",
      class: "12 Science",
      avatar: GraduationCap,
      result: "won",
      score: "95 vs 88",
      date: "2 days ago",
    },
    {
      id: 4,
      name: "Divya Menon",
      class: "10-B",
      avatar: GraduationCap,
      result: "lost",
      score: "82 vs 90",
      date: "5 days ago",
    },
  ];

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleChallenge = (student: any) => {
    setSelectedRival(student);
    setShowCompare(true);
  };

  const confirmChallenge = async () => {
    try {
      await axiosInstance.post("/social/challenge", {
        opponentId: selectedRival._id,
        type: "DAILY_STREAK",
      });
      setShowCompare(false);
      setToastMessage(
        `Duel invitation dispatched to ${selectedRival.studentName}!`,
      );
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error("Challenge failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Premium Toast */}
      {showToast && (
        <div className="fixed top-10 right-10 z-[100] bg-gray-900 border border-white/20 text-white px-8 py-5 rounded-[1.5rem] shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-10 backdrop-blur-xl">
          <div className="bg-red-500 p-2 rounded-xl">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <p className="text-red-200 font-black uppercase tracking-widest text-[8px] mb-1">
              Conflict Initiated
            </p>
            <p className="text-sm font-black italic">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-950 via-blue-900 to-indigo-900 text-white pt-10 pb-24 px-6 sm:px-10 overflow-hidden relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <Link
            to="/student/dashboard"
            className="inline-flex items-center text-blue-200/60 hover:text-white mb-8 transition-all hover:-translate-x-1 font-bold group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-500/20 p-2 rounded-xl border border-white/10 backdrop-blur-md">
                  <Zap className="w-5 h-5 text-red-400" />
                </div>
                <span className="text-blue-200 font-black tracking-[0.2em] text-[10px] uppercase italic">
                  Competitive Matrix
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-4 tracking-tight leading-tight">
                Elite <span className="text-blue-400 italic">Rivals</span>
              </h1>
              <p className="text-blue-100/60 text-lg font-medium italic max-w-2xl leading-relaxed">
                Engage in structured academic duels. Challenge cohorts to
                optimize performance and secure higher hierarchy status.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl min-w-[280px] relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest italic">
                    Efficiency Rating
                  </p>
                  <Flame className="text-orange-500 animate-pulse" size={16} />
                </div>
                <p className="text-6xl font-black text-white tracking-tighter mb-2">
                  75%
                </p>
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.3em]">
                  5 Wins â€¢ 2 Defeats
                </p>
              </div>
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600 rounded-full mix-blend-screen filter blur-[140px] opacity-10 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-500 rounded-full mix-blend-screen filter blur-[100px] opacity-10 translate-y-1/2 -translate-x-1/4"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 pb-24 -mt-12 relative z-20">
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          {[
            {
              id: "active",
              label: "Active Encounters",
              count: activeRivals.length,
              icon: Swords,
            },
            {
              id: "history",
              label: "Conflict Registry",
              count: completedRivals.length,
              icon: Trophy,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex-1 group relative overflow-hidden flex flex-col items-center justify-center p-6 py-8 rounded-[2.5rem] border transition-all duration-500 ${
                selectedTab === tab.id
                  ? "bg-white border-blue-200 shadow-2xl shadow-blue-100/30"
                  : "bg-white/50 backdrop-blur-xl border-gray-100 hover:border-blue-200 opacity-60 hover:opacity-100"
              }`}
            >
              <div
                className={`p-4 rounded-2xl mb-3 transition-colors ${selectedTab === tab.id ? "bg-red-600 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-red-50 group-hover:text-red-500"}`}
              >
                <tab.icon size={24} />
              </div>
              <span
                className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 ${selectedTab === tab.id ? "text-gray-900" : "text-gray-400"}`}
              >
                {tab.label}
              </span>
              <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest italic opacity-60">
                {tab.count} Data Entries
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            {selectedTab === "active" ? (
              <div className="space-y-6">
                {activeRivals.map((rival, idx) => (
                  <div
                    key={rival.id}
                    className="group relative overflow-hidden bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
                  >
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                      <div className="flex items-start gap-8">
                        <div className="relative">
                          <div className="w-24 h-24 bg-gray-900 rounded-[2rem] flex items-center justify-center text-white border-4 border-white shadow-2xl overflow-hidden group-hover:scale-110 transition-transform duration-500">
                            {typeof rival.avatar === "string" ? (
                              <img
                                src={rival.avatar}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <rival.avatar
                                size={40}
                                className="relative z-10"
                              />
                            )}
                          </div>
                          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white border-2 border-white shadow-lg">
                            <Flame size={18} />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <Link
                              to={`/student/profile/${rival.id}`}
                              className="hover:text-red-600 transition-colors"
                            >
                              <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-none italic inherit-color">
                                {rival.name}
                              </h3>
                            </Link>
                            <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[8px] font-black uppercase tracking-widest">
                              Rank #{rival.rank}
                            </div>
                          </div>
                          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-4">
                            Unit: {rival.class}
                          </p>
                          <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-[10px] font-black uppercase tracking-widest italic w-fit">
                            <CircleDashed size={14} className="animate-spin" />
                            {rival.activity}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center md:items-end gap-4 min-w-[200px]">
                        <div className="bg-gray-50 rounded-[1.5rem] px-8 py-5 border border-gray-100 text-center">
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">
                            Synchronization Score
                          </p>
                          <p className="text-4xl font-black text-gray-900 tracking-tighter">
                            {rival.score}
                          </p>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Historical:{" "}
                          <span className="text-emerald-500">
                            {rival.wins}W
                          </span>{" "}
                          â€”{" "}
                          <span className="text-red-500">{rival.losses}L</span>
                        </p>
                      </div>
                    </div>
                    <span className="absolute top-0 right-10 text-[140px] font-black text-gray-900/5 leading-none select-none -translate-y-1/4 pointer-events-none italic">
                      {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {completedRivals.map((rival) => (
                  <div
                    key={rival.id}
                    className={`group relative overflow-hidden bg-white rounded-[2.5rem] p-8 border transition-all duration-500 hover:shadow-xl ${
                      rival.result === "won"
                        ? "border-emerald-100 bg-emerald-50/10"
                        : "border-red-100 bg-red-50/10"
                    }`}
                  >
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div
                          className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl ${rival.result === "won" ? "bg-emerald-500" : "bg-red-500"}`}
                        >
                          {rival.result === "won" ? (
                            <Trophy size={28} />
                          ) : (
                            <HeartOff size={28} />
                          )}
                        </div>
                        <div>
                          <Link
                            to={`/student/profile/${rival.id}`}
                            className="hover:text-red-600 transition-colors"
                          >
                            <h3 className="text-xl font-black text-gray-900 tracking-tight italic inherit-color">
                              {rival.name}
                            </h3>
                          </Link>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">
                            {rival.class} â€¢ {rival.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-4xl font-black tracking-tighter mb-1 ${rival.result === "won" ? "text-emerald-600" : "text-red-600"}`}
                        >
                          {rival.result === "won" ? "Triumph" : "Overcome"}
                        </p>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">
                          Final Index: {rival.score}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-10">
            <div className="bg-gradient-to-br from-gray-900 via-indigo-950 to-blue-950 text-white rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-10">
                  <div className="bg-red-600 p-2 rounded-xl">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight italic">
                    Find Adversary
                  </h2>
                </div>

                <div className="space-y-8 mb-12">
                  {loading ? (
                    <div className="flex flex-col items-center py-10 opacity-50">
                      <Loader2 className="animate-spin mb-4" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">
                        Scanning Network...
                      </p>
                    </div>
                  ) : (
                    rivals.map((rival) => (
                      <div
                        key={rival._id}
                        className="group border-b border-white/5 pb-8 last:border-0 hover:border-red-500/30 transition-colors"
                      >
                        <div className="flex items-center gap-5 mb-6">
                          <div className="w-16 h-16 bg-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-all overflow-hidden">
                            {rival.avatar ? (
                              <img
                                src={rival.avatar}
                                alt={rival.studentName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <GraduationCap
                                size={32}
                                className="text-blue-200"
                              />
                            )}
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center justify-between">
                              <Link
                                to={`/student/profile/${rival._id}`}
                                className="hover:text-red-600 transition-colors"
                              >
                                <p className="font-black text-xl italic tracking-tight inherit-color">
                                  {rival.studentName}
                                </p>
                              </Link>
                              <div className="px-2 py-0.5 bg-blue-600 rounded text-[7px] font-black uppercase">
                                {rival.matchScore}% Match
                              </div>
                            </div>
                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.3em]">
                              Rank #{rival.gamification?.rank || "---"} â€¢{" "}
                              {rival.class}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleChallenge(rival)}
                          className="w-full py-4 bg-white/5 hover:bg-red-600 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all shadow-xl active:scale-95"
                        >
                          Initiate Comparison
                        </button>
                      </div>
                    ))
                  )}
                  {!loading && rivals.length === 0 && (
                    <p className="text-center text-white/30 text-xs italic py-10">
                      No suitable adversaries found in your sector.
                    </p>
                  )}
                </div>

                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                  <h4 className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-4 italic flex items-center gap-2">
                    <Shield size={14} /> Competitive Protocol
                  </h4>
                  <ul className="space-y-4">
                    {[
                      "Duels last 24 orbital hours.",
                      "Highest synchronization index wins extra credits.",
                      "Victories contribute to Tier Ascension.",
                    ].map((rule, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-[10px] font-medium text-white/60 italic leading-relaxed"
                      >
                        <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 blur-3xl opacity-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600 blur-3xl opacity-20"></div>
            </div>
          </div>
        </div>
      </div>

      {showCompare && selectedRival && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-500 p-4">
          <div className="bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] max-w-4xl w-full overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-500">
            <div className="bg-gray-900 text-white p-10 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900/50 to-blue-900/50 opacity-50"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-12 mb-8">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-blue-600 rounded-[2rem] border-4 border-white overflow-hidden mb-4 rotate-[-6deg]">
                      {(student as any)?.avatar ? (
                        <img
                          src={(student as any).avatar}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <GraduationCap size={48} className="m-auto h-full" />
                      )}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">
                      Initiator
                    </p>
                    <p className="text-xl font-black italic">
                      {(student as any)?.studentName || student?.name}
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white rotate-45 shadow-2xl">
                      <Swords size={32} className="-rotate-45" />
                    </div>
                    <p className="text-sm font-black italic mt-4 uppercase tracking-[0.5em] text-red-500">
                      VS
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-gray-800 rounded-[2rem] border-4 border-white overflow-hidden mb-4 rotate-[6deg]">
                      {selectedRival.avatar ? (
                        <img
                          src={selectedRival.avatar}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <GraduationCap size={48} className="m-auto h-full" />
                      )}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">
                      Adversary
                    </p>
                    <p className="text-xl font-black italic">
                      {selectedRival.studentName}
                    </p>
                  </div>
                </div>
                <h2 className="text-3xl font-black italic uppercase tracking-tight">
                  Academic <span className="text-blue-400">Duel Interface</span>
                </h2>
              </div>
            </div>

            <div className="p-12">
              <div className="grid grid-cols-3 gap-10 mb-12">
                {[
                  {
                    label: "Institutional Rank",
                    left: `#${(student as any)?.gamification?.rank || "--"}`,
                    right: `#${selectedRival.gamification?.rank || "--"}`,
                    icon: Medal,
                  },
                  {
                    label: "Credit Capital",
                    left: student?.credits || 0,
                    right: selectedRival.gamification?.totalCredits || 0,
                    icon: Zap,
                  },
                  {
                    label: "System Streak",
                    left: `${student?.currentStreak || 0}D`,
                    right: `${Math.floor(Math.random() * 10)}D`,
                    icon: Flame,
                  },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <stat.icon size={14} className="text-gray-400" />
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                        {stat.label}
                      </p>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <span className="text-lg font-black text-blue-600">
                        {stat.left}
                      </span>
                      <div className="w-px h-6 bg-gray-200"></div>
                      <span className="text-lg font-black text-gray-900">
                        {stat.right}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowCompare(false)}
                  className="flex-1 py-5 rounded-2xl border border-gray-300 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all"
                >
                  Abort Sequence
                </button>
                <button
                  onClick={confirmChallenge}
                  className="flex-[2] py-5 rounded-2xl bg-gray-900 text-white font-black uppercase tracking-[0.3em] text-[10px] hover:bg-red-600 transition-all shadow-xl active:scale-95 shadow-red-500/10"
                >
                  Authorize Engagement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentRivals;
