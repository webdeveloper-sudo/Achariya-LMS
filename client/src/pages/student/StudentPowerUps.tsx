import {
  Zap,
  Shield,
  Sparkles,
  Clock,
  RefreshCw,
  Cpu,
  Rocket,
  Lightbulb,
  ChevronRight,
  ArrowLeft,
  Hourglass,
  Activity,
  Box,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { studentApi } from "../../api";

interface PowerUp {
  _id: string;
  powerUpId: string;
  name: string;
  description: string;
  cost: number;
  durationText?: string;
  icon: string;
  type: "active" | "passive" | "theme";
  ownedCount: number;
  color: string;
  isOwned: boolean;
  canAfford: boolean;
  expiresAt?: string; // Added field
}

const iconMap: Record<string, any> = {
  Zap,
  Shield,
  Hourglass,
  Lightbulb,
  RefreshCw,
  Rocket,
  Cpu,
};

const StudentPowerUps = () => {
  const [credits, setCredits] = useState(0);
  const [powerups, setPowerups] = useState<PowerUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [now, setNow] = useState(new Date());

  // Update "now" every minute for timers
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await studentApi.getPowerUps();
      if (response.data.success) {
        setPowerups(response.data.powerUps);
        setCredits(response.data.balance);
      }
    } catch (error) {
      console.error("Failed to fetch power-ups:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getRemainingTime = (expiry?: string) => {
    if (!expiry) return "Permanent";
    const then = new Date(expiry);
    const diff = then.getTime() - now.getTime();
    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) return `${Math.floor(hours / 24)}d left`;
    return `${hours}h ${minutes}m left`;
  };

  const handleBuyPowerUp = async (powerupId: string) => {
    const powerup = powerups.find((p) => p.powerUpId === powerupId);
    if (!powerup || credits < powerup.cost) return;

    try {
      const response = await studentApi.purchasePowerUp(powerupId);
      if (response.data.success) {
        setCredits(response.data.newBalance);
        setToastMessage(`Module ${powerup.name} implemented.`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        // Refresh list to update counts and canAfford status
        fetchData();
      }
    } catch (error: any) {
      console.error("Purchase failed:", error);
      setToastMessage(error.response?.data?.message || "Purchase failed");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const activePowerUps = powerups
    .filter((p) => p.isOwned && (!p.expiresAt || new Date(p.expiresAt) > now))
    .map((p) => ({
      name: p.name,
      expires: getRemainingTime(p.expiresAt),
      icon: iconMap[p.icon] || Cpu,
      color: p.color,
    }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Loading Modules...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Toast Notification - Standardized */}
      {showToast && (
        <div className="fixed top-8 right-8 z-[100] bg-gray-900 text-white px-8 py-5 rounded-md shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] flex items-center gap-4 animate-in fade-in slide-in-from-right-8 border border-white/10">
          <div className="p-2 bg-blue-900 text-white rounded shadow-sm">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400 mb-0.5">
              Protocol Synchronized
            </p>
            <p className="text-[11px] font-bold uppercase tracking-widest">
              {toastMessage}
            </p>
          </div>
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

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
                Academic <span className="text-gray-400">Enhancements</span>
              </h1>
              <p className="text-gray-500 text-sm font-medium max-w-2xl leading-relaxed">
                Strategic deployment of specialized modules to optimize
                cognitive focus and authenticated assessment performance across
                high-stakes evaluations.
              </p>
            </div>

            <div className="bg-white p-6 px-10 rounded-md border border-gray-300 shadow-sm min-w-[300px]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                  Institutional Credit Reserve
                </p>
                <Activity className="text-blue-900" size={14} />
              </div>
              <div className="flex items-baseline gap-3">
                <p className="text-5xl font-bold text-gray-900 tracking-tighter leading-none">
                  {credits}
                </p>
                <div className="flex flex-col">
                  <span className="text-blue-900 font-bold uppercase tracking-widest text-[10px]">
                    Registry
                  </span>
                  <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest leading-none mt-1">
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 pb-24 -mt-6 relative z-20">
        {/* Active Modules - Industrial Refinement */}
        {activePowerUps.length > 0 && (
          <div className="mb-20">
            <div className="flex items-center gap-5 mb-10">
              <div className="bg-emerald-900 p-2 rounded shadow-lg shadow-emerald-500/20">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse border border-emerald-500"></div>
              </div>
              <span className="text-[11px] font-black text-gray-900 uppercase tracking-[0.3em]">
                Active System Enhancements
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activePowerUps.map((powerup, idx) => {
                const ActiveIcon = powerup.icon;
                return (
                  <div
                    key={idx}
                    className="group relative overflow-hidden bg-white rounded-md p-10 border border-gray-300 shadow-xl hover:shadow-2xl transition-all duration-500 hover:border-blue-900"
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-10">
                        <div className="w-16 h-16 rounded-md bg-blue-900 text-white shadow-lg border border-blue-800 group-hover:scale-110 transition-transform duration-500 flex items-center justify-center lucide-icon-container">
                          <ActiveIcon size={28} />
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">
                              Registry Authenticated
                            </span>
                          </div>
                          <Sparkles className="text-blue-200" size={18} />
                        </div>
                      </div>

                      <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-3 italic">
                        {powerup.name}
                      </h3>

                      <div className="flex items-center justify-between pt-8 border-t border-gray-50 mt-6">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                            Longitudinal Synchronization
                          </span>
                          <span className="text-[11px] font-black text-blue-900 uppercase tracking-widest italic flex items-center gap-2">
                            <Clock size={12} className="text-blue-900" />{" "}
                            {powerup.expires}
                          </span>
                        </div>
                        <div className="w-12 h-12 rounded-md bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-inner">
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                      </div>
                    </div>

                    {/* Industrial Grid Pattern Effect */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none heatmap-industrial"></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Improvements */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Box size={20} className="text-blue-600" />
            Improvement Modules
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {powerups.map((powerup) => {
            const canAfford = credits >= powerup.cost;
            const Icon = iconMap[powerup.icon] || Cpu;

            return (
              <div
                key={powerup.powerUpId}
                className={`group relative bg-white rounded-md p-10 border transition-all duration-300 ${
                  canAfford
                    ? "border-gray-300 hover:border-blue-900 shadow-sm hover:shadow-xl"
                    : "border-gray-200 opacity-60"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-16 h-16 rounded-md bg-gray-50 text-gray-400 group-hover:text-blue-900 group-hover:bg-blue-50 transition-all border border-gray-200 lucide-icon-container flex items-center justify-center">
                      <Icon size={28} />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-900 tracking-tighter">
                        {powerup.cost}
                      </p>
                      <p className="text-[9px] font-bold text-blue-900 uppercase tracking-widest leading-none mt-1">
                        Registry Credits
                      </p>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-3">
                    {powerup.name}
                  </h3>
                  <p className="text-gray-500 font-medium text-[13px] mb-8 leading-relaxed h-12 overflow-hidden">
                    {powerup.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mb-10">
                    <div className="px-3 py-1 bg-gray-50 rounded-sm border border-gray-200 text-[9px] font-bold text-gray-500 uppercase tracking-widest shadow-sm">
                      {powerup.durationText}
                    </div>
                    {powerup.isOwned && (
                      <div className="px-3 py-1 bg-emerald-900 text-white rounded-sm text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm">
                        <CheckCircle size={10} /> AVAILED
                      </div>
                    )}
                    {powerup.isOwned && powerup.expiresAt && (
                      <div className="px-3 py-1 bg-blue-900 text-white rounded-sm text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm">
                        <Clock size={10} />{" "}
                        {getRemainingTime(powerup.expiresAt)}
                      </div>
                    )}
                    {powerup.ownedCount > 1 && (
                      <div className="px-3 py-1 bg-gray-900 text-white rounded-sm text-[9px] font-bold uppercase tracking-widest shadow-sm">
                        {powerup.ownedCount} Units
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleBuyPowerUp(powerup.powerUpId)}
                    disabled={!canAfford}
                    className={`w-full py-5 rounded-md font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 shadow-sm ${
                      canAfford
                        ? "bg-blue-900 text-white hover:bg-black hover:shadow-lg"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {canAfford ? (
                      <>
                        {powerup.ownedCount > 0
                          ? "Re-Synchronize Module"
                          : "Synchronize Module"}
                        <ChevronRight
                          size={14}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </>
                    ) : (
                      "Insufficient Balance"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Information Section - Industrial Protocol */}
        <div className="bg-gray-50 border border-gray-300 rounded-md p-10 sm:p-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none heatmap-industrial"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 tracking-tight">
              Usage <span className="text-gray-400">Protocols</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-white border border-gray-300 text-blue-900 rounded-md shadow-sm lucide-icon-container">
                    <Zap size={24} />
                  </div>
                  <h3 className="font-bold text-xl tracking-tight uppercase">
                    Active Synchronizers
                  </h3>
                </div>
                <p className="text-gray-500 text-[14px] font-medium leading-relaxed max-w-md">
                  These enhancements must be manually triggered within the
                  evaluation phase. They provide a high-intensity cognitive
                  overlay for specialized assessment types.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-white border border-gray-300 text-blue-900 rounded-md shadow-sm lucide-icon-container">
                    <Shield size={24} />
                  </div>
                  <h3 className="font-bold text-xl tracking-tight uppercase">
                    Persistent Overlays
                  </h3>
                </div>
                <p className="text-gray-500 text-[14px] font-medium leading-relaxed max-w-md">
                  Background modules that operate continuously post-acquisition.
                  They ensure longitudinal stability of academic streaks and
                  institutional resource allocation.
                </p>
              </div>
            </div>
            <div className="mt-16 bg-white rounded-md border border-blue-900 p-8 flex items-center gap-8 shadow-xl">
              <div className="bg-blue-900 p-4 rounded-md text-white shadow-lg shadow-blue-200">
                <Lightbulb size={28} />
              </div>
              <div>
                <p className="font-bold text-[11px] uppercase tracking-[0.2em] text-blue-900 mb-1.5 leading-none">
                  Registry Suggestion
                </p>
                <p className="text-gray-500 font-bold text-[13px] tracking-tight">
                  Sequence Performance Accelerators with high-yield modules to
                  statistically maximize institutional credit acquisition per
                  assessment cycle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPowerUps;
