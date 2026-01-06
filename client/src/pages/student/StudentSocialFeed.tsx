import { Heart, MessageCircle, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import BackButton from '../../components/BackButton';

const StudentSocialFeed = () => {
    const [feedItems, setFeedItems] = useState([
        { id: 1, user: 'Aisha Khan', avatar: '👩‍🎓', action: 'earned', item: 'Perfect Score badge', type: 'badge', timeAgo: '5 min ago', likes: 12, comments: 3 },
        { id: 2, user: 'Rahul Patel', avatar: '🎓', action: 'reached', item: '30-day streak!', type: 'streak', timeAgo: '1 hour ago', likes: 24, comments: 7 },
        { id: 3, user: 'Vikram Joshi', avatar: '👨‍💻', action: 'completed', item: 'Advanced Mathematics', type: 'course', timeAgo: '2 hours ago', likes: 18, comments: 5 },
        { id: 4, user: 'Your Rival', avatar: '⚔️', action: 'challenged you to', item: 'Quiz Battle', type: 'challenge', timeAgo: '3 hours ago', likes: 8, comments: 2 },
        { id: 5, user: 'Divya Menon', avatar: '📚', action: 'is on top of', item: 'Weekly Leaderboard!', type: 'leaderboard', timeAgo: '5 hours ago', likes: 31, comments: 9 },
        { id: 6, user: 'Karthik Balan', avatar: '💻', action: 'unlocked', item: 'Century Champion badge', type: 'badge', timeAgo: '1 day ago', likes: 45, comments: 12 }
    ]);

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const handleShareAchievement = () => {
        setToastMessage('Achievement shared to feed! 🎉');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleAcceptChallenge = (challengeId: number) => {
        // Remove challenge from feed
        setFeedItems(prev => prev.filter(item => item.id !== challengeId));
        setToastMessage('Challenge accepted! Quiz Battle starting soon ⚔️');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'badge': return '🏆';
            case 'streak': return '🔥';
            case 'course': return '📚';
            case 'challenge': return '⚔️';
            case 'leaderboard': return '👑';
            default: return '🎯';
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'badge': return 'from-yellow-50 to-orange-50 border-yellow-400';
            case 'streak': return 'from-red-50 to-orange-50 border-red-400';
            case 'course': return 'from-green-50 to-emerald-50 border-green-400';
            case 'challenge': return 'from-purple-50 to-pink-50 border-purple-400';
            case 'leaderboard': return 'from-blue-50 to-cyan-50 border-blue-400';
            default: return 'from-gray-50 to-gray-100 border-gray-400';
        }
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
                    <h1 className="text-3xl font-bold text-gray-800">Social Feed</h1>
                    <p className="text-gray-600 mt-1">See what your classmates are achieving</p>
                </div>
                <button
                    onClick={handleShareAchievement}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition transform hover:scale-105">
                    Share Achievement
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-4 border">
                    <p className="text-gray-600 text-sm mb-1">Following</p>
                    <p className="text-3xl font-bold text-blue-600">24</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border">
                    <p className="text-gray-600 text-sm mb-1">Friends</p>
                    <p className="text-3xl font-bold text-green-600">18</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border">
                    <p className="text-gray-600 text-sm mb-1">Shared</p>
                    <p className="text-3xl font-bold text-purple-600">12</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border">
                    <p className="text-gray-600 text-sm mb-1">Likes Received</p>
                    <p className="text-3xl font-bold text-pink-600">156</p>
                </div>
            </div>

            {/* Feed */}
            <div className="space-y-4">
                {feedItems.map(item => (
                    <div key={item.id} className={`bg-gradient-to-r ${getColor(item.type)} border-2 rounded-xl p-6 hover:shadow-lg transition`}>
                        <div className="flex items-start gap-4">
                            <div className="text-5xl">{item.avatar}</div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <p className="font-bold text-gray-800">{item.user}</p>
                                    <span className="text-gray-500">•</span>
                                    <p className="text-sm text-gray-600">{item.timeAgo}</p>
                                </div>
                                <p className="text-gray-700 mb-3">
                                    {item.action} <span className="font-bold text-blue-600">{item.item}</span>
                                </p>
                                <div className="flex items-center gap-6">
                                    <button className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition">
                                        <Heart className="w-5 h-5" />
                                        <span className="font-semibold">{item.likes}</span>
                                    </button>
                                    <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition">
                                        <MessageCircle className="w-5 h-5" />
                                        <span className="font-semibold">{item.comments}</span>
                                    </button>
                                    {item.type === 'challenge' && (
                                        <button
                                            onClick={() => handleAcceptChallenge(item.id)}
                                            className="ml-auto bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition transform hover:scale-105">
                                            Accept Challenge
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="text-4xl">
                                {getIcon(item.type)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Trending */}
            <div className="mt-8 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-4 flexitems-center gap-2">
                    <TrendingUp className="w-6 h-6 inline" />
                    Trending Today
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/20 rounded-lg p-4">
                        <p className="text-3xl mb-2">🔥</p>
                        <p className="font-bold">#30DayStreak</p>
                        <p className="text-sm text-white/80">12 students achieved</p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4">
                        <p className="text-3xl mb-2">🏆</p>
                        <p className="font-bold">#PerfectScore</p>
                        <p className="text-sm text-white/80">8 badges earned today</p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4">
                        <p className="text-3xl mb-2">⚔️</p>
                        <p className="font-bold">#RivalBattles</p>
                        <p className="text-sm text-white/80">15 active challenges</p>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default StudentSocialFeed;
