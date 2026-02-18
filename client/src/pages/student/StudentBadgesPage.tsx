import { useState, useEffect } from 'react';
import BackButton from '../../components/BackButton';
import { studentApi } from '../../api';
import { Loader } from 'lucide-react';

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    earned: boolean;
    earnedAt?: string;
    creditReward: number;
    category: string;
}

const StudentBadges = () => {
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBadges = async () => {
            try {
                const res = await studentApi.getBadges();
                if (res.data && res.data.badges) {
                    const mappedBadges = res.data.badges.map((b: any) => ({
                        id: b._id,
                        name: b.name,
                        description: b.description,
                        icon: b.icon,
                        earned: b.isEarned,
                        earnedAt: b.earnedAt,
                        creditReward: b.creditReward,
                        category: b.category || "General"
                    }));
                    setBadges(mappedBadges);
                }
            } catch (error) {
                console.error("Failed to fetch badges:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBadges();
    }, []);

    const categories = Array.from(new Set(badges.map(b => b.category)));
    const earnedCount = badges.filter(b => b.earned).length;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
            <BackButton />
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Your Badges</h1>
                    <p className="text-gray-600 mt-1">Collect achievements as you learn and earn credits!</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-xl shadow-lg w-full md:w-auto text-center">
                    <p className="text-sm font-medium opacity-90">Badges Earned</p>
                    <p className="text-4xl font-bold">{earnedCount}/{badges.length}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 font-medium">Collection Progress</span>
                    <span className="font-bold text-gray-800">{badges.length > 0 ? Math.round((earnedCount / badges.length) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${badges.length > 0 ? (earnedCount / badges.length) * 100 : 0}%` }}
                    />
                </div>
            </div>

            {/* Badges by Category */}
            {categories.length > 0 ? categories.map(category => {
                const categoryBadges = badges.filter(b => b.category === category);
                const categoryEarned = categoryBadges.filter(b => b.earned).length;

                return (
                    <div key={category} className="mb-10">
                        <div className="flex items-center gap-3 mb-5 border-b pb-2">
                            <h2 className="text-2xl font-bold text-gray-800">{category}</h2>
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                {categoryEarned}/{categoryBadges.length} Unlocked
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categoryBadges.map(badge => (
                                <div key={badge.id} className={`relative rounded-xl p-6 border-2 transition-all duration-300 group hover:shadow-lg ${badge.earned
                                    ? 'bg-gradient-to-br from-yellow-50 to-white border-yellow-200 shadow-md'
                                    : 'bg-white border-gray-100 opacity-80'
                                    }`}>
                                    
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`text-5xl p-3 rounded-2xl ${badge.earned ? 'bg-yellow-100' : 'bg-gray-100 grayscale'}`}>
                                            {badge.icon}
                                        </div>
                                        {badge.earned && (
                                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md uppercase">
                                                Earned
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                                        {badge.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4 h-10 line-clamp-2">
                                        {badge.description}
                                    </p>
                                    
                                    <div className="flex items-center justify-between text-xs font-medium text-gray-400 pt-4 border-t border-gray-100">
                                        <span>+{badge.creditReward} Credits</span>
                                        {badge.earned && badge.earnedAt && (
                                            <span>{new Date(badge.earnedAt).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }) : (
                <div className="text-center py-12 text-gray-500">
                    No badges found.
                </div>
            )}
        </div>
    );
};

export default StudentBadges;                                  
//   {badge.earned ? (
//                                         <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
//                                             <CheckCircle className="w-5 h-5" />
//                                             Earned!
//                                         </div>
//                                     ) : badge.progress !== undefined && badge.total !== undefined ? (
//                                         <div>
//                                             <div className="flex justify-between text-xs text-gray-600 mb-1">
//                                                 <span>Progress</span>
//                                                 <span>{badge.progress}/{badge.total}</span>
//                                             </div>
//                                             <div className="w-full bg-gray-300 rounded-full h-2">
//                                                 <div
//                                                     className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
//                                                     style={{ width: `${(badge.progress / badge.total) * 100}%` }}
//                                                 />
//                                             </div>
//                                         </div>
//                                     ) : (
//                                         <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
//                                             <Lock className="w-4 h-4" />
//                                             Locked
//                                         </div>
//                                     )}
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 );
//             })}

//             {/* Next Badge */}
//             <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-6 mt-8">
//                 <h2 className="text-2xl font-bold mb-4">🎯 Next Badge: Hat Trick</h2>
//                 <p className="mb-4">Score 100% on 3 consecutive quizzes. You're 2/3 of the way there!</p>
//                 <div className="w-full bg-white/30 rounded-full h-3 mb-2">
//                     <div className="bg-white h-3 rounded-full" style={{ width: '66%' }} />
//                 </div>
//                 <p className="text-sm text-white/90">One more perfect score to unlock! 🎩</p>
//             </div>
//         </div>
//     );
// };

// export default StudentBadges;
