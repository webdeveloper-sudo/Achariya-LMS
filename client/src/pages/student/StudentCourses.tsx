import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  BookOpen,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import StudentChatbot from "../../components/StudentChatbot";
import axiosInstance from "../../api/axiosInstance";

import { useStudentStore } from "../../store/useStudentStore";

interface Course {
  _id: string; // MongoDB ID
  courseId: string; // Custom ID
  title: string;
  subjectCode: string;
  description: string;
  thumbnail: string;
  level: string; // gradesEligible?
  gradesEligible: string[];
  eligibleSchools: any[];
  // Enrollment data added by backend
  isEnrolled?: boolean;
  progress?: number;
  enrolledAt?: string;
}

const StudentCourses = () => {
  const { student } = useStudentStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosInstance.get("/courses");
        setCourses(response.data.courses || []);
      } catch (err: any) {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const getEnrollmentStatus = (course: Course) => {
    // Rely on backend data if present, otherwise fallback to store
    if (course.isEnrolled !== undefined) {
      return course.isEnrolled ? { progress: course.progress || 0 } : null;
    }

    if (!student || !student.enrolledCourses) return null;
    return student.enrolledCourses.find((e) => e.courseId === course._id);
  };

  if (loading) {
    return (
      <div className="min-h-screen   flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-gray-500 font-semibold italic text-sm">
          Loading course library...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col p-6">
        <p className="text-red-600 mb-4 bg-red-50 px-6 py-2 rounded-md text-sm font-medium">
          {error}
        </p>
        <Link
          to="/student/dashboard"
          className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Header Section - Standardized Industrial Refinement */}
      <div className=" border-b border-gray-100 pb-12 px-6 sm:px-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <Link
            to="/student/dashboard"
            className="inline-flex items-center text-gray-500 hover:text-blue-900 mb-5 transition-colors text-[12px] uppercase tracking-widest group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Dashboard
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
                Academic <span className="text-gray-400">Library</span>
              </h1>
              <p className="text-gray-500 text-sm font-medium max-w-2xl leading-relaxed">
                Strategic recognition of academic excellence and continuous
                engagement across the specialized institutional curriculum.
              </p>
            </div>

            <div className="hidden lg:flex items-center gap-4 bg-white p-4 px-6 rounded-md border border-gray-300 shadow-sm">
              <div className="bg-blue-50 p-2 rounded-md border border-blue-100">
                <BookOpen className="w-5 h-5 text-blue-900" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                  Total Units
                </p>
                <p className="text-xl font-bold text-gray-900 leading-none">
                  {courses.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
          {courses.map((course) => {
            const enrollment = getEnrollmentStatus(course);
            const isEnrolled = !!enrollment;

            return (
              <Link
                key={course._id}
                to={`/student/course/${course._id}`}
                className="group bg-white rounded-md border border-gray-300 overflow-hidden flex flex-col h-full hover:border-blue-400 hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-[16/9] bg-gray-50 relative overflow-hidden border-b border-gray-100">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                      <BookOpen size={48} className="opacity-20" />
                    </div>
                  )}

                  {/* Status Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm text-blue-900 text-[10px] font-bold rounded shadow-sm border border-gray-100 uppercase tracking-widest">
                      {course.subjectCode || "CORE"}
                    </span>
                  </div>

                  {isEnrolled && (
                    <div className="absolute bottom-3 right-3 bg-blue-900 text-white text-[10px] font-bold px-3 py-1.5 rounded shadow-lg flex items-center gap-1.5 border border-blue-800">
                      <CheckCircle size={12} />
                      ENROLLED
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-900 transition-colors tracking-tight">
                    {course.title}
                  </h3>

                  <p className="text-gray-500 text-[13px] leading-relaxed line-clamp-2 mb-6 font-normal">
                    {course.description ||
                      "Comprehensive learning path with structured modules and professional assessments."}
                  </p>

                  <div className="mt-auto">
                    {isEnrolled && enrollment ? (
                      <div className="space-y-3 pt-4 border-t border-gray-50">
                        <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                          <span className="text-gray-400">Sync status</span>
                          <span className="text-blue-900">
                            {enrollment.progress || 0}%
                          </span>
                        </div>
                        <div className="w-full h-3 bg-gray-300 rounded-full h-1.5 overflow-hidden border border-gray-100">
                          <div
                            className="bg-blue-900 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(30,58,138,0.2)]"
                            style={{ width: `${enrollment.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          AVAILABLE
                        </span>
                        <div className="flex items-center text-blue-900 font-bold text-[11px] uppercase tracking-widest group-hover:text-blue-700 transition-colors">
                          View details{" "}
                          <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}

          {courses.length === 0 && !loading && (
            <div className="col-span-full py-24 text-center bg-gray-50 rounded-md border border-gray-300 border-dashed">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">
                Curriculum processing in progress
              </h3>
              <p className="text-gray-400 text-sm max-w-sm mx-auto font-medium">
                The institutional course library is being synchronized. Please
                check back for updated learning modules.
              </p>
            </div>
          )}
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

export default StudentCourses;
