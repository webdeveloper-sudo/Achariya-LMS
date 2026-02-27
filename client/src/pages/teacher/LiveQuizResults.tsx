// Live Quiz Results Page - Leaderboard & Item Analysis
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Trophy,
  TrendingDown,
  Download,
  ArrowLeft,
  ChevronRight,
  FileText,
  LayoutGrid,
  Clock,
  Target,
} from "lucide-react";
import type { LiveQuizAttempt } from "../../services/liveQuizService";

const LiveQuizResults = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"leaderboard" | "analysis">(
    "leaderboard",
  );
  const [attempts, setAttempts] = useState<LiveQuizAttempt[]>([]);

  // Mock data for demo
  const mockAttempts: LiveQuizAttempt[] = [
    {
      id: "1",
      sessionId: sessionId || "",
      studentId: "1",
      studentName: "Aisha Khan",
      score: 10,
      timeTakenMs: 75000,
      submitTime: {} as any,
      isLate: false,
      answers: [],
      questionOrder: [],
      optionOrders: [],
    },
    {
      id: "2",
      sessionId: sessionId || "",
      studentId: "2",
      studentName: "Vikram Joshi",
      score: 10,
      timeTakenMs: 102000,
      submitTime: {} as any,
      isLate: false,
      answers: [],
      questionOrder: [],
      optionOrders: [],
    },
    {
      id: "3",
      sessionId: sessionId || "",
      studentId: "3",
      studentName: "Rahul Patel",
      score: 9,
      timeTakenMs: 90000,
      submitTime: {} as any,
      isLate: false,
      answers: [],
      questionOrder: [],
      optionOrders: [],
    },
    {
      id: "4",
      sessionId: sessionId || "",
      studentId: "4",
      studentName: "Divya Menon",
      score: 9,
      timeTakenMs: 115000,
      submitTime: {} as any,
      isLate: false,
      answers: [],
      questionOrder: [],
      optionOrders: [],
    },
    {
      id: "5",
      sessionId: sessionId || "",
      studentId: "5",
      studentName: "Karthik Balan",
      score: 8,
      timeTakenMs: 80000,
      submitTime: {} as any,
      isLate: false,
      answers: [],
      questionOrder: [],
      optionOrders: [],
    },
    {
      id: "6",
      sessionId: sessionId || "",
      studentId: "6",
      studentName: "Priya Sharma",
      score: 8,
      timeTakenMs: 95000,
      submitTime: {} as any,
      isLate: false,
      answers: [],
      questionOrder: [],
      optionOrders: [],
    },
    {
      id: "7",
      sessionId: sessionId || "",
      studentId: "7",
      studentName: "Rohan Kumar",
      score: 7,
      timeTakenMs: 110000,
      submitTime: {} as any,
      isLate: false,
      answers: [],
      questionOrder: [],
      optionOrders: [],
    },
    {
      id: "8",
      sessionId: sessionId || "",
      studentId: "8",
      studentName: "Sneha Reddy",
      score: 7,
      timeTakenMs: 105000,
      submitTime: {} as any,
      isLate: false,
      answers: [],
      questionOrder: [],
      optionOrders: [],
    },
    {
      id: "9",
      sessionId: sessionId || "",
      studentId: "9",
      studentName: "Arjun Nair",
      score: 6,
      timeTakenMs: 118000,
      submitTime: {} as any,
      isLate: false,
      answers: [],
      questionOrder: [],
      optionOrders: [],
    },
    {
      id: "10",
      sessionId: sessionId || "",
      studentId: "10",
      studentName: "Meera Iyer",
      score: 6,
      timeTakenMs: 112000,
      submitTime: {} as any,
      isLate: false,
      answers: [],
      questionOrder: [],
      optionOrders: [],
    },
  ];

  // Mock weak questions for item analysis
  const weakQuestions = [
    {
      questionId: 7,
      text: "What is the discriminant of the quadratic equation?",
      wrongCount: 18,
      totalAttempts: 28,
      correctRate: 36,
    },
    {
      questionId: 3,
      text: "Solve by completing the square: x² + 6x + 8 = 0",
      wrongCount: 15,
      totalAttempts: 28,
      correctRate: 46,
    },
    {
      questionId: 9,
      text: "Word problem: A garden has perimeter 50m...",
      wrongCount: 12,
      totalAttempts: 28,
      correctRate: 57,
    },
  ];

  useEffect(() => {
    setAttempts(mockAttempts);
  }, [sessionId]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  const handleExport = () => {
    alert("Export sequence initiated. Generating CSV report...");
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Premium Header */}
      <div className="border-b border-gray-100 pb-12">
        <button
          onClick={() => navigate("/teacher/dashboard")}
          className="inline-flex items-center text-[13px] hover:text-[#c72323] mb-10 transition-colors capitalize"
          style={{ color: "#c72323" }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Operational Dashboard
        </button>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-center sm:text-left">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6 justify-center sm:justify-start">
              <div className="bg-red-50 p-2 rounded border border-red-100">
                <FileText className="w-5 h-5" style={{ color: "#c72323" }} />
              </div>
              <span
                className="text-[13px] capitalize"
                style={{ color: "#c72323" }}
              >
                Results Analytics
              </span>
            </div>
            <h1 className="text-4xl text-gray-900 mb-6 leading-tight capitalize">
              Quiz <span className="text-gray-400">Post-Analysis</span>
            </h1>
            <p className="text-gray-600 text-[15px] max-w-xl leading-relaxed mx-auto sm:mx-0">
              Quadratic Equations Quiz — Class 8-A. Synchronization complete for{" "}
              {attempts.length} participants.
            </p>
          </div>

          <button
            onClick={handleExport}
            className="px-8 py-4 bg-gray-900 text-white rounded-md hover:bg-[#c72323] text-[13px] capitalize transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all mx-auto lg:mx-0"
          >
            <Download size={16} />
            Export Data Log
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-4 border-b border-gray-50 pb-8">
        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`px-8 py-3 rounded-md text-[13px] capitalize transition-all flex items-center gap-2 ${
            activeTab === "leaderboard"
              ? "bg-gray-900 text-white shadow-md"
              : "bg-white text-gray-400 border border-gray-100 hover:border-[#c72323] hover:text-[#c72323]"
          }`}
        >
          <Trophy className="w-4 h-4" />
          Participant Leaderboard
        </button>
        <button
          onClick={() => setActiveTab("analysis")}
          className={`px-8 py-3 rounded-md text-[13px] capitalize transition-all flex items-center gap-2 ${
            activeTab === "analysis"
              ? "bg-gray-900 text-white shadow-md"
              : "bg-white text-gray-400 border border-gray-100 hover:border-[#c72323] hover:text-[#c72323]"
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          Item Performance Analysis
        </button>
      </div>

      {/* Leaderboard Tab */}
      {activeTab === "leaderboard" && (
        <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-xl text-gray-900 capitalize">
                Top Performers
              </h2>
              <p className="text-gray-600 text-[11px] mt-1 capitalize">
                Comparative Performance Metrics
              </p>
            </div>
            <Trophy size={18} className="text-gray-200" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-8 py-5 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                    Participant Unit
                  </th>
                  <th className="px-8 py-5 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                    Performance Index
                  </th>
                  <th className="px-8 py-5 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                    Temporal Data
                  </th>
                  <th className="px-8 py-5 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {attempts.map((attempt, index) => (
                  <tr
                    key={attempt.id}
                    className={`group hover:bg-gray-50/50 transition-colors ${index < 3 ? "bg-red-50/10" : ""}`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-lg tabular-nums ${
                            index === 0
                              ? "text-[#c72323] font-medium"
                              : index === 1
                                ? "text-gray-600"
                                : index === 2
                                  ? "text-gray-500"
                                  : "text-gray-300"
                          }`}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {index < 3 && (
                          <Trophy
                            className={`w-4 h-4 ${index === 0 ? "text-[#c72323]" : "text-gray-400"}`}
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm text-gray-900 capitalize group-hover:text-[#c72323] transition-colors">
                        {attempt.studentName}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className="text-sm font-medium tabular-nums"
                        style={{ color: "#c72323" }}
                      >
                        {attempt.score}{" "}
                        <span className="text-gray-300 font-normal">/ 10</span>
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm text-gray-500 tabular-nums">
                        {formatTime(attempt.timeTakenMs)}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {attempt.isLate ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-sm bg-yellow-50 text-yellow-700 text-[10px] capitalize font-medium border border-yellow-100">
                          Temporal Overflow
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-sm bg-emerald-50 text-emerald-700 text-[10px] capitalize font-medium border border-emerald-100">
                          Compliance Valid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Item Analysis Tab */}
      {activeTab === "analysis" && (
        <div className="space-y-12">
          <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden text-center sm:text-left">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-xl text-gray-900 capitalize italic-none">
                  Diagnostic Outliers
                </h2>
                <p className="text-gray-600 text-[11px] mt-1 capitalize">
                  Critical Review Required
                </p>
              </div>
              <Target size={18} className="text-gray-200" />
            </div>

            <div className="p-8 space-y-8">
              {weakQuestions.map((q) => (
                <div
                  key={q.questionId}
                  className="border border-gray-50 rounded-md p-8 hover:border-red-100 transition-colors group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                    <div className="flex-shrink-0 flex justify-center">
                      <div className="w-14 h-14 rounded-md bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-[#c72323] group-hover:border-[#c72323] group-hover:text-white transition-all">
                        <span className="text-sm font-medium tabular-nums">
                          Q{q.questionId}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-gray-900 mb-6 capitalize leading-relaxed">
                        {q.text}
                      </h3>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        <div>
                          <span className="text-[10px] text-gray-400 capitalize block mb-1">
                            Error Frequency
                          </span>
                          <span
                            className="text-lg text-gray-900 tabular-nums"
                            style={{ color: "#c72323" }}
                          >
                            {q.wrongCount}{" "}
                            <span className="text-sm text-gray-300">
                              / {q.totalAttempts}
                            </span>
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 capitalize block mb-1">
                            Success Coefficient
                          </span>
                          <span
                            className={`text-lg tabular-nums ${q.correctRate < 50 ? "text-[#c72323]" : "text-orange-500"}`}
                          >
                            {q.correctRate}%
                          </span>
                        </div>
                        <div className="col-span-2 flex items-center">
                          <div className="w-full bg-gray-50 rounded-full h-1 overflow-hidden">
                            <div
                              className="transition-all duration-1000 ease-out h-full"
                              style={{
                                width: `${q.correctRate}%`,
                                backgroundColor:
                                  q.correctRate < 50 ? "#c72323" : "#f59e0b",
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-[#c72323] transition-all text-[12px] capitalize flex items-center justify-center gap-2 shadow-md">
                      Deploy Review <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overall Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white rounded-md border border-gray-100 p-8 shadow-sm text-center">
              <div className="flex justify-center mb-6">
                <Target className="w-5 h-5 text-gray-400" />
              </div>
              <span className="text-[11px] text-gray-500 capitalize block mb-2">
                Cohort Median
              </span>
              <p className="text-4xl text-gray-900 tabular-nums">
                {(
                  attempts.reduce((sum, a) => sum + a.score, 0) /
                  attempts.length
                ).toFixed(1)}{" "}
                <span className="text-sm align-middle text-gray-300">/ 10</span>
              </p>
            </div>
            <div className="bg-white rounded-md border border-gray-100 p-8 shadow-sm text-center">
              <div className="flex justify-center mb-6">
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
              <span className="text-[11px] text-gray-500 capitalize block mb-2">
                Temporal Average
              </span>
              <p className="text-4xl text-gray-900 tabular-nums">
                {formatTime(
                  attempts.reduce((sum, a) => sum + a.timeTakenMs, 0) /
                    attempts.length,
                )}
              </p>
            </div>
            <div className="bg-white rounded-md border border-gray-100 p-8 shadow-sm text-center">
              <div className="flex justify-center mb-6">
                <LayoutGrid className="w-5 h-5 text-gray-400" />
              </div>
              <span className="text-[11px] text-gray-500 capitalize block mb-2">
                Efficiency Units
              </span>
              <p
                className="text-4xl text-gray-900 tabular-nums"
                style={{ color: "#c72323" }}
              >
                {attempts.filter((a) => a.score === 10).length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveQuizResults;
