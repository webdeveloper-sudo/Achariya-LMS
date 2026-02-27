import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Clock,
  PlayCircle,
  Loader2,
  Trophy,
  ShieldCheck,
  ChevronRight,
  Zap,
  GraduationCap,
} from "lucide-react";

import SimpleToast from "../../components/SimpleToast";
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
  const [showSimpleToast, setShowSimpleToast] = useState(false);
  const [simpleToastMessage, setSimpleToastMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const enrollment = student?.enrolledCourses?.find(
    (e: any) => e.courseId === courseId || e.courseId?._id === courseId,
  );
  const isEnrolled = !!enrollment;

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axiosInstance.get(`/courses/${courseId}`);
        setCourse(response.data.data);
      } catch (err: any) {
        console.error("Error fetching course:", err);
        setError("Course not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) fetchCourse();
  }, [courseId]);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await axiosInstance.get("/students/dashboard");
        if (response.data && response.data.profile) {
          useStudentStore.getState().updateStudent(response.data.profile);
        }
      } catch (err) {
        console.error("Failed to refresh student data:", err);
      }
    };
    fetchStudentData();
  }, []);

  const handleEnroll = async () => {
    if (!student) {
      navigate("/student/login");
      return;
    }

    setEnrollLoading(true);
    try {
      const response = await axiosInstance.post("/students/enroll", {
        admissionNo: student.admissionNo,
        courseId: course._id,
      });

      enrollInCourse(response.data.enrolledCourse);
      setShowEnrollSuccess(true);
      setSimpleToastMessage(
        "Enrollment Active: Complete assessments to progress!",
      );
      setShowSimpleToast(true);
      setTimeout(() => {
        setShowEnrollSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error("Enrollment failed:", err);
      alert(
        err.response?.data?.message || "Enrollment failed. Please try again.",
      );
    } finally {
      setEnrollLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Link
          to="/student/courses"
          className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Academy
        </Link>
        <div className="bg-red-50 border border-red-100 rounded-md p-6 text-center">
          <p className="text-red-700 text-sm font-medium">
            {error || "Requested course could not be located."}
          </p>
        </div>
      </div>
    );
  }

  const modules = course.modules || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section - Standardized Industrial Refinement */}
      <div className="bg-gray-50 border-b border-gray-100 pb-12 px-6 sm:px-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <Link
            to="/student/courses"
            className="inline-flex items-center text-gray-500 hover:text-blue-900 mb-5 transition-colors text-[12px] uppercase tracking-widest group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Academy Library
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
                Course <span className="text-gray-400">Curriculum</span>
              </h1>
              <p className="text-gray-500 text-sm font-medium max-w-2xl leading-relaxed">
                Detailed modular breakdown of academic objectives and
                performance protocols for this unit.
              </p>
            </div>

            {student && (
              <div className="hidden lg:flex items-center gap-4 bg-white p-4 px-6 rounded-md border border-gray-300 shadow-sm">
                <div className="bg-blue-50 p-2 rounded-md border border-blue-100">
                  <GraduationCap className="w-5 h-5 text-blue-900" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                    Student ID
                  </p>
                  <p className="text-xl font-bold text-gray-900 leading-none">
                    {student.admissionNo}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-12">
        {/* Enrollment Feedback Modal Refined */}
        {showEnrollSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-500 p-6">
            <div className="bg-white rounded-md shadow-2xl p-10 text-center max-w-lg w-full border border-gray-300 relative overflow-hidden">
              <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-md flex items-center justify-center mx-auto mb-6 border border-blue-100 shadow-sm">
                <ShieldCheck size={32} />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight uppercase">
                Enrollment <span className="text-blue-900">Active</span>
              </h3>

              <p className="text-gray-500 text-sm leading-relaxed mb-8 font-medium">
                Access granted to{" "}
                <span className="text-gray-900 font-bold">
                  "{course.title}"
                </span>
                . Academic protocols are now engaged for this curriculum path.
              </p>

              <button
                onClick={() => setShowEnrollSuccess(false)}
                className="w-full bg-blue-900 text-white py-4 rounded-md font-bold uppercase tracking-widest text-[11px] hover:bg-blue-800 transition-all flex items-center justify-center gap-2"
              >
                Engage Curriculum
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Professional Course Banner Section */}
        <div className="border border-gray-300 rounded-md bg-white mb-12 overflow-hidden shadow-sm">
          <div className="md:flex min-h-[380px]">
            {/* Hero Thumbnail */}
            <div className="md:w-5/12 bg-gray-50 relative border-r border-gray-100">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200">
                  <BookOpen size={80} strokeWidth={1.5} />
                </div>
              )}
            </div>

            {/* Core Content Info */}
            <div className="relative p-8 md:p-12 md:w-7/12 flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-widest rounded border border-blue-100">
                  {course.subjectCode}
                </span>
                <span className="px-3 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold uppercase tracking-widest rounded border border-gray-100">
                  {course.level || "Standard Curriculum"}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                {course.title}
              </h1>

              <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-2xl">
                {course.description ||
                  "Comprehensive curriculum designed to facilitate systematic mastery through structured modules and outcomes-based assessments."}
              </p>

              <div className="mt-auto flex flex-col sm:flex-row items-center gap-6">
                {!isEnrolled ? (
                  <button
                    onClick={handleEnroll}
                    disabled={enrollLoading}
                    className="w-full sm:w-auto px-10 py-3 bg-blue-600 text-white rounded-md font-bold uppercase tracking-widest text-xs hover:bg-blue-700 transition-colors active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shadow-sm"
                  >
                    {enrollLoading ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                      <>
                        <Zap size={16} fill="white" />
                        Enroll in Course â€” Free
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-700 rounded-md border border-blue-100 shadow-sm animate-in fade-in duration-500">
                    <CheckCircle size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Enrollment Active
                    </span>
                  </div>
                )}

                {isEnrolled && (
                  <div className="flex-grow w-full max-w-xs">
                    <div className="flex justify-between items-center mb-1.5 px-0.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Your Progress
                      </span>
                      <span className="text-blue-600 font-bold text-xs uppercase">
                        {enrollment?.progress || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${enrollment?.progress || 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Curriculum Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-4 mb-10">
              <div className="bg-blue-900 text-white p-2.5 rounded-md shadow-[0_0_15px_rgba(30,58,138,0.2)]">
                <BookOpen size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Academic Modules
                </h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Structure: {modules.length} Core Units
                </p>
              </div>
            </div>

            {isEnrolled && (
              <div className="bg-gray-50 border border-gray-300 rounded-md p-6 mb-10 border-l-4 border-l-blue-900 animate-in fade-in slide-in-from-left-2 duration-500">
                <div className="flex items-start gap-4">
                  <Zap size={20} className="text-blue-900 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-900 font-bold text-xs uppercase tracking-widest mb-1">
                      Engage Protocol
                    </p>
                    <p className="text-gray-500 text-[13px] leading-relaxed">
                      Verification requires 100% proficiency across all
                      associated assessments to mark modular completion and
                      advance through the academic hierarchy.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {modules.length === 0 ? (
              <div className="bg-gray-50 border border-gray-300 rounded-md p-10 text-center">
                <p className="text-gray-400 text-sm font-medium italic">
                  Curriculum content is pending deployment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {modules.map((module: any, index: number) => {
                  const isCompleted = enrollment?.completedModules?.some(
                    (m: any) => (m.moduleId || m) === module._id,
                  );

                  return (
                    <div
                      key={module._id}
                      className={`group bg-white rounded-md border transition-all duration-300 overflow-hidden ${
                        isEnrolled
                          ? isCompleted
                            ? "border-emerald-200 bg-emerald-50/10 shadow-sm"
                            : "border-gray-300 hover:border-blue-900 hover:shadow-xl"
                          : "border-gray-100 opacity-60 bg-gray-50/50 grayscale pointer-events-none"
                      }`}
                    >
                      <div className="flex items-center p-6 gap-6">
                        <div
                          className={`w-12 h-12 rounded flex items-center justify-center flex-shrink-0 transition-all border ${
                            isCompleted
                              ? "bg-emerald-900 text-white border-emerald-800"
                              : isEnrolled
                                ? "bg-gray-900 text-white border-gray-800 group-hover:bg-blue-900 transition-colors"
                                : "bg-gray-100 text-gray-400 border-gray-200"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle size={22} />
                          ) : (
                            <span className="text-lg font-bold">
                              {index + 1}
                            </span>
                          )}
                        </div>

                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3
                                className={`text-xl font-bold transition-colors ${isCompleted ? "text-emerald-900" : "text-gray-900"} ${isEnrolled && "group-hover:text-blue-900"}`}
                              >
                                {module.title}
                              </h3>
                              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1.5">
                                <span className="flex items-center gap-2">
                                  <Clock size={12} className="text-blue-900" />
                                  {module.duration || "15 mins"}
                                </span>
                                <span className="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
                                <span className="text-blue-900 italic">
                                  {module.type || "ACADEMIC UNIT"}
                                </span>
                              </div>
                            </div>

                            {isEnrolled && isCompleted && (
                              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-900 px-3 py-1.5 rounded-md border border-emerald-200 shadow-sm">
                                <ShieldCheck size={12} />
                                <span className="text-[9px] font-bold uppercase tracking-widest">
                                  Mastery Verified
                                </span>
                              </div>
                            )}
                          </div>

                          {isEnrolled && (
                            <div className="flex items-center gap-6">
                              <button
                                onClick={() =>
                                  navigate(
                                    `/student/courses/${courseId}/${module._id}`,
                                  )
                                }
                                className={`px-8 py-2.5 rounded text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-3 border ${
                                  isCompleted
                                    ? "bg-white text-gray-900 border-gray-300 hover:bg-gray-100"
                                    : "bg-blue-900 text-white border-blue-900 hover:bg-blue-800 shadow-md active:scale-95"
                                }`}
                              >
                                {isCompleted ? (
                                  <BookOpen size={14} />
                                ) : (
                                  <PlayCircle size={14} />
                                )}
                                {isCompleted
                                  ? "Review Material"
                                  : "Initialize Module"}
                              </button>
                              <div className="flex items-center gap-2 text-gray-300 group-hover:text-blue-900 transition-colors">
                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                  Protocol engaged
                                </span>
                                <ChevronRight
                                  size={18}
                                  className="group-hover:translate-x-1 transition-all"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Activity indicator at bottom */}
                      <div className="h-1 w-full bg-gray-50 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ${isCompleted ? "bg-emerald-500" : "bg-blue-900"}`}
                          style={{ width: isCompleted ? "100%" : "15%" }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar Features */}
          <div className="space-y-6">
            <div className="bg-white rounded-md border border-gray-300 p-8 shadow-sm">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-8 border-b border-gray-100 pb-4 flex items-center gap-3">
                <Zap size={16} className="text-blue-900" />
                Academic Values
              </h3>
              <ul className="space-y-8">
                {[
                  {
                    icon: Clock,
                    label: "Strategic Pacing",
                    desc: "Synchronized self-directed schedule",
                  },
                  {
                    icon: BookOpen,
                    label: "Practical Mastery",
                    desc: `${modules.length} Intensive curricular units`,
                  },
                  {
                    icon: Trophy,
                    label: "Verified Credentials",
                    desc: "Institutional standard validation",
                  },
                ].map((feat, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="bg-blue-50 text-blue-900 p-2.5 rounded-md border border-blue-100 shadow-sm">
                      <feat.icon size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-900 uppercase tracking-widest">
                        {feat.label}
                      </p>
                      <p className="text-[12px] font-medium text-gray-500 mt-1.5 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate("/student/social")}
                className="mt-12 w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-md font-bold text-[10px] uppercase tracking-[0.2em] transition-all border border-gray-200 flex items-center justify-center gap-3 italic"
              >
                Curricular Discussion
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>

        {student && (
          <StudentChatbot
            studentId={student.admissionNo}
            studentName={student.name}
          />
        )}

        <SimpleToast
          isVisible={showSimpleToast}
          message={simpleToastMessage}
          onClose={() => setShowSimpleToast(false)}
        />
      </div>
    </div>
  );
};

export default StudentCourseDetail;
