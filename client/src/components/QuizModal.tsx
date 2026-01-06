import { useState, useEffect } from 'react';
import { X, Clock, ChevronLeft, Lightbulb } from 'lucide-react';

interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
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
    onComplete: (score: number, timeUsed: number, userAnswers: (number | null)[]) => void;
    currentAttempt: number;
}

const QuizModal = ({ quiz, onClose, onComplete, currentAttempt }: QuizModalProps) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>(Array(quiz.questions.length).fill(null));
    const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit);
    const [showHintForQuestion, setShowHintForQuestion] = useState(false); // MS2: Show hint after wrong answer

    useEffect(() => {
        if (timeRemaining <= 0) {
            handleSubmit();
            return;
        }

        const timer = setInterval(() => {
            setTimeRemaining(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining]);

    const handleAnswerSelect = (answerIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = answerIndex;
        setAnswers(newAnswers);

        const isCorrect = answerIndex === question.correctAnswer;

        // MS2 Attempt 3: Show hint if wrong, hide if correct
        if (currentAttempt === 3) {
            if (!isCorrect) {
                setShowHintForQuestion(true); // Show hint for wrong answer
                return; // Don't advance - let them try again with hint
            } else {
                setShowHintForQuestion(false); // Hide hint, they got it right
            }
        }

        // Auto-advance logic:
        // - Attempts 1-2: Always auto-advance
        // - Attempt 3: Only advance if answer is CORRECT (ensures 100% accuracy)
        if (currentQuestion < quiz.questions.length - 1) {
            if (currentAttempt < 3) {
                // Attempts 1-2: Auto-advance always
                setTimeout(() => {
                    setCurrentQuestion(prev => prev + 1);
                }, 300);
            } else if (currentAttempt === 3 && isCorrect) {
                // Attempt 3: Only advance if CORRECT
                setTimeout(() => {
                    setCurrentQuestion(prev => prev + 1);
                    setShowHintForQuestion(false); // Reset hint for next question
                }, 300);
            }
            // If Attempt 3 and WRONG: stay on same question (let them try again with hint)
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
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const question = quiz.questions[currentQuestion];
    const isLastQuestion = currentQuestion === quiz.questions.length - 1;
    const answeredCount = answers.filter(a => a !== null).length;

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
                            <span className="font-semibold text-lg">{formatTime(timeRemaining)}</span>
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
                                    <p className="text-xs font-semibold text-yellow-900 mb-1">💡 Hint:</p>
                                    <p className="text-xs text-yellow-800">
                                        Think about the key concepts you've learned. What formula or principle applies here?
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                        {question.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(index)}
                                className={`w-full text-left p-4 rounded-lg border-2 transition ${answers[currentQuestion] === index
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${answers[currentQuestion] === index
                                        ? 'border-blue-500 bg-blue-500'
                                        : 'border-gray-400'
                                        }`}>
                                        {answers[currentQuestion] === index && (
                                            <div className="w-3 h-3 bg-white rounded-full" />
                                        )}
                                    </div>
                                    <span className="text-gray-800">{option}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Progress indicator */}
                    <div className="mt-6 pt-6 border-t">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Progress</span>
                            <span>{answeredCount}/{quiz.questions.length} answered</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${(answeredCount / quiz.questions.length) * 100}%` }}
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
