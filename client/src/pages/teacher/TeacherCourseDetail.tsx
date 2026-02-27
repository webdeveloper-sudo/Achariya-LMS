import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  BookOpen,
  Users,
  Activity,
  ChevronRight,
  Loader2,
  AlertCircle,
  PlayCircle,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { teacherApi } from "../../api";

const TeacherCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      if (!courseId) return;
      try {
        setLoading(true);
        const res = await teacherApi.getCourseDetail(courseId);
        setData(res.data);
      } catch (err: any) {
        console.error("Error fetching course detail:", err);
        setError("Failed to retrieve assignment specifications.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetail();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2
          className="w-12 h-12 animate-spin"
          style={{ color: "#c72323" }}
        />
        <p className="text-[12px] text-gray-500 animate-pulse capitalize">
          Initializing Terminal...
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
        <h2 className="text-xl text-gray-900 capitalize">Access Denied</h2>
        <p className="text-[#c72323] text-sm">
          {error || "Critical system failure"}
        </p>
        <button
          onClick={() => navigate("/teacher/courses")}
          className="bg-gray-900 text-white px-8 py-3.5 rounded-md text-[13px] hover:bg-[#c72323] transition capitalize"
        >
          Return to Registry
        </button>
      </div>
    );
  }

  const { course, modules, students } = data;

  return (
    <div className="space-y-12 pb-20">
      {/* Premium Header */}
      <div className="border-b border-gray-100 pb-12">
        <Link
          to="/teacher/courses"
          className="inline-flex items-center text-[13px] hover:text-[#c72323] mb-10 transition-colors capitalize"
          style={{ color: "#c72323" }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Curriculum Registry
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-50 p-2 rounded border border-red-100">
                <BookOpen className="w-5 h-5" style={{ color: "#c72323" }} />
              </div>
              <span
                className="text-[13px] capitalize"
                style={{ color: "#c72323" }}
              >
                Module Analysis
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl text-gray-900 mb-6 leading-tight capitalize">
              {course.title},{" "}
              <span className="text-gray-400">{course.subject}</span>
            </h1>
            <p className="text-gray-600 text-[15px] max-w-xl leading-relaxed capitalize">
              Executive audit of instructional delivery and student proficiency
              within the {course.level} stratum. Internal Status:{" "}
              <span className="text-emerald-600 ml-1">{course.status}</span>
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white p-6 rounded-md border border-gray-100 shadow-sm text-center min-w-[120px]">
              <p className="text-[11px] text-gray-500 mb-2 capitalize">
                Sync Level
              </p>
              <p className="text-3xl" style={{ color: "#c72323" }}>
                {course.completion_avg}%
              </p>
            </div>
            <div className="bg-white p-6 rounded-md border border-gray-100 shadow-sm text-center min-w-[120px]">
              <p className="text-[11px] text-gray-500 mb-2 capitalize">
                Cohort Size
              </p>
              <p className="text-3xl text-gray-900">{students.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Unit Breakdown */}
        <div className="lg:col-span-12">
          <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden text-center sm:text-left">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-gray-50 p-2.5 rounded border border-gray-100">
                  <Activity size={20} style={{ color: "#c72323" }} />
                </div>
                <div>
                  <h2 className="text-xl text-gray-900 capitalize">
                    Units Registry
                  </h2>
                  <p className="text-gray-600 text-[11px] capitalize">
                    Active Curriculum Components
                  </p>
                </div>
              </div>
              <button className="bg-gray-900 text-white px-6 py-3 rounded-md text-[12px] hover:bg-[#c72323] transition flex items-center gap-2 capitalize">
                <Plus size={14} /> New Assessment
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="py-4 px-8 text-[12px] text-gray-600 capitalize">
                      Order
                    </th>
                    <th className="py-4 px-8 text-[12px] text-gray-600 capitalize">
                      Designation
                    </th>
                    <th className="py-4 px-8 text-[12px] text-gray-600 capitalize text-center">
                      Sync Rate
                    </th>
                    <th className="py-4 px-8 text-[12px] text-gray-600 capitalize text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {modules.map((m: any, idx: number) => (
                    <tr
                      key={m._id || idx}
                      className="group hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="py-5 px-8 text-[12px] text-gray-400">
                        {(idx + 1).toString().padStart(2, "0")}
                      </td>
                      <td className="py-5 px-8">
                        <p className="text-gray-900 text-sm capitalize group-hover:text-[#c72323] transition-colors">
                          {m.title || m.name}
                        </p>
                      </td>
                      <td className="py-5 px-8">
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-24 bg-gray-100 rounded-full h-1 overflow-hidden">
                            <div
                              className="h-full"
                              style={{
                                width: `${m.completion_rate || 0}%`,
                                backgroundColor: "#c72323",
                              }}
                            />
                          </div>
                          <span className="text-[12px] text-gray-900">
                            {m.completion_rate || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-2 text-gray-400 hover:text-[#c72323] transition-colors"
                            title="Launch Unit"
                          >
                            <PlayCircle size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Student Cohort Audit */}
        <div className="lg:col-span-12">
          <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden text-center sm:text-left">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-gray-50 p-2.5 rounded border border-gray-100">
                  <Users size={20} style={{ color: "#c72323" }} />
                </div>
                <div>
                  <h2 className="text-xl text-gray-900 capitalize">
                    Cohort Audit
                  </h2>
                  <p className="text-gray-600 text-[11px] capitalize">
                    Student Performance Matrix
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded border border-red-50">
                <Zap size={12} style={{ color: "#c72323", fill: "#c72323" }} />
                <span
                  className="text-[11px] capitalize"
                  style={{ color: "#c72323" }}
                >
                  Live Efficiency
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="py-4 px-8 text-[12px] text-gray-600 capitalize">
                      Enrollee Identity
                    </th>
                    <th className="py-4 px-8 text-[12px] text-gray-600 capitalize">
                      Status
                    </th>
                    <th className="py-4 px-8 text-[12px] text-gray-600 capitalize text-center">
                      Sync Level
                    </th>
                    <th className="py-4 px-8 text-[12px] text-gray-600 capitalize text-center">
                      Unit Completion
                    </th>
                    <th className="py-4 px-8 text-[12px] text-gray-600 capitalize text-right">
                      Audit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {students.map((s: any) => (
                    <tr
                      key={s.id}
                      className="group hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/teacher/student/${s.id}`)}
                    >
                      <td className="py-5 px-8">
                        <div>
                          <p className="text-gray-900 text-sm capitalize group-hover:text-[#c72323] transition-colors">
                            {s.name}
                          </p>
                          <p className="text-[11px] text-gray-500 capitalize">
                            {s.class} {s.section}
                          </p>
                        </div>
                      </td>
                      <td className="py-5 px-8">
                        <span className="px-2 py-1 rounded-[4px] text-[11px] bg-emerald-50 text-emerald-600 border border-emerald-100 capitalize">
                          Active
                        </span>
                      </td>
                      <td className="py-5 px-8 text-center">
                        <span
                          className="text-sm"
                          style={{
                            color:
                              s.progress >= 75
                                ? "#008000"
                                : s.progress >= 40
                                  ? "#d97706"
                                  : "#c72323",
                          }}
                        >
                          {s.progress}%
                        </span>
                      </td>
                      <td className="py-5 px-8 text-center text-[12px] text-gray-900 capitalize">
                        {s.modules_completed} / {s.total_modules}
                      </td>
                      <td className="py-5 px-8 text-right">
                        <button
                          className="text-[12px] capitalize hover:underline flex items-center justify-end ml-auto gap-1"
                          style={{ color: "#c72323" }}
                        >
                          Full Audit <ChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherCourseDetail;
