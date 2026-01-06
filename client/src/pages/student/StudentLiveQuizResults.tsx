// Student Live Quiz Results Page
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trophy, CheckCircle, XCircle, ArrowLeft, RefreshCw, Lightbulb } from 'lucide-react';
import BackButton from '../../components/BackButton';
import { getAttemptCount, saveAttempt, canRetake, type QuizAttempt } from '../../services/attemptService';
import { generateExplanation } from '../../services/geminiService';
import { Timestamp } from 'firebase/firestore';

const StudentLiveQuizResults = () => {
    const navigate = useNavigate();
    const { sessionId } = useParams<{ sessionId: string }>();

    // Read ACTUAL results from localStorage (saved by quiz taking page)
    const savedResults = JSON.parse(localStorage.getItem('lastQuizResults') || 'null');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [results, setResults] = useState({
        score: savedResults?.score ?? 0,
        totalQuestions: savedResults?.totalQuestions ?? 10,
        timeTaken: savedResults?.timeTaken ?? 0,
        rank: null as number | null,
        totalStudents: 0,
        correctAnswers: savedResults?.correctAnswers ?? [],
        incorrectAnswers: savedResults?.incorrectAnswers ?? [],
        detailedAnswers: savedResults?.detailedAnswers ?? [] // Array of {questionId, questionText, selectedAnswer, correctAnswer, isCorrect}
    });

    const [attemptNumber, setAttemptNumber] = useState<number>(1);
    const [canRetakeQuiz, setCanRetakeQuiz] = useState(false);
    const [maxAttempts, setMaxAttempts] = useState(3);
    const [explanations, setExplanations] = useState<{ [key: string]: string }>({});
    const [loadingExplanations, setLoadingExplanations] = useState(false);

    // Fetch real leaderboard, track attempt, and check retake eligibility
    useEffect(() => {
        if (!sessionId || !user.email) return;

        const quizId = sessionId; // Using sessionId as quizId for now
        const studentId = user.id || user.email;

        // Track attempt and save to Firestore
        (async () => {
            try {
                // Get current attempt number
                const currentAttemptCount = await getAttemptCount(studentId, quizId);
                const thisAttemptNumber = (currentAttemptCount + 1) as 1 | 2 | 3;
                setAttemptNumber(thisAttemptNumber);

                console.log(`📝 This is attempt #${thisAttemptNumber}`);

                // Save this attempt to history
                if (savedResults) {
                    const attemptData: Omit<QuizAttempt, 'id'> = {
                        studentId,
                        quizId,
                        sessionId,
                        attemptNumber: thisAttemptNumber,
                        answers: savedResults.detailedAnswers || [],
                        score: savedResults.score,
                        totalQuestions: savedResults.totalQuestions,
                        completedAt: Timestamp.now()
                    };
                    await saveAttempt(attemptData);
                    console.log('✅ Attempt saved to Firestore');
                }

                // Check if can retake
                const retakeStatus = await canRetake(studentId, quizId);
                setCanRetakeQuiz(retakeStatus.canRetake);
                setMaxAttempts(retakeStatus.maxAttempts);
                console.log(`🔄 Can retake: ${retakeStatus.canRetake} (${retakeStatus.attemptCount}/${retakeStatus.maxAttempts})`);

                // Load AI explanations for attempt 2+
                if (thisAttemptNumber >= 2 && savedResults?.detailedAnswers) {
                    setLoadingExplanations(true);
                    const wrongAnswers = savedResults.detailedAnswers.filter((a: any) => !a.isCorrect);
                    const explanationsMap: { [key: string]: string } = {};

                    for (const answer of wrongAnswers) {
                        try {
                            const explanation = await generateExplanation(
                                answer.questionText,
                                answer.correctAnswer,
                                answer.selectedAnswer
                            );
                            explanationsMap[answer.questionId] = explanation;
                        } catch (error) {
                            console.error('Error generating explanation:', error);
                            explanationsMap[answer.questionId] = 'Unable to generate explanation at this time.';
                        }
                    }
                    setExplanations(explanationsMap);
                    setLoadingExplanations(false);
                    console.log('✅ Explanations loaded');
                }
            } catch (error) {
                console.error('Error tracking attempt:', error);
            }
        })();

        // Fetch leaderboard
        console.log('📊 Fetching leaderboard for session:', sessionId);
        import('../../services/liveQuizService').then(({ getQuizLeaderboard }) => {
            getQuizLeaderboard(sessionId).then(leaderboard => {
                console.log('✅ Leaderboard loaded:', leaderboard);
                const myEntry = leaderboard.find(entry => entry.studentEmail === user.email);
                if (myEntry) {
                    setResults(prev => ({
                        ...prev,
                        rank: myEntry.rank,
                        totalStudents: leaderboard.length
                    }));
                    console.log(`🏆 Your rank: #${myEntry.rank} out of ${leaderboard.length}`);
                } else {
                    setResults(prev => ({
                        ...prev,
                        totalStudents: leaderboard.length || 1
                    }));
                }
            });
        });
    }, [sessionId, user.email, user.id, savedResults]);


    const percentage = Math.round((results.score / results.totalQuestions) * 100);
    const isPerfect = results.score === results.totalQuestions;
    const isPass = percentage >= 70;

    const handleRetake = () => {
        // Clear saved results and navigate back to quiz
        localStorage.removeItem('lastQuizResults');
        navigate(`/student/live-quiz/${sessionId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-6">
                <BackButton />

                {/* Results Header */}
                <div className={`rounded-2xl shadow-2xl p-8 mb-6 text-white relative overflow-hidden ${isPerfect ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500' :
                    isPass ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                        'bg-gradient-to-br from-gray-600 to-gray-700'
                    }`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>

                    <div className="relative z-10 text-center">
                        <div className="text-6xl mb-4">
                            {isPerfect ? '🏆' : isPass ? '🎉' : '💪'}
                        </div>
                        <h1 className="text-4xl font-bold mb-2">
                            {isPerfect ? 'Perfect Score!' : isPass ? 'Great Job!' : 'Keep Practicing!'}
                        </h1>
                        <p className="text-xl opacity-90 mb-2">Quiz Complete</p>
                        <div className="inline-block bg-white/20 px-4 py-1 rounded-full text-sm font-semibold">
                            Attempt #{attemptNumber} of {maxAttempts}
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-3xl font-bold">{results.score}/{results.totalQuestions}</div>
                                <div className="text-sm opacity-90">Your Score</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-3xl font-bold">{percentage}%</div>
                                <div className="text-sm opacity-90">Percentage</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-3xl font-bold">
                                    {results.rank !== null ? `#${results.rank}` : '...'}
                                </div>
                                <div className="text-sm opacity-90">
                                    {results.totalStudents > 0
                                        ? `Out of ${results.totalStudents} student${results.totalStudents !== 1 ? 's' : ''}`
                                        : 'Loading...'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Breakdown */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Performance Breakdown</h2>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="border-2 border-green-200 rounded-xl p-4 bg-green-50">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                                <span className="font-semibold text-gray-800">Correct</span>
                            </div>
                            <div className="text-3xl font-bold text-green-600">{results.correctAnswers.length}</div>
                        </div>

                        <div className="border-2 border-red-200 rounded-xl p-4 bg-red-50">
                            <div className="flex items-center gap-3 mb-2">
                                <XCircle className="w-6 h-6 text-red-600" />
                                <span className="font-semibold text-gray-800">Incorrect</span>
                            </div>
                            <div className="text-3xl font-bold text-red-600">{results.incorrectAnswers.length}</div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Accuracy</span>
                            <span className="font-bold">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                                className={`h-4 rounded-full transition-all duration-500 ${isPerfect ? 'bg-yellow-500' : isPass ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Question Review */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Question Review</h2>

                    <div className="grid grid-cols-10 gap-2">
                        {[...Array(results.totalQuestions)].map((_, idx) => {
                            const questionNum = idx + 1;
                            const isCorrect = results.correctAnswers.includes(questionNum);

                            return (
                                <div
                                    key={idx}
                                    className={`aspect-square rounded-lg flex items-center justify-center font-bold text-sm ${isCorrect
                                        ? 'bg-green-100 text-green-700 border-2 border-green-500'
                                        : 'bg-red-100 text-red-700 border-2 border-red-500'
                                        }`}>
                                    {questionNum}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Leaderboard Position */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold mb-2">Your Ranking</h3>
                            <p className="opacity-90">Out of {results.totalStudents} students</p>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl font-bold mb-1">#{results.rank}</div>
                            <Trophy className="w-8 h-8 mx-auto" />
                        </div>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-blue-900 mb-3">What's Next?</h3>
                    <ul className="space-y-2 text-blue-800">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>Review incorrect answers with your teacher</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>Practice similar questions to improve</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>Check the leaderboard to see top performers</span>
                        </li>
                    </ul>
                </div>

                {/* AI Explanations (Attempt 2+) */}
                {attemptNumber >= 2 && results.detailedAnswers && results.detailedAnswers.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Lightbulb className="w-6 h-6 text-yellow-500" />
                            <h2 className="text-2xl font-bold text-gray-800">AI Explanations</h2>
                        </div>
                        {loadingExplanations ? (
                            <p className="text-gray-500">Generating explanations...</p>
                        ) : (
                            <div className="space-y-4">
                                {results.detailedAnswers
                                    .filter((answer: any) => !answer.isCorrect)
                                    .map((answer: any, idx: number) => (
                                        <div key={idx} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                                            <div className="font-semibold text-gray-800 mb-2">
                                                Q: {answer.questionText}
                                            </div>
                                            <div className="text-sm text-gray-600 mb-2">
                                                <span className="text-red-600">Your answer: {answer.selectedAnswer}</span> |
                                                <span className="text-green-600 ml-2">Correct: {answer.correctAnswer}</span>
                                            </div>
                                            <div className="bg-white p-3 rounded border border-blue-200">
                                                <p className="text-sm text-gray-700">
                                                    <strong className="text-blue-700">Why? </strong>
                                                    {explanations[answer.questionId] || 'Loading explanation...'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Retake Button + Back Button */}
                <div className="mt-6 flex justify-center gap-4">
                    {canRetakeQuiz && (
                        <button
                            onClick={handleRetake}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Retake Quiz (Attempt {attemptNumber + 1}/{maxAttempts})
                        </button>
                    )}
                    {!canRetakeQuiz && attemptNumber >= maxAttempts && (
                        <div className="text-center text-gray-600 px-6 py-3 bg-gray-100 rounded-xl">
                            Maximum {maxAttempts} attempts reached
                        </div>
                    )}
                    <button
                        onClick={() => navigate('/student/dashboard')}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition font-semibold"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentLiveQuizResults;
