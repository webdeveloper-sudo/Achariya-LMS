import { useState, useEffect } from "react";
import { X, Clock, ChevronLeft, Lightbulb } from "lucide-react";

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
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | string | any | null)[]>(
    Array(quiz.questions.length).fill(null),
  );
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit);
  const [showHintForQuestion, setShowHintForQuestion] = useState(false); // MS2: Show hint after wrong answer

  useEffect(() => {
    if (timeRemaining <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleAnswerSelect = (answerInput: any) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerInput;
    setAnswers(newAnswers);

    let isCorrect = false;

    // Correctness Logic based on Type
    if (
      ["multiple-choice", "diagram-mcq", "table-mcq"].includes(question.type)
    ) {
      // Expecting INDEX comparison
      isCorrect = answerInput === question.correctAnswer;
    } else if (question.type === "true-false") {
      // Boolean comparison
      isCorrect = answerInput === question.correctAnswer;
    } else if (question.type === "fill-ups") {
      // String comparison (case insensitive trimmed)
      const safeAnswer = String(answerInput || "")
        .trim()
        .toLowerCase();
      const safeCorrect = String(question.correctAnswer || "")
        .trim()
        .toLowerCase();
      isCorrect = safeAnswer === safeCorrect;
    } else if (question.type === "match") {
      // Complex comparison: Need to check if all pairs match
      // User answer is object {0: "RightVal", 1: "RightVal"}
      // Correct Answer is... difficult. Backend passed "Match the pairs" string.
      // We need to compare against `question.pairs`.
      // If `question.pairs` is [{left: "A", right: "B"}], and user mapped index 0 -> "B".
      // We need to assume `question.pairs` order corresponds to indices 0, 1, 2...
      // So, compare user's selection for index i with pair[i].right.

      if (!question.pairs) {
        isCorrect = false;
      } else {
        const userMap = answerInput || {};
        let allCorrect = true;
        question.pairs.forEach((pair, idx) => {
          if (userMap[idx] !== pair.right) {
            allCorrect = false;
          }
        });
        isCorrect = allCorrect;
      }
    } else {
      // Default fallback
      isCorrect = answerInput === question.correctAnswer;
    }

    // MS2 Attempt 3: Show hint if wrong, hide if correct
    if (currentAttempt === 3) {
      if (!isCorrect) {
        setShowHintForQuestion(true); // Show hint for wrong answer
        // Don't return here! We update state but maybe block Auto-Advance.
      } else {
        setShowHintForQuestion(false); // Hide hint, they got it right
      }
    }

    // Auto-advance logic:
    if (currentQuestion < quiz.questions.length - 1) {
      if (currentAttempt < 3) {
        // For Fill-ups/Match, auto-advance on INPUT is annoying.
        // User needs to type/select multiple things.
        // Only Auto-advance for click-based selection (MCQ/True-False).
        if (
          [
            "multiple-choice",
            "true-false",
            "diagram-mcq",
            "table-mcq",
          ].includes(question.type)
        ) {
          setTimeout(() => {
            setCurrentQuestion((prev) => prev + 1);
          }, 300);
        }
      } else if (currentAttempt === 3 && isCorrect) {
        // Attempt 3: Only advance if CORRECT
        if (
          [
            "multiple-choice",
            "true-false",
            "diagram-mcq",
            "table-mcq",
          ].includes(question.type)
        ) {
          setTimeout(() => {
            setCurrentQuestion((prev) => prev + 1);
            setShowHintForQuestion(false);
          }, 300);
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    let score = 0;
    answers.forEach((answer, index) => {
      if (answer !== null && answer === quiz.questions[index].correctAnswer) {
        score++;
      }
    });

    const timeUsed = quiz.timeLimit - timeRemaining;
    onComplete(score, timeUsed, answers);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const question = quiz.questions[currentQuestion];
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;
  const answeredCount = answers.filter((a) => a !== null).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{quiz.title}</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="font-semibold text-lg">
                {formatTime(timeRemaining)}
              </span>
            </div>
            <div>
              Question {currentQuestion + 1} of {quiz.questions.length}
            </div>
            <div>
              Attempt {currentAttempt} of {quiz.maxAttempts}
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="p-8">
          <div className="flex items-start gap-3 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex-1">
              {question.question}
            </h3>

            {/* MS2: Hint only appears AFTER wrong answer on Attempt 3 */}
            {currentAttempt === 3 && showHintForQuestion && (
              <div className="group relative">
                <Lightbulb className="w-6 h-6 text-yellow-500 cursor-help animate-pulse" />
                <div className="hidden group-hover:block absolute right-0 top-8 w-64 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-3 shadow-lg z-10">
                  <p className="text-xs font-semibold text-yellow-900 mb-1">
                    💡 Hint:
                  </p>
                  <p className="text-xs text-yellow-800">
                    Think about the key concepts you've learned. What formula or
                    principle applies here?
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* specialized question rendering */}
          <div className="space-y-4">
            {/* Image for Diagram/Table questions */}
            {question.image && (
              <div className="mb-4">
                <img
                  src={question.image}
                  alt="Question Diagram"
                  className="max-w-full h-auto rounded-lg border border-gray-200"
                />
              </div>
            )}

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
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)} // For MCQs, we store INDEX
                    className={`w-full text-left p-4 rounded-lg border-2 transition ${
                      answers[currentQuestion] === index
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                          answers[currentQuestion] === index
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-400"
                        }`}
                      >
                        {answers[currentQuestion] === index && (
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
              <div>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Type your answer here..."
                  value={answers[currentQuestion] || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Update state manually locally or via handleAnswerSelect
                    const newAnswers = [...answers];
                    newAnswers[currentQuestion] = val;
                    setAnswers(newAnswers);
                  }}
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
                  {/* Simple implementation: Dropdowns for right side to match order? 
                                         Or just text input for "Pairs"? 
                                         For simplicity, let's assume 'Match the pairs' is actually a drag-drop or just simple display 
                                         where user internally matches. 
                                         BUT the data has "answer": "Match the pairs", which is odd. 
                                         Usually matching questions require complex UI.
                                         Given the user constraints, let's render them as read-only cards for now 
                                         OR provide a simple text area to write pairings if it's manual grading? 
                                         "answer": "Match the pairs" suggests it might not be auto-graded strictly by string equality? 
                                         Wait, `mark`: 4 suggests it IS graded.
                                         Let's assume for this version we just show the pairs jumbled? 
                                         Actually, the JSON shows `pairs` with correct left-right.
                                         Ah, usually we shuffle the right side.
                                         Let's provide a "Connect" UI: Left side fixed, Right side dropdowns.
                                     */}
                  {question.pairs.map((pair, idx) => (
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
                      }}
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
          {/* Progress indicator */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>
                {answeredCount}/{quiz.questions.length} answered
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{
                  width: `${(answeredCount / quiz.questions.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-gray-50 p-6 rounded-b-2xl flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          {isLastQuestion && (
            <button
              onClick={handleSubmit}
              disabled={answeredCount < quiz.questions.length}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Submit Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
