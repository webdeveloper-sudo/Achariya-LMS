import { Swords } from 'lucide-react';
import { useState } from 'react';
import BackButton from '../../components/BackButton';

const StudentRivals = () => {
    const [selectedTab, setSelectedTab] = useState<'active' | 'history'>('active');

    const activeRivals = [
        { id: 1, name: 'Aisha Khan', class: '10-A', avatar: '👩‍🎓', wins: 3, losses: 1, status: 'active', score: '12 vs 8', activity: 'Quiz Battle - Calculus' },
        { id: 2, name: 'Vikram Joshi', class: 'CS Year 2', avatar: '👨‍💻', wins: 2, losses: 2, status: 'active', score: '10 vs 10', activity: 'Quiz Battle - Physics' }
    ];

    const completedRivals = [
        { id: 3, name: 'Rahul Patel', class: '12 Science', avatar: '🎓', result: 'won', score: '95 vs 88', date: '2 days ago' },
        { id: 4, name: 'Divya Menon', class: '10-B', avatar: '📚', result: 'lost', score: '82 vs 90', date: '5 days ago' },
        { id: 5, name: 'Karthik Balan', class: 'CS Year 3', avatar: '💻', result: 'won', score: '100 vs 97', date: '1 week ago' }
    ];

    const [availableStudents, setAvailableStudents] = useState([
        { id: 6, name: 'Sneha Reddy', class: '10-A', avatar: '👩‍🔬', rank: 5 },
        { id: 7, name: 'Arjun Mehta', class: '12 Science', avatar: '🧑‍🎨', rank: 8 },
        { id: 8, name: 'Priya Sharma', class: 'CS Year 2', avatar: '👩‍💼', rank: 12 }
    ]);

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const handleChallenge = (student: any) => {
        setAvailableStudents(prev => prev.filter(s => s.id !== student.id));
        setToastMessage(`Challenge sent to ${student.name}! 🎯`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <div>
            <BackButton />

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-24 right-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-bounce">
                    <p className="font-bold">{toastMessage}</p>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Rivals</h1>
                    <p className="text-gray-600 mt-1">Challenge classmates to 1v1 competitions</p>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-orange-600 text-white px-8 py-4 rounded-xl shadow-lg">
                    <p className="text-sm">Win Rate</p>
                    <p className="text-4xl font-bold">75%</p>
                    <p className="text-xs">5 wins, 2 losses</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setSelectedTab('active')}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition ${selectedTab === 'active'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-white border-2 border-gray-200 text-gray-600'
                        }`}
                >
                    ⚔️ Active Rivals ({activeRivals.length})
                </button>
                <button
                    onClick={() => setSelectedTab('history')}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition ${selectedTab === 'history'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-white border-2 border-gray-200 text-gray-600'
                        }`}
                >
                    📜 History ({completedRivals.length})
                </button>
            </div>

            {selectedTab === 'active' ? (
                <div className="space-y-4 mb-8">
                    {activeRivals.map(rival => (
                        <div key={rival.id} className="bg-white rounded-xl shadow-sm p-6 border-2 border-orange-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-6xl">{rival.avatar}</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">{rival.name}</h3>
                                        <p className="text-sm text-gray-600">{rival.class}</p>
                                        <p className="text-sm text-orange-600 font-semibold mt-1">{rival.activity}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="bg-gradient-to-r from-orange-100 to-red-100 px-6 py-3 rounded-lg mb-2">
                                        <p className="text-2xl font-bold text-orange-600">{rival.score}</p>
                                        <p className="text-xs text-gray-600">Current Score</p>
                                    </div>
                                    <p className="text-sm text-gray-600">Record: {rival.wins}W - {rival.losses}L</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-3 mb-8">
                    {completedRivals.map(rival => (
                        <div key={rival.id} className={`rounded-xl p-6 border-2 ${rival.result === 'won'
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500'
                            : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-500'
                            }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-5xl">{rival.avatar}</div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">{rival.name}</h3>
                                        <p className="text-sm text-gray-600">{rival.class} • {rival.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-3xl font-bold ${rival.result === 'won' ? 'text-green-600' : 'text-red-600'}`}>
                                        {rival.result === 'won' ? '🏆 WIN' : '💔 LOSS'}
                                    </div>
                                    <p className="text-lg font-semibold text-gray-700">{rival.score}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Challenge New Rival */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Swords className="w-6 h-6" />
                    Challenge New Rival
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {availableStudents.map(student => (
                        <div key={student.id} className="bg-white/20 rounded-lg p-4 hover:bg-white/30 transition cursor-pointer">
                            <div className="text-center mb-3">
                                <div className="text-5xl mb-2">{student.avatar}</div>
                                <p className="font-bold">{student.name}</p>
                                <p className="text-sm text-white/80">{student.class}</p>
                                <p className="text-xs text-white/70">Rank #{student.rank}</p>
                            </div>
                            <button
                                onClick={() => handleChallenge(student)}
                                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition transform hover:scale-105">
                                Challenge
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* How It Works */}
            <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">📖 How Rivals Work</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-4xl mb-2">⚔️</div>
                        <p className="font-semibold text-gray-800">1. Challenge</p>
                        <p className="text-sm text-gray-600">Pick a rival and send challenge</p>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl mb-2">🎯</div>
                        <p className="font-semibold text-gray-800">2. Compete</p>
                        <p className="text-sm text-gray-600">Both take same quiz within 24h</p>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl mb-2">🏆</div>
                        <p className="font-semibold text-gray-800">3. Win Rewards</p>
                        <p className="text-sm text-gray-600">Winner gets 25 credits + badge</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentRivals;
