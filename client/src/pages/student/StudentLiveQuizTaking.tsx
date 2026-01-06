// Student Live Quiz Taking Page
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import BackButton from '../../components/BackButton';
import LiveQuizTimer from '../../components/LiveQuizTimer';
import { submitQuizAttempt } from '../../services/liveQuizService';
import { randomizeQuestions, randomizeOptions, getQuestionOrderMapping, getOptionOrderMappings } from '../../utils/quizRandomizer';
import type { LiveQuizSession } from '../../services/liveQuizService';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';

const StudentLiveQuizTaking = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [session, setSession] = useState<LiveQuizSession | null>(null);
    const [quizEndTime, setQuizEndTime] = useState<Date | null>(null); // STABLE endTime
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);


    // Mock quiz questions
    const mockQuestions = [
        { id: 1, text: "What is 2 + 2?", options: ["3", "4", "5", "6"], correctAnswer: 1 },
        { id: 2, text: "Capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], correctAnswer: 2 },
        { id: 3, text: "Which is a prime number?", options: ["4", "6", "7", "8"], correctAnswer: 2 },
        { id: 4, text: "What is 5 × 6?", options: ["25", "30", "35", "40"], correctAnswer: 1 },
        { id: 5, text: "Largest ocean?", options: ["Atlantic", "Pacific", "Indian", "Arctic"], correctAnswer: 1 },
        { id: 6, text: "What is 10 - 3?", options: ["5", "6", "7", "8"], correctAnswer: 2 },
        { id: 7, text: "Who wrote Hamlet?", options: ["Dickens", "Shakespeare", "Austen", "Tolkien"], correctAnswer: 1 },
        { id: 8, text: "What is H2O?", options: ["Oxygen", "Water", "Hydrogen", "Carbon"], correctAnswer: 1 },
        { id: 9, text: "Speed of light?", options: ["200k km/s", "300k km/s", "400k km/s", "500k km/s"], correctAnswer: 1 },
        { id: 10, text: "First president of USA?", options: ["Lincoln", "Washington", "Jefferson", "Adams"], correctAnswer: 1 },
    ];

    useEffect(() => {
        // Fetch REAL session from Firebase to get correct endTime
        if (sessionId) {
            import('../../services/liveQuizService').then(({ getSessionById }) => {
                getSessionById(sessionId).then((firebaseSession) => {
                    if (firebaseSession) {
                        // Use REAL session from Firebase with correct endTime
                        console.log('✅ Loaded session from Firebase:', firebaseSession);
                        setSession(firebaseSession);
                        // CRITICAL: Set endTime ONCE - prevents timer reset
                        setQuizEndTime(firebaseSession.endTime.toDate());
                    } else {
                        // Fallback to mock session (for demo purposes)
                        console.log('⚠️ No Firebase session, using mock');
                        // Calculate endTime ONCE here, not in toDate()
                        const mockEndTime = new Date(Date.now() + 120000);
                        const mockStartTime = new Date();
                        const mockSession: LiveQuizSession = {
                            id: sessionId,
                            quizId: 'demo-quiz',
                            quizTitle: 'Live Quiz Demo',
                            classId: '8-A',
                            className: 'Class 8-A',
                            teacherId: 'teacher-001',
                            teacherName: 'Mr. Sharma',
                            startTime: { toDate: () => mockStartTime } as any,
                            endTime: { toDate: () => mockEndTime } as any,
                            duration: 120,
                            sessionSeed: sessionId,
                            status: 'active',
                            questionCount: 10
                        };
                        setSession(mockSession);
                        // CRITICAL: Set endTime ONCE
                        setQuizEndTime(mockEndTime);
                    }


                    // Randomize questions for this student
                    const randomized = randomizeQuestions(mockQuestions, sessionId, user.email || 'student');

                    // Randomize options for each question
                    const questionsWithRandomOptions = randomized.map(q => {
                        const { shuffledOptions, newCorrectIndex } = randomizeOptions(
                            q.options,
                            q.correctAnswer,
                            sessionId,
                            user.email || 'student',
                            q.id
                        );
                        return {
                            ...q,
                            options: shuffledOptions,
                            correctAnswer: newCorrectIndex
                        };
                    });

                    setQuestions(questionsWithRandomOptions);
                    setSelectedAnswers(new Array(10).fill(-1));
                });
            });
        }
    }, [sessionId, user.email]);

    // FALLBACK: Auto-submit when quiz time expires (in case timer callback fails)
    useEffect(() => {
        if (!quizEndTime || isSubmitting) return;

        const checkExpired = setInterval(() => {
            const now = Date.now();
            const timeLeft = quizEndTime.getTime() - now;

            if (timeLeft <= 0) {
                console.log('⏰ FALLBACK: Quiz time expired - auto-submitting');
                clearInterval(checkExpired);
                handleSubmit();
            }
        }, 1000);

        return () => clearInterval(checkExpired);
    }, [quizEndTime, isSubmitting]); // Only handleSubmit is missing, but it's stable

    // LISTEN FOR TEACHER ENDING QUIZ EARLY
    useEffect(() => {
        if (!sessionId || !session || isSubmitting) return;

        console.log('👂 Listening for teacher ending quiz early...');
        const sessionRef = doc(db, 'liveQuizSessions', sessionId);

        const unsubscribe = onSnapshot(sessionRef, (snapshot) => {
            const data = snapshot.data();

            if (data?.status === 'completed' && !isSubmitting) {
                console.log('🛑 Teacher ended quiz early - auto-submitting student answers');
                handleSubmit();
            }
        });

        return () => {
            console.log('🔌 Unsubscribing from session status listener');
            unsubscribe();
        };
    }, [sessionId, session, isSubmitting]);

    const handleAnswerSelect = (optionIndex: number) => {
        const newAnswers = [...selectedAnswers];
        newAnswers[currentQuestionIndex] = optionIndex;
        setSelectedAnswers(newAnswers);

        // AUTO-FORWARD: Move to next question after selection
        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            }
        }, 300); // Small delay for visual feedback
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmit = async () => {
        if (!session || !sessionId) return;

        setIsSubmitting(true);

        try {
            // Calculate score and track correct/incorrect
            let score = 0;
            const correctAnswersList: number[] = [];
            const incorrectAnswersList: number[] = [];

            questions.forEach((q, idx) => {
                if (selectedAnswers[idx] === q.correctAnswer) {
                    score++;
                    correctAnswersList.push(idx + 1);
                } else {
                    incorrectAnswersList.push(idx + 1);
                }
            });

            const timeTaken = Date.now() - session.startTime.toDate().getTime();

            // Build detailed answers for MS2 (AI explanations)
            const detailedAnswers = questions.map((q, idx) => ({
                questionId: q.id.toString(),
                questionText: q.text,
                selectedAnswer: q.options[selectedAnswers[idx]] || 'No answer',
                correctAnswer: q.options[q.correctAnswer],
                isCorrect: selectedAnswers[idx] === q.correctAnswer
            }));

            // SAVE RESULTS TO LOCALSTORAGE for results page
            localStorage.setItem('lastQuizResults', JSON.stringify({
                score,
                totalQuestions: questions.length,
                timeTaken,
                correctAnswers: correctAnswersList,
                incorrectAnswers: incorrectAnswersList,
                selectedAnswers,
                detailedAnswers, // MS2: For AI explanations
                sessionId
            }));

            await submitQuizAttempt({
                sessionId: sessionId,
                studentId: user.email || 'student',
                studentName: user.name || 'Student',
                answers: selectedAnswers,
                score: score,
                timeTakenMs: timeTaken,
                submitTime: { toDate: () => new Date() } as any,
                isLate: timeTaken > session.duration * 1000,
                questionOrder: getQuestionOrderMapping(questions),
                optionOrders: getOptionOrderMappings(questions, session.sessionSeed, user.email || 'student')
            });

            navigate(`/student/live-quiz/${sessionId}/results`);
        } catch (error) {
            console.error('Firebase submit error (expected for demo):', error);
            // FALLBACK: Navigate to results anyway for demo
            setTimeout(() => {
                navigate(`/student/live-quiz/${sessionId}/results`);
            }, 500);
        }
    };

    const handleTimeUp = () => {
        handleSubmit();
    };

    if (!session || !quizEndTime || questions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading quiz...</p>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const answeredCount = selectedAnswers.filter(a => a !== -1).length;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-6">
                <BackButton />

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-6 mb-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold">{session.quizTitle}</h1>
                            <p className="opacity-90">Question {currentQuestionIndex + 1} of {questions.length}</p>
                        </div>
                        <LiveQuizTimer
                            endTime={quizEndTime!}
                            onTimeUp={handleTimeUp}

                        />
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/20 rounded-full h-2">
                        <div
                            className="bg-white h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                    <div className="mb-6">
                        <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                            Q{currentQuestion.originalPosition || currentQuestionIndex + 1}
                        </span>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-8">{currentQuestion.text}</h2>

                    <div className="space-y-4">
                        {currentQuestion.options.map((option: string, index: number) => (
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(index)}
                                className={`w-full p-4 rounded-xl border-2 transition text-left ${selectedAnswers[currentQuestionIndex] === index
                                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                                    : 'border-gray-200 hover:border-blue-300 text-gray-700'
                                    }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedAnswers[currentQuestionIndex] === index
                                        ? 'border-blue-600 bg-blue-600'
                                        : 'border-gray-300'
                                        }`}>
                                        {selectedAnswers[currentQuestionIndex] === index && (
                                            <div className="w-3 h-3 bg-white rounded-full"></div>
                                        )}
                                    </div>
                                    <span className="font-semibold">{option}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={handlePrevious}
                        disabled={currentQuestionIndex === 0}
                        className={`px-6 py-3 rounded-xl font-semibold transition ${currentQuestionIndex === 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border-2'
                            }`}>
                        Previous
                    </button>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Answered: {answeredCount}/{questions.length}
                        </p>
                    </div>

                    {currentQuestionIndex < questions.length - 1 ? (
                        <button
                            onClick={handleNext}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2 ${isSubmitting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                                }`}>
                            <Send className="w-5 h-5" />
                            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentLiveQuizTaking;
