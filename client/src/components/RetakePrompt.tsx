import { RefreshCw, Home, BookOpen } from 'lucide-react';

interface RetakePromptProps {
    score: number;
    totalQuestions: number;
    bestScore: number;
    attemptsRemaining: number;
    onRetake: () => void;
    onReturn: () => void;
    onReview?: () => void;  // Add optional review callback
}

const RetakePrompt = ({ score, totalQuestions, bestScore, attemptsRemaining, onRetake, onReturn, onReview }: RetakePromptProps) => {
    const percentage = Math.round((score / totalQuestions) * 100);
    const bestPercentage = Math.round((bestScore / totalQuestions) * 100);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-t-2xl text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <RefreshCw className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Ready for Another Try?</h2>
                    <p className="text-blue-100">You have {attemptsRemaining} attempts remaining</p>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">This Attempt</p>
                            <p className="text-3xl font-bold text-gray-800">{percentage}%</p>
                            <p className="text-sm text-gray-500">{score}/{totalQuestions}</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                            <p className="text-sm text-blue-600 mb-1">Best Score</p>
                            <p className="text-3xl font-bold text-blue-600">{bestPercentage}%</p>
                            <p className="text-sm text-blue-500">{bestScore}/{totalQuestions}</p>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-6">
                        <div className="flex items-start">
                            <span className="text-2xl mr-2">💡</span>
                            <div>
                                <p className="font-semibold text-yellow-900">Tip:</p>
                                <p className="text-sm text-yellow-800">Review the explanations above to improve your score!</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {onReview && (
                            <button
                                onClick={onReview}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition shadow-md"
                            >
                                <BookOpen className="w-5 h-5" />
                                Review Answers & Study
                            </button>
                        )}
                        <button
                            onClick={onRetake}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Retake Quiz
                        </button>
                        <button
                            onClick={onReturn}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                        >
                            <Home className="w-5 h-5" />
                            Return to Course
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RetakePrompt;
