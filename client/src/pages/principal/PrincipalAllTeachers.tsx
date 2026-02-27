import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  GraduationCap,
  Loader2,
  AlertCircle,
  RefreshCw,
  BookOpen,
  Calendar,
  Briefcase,
  Activity,
  Zap,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

interface Teacher {
  _id: string;
  userId: string;
  userName: string;
  designation: string;
  branch: string;
  joiningDate: string;
  subjects: string[];
  gradesInCharge: string[];
  qualifications: string;
  experience: string;
  mobileNo: string;
  email: string;
  status: string;
  coursesAssigned: string[];
}

const PrincipalAllTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/principals/auth/teachers");
      setTeachers(res.data.teachers);
      setSchoolName(res.data.school);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load teachers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
    window.scrollTo(0, 0);
  }, []);

  const filtered = teachers.filter((t) => {
    const q = search.toLowerCase();
    return (
      !search ||
      t.userName?.toLowerCase().includes(q) ||
      t.designation?.toLowerCase().includes(q) ||
      t.subjects?.some((s) => s.toLowerCase().includes(q))
    );
  });

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "#008000" }}
        />
        <p className="text-[11px] text-gray-400 capitalize">
          Synchronizing Personnel Infrastructure...
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
            Personnel Sync Failure
          </h2>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
        <button
          onClick={fetchTeachers}
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
                <GraduationCap
                  className="w-5 h-5"
                  style={{ color: "#008000" }}
                />
              </div>
              <span
                className="text-[13px] capitalize"
                style={{ color: "#008000" }}
              >
                Institutional Faculty Hub
              </span>
            </div>
            <h1 className="text-4xl text-gray-900 mb-6 leading-tight capitalize">
              Academic <span className="text-gray-400">Personnel</span>
            </h1>
            <p className="text-gray-600 text-[15px] max-w-xl leading-relaxed mx-auto sm:mx-0">
              Strategic oversight of {teachers.length} professional educators
              currently assigned to {schoolName}.
            </p>
          </div>
          <button
            onClick={fetchTeachers}
            className="px-8 py-4 bg-gray-900 text-white rounded-md hover:bg-[#008000] text-[13px] capitalize transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all mx-auto lg:mx-0"
          >
            <RefreshCw size={16} /> Refresh Registry
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-md border border-gray-100 shadow-sm">
        <div className="relative max-w-3xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search personnel by identity, designation, or subject specialism…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-md text-[13px] focus:outline-none focus:bg-white focus:border-green-100 transition-all capitalize"
          />
        </div>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-md border border-gray-100 shadow-sm text-center">
          <div className="bg-gray-50 p-6 rounded-full">
            <GraduationCap className="w-12 h-12 text-gray-200" />
          </div>
          <div>
            <p className="text-[13px] text-gray-400 capitalize">
              Zero personnel match current scan parameters.
            </p>
            <button
              onClick={() => setSearch("")}
              className="mt-6 text-[13px] capitalize hover:underline"
              style={{ color: "#008000" }}
            >
              Reset Scan Parameters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filtered.map((t) => (
            <div
              key={t._id}
              className="group bg-white rounded-md border border-gray-100 shadow-sm p-8 hover:border-green-100 transition-all flex flex-col"
            >
              {/* Name + status */}
              <div className="flex items-start justify-between mb-10 text-center sm:text-left">
                <div className="flex-1">
                  <h3 className="text-xl text-gray-900 capitalize mb-1 group-hover:text-[#008000] transition-colors leading-tight">
                    {t.userName}
                  </h3>
                  <p className="text-[11px] text-gray-400 capitalize">
                    {t.designation}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-sm text-[10px] capitalize font-medium border ${
                    t.status === "Active"
                      ? "bg-green-50 text-[#008000] border-green-100"
                      : t.status === "On Leave"
                        ? "bg-yellow-50 text-yellow-600 border-yellow-100"
                        : "bg-gray-50 text-gray-500 border-gray-100"
                  }`}
                >
                  {t.status}
                </span>
              </div>

              {/* Info pills */}
              <div className="space-y-6 flex-1">
                {t.subjects?.length > 0 && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-md border border-transparent transition-all group-hover:bg-white group-hover:border-green-50">
                    <BookOpen
                      className="w-4 h-4 shrink-0 mt-0.5"
                      style={{ color: "#008000" }}
                    />
                    <div>
                      <p className="text-[10px] text-gray-400 capitalize mb-1">
                        Specialism
                      </p>
                      <p className="text-[13px] text-gray-700 font-medium capitalize">
                        {t.subjects.join(", ")}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  {t.experience && (
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-md border border-transparent transition-all group-hover:bg-white group-hover:border-green-50">
                      <Briefcase className="w-4 h-4 shrink-0 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-gray-400 capitalize mb-1">
                          Tenure
                        </p>
                        <p className="text-[13px] text-gray-700 font-medium capitalize">
                          {t.experience}
                        </p>
                      </div>
                    </div>
                  )}
                  {t.joiningDate && (
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-md border border-transparent transition-all group-hover:bg-white group-hover:border-green-50">
                      <Calendar className="w-4 h-4 shrink-0 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-gray-400 capitalize mb-1">
                          Induction
                        </p>
                        <p className="text-[13px] text-gray-700 font-medium capitalize">
                          {new Date(t.joiningDate).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Courses assigned */}
              <div className="mt-10 pt-10 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity size={14} style={{ color: "#008000" }} />
                  <span className="text-[11px] text-gray-900 capitalize font-medium">
                    {t.coursesAssigned?.length || 0} Professional Assets
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] capitalize text-gray-400">
                  <Zap size={14} fill="#f59e0b" className="text-amber-500" />
                  Verified
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrincipalAllTeachers;
