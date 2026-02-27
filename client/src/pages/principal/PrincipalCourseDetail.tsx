import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Users,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  ClipboardList,
  TrendingUp,
  Search,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

// Types
interface Assessment {
  _id: string;
  title: string;
  type: string;
  totalMarks: number;
  passingMarks: number;
}

interface ModuleStat {
  _id: string;
  title: string;
  sequenceOrder: number;
  type: string;
  assessmentCount: number;
  assessments: Assessment[];
  completedCount: number;
  completionRate: number;
}

interface StudentProgress {
  _id: string;
  name: string;
  admissionNo: string;
  class: string;
  section: string;
  progress: number;
  completedModules: number;
  totalModules: number;
  enrolledAt: string | null;
  credits: number;
}

interface CourseDetail {
  _id: string;
  courseId: string;
  title: string;
  subjectCode: string;
  description: string;
  status: string;
  gradesEligible: string[];
  thumbnail?: string;
}

interface DashboardData {
  school: string;
  course: CourseDetail;
  moduleStats: ModuleStat[];
  enrolledCount: number;
  avgProgress: number;
  studentProgress: StudentProgress[];
}

// Helpers
const PrincipalCourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"modules" | "students">("modules");

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(
        `/principals/auth/courses/${courseId}`,
      );
      setData(res.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to load course details.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    window.scrollTo(0, 0);
  }, [courseId]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "#008000" }}
        />
        <p className="text-[11px] text-gray-400 capitalize">
          Auditing Course Asset Parameters...
        </p>
      </div>
    );

  if (error || !data)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center px-6">
        <div className="bg-red-50 p-4 rounded-full">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <div>
          <h2 className="text-xl text-gray-900 capitalize mb-2">
            Asset Synchronization Failure
          </h2>
          <p className="text-gray-600 text-sm">{error || "Asset not found"}</p>
        </div>
        <button
          onClick={fetchDetail}
          className="flex items-center gap-3 px-8 py-3.5 bg-gray-900 text-white rounded-md text-[13px] capitalize hover:bg-[#008000] transition shadow-sm"
        >
          <RefreshCw size={16} /> Re-sync Terminal
        </button>
      </div>
    );

  const { course, moduleStats, enrolledCount, avgProgress, studentProgress } =
    data;

  const filteredStudents = studentProgress.filter((s) => {
    const q = search.toLowerCase();
    return (
      !search ||
      s.name.toLowerCase().includes(q) ||
      s.admissionNo.toLowerCase().includes(q) ||
      s.class.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-12 pb-20">
      {/* Back */}
      <div className="border-b border-gray-100 pb-12">
        <Link
          to="/principal/courses"
          className="inline-flex items-center text-[13px] hover:text-[#008000] mb-10 transition-colors capitalize"
          style={{ color: "#008000" }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Curriculum Inventory
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-center sm:text-left">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6 justify-center sm:justify-start">
              <div className="bg-green-50 p-2 rounded border border-green-100">
                <BookOpen className="w-5 h-5" style={{ color: "#008000" }} />
              </div>
              <span
                className="text-[13px] capitalize"
                style={{ color: "#008000" }}
              >
                Asset Specification
              </span>
            </div>
            <h1 className="text-4xl text-gray-900 mb-6 leading-tight capitalize">
              {course.title} <span className="text-gray-400">Audit</span>
            </h1>
            <p className="text-gray-600 text-[15px] max-w-xl leading-relaxed mx-auto sm:mx-0">
              Strategic oversight of {course.subjectCode} • Grade{" "}
              {course.gradesEligible.join(", ") || "Global"}. Operational in{" "}
              {data.school}.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center sm:justify-start lg:mx-0 mx-auto">
            <span
              className={`inline-flex items-center px-4 py-2 rounded-sm text-[11px] capitalize font-medium border ${
                course.status === "published"
                  ? "bg-green-50 text-[#008000] border-green-100"
                  : "bg-yellow-50 text-yellow-600 border-yellow-100"
              }`}
            >
              {course.status === "published" ? "Active Stream" : "Draft Logic"}
            </span>
            <button
              onClick={fetchDetail}
              className="p-3 bg-gray-50 text-gray-400 rounded-md hover:text-[#008000] hover:bg-green-50 transition border border-gray-100"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Quantitative Units",
            val: moduleStats.length,
            icon: BookOpen,
          },
          {
            label: "Total Enrollees",
            val: enrolledCount,
            icon: Users,
          },
          {
            label: "Cohort Proficiency",
            val: `${avgProgress}%`,
            icon: TrendingUp,
          },
          {
            label: "Validation Engines",
            val: moduleStats.reduce((sum, m) => sum + m.assessmentCount, 0),
            icon: ClipboardList,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="group bg-white rounded-md p-8 border border-gray-100 shadow-sm transition-all text-center sm:text-left"
          >
            <div className="bg-gray-50 text-gray-400 w-12 h-12 rounded flex items-center justify-center mb-6 mx-auto sm:mx-0 group-hover:bg-green-50 group-hover:text-[#008000] transition-colors">
              <stat.icon size={22} />
            </div>
            <p className="text-[11px] text-gray-400 capitalize mb-2">
              {stat.label}
            </p>
            <p className="text-4xl text-gray-900 tracking-tight tabular-nums">
              {stat.val}
            </p>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-8 border-b border-gray-100 px-2">
        {(["modules", "students"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-[13px] capitalize font-medium transition-all relative ${
              activeTab === tab
                ? "text-[#008000]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab === "modules" ? "Unit Architecture" : "Enrolled Participants"}
            {tab === "students" && (
              <span className="ml-2 px-1.5 py-0.5 bg-gray-50 text-gray-400 text-[10px] rounded border border-gray-100">
                {enrolledCount}
              </span>
            )}
            {activeTab === tab && (
              <div
                className="absolute bottom-0 left-0 w-full h-0.5"
                style={{ backgroundColor: "#008000" }}
              ></div>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-8">
        {activeTab === "modules" ? (
          <div className="grid grid-cols-1 gap-6">
            {moduleStats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-md border border-gray-100 shadow-sm text-center">
                <div className="bg-gray-50 p-6 rounded-full">
                  <BookOpen className="w-12 h-12 text-gray-200" />
                </div>
                <p className="text-[13px] text-gray-400 capitalize">
                  Zero instructional units initialized for this curriculum
                  asset.
                </p>
              </div>
            ) : (
              moduleStats.map((mod, idx) => (
                <div
                  key={mod._id}
                  className="bg-white rounded-md border border-gray-100 shadow-sm p-8 group hover:border-green-100 transition-all flex flex-col lg:flex-row gap-8 lg:items-center"
                >
                  <div className="flex items-center gap-6 flex-1">
                    <div className="w-12 h-12 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:bg-green-50 group-hover:border-green-100 group-hover:text-[#008000] text-gray-400 font-medium transition-all tabular-nums">
                      {String(mod.sequenceOrder || idx + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <h3 className="text-lg text-gray-900 capitalize font-medium group-hover:text-[#008000] transition-colors">
                        {mod.title}
                      </h3>
                      <p className="text-[11px] text-gray-400 capitalize mt-1">
                        {mod.type || "Operational Content"} •{" "}
                        {mod.assessments.length} Validations
                      </p>
                    </div>
                  </div>

                  {mod.assessments.length > 0 && (
                    <div className="flex flex-wrap gap-3 flex-1 lg:justify-center">
                      {mod.assessments.map((a) => (
                        <span
                          key={a._id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-sm text-[10px] capitalize text-gray-600"
                        >
                          <ClipboardList size={12} className="text-gray-400" />{" "}
                          {a.title}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="shrink-0 lg:w-48 text-center sm:text-right">
                    <p className="text-2xl text-gray-900 tabular-nums">
                      {mod.completionRate}%
                    </p>
                    <p className="text-[11px] text-gray-400 capitalize mt-1">
                      {mod.completedCount} / {enrolledCount} Users
                    </p>
                    <div className="mt-3 w-full bg-gray-50 rounded-full h-1 overflow-hidden">
                      <div
                        className="h-full transition-all duration-1000"
                        style={{
                          width: `${mod.completionRate}%`,
                          backgroundColor: "#008000",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-md border border-gray-100 shadow-sm">
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Filter participants by identity or code…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-md text-[13px] focus:outline-none focus:bg-white focus:border-green-100 transition-all capitalize"
                />
              </div>
            </div>

            <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden text-center sm:text-left">
              {filteredStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
                  <div className="bg-gray-50 p-6 rounded-full">
                    <Users className="w-12 h-12 text-gray-200" />
                  </div>
                  <p className="text-[13px] text-gray-400 capitalize">
                    Zero enrollees match current audit parameters.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="px-8 py-5 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                          Identity Details
                        </th>
                        <th className="px-8 py-5 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                          Classification
                        </th>
                        <th className="px-8 py-5 text-center text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                          Audit Trace
                        </th>
                        <th className="px-8 py-5 text-center text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                          Validated Units
                        </th>
                        <th className="px-8 py-5 text-center text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                          Credit Value
                        </th>
                        <th className="px-8 py-5 text-right text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredStudents.map((s) => (
                        <tr
                          key={s._id}
                          className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                          onClick={() =>
                            navigate(`/principal/student/${s._id}`)
                          }
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-baseline gap-3">
                              <p className="text-sm text-gray-900 capitalize font-medium group-hover:text-[#008000] transition-colors leading-tight">
                                {s.name}
                              </p>
                              <span className="text-[11px] text-gray-400 font-mono">
                                {s.admissionNo}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-sm text-gray-600 capitalize">
                              {s.class} {s.section}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-sm font-medium tabular-nums text-gray-900">
                                {s.progress}%
                              </span>
                              <div className="w-24 bg-gray-50 rounded-full h-1 overflow-hidden">
                                <div
                                  className="h-full transition-all duration-1000"
                                  style={{
                                    width: `${s.progress}%`,
                                    backgroundColor: "#008000",
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center text-sm text-gray-900 tabular-nums">
                            {s.completedModules}/{s.totalModules}
                          </td>
                          <td
                            className="px-8 py-6 text-center text-sm tabular-nums"
                            style={{ color: "#008000" }}
                          >
                            {s.credits}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button
                              onClick={() =>
                                navigate(`/principal/student/${s._id}`)
                              }
                              className="text-[11px] capitalize hover:underline flex items-center justify-end ml-auto gap-1 group-hover:translate-x-1 transition-transform"
                              style={{ color: "#008000" }}
                            >
                              Deep Audit <ChevronRight size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrincipalCourseDetail;
