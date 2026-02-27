import { useState, useEffect, useCallback } from "react";
import {
  X,
  Check,
  Sun,
  Moon,
  Palette,
  Image as ImageIcon,
  Music,
  ScrollText,
  School,
  Book,
  Gift,
  BookOpen,
  GraduationCap,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  Zap,
  ChevronRight,
  Layout,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

interface MarketplaceItem {
  _id: string;
  itemId: string;
  name: string;
  description: string;
  cost: number;
  type: string;
  iconName: string;
  color: string;
  isOwned?: boolean;
  canAfford?: boolean;
}

const ICON_MAP: Record<string, any> = {
  Sun,
  Moon,
  Palette,
  Image: ImageIcon,
  Music,
  ScrollText,
  Layout,
  Zap,
  Gift,
  Book,
  BookOpen,
  GraduationCap,
  School,
};

const StudentMarketplace = () => {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("All Items");

  const [showSuccess, setShowSuccess] = useState(false);
  const [purchasedItem, setPurchasedItem] = useState("");
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const fetchMarketplace = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/gamification/marketplace");
      setItems(res.data.items);
      setBalance(res.data.balance);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load academic store");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketplace();
  }, [fetchMarketplace]);

  const handlePurchase = async (item: MarketplaceItem) => {
    setPurchasing(item.itemId);
    try {
      const res = await axiosInstance.post("/gamification/purchase-item", {
        itemId: item.itemId,
      });

      if (res.data.success) {
        setPurchasedItem(item.name);
        setShowSuccess(true);
        setBalance(res.data.newBalance);
        // Refresh local items state
        setItems((prev) =>
          prev.map((i) =>
            i.itemId === item.itemId ? { ...i, isOwned: true } : i,
          ),
        );
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Purchase validation failed.");
    } finally {
      setPurchasing(null);
    }
  };

  const filteredItems = items.filter((item) => {
    if (activeTab === "All Items") return true;
    if (activeTab === "Themes") return item.type === "theme";
    if (activeTab === "Avatars") return item.type === "avatar";
    if (activeTab === "Certificates") return item.type === "certificate";
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-6">
        <div className="w-12 h-12 border-2 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Provisioning Academic Assets...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-md shadow-sm border border-gray-100 text-center max-w-lg">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-6" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Vault Access Denied
          </h2>
          <p className="text-gray-500 text-sm mb-8 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-gray-900 text-white rounded-md font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Success Notification - Standardized */}
      {showSuccess && (
        <div className="fixed top-8 right-8 z-[100] bg-gray-900 text-white px-8 py-5 rounded-md shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] flex items-center gap-4 animate-in fade-in slide-in-from-right-8 border border-white/10">
          <div className="p-2 bg-blue-900 text-white rounded shadow-sm">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400 mb-0.5">
              Protocol Synchronized
            </p>
            <p className="text-[11px] font-bold uppercase tracking-widest">
              {purchasedItem} provisioned.
            </p>
          </div>
          <button
            onClick={() => setShowSuccess(false)}
            className="ml-4 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={14} />
          </button>
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

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
                Academic <span className="text-gray-400">Vault</span>
              </h1>
              <p className="text-gray-500 text-sm font-medium max-w-2xl leading-relaxed">
                Strategic allocation of earned academic credits to customize
                institutional interfaces and secure distinguished recognition
                assets.
              </p>
            </div>

            <div className="bg-white p-6 px-10 rounded-md border border-gray-300 shadow-sm min-w-[300px]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                  Institutional Credit Reserve
                </p>
                <Sparkles className="text-blue-900" size={14} />
              </div>
              <div className="flex items-baseline gap-3">
                <p className="text-5xl font-bold text-gray-900 tracking-tighter leading-none">
                  {balance}
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

      <div className="max-w-7xl mx-auto px-6 sm:px-10 pb-24 -mt-12 relative z-20">
        {/* Marketplace Filters */}
        {/* Marketplace Filters - Industrial Aesthetics */}
        <div className="flex flex-wrap gap-4 mb-16">
          {[
            { label: "All Items", icon: Layout },
            { label: "Themes", icon: Palette },
            { label: "Avatars", icon: ImageIcon },
            { label: "Certificates", icon: ScrollText },
          ].map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(tab.label)}
              className={`flex items-center gap-3 px-8 py-4 rounded-md font-bold text-[11px] uppercase tracking-widest transition-all border ${activeTab === tab.label ? "bg-blue-900 text-white border-blue-900 shadow-xl" : "bg-white text-gray-500 border-gray-300 hover:border-blue-900 shadow-sm"}`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Categories Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-10 border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-4">
              <Zap size={24} className="text-blue-900" />
              {activeTab === "All Items" ? "Available Assets" : activeTab}
            </h2>
            <div className="px-4 py-2 bg-gray-50 rounded-md border border-gray-300 text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-3 shadow-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
              Live Academic Vault
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
            {filteredItems.map((item) => {
              const Icon = ICON_MAP[item.iconName] || ShoppingBag;
              const canAfford = balance >= item.cost;
              const isPurchasingCurrent = purchasing === item.itemId;

              return (
                <div
                  key={item._id}
                  className={`group relative bg-white rounded-md p-8 border transition-all duration-300 overflow-hidden ${
                    item.isOwned
                      ? "border-emerald-600 bg-emerald-50/10 shadow-inner"
                      : "border-gray-300 shadow-sm hover:shadow-xl hover:border-blue-900"
                  }`}
                >
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-8">
                      <div
                        className={`w-16 h-16 rounded-md flex items-center justify-center border transition-all duration-500 lucide-icon-container ${
                          item.isOwned
                            ? "bg-emerald-900 text-white border-emerald-800"
                            : "bg-gray-50 text-gray-400 group-hover:bg-blue-900 group-hover:text-white border-gray-200"
                        }`}
                      >
                        <Icon size={28} />
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-gray-900 tracking-tighter leading-none">
                          {item.cost}
                        </p>
                        <p className="text-[9px] font-bold text-blue-900 uppercase tracking-widest mt-1.5 leading-none">
                          Credits
                        </p>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-3 uppercase">
                      {item.name}
                    </h3>
                    <p className="text-gray-500 font-medium text-[13px] mb-10 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>

                    <div className="mt-auto">
                      {item.isOwned ? (
                        <div className="flex items-center justify-center gap-3 text-white font-bold uppercase tracking-widest text-[10px] py-4 bg-emerald-900 rounded-md shadow-lg italic">
                          <Check size={16} /> Registry Verified
                        </div>
                      ) : (
                        <button
                          onClick={() => handlePurchase(item)}
                          disabled={!canAfford || isPurchasingCurrent}
                          className={`w-full py-5 rounded-md font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 shadow-md ${
                            canAfford
                              ? "bg-blue-900 text-white hover:bg-black hover:shadow-xl disabled:opacity-50"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {isPurchasingCurrent ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : canAfford ? (
                            <>
                              Provision Asset{" "}
                              <ChevronRight
                                size={14}
                                className="group-hover:translate-x-1 transition-transform"
                              />
                            </>
                          ) : (
                            <>Institutional Balance Insufficient</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="absolute inset-0 opacity-[0.015] pointer-events-none heatmap-industrial"></div>
                </div>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="lg:col-span-3 py-20 bg-gray-50 rounded-md border border-gray-100 border-dashed text-center">
                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                  No items cataloged in this sector
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Institutional Section */}
        {/* Institutional Section - Advanced Tier Protocol */}
        <div className="bg-gray-900 text-white rounded-md p-10 sm:p-20 relative overflow-hidden shadow-2xl border border-white/5 mb-24">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none heatmap-industrial bg-white"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-16 border-b border-white/10 pb-16">
              <div>
                <div className="flex items-center gap-6 mb-6">
                  <div className="bg-blue-900 p-4 rounded-md shadow-xl border border-blue-800 lucide-icon-container">
                    <School className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tight uppercase">
                    Institutional{" "}
                    <span className="text-blue-400 italic">Awards</span>
                  </h2>
                </div>
                <p className="text-gray-400 text-[15px] font-medium max-w-2xl leading-relaxed">
                  Strategic high-yield academic rewards and longitudinal
                  institutional privileges specifically reserved for students
                  with distinguished registry achievement records.
                </p>
              </div>
              <div className="px-10 py-6 bg-white/5 border border-white/10 rounded-md backdrop-blur-sm shadow-inner group">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-2 leading-none group-hover:text-white transition-colors">
                  Tier Requirement
                </p>
                <p className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                  500
                  <span className="text-blue-400 italic text-2xl font-bold tracking-widest">
                    +
                  </span>{" "}
                  Credits
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  name: "Extended Library Access",
                  desc: "Request additional longitudinal research cycles within institutional facilities and private study sectors.",
                  cost: "500 CR",
                  icon: Book,
                },
                {
                  name: "Official Academic Gear",
                  desc: "Provision institutional professional gear and registry-branded merchandise via central supply.",
                  cost: "700 CR",
                  icon: Gift,
                },
                {
                  name: "Research Grants",
                  desc: "Institutional credit conversion into authenticated vouchers for advanced academic curriculum resources.",
                  cost: "600 CR",
                  icon: BookOpen,
                },
                {
                  name: "Registration Priority",
                  desc: "Secure high-priority early enrollment slots for specialized advanced-tier academic curriculum modules.",
                  cost: "800 CR",
                  icon: GraduationCap,
                },
              ].map((reward, i) => (
                <div
                  key={i}
                  className="bg-white/5 hover:bg-blue-900/40 border border-white/5 hover:border-blue-900/50 rounded-md p-10 transition-all duration-500 group relative overflow-hidden"
                >
                  <div className="flex items-start gap-8 relative z-10">
                    <div className="p-4 bg-white/10 rounded-md text-blue-400 group-hover:bg-white group-hover:text-blue-900 transition-all shadow-sm">
                      <reward.icon size={32} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-black tracking-tight uppercase group-hover:text-white transition-colors">
                          {reward.name}
                        </h4>
                        <p className="text-[12px] font-black text-blue-400 bg-blue-900/30 px-3 py-1 rounded-sm border border-blue-900/30 group-hover:bg-white group-hover:text-blue-900 group-hover:border-white transition-all italic">
                          {reward.cost}
                        </p>
                      </div>
                      <p className="text-gray-400 group-hover:text-gray-200 text-[14px] font-medium leading-relaxed mb-10 transition-colors">
                        {reward.desc}
                      </p>
                      <button className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400 hover:text-white flex items-center gap-3 transition-all group-hover:translate-x-2">
                        Submit Registry Request{" "}
                        <ChevronRight
                          size={14}
                          className="group-hover:translate-x-1 duration-300"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentMarketplace;
