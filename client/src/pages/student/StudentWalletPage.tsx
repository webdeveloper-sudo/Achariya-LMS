import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Wallet,
  History,
  Sparkles,
  ChevronRight,
  Zap,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  FileText,
  Clock,
  AlertCircle,
  PiggyBank,
  CheckCircle,
  ChevronLeft,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../api/axiosInstance";

const StudentWalletPage = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchWallet = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/gamification/wallet");
      if (res.data.success) {
        setBalance(res.data.balance || 0);
        setTransactions(res.data.history || []);
        setError(null);
      }
    } catch (err: any) {
      console.error("Failed to fetch wallet:", err);
      setError(
        err.response?.data?.message ||
          "Protocol Error: Failed to synchronize ledger state.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-6">
        <div className="w-12 h-12 border-2 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-[10px]   text-gray-400 uppercase tracking-[0.2em]">
          Reconciling Institutional Ledger...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-md shadow-sm border border-gray-100 text-center max-w-lg">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-6" />
          <h2 className="text-xl   text-gray-900 mb-2">
            Synchronization Failure
          </h2>
          <p className="text-gray-500 text-sm mb-8 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-gray-900 text-white rounded-md   text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-sm"
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
      <div className="bg-gray-50 border-b border-gray-100 pt-10 pb-16 px-6 sm:px-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <Link
            to="/student/dashboard"
            className="inline-flex items-center text-gray-500 mb-10 hover:text-blue-900  transition-colors text-[12px] uppercase tracking-widest group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Dashboard
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-900 p-2 rounded border border-blue-800 shadow-sm">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <span className="text-blue-900   tracking-widest text-[14px] uppercase">
                  Institutional Ledger
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl   text-gray-900 mb-4 tracking-tight leading-tight uppercase">
                Academic <span className="text-gray-400">Wallet</span>
              </h1>
              <p className="text-gray-500 text-[15px] font-medium max-w-2xl leading-relaxed">
                Centralized registry for verified credit units, participation
                rewards, and institutional capital accumulated through
                distinguished performance.
              </p>
            </div>

            <div className="bg-white p-5 px-10 rounded-md border border-gray-300  relative overflow-hidden group">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none heatmap-industrial bg-blue-900"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  {/* <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    Verified Balance
                  </p>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-900 text-white rounded-sm text-[9px] font-black border border-emerald-800 shadow-sm italic">
                    <ShieldCheck size={12} /> REGISTRY SECURE
                  </div> */}
                </div>
                <div className=" gap-4 mb-6">
                  <span className="text-6xl font-black text-gray-900 text-center tracking-tighter leading-none">
                    {balance.toLocaleString()}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[14px] text-end text-blue-900 uppercase ">
                      Credits
                    </span>
                  </div>
                </div>
                {/* <div className="pt-8 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-900 rounded-full animate-pulse shadow-[0_0_8px_rgba(30,58,138,0.5)]"></div>
                    <span className="text-[10px] font-black text-gray-900 uppercase tracking-[0.1em]">
                      Status: Synchronized
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-blue-900 uppercase tracking-[0.1em] bg-blue-50 px-3 py-1 rounded-sm border border-blue-100">
                    Tier 1 Merit
                  </span>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 pb-32 -mt-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Information & Stats */}
          <div className="lg:col-span-4 space-y-10">
            {/* Quick Stats Grid */}
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-md border border-gray-300 shadow-sm group">
                <p className="text-[16px] text-gray-600 uppercase  mb-3 group-hover:text-blue-900 transition-colors">
                  Earned
                </p>
                <p className="text-3xl font-black text-emerald-600 tracking-tighter">
                  +
                  {transactions
                    .filter((t) => t.amount > 0)
                    .reduce((acc, t) => acc + t.amount, 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-8 rounded-md border border-gray-300 shadow-sm group">
                <p className="text-[16px] text-gray-600 uppercase  mb-3 group-hover:text-red-900 transition-colors">
                  Utilized
                </p>
                <p className="text-3xl font-black text-red-600 tracking-tighter">
                  -
                  {Math.abs(
                    transactions
                      .filter((t) => t.amount < 0)
                      .reduce((acc, t) => acc + t.amount, 0),
                  ).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                <div className="w-12 h-px bg-gray-200"></div>
                Preservation Protocols
              </h3>
              {[
                {
                  icon: Zap,
                  label: "Sync Intensity",
                  desc: "Performance yields increase by 15% during active module streaks.",
                  color: "blue",
                },
                {
                  icon: Target,
                  label: "Outcome Credits",
                  desc: "Distinguished awards granted for 100% academic score consistency.",
                  color: "emerald",
                },
                {
                  icon: History,
                  label: "Batch Audits",
                  desc: "Weekly reconciliation of all learning activities into verified units.",
                  color: "purple",
                },
              ].map((p, i) => (
                <div
                  key={i}
                  className="bg-white p-8 rounded-md border border-gray-300 hover:border-blue-900 hover:shadow-xl transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-[0.01] pointer-events-none heatmap-industrial"></div>
                  <div className="relative z-10 flex items-start gap-6">
                    <div
                      className={`p-4 rounded-md bg-gray-50 text-blue-900 border border-gray-100 group-hover:bg-blue-900 group-hover:text-white transition-all shadow-sm lucide-icon-container`}
                    >
                      <p.icon size={20} />
                    </div>
                    <div>
                      <span className="text-[16px] text-gray-900 uppercase tracking-tight group-hover:text-blue-900 transition-colors block mb-2">
                        {p.label}
                      </span>
                      <p className="text-[12px] text-gray-500 leading-relaxed font-medium">
                        {p.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className=" p-10 rounded-md shadow-2xl relative overflow-hidden group border border-gray-300">
              <div className="absolute inset-0 opacity-[0.1] pointer-events-none heatmap-industrial bg-white"></div>
              <div className="relative z-10 text-center sm:text-left">
                <div className=" w-12 h-12 rounded-md flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20">
                  <Sparkles size={24} className="text-gray-600" />
                </div>
                <h3 className="text-gray-900 font-black text-2xl mb-4 uppercase tracking-tight">
                  Capital <span className="text-gray-400">Utilization</span>
                </h3>
                <p className="text-gray-600 text-[14px] font-medium leading-relaxed mb-10">
                  Provision your accumulated units for institutional assets,
                  performance boosters, and legacy certifications via the
                  central registry.
                </p>
                <Link
                  to="/student/marketplace"
                  className="inline-flex items-center gap-3 bg-white text-blue-900 px-8 py-4 rounded-md text-[14px] uppercase  hover:bg-blue-400 transition-all shadow-xl hover:translate-x-2"
                >
                  Initialize Marketplace <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* Transaction Ledger */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-md border border-gray-300 shadow-xl overflow-hidden flex flex-col min-h-[700px] relative">
              <div className="absolute inset-0 opacity-[0.01] pointer-events-none heatmap-industrial"></div>
              <div className="p-10 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-8 relative z-10">
                <div>
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-900 p-2 rounded shadow-sm">
                      <Activity size={20} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                      Registry <span className="text-gray-400">Ledger</span>
                    </h2>
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-3">
                    Systemic audit of all institutional unit fluctuations
                  </p>
                </div>
                <button className="flex items-center gap-3 px-8 py-4 bg-gray-50 hover:bg-black hover:text-white text-gray-900 rounded-md border border-gray-300 text-[11px] font-black uppercase tracking-widest transition-all shadow-sm">
                  <FileText size={16} />
                  Export Formal Statement
                </button>
              </div>

              <div className="flex-grow p-10 relative z-10">
                {transactions.length > 0 ? (
                  <div className="space-y-6">
                    {transactions
                      .slice(
                        (currentPage - 1) * itemsPerPage,
                        currentPage * itemsPerPage,
                      )
                      .map((txn, idx) => {
                        const isPositive = txn.amount > 0;
                        return (
                          <div
                            key={txn._id || txn.id || idx}
                            className="group flex flex-col sm:flex-row items-center justify-between p-4 border border-gray-200 hover:border-blue-900 hover:shadow-xl transition-all rounded-md bg-white relative overflow-hidden"
                          >
                            {/* <div className="absolute inset-0 opacity-[0.01] pointer-events-none heatmap-industrial bg-blue-900"></div> */}
                            <div className="flex items-center gap-8 w-full sm:w-auto relative z-10">
                              <div
                                className={`w-14 h-14 rounded-md flex items-center justify-center shrink-0 shadow-inner ${
                                  isPositive
                                    ? "bg-emerald-900 text-white border border-emerald-800"
                                    : "bg-red-900 text-white border border-red-800"
                                }`}
                              >
                                {isPositive ? (
                                  <ArrowUpRight size={24} />
                                ) : (
                                  <ArrowDownRight size={24} />
                                )}
                              </div>

                              <div>
                                <div className=" mb-2">
                                  <span className="text-sm font-semibold text-gray-700 uppercase tracking-tight group-hover:text-blue-900 transition-colors">
                                    {txn.message || "Institutional Entry"}
                                  </span>
                                </div>
                                <div className="mb-2">
                                  <span className="text-[10px]  text-white capitalize bg-blue-900 px-3 py-1 rounded-sm border border-blue-800 ">
                                    {txn.type || "Sync"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-gray-600 opacity-70">
                                  <Clock size={12} className="text-blue-900" />
                                  {new Date(
                                    txn.timestamp || txn.date,
                                  ).toLocaleString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </div>
                            </div>

                            <div className="text-center sm:text-right mt-6 sm:mt-0 relative z-10 bg-gray-50 sm:bg-transparent px-6 py-2 rounded-md border sm:border-0 border-gray-100">
                              <p
                                className={`text-4xl font-black tracking-tighter sm:text-3xl ${isPositive ? "text-emerald-600" : "text-red-600"}`}
                              >
                                {isPositive ? "+" : ""}
                                {txn.amount.toLocaleString()}
                              </p>
                              <p className="text-[12px] text-gray-400  mt-2">
                                Verified Asset Units
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 text-center">
                    <PiggyBank className="w-16 h-16 text-gray-100 mb-6" />
                    <h3 className="text-xl   text-gray-900 mb-2 uppercase tracking-tight">
                      Ledger Initialized
                    </h3>
                    <p className="text-gray-400 text-[10px]   uppercase tracking-widest max-w-sm leading-relaxed mb-10">
                      Synchronize curriculum objectives to accumulate
                      institution-verified capital units.
                    </p>
                    <Link
                      to="/student/courses"
                      className="px-8 py-4 bg-gray-900 text-white rounded-md   uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all shadow-sm"
                    >
                      Initialize Curriculum
                    </Link>
                  </div>
                )}
              </div>

              {/* Pagination Controls - Industrial Sliding Window */}
              {Math.ceil(transactions.length / itemsPerPage) > 1 && (
                <div className="mt-12 flex items-center justify-center gap-3 pb-4">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-3 bg-white border border-gray-300 rounded-md text-gray-400 hover:text-blue-900 hover:border-blue-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm group"
                  >
                    <ChevronLeft
                      size={18}
                      className="group-hover:-translate-x-0.5 transition-transform"
                    />
                  </button>

                  {(() => {
                    const totalPages = Math.ceil(
                      transactions.length / itemsPerPage,
                    );
                    let pages = [];
                    if (totalPages <= 3) {
                      pages = Array.from(
                        { length: totalPages },
                        (_, i) => i + 1,
                      );
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
                        onClick={() => setCurrentPage(page)}
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
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(
                          Math.ceil(transactions.length / itemsPerPage),
                          p + 1,
                        ),
                      )
                    }
                    disabled={
                      currentPage ===
                      Math.ceil(transactions.length / itemsPerPage)
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

              <div className="p-8 bg-gray-50 border-t border-gray-300 flex items-center justify-center gap-10 relative z-10 shadow-inner">
                <div className="flex items-center gap-3">
                  <CheckCircle size={14} className="text-emerald-600" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                    Registry Integrity: Verified
                  </span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center gap-3">
                  <Clock size={14} className="text-blue-900" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                    Sync Cycle: Phase-04
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentWalletPage;
