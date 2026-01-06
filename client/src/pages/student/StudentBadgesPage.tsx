import { Lock, CheckCircle } from 'lucide-react';
import BackButton from '../../components/BackButton';

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    earned: boolean;
    progress?: number;
    total?: number;
    category: string;
}

const StudentBadges = () => {
    const badges: Badge[] = [
        // Learning Achievements
        { id: 'perfect', name: 'Perfect Score', description: 'Score 100% on any quiz', icon: '🎯', earned: true, category: 'Learning' },
        { id: 'hattrick', name: 'Hat Trick', description: 'Score 100% on 3 consecutive quizzes', icon: '🎩', earned: false, progress: 2, total: 3, category: 'Learning' },
        { id: 'quick', name: 'Quick Learner', description: 'Complete module in under 10 minutes', icon: '⚡', earned: true, category: 'Learning' },
        { id: 'marathon', name: 'Marathon Runner', description: 'Study for 2+ hours in one session', icon: '🏃', earned: false, category: 'Learning' },
        { id: 'earlybird', name: 'Early Bird', description: 'Complete quiz before 8am', icon: '🌅', earned: false, category: 'Learning' },
        { id: 'nightowl', name: 'Night Owl', description: 'Study after 10pm', icon: '🦉', earned: true, category: 'Learning' },

        // Milestone Achievements
        { id: 'firststeps', name: 'First Steps', description: 'Complete first module', icon: '👣', earned: true, category: 'Milestones' },
        { id: 'coursemaster', name: 'Course Master', description: 'Complete entire course with 90%+', icon: '🎓', earned: true, category: 'Milestones' },
        { id: 'expert', name: 'Subject Expert', description: 'Complete all courses in one subject', icon: '📚', earned: false, progress: 2, total: 3, category: 'Milestones' },
        { id: 'renaissance', name: 'Renaissance Scholar', description: 'Complete courses in 3+ subjects', icon: '🎨', earned: false, progress: 1, total: 3, category: 'Milestones' },

        // Streak & Engagement
        { id: 'weekwarrior', name: 'Week Warrior', description: '7-day login streak', icon: '🔥', earned: true, category: 'Engagement' },
        { id: 'monthly', name: 'Monthly Master', description: '30-day login streak', icon: '📅', earned: false, progress: 23, total: 30, category: 'Engagement' },
        { id: 'century', name: 'Century Champion', description: '100-day login streak', icon: '💯', earned: false, progress: 23, total: 100, category: 'Engagement' },

        // Special
        { id: 'rich', name: 'Credit Millionaire', description: 'Earn 1000 total credits', icon: '💰', earned: false, progress: 245, total: 1000, category: 'Special' },
        { id: 'collector', name: 'Badge Collector', description: 'Earn 10 badges', icon: '🏆', earned: false, progress: 6, total: 10, category: 'Special' },
        { id: 'helpful', name: 'Helping Hand', description: 'Help 5 classmates', icon: '🤝', earned: false, category: 'Social' }
    ];

    const categories = ['Learning', 'Milestones', 'Engagement', 'Special', 'Social'];
    const earnedCount = badges.filter(b => b.earned).length;

    return (
        <div>
            <BackButton />
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Your Badges</h1>
                    <p className="text-gray-600 mt-1">Collect achievements as you learn</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-xl shadow-lg">
                    <p className="text-sm">Badges Earned</p>
                    <p className="text-4xl font-bold">{earnedCount}/{badges.length}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-xl shadow-sm p-6 border mb-6">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Collection Progress</span>
                    <span className="font-semibold text-gray-800">{Math.round((earnedCount / badges.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${(earnedCount / badges.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Badges by Category */}
            {categories.map(category => {
                const categoryBadges = badges.filter(b => b.category === category);
                const categoryEarned = categoryBadges.filter(b => b.earned).length;

                return (
                    <div key={category} className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">{category}</h2>
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                                {categoryEarned}/{categoryBadges.length}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {categoryBadges.map(badge => (
                                <div key={badge.id} className={`rounded-xl p-6 border-2 transition ${badge.earned
                                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-400 shadow-lg'
                                    : 'bg-gray-50 border-gray-300'
                                    }`}>
                                    <div className="text-center mb-4">
                                        <div className={`text-6xl mb-3 ${badge.earned ? 'animate-bounce' : 'grayscale opacity-50'}`}>
                                            {badge.icon}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-1">{badge.name}</h3>
                                        <p className="text-sm text-gray-600">{badge.description}</p>
                                    </div>

                                    {badge.earned ? (
                                        <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
                                            <CheckCircle className="w-5 h-5" />
                                            Earned!
                                        </div>
                                    ) : badge.progress !== undefined && badge.total !== undefined ? (
                                        <div>
                                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                <span>Progress</span>
                                                <span>{badge.progress}/{badge.total}</span>
                                            </div>
                                            <div className="w-full bg-gray-300 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                                                    style={{ width: `${(badge.progress / badge.total) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                                            <Lock className="w-4 h-4" />
                                            Locked
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* Next Badge */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-6 mt-8">
                <h2 className="text-2xl font-bold mb-4">🎯 Next Badge: Hat Trick</h2>
                <p className="mb-4">Score 100% on 3 consecutive quizzes. You're 2/3 of the way there!</p>
                <div className="w-full bg-white/30 rounded-full h-3 mb-2">
                    <div className="bg-white h-3 rounded-full" style={{ width: '66%' }} />
                </div>
                <p className="text-sm text-white/90">One more perfect score to unlock! 🎩</p>
            </div>
        </div>
    );
};

export default StudentBadges;
