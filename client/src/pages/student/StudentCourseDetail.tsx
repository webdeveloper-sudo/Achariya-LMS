import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Clock,
  PlayCircle,
  Loader2,
} from "lucide-react";
import StudentChatbot from "../../components/StudentChatbot";
import axiosInstance from "../../api/axiosInstance";
import { useStudentStore } from "../../store/useStudentStore";

const StudentCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { student, enrollInCourse } = useStudentStore();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [showEnrollSuccess, setShowEnrollSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enrollment = student?.enrolledCourses?.find(
    (e: any) => e.courseId === courseId || e.courseId?._id === courseId
  ); // Simplify check
  const isEnrolled = !!enrollment;

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axiosInstance.get(`/courses/${courseId}`);
        console.log("Fetched Course Data:", response.data);
        setCourse(response.data.data); // Controller returns { success: true, data: course }
      } catch (err: any) {
        console.error("Error fetching course:", err);
        setError("Course not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) fetchCourse();
  }, [courseId]);

  const handleEnroll = async () => {
    if (!student) {
      navigate("/student/login");
      return;
    }

    setEnrollLoading(true);
    try {
      const response = await axiosInstance.post("/students/enroll", {
        admissionNo: student.admissionNo,
        courseId: course._id, // Use _id for the API
      });

      // Update store
      enrollInCourse(response.data.enrolledCourse);

      setShowEnrollSuccess(true);
      setTimeout(() => {
        setShowEnrollSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error("Enrollment failed:", err);
      alert(
        err.response?.data?.message || "Enrollment failed. Please try again."
      );
    } finally {
      setEnrollLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-6">
        <Link
          to="/student/courses"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700">{error || "Course not found."}</p>
        </div>
      </div>
    );
  }

  const modules = course.modules || [];

  return (
    <div className="p-6 max-w-7xl mx-auto relative">
      {/* Success Popup */}
      {showEnrollSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm mx-4 transform transition-all scale-100">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Course Availed for You!
            </h3>
            <p className="text-gray-600 mb-6">
              You have successfully enrolled in <strong>{course.title}</strong>.
            </p>
            <button
              onClick={() => setShowEnrollSuccess(false)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Start Learning
            </button>
          </div>
        </div>
      )}

      <Link
        to="/student/courses"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to My Courses
      </Link>

      {/* Course Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="md:flex">
          <div className="md:w-1/3 h-64 md:h-auto relative">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                <BookOpen size={64} />
              </div>
            )}
          </div>
          <div className="p-8 md:w-2/3 flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide rounded-full">
                {course.subjectCode}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wide rounded-full">
                {course.level || "General"}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {course.title}
            </h1>
            <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3 md:line-clamp-none">
              {course.description || "No description provided."}
            </p>

            <div className="mt-auto flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {!isEnrolled ? (
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <button
                    onClick={handleEnroll}
                    disabled={enrollLoading}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 active:transform active:scale-95 disabled:bg-blue-400 flex items-center justify-center gap-2"
                  >
                    {enrollLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Enroll Now"
                    )}
                    {!enrollLoading && (
                      <span className="ml-1 text-blue-100 font-normal opacity-80">
                        Free
                      </span>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-100">
                  <CheckCircle size={20} />
                  <span className="font-semibold">Enrolled</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Modules List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="text-blue-600" />
              Course Modules
            </h2>
            <span className="text-sm font-medium text-gray-500">
              {modules.length} Modules
            </span>
          </div>

          {modules.length === 0 ? (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-500">
              No modules available yet.
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((module: any, index: number) => {
                const isCompleted = enrollment?.completedModules?.includes(
                  module._id
                );
                // const isLocked = !isEnrolled && index > 0; // Unused

                return (
                  <div
                    key={module._id}
                    className={`bg-white rounded-xl border p-5 transition-all ${
                      isEnrolled
                        ? "border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200"
                        : "border-gray-200 opacity-75"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCompleted
                            ? "bg-green-100 text-green-600"
                            : "bg-blue-50 text-blue-600 download-icon"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle size={20} />
                        ) : (
                          <span className="font-bold">{index + 1}</span>
                        )}
                      </div>

                      <div className="flex-grow">
                        <h3 className="font-bold text-gray-900 mb-1">
                          {module.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Clock size={14} /> {module.duration || "15 mins"}
                          </span>
                          <span>•</span>
                          <span>{module.type || "Lesson"}</span>
                        </div>

                        {isEnrolled && (
                          <div className="flex gap-3">
                            <button
                              onClick={() =>
                                navigate(
                                  `/student/courses/${courseId}/${module._id}`
                                )
                              }
                              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                            >
                              <PlayCircle size={16} />
                              Start Learning
                            </button>
                          </div>
                        )}
                        {!isEnrolled && (
                          <p className="text-sm text-gray-400 italic mt-2">
                            Enroll to access content
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Course Features</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Clock size={16} />
                </div>
                <span>Self-paced learning</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                  <BookOpen size={16} />
                </div>
                <span>{modules.length} Detailed Modules</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                  <CheckCircle size={16} />
                </div>
                <span>Certificate of Completion</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {student && (
        <StudentChatbot
          studentId={student.admissionNo}
          studentName={student.name}
        />
      )}
    </div>
  );
};

export default StudentCourseDetail;
