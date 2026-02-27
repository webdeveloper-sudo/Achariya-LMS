import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  ChevronRight,
  Award,
  Activity,
  UserCheck,
  RefreshCw,
  AlertCircle,
  Loader2,
  Star,
  FileText,
  Zap,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

// Types
interface Metrics {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  onboardedCount: number;
  avgCompletion: number;
  avgCredits: number;
  recentlyActive: number;
  newThisMonth: number;
}

interface TopPerformer {
  _id: string;
  name: string;
  class: string;
  section: string;
  completion: number;
  credits: number;
  badges: number;
}

interface ClassCompletion {
  className: string;
  count: number;
  avgCompletion: number;
}

interface CourseSummary {
  _id: string;
  courseId: string;
  title: string;
  subjectCode: string;
  status: string;
  gradesEligible: string[];
  moduleCount: number;
}

interface DashboardData {
  school: { name: string; id: number };
  principal: { id: string; name: string; email: string };
  metrics: Metrics;
  topPerformers: TopPerformer[];
  completionByClass: ClassCompletion[];
  courses: CourseSummary[];
}

// Helper
const rankBg = (idx: number) =>
  idx === 0
    ? "bg-yellow-400"
    : idx === 1
      ? "bg-gray-400"
      : idx === 2
        ? "bg-orange-400"
        : "bg-green-50";

const rankText = (idx: number) => (idx < 3 ? "text-white" : "text-[#008000]");

