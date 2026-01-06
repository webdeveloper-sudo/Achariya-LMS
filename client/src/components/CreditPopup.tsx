import { useEffect, useState } from 'react';
import { X, Award } from 'lucide-react';

interface CreditPopupProps {
    credits: number;
    message: string;
    onClose: () => void;
    streak?: number;
}

const CreditPopup = ({ credits, message, onClose, streak }: CreditPopupProps) => {
    const [show, setShow] = useState(true);

    useEffect(() => {
        // Auto-dismiss after 3 seconds
        const timer = setTimeout(() => {
            setShow(false);
            setTimeout(onClose, 300); // Wait for fade-out animation
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const handleClose = () => {
        setShow(false);
        setTimeout(onClose, 300);
    };

    return (
        <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-2xl p-4 min-w-[300px]">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Award className="w-6 h-6 animate-bounce" />
                        <h3 className="font-bold text-lg">+{credits} Credit{credits > 1 ? 's' : ''}!</h3>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-white/80 hover:text-white transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-white/90 text-sm mb-3">{message}</p>

                {streak && streak > 0 && (
                    <div className="bg-white/20 rounded-lg p-2 mb-2">
                        <p className="text-sm font-semibold">🔥 {streak} Day Streak!</p>
                    </div>
                )}

                <a
                    href="/student/wallet"
                    className="text-sm text-white hover:underline inline-block"
                >
                    View Wallet →
                </a>
            </div>
        </div>
    );
};

export default CreditPopup;
