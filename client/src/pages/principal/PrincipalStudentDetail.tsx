import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Award,
  Star,
  BookOpen,
  TrendingUp,
  Loader2,
  AlertCircle,
  RefreshCw,
  User,
  Activity,
  Zap,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

// Types
interface StudentProfile {
  _id: string;
  name: string;
  admissionNo: string;
  class: string;
  section: string;
  email: string;
  mobileNo: string;
  status: string;
  onboarded: boolean;
  completion: number;
  school: string;
  gamification?: {
    totalCredits: number;
    level: number;
    badges?: { name: string; earnedAt: string }[];
    lastActivityDate?: string;
  };
  badges?: string[];
  totalCredits?: number;
  createdAt: string;
}

interface EnrolledCourse {
  courseId: string;
  title: string;
  subjectCode: string;
  status: string;
  thumbnail?: string;
  progress: number;
  completedModules: number;
  enrolledAt: string | null;
}

interface Data {
  student: StudentProfile;
  enrolledCourses: EnrolledCourse[];
}

const PrincipalStudentDetail = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudent = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(
        `/principals/auth/students/${studentId}`,
      );
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load student.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
    window.scrollTo(0, 0);
  }, [studentId]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "#008000" }}
        />
        <p className="text-[11px] text-gray-400 capitalize">
          Synchronizing Participant Profile...
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
            Profile Synchronization Failure
          </h2>
          <p className="text-gray-600 text-sm">
            {error || "Participant not found"}
          </p>
        </div>
        <button
          onClick={fetchStudent}
          className="flex items-center gap-3 px-8 py-3.5 bg-gray-900 text-white rounded-md text-[13px] capitalize hover:bg-[#008000] transition shadow-sm"
        >
          <RefreshCw size={16} /> Re-sync Terminal
        </button>
      </div>
    );

  const { student, enrolledCourses } = data;
  const credits =
    student.gamification?.totalCredits ?? student.totalCredits ?? 0;
  const badges = student.gamification?.badges ?? (student.badges as any) ?? [];
  const badgeCount = Array.isArray(badges) ? badges.length : 0;

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="border-b border-gray-100 pb-12">
        <Link
          to="/principal/students"
          className="inline-flex items-center text-[13px] hover:text-[#008000] mb-10 transition-colors capitalize"
          style={{ color: "#008000" }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Student Audit Registry
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-center sm:text-left">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6 justify-center sm:justify-start">
              <div className="w-20 h-20 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                <User size={36} className="text-gray-200" />
              </div>
              <div>
                <h1 className="text-4xl text-gray-900 mb-2 leading-tight capitalize">
                  {student.name}
                </h1>
                <p className="text-gray-600 text-[15px] leading-relaxed">
                  Identity Trace:{" "}
                  <span className="font-medium text-gray-900 font-mono">
                    {student.admissionNo}
                  </span>{" "}
                  • {student.class} {student.section}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center sm:justify-start lg:mx-0 mx-auto">
            <span
              className={`inline-flex items-center px-4 py-2 rounded-sm text-[11px] capitalize font-medium border ${
                student.onboarded
                  ? "bg-green-50 text-[#008000] border-green-100"
                  : "bg-orange-50 text-orange-700 border-orange-100"
              }`}
            >
              {student.onboarded ? "Fully Synced" : "Pending Initialization"}
            </span>
            <button
              onClick={fetchStudent}
              className="p-3 bg-gray-50 text-gray-400 rounded-md hover:text-[#008000] hover:bg-green-50 transition border border-gray-100"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 p-6 rounded-md border border-gray-100">
          <div className="space-y-4">
            <p className="text-[11px] text-gray-400 capitalize mb-2">
              Communication Hub
            </p>
            {student.email && (
              <div className="flex items-center gap-3 text-[13px] text-gray-600">
                <Mail size={16} className="text-gray-400" />
                {student.email}
              </div>
            )}
            {student.mobileNo && (
              <div className="flex items-center gap-3 text-[13px] text-gray-600">
                <Phone size={16} className="text-gray-400" />
                {student.mobileNo}
              </div>
            )}
          </div>
          <div className="space-y-4">
            <p className="text-[11px] text-gray-400 capitalize mb-2">
              System Status
            </p>
            <div className="flex items-center gap-3 text-[13px] text-gray-600 capitalize">
              <Activity size={16} className="text-gray-400" />
              Enrollment: {student.status}
            </div>
            <div className="flex items-center gap-3 text-[13px] text-gray-600 capitalize">
              <Zap size={16} className="text-amber-500" fill="#f59e0b" />
              Verified Institution: {student.school}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Audit Trace",
            val: `${student.completion}%`,
            icon: TrendingUp,
          },
          {
            label: "Credit Value",
            val: credits,
            icon: Star,
          },
          {
            label: "Distinctions",
            val: badgeCount,
            icon: Award,
          },
          {
            label: "Asset Units",
            val: enrolledCourses.length,
            icon: BookOpen,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="group bg-white rounded-md p-8 border border-gray-100 shadow-sm transition-all text-center sm:text-left"
          >
            <div className="bg-gray-50 text-gray-400 w-12 h-12 rounded flex items-center justify-center mb-6 mx-auto sm:mx-0 group-hover:bg-green-50 group-hover:text-[#008000] transition-colors">
              <stat.icon size={22} />
            </div>
            <p className="text-[11px] text-gray-400 capitalize mb-2 font-medium">
              {stat.label}
            </p>
            <p className="text-4xl text-gray-900 tracking-tight tabular-nums">
              {stat.val}
            </p>
          </div>
        ))}
      </div>

      {/* Badges Section */}
      {Array.isArray(badges) && badges.length > 0 && (
        <div className="bg-white rounded-md border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-4 mb-8 text-center sm:text-left">
            <div
              className="bg-gray-50 p-2.5 rounded border border-gray-100"
              style={{ color: "#008000" }}
            >
              <Award size={20} />
            </div>
            <div>
              <h2 className="text-xl text-gray-900 capitalize">
                Performance Distinctions
              </h2>
              <p className="text-gray-400 text-[11px] capitalize mt-1">
                Validated Excellence Traces
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            {badges.map((b: any, i: number) => (
              <span
                key={i}
                className="inline-flex items-center gap-2.5 px-4 py-2 bg-gray-50 border border-gray-100 rounded-sm text-[11px] capitalize text-gray-700 font-medium hover:bg-green-50 hover:border-green-100 hover:text-[#008000] transition-all"
              >
                <Award size={14} className="text-gray-400" />
                {typeof b === "string" ? b : b.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Enrolled Courses */}
      <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden text-center sm:text-left">
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
                Asset Inventory
              </h2>
              <p className="text-gray-400 text-[11px] capitalize mt-1">
                Active Instructional Streams ({enrolledCourses.length})
              </p>
            </div>
          </div>
          <Activity size={18} className="text-gray-200 hidden sm:block" />
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white text-center">
            <div className="bg-gray-50 p-6 rounded-full">
              <BookOpen className="w-12 h-12 text-gray-200" />
            </div>
            <p className="text-[13px] text-gray-400 capitalize">
              Zero participation traces in current curriculum assets.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {enrolledCourses.map((c) => (
              <div
                key={c.courseId}
                className="p-8 hover:bg-gray-50/50 group transition-all cursor-pointer"
                onClick={() => navigate(`/principal/course/${c.courseId}`)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-8">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-md bg-gray-900 overflow-hidden flex items-center justify-center shrink-0">
                      {c.thumbnail ? (
                        <img
                          src={c.thumbnail}
                          alt={c.title}
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700"
                        />
                      ) : (
                        <BookOpen
                          size={24}
                          className="text-white opacity-20 group-hover:opacity-40 transition-all"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg text-gray-900 capitalize font-medium group-hover:text-[#008000] transition-colors leading-tight">
                        {c.title}
                      </h3>
                      <p className="text-[11px] text-gray-400 capitalize mt-1">
                        {c.subjectCode} • Enrollment Trace:{" "}
                        {c.enrolledAt
                          ? new Date(c.enrolledAt).toLocaleDateString("en-IN", {
                              month: "short",
                              year: "numeric",
                            })
                          : "--"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 lg:text-right">
                    <div className="px-8 border-x border-gray-100 lg:border-r-0 lg:border-l border-gray-100 h-10 flex flex-col justify-center">
                      <p className="text-[11px] text-gray-400 capitalize mb-1">
                        Functional Units
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {c.completedModules} Completed
                      </p>
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="text-[11px] text-gray-400 capitalize mb-1">
                        Proficiency
                      </p>
                      <p
                        className="text-sm font-medium tabular-nums"
                        style={{ color: "#008000" }}
                      >
                        {c.progress}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full bg-gray-50 rounded-full h-1 overflow-hidden">
                  <div
                    className="h-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,128,0,0.2)]"
                    style={{
                      width: `${c.progress}%`,
                      backgroundColor: "#008000",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrincipalStudentDetail;
