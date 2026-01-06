import { Target, Trophy, Flame, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuggestedActions = () => {
    const navigate = useNavigate();

    const suggestions = [
        {
            id: 1,
            icon: <Flame className="w-5 h-5" />,
            text: "Build your streak to 7 days for Week Warrior badge!",
            action: "Check Progress",
            color: "from-orange-500 to-red-500",
            onClick: () => navigate('/student/badges')
        },
        {
            id: 2,
            icon: <Target className="w-5 h-5" />,
            text: "Complete 1 more daily challenge for bonus rewards!",
            action: "View Challenges",
            color: "from-blue-500 to-purple-500",
            onClick: () => navigate('/student/challenges')
        },
        {
            id: 3,
            icon: <Trophy className="w-5 h-5" />,
            text: "You're 200 credits from top 10 - one quiz away!",
            action: "See Leaderboard",
            color: "from-green-500 to-emerald-500",
            onClick: () => navigate('/student/leaderboard')
        }
    ];

    return (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-sm text-gray-800">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
                {suggestions.map(suggestion => (
                    <button
                        key={suggestion.id}
                        onClick={suggestion.onClick}
                        className={`flex flex-col items-center gap-2 bg-white hover:shadow-lg transition p-4 rounded-xl border border-gray-200`}
                    >
                        <div className={`bg-gradient-to-r ${suggestion.color} text-white p-2.5 rounded-lg`}>
                            {suggestion.icon}
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold text-gray-800 mb-1">{suggestion.action}</p>
                            <p className="text-xs text-gray-600">{suggestion.text}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SuggestedActions;
