import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Activity,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { teacherApi } from "../../api";

const TeacherCoursesPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await teacherApi.getCourses();
        setCourses(res.data.courses);
      } catch (err: any) {
        console.error("Error fetching courses:", err);
        setError("Failed to synchronize curriculum data.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2
          className="w-12 h-12 animate-spin"
          style={{ color: "#c72323" }}
        />
        <p className="text-[12px] text-gray-500 animate-pulse capitalize">
          Synchronizing Curriculum Cluster...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
        <div className="bg-red-50 p-4 rounded-full">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-xl text-gray-900 capitalize">Sync Error</h2>
        <p className="text-[#c72323] text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-gray-900 text-white px-8 py-3.5 rounded-md text-[13px] hover:bg-[#c72323] transition capitalize"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="border-b border-gray-100 pb-10">
        <Link
          to="/teacher/dashboard"
          className="inline-flex items-center text-[13px] hover:text-[#c72323] mb-8 transition-colors capitalize"
          style={{ color: "#c72323" }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Terminal
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-50 p-2 rounded border border-red-100">
            <BookOpen className="w-5 h-5" style={{ color: "#c72323" }} />
          </div>
          <span className="text-[13px] capitalize" style={{ color: "#c72323" }}>
            Curriculum Inventory
          </span>
        </div>
        <h1 className="text-4xl text-gray-900 leading-tight capitalize">
          Teaching <span className="text-gray-400">Assignments</span>
        </h1>
        <p className="text-gray-600 text-[15px] mt-6 max-w-2xl leading-relaxed">
          Management and oversight of institutional learning modules and active
          student cohorts. Total of {courses.length} validated assignments.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-md border border-dashed border-gray-300 p-20 text-center">
          <p className="text-gray-400 text-[13px] mb-4 capitalize">
            No Active Academic Assignments Found
          </p>
          <p className="text-sm text-gray-600">
            Please contact your administrator for course allocation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden group hover:border-red-200 transition-all cursor-pointer"
              onClick={() =>
                navigate(`/teacher/course/${course.id || course.courseId}`)
              }
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-xl text-gray-900 group-hover:text-[#c72323] transition-colors mb-1 capitalize">
                      {course.title}
                    </h3>
                    <p className="text-[12px] text-gray-600 capitalize">
                      {course.subject} • {course.courseId}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-[11px] border bg-emerald-50 text-emerald-600 border-emerald-100 capitalize`}
                  >
                    {course.status || "Active"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-10">
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-50 text-center">
                    <p className="text-2xl text-gray-900 mb-1">
                      {course.enrollmentCount}
                    </p>
                    <p className="text-[11px] text-gray-600 capitalize">
                      Students
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-md border border-red-50 text-center">
                    <p className="text-2xl mb-1" style={{ color: "#c72323" }}>
                      {course.completion_avg}%
                    </p>
                    <p
                      className="text-[11px] capitalize"
                      style={{ color: "#c72323", opacity: 0.7 }}
                    >
                      Proficiency
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-50 text-center">
                    <p className="text-2xl text-gray-900 mb-1">
                      {course.moduleCount || 0}
                    </p>
                    <p className="text-[11px] text-gray-600 capitalize">
                      Units
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[12px] text-gray-900 capitalize flex items-center gap-2 mb-4">
                    <Activity size={14} style={{ color: "#c72323" }} />
                    Operational Status
                  </h4>
                  <div className="flex justify-between items-center text-[12px] text-gray-600 capitalize">
                    <span>Last Cluster Sync</span>
                    <span>
                      {new Date(course.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-50 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full transition-all duration-1000 shadow-[0_0_10px_rgba(199,35,35,0.2)]"
                      style={{
                        width: `${course.completion_avg}%`,
                        backgroundColor: "#c72323",
                      }}
                    />
                  </div>
                </div>

                <button className="w-full mt-10 py-4 bg-gray-900 text-white rounded-md text-[13px] hover:bg-[#c72323] transition shadow-sm flex items-center justify-center gap-2 capitalize">
                  Access Terminal <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherCoursesPage;
