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
        // Controller returns { courses: [...], count: ... }
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

  // Helper to check progress/status
  const getEnrollmentStatus = (courseId: string) => {
    if (!student || !student.enrolledCourses) return null;
    // Check by _id first (courseId in enrolled is ref)
    const enrolled = student.enrolledCourses.find(
      (e) => e.courseId === courseId
    );
    return enrolled; // returns object or undefined
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col">
        <p className="text-red-500 mb-4">{error}</p>
        <Link to="/student/dashboard" className="text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Link
        to="/student/dashboard"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Explore Courses</h1>
        <p className="text-gray-600 mt-2">
          Discover new skills and advance your career
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const enrollment = getEnrollmentStatus(course._id); // Use _id as enrolledCourses usually stores ObjId ref
          const isEnrolled = !!enrollment;

          return (
            <Link
              key={course._id}
              to={`/student/course/${course._id}`}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all duration-300 overflow-hidden flex flex-col h-full"
            >
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                    <BookOpen size={48} />
                  </div>
                )}
                {isEnrolled && (
                  <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                    <CheckCircle size={12} />
                    ENROLLED
                  </div>
                )}
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-md uppercase tracking-wider">
                    {course.subjectCode || "Course"}
                  </span>
                  {course.gradesEligible?.length > 0 && (
                    <span className="text-xs text-gray-500 font-medium">
                      Grades: {course.gradesEligible.join(", ")}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>

                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
                  {course.description || "No description available."}
                </p>

                {isEnrolled && enrollment ? (
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-xs font-medium text-gray-500 mb-1.5">
                      <span>Progress</span>
                      <span className="text-blue-600">
                        {enrollment.progress || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${enrollment.progress || 0}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-auto pt-4 border-t border-gray-100 text-sm font-medium text-blue-600 group-hover:text-blue-700 flex items-center justify-end">
                    View Details{" "}
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </div>
            </Link>
          );
        })}

        {courses.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No courses available yet.</p>
            <p className="text-sm">Check back soon for new content!</p>
          </div>
        )}
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
