import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Users,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  Clock,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

interface Student {
  _id: string;
  studentName: string;
  name: string;
  admissionNo: string;
  class: string;
  section: string;
  email: string;
  status: string;
  onboarded: boolean;
  completion: number;
  totalCredits: number;
  gamification?: { totalCredits: number; badges: { name: string }[] };
  badges?: string[];
  enrolledCourses?: { courseId: string }[];
}

const PrincipalAllStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/principals/auth/students");
      setStudents(res.data.students);
      setSchoolName(res.data.school);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    window.scrollTo(0, 0);
  }, []);

  const classes = [
    "All",
    ...Array.from(new Set(students.map((s) => s.class))).sort(),
  ];

  const filtered = students.filter((s) => {
    const name = (s.studentName || s.name || "").toLowerCase();
    const adm = (s.admissionNo || "").toLowerCase();
    const q = search.toLowerCase();
    const matchSearch = !search || name.includes(q) || adm.includes(q);
    const matchClass = classFilter === "All" || s.class === classFilter;
    const matchStatus =
      statusFilter === "All" ||
      (statusFilter === "Onboarded" && s.onboarded) ||
      (statusFilter === "Not Onboarded" && !s.onboarded);
    return matchSearch && matchClass && matchStatus;
  });

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "#008000" }}
        />
        <p className="text-[11px] text-gray-400 capitalize">
          Synchronizing Student Data Infrastructure...
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
            Student Data Sync Failure
          </h2>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
        <button
          onClick={fetchStudents}
          className="flex items-center gap-3 px-8 py-3.5 bg-gray-900 text-white rounded-md text-[13px] capitalize hover:bg-[#008000] transition shadow-sm"
        >
          <RefreshCw size={16} /> Re-sync Terminal
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
                <Users className="w-5 h-5" style={{ color: "#008000" }} />
              </div>
              <span
                className="text-[13px] capitalize"
                style={{ color: "#008000" }}
              >
                Institutional Registry
              </span>
            </div>
            <h1 className="text-4xl text-gray-900 mb-6 leading-tight capitalize">
              Student <span className="text-gray-400">Audit</span>
            </h1>
            <p className="text-gray-600 text-[15px] max-w-xl leading-relaxed mx-auto sm:mx-0">
              Executive oversight of {students.length} institutional enrollees
              currently synchronized for {schoolName}.
            </p>
          </div>
          <button
            onClick={fetchStudents}
            className="px-8 py-4 bg-gray-900 text-white rounded-md hover:bg-[#008000] text-[13px] capitalize transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all mx-auto lg:mx-0"
          >
            <RefreshCw size={16} /> Sync Records
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        {[
          { label: "Global Sync", val: students.length, color: "gray" },
          {
            label: "Activated Units",
            val: students.filter((s) => s.onboarded).length,
            color: "green",
          },
          {
            label: "Pending Sync",
            val: students.filter((s) => !s.onboarded).length,
            color: "orange",
          },
          {
            label: "Cohort Proficiency",
            val: `${students.length ? Math.round(students.reduce((a, s) => a + (s.completion || 0), 0) / students.length) : 0}%`,
            color: "green",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-md border border-gray-100 p-8 shadow-sm text-center sm:text-left"
          >
            <p className="text-[11px] text-gray-400 capitalize mb-2">
              {stat.label}
            </p>
            <p
              className="text-4xl tracking-tight"
              style={{
                color:
                  stat.color === "green"
                    ? "#008000"
                    : stat.color === "orange"
                      ? "#f59e0b"
                      : "#111827",
              }}
            >
              {stat.val}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white p-6 rounded-md border border-gray-100 shadow-sm">
        <div className="md:col-span-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search students by identity or admission code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-md text-[13px] focus:outline-none focus:bg-white focus:border-green-100 transition-all capitalize"
          />
        </div>
        <div className="md:col-span-3">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full h-full bg-gray-50 border border-transparent rounded-md px-6 py-4 text-[13px] focus:outline-none focus:bg-white focus:border-green-100 transition-all capitalize"
          >
            {classes.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "Institutional Global" : `Grade ${c}`}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-full bg-gray-50 border border-transparent rounded-md px-6 py-4 text-[13px] focus:outline-none focus:bg-white focus:border-green-100 transition-all capitalize"
          >
            {["All", "Onboarded", "Not Onboarded"].map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "Sync Status" : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden text-center sm:text-left">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
            <div className="bg-gray-50 p-6 rounded-full">
              <Users className="w-12 h-12 text-gray-200" />
            </div>
            <div>
              <p className="text-[13px] text-gray-400 capitalize">
                Zero participants match current audit parameters.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setClassFilter("All");
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
                    Sync State
                  </th>
                  <th className="px-8 py-5 text-center text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                    Audit Trace
                  </th>
                  <th className="px-8 py-5 text-center text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                    Asset Units
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
                {filtered.map((s) => (
                  <tr
                    key={s._id}
                    className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/principal/student/${s._id}`)}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-baseline gap-3">
                        <p className="text-sm text-gray-900 capitalize font-medium group-hover:text-[#008000] transition-colors leading-tight">
                          {s.studentName || s.name}
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
                    <td className="px-8 py-6 text-center">
                      {s.onboarded ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-green-50 text-[#008000] text-[10px] capitalize font-medium border border-green-100">
                          <CheckCircle className="w-3 h-3" /> Fully Synced
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-orange-50 text-orange-700 text-[10px] capitalize font-medium border border-orange-100">
                          <Clock className="w-3 h-3" /> Initialization
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span
                        className={`text-sm font-medium tabular-nums ${
                          (s.completion || 0) >= 75
                            ? "text-emerald-600"
                            : (s.completion || 0) >= 40
                              ? "text-orange-600"
                              : "text-red-600"
                        }`}
                      >
                        {s.completion || 0}%
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center text-sm text-gray-900 tabular-nums">
                      {s.enrolledCourses?.length || 0}
                    </td>
                    <td
                      className="px-8 py-6 text-center text-sm tabular-nums"
                      style={{ color: "#008000" }}
                    >
                      {s.gamification?.totalCredits ?? s.totalCredits ?? 0}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => navigate(`/principal/student/${s._id}`)}
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
  );
};

export default PrincipalAllStudents;
