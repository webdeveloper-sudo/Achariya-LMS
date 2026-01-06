import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, BookOpen, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { generateExplanation } from '../services/geminiService';

interface QuizReviewProps {
    quiz: {
        title: string;
        questions: Array<{
            id: number;
            question: string;
            options: string[];
            correctAnswer: number;
            explanation: string;
            moduleId?: number;  // Optional - for navigation to module
            topic?: string;     // Optional - for display
        }>;
    };
    userAnswers: (number | null)[];
    score: number;
    timeUsed: number;
    attemptNumber?: number;  // MS2: Track which attempt this is
    onContinue: () => void;
}

const QuizReview = ({ quiz, userAnswers, score, timeUsed, attemptNumber = 1, onContinue }: QuizReviewProps) => {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const [aiExplanations, setAiExplanations] = useState<{ [key: number]: string }>({});
    const [loadingExplanations, setLoadingExplanations] = useState(false);
    const [attemptHistory, setAttemptHistory] = useState<{ attempt: number, score: number, percentage: number }[]>([]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    // Load attempt history for comparison
    useEffect(() => {
        try {
            const attempts = JSON.parse(localStorage.getItem('quizAttempts') || '{}');
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            // Find this quiz's attempts (try both module-based and quiz-based keys)
            let attemptData = null;
            for (const key in attempts) {
                if (key.includes(user.id || 'student')) {
                    attemptData = attempts[key];
                    break;
                }
            }

            if (attemptData && attemptData.scores) {
                const history = attemptData.scores.map((s: number, idx: number) => ({
                    attempt: idx + 1,
                    score: s,
                    percentage: Math.round((s / quiz.questions.length) * 100)
                }));
                setAttemptHistory(history);
            }
        } catch (error) {
            console.error('Error loading attempt history:', error);
        }
    }, [quiz.questions.length]);

    // Generate AI explanations for wrong answers on Attempt 2+
    useEffect(() => {
        if (attemptNumber >= 2) {
            setLoadingExplanations(true);
            const generateExplanations = async () => {
                const explanationsMap: { [key: number]: string } = {};

                for (let i = 0; i < quiz.questions.length; i++) {
                    const question = quiz.questions[i];
                    const userAnswer = userAnswers[i];
                    const isCorrect = userAnswer === question.correctAnswer;

                    if (!isCorrect && userAnswer !== null) {
                        try {
                            const explanation = await generateExplanation(
                                question.question,
                                question.options[question.correctAnswer],
                                question.options[userAnswer]
                            );
                            explanationsMap[i] = explanation;
                        } catch (error) {
                            console.error('Error generating explanation:', error);
                            explanationsMap[i] = question.explanation || 'Review the correct answer and try to understand why it is correct.';
                        }
                    }
                }

                setAiExplanations(explanationsMap);
                setLoadingExplanations(false);
            };

            generateExplanations();
        }
    }, [attemptNumber, quiz.questions, userAnswers]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8 rounded-t-2xl text-center">
                    <h2 className="text-3xl font-bold mb-4">🎉 Quiz Complete!</h2>
                    <div className="flex justify-center items-center gap-8">
                        <div>
                            <p className="text-green-100 text-sm">Your Score</p>
                            <p className="text-5xl font-bold">{percentage}%</p>
                            <p className="text-green-100 mt-1">{score}/{quiz.questions.length} Correct</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            <div>
                                <p className="text-green-100 text-sm">Time</p>
                                <p className="text-2xl font-semibold">{formatTime(timeUsed)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Credits earned */}
                    <div className="mt-6 bg-white/20 rounded-lg p-3">
                        <p className="text-lg">
                            ⭐ Credits Earned: <span className="font-bold">
                                {percentage === 100 ? '+5' : percentage >= 80 ? '+3' : '+1'}
                            </span>
                        </p>
                    </div>
                </div>

                {/* MS2: Attempt History Comparison */}
                {attemptHistory.length > 1 && (
                    <div className="mx-8 mt-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Your Progress</h3>
                        <div className="flex items-center justify-around">
                            {attemptHistory.map((attempt, idx) => (
                                <div key={idx} className="text-center">
                                    <div className={`text-3xl font-bold mb-1 ${attempt.attempt === attemptNumber ? 'text-purple-600' : 'text-gray-400'
                                        }`}>
                                        {attempt.percentage}%
                                    </div>
                                    <div className={`text-sm ${attempt.attempt === attemptNumber ? 'font-bold text-purple-700' : 'text-gray-600'
                                        }`}>
                                        Attempt {attempt.attempt}
                                    </div>
                                    {idx < attemptHistory.length - 1 && (
                                        <div className="absolute mt-4">→</div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {attemptNumber > 1 && (
                            <p className="text-center text-sm text-purple-700 font-semibold mt-4">
                                {percentage > attemptHistory[attemptHistory.length - 2].percentage
                                    ? '🎉 Great improvement!'
                                    : percentage === 100
                                        ? '🏆 Perfect score!'
                                        : 'Keep learning!'}
                            </p>
                        )}
                    </div>
                )}

                {/* Review */}
                <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Answer Review</h3>

                    <div className="space-y-6">
                        {quiz.questions.map((question, index) => {
                            const userAnswer = userAnswers[index];
                            const isCorrect = userAnswer === question.correctAnswer;

                            return (
                                <div
                                    key={question.id}
                                    className={`border-2 rounded-xl p-6 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                                        }`}
                                >
                                    <div className="flex items-start gap-3 mb-4">
                                        {isCorrect ? (
                                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                                        ) : (
                                            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                                        )}
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-800 text-lg mb-3">
                                                Question {index + 1}: {question.question}
                                            </h4>

                                            <div className="space-y-2 mb-4">
                                                {question.options.map((option, optIndex) => (
                                                    <div
                                                        key={optIndex}
                                                        className={`p-3 rounded-lg ${optIndex === question.correctAnswer
                                                            ? 'bg-green-100 border-2 border-green-500'
                                                            : optIndex === userAnswer && !isCorrect
                                                                ? 'bg-red-100 border-2 border-red-500'
                                                                : 'bg-white border border-gray-200'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {optIndex === question.correctAnswer && (
                                                                <span className="text-green-700 font-semibold text-sm">✓ Correct:</span>
                                                            )}
                                                            {optIndex === userAnswer && !isCorrect && (
                                                                <span className="text-red-700 font-semibold text-sm">✗ Your answer:</span>
                                                            )}
                                                            <span className={
                                                                optIndex === question.correctAnswer
                                                                    ? 'text-green-800 font-medium'
                                                                    : optIndex === userAnswer && !isCorrect
                                                                        ? 'text-red-800'
                                                                        : 'text-gray-600'
                                                            }>
                                                                {option}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* MS2: Show explanations only on Attempt 2+ */}
                                            {attemptNumber >= 2 && !isCorrect && (
                                                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mt-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Lightbulb className="w-5 h-5 text-yellow-600" />
                                                        <p className="text-sm font-semibold text-blue-900">AI Explanation:</p>
                                                    </div>
                                                    <p className="text-sm text-blue-800">
                                                        {loadingExplanations ? 'Generating explanation...' : (aiExplanations[index] || question.explanation)}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Module Review Link for Wrong Answers */}
                                            {!isCorrect && question.moduleId && (
                                                <Link
                                                    to={`/student/module/${question.moduleId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition font-semibold text-sm shadow-md"
                                                >
                                                    <BookOpen className="w-4 h-4" />
                                                    Review Module Content
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-6 rounded-b-2xl flex justify-center">
                    <button
                        onClick={onContinue}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl text-lg font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-800 transition transform hover:scale-105"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizReview;
