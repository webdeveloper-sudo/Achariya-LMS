import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Activity,
  Loader2,
  AlertCircle,
  Award,
  Star,
  Zap,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { teacherApi } from "../../api";

const TeacherStudentDetail = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentDetail = async () => {
      if (!studentId) return;
      try {
        setLoading(true);
        const res = await teacherApi.getStudentDetail(studentId);
        setData(res.data);
      } catch (err: any) {
        console.error("Error fetching student detail:", err);
        setError("Failed to retrieve enrollee dossier.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudentDetail();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2
          className="w-12 h-12 animate-spin"
          style={{ color: "#c72323" }}
        />
        <p className="text-[12px] text-gray-500 animate-pulse capitalize">
          Retrieving Dossier...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
        <div className="bg-red-50 p-4 rounded-full">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-xl text-gray-900 capitalize">Registry Error</h2>
        <p className="text-[#c72323] text-sm">
          {error || "Critical system failure"}
        </p>
        <button
          onClick={() => navigate("/teacher/students")}
          className="bg-gray-900 text-white px-8 py-3.5 rounded-md text-[13px] hover:bg-[#c72323] transition capitalize"
        >
          Return to Cohort
        </button>
      </div>
    );
  }

  const { student, enrollments } = data;

  return (
    <div className="space-y-12 pb-20">
      {/* Premium Header */}
      <div className="border-b border-gray-100 pb-12">
        <Link
          to="/teacher/students"
          className="inline-flex items-center text-[13px] hover:text-[#c72323] mb-10 transition-colors capitalize"
          style={{ color: "#c72323" }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Cohort Directory
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shadow-inner">
                {student.avatar ? (
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-gray-300" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl text-gray-900 capitalize">
                    {student.name}
                  </h1>
                  {student.onboarded && (
                    <div className="bg-emerald-50 text-emerald-600 p-1 rounded-full border border-emerald-100">
                      <Star size={12} className="fill-emerald-600" />
                    </div>
                  )}
                </div>
                <p className="text-gray-600 text-[13px] capitalize flex items-center gap-3">
                  {student.class} {student.section}{" "}
                  <span className="text-gray-200">|</span> Admissions:{" "}
                  {student.admissionNo}
                </p>
                <p className="text-gray-500 text-[12px] mt-1">
                  {student.email}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div
                className="px-4 py-2 bg-red-50 rounded-md border border-red-100 text-[11px] flex items-center gap-2 capitalize"
                style={{ color: "#c72323" }}
              >
                <Activity size={12} /> Live Sync Active
              </div>
              <div className="px-4 py-2 bg-gray-900 text-white rounded-md text-[11px] flex items-center gap-2 capitalize">
                <Zap size={12} className="text-yellow-400 fill-yellow-400" />{" "}
                {student.gamification?.totalCredits ||
                  student.totalCredits ||
                  0}{" "}
                Institutional Credits
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Global Sync",
            val: student.onboarded ? "Activated" : "Pending",
            icon: Star,
            color: student.onboarded ? "emerald" : "orange",
          },
          {
            label: "Institutional Rank",
            val: "#14",
            icon: Award,
            color: "red",
          },
          {
            label: "Audit Modules",
            val: enrollments.length,
            icon: Activity,
            color: "gray",
          },
          {
            label: "Last Heartbeat",
            val: "2m ago",
            icon: Clock,
            color: "gray",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-md p-8 border border-gray-100 shadow-sm hover:border-red-100 transition-all"
          >
            <div
              className={`w-10 h-10 rounded flex items-center justify-center mb-6 border border-opacity-10`}
              style={{
                backgroundColor:
                  stat.color === "red"
                    ? "#c7232310"
                    : stat.color === "emerald"
                      ? "#00800010"
                      : "gray-50",
                borderColor:
                  stat.color === "red"
                    ? "#c7232320"
                    : stat.color === "emerald"
                      ? "#00800020"
                      : "gray-200",
              }}
            >
              <stat.icon
                size={18}
                style={{
                  color:
                    stat.color === "red"
                      ? "#c72323"
                      : stat.color === "emerald"
                        ? "#008000"
                        : "gray-600",
                }}
              />
            </div>
            <p className="text-[12px] text-gray-600 mb-2 capitalize">
              {stat.label}
            </p>
            <p className="text-2xl text-gray-900">{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Enrollment Portfolio */}
      <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden text-center sm:text-left">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gray-50 p-2.5 rounded border border-gray-100">
              <Activity size={20} style={{ color: "#c72323" }} />
            </div>
            <div>
              <h2 className="text-xl text-gray-900 capitalize">
                Enrollment Portfolio
              </h2>
              <p className="text-gray-600 text-[11px] capitalize">
                Active Curricular Access
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-8 text-[12px] text-gray-600 capitalize">
                  Enrolled Module
                </th>
                <th className="py-4 px-8 text-[12px] text-gray-600 capitalize text-center">
                  Sync Progress
                </th>
                <th className="py-4 px-8 text-[12px] text-gray-600 capitalize text-center">
                  Operational Status
                </th>
                <th className="py-4 px-8 text-[12px] text-gray-600 capitalize text-right">
                  Last Sync
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {enrollments.map((course: any) => (
                <tr
                  key={course.courseId}
                  className="group hover:bg-gray-50/80 transition-colors"
                >
                  <td className="py-5 px-8">
                    <p className="text-gray-900 text-sm capitalize group-hover:text-[#c72323] transition-colors">
                      {course.title}
                    </p>
                  </td>
                  <td className="py-5 px-8">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-24 bg-gray-100 rounded-full h-1 overflow-hidden">
                        <div
                          className="h-full"
                          style={{
                            width: `${course.progress}%`,
                            backgroundColor:
                              course.progress >= 75
                                ? "#008000"
                                : course.progress >= 40
                                  ? "#d97706"
                                  : "#c72323",
                          }}
                        />
                      </div>
                      <span className="text-[12px] text-gray-900">
                        {course.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-8 text-center">
                    <span
                      className={`px-2 py-1 rounded-[4px] text-[11px] border capitalize ${
                        course.status === "active"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-gray-50 text-gray-500 border-gray-100"
                      }`}
                    >
                      {course.status || "Engaged"}
                    </span>
                  </td>
                  <td className="py-5 px-8 text-right text-[12px] text-gray-500 capitalize">
                    {course.last_active
                      ? new Date(course.last_active).toLocaleDateString()
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {enrollments.length === 0 && (
          <div className="p-20 text-center">
            <p className="text-gray-400 text-[13px] capitalize">
              No active curricular engagements found for this enrollee.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherStudentDetail;
