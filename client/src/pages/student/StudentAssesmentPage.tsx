import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, AlertCircle, Trophy } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import QuizModal from "../../components/QuizModal";
import QuizReview from "../../components/QuizReview";
import RetakePrompt from "../../components/RetakePrompt";
import ProgressBar from "../../components/ProgressBar";
import { useStudentStore } from "../../store/useStudentStore";

const StudentAssesmentPage = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [module, setModule] = useState<any>(null);
  const [assessments, setAssessments] = useState<any[]>([]);

  // Progress State
  const [studentProgress, setStudentProgress] = useState<any[]>([]); // Assessment Progress Array
  const [enrolledCourse, setEnrolledCourse] = useState<any>(null); // Full enrolled course object (for Course Progress)

  // Quiz State
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [showReview, setShowReview] = useState(false);
  const [showRetakePrompt, setShowRetakePrompt] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false); // Module Completion Celebration
  const [quizResults, setQuizResults] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [currentAttemptNum, setCurrentAttemptNum] = useState(1);

  // Fetch Student Progress
  const fetchStudentProgress = async () => {
    try {
      const dashboardRes = await axiosInstance.get("/students/dashboard");
      if (dashboardRes.data && dashboardRes.data.profile) {
        // Update Global Store to ensure sync
        useStudentStore.getState().updateStudent(dashboardRes.data.profile);

        const enrolledCourses = dashboardRes.data.profile.enrolledCourses || [];
        // Find the specific course
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
        // 1. Fetch Module Details
        const moduleRes = await axiosInstance.get(
          `/courses/${courseId}/modules/${moduleId}`,
        );
        if (moduleRes.data.success) {
          setModule(moduleRes.data.data);
          setAssessments(moduleRes.data.data.assessments || []);
        } else {
          setError("Failed to load module.");
        }

        // 2. Fetch Student Progress
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

  const getAssessmentProgress = (assessmentId: string) => {
    // Logic: Find progress for this specific assessment
    return (
      studentProgress.find((p: any) => p.assessmentId === assessmentId) || {
        attempts: 0,
        highestScore: 0,
        history: [],
        isCompleted: false,
      }
    );
  };

  // Smart Navigation: Find next incomplete assessment
  const nextIncompleteAssessmentId = assessments.find((a) => {
    const prog = getAssessmentProgress(a._id);
    return !prog.isCompleted;
  })?._id;

  const handleStartQuiz = async (assessmentId: string) => {
    try {
      const { student } = useStudentStore.getState();
      const studentId = student?.id || (student as any)?._id;

      if (!studentId) {
        setError("User not identified. Please log in again.");
        return;
      }

      const res = await axiosInstance.get(
        `/students/${studentId}/assessment/${assessmentId}`,
      );

      if (res.data.success) {
        const backendAssessment = res.data.data;
        const progress = res.data.data.attemptsUsed || 0;
        setCurrentAttemptNum(progress + 1);

        // Map to QuizModal format (Reuse existing mapping logic)
        const formattedQuiz = {
          id: backendAssessment._id,
          title: backendAssessment.title,
          timeLimit: backendAssessment.duration || 1800,
          maxAttempts: backendAssessment.attempts || 3,
          questions: backendAssessment.questions.map(
            (q: any, index: number) => {
              // ... (Existing mapping logic kept for brevity/correctness)
              // Simple mapping for now, trusting the backend structure we saw before.
              // We need the Full Mapping logic from previous file content to be safe.
              let finalCorrectAnswer = q.answer;
              // ... (Insert mapping logic here or assume backend sends clean data?)
              // Let's use the robust mapping from previous file.
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
                explanation: q.explanation || "No explanation available.",
                type: q.questionType,
                pairs: q.pairs || [],
                tableRows: q.tableRows || [],
                image: q.image || q.images?.[0],
                images: q.images || [],
                difficulty: q.difficulty || "Medium",
              };
            },
          ),
        };

        setActiveQuiz(formattedQuiz);
        setUserAnswers([]);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to start assessment.");
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
        const { passed, creditsAwarded, attempts, moduleCompleted } = res.data;

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

        // Trigger Celebration if Module Completed
        if (moduleCompleted) {
          setShowCelebration(true);
        }

        // Refresh Progress
        await fetchStudentProgress();

        if (passed || attempts >= activeQuiz.maxAttempts) {
          setShowReview(true);
        } else {
          setShowRetakePrompt(true);
        }
      }
    } catch (err: any) {
      // Handle 3rd Attempt Failure
      if (err.response?.data?.isThirdAttemptFailed) {
        alert("Submission Failed: " + err.response.data.message);
      } else {
        console.error("Submission error:", err);
        alert(
          "Error submitting quiz: " +
            (err.response?.data?.message || err.message),
        );
      }
    }
    setUserAnswers(completedAnswers);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  // Calculate Module Progress for Display
  const validAssessments = assessments.filter((a) => a);
  const completedAssessmentsCount = validAssessments.filter(
    (a) => getAssessmentProgress(a._id).isCompleted,
  ).length;
  const moduleProgressPercent =
    validAssessments.length > 0
      ? (completedAssessmentsCount / validAssessments.length) * 100
      : 0;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <Link
        to={`/student/course/${courseId}`}
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Course
      </Link>

      {/* Header with Course Progress */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {module?.title} - Assessments
            </h1>
            <p className="text-gray-500">
              Master the assessments to complete the module.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-500">Course Progress</p>
            <p className="text-2xl font-bold text-blue-600">
              {enrolledCourse?.progress || 0}%
            </p>
          </div>
        </div>
        {/* Module Progress Bar */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <ProgressBar
            percentage={moduleProgressPercent}
            label="Module Completion"
            height="h-3"
          />
        </div>
      </div>

      {assessments.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center text-yellow-800">
          No assessments available.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assessments.map((assessment: any) => {
            const progress = getAssessmentProgress(assessment._id);
            const maxAttempts = assessment.attempts || 3;
            const canAttempt = progress.attempts < maxAttempts;
            const isCompleted = progress.isCompleted;
            const isNextUp = assessment._id === nextIncompleteAssessmentId;

            return (
              <div
                key={assessment._id}
                className={`bg-white rounded-xl shadow-sm p-6 border transition relative overflow-hidden ${isNextUp ? "ring-2 ring-blue-500 shadow-md" : "hover:shadow-md"}`}
              >
                {isNextUp && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-3 py-1 rounded-bl-lg font-bold">
                    Next Up
                  </div>
                )}

                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {assessment.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {assessment.description || "Assessment"}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Attempts:</span>
                    <span
                      className={`font-semibold ${progress.attempts >= maxAttempts ? "text-red-600" : "text-gray-700"}`}
                    >
                      {progress.attempts} / {maxAttempts}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status:</span>
                    <span
                      className={`font-bold ${isCompleted ? "text-green-600" : "text-orange-500"}`}
                    >
                      {isCompleted ? "Completed" : "In Progress"}
                    </span>
                  </div>
                  {progress.highestScore > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Best Score:</span>
                      <span className="font-bold text-blue-600">
                        {progress.highestScore} Marks
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleStartQuiz(assessment._id)}
                  disabled={!canAttempt && !isCompleted}
                  className={`w-full py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                    canAttempt
                      ? isNextUp
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isCompleted ? (
                    <>✅ Practice Again</>
                  ) : progress.attempts > 0 ? (
                    <>🔄 Retake Assessment</>
                  ) : (
                    <>🚀 Start Assessment</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Module Completion Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Trophy size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Module Completed!
            </h2>
            <p className="text-gray-600 mb-6">
              You've successfully mastered all assessments in this module.
            </p>
            <button
              onClick={() => setShowCelebration(false)}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
            >
              Continue Learning
            </button>
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
    </div>
  );
};

export default StudentAssesmentPage;
