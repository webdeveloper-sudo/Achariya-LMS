import { useState, useContext } from 'react';
import { X, Check } from 'lucide-react';
import BackButton from '../../components/BackButton';
import { ThemeContext } from '../../contexts/ThemeContext';

interface MarketplaceItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    type: 'theme' | 'avatar' | 'music' | 'certificate';
    icon: string;
}

const StudentMarketplace = () => {
    const { toggleTheme } = useContext(ThemeContext);
    const student = JSON.parse(localStorage.getItem('studentData') || '{}')[1] || { credits: 45 };

    const [showSuccess, setShowSuccess] = useState(false);
    const [purchasedItem, setPurchasedItem] = useState('');

    const items: MarketplaceItem[] = [
        { id: 'theme_light', name: 'Light Theme (Default)', description: 'Clean, bright interface', cost: 0, type: 'theme', icon: '☀️' },
        { id: 'theme_dark', name: 'Dark Theme', description: 'Eye-friendly dark mode', cost: 60, type: 'theme', icon: '🌙' },
        { id: 'theme_colorful', name: 'Colorful Theme', description: 'Vibrant, energetic colors', cost: 30, type: 'theme', icon: '🎨' },
        { id: 'avatar1', name: 'Custom Avatar', description: 'Choose your own profile picture', cost: 50, type: 'avatar', icon: '🖼️' },
        { id: 'music', name: 'Study Music Access', description: 'Lo-fi beats while you learn', cost: 30, type: 'music', icon: '🎵' },
        { id: 'cert_premium', name: 'Premium Certificate', description: 'Enhanced certificate design', cost: 100, type: 'certificate', icon: '📜' }
    ];

    const handlePurchase = (item: MarketplaceItem) => {
        // Handle free light theme
        if (item.id === 'theme_light') {
            toggleTheme('light');
            setPurchasedItem(item.name);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            return;
        }

        if (student.credits >= item.cost) {
            // Deduct credits
            const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');
            studentData[1] = {
                ...studentData[1],
                credits: student.credits - item.cost
            };
            localStorage.setItem('studentData', JSON.stringify(studentData));

            // Save purchase
            const purchases = JSON.parse(localStorage.getItem('marketplace_purchases') || '[]');
            purchases.push({ itemId: item.id, purchasedAt: new Date().toISOString() });
            localStorage.setItem('marketplace_purchases', JSON.stringify(purchases));

            // Instantly apply theme if it's a theme type
            if (item.type === 'theme') {
                if (item.id === 'theme_dark') {
                    toggleTheme('dark');
                } else if (item.id === 'theme_colorful') {
                    toggleTheme('colorful');
                }
            }

            setPurchasedItem(item.name);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }
    };

    const isPurchased = (itemId: string) => {
        const purchases = JSON.parse(localStorage.getItem('marketplace_purchases') || '[]');
        return purchases.some((p: any) => p.itemId === itemId);
    };

    return (
        <div>
            <BackButton />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Credit Marketplace</h1>
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg">
                    <p className="text-sm">Your Balance</p>
                    <p className="text-2xl font-bold">{student.credits || 45} ⭐</p>
                </div>
            </div>

            {/* Success notification */}
            {showSuccess && (
                <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Check className="w-6 h-6 text-green-600" />
                        <div>
                            <p className="font-bold text-green-800">Purchase Successful!</p>
                            <p className="text-sm text-green-700">You bought {purchasedItem}</p>
                        </div>
                    </div>
                    <button onClick={() => setShowSuccess(false)}>
                        <X className="w-5 h-5 text-green-600" />
                    </button>
                </div>
            )}

            {/* Digital Rewards */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Digital Rewards</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {items.map(item => {
                        const purchased = isPurchased(item.id);
                        const canAfford = student.credits >= item.cost;

                        return (
                            <div key={item.id} className={`bg-white rounded-xl shadow-sm p-6 border-2 ${purchased ? 'border-green-500 bg-green-50' : 'border-gray-200'
                                }`}>
                                <div className="text-center mb-4">
                                    <div className="text-6xl mb-3">{item.icon}</div>
                                    <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                                    <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <div className="text-2xl font-bold text-blue-600">{item.cost} ⭐</div>
                                    {purchased ? (
                                        <div className="flex items-center gap-2 text-green-600 font-semibold">
                                            <Check className="w-5 h-5" />
                                            Owned
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handlePurchase(item)}
                                            disabled={!canAfford}
                                            className={`px-6 py-2 rounded-lg font-semibold transition ${canAfford
                                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                }`}
                                        >
                                            {canAfford ? 'Buy' : 'Not Enough'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* School Rewards */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">🏫 School Rewards (500+ Credits)</h2>
                <p className="text-gray-700 mb-4">Unlock real-world rewards with high credit balances!</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4">
                        <p className="font-semibold text-gray-800">📚 Extended Library Hours</p>
                        <p className="text-sm text-gray-600">500 Credits</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                        <p className="font-semibold text-gray-800">🎁 School Merchandise</p>
                        <p className="text-sm text-gray-600">700 Credits</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                        <p className="font-semibold text-gray-800">📖 Book Vouchers</p>
                        <p className="text-sm text-gray-600">600 Credits</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                        <p className="font-semibold text-gray-800">🎓 Priority Registration</p>
                        <p className="text-sm text-gray-600">800 Credits</p>
                    </div>
                </div>
                <p className="text-sm text-amber-700 mt-4">* Requires school approval and availability</p>
            </div>
        </div>
    );
};

export default StudentMarketplace;
