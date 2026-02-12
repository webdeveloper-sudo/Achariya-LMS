import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import QuizModal from "../../components/QuizModal";
import QuizReview from "../../components/QuizReview";
import RetakePrompt from "../../components/RetakePrompt";
import { useStudentStore } from "../../store/useStudentStore";

const StudentAssesmentPage = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [module, setModule] = useState<any>(null);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [studentProgress, setStudentProgress] = useState<any>(null);

  // Quiz State
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [showReview, setShowReview] = useState(false);
  const [showRetakePrompt, setShowRetakePrompt] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [currentAttemptNum, setCurrentAttemptNum] = useState(1);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Module Details (including assessments)
        const moduleRes = await axiosInstance.get(
          `/courses/${courseId}/modules/${moduleId}`,
        );
        if (moduleRes.data.success) {
          setModule(moduleRes.data.data);
          setAssessments(moduleRes.data.data.assessments || []);
        } else {
          setError("Failed to load module.");
        }

        // 2. Fetch Student Progress (to get attempts/history)
        // Ensure we handle this gracefully even if it fails
        try {
          const coursesRes = await axiosInstance.get("/students/courses");
          if (coursesRes.data.success) {
            const enrolledCourse = coursesRes.data.courses.find(
              (c: any) =>
                c.courseId._id === courseId || c.courseId === courseId,
            );
            if (enrolledCourse) {
              setStudentProgress(enrolledCourse.assessmentProgress || []);
            }
          }
        } catch (progErr) {
          console.warn("Failed to load student progress:", progErr);
          // Don't block the page if just progress fails, but assessment might rely on it.
        }
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
    if (!studentProgress) return { attempts: 0, highestScore: 0, history: [] };
    return (
      studentProgress.find((p: any) => p.assessmentId === assessmentId) || {
        attempts: 0,
        highestScore: 0,
        history: [],
      }
    );
  };

  const handleStartQuiz = async (assessmentId: string) => {
    try {
      // Get user ID from local storage or context (assume stored)
      // Get user ID from store
      const { student } = useStudentStore.getState(); // or use hook
      const studentId = student?.id || (student as any)?._id;

      if (!studentId) {
        setError("User not identified. Please log in again.");
        return;
      }

      // Fetch specific assessment details (questions, hints state)
      const res = await axiosInstance.get(
        `/students/${studentId}/assessment/${assessmentId}`,
      );

      if (res.data.success) {
        const backendAssessment = res.data.data;
        const progress = res.data.data.attemptsUsed || 0;
        setCurrentAttemptNum(progress + 1);

        // Map to QuizModal format
        const formattedQuiz = {
          id: backendAssessment._id,
          title: backendAssessment.title,
          timeLimit: backendAssessment.duration || 1800, // Default 30 mins
          maxAttempts: backendAssessment.attempts || 3,
          questions: backendAssessment.questions.map(
            (q: any, index: number) => {
              // Determine Correct Answer format based on type
              let finalCorrectAnswer = q.answer;

              if (
                ["multiple-choice", "diagram-mcq", "table-mcq"].includes(
                  q.questionType,
                )
              ) {
                // Try to map "A", "B", "C"... to 0, 1, 2...
                // OR if answer matches option text
                if (q.options && q.options.length > 0) {
                  // 1. Check if answer is "A", "B", "C", "D"
                  if (/^[A-D]$/i.test(q.answer)) {
                    const map: Record<string, number> = {
                      A: 0,
                      B: 1,
                      C: 2,
                      D: 3,
                    };
                    finalCorrectAnswer = map[q.answer.toUpperCase()];
                    if (finalCorrectAnswer === undefined)
                      finalCorrectAnswer = 0; // fallback
                  } else {
                    // 2. Try finding exact text match
                    const idx = q.options.findIndex(
                      (opt: string) => opt === q.answer,
                    );
                    if (idx !== -1) {
                      finalCorrectAnswer = idx;
                    } else {
                      // Fallback: maybe answer is 0-based index already?
                      if (typeof q.answer === "number")
                        finalCorrectAnswer = q.answer;
                      else finalCorrectAnswer = 0;
                    }
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
                image:
                  q.image ||
                  (q.images && q.images.length > 0 ? q.images[0] : undefined),
                images: q.images || [],
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

      // Calculate real score based on totalQuestions?
      // Actually, backend expects score.

      // Optimistic Update / Submission
      const res = await axiosInstance.post(
        `/students/${studentId}/assessment/${activeQuiz.id}/submit`,
        {
          moduleId,
          courseId,
          score: score,
          totalMarks: activeQuiz.questions.length, // Assuming 1 mark per question for simple quiz
        },
      );

      if (res.data.success) {
        const { passed, creditsAwarded, attempts } = res.data;

        setQuizResults({
          attempts: attempts,
          currentScore: score,
          timeUsed,
          creditsEarned: creditsAwarded, // From backend
          totalQuestions: activeQuiz.questions.length,
          bestScore: Math.max(
            score,
            getAssessmentProgress(activeQuiz.id).highestScore,
          ), // Approx
        });

        // Update local progress state
        const newProgress = [...(studentProgress || [])];
        const idx = newProgress.findIndex(
          (p: any) => p.assessmentId === activeQuiz.id,
        );
        if (idx >= 0) {
          newProgress[idx].attempts = attempts;
          newProgress[idx].highestScore = Math.max(
            score,
            newProgress[idx].highestScore,
          );
        } else {
          newProgress.push({
            assessmentId: activeQuiz.id,
            attempts,
            highestScore: score,
          });
        }
        setStudentProgress(newProgress);

        if (passed || attempts >= activeQuiz.maxAttempts) {
          setShowReview(true);
        } else {
          setShowRetakePrompt(true);
        }
      }
    } catch (err: any) {
      console.error("Submission error:", err);
      // Special handling for 3rd attempt failure (though frontend blocks it usually)
      if (err.response?.data?.isThirdAttemptFailed) {
        alert("Submission Failed: " + err.response.data.message);
        // Don't close modal? Or forced close?
        // Usually force them to try again if logic allows.
      } else {
        alert(
          "Error submitting quiz: " +
            (err.response?.data?.message || err.message),
        );
      }
    }

    setUserAnswers(completedAnswers);
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
      <div className="p-8">
        <Link
          to={`/student/course/${courseId}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        to={`/student/course/${courseId}`}
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Course
      </Link>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {module?.title ? `${module.title} - Assessments` : "Assessments"}
        </h1>
        <p className="text-blue-100">
          Complete these assessments to master the module.
        </p>
      </div>

      {assessments.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <p className="text-yellow-800 text-lg">
            No assessments available for this module yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assessments.map((assessment: any) => {
            const progress = getAssessmentProgress(assessment._id);
            const maxAttempts = assessment.attempts || 3; // Default from schema
            const canAttempt = progress.attempts < maxAttempts;
            const isCompleted = progress.isCompleted; // Or check score?

            return (
              <div
                key={assessment._id}
                className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {assessment.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {assessment.description || "Testing your knowledge"}
                    </p>
                  </div>
                  <div className="bg-blue-50 px-3 py-1 rounded-lg">
                    <p className="text-xs font-semibold text-blue-700">
                      {assessment.questions?.length || 0} Questions
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-6 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    ⏱️ Time Limit:{" "}
                    {Math.floor((assessment.duration || 1800) / 60)} minutes
                  </p>
                  <p className="flex items-center gap-2">
                    🎯 Attempts:{" "}
                    <span className="font-semibold">
                      {progress.attempts}/{maxAttempts}
                    </span>
                  </p>
                  {progress.attempts > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3 mt-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        Your Progress
                      </p>
                      {progress.history &&
                        progress.history.map((h: any, idx: number) => {
                          // Calculate percentage if possible. We stored score.
                          // We assume totalMarks was captured or we guess.
                          // For display, raw score is fine.
                          return (
                            <div
                              key={idx}
                              className="flex justify-between text-sm"
                            >
                              <span>Attempt {idx + 1}</span>
                              <span className="font-medium">
                                {h.score} Marks
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    {isCompleted ? (
                      <span className="text-green-600 font-bold flex items-center gap-1">
                        ✅ Completed
                      </span>
                    ) : (
                      <span className="text-orange-600 font-medium">
                        In Progress
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleStartQuiz(assessment._id)}
                    disabled={!canAttempt && !isCompleted} // Allow review if completed? No review specific yet.
                    className={`px-6 py-2 rounded-lg font-semibold transition ${
                      canAttempt
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {canAttempt
                      ? progress.attempts > 0
                        ? "Retake"
                        : "Start"
                      : "Max Attempts"}
                  </button>
                </div>
              </div>
            );
          })}
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
            // Refresh data
            // window.location.reload(); // Simple way to refresh progress
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
            // Keep activeQuiz, currentAttempt increments (in handleStartQuiz logic next time, but here manual)
            // Actually handleStartQuiz fetches new state.
            // Ideally we close and reopen or just call handleStartQuiz again?
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