// Component
const PrincipalDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/principals/auth/dashboard");
      setData(res.data);
      setLastFetched(new Date());
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to load dashboard. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "#008000" }}
        />
        <p className="text-[11px] text-gray-400 capitalize">
          Synchronizing Institutional Infrastructure...
        </p>
      </div>
    );
  }

  // Error
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center px-6">
        <div className="bg-red-50 p-4 rounded-full">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <div>
          <h2 className="text-xl text-gray-900 capitalize mb-2">
            Synchronization Failure
          </h2>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
        <button
          onClick={fetchDashboard}
          className="flex items-center gap-3 px-8 py-3.5 bg-gray-900 text-white rounded-md text-[13px] capitalize hover:bg-[#008000] transition shadow-sm"
        >
          <RefreshCw size={16} /> Re-sync Terminal
        </button>
      </div>
    );
  }

  const {
    school,
    principal,
    metrics,
    topPerformers,
    completionByClass,
    courses,
  } = data;
  const onboardPct =
    metrics.totalStudents > 0
      ? Math.round((metrics.onboardedCount / metrics.totalStudents) * 100)
      : 0;

  // Render
  return (
    <div className="space-y-12 pb-20">
      {/* Institutional Header */}
      <div className="border-b border-gray-100 pb-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-center sm:text-left">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6 justify-center sm:justify-start">
              <div className="bg-green-50 p-2 rounded border border-green-100">
                <Activity className="w-5 h-5" style={{ color: "#008000" }} />
              </div>
              <span
                className="text-[13px] capitalize"
                style={{ color: "#008000" }}
              >
                Institutional Executive Hub
              </span>
            </div>
            <h1 className="text-4xl text-gray-900 mb-6 leading-tight capitalize">
              {school.name} <span className="text-gray-400">Terminal</span>
            </h1>
            <p className="text-gray-600 text-[15px] max-w-xl leading-relaxed mx-auto sm:mx-0">
              Strategic oversight for {principal.name}. Last system
              synchronization trace: {lastFetched?.toLocaleTimeString()}.
            </p>

            <div className="mt-10 flex flex-wrap gap-4 justify-center sm:justify-start">
              <button
                onClick={fetchDashboard}
                className="bg-gray-900 text-white px-8 py-3.5 rounded-md text-[13px] capitalize hover:bg-[#008000] transition shadow-sm flex items-center gap-2"
              >
                <RefreshCw size={14} /> Sync Metrics
              </button>
              <button
                onClick={() => navigate("/principal/courses")}
                className="bg-white text-gray-700 border border-gray-300 px-8 py-3.5 rounded-md text-[13px] capitalize hover:bg-gray-50 transition flex items-center gap-2"
              >
                Curriculum Inventory <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="w-full lg:w-96 bg-white p-8 rounded-md border border-gray-100 shadow-sm relative overflow-hidden text-center sm:text-left">
            <div className="relative z-10">
              <p
                className="text-[11px] capitalize mb-4 flex items-center gap-2 justify-center sm:justify-start"
                style={{ color: "#008000" }}
              >
                <Zap size={12} fill="#008000" /> Executive Analytics
              </p>
              <h3 className="text-xl text-gray-900 mb-8 capitalize">
                Institutional Health
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-[11px] capitalize">
                  <span className="text-gray-400">Synchronization Level</span>
                  <span style={{ color: "#008000" }}>{onboardPct}% Active</span>
                </div>
                <div className="w-full bg-gray-50 rounded-full h-1 overflow-hidden">
                  <div
                    className="h-full transition-all duration-1000"
                    style={{
                      width: `${onboardPct}%`,
                      backgroundColor: "#008000",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Academic Staff",
            val: metrics.totalTeachers,
            icon: GraduationCap,
            link: "/principal/teachers",
          },
          {
            label: "Student Body",
            val: metrics.totalStudents,
            icon: Users,
            link: "/principal/students",
          },
          {
            label: "Curriculum Assets",
            val: metrics.totalCourses,
            icon: BookOpen,
            link: "/principal/courses",
          },
          {
            label: "Cohort Proficiency",
            val: `${metrics.avgCompletion}%`,
            icon: TrendingUp,
            link: "#",
          },
        ].map((stat, i) => (
          <div
            key={i}
            onClick={() => stat.link !== "#" && navigate(stat.link)}
            className="group bg-white rounded-md p-8 border border-gray-100 shadow-sm hover:border-green-100 transition-all cursor-pointer text-center sm:text-left"
          >
            <div className="bg-gray-50 text-gray-400 w-12 h-12 rounded flex items-center justify-center mb-6 mx-auto sm:mx-0 group-hover:bg-green-50 group-hover:text-[#008000] transition-colors">
              <stat.icon
                size={22}
                className="group-hover:scale-110 transition-transform"
              />
            </div>
            <p className="text-[11px] text-gray-400 capitalize mb-2 group-hover:text-[#008000] transition-colors">
              {stat.label}
            </p>
            <p className="text-4xl text-gray-900 tracking-tight tabular-nums">
              {stat.val}
            </p>
          </div>
        ))}
      </div>

      {/* Secondary Audit Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Onboarding & Activity */}
        <div className="lg:col-span-4 space-y-12">
          {/* Onboarding Card */}
          <div className="bg-white rounded-md p-8 border border-gray-100 shadow-sm text-center sm:text-left">
            <div className="flex items-center gap-4 mb-8 justify-center sm:justify-start">
              <div
                className="bg-gray-50 p-2.5 rounded border border-gray-100"
                style={{ color: "#008000" }}
              >
                <UserCheck size={20} />
              </div>
              <div>
                <h2 className="text-xl text-gray-900 capitalize">Registry</h2>
                <p className="text-gray-400 text-[11px] capitalize mt-1">
                  Operational Sync
                </p>
              </div>
            </div>
            <p className="text-4xl text-gray-900 tracking-tight mb-4 tabular-nums">
              {metrics.onboardedCount}
              <span className="text-sm text-gray-300 ml-2 font-normal">
                / {metrics.totalStudents}
              </span>
            </p>
            <div className="w-full bg-gray-50 rounded-full h-1 overflow-hidden mb-4">
              <div
                className="h-full transition-all duration-1000"
                style={{ width: `${onboardPct}%`, backgroundColor: "#008000" }}
              />
            </div>
            <p className="text-[11px] capitalize" style={{ color: "#008000" }}>
              {onboardPct}% Activation Efficiency
            </p>
          </div>

          {/* Performance Card */}
          <div className="bg-white rounded-md p-8 border border-gray-100 shadow-sm text-center sm:text-left">
            <div className="flex items-center gap-4 mb-8 justify-center sm:justify-start">
              <div
                className="bg-gray-50 p-2.5 rounded border border-gray-100"
                style={{ color: "#008000" }}
              >
                <Star size={20} />
              </div>
              <div>
                <h2 className="text-xl text-gray-900 capitalize">Economy</h2>
                <p className="text-gray-400 text-[11px] capitalize mt-1">
                  Academic Credits
                </p>
              </div>
            </div>
            <p className="text-4xl text-gray-900 tracking-tight mb-4 tabular-nums">
              {metrics.avgCredits}
            </p>
            <p className="text-[11px] capitalize" style={{ color: "#008000" }}>
              Median Asset Value Per Participant
            </p>
          </div>
        </div>

        {/* Completion by Class */}
        <div className="lg:col-span-8 bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden text-center sm:text-left">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4 justify-center sm:justify-start">
              <div
                className="bg-gray-50 p-2.5 rounded border border-gray-100"
                style={{ color: "#008000" }}
              >
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-xl text-gray-900 capitalize">
                  Classification Audit
                </h2>
                <p className="text-gray-400 text-[11px] capitalize mt-1">
                  Cross-Division Benchmarking
                </p>
              </div>
            </div>
            <TrendingUp size={18} className="text-gray-200 hidden sm:block" />
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
            {completionByClass.map((item) => (
              <div key={item.className} className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-gray-900 capitalize font-medium">
                      Division {item.className}
                    </p>
                    <p className="text-[11px] text-gray-400 capitalize mt-1">
                      {item.count} Active Units
                    </p>
                  </div>
                  <span
                    className="text-sm font-medium tabular-nums"
                    style={{ color: "#008000" }}
                  >
                    {item.avgCompletion}%
                  </span>
                </div>
                <div className="w-full bg-gray-50 rounded-full h-1 overflow-hidden">
                  <div
                    className="h-full transition-all duration-1000"
                    style={{
                      width: `${item.avgCompletion}%`,
                      backgroundColor:
                        item.avgCompletion >= 75
                          ? "#008000"
                          : item.avgCompletion >= 40
                            ? "#f59e0b"
                            : "#dc2626",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performers & Courses */}
      <div className="space-y-12">
        {/* Top Performers */}
        <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden text-center sm:text-left">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4 justify-center sm:justify-start">
              <div
                className="bg-gray-50 p-2.5 rounded border border-gray-100"
                style={{ color: "#008000" }}
              >
                <Award size={20} />
              </div>
              <div>
                <h2 className="text-xl text-gray-900 capitalize">
                  Performance Distinction
                </h2>
                <p className="text-gray-400 text-[11px] capitalize mt-1">
                  High-Efficiency Cohort
                </p>
              </div>
            </div>
            <Award size={18} className="text-gray-200 hidden sm:block" />
          </div>

          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {topPerformers.map((s, idx) => (
              <div
                key={s._id}
                onClick={() => navigate(`/principal/student/${s._id}`)}
                className="p-6 border border-gray-50 rounded-md hover:border-green-100 transition-all cursor-pointer group text-center"
              >
                <div
                  className={`w-12 h-12 rounded-md flex items-center justify-center font-medium text-sm mx-auto mb-6 ${rankBg(idx)} ${rankText(idx)} shadow-sm transition-transform group-hover:scale-105`}
                >
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <p className="text-[13px] text-gray-900 capitalize mb-1 truncate font-medium group-hover:text-[#008000] transition-colors">
                  {s.name}
                </p>
                <p className="text-[11px] text-gray-400 capitalize mb-6">
                  {s.class} {s.section}
                </p>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                  <span
                    className="text-[11px] font-medium tabular-nums"
                    style={{ color: "#008000" }}
                  >
                    {s.completion}%
                  </span>
                  <span className="text-[11px] font-medium text-amber-600 tabular-nums">
                    {s.credits} CR
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Course Audit Table */}
        <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4 justify-center sm:justify-start">
              <div
                className="bg-gray-50 p-2.5 rounded border border-gray-100"
                style={{ color: "#008000" }}
              >
                <BookOpen size={20} />
              </div>
              <div>
                <h2 className="text-xl text-gray-900 capitalize">
                  Curriculum Registry
                </h2>
                <p className="text-gray-400 text-[11px] capitalize mt-1">
                  Active Instructional Library
                </p>
              </div>
            </div>
            <Link
              to="/principal/courses"
              className="px-6 py-2 bg-gray-50 text-gray-600 rounded-md text-[11px] capitalize hover:bg-green-50 hover:text-[#008000] transition-colors flex items-center gap-2 border border-gray-100"
            >
              Full Inventory <ChevronRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                    Asset Designation
                  </th>
                  <th className="px-8 py-5 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                    Operational Code
                  </th>
                  <th className="px-8 py-5 text-center text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                    Grade Stratum
                  </th>
                  <th className="px-8 py-5 text-center text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                    Quantifiable Units
                  </th>
                  <th className="px-8 py-5 text-center text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                    Deployment Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {courses.map((c) => (
                  <tr
                    key={c._id}
                    className="group cursor-pointer hover:bg-gray-50/50 transition-colors"
                    onClick={() => navigate(`/principal/course/${c._id}`)}
                  >
                    <td className="px-8 py-6">
                      <p className="text-sm text-gray-900 capitalize font-medium group-hover:text-[#008000] transition-colors">
                        {c.title}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[11px] text-gray-500 font-mono">
                        {c.subjectCode}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-[11px] text-gray-600 capitalize">
                        {c.gradesEligible.length > 0
                          ? c.gradesEligible.join(", ")
                          : "Institutional Universal"}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center text-sm text-gray-900 tabular-nums">
                      {c.moduleCount}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-sm text-[10px] capitalize font-medium border ${
                          c.status === "published"
                            ? "bg-green-50 text-[#008000] border-green-100"
                            : "bg-yellow-50 text-yellow-600 border-yellow-100"
                        }`}
                      >
                        {c.status === "published"
                          ? "Active Stream"
                          : "Draft Logic"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrincipalDashboard;
