import { Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, Award, Activity } from "lucide-react";
import { sampleData } from "../../data/sampleData";

const TeacherPerformanceBreakdown = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const teacher =
    sampleData.teachers.find((t) => t.email === user.email) ||
    sampleData.teachers[0];

  const teacherCourses = sampleData.courses.filter(
    (c) => c.teacher_id === teacher.id,
  );

  const courseStats = teacherCourses.map((course) => {
    const enrollments = sampleData.enrollments.filter(
      (e) => e.course_id === course.id,
    );
    const avgCompletion =
      enrollments.length > 0
        ? Math.round(
            enrollments.reduce((sum, e) => sum + e.progress, 0) /
              enrollments.length,
          )
        : 0;

    return {
      ...course,
      enrollments: enrollments.length,
      avgCompletion,
      highPerformers: enrollments.filter((e) => e.progress >= 85).length,
      needsAttention: enrollments.filter((e) => e.progress < 70).length,
    };
  });

  const overallAvg =
    courseStats.length > 0
      ? Math.round(
          courseStats.reduce((sum, c) => sum + c.avgCompletion, 0) /
            courseStats.length,
        )
      : 0;

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
            <Activity className="w-5 h-5" style={{ color: "#c72323" }} />
          </div>
          <span className="text-[13px] capitalize" style={{ color: "#c72323" }}>
            Performance Analysis
          </span>
        </div>
        <h1 className="text-4xl text-gray-900 leading-tight capitalize">
          Class Performance <span className="text-gray-400">Breakdown</span>
        </h1>
        <p className="text-gray-600 text-[15px] mt-6 max-w-2xl leading-relaxed">
          Overall Institutional Average:{" "}
          <span className="text-2xl ml-2" style={{ color: "#c72323" }}>
            {overallAvg}%
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-center sm:text-left">
        {courseStats.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-md border border-gray-100 shadow-sm p-8 hover:border-red-100 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-8 gap-4">
                <div className="flex-1">
                  <h3 className="text-xl text-gray-900 capitalize">
                    {course.title}
                  </h3>
                  <p className="text-[12px] text-gray-500 mt-1 capitalize">
                    {course.subject} • {course.level}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl" style={{ color: "#c72323" }}>
                    {course.avgCompletion}%
                  </p>
                  <p className="text-[11px] text-gray-400 capitalize">
                    Avg Sync
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-gray-600 capitalize">
                    Total Enrollees:
                  </span>
                  <span className="text-gray-900">{course.enrollments}</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-gray-600 flex items-center capitalize">
                    <Award className="w-4 h-4 mr-2 text-emerald-500" />
                    High Performers:
                  </span>
                  <span className="text-emerald-600">
                    {course.highPerformers}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-gray-600 flex items-center capitalize">
                    <TrendingUp className="w-4 h-4 mr-2 text-yellow-500" />
                    Attention Required:
                  </span>
                  <span className="text-[#c72323]">
                    {course.needsAttention}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-[11px] mb-2 capitalize">
                  <span className="text-gray-500">Curriculum Sync Level</span>
                  <span className="text-gray-500">{course.avgCompletion}%</span>
                </div>
                <div className="w-full bg-gray-50 rounded-full h-1 overflow-hidden border border-gray-100">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${course.avgCompletion}%`,
                      backgroundColor:
                        course.avgCompletion >= 85
                          ? "#10b981"
                          : course.avgCompletion >= 70
                            ? "#f59e0b"
                            : "#c72323",
                    }}
                  />
                </div>
              </div>
            </div>

            <Link
              to={`/teacher/course/${course.id}`}
              className="w-full text-center py-3.5 bg-gray-900 text-white rounded-md hover:bg-[#c72323] transition text-[13px] capitalize"
            >
              Executive Audit
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherPerformanceBreakdown;
