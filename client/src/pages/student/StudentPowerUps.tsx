import { Zap, Shield } from 'lucide-react';
import { useState } from 'react';
import BackButton from '../../components/BackButton';

interface PowerUp {
    id: string;
    name: string;
    description: string;
    cost: number;
    duration?: string;
    icon?: string;
    type: 'active' | 'passive' | 'theme';
    owned: number;
    category?: string;
}

const StudentPowerUps = () => {
    const [credits, setCredits] = useState(245);
    const [powerups, setPowerups] = useState<PowerUp[]>([
        { id: 'double', name: '2x Credit Booster', description: 'Earn double credits for 24 hours', cost: 50, duration: '24 hours', icon: '⚡', type: 'active', owned: 2 },
        { id: 'freeze', name: 'Streak Freeze', description: 'Protect your streak for 1 day', cost: 30, duration: '1 day', icon: '🛡️', type: 'passive', owned: 1 },
        { id: 'timer', name: 'Quiz Time Extension', description: '+30 seconds on next quiz', cost: 40, duration: '1 quiz', icon: '⏱️', type: 'active', owned: 0 },
        { id: 'hints', name: 'Smart Hints', description: 'Get 2 hints during quiz', cost: 35, duration: '1 quiz', icon: '💡', type: 'active', owned: 0 },
        { id: 'xp', name: 'XP Multiplier', description: '1.5x experience points', cost: 60, duration: '48 hours', icon: '🚀', type: 'active', owned: 0 },
        { id: 'retry', name: 'Free Retake', description: 'One free quiz retake', cost: 45, duration: '1 quiz', icon: '🔄', type: 'passive', owned: 0 }
    ]);

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const handleBuyPowerUp = (powerupId: string) => {
        const powerup = powerups.find(p => p.id === powerupId);
        if (!powerup || credits < powerup.cost) return;

        // Deduct credits
        setCredits(prev => prev - powerup.cost);

        // Increase owned count
        setPowerups(prev => prev.map(p =>
            p.id === powerupId ? { ...p, owned: p.owned + 1 } : p
        ));

        // Instantly apply theme if it's a theme power-up
        if (powerup.type === 'theme') {
            if (powerupId === 'darkTheme') {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            } else if (powerupId === 'colorfulTheme') {
                document.documentElement.setAttribute('data-theme', 'colorful');
                localStorage.setItem('theme', 'colorful');
            }
        }

        // Show success message
        setToastMessage(`Purchased ${powerup.name}! ✨`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const activePowerUps = [
        { name: '2x Credit Booster', expires: '8h 23m', icon: '⚡' },
        { name: 'Streak Freeze', expires: 'Active', icon: '🛡️' }
    ];

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
                    <h1 className="text-3xl font-bold text-gray-800">Power-Ups</h1>
                    <p className="text-gray-600 mt-1">Temporary boosts to supercharge your learning</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-xl shadow-lg">
                    <p className="text-sm">Credits Available</p>
                    <p className="text-4xl font-bold">{credits} ⭐</p>
                </div>
            </div>

            {/* Active Power-Ups */}
            {activePowerUps.length > 0 && (
                <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-xl p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Zap className="w-6 h-6 text-green-600" />
                        Active Power-Ups
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activePowerUps.map((powerup, idx) => (
                            <div key={idx} className="bg-white rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="text-4xl">{powerup.icon}</div>
                                    <div>
                                        <p className="font-bold text-gray-800">{powerup.name}</p>
                                        <p className="text-sm text-gray-600">Expires: {powerup.expires}</p>
                                    </div>
                                </div>
                                <div className="animate-pulse text-2xl">✨</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Available Power-Ups */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Shop Power-Ups</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {powerups.filter(p => p.type !== 'theme').map(powerup => {
                    const canAfford = credits >= powerup.cost;

                    return (
                        <div key={powerup.id} className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-200 hover:border-purple-400 hover:shadow-lg transition">
                            <div className="text-center mb-4">
                                <div className="text-6xl mb-3">{powerup.icon}</div>
                                <h3 className="text-xl font-bold text-gray-800">{powerup.name}</h3>
                                <p className="text-sm text-gray-600 mt-2">{powerup.description}</p>
                                {powerup.duration && <p className="text-xs text-purple-600 font-semibold mt-1">{powerup.duration}</p>}
                            </div>

                            {powerup.owned > 0 && (
                                <div className="bg-green-100 text-green-700 text-center py-2 rounded-lg mb-3 font-semibold">
                                    Owned: {powerup.owned}
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold text-blue-600">{powerup.cost} ⭐</div>
                                <button
                                    onClick={() => handleBuyPowerUp(powerup.id)}
                                    disabled={!canAfford}
                                    className={`px-6 py-2 rounded-lg font-semibold transition ${canAfford
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    {powerup.owned > 0 ? 'Buy More' : 'Buy'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* How Power-Ups Work */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-4">⚡ Power-Up Guide</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            Active Power-Ups
                        </h3>
                        <p className="text-sm text-white/90">
                            Activate when you need them. Great for quiz battles and challenges. Stack multiple for maximum effect!
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Passive Power-Ups
                        </h3>
                        <p className="text-sm text-white/90">
                            Auto-activate when needed. Streak Freeze protects you if you miss a day. Set it and forget it!
                        </p>
                    </div>
                </div>
                <div className="mt-4 bg-white/20 rounded-lg p-4">
                    <p className="font-semibold">💡 Pro Tip: Stack 2x Credit Booster with challenges for 4xrewards!</p>
                </div>
            </div>
        </div>
    );
};

export default StudentPowerUps;
