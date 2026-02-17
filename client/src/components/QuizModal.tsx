import { useState, useEffect } from "react";
import { X, Clock, ChevronLeft, Lightbulb, CheckCircle } from "lucide-react";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number | string | boolean; // Can be index, text, or boolean
  explanation: string;
  type: string; // 'multiple-choice', 'true-false', 'fill-ups', 'match', 'table-mcq', 'diagram-mcq'
  pairs?: { left: string; right: string }[];
  tableRows?: string[];
  image?: string;
  images?: string[];
  difficulty?: string; // 'Easy', 'Medium', 'Hard'
}

interface QuizModalProps {
  quiz: {
    id: number;
    title: string;
    timeLimit: number;
    questions: QuizQuestion[];
    maxAttempts: number;
  };
  onClose: () => void;
  onComplete: (
    score: number,
    timeUsed: number,
    userAnswers: (number | null)[],
  ) => void;
  currentAttempt: number;
}

const QuizModal = ({
  quiz,
  onClose,
  onComplete,
  currentAttempt,
}: QuizModalProps) => {
  // --- State ---
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | string | any | null)[]>(
    () => {
      // Load from localStorage if available
      const saved = localStorage.getItem(
        `quiz_progress_${quiz.id}_attempt_${currentAttempt}`,
      );
      return saved
        ? JSON.parse(saved)
        : Array(quiz.questions.length).fill(null);
    },
  );

  // Timers
  const [totalTimeRemaining, setTotalTimeRemaining] = useState(quiz.timeLimit); // Overall quiz timer
  const [questionTimer, setQuestionTimer] = useState(0); // Seconds spent on current question

  // UI States
  const [showHintForQuestion, setShowHintForQuestion] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false); // For Attempt 3 correct
  const [ratings, setRatings] = useState<Record<number, number>>({}); // Confidence ratings

  const question = quiz.questions[currentQuestion];
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;
  const answeredCount = answers.filter((a) => a !== null && a !== "").length;

  // Determine if current question is correctly answered (helper)
  const isCurrentCorrect = () => {
    const ans = answers[currentQuestion];
    if (ans === null || ans === "") return false;

    // Reuse logic or simplify
    // NOTE: This logic duplicates handleAnswerSelect validation.
    // Ideally extract validation to a helper pure function.
    if (
      ["multiple-choice", "diagram-mcq", "table-mcq", "true-false"].includes(
        question.type,
      )
    ) {
      // Helper for True/False string/bool mismatch handled in selection usually,
      // but here we assume stored answer is correct format.
      if (
        question.type === "true-false" &&
        typeof question.correctAnswer === "string"
      ) {
        return (
          String(ans).toLowerCase() === question.correctAnswer.toLowerCase()
        );
      }
      return ans === question.correctAnswer;
    } else if (question.type === "fill-ups") {
      return (
        String(ans).trim().toLowerCase() ===
        String(question.correctAnswer).trim().toLowerCase()
      );
    } else if (question.type === "match") {
      // Complex match logic (simplified for checking block status)
      if (!question.pairs) return false;
      const userMap = ans || {};
      return question.pairs.every((p, idx) => userMap[idx] === p.right);
    }
    return ans === question.correctAnswer;
  };

  const currentIsCorrect = isCurrentCorrect();

  // --- Effects ---

  // 1. Persist Answers
  useEffect(() => {
    localStorage.setItem(
      `quiz_progress_${quiz.id}_attempt_${currentAttempt}`,
      JSON.stringify(answers),
    );
  }, [answers, quiz.id, currentAttempt]);

  // 2. Global Timer
  useEffect(() => {
    if (totalTimeRemaining <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(
      () => setTotalTimeRemaining((prev) => prev - 1),
      1000,
    );
    return () => clearInterval(timer);
  }, [totalTimeRemaining]);

  // 3. Question Timer (Resets on question change)
  useEffect(() => {
    setQuestionTimer(0);
    const qTimer = setInterval(
      () => setQuestionTimer((prev) => prev + 1),
      1000,
    );
    return () => clearInterval(qTimer);
  }, [currentQuestion]);

  // 4. Reset UI on question change
  useEffect(() => {
    setShowHintForQuestion(false);
    setShowExplanation(false);
  }, [currentQuestion]);

  // --- Handlers ---

  const handleAnswerSelect = (answerInput: any) => {
    const newAnswers = [...answers];
    let processedAnswer = answerInput;

    // Normalize True/False
    if (question.type === "true-false" && typeof answerInput === "number") {
      processedAnswer = answerInput === 0;
    }

    newAnswers[currentQuestion] = processedAnswer;
    setAnswers(newAnswers);

    // Immediate Validation for Attempt 3
    if (currentAttempt === 3) {
      // Check correctness locally to trigger UI
      let isCorrect = false;
      // ... (Duplicate logic for strict check, or use helper if we updated state first?
      // State updates are async, so we must calculate against `processedAnswer` directly)

      if (
        ["multiple-choice", "diagram-mcq", "table-mcq"].includes(question.type)
      ) {
        isCorrect = processedAnswer === question.correctAnswer;
      } else if (question.type === "true-false") {
        isCorrect = processedAnswer === question.correctAnswer;
        if (typeof question.correctAnswer === "string") {
          isCorrect =
            String(processedAnswer).toLowerCase() ===
            question.correctAnswer.toLowerCase();
        }
      } else if (question.type === "fill-ups") {
        isCorrect =
          String(processedAnswer || "")
            .trim()
            .toLowerCase() ===
          String(question.correctAnswer || "")
            .trim()
            .toLowerCase();
      } else if (question.type === "match") {
        if (question.pairs) {
          const userMap = processedAnswer || {};
          isCorrect = question.pairs.every(
            (p, idx) => userMap[idx] === p.right,
          );
        }
      } else {
        isCorrect = processedAnswer === question.correctAnswer;
      }

      if (!isCorrect) {
        setShowHintForQuestion(true); // Show Hint/Explanation for wrong answer
        setShowExplanation(false);
      } else {
        setShowHintForQuestion(false);
        setShowExplanation(true); // Show Full Explanation for correct answer
      }
    }

    // Auto-advance Logic (Attempts 1 & 2 only)
    if (currentAttempt < 3 && currentQuestion < quiz.questions.length - 1) {
      if (
        ["multiple-choice", "true-false", "diagram-mcq", "table-mcq"].includes(
          question.type,
        )
      ) {
        setTimeout(() => {
          setCurrentQuestion((prev) => prev + 1);
        }, 500);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      if (isLastQuestion) {
        // Smart Previous: Find nearest unanswered
        // Scan backwards from currentQuestion - 1
        let target = -1;
        for (let i = currentQuestion - 1; i >= 0; i--) {
          const ans = answers[i];
          if (
            ans === null ||
            ans === "" ||
            (typeof ans === "object" && Object.keys(ans).length === 0)
          ) {
            target = i;
            break;
          }
        }

        if (target !== -1) {
          setCurrentQuestion(target);
          return;
        }
      }
      // Default Sequential
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleNext = () => {
    // Attempt 3 Blocking Rule
    if (currentAttempt >= 3) {
      if (!currentIsCorrect) {
        alert("Please select the correct answer to proceed.");
        return;
      }
    }

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handleSubmit = () => {
    // Final validation check?
    let score = 0;
    answers.forEach((answer, index) => {
      // ... (Scoring Logic)
      const q = quiz.questions[index];
      // Simplified check (should match helper)
      let isRight = false;
      if (q.type === "match") {
        // ... match logic
        // Assume simplified for score count:
        // We'll trust the main logic or just raw compare if strict.
        // Ideally we need the shared helper.
        if (q.pairs) {
          const userMap = answer || {};
          isRight = q.pairs.every((p, idx) => userMap[idx] === p.right);
        }
      } else if (q.type === "fill-ups") {
        isRight =
          String(answer).trim().toLowerCase() ===
          String(q.correctAnswer).trim().toLowerCase();
      } else {
        // Loose compare for T/F text vs bool
        isRight =
          answer == q.correctAnswer ||
          String(answer).toLowerCase() ===
            String(q.correctAnswer).toLowerCase();
      }

      if (isRight) score++;
    });

    const timeUsed = quiz.timeLimit - totalTimeRemaining;
    onComplete(score, timeUsed, answers);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // UI Helpers
  const getDifficultyColor = (diff?: string) => {
    switch (diff?.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "hard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-t-2xl shrink-0">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">{quiz.title}</h2>
              <p className="text-slate-400 text-sm">
                Attempt {currentAttempt} of {quiz.maxAttempts}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white/10 rounded-lg p-3 flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-xs text-slate-400">Time Left</p>
                <p className="font-mono font-bold text-lg">
                  {formatTime(totalTimeRemaining)}
                </p>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 flex items-center gap-3">
              <Clock className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-xs text-slate-400">Question Time</p>
                <p className="font-mono font-bold text-lg">
                  {formatTime(questionTimer)}
                </p>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 flex items-center gap-3 col-span-2">
              <div className="w-full">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-400">Progress</span>
                  <span className="text-xs font-bold">
                    {answeredCount}/{quiz.questions.length}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(answeredCount / quiz.questions.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 md:p-8 overflow-y-auto grow">
          <div className="flex items-start gap-4 mb-8">
            <span
              className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${getDifficultyColor(question.difficulty)}`}
            >
              {question.difficulty || "Medium"}
            </span>
            <h3 className="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed flex-1">
              {question.question}
            </h3>

            {/* Bulb - Attempt 2 or Attempt 3 (Restricted) */}
            {(currentAttempt === 2 || currentAttempt === 3) && (
              <div className="relative group">
                <button
                  onClick={() => setShowHintForQuestion(!showHintForQuestion)}
                  className={`p-2 rounded-full transition ${showHintForQuestion ? "bg-yellow-100 text-yellow-600" : "bg-gray-100 text-gray-400 hover:text-yellow-600"}`}
                >
                  <Lightbulb className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>

          {/* Feedback Area (Attempt 3) */}
          {(showHintForQuestion || showExplanation) && (
            <div
              className={`mb-8 p-6 rounded-xl border-l-4 ${showExplanation ? "bg-green-50 border-green-500" : "bg-amber-50 border-amber-500"}`}
            >
              <h4
                className={`font-bold mb-2 flex items-center gap-2 ${showExplanation ? "text-green-800" : "text-amber-800"}`}
              >
                {showExplanation ? (
                  <>
                    <CheckCircle className="w-5 h-5" /> Correct Answer Analysis
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-5 h-5" /> Hint & Explanation
                  </>
                )}
              </h4>
              <p className="text-gray-700 mb-4">
                {question.explanation ||
                  "Review the course material for more details."}
              </p>

              {currentAttempt === 3 &&
                (showExplanation || showHintForQuestion) && (
                  <div className="bg-white/50 p-3 rounded-lg">
                    <p className="text-sm font-bold text-gray-600 uppercase text-xs mb-1">
                      Correct Answer:
                    </p>
                    <p className="font-mono text-gray-900 font-medium">
                      {String(question.correctAnswer)}
                    </p>
                  </div>
                )}
            </div>
          )}

          {/* Question Content (Images/Tables) */}
          {question.images && question.images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {question.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="Question Reference"
                  className="rounded-xl border border-gray-200 w-full"
                />
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="space-y-4 max-w-3xl mx-auto">
            {/* Table for Table MCQ */}
            {question.type === "table-mcq" && question.tableRows && (
              <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <tbody>
                    {question.tableRows.map((row, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="py-2">{row}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* RENDER OPTIONS BASED ON TYPE */}
            {[
              "multiple-choice",
              "true-false",
              "diagram-mcq",
              "table-mcq",
            ].includes(question.type) && (
              <div className="space-y-3">
                {(question.type === "true-false" &&
                (!question.options || question.options.length === 0)
                  ? ["True", "False"]
                  : question.options
                ).map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition ${
                      (
                        question.type === "true-false"
                          ? answers[currentQuestion] ===
                            (index === 0) /* boolean check */
                          : answers[currentQuestion] === index
                      )
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                          (
                            question.type === "true-false"
                              ? answers[currentQuestion] === (index === 0)
                              : answers[currentQuestion] === index
                          )
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-400"
                        }`}
                      >
                        {(question.type === "true-false"
                          ? answers[currentQuestion] === (index === 0)
                          : answers[currentQuestion] === index) && (
                          <div className="w-3 h-3 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="text-gray-800">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {question.type === "fill-ups" && (
              <div className="relative">
                <input
                  type="text"
                  value={answers[currentQuestion] || ""}
                  onChange={(e) => {
                    const newAns = [...answers];
                    newAns[currentQuestion] = e.target.value;
                    setAnswers(newAns);
                  }}
                  onBlur={(e) => handleAnswerSelect(e.target.value)}
                  className="w-full p-5 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                  placeholder="Type your answer here..."
                />
              </div>
            )}

            {question.type === "match" && question.pairs && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  {question.pairs.map((pair, idx) => (
                    <div
                      key={`left-${idx}`}
                      className="p-3 bg-gray-100 rounded border border-gray-200"
                    >
                      {pair.left}
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {question.pairs.map((_, idx) => (
                    <select
                      key={`right-${idx}`}
                      className="w-full p-3 border border-gray-300 rounded bg-white"
                      value={(answers[currentQuestion] as any)?.[idx] || ""}
                      onChange={(e) => {
                        const currentAns =
                          (answers[currentQuestion] as any) || {};
                        const newAns = { ...currentAns, [idx]: e.target.value };
                        const newAnswers = [...answers];
                        newAnswers[currentQuestion] = newAns;
                        setAnswers(newAnswers);
                        // For Match, we might need to trigger validation if all are filled?
                        // Or just let user fill all.
                        // Ideally checking if all filled to trigger "handleAnswerSelect"?
                        // For now let's just set state.
                      }}
                      // We need a way to validate "Attempt 3" blocking on match.
                      // With `handleAnswerSelect` being complex, let's trigger it on every change?
                      // Or maybe just let them select.
                      // The existing code calls handleAnswerSelect(newAns) would trigger validation.
                      // Let's call handleAnswerSelect with the new full object.
                      onBlur={() =>
                        handleAnswerSelect(answers[currentQuestion])
                      }
                    >
                      <option value="">Select match...</option>
                      {question.pairs
                        ?.map((p) => p.right)
                        .sort()
                        .map((r, i) => (
                          <option key={i} value={r}>
                            {r}
                          </option>
                        ))}
                    </select>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confidence Rating (New Feature) */}
          {answers[currentQuestion] !== null &&
            answers[currentQuestion] !== "" && (
              <div className="mt-8 flex justify-center items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
                <span className="text-sm text-gray-500">Confidence:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() =>
                        setRatings((prev) => ({
                          ...prev,
                          [currentQuestion]: star,
                        }))
                      }
                      className={`text-2xl transition hover:scale-110 ${ratings[currentQuestion] >= star ? "text-yellow-400" : "text-gray-300"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Footer Navigation */}
        <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex justify-between items-center shrink-0">
          <button
            onClick={handlePrevious}
            disabled={
              currentQuestion === 0 ||
              (currentAttempt >= 3 && !currentIsCorrect)
            }
            className="px-6 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" /> Previous
          </button>

          {/* Action Button: Next or Submit */}
          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={answeredCount < quiz.questions.length} // User requested strict blocking on ALL questions
              className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg hover:shadow-green-500/30 transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Assessment
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={currentAttempt >= 3 && !currentIsCorrect}
              className={`px-8 py-3 rounded-xl font-semibold text-white transition flex items-center gap-2
                         ${
                           currentAttempt >= 3 && !currentIsCorrect
                             ? "bg-gray-400 cursor-not-allowed"
                             : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transform hover:-translate-y-0.5"
                         }
                     `}
            >
              Next Question <ChevronLeft className="w-5 h-5 rotate-180" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
