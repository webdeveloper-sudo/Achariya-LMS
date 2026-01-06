// Live Quiz Results Page - Leaderboard & Item Analysis
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, TrendingDown, Download, ArrowLeft } from 'lucide-react';
import BackButton from '../../components/BackButton';
import type { LiveQuizAttempt } from '../../services/liveQuizService';

const LiveQuizResults = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'leaderboard' | 'analysis'>('leaderboard');
    const [attempts, setAttempts] = useState<LiveQuizAttempt[]>([]);

    // Mock data for demo
    const mockAttempts: LiveQuizAttempt[] = [
        { id: '1', sessionId: sessionId || '', studentId: '1', studentName: 'Aisha Khan', score: 10, timeTakenMs: 75000, submitTime: {} as any, isLate: false, answers: [], questionOrder: [], optionOrders: [] },
        { id: '2', sessionId: sessionId || '', studentId: '2', studentName: 'Vikram Joshi', score: 10, timeTakenMs: 102000, submitTime: {} as any, isLate: false, answers: [], questionOrder: [], optionOrders: [] },
        { id: '3', sessionId: sessionId || '', studentId: '3', studentName: 'Rahul Patel', score: 9, timeTakenMs: 90000, submitTime: {} as any, isLate: false, answers: [], questionOrder: [], optionOrders: [] },
        { id: '4', sessionId: sessionId || '', studentId: '4', studentName: 'Divya Menon', score: 9, timeTakenMs: 115000, submitTime: {} as any, isLate: false, answers: [], questionOrder: [], optionOrders: [] },
        { id: '5', sessionId: sessionId || '', studentId: '5', studentName: 'Karthik Balan', score: 8, timeTakenMs: 80000, submitTime: {} as any, isLate: false, answers: [], questionOrder: [], optionOrders: [] },
        { id: '6', sessionId: sessionId || '', studentId: '6', studentName: 'Priya Sharma', score: 8, timeTakenMs: 95000, submitTime: {} as any, isLate: false, answers: [], questionOrder: [], optionOrders: [] },
        { id: '7', sessionId: sessionId || '', studentId: '7', studentName: 'Rohan Kumar', score: 7, timeTakenMs: 110000, submitTime: {} as any, isLate: false, answers: [], questionOrder: [], optionOrders: [] },
        { id: '8', sessionId: sessionId || '', studentId: '8', studentName: 'Sneha Reddy', score: 7, timeTakenMs: 105000, submitTime: {} as any, isLate: false, answers: [], questionOrder: [], optionOrders: [] },
        { id: '9', sessionId: sessionId || '', studentId: '9', studentName: 'Arjun Nair', score: 6, timeTakenMs: 118000, submitTime: {} as any, isLate: false, answers: [], questionOrder: [], optionOrders: [] },
        { id: '10', sessionId: sessionId || '', studentId: '10', studentName: 'Meera Iyer', score: 6, timeTakenMs: 112000, submitTime: {} as any, isLate: false, answers: [], questionOrder: [], optionOrders: [] },
    ];

    // Mock weak questions for item analysis
    const weakQuestions = [
        { questionId: 7, text: 'What is the discriminant of the quadratic equation?', wrongCount: 18, totalAttempts: 28, correctRate: 36 },
        { questionId: 3, text: 'Solve by completing the square: x² + 6x + 8 = 0', wrongCount: 15, totalAttempts: 28, correctRate: 46 },
        { questionId: 9, text: 'Word problem: A garden has perimeter 50m...', wrongCount: 12, totalAttempts: 28, correctRate: 57 },
    ];

    useEffect(() => {
        // In production, fetch attempts from Firebase
        setAttempts(mockAttempts);
    }, [sessionId]);

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${String(seconds).padStart(2, '0')}`;
    };

    const handleExport = () => {
        // In production, generate CSV
        alert('Export functionality will download CSV with all results');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto p-6">
                <BackButton />

                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-8 mb-6 shadow-xl">
                    <h1 className="text-3xl font-bold mb-2">Quiz Results</h1>
                    <p className="text-xl opacity-90">Quadratic Equations Quiz - Class 8-A</p>
                    <p className="text-lg opacity-75">Completed • {attempts.length} students participated</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('leaderboard')}
                        className={`flex-1 py-4 px-6 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${activeTab === 'leaderboard'
                            ? 'bg-white text-blue-600 shadow-lg'
                            : 'bg-white/50 text-gray-600 hover:bg-white'
                            }`}>
                        <Trophy className="w-5 h-5" />
                        Leaderboard
                    </button>
                    <button
                        onClick={() => setActiveTab('analysis')}
                        className={`flex-1 py-4 px-6 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${activeTab === 'analysis'
                            ? 'bg-white text-blue-600 shadow-lg'
                            : 'bg-white/50 text-gray-600 hover:bg-white'
                            }`}>
                        <TrendingDown className="w-5 h-5" />
                        Item Analysis
                    </button>
                </div>

                {/* Leaderboard Tab */}
                {activeTab === 'leaderboard' && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800">🏆 Top Performers</h2>
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                                <Download className="w-5 h-5" />
                                Export CSV
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Rank</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Student</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Score</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Time Taken</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {attempts.map((attempt, index) => (
                                        <tr key={attempt.id} className={`hover:bg-gray-50 transition ${index < 3 ? 'bg-yellow-50' : ''}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-2xl font-bold ${index === 0 ? 'text-yellow-500' :
                                                        index === 1 ? 'text-gray-400' :
                                                            index === 2 ? 'text-orange-600' :
                                                                'text-gray-300'
                                                        }`}>
                                                        {index + 1}
                                                    </span>
                                                    {index < 3 && <Trophy className={`w-5 h-5 ${index === 0 ? 'text-yellow-500' :
                                                        index === 1 ? 'text-gray-400' :
                                                            'text-orange-600'
                                                        }`} />}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-gray-800">{attempt.studentName}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-lg font-bold text-blue-600">{attempt.score}/10</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-gray-600">{formatTime(attempt.timeTakenMs)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {attempt.isLate ? (
                                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                                                        Late
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                                        On Time
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Item Analysis Tab */}
                {activeTab === 'analysis' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">❌ Weakest Questions (Class Needs Review)</h2>
                            <p className="text-gray-600 mb-6">These questions had the highest error rate. Consider reviewing these topics with the whole class.</p>

                            <div className="space-y-4">
                                {weakQuestions.map((q) => (
                                    <div key={q.questionId} className="border-2 border-red-200 rounded-xl p-6 hover:shadow-lg transition">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                                    <span className="text-xl font-bold text-red-600">Q{q.questionId}</span>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800 mb-2">{q.text}</h3>
                                                <div className="flex items-center gap-6">
                                                    <div>
                                                        <span className="text-sm text-gray-600">Wrong: </span>
                                                        <span className="text-lg font-bold text-red-600">{q.wrongCount}/{q.totalAttempts}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm text-gray-600">Correct Rate: </span>
                                                        <span className={`text-lg font-bold ${q.correctRate < 50 ? 'text-red-600' : 'text-orange-600'}`}>
                                                            {q.correctRate}%
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-3 w-full bg-gray-200 rounded-full h-3">
                                                    <div
                                                        className={`h-3 rounded-full ${q.correctRate < 50 ? 'bg-red-500' : 'bg-orange-500'}`}
                                                        style={{ width: `${q.correctRate}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
                                                Review with Class
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Overall Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-gray-600 font-semibold mb-2">Average Score</h3>
                                <p className="text-4xl font-bold text-blue-600">
                                    {(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length).toFixed(1)}/10
                                </p>
                            </div>
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-gray-600 font-semibold mb-2">Average Time</h3>
                                <p className="text-4xl font-bold text-green-600">
                                    {formatTime(attempts.reduce((sum, a) => sum + a.timeTakenMs, 0) / attempts.length)}
                                </p>
                            </div>
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-gray-600 font-semibold mb-2">Perfect Scores</h3>
                                <p className="text-4xl font-bold text-purple-600">
                                    {attempts.filter(a => a.score === 10).length}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Back to Dashboard Button */}
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => navigate('/teacher/dashboard')}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition font-semibold">
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </button>
                </div>

            </div>
        </div>
    );
};

export default LiveQuizResults;
