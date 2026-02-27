import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  TrendingUp,
  BookOpen,
  Wallet,
  AlertTriangle,
  Activity,
  ChevronRight,
  PlayCircle,
  Zap,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import StartLiveQuizModal from "../../components/StartLiveQuizModal";
import { startLiveQuizSession } from "../../services/liveQuizService";
import { teacherApi } from "../../api";

const TeacherDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLiveQuizModal, setShowLiveQuizModal] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await teacherApi.getDashboard();
        setData(res.data);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleStartLiveQuiz = async (quizData: {
    classId: string;
    className: string;
    duration: number;
  }) => {
    try {
      const sessionId = await startLiveQuizSession({
        quizId: "demo-quiz",
        quizTitle: "Live Quiz Demo",
        classId: quizData.classId,
        className: quizData.className,
        teacherId: data.teacher.id,
        teacherName: data.teacher.name,
        duration: quizData.duration,
        questionCount: 10,
      });
      setShowLiveQuizModal(false);
      navigate(`/teacher/live-quiz/${sessionId}/control`);
    } catch (error) {
      console.error("Error starting live quiz:", error);
      alert("Failed to start quiz. Please try again.");
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2
          className="w-12 h-12 animate-spin"
          style={{ color: "#c72323" }}
        />
        <p className="text-gray-500 font-medium animate-pulse">
          Synchronizing Academic Data...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="bg-red-50 p-4 rounded-full">
          <AlertTriangle className="w-12 h-12" style={{ color: "#c72323" }} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl text-gray-900 mb-2">
            Data Synchronization Failure
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            {error || "Unable to retrieve teacher profile."}
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-gray-900 text-white px-8 py-3 rounded-md text-[13px] hover:bg-[#c72323] transition shadow-sm capitalize"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { teacher, metrics, courses, atRiskStudents, studentAudit } = data;

  return (
    <div className="space-y-12 pb-20">
      {/* Header Section - Industrial Academic Refinement */}
      <div className="border-b border-gray-100 pb-12 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-50 p-2 rounded border border-red-100">
                <Activity className="w-5 h-5" style={{ color: "#c72323" }} />
              </div>
              <span
                className="text-[13px] capitalize"
                style={{ color: "#c72323" }}
              >
                Institutional Educator Hub
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl text-gray-900 mb-6 leading-tight capitalize">
              {getTimeGreeting()},{" "}
              <span className="text-gray-400">
                {teacher.name.split(" ")[0]}
              </span>
            </h1>
            <p className="text-gray-600 text-[15px] max-w-xl leading-relaxed">
              Strategic curriculum oversight and student performance monitoring.
              Currently managing {metrics.totalCourses} active courses with an
              average student completion rate of {metrics.avgCompletion}%.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <button
                onClick={() => setShowLiveQuizModal(true)}
                className="bg-gray-900 text-white px-8 py-3.5 rounded-md text-[13px] hover:bg-[#c72323] transition shadow-sm flex items-center gap-2 capitalize"
              >
                <PlayCircle className="w-4 h-4" /> Start Live Session
              </button>
              <Link
                to="/teacher/courses"
                className="bg-white text-gray-700 border border-gray-300 px-8 py-3.5 rounded-md text-[13px] hover:bg-gray-50 transition flex items-center gap-2 capitalize"
              >
                Course Catalog <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-96 bg-white p-8 rounded-md border border-gray-300 shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <p
                className="text-[11px] mb-4 flex items-center gap-2 capitalize"
                style={{ color: "#c72323" }}
              >
                <Zap size={12} fill="#c72323" /> Administrative Focus
              </p>
              <h3 className="text-xl text-gray-900 mb-8 capitalize">
                Pedagogical Efficiency
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-[11px] capitalize">
                  <span className="text-gray-400">System Engagement</span>
                  <span style={{ color: "#c72323" }}>Optimal</span>
                </div>
                <div className="w-full bg-gray-50 rounded-full h-1.5 overflow-hidden border border-gray-100">
                  <div
                    className="h-full w-[85%] shadow-[0_0_10px_rgba(199,35,35,0.2)]"
                    style={{ backgroundColor: "#c72323" }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gray-50 rounded-full -z-0"></div>
          </div>
        </div>
      </div>

      {/* Key Metrics - Professional Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Assigned Courses",
            val: metrics.totalCourses,
            icon: BookOpen,
            color: "#c72323",
            link: "/teacher/courses",
          },
          {
            label: "Active Students",
            val: metrics.totalStudents,
            icon: Users,
            color: "#c72323",
            link: "/teacher/students",
          },
          {
            label: "Avg Completion",
            val: `${metrics.avgCompletion}%`,
            icon: TrendingUp,
            color: "#c72323",
            link: "/teacher/performance",
          },
          {
            label: "Institutional Credits",
            val: metrics.credits,
            icon: Wallet,
            color: "#c72323",
            link: "/teacher/credits",
          },
        ].map((stat, i) => (
          <Link
            key={i}
            to={stat.link}
            className="group bg-white rounded-md p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
            style={{ borderColor: "transparent" }}
            onMouseOver={(e) =>
              (e.currentTarget.style.borderColor = stat.color)
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.borderColor = "transparent")
            }
          >
            <div className="bg-gray-50 text-gray-400 w-12 h-12 rounded flex items-center justify-center mb-6 border border-gray-50 group-hover:bg-red-50 transition-all duration-300">
              <stat.icon
                size={22}
                className="group-hover:scale-110 transition-transform"
                style={{ color: "currentColor" }}
              />
            </div>
            <p className="text-[12px] text-gray-600 mb-2 capitalize group-hover:text-red-400 transition-colors">
              {stat.label}
            </p>
            <p className="text-4xl text-gray-900">{stat.val}</p>
          </Link>
        ))}
      </div>

      {/* At-Risk Students - Alert Style */}
      {atRiskStudents.length > 0 && (
        <div
          className="bg-white rounded-md border-l-4 p-8 shadow-sm"
          style={{ borderLeftColor: "#c72323" }}
        >
          <div className="flex items-start gap-6">
            <div className="bg-red-50 p-3 rounded-full">
              <AlertTriangle className="w-6 h-6" style={{ color: "#c72323" }} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl text-gray-900 mb-2 capitalize">
                Critical Performance Intervention Required
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                {atRiskStudents.length} students are currently below the 70%
                institutional proficiency threshold.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {atRiskStudents.map((student: any) => (
                  <div
                    key={student.id}
                    className="bg-gray-50 p-4 rounded-md border border-gray-100 flex justify-between items-center group hover:bg-white transition-all hover:border-red-200"
                  >
                    <div>
                      <p className="text-gray-900 text-sm capitalize">
                        {student.name}
                      </p>
                      <p className="text-[11px] text-gray-600 capitalize">
                        {student.courseName}
                      </p>
                    </div>
                    <span className="text-sm" style={{ color: "#c72323" }}>
                      {student.progress}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Middle Grid: Courses and Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* My Courses */}
        <div className="lg:col-span-5 bg-white rounded-md p-8 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-gray-50 p-2.5 rounded border border-gray-100">
              <BookOpen size={20} style={{ color: "#c72323" }} />
            </div>
            <div>
              <h2 className="text-xl text-gray-900 capitalize">
                Curriculum Overview
              </h2>
              <p className="text-gray-600 text-[11px] capitalize">
                Active Instructional Modules
              </p>
            </div>
          </div>

          <div className="space-y-4 flex-1">
            {courses.map((course: any) => {
              return (
                <div
                  key={course.id}
                  onClick={() => navigate(`/teacher/course/${course.id}`)}
                  className="p-6 border border-gray-100 rounded-md hover:border-red-200 hover:shadow-md cursor-pointer transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-gray-900 text-sm capitalize group-hover:text-[#c72323] transition-colors">
                      {course.title}
                    </h3>
                    <span className="text-[11px] text-gray-600 capitalize bg-gray-50 px-2 py-1 rounded">
                      {course.subject}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[11px] text-gray-600 capitalize">
                      Enrollment: {course.enrollmentCount}
                    </p>
                    <p
                      className="text-[11px] capitalize"
                      style={{ color: "#c72323" }}
                    >
                      {course.completion_avg}% AVG
                    </p>
                  </div>
                  <div className="w-full bg-gray-50 rounded-full h-1 overflow-hidden">
                    <div
                      className="h-full transition-all duration-1000"
                      style={{
                        width: `${course.completion_avg}%`,
                        backgroundColor: "#c72323",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Student Progress Overview Table */}
        <div className="lg:col-span-7 bg-white rounded-md p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="bg-gray-50 p-2.5 rounded border border-gray-100">
                <Activity size={20} style={{ color: "#c72323" }} />
              </div>
              <div>
                <h2 className="text-xl text-gray-900 capitalize">
                  Student Audit
                </h2>
                <p className="text-gray-600 text-[11px] capitalize">
                  Performance Synchronization
                </p>
              </div>
            </div>
            <Link
              to="/teacher/students"
              className="text-[12px] text-gray-600 capitalize hover:text-[#c72323] transition-colors flex items-center gap-1"
            >
              Full List <ChevronRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="pb-4 text-[11px] text-gray-600 capitalize">
                    Student
                  </th>
                  <th className="pb-4 text-[11px] text-gray-600 capitalize">
                    Objective
                  </th>
                  <th className="pb-4 text-center text-[11px] text-gray-600 capitalize">
                    Sync Level
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {studentAudit.map((student: any) => (
                  <tr
                    key={student.id}
                    onClick={() => navigate(`/teacher/student/${student.id}`)}
                    className="group cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4">
                      <p className="text-gray-900 text-sm capitalize group-hover:text-[#c72323] transition-colors">
                        {student.name}
                      </p>
                      <p className="text-[11px] text-gray-400 capitalize">
                        {student.class}
                      </p>
                    </td>
                    <td className="py-4">
                      <p className="text-[11px] text-gray-600 capitalize">
                        {student.courseName}
                      </p>
                    </td>
                    <td className="py-4 text-center">
                      <span
                        className="text-sm"
                        style={{
                          color: student.progress >= 70 ? "#008000" : "#c72323",
                        }}
                      >
                        {student.progress}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Live Quiz Modal */}
      {showLiveQuizModal && (
        <StartLiveQuizModal
          quizTitle="Live Quiz Demo"
          questionCount={10}
          onStart={handleStartLiveQuiz}
          onClose={() => setShowLiveQuizModal(false)}
        />
      )}
    </div>
  );
};

export default TeacherDashboard;
