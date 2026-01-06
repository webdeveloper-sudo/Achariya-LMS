interface StreakWidgetProps {
    currentStreak: number;
    longestStreak: number;
}

const StreakWidget = ({ currentStreak, longestStreak }: StreakWidgetProps) => {
    // Determine next milestone
    const getNextMilestone = () => {
        if (currentStreak < 7) return { target: 7, name: 'Week Warrior' };
        if (currentStreak < 30) return { target: 30, name: 'Monthly Master' };
        if (currentStreak < 100) return { target: 100, name: 'Century Champion' };
        return { target: 100, name: 'Century Champion' };
    };

    const milestone = getNextMilestone();
    const progress = (currentStreak / milestone.target) * 100;

    return (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-3xl animate-pulse">🔥</span>
                    <div>
                        <h3 className="font-bold text-2xl text-amber-900">{currentStreak}</h3>
                        <p className="text-xs text-amber-700">Day Streak</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-amber-600">Best</p>
                    <p className="font-semibold text-amber-900">{longestStreak} days</p>
                </div>
            </div>

            {/* Progress to next milestone */}
            <div className="mb-2">
                <div className="flex justify-between text-xs mb-1 text-amber-700">
                    <span>Next: {milestone.name}</span>
                    <span>{currentStreak}/{milestone.target}</span>
                </div>
                <div className="w-full bg-amber-200 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>
            </div>

            {currentStreak >= 7 && (
                <p className="text-xs text-center text-amber-700 mt-2">
                    🏆 Keep it up! You're on fire!
                </p>
            )}
        </div>
    );
};

export default StreakWidget;
