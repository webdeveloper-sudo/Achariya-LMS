// Live Quiz Control Dashboard  
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, CheckCircle, Clock, StopCircle, AlertCircle } from 'lucide-react';
import LiveQuizTimer from '../../components/LiveQuizTimer';
import BackButton from '../../components/BackButton';
import { endQuizSession } from '../../services/liveQuizService';
import type { LiveQuizSession } from '../../services/liveQuizService';

const LiveQuizControl = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();

    const [session, setSession] = useState<LiveQuizSession | null>(null);
    const [sessionEndTime, setSessionEndTime] = useState<Date | null>(null);
    const [submittedCount, setSubmittedCount] = useState(0);
    const [connectedCount, setConnectedCount] = useState(0);
    const [loadError, setLoadError] = useState<string | null>(null);

    // Fetch actual session from Firebase
    useEffect(() => {
        console.log('🔍 LiveQuizControl mounted, sessionId:', sessionId);

        if (!sessionId) {
            console.error('❌ No sessionId in URL params');
            setLoadError('No session ID provided');
            return;
        }

        console.log('📡 Fetching session from Firebase...');
        import('../../services/liveQuizService').then(({ getSessionById }) => {
            getSessionById(sessionId)
                .then((firebaseSession) => {
                    if (firebaseSession) {
                        console.log('✅ Teacher loaded session from Firebase:', firebaseSession);
                        setSession(firebaseSession);
                        setSessionEndTime(firebaseSession.endTime.toDate());
                    } else {
                        console.error('❌ Session not found:', sessionId);
                        setLoadError(`Session ${sessionId} not found`);
                    }
                })
                .catch((error) => {
                    console.error('❌ Error loading session:', error);
                    setLoadError(`Error: ${error.message}`);
                });
        }).catch((error) => {
            console.error('❌ Error importing liveQuizService:', error);
            setLoadError(`Import error: ${error.message}`);
        });
    }, [sessionId]);

    // Simulate students joining and submitting (must be BEFORE conditional returns)
    useEffect(() => {
        if (!session) return; // Don't run if session not loaded yet

        const connectInterval = setInterval(() => {
            setConnectedCount(prev => {
                const newCount = Math.min(prev + Math.floor(Math.random() * 3), session.totalStudents || 30);
                return newCount;
            });
        }, 2000);

        const submitInterval = setInterval(() => {
            setSubmittedCount(prev => {
                const newCount = Math.min(prev + 1, session.totalStudents || 30);
                return newCount;
            });
        }, 3000);

        return () => {
            clearInterval(connectInterval);
            clearInterval(submitInterval);
        };
    }, [session]);

    // Show error if loading failed
    if (loadError) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <p className="text-red-600 font-bold mb-2">Error Loading Quiz</p>
                    <p className="text-gray-600">{loadError}</p>
                    <button
                        onClick={() => navigate('/teacher/dashboard')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Wait for session to load
    if (!session || !sessionEndTime) {
        console.log('⏳ Waiting for session to load...');
        return <div className="flex items-center justify-center h-screen">Loading quiz session...</div>;
    }

    const handleEndQuiz = (e: React.MouseEvent) => {
        console.log('🛑 End Quiz button clicked');
        e.preventDefault();
        e.stopPropagation();

        // IMMEDIATE ALERT TEST
        alert('Button clicked! SessionId: ' + sessionId);

        console.log('📋 Session ID:', sessionId);

        if (!sessionId) {
            console.error('❌ No sessionId - cannot end quiz');
            alert('Error: No session ID found. Cannot end quiz.');
            return;
        }

        console.log('💬 Showing confirm dialog...');
        const confirmed = window.confirm('Are you sure you want to end the quiz early? Students who haven\'t submitted will be automatically submitted.');
        console.log('✅ User confirmed:', confirmed);

        if (confirmed) {
            console.log('🔥 Calling endQuizSession with ID:', sessionId);
            endQuizSession(sessionId)
                .then(() => {
                    console.log('✅ Quiz ended successfully, navigating to results...');
                    navigate(`/teacher/live-quiz/${sessionId}/results`);
                })
                .catch((error) => {
                    console.error('❌ Error ending quiz:', error);
                    alert(`Failed to end quiz: ${error.message || 'Unknown error'}`);
                });
        } else {
            console.log('❌ User cancelled');
        }
    };


    const handleTimeUp = () => {
        // Quiz time is up, redirect to results
        navigate(`/teacher/live-quiz/${sessionId}/results`);
    };

    const progressPercentage = session.totalStudents
        ? Math.round((submittedCount / session.totalStudents) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto p-6">
                <BackButton />

                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl p-8 mb-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                        <h1 className="text-3xl font-bold">LIVE QUIZ IN PROGRESS</h1>
                    </div>
                    <p className="text-xl opacity-90">{session.quizTitle}</p>
                    <p className="text-lg opacity-75">{session.className}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Timer Card - STICKY */}
                    <div className="sticky top-0 z-50 bg-white rounded-xl shadow-lg p-6 border-2 border-red-200">
                        <h2 className="text-gray-600 font-semibold mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Time Remaining
                        </h2>
                        <LiveQuizTimer
                            endTime={sessionEndTime}
                            onTimeUp={handleTimeUp}
                        />
                    </div>

                    {/* Connected Students Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-gray-600 font-semibold mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Connected Students
                        </h2>
                        <div className="text-4xl font-bold text-blue-600 mb-2">
                            {connectedCount} / {session.totalStudents || connectedCount || 30}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${(connectedCount / (session.totalStudents || 1)) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Submitted Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-gray-600 font-semibold mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Submitted
                        </h2>
                        <div className="text-4xl font-bold text-green-600 mb-2">
                            {submittedCount} / {connectedCount}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Not Connected Students Alert */}
                {connectedCount < (session.totalStudents || 0) && (
                    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 mt-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-yellow-800 mb-2">
                                    {(session.totalStudents || 0) - connectedCount} student(s) not connected yet
                                </h3>
                                <p className="text-yellow-700 text-sm">
                                    Students may be having connectivity issues or haven't joined the quiz yet.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Activity Feed */}
                <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Live Activity</h2>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {[...Array(Math.min(5, submittedCount))].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="text-gray-800">
                                    Student {submittedCount - i} submitted their answers
                                </span>
                                <span className="text-sm text-gray-500 ml-auto">
                                    {Math.floor(Math.random() * 60)} seconds ago
                                </span>
                            </div>
                        ))}
                        {submittedCount === 0 && (
                            <p className="text-gray-500 text-center py-8">
                                Waiting for students to submit...
                            </p>
                        )}
                    </div>
                </div>

                {/* End Quiz Button */}
                <div className="mt-6 flex justify-center">
                    <button
                        type="button"
                        onClick={handleEndQuiz}
                        className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition flex items-center gap-3 shadow-lg">
                        <StopCircle className="w-6 h-6" />
                        End Quiz Early
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LiveQuizControl;
