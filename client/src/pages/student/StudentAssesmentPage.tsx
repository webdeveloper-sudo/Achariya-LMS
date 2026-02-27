import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Trophy,
  Target,
  Zap,
  ChevronRight,
  BookOpen,
  PlayCircle,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import QuizModal from "../../components/QuizModal";
import QuizReview from "../../components/QuizReview";
import RetakePrompt from "../../components/RetakePrompt";
import AchievementSharePopup from "../../components/AchievementSharePopup";
import SocialShareToast from "../../components/SocialShareToast";
import SimpleToast from "../../components/SimpleToast";
import { useStudentStore } from "../../store/useStudentStore";

const StudentAssesmentPage = () => {
  const { courseId, moduleId } = useParams();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [module, setModule] = useState<any>(null);
  const [assessments, setAssessments] = useState<any[]>([]);

  // Progress State
  const [studentProgress, setStudentProgress] = useState<any[]>([]);
  const [enrolledCourse, setEnrolledCourse] = useState<any>(null);

  // Social Share State
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [showSimpleToast, setShowSimpleToast] = useState(false);
  const [simpleToastMessage, setSimpleToastMessage] = useState("");
  const [shareAchievementData, setShareAchievementData] = useState({
    title: "",
    type: "",
  });

  // Quiz State
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [showReview, setShowReview] = useState(false);
  const [showRetakePrompt, setShowRetakePrompt] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [currentAttemptNum, setCurrentAttemptNum] = useState(1);

  // Social Share Handler
  const handleSocialShare = async () => {
    try {
      await axiosInstance.post(
        "/social/share-achievement",
        shareAchievementData,
      );
      setShowSharePopup(false);
      setShowShareToast(true);
    } catch (err) {
      console.error("Failed to share achievement:", err);
    }
  };

  // Fetch Student Progress
  const fetchStudentProgress = async () => {
    try {
      const dashboardRes = await axiosInstance.get("/students/dashboard");
      if (dashboardRes.data && dashboardRes.data.profile) {
        useStudentStore.getState().updateStudent(dashboardRes.data.profile);

        const enrolledCourses = dashboardRes.data.profile.enrolledCourses || [];
        const foundCourse = enrolledCourses.find(
          (c: any) => c.courseId === courseId || c.courseId._id === courseId,
        );

        if (foundCourse) {
          setEnrolledCourse(foundCourse);
          setStudentProgress(foundCourse.assessmentProgress || []);
        }
      }
    } catch (progErr) {
      console.warn("Failed to load student progress:", progErr);
    }
  };

  // Fetch Logic
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const moduleRes = await axiosInstance.get(
          `/courses/${courseId}/modules/${moduleId}`,
        );
        if (moduleRes.data.success) {
          setModule(moduleRes.data.data);
          setAssessments(moduleRes.data.data.assessments || []);
        } else {
          setError("Failed to load module.");
        }

        await fetchStudentProgress();
      } catch (err: any) {
        console.error("Error loading assessment data:", err);
        setError(err.response?.data?.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId && moduleId) {
      fetchData();
    }
  }, [courseId, moduleId]);

  // Check for Course Completion Popup on Mount
  useEffect(() => {
    if (enrolledCourse && enrolledCourse.progress === 100) {
      // Check if session storage indicates we already showed it this session to avoid annoyance
      const sharedSession = sessionStorage.getItem(`shared_${courseId}`);
      if (!sharedSession) {
        setShareAchievementData({
          title: `Scholar of Excellence: Completed ${enrolledCourse.title || "Academic Program"}`,
          type: "Course Completion",
        });
        setShowSharePopup(true);
        // We don't mark as shared in storage here yet, only if they share or close?
        // Let's mark it as 'prompted' so it doesn't pop every refresh.
        sessionStorage.setItem(`shared_${courseId}`, "prompted");
      }
    }
  }, [enrolledCourse, courseId]);

  const getAssessmentProgress = (assessmentId: string) => {
    return (
      studentProgress.find((p: any) => p.assessmentId === assessmentId) || {
        attempts: 0,
        highestScore: 0,
        history: [],
        isCompleted: false,
      }
    );
  };

  const nextIncompleteAssessmentId = assessments.find((a) => {
    const prog = getAssessmentProgress(a?._id);
    return !prog.isCompleted;
  })?._id;

  const handleStartQuiz = async (assessmentId: string) => {
    try {
      const { student } = useStudentStore.getState();
      const studentId = (student as any)?.id || (student as any)?._id;

      if (!studentId) {
        setError("User session expired. Please log in.");
        return;
      }

      const res = await axiosInstance.get(
        `/students/${studentId}/assessment/${assessmentId}`,
      );

      if (res.data.success) {
        const backendAssessment = res.data.data;
        const progress = res.data.data.attemptsUsed || 0;
        setCurrentAttemptNum(progress + 1);

        const formattedQuiz = {
          id: backendAssessment._id,
          title: backendAssessment.title,
          timeLimit: backendAssessment.duration || 1800,
          maxAttempts: backendAssessment.attempts || 3,
          questions: backendAssessment.questions.map(
            (q: any, index: number) => {
              let finalCorrectAnswer = q.answer;
              if (
                ["multiple-choice", "diagram-mcq", "table-mcq"].includes(
                  q.questionType,
                )
              ) {
                if (q.options?.length > 0) {
                  if (/^[A-D]$/i.test(q.answer)) {
                    const map: any = { A: 0, B: 1, C: 2, D: 3 };
                    finalCorrectAnswer = map[q.answer.toUpperCase()] ?? 0;
                  } else {
                    const idx = q.options.findIndex(
                      (opt: string) => opt === q.answer,
                    );
                    if (idx !== -1) finalCorrectAnswer = idx;
                    else
                      finalCorrectAnswer =
                        typeof q.answer === "number" ? q.answer : 0;
                  }
                }
              }
              return {
                id: index,
                question: q.questionText,
                options: q.options || [],
                correctAnswer: finalCorrectAnswer,
                explanation:
                  q.explanation || "Detailed analysis not available.",
                type: q.questionType,
                pairs: q.pairs || [],
                tableRows: q.tableRows || [],
                image: q.image || q.images?.[0],
                images: q.images || [],
                difficulty: q.difficulty || "Standard",
              };
            },
          ),
        };

        setActiveQuiz(formattedQuiz);
        setUserAnswers([]);
      }
    } catch (err: any) {
      alert(
        err.response?.data?.message || "Assessment could not be initiated.",
      );
    }
  };

  const handleQuizComplete = async (
    score: number,
    timeUsed: number,
    completedAnswers: (number | null)[],
  ) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const studentId = user.id || user._id;

      const res = await axiosInstance.post(
        `/students/${studentId}/assessment/${activeQuiz.id}/submit`,
        {
          moduleId,
          courseId,
          score: score,
          totalMarks: activeQuiz.questions.length,
        },
      );

      if (res.data.success) {
        const {
          passed,
          creditsAwarded,
          attempts,
          moduleCompleted,
          courseProgress,
        } = res.data;

        setQuizResults({
          attempts: attempts,
          currentScore: score,
          timeUsed,
          creditsEarned: creditsAwarded,
          totalQuestions: activeQuiz.questions.length,
          bestScore: Math.max(
            score,
            getAssessmentProgress(activeQuiz.id).highestScore,
          ),
        });

        // Strategic Achievement Sharing: Course Completion (100%)
        if (courseProgress === 100) {
          setShowCelebration(true);
          setShareAchievementData({
            title: `Scholar of Excellence: Completed ${enrolledCourse?.title || "Academic Program"}`,
            type: "Course Completion",
          });
          setShowSharePopup(true);
        } else if (moduleCompleted) {
          setShowCelebration(true);
          setSimpleToastMessage("Module Mastery: Documentation Updated");
          setShowSimpleToast(true);
        } else if (passed) {
          setSimpleToastMessage("Academic Standard Achieved");
          setShowSimpleToast(true);
        }

        await fetchStudentProgress();

        if (passed || attempts >= activeQuiz.maxAttempts) {
          setShowReview(true);
        } else {
          setShowRetakePrompt(true);
        }
      }
    } catch (err: any) {
      if (err.response?.data?.isThirdAttemptFailed) {
        alert("Submission Finalized: " + err.response.data.message);
      } else {
        console.error("Submission error:", err);
        alert(
          "Submission failed: " + (err.response?.data?.message || err.message),
        );
      }
    }
    setUserAnswers(completedAnswers);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-6">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
          Syncing Academic Progress...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-white p-6 sm:p-10 flex flex-col items-center justify-center text-center">
        <div className="max-w-md">
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-red-600 w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Evaluation Restricted
          </h2>
          <p className="text-gray-500 text-sm mb-10 leading-relaxed font-medium">
            {error ||
              "An unexpected error occurred during the assessment data fetch sequence."}
          </p>
          <Link
            to={`/student/course/${courseId}`}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-md font-bold uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-colors shadow-sm"
          >
            <ArrowLeft size={14} /> Back to Academy
          </Link>
        </div>
      </div>
    );

  const validAssessments = assessments.filter((a) => a);
  const completedAssessmentsCount = validAssessments.filter(
    (a) => getAssessmentProgress(a._id).isCompleted,
  ).length;
  const moduleProgressPercent =
    validAssessments.length > 0
      ? (completedAssessmentsCount / validAssessments.length) * 100
      : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section - Standardized Industrial Refinement */}
      <div className="bg-gray-50 border-b border-gray-100 pb-12 px-6 sm:px-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <Link
            to={`/student/course/${courseId}`}
            className="inline-flex items-center text-gray-500 hover:text-blue-900 mb-5 transition-colors text-[12px] uppercase tracking-widest group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Course Curriculum
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
                Evaluation <span className="text-gray-400">Phase</span>
              </h1>
              <p className="text-gray-500 text-sm font-medium max-w-2xl leading-relaxed">
                Demonstrate systematic mastery through structured assessments
                and performance verification protocols.
              </p>
            </div>

            {module && (
              <div className="hidden lg:flex items-center gap-4 bg-white p-4 px-6 rounded-md border border-gray-300 shadow-sm">
                <div className="bg-blue-50 p-2 rounded-md border border-blue-100">
                  <Target className="w-5 h-5 text-blue-900" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                    Active Module
                  </p>
                  <p className="text-xl font-bold text-gray-900 leading-none">
                    {module.title.slice(0, 20)}...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-12">
        {/* Assessment Header Component - Refined */}
        <div className="relative border border-gray-300 rounded-md bg-white p-10 sm:p-12 mb-12 shadow-sm overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-blue-900 text-white rounded shadow-sm">
                  <Zap size={14} />
                </div>
                <span className="text-blue-900 font-bold tracking-[0.2em] text-[10px] uppercase">
                  Institutional Protocol
                </span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                {module?.title}{" "}
                <span className="text-gray-400">Assessment Unit</span>
              </h2>
              <p className="text-gray-500 text-[14px] max-w-2xl leading-relaxed font-medium">
                Strategic verification of unit objectives. A{" "}
                <span className="text-gray-900 font-bold text-[15px]">
                  100% proficiency score
                </span>{" "}
                is required on all evaluation segments to finalize this module
                and unlock advanced curricular paths.
              </p>
            </div>

            <div className="flex items-center gap-8 bg-gray-50 p-8 rounded-md border border-gray-100 shadow-inner">
              <div className="text-center sm:text-left">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  Unit Progress
                </p>
                <div className="flex items-baseline gap-1">
                  <p className="text-4xl font-bold text-gray-900 tracking-tighter">
                    {Math.round(moduleProgressPercent)}
                  </p>
                  <span className="text-[12px] font-bold text-gray-400">%</span>
                </div>
              </div>
              <div className="w-px h-12 bg-gray-200"></div>
              <div className="text-center sm:text-left">
                <p className="text-[9px] font-bold text-blue-900 uppercase tracking-widest mb-1.5">
                  Registry Sync
                </p>
                <div className="flex items-baseline gap-1">
                  <p className="text-4xl font-bold text-gray-900 tracking-tighter">
                    {enrolledCourse?.progress || 0}
                  </p>
                  <span className="text-[12px] font-bold text-blue-900">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {assessments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-md border border-gray-300 shadow-sm text-center">
            <BookOpen className="w-12 h-12 text-gray-200 mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Evaluations Listed
            </h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto font-medium">
              Assessment structures for this unit are currently being finalized
              by the academic department.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {assessments.map((assessment: any, idx: number) => {
              const progress = getAssessmentProgress(assessment._id);
              const maxAttempts = assessment.attempts || 3;
              const canAttempt = progress.attempts < maxAttempts;
              const isCompleted = progress.isCompleted;
              const isNextUp = assessment._id === nextIncompleteAssessmentId;

              return (
                <div
                  key={assessment._id || idx}
                  className={`group relative bg-white rounded-md border p-8 transition-all duration-300 ${
                    isNextUp && !isCompleted
                      ? "border-blue-900 shadow-xl ring-1 ring-blue-50/50"
                      : "border-gray-300 hover:border-blue-400 shadow-sm"
                  }`}
                >
                  {isNextUp && !isCompleted && (
                    <span className="absolute top-4 right-4 bg-blue-900 text-white text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded shadow-md border border-blue-800 animate-pulse">
                      Next Protocol
                    </span>
                  )}

                  <div className="flex items-start gap-6 mb-10">
                    <div
                      className={`w-14 h-14 rounded-md flex items-center justify-center flex-shrink-0 transition-all border shadow-sm ${
                        isCompleted
                          ? "bg-emerald-900 text-white border-emerald-800"
                          : "bg-gray-900 text-white border-gray-800"
                      }`}
                    >
                      {isCompleted ? <Trophy size={24} /> : <Zap size={24} />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-900 transition-colors tracking-tight">
                        {assessment.title}
                      </h3>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] leading-none">
                        {assessment.description || "Curriculum Evaluation Unit"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 mb-10">
                    <div className="bg-gray-50 px-4 py-3 rounded-md border border-gray-100 flex flex-col items-center">
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                        Attempts
                      </span>
                      <span
                        className={`text-[13px] font-bold ${progress.attempts >= maxAttempts && !isCompleted ? "text-red-600" : "text-gray-900"}`}
                      >
                        {progress.attempts} / {maxAttempts}
                      </span>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 rounded-md border border-gray-100 flex flex-col items-center">
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                        Status
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest ${isCompleted ? "text-emerald-600" : "text-gray-400"}`}
                      >
                        {isCompleted ? "Verified" : "Pending"}
                      </span>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 rounded-md border border-gray-100 flex flex-col items-center">
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                        Mastery
                      </span>
                      <span className="text-[13px] font-bold text-blue-900">
                        {progress.highestScore || 0}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleStartQuiz(assessment._id)}
                      disabled={!canAttempt && !isCompleted}
                      className={`flex-grow py-3.5 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 border ${
                        canAttempt
                          ? isNextUp
                            ? "bg-blue-900 text-white border-blue-900 hover:bg-blue-800 shadow-md"
                            : "bg-white text-gray-900 border-gray-300 hover:bg-gray-100"
                          : isCompleted
                            ? "bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50"
                            : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <BookOpen size={14} /> REVIEW DATA
                        </>
                      ) : progress.attempts > 0 ? (
                        <>
                          <PlayCircle size={14} /> RESUME UNIT
                        </>
                      ) : (
                        <>
                          <Zap size={14} /> INITIATE EVAL
                        </>
                      )}
                    </button>
                    {!isCompleted && canAttempt && (
                      <div className="p-3.5 rounded-md border border-gray-100 bg-gray-50 text-gray-400 group-hover:text-blue-900 transition-colors">
                        <ChevronRight
                          size={18}
                          className="group-hover:translate-x-0.5 transition-transform"
                        />
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-0 inset-x-0 h-1 bg-gray-50 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${isCompleted ? "bg-emerald-500" : "bg-blue-900"}`}
                      style={{
                        width: `${isCompleted ? 100 : (progress.attempts / maxAttempts) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Module/Course Completion Summary Modal */}
        {showCelebration && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-500">
            <div className="bg-white rounded-[2rem] p-12 max-w-lg w-full text-center shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-gray-100 animate-in zoom-in-95 duration-700 relative overflow-hidden">
              {/* Background Decoration */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500"></div>
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-50 rounded-full blur-3xl opacity-50"></div>

              <div className="relative z-10">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-100 shadow-sm transform -rotate-6">
                  <Trophy size={48} className="drop-shadow-sm" />
                </div>

                <p className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4 font-mono">
                  {enrolledCourse?.progress === 100
                    ? "Elite Achievement Unlocked"
                    : "Curriculum Milestone"}
                </p>

                <h2 className="text-3xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
                  {enrolledCourse?.progress === 100
                    ? "Academic Graduation"
                    : "Module Mastery attained"}
                </h2>

                <p className="text-gray-500 text-base mb-12 leading-relaxed font-medium px-4">
                  {enrolledCourse?.progress === 100
                    ? `Incredible dedication! You have successfully completed the entire ${enrolledCourse?.title || "curriculum"}. Your academic record has been updated with highest honors.`
                    : "Your performance across all unit evaluations has met the institutional mastery standard. This module is now officially marked as completed."}
                </p>

                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => setShowCelebration(false)}
                    className="w-full py-5 bg-gray-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:bg-blue-600 transition-all hover:scale-[1.02] shadow-xl active:scale-[0.98]"
                  >
                    Return to Overview
                  </button>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-50 flex items-center justify-center gap-6">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Credits
                    </span>
                    <span className="text-sm font-black text-blue-600">
                      +50.0
                    </span>
                  </div>
                  <div className="w-px h-6 bg-gray-100"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Status
                    </span>
                    <span className="text-sm font-black text-emerald-600">
                      LEGENDARY
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeQuiz && !showReview && (
          <QuizModal
            quiz={activeQuiz}
            currentAttempt={currentAttemptNum}
            onClose={() => setActiveQuiz(null)}
            onComplete={handleQuizComplete}
          />
        )}

        {showReview && quizResults && (
          <QuizReview
            quiz={activeQuiz}
            userAnswers={userAnswers}
            score={quizResults.currentScore}
            timeUsed={quizResults.timeUsed}
            attemptNumber={quizResults.attempts}
            onContinue={() => {
              setShowReview(false);
              setQuizResults(null);
              setActiveQuiz(null);
            }}
          />
        )}

        {showRetakePrompt && quizResults && (
          <RetakePrompt
            score={quizResults.currentScore}
            totalQuestions={quizResults.totalQuestions}
            attemptsRemaining={activeQuiz.maxAttempts - quizResults.attempts}
            bestScore={quizResults.bestScore}
            onReview={() => {
              setShowRetakePrompt(false);
              setShowReview(true);
            }}
            onRetake={() => {
              setShowRetakePrompt(false);
              handleStartQuiz(activeQuiz.id);
              setUserAnswers([]);
            }}
            onReturn={() => {
              setShowRetakePrompt(false);
              setQuizResults(null);
              setActiveQuiz(null);
            }}
          />
        )}

        {/* Social Feed Interaction Layer */}
        <AchievementSharePopup
          isOpen={showSharePopup}
          onClose={() => setShowSharePopup(false)}
          onShare={handleSocialShare}
          achievementTitle={shareAchievementData.title}
        />

        <SocialShareToast
          isVisible={showShareToast}
          message="Achievement posted to feed!"
          onClose={() => setShowShareToast(false)}
        />

        <SimpleToast
          isVisible={showSimpleToast}
          message={simpleToastMessage}
          onClose={() => setShowSimpleToast(false)}
        />
      </div>
    </div>
  );
};

export default StudentAssesmentPage;
