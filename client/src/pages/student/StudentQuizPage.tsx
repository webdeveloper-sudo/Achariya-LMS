import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { sampleData } from '../../data/sampleData';
import QuizModal from '../../components/QuizModal';
import QuizReview from '../../components/QuizReview';
import RetakePrompt from '../../components/RetakePrompt';
import { generateDynamicQuiz } from '../../utils/quizGenerator';

const StudentQuizPage = () => {
    const { moduleId } = useParams();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const student = sampleData.students.find(s => s.email === user.email) || sampleData.students[0];

    const [activeQuiz, setActiveQuiz] = useState<any>(null);
    const [showReview, setShowReview] = useState(false);
    const [showRetakePrompt, setShowRetakePrompt] = useState(false);
    const [quizResults, setQuizResults] = useState<any>(null);
    const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);

    // Get module if moduleId is provided
    const module = moduleId ? sampleData.modules.find(m => m.id === Number(moduleId)) : null;
    // Filter quizzes - if moduleId, show only that module's quizzes, otherwise show all
    let filteredQuizzes = moduleId
        ? (sampleData.quizzes || []).filter((q: any) => q.moduleId === Number(moduleId))
        : sampleData.quizzes || [];

    // If no quizzes exist for this module, generate one dynamically!
    useEffect(() => {
        if (moduleId && filteredQuizzes.length === 0) {
            const dynamicQuiz = generateDynamicQuiz(Number(moduleId), 15);
            if (dynamicQuiz) {
                filteredQuizzes = [dynamicQuiz];
            }
        }
    }, [moduleId]);

    // Generate quiz on mount if none exists
    if (moduleId && filteredQuizzes.length === 0) {
        const dynamicQuiz = generateDynamicQuiz(Number(moduleId), 15);
        if (dynamicQuiz) {
            filteredQuizzes = [dynamicQuiz];
        }
    }


    const getQuizAttempts = (quizId: number) => {
        const attempts = JSON.parse(localStorage.getItem('quizAttempts') || '{}');
        // Use moduleId for tracking if available (for dynamic quizzes)
        const trackingKey = moduleId ? `${student.id}_module_${moduleId}` : `${student.id}_${quizId}`;
        return attempts[trackingKey] || { attempts: 0, scores: [], bestScore: 0 };
    };

    const saveQuizAttempt = (quizId: number, score: number) => {
        const attempts = JSON.parse(localStorage.getItem('quizAttempts') || '{}');
        // Use moduleId for tracking if available (for dynamic quizzes)
        const trackingKey = moduleId ? `${student.id}_module_${moduleId}` : `${student.id}_${quizId}`;
        const existing = attempts[trackingKey] || { attempts: 0, scores: [], bestScore: 0 };

        existing.attempts += 1;
        existing.scores.push(score);
        existing.bestScore = Math.max(existing.bestScore, score);

        attempts[trackingKey] = existing;
        localStorage.setItem('quizAttempts', JSON.stringify(attempts));

        return existing;
    };

    const awardCredits = (score: number, totalQuestions: number) => {
        const percentage = (score / totalQuestions) * 100;
        let creditsEarned = 1;

        if (percentage === 100) creditsEarned = 5;
        else if (percentage >= 80) creditsEarned = 3;

        const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');
        const updatedCredits = (student.credits || 0) + creditsEarned;

        studentData[student.id] = {
            ...studentData[student.id],
            credits: updatedCredits
        };

        localStorage.setItem('studentData', JSON.stringify(studentData));
        return creditsEarned;
    };

    return (
        <div>
            <Link to={module ? `/student/course/${module.course_id}` : "/student/courses"} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {module ? 'Back to Course' : 'Back to Courses'}
            </Link>

            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                {module ? `${module.title} - Quiz` : 'Course Quizzes'}
            </h1>

            {filteredQuizzes.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
                    <p className="text-yellow-800 text-lg">No quizzes available for this module yet.</p>
                    <p className="text-yellow-700 text-sm mt-2">Check back later or contact your teacher.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredQuizzes.map((quiz: any) => {
                        const attempts = getQuizAttempts(quiz.id);
                        const canAttempt = attempts.attempts < quiz.maxAttempts;
                        const course = sampleData.courses.find(c => c.id === quiz.courseId);

                        return (
                            <div key={quiz.id} className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md transition">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">{quiz.title}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{course?.title}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 px-3 py-1 rounded-lg">
                                        <p className="text-xs font-semibold text-blue-700">{quiz.questions.length} Questions</p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4 text-sm text-gray-600">
                                    <p>⏱️ Time Limit: {quiz.timeLimit / 60} minutes</p>
                                    <p>🎯 Max Attempts: {quiz.maxAttempts}</p>
                                    {attempts.attempts > 0 && (
                                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-2">
                                            <p className="font-semibold text-purple-900 mb-2">📊 Your Scores:</p>
                                            {attempts.scores.map((score: number, idx: number) => {
                                                const percentage = Math.round((score / quiz.questions.length) * 100);
                                                return (
                                                    <p key={idx} className={`text-sm ${percentage === 100 ? 'text-green-600 font-bold' : 'text-gray-700'}`}>
                                                        Attempt {idx + 1}: {percentage}% {percentage === 100 && '🏆'}
                                                    </p>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        {attempts.attempts > 0
                                            ? `Attempts used: ${attempts.attempts}/${quiz.maxAttempts}`
                                            : 'Not attempted yet'
                                        }
                                    </div>
                                    <button
                                        onClick={() => {
                                            setActiveQuiz(quiz);
                                            setUserAnswers([]);
                                        }}
                                        disabled={!canAttempt}
                                        className={`px-6 py-2 rounded-lg font-semibold transition ${canAttempt
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        {attempts.attempts === 0 ? 'Start Quiz' : canAttempt ? 'Retake' : 'Max Attempts'}
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
                    currentAttempt={getQuizAttempts(activeQuiz.id).attempts + 1}
                    onClose={() => setActiveQuiz(null)}
                    onComplete={(score: number, timeUsed: number, completedAnswers: (number | null)[]) => {
                        // Store the actual user answers!
                        setUserAnswers(completedAnswers);

                        const updatedAttempts = saveQuizAttempt(activeQuiz.id, score);
                        const creditsEarned = awardCredits(score, activeQuiz.questions.length);

                        setQuizResults({
                            ...updatedAttempts,
                            currentScore: score,
                            timeUsed,
                            creditsEarned,
                            totalQuestions: activeQuiz.questions.length
                        });

                        if (updatedAttempts.attempts >= activeQuiz.maxAttempts) {
                            setShowReview(true);
                        } else {
                            setShowRetakePrompt(true);
                        }

                        // DON'T clear activeQuiz here! Results components need it!
                        // It will be cleared when user closes the results/retake modal
                    }}
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
                        setShowReview(true);  // Show full review with module links!
                    }}
                    onRetake={() => {
                        setShowRetakePrompt(false);
                        setActiveQuiz(activeQuiz);  // Reopen quiz
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

export default StudentQuizPage;
