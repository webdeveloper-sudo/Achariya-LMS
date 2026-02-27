import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  BookOpen,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import axiosInstance from "../../api/axiosInstance";

interface Course {
  _id: string;
  courseId: string;
  title: string;
  subjectCode: string;
  description: string;
  status: string;
  gradesEligible: string[];
  thumbnail?: string;
  moduleCount: number;
  enrolledCount: number;
  avgProgress: number;
}

const PrincipalCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/principals/auth/courses");
      setCourses(res.data.courses);
      setSchoolName(res.data.school);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    window.scrollTo(0, 0);
  }, []);

  const filtered = courses.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(q) ||
      c.subjectCode.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "#008000" }}
        />
        <p className="text-[11px] text-gray-400 capitalize">
          Auditing Institutional Curriculum Assets...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center px-6">
        <div className="bg-red-50 p-4 rounded-full">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <div>
          <h2 className="text-xl text-gray-900 capitalize mb-2">
            Inventory Sync Error
          </h2>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
        <button
          onClick={fetchCourses}
          className="flex items-center gap-3 px-8 py-3.5 bg-gray-900 text-white rounded-md text-[13px] capitalize hover:bg-[#008000] transition shadow-sm"
        >
          <RefreshCw size={16} /> Re-sync Inventory
        </button>
      </div>
    );

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="border-b border-gray-100 pb-12">
        <Link
          to="/principal/dashboard"
          className="inline-flex items-center text-[13px] hover:text-[#008000] mb-10 transition-colors capitalize"
          style={{ color: "#008000" }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Executive Dashboard
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
                Curriculum Registry
              </span>
            </div>
            <h1 className="text-4xl text-gray-900 mb-6 leading-tight capitalize">
              Academic <span className="text-gray-400">Inventory</span>
            </h1>
            <p className="text-gray-600 text-[15px] max-w-xl leading-relaxed mx-auto sm:mx-0">
              Institutional oversight of {courses.length} educational modules
              currently assigned to {schoolName}.
            </p>
          </div>
          <button
            onClick={fetchCourses}
            className="px-8 py-4 bg-gray-900 text-white rounded-md hover:bg-[#008000] text-[13px] capitalize transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all mx-auto lg:mx-0"
          >
            <RefreshCw size={16} /> Refresh Index
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white p-6 rounded-md border border-gray-100 shadow-sm">
        <div className="md:col-span-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Filter modules by designation or institutional code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-md text-[13px] focus:outline-none focus:bg-white focus:border-green-100 transition-all capitalize"
          />
        </div>
        <div className="md:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-full bg-gray-50 border border-transparent rounded-md px-6 py-4 text-[13px] focus:outline-none focus:bg-white focus:border-green-100 transition-all capitalize"
          >
            {["All", "published", "draft", "archived"].map((s) => (
              <option key={s} value={s}>
                {s === "All"
                  ? "Global Status"
                  : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-md border border-gray-100 shadow-sm text-center">
          <div className="bg-gray-50 p-6 rounded-full">
            <BookOpen className="w-12 h-12 text-gray-200" />
          </div>
          <div>
            <p className="text-[13px] text-gray-400 capitalize">
              Zero modules match current diagnostic filters.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
              }}
              className="mt-6 text-[13px] capitalize hover:underline"
              style={{ color: "#008000" }}
            >
              Reset Audit Parameters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filtered.map((c) => (
            <div
              key={c._id}
              onClick={() => navigate(`/principal/course/${c._id}`)}
              className="bg-white rounded-md border border-gray-100 shadow-sm hover:border-green-100 cursor-pointer transition-all group overflow-hidden flex flex-col"
            >
              <div className="relative h-48 bg-gray-900 overflow-hidden">
                {c.thumbnail ? (
                  <img
                    src={c.thumbnail}
                    alt={c.title}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-20 group-hover:opacity-40 transition-all">
                    <BookOpen size={48} className="text-white" />
                  </div>
                )}
                <div className="absolute top-6 left-6">
                  <span
                    className={`px-3 py-1 rounded-sm text-[10px] capitalize font-medium border backdrop-blur-sm ${
                      c.status === "published"
                        ? "bg-green-50/90 text-[#008000] border-green-100"
                        : "bg-yellow-50/90 text-yellow-600 border-yellow-100"
                    }`}
                  >
                    {c.status === "published" ? "Active Stream" : "Draft Logic"}
                  </span>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-xl text-gray-900 capitalize mb-2 group-hover:text-[#008000] transition-colors leading-tight">
                  {c.title}
                </h3>
                <p className="text-[11px] text-gray-400 capitalize mb-10">
                  {c.subjectCode} • Grade{" "}
                  {c.gradesEligible.join(", ") || "Global"}
                </p>

                <div className="grid grid-cols-3 gap-6 mb-10 mt-auto">
                  <div className="text-center">
                    <p className="text-2xl text-gray-900 tabular-nums">
                      {c.moduleCount}
                    </p>
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest block mt-1">
                      Units
                    </span>
                  </div>
                  <div className="text-center">
                    <p
                      className="text-2xl tabular-nums"
                      style={{ color: "#008000" }}
                    >
                      {c.enrolledCount}
                    </p>
                    <span
                      className="text-[9px] uppercase tracking-widest block mt-1"
                      style={{ color: "#008000" }}
                    >
                      Users
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl text-gray-900 tabular-nums">
                      {c.avgProgress}%
                    </p>
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest block mt-1">
                      Audit
                    </span>
                  </div>
                </div>

                <div className="space-y-4 pt-10 border-t border-gray-50">
                  <div className="flex justify-between items-center text-[10px] text-gray-400 capitalize">
                    <span>Proficiency Trace</span>
                    <span style={{ color: "#008000" }}>{c.avgProgress}%</span>
                  </div>
                  <div className="h-1 bg-gray-50 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-1000"
                      style={{
                        width: `${c.avgProgress}%`,
                        backgroundColor: "#008000",
                      }}
                    />
                  </div>
                </div>

                <div
                  className="mt-8 flex items-center justify-between text-[11px] capitalize"
                  style={{ color: "#008000" }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ backgroundColor: "#008000" }}
                    ></div>
                    Operational
                  </div>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Deep Audit <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrincipalCourses;
