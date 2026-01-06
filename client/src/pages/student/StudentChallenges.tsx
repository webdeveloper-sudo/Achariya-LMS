import { CheckCircle, Gift } from 'lucide-react';
import { useState } from 'react';
import BackButton from '../../components/BackButton';

interface Challenge {
    id: string;
    title: string;
    description: string;
    reward: number;
    progress: number;
    total: number;
    icon: string;
    completed: boolean;
}

const StudentChallenges = () => {
    const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');

    const dailyChallenges: Challenge[] = [
        { id: 'd1', title: 'Morning Learner', description: 'Complete a quiz before 12 PM', reward: 10, progress: 1, total: 1, icon: '☀️', completed: true },
        { id: 'd2', title: 'Triple Threat', description: 'Complete 3 modules today', reward: 15, progress: 2, total: 3, icon: '🎯', completed: false },
        { id: 'd3', title: 'Perfect Practice', description: 'Score 100% on any quiz', reward: 20, progress: 0, total: 1, icon: '💯', completed: false },
        { id: 'd4', title: 'Helping Hand', description: 'Answer in discussion forum', reward: 10, progress: 0, total: 1, icon: '🤝', completed: false },
        { id: 'd5', title: 'Speed Demon', description: 'Complete module in under 5 min', reward: 15, progress: 0, total: 1, icon: '⚡', completed: false }
    ];

    const weeklyChallenges: Challenge[] = [
        { id: 'w1', title: 'Course Conqueror', description: 'Complete entire course', reward: 100, progress: 2, total: 3, icon: '👑', completed: false },
        { id: 'w2', title: 'Quiz Master', description: 'Take 10 quizzes this week', reward: 75, progress: 6, total: 10, icon: '🎓', completed: false },
        { id: 'w3', title: 'Streak Keeper', description: 'Login 7 days in a row', reward: 50, progress: 5, total: 7, icon: '🔥', completed: false },
        { id: 'w4', title: 'Top Scorer', description: 'Get 90%+ average on 5 quizzes', reward: 80, progress: 3, total: 5, icon: '⭐', completed: false },
        { id: 'w5', title: 'Early Achiever', description: 'Complete weekly challenges by Friday', reward: 120, progress: 1, total: 4, icon: '🏆', completed: false }
    ];

    const challenges = activeTab === 'daily' ? dailyChallenges : weeklyChallenges;
    const completedCount = challenges.filter(c => c.completed).length;
    const totalRewards = challenges.reduce((sum, c) => c.completed ? sum + c.reward : sum, 0);

    return (
        <div>
            <BackButton />
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Daily Challenges</h1>
                    <p className="text-gray-600 mt-1">Complete challenges to earn bonus credits</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl shadow-lg">
                    <p className="text-sm">Credits Earned Today</p>
                    <p className="text-4xl font-bold">+{totalRewards} ⭐</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('daily')}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition ${activeTab === 'daily'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-white border-2 border-gray-200 text-gray-600'
                        }`}
                >
                    📅 Daily (Resets in 8h 23m)
                </button>
                <button
                    onClick={() => setActiveTab('weekly')}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition ${activeTab === 'weekly'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-white border-2 border-gray-200 text-gray-600'
                        }`}
                >
                    📆 Weekly (Resets in 3d 8h)
                </button>
            </div>

            {/* Progress Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <p className="text-gray-600 text-sm mb-2">Completed</p>
                    <p className="text-3xl font-bold text-green-600">{completedCount}/{challenges.length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <p className="text-gray-600 text-sm mb-2">In Progress</p>
                    <p className="text-3xl font-bold text-blue-600">{challenges.filter(c => !c.completed && c.progress > 0).length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <p className="text-gray-600 text-sm mb-2">Potential Rewards</p>
                    <p className="text-3xl font-bold text-purple-600">{challenges.reduce((sum, c) => !c.completed ? sum + c.reward : sum, 0)} ⭐</p>
                </div>
            </div>

            {/* Challenges List */}
            <div className="space-y-4">
                {challenges.map(challenge => {
                    const progress = (challenge.progress / challenge.total) * 100;

                    return (
                        <div key={challenge.id} className={`rounded-xl p-6 border-2 transition ${challenge.completed
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500'
                            : 'bg-white border-gray-200 hover:shadow-lg'
                            }`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-4">
                                    <div className="text-5xl">{challenge.icon}</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-1">{challenge.title}</h3>
                                        <p className="text-gray-600">{challenge.description}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-lg font-bold">
                                        +{challenge.reward} ⭐
                                    </div>
                                </div>
                            </div>

                            {/* Progress */}
                            <div>
                                {challenge.completed ? (
                                    <div className="flex items-center gap-2 text-green-600 font-semibold">
                                        <CheckCircle className="w-5 h-5" />
                                        Challenge Complete! Reward Claimed
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                                            <span>Progress</span>
                                            <span>{challenge.progress}/{challenge.total}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bonus Challenges */}
            <div className="mt-8 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Gift className="w-6 h-6" />
                    Bonus Challenge Weekend!
                </h2>
                <p className="mb-4">Complete ALL {activeTab} challenges to unlock a special bonus!</p>
                <div className="bg-white/20 rounded-lg p-4">
                    <p className="font-semibold text-lg">🎁 Mystery Reward Box</p>
                    <p className="text-sm text-white/90">Worth 50-200 credits + Exclusive Badge</p>
                </div>
            </div>
        </div>
    );
};

export default StudentChallenges;
