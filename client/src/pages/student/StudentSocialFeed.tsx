import { Heart, MessageCircle, TrendingUp, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';
import BackButton from '../../components/BackButton';
import { studentApi } from '../../api';

const StudentSocialFeed = () => {
    const [feedItems, setFeedItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        fetchFeed();
    }, []);

    const fetchFeed = async () => {
        try {
            const res = await studentApi.getFeed();
            if (res.data && res.data.feed) {
                setFeedItems(res.data.feed);
            }
        } catch (error) {
            console.error("Failed to fetch feed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleShareAchievement = () => {
        setToastMessage('Achievement shared to feed! 🎉');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const getIcon = (verb: string) => {
        switch (verb) {
            case 'EARNED': return '🏆';
            case 'COMPLETED': return '📚';
            case 'WON': return '👑';
            case 'CHALLENGED': return '⚔️';
            case 'JOINED': return '👋';
            default: return '📢';
        }
    };

    const getColor = (verb: string) => {
        switch (verb) {
            case 'EARNED': return 'from-yellow-50 to-orange-50 border-yellow-400';
            case 'WON': return 'from-blue-50 to-cyan-50 border-blue-400';
            case 'COMPLETED': return 'from-green-50 to-emerald-50 border-green-400';
            case 'CHALLENGED': return 'from-purple-50 to-pink-50 border-purple-400';
            default: return 'from-gray-50 to-gray-100 border-gray-400';
        }
    };

    const getTimeAgo = (dateString: string) => {
        const diff = Date.now() - new Date(dateString).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `${minutes} min ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hours ago`;
        return `${Math.floor(hours / 24)} days ago`;
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
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
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition transform hover:scale-105 shadow-md">
                    Share Achievement
                </button>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:grid grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-4 border text-center">
                    <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Following</p>
                    <p className="text-3xl font-bold text-blue-600">24</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border text-center">
                    <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Friends</p>
                    <p className="text-3xl font-bold text-green-600">18</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border text-center">
                    <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Shared</p>
                    <p className="text-3xl font-bold text-purple-600">12</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border text-center">
                    <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Likes</p>
                    <p className="text-3xl font-bold text-pink-600">156</p>
                </div>
            </div>

            {/* Feed */}
            {loading ? (
                 <div className="flex justify-center items-center h-40">
                    <Loader className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : (
                <div className="space-y-4">
                    {feedItems.length === 0 && <p className="text-center text-gray-500 py-10">No recent activity. Be the first to start the trend!</p>}
                    {feedItems.map(item => (
                        <div key={item._id} className={`bg-gradient-to-r ${getColor(item.verb)} border-2 rounded-xl p-6 hover:shadow-lg transition`}>
                            <div className="flex items-start gap-4">
                                <div className="text-4xl">{item.actorId?.avatar || '👤'}</div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-bold text-gray-800">{item.actorName}</p>
                                        <span className="text-gray-400 text-xs">•</span>
                                        <p className="text-xs text-gray-500">{getTimeAgo(item.timestamp)}</p>
                                    </div>
                                    <div className="text-gray-800 text-lg mb-3">
                                        <span className="text-gray-600">{item.verb.toLowerCase()}</span> <span className="font-bold">{item.object}</span> 
                                        {item.targetName && <span className="text-gray-600"> in {item.targetName}</span>}
                                    </div>
                                    
                                    <div className="flex items-center gap-6">
                                        <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition group">
                                            <Heart className="w-5 h-5 group-hover:fill-red-500" />
                                            <span className="font-semibold text-sm">Like</span>
                                        </button>
                                        <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition">
                                            <MessageCircle className="w-5 h-5" />
                                            <span className="font-semibold text-sm">Comment</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="text-4xl opacity-80">
                                    {getIcon(item.verb)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Trending - Static for now */}
            <div className="mt-8 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 inline" />
                    Trending Today
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                        <p className="text-3xl mb-2">🔥</p>
                        <p className="font-bold">#30DayStreak</p>
                        <p className="text-sm text-white/80">12 students achieved</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentSocialFeed;                       