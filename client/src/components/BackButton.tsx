import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BackButton = () => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate('/student/dashboard')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4 transition"
        >
            <Home className="w-4 h-4" />
            Back to Dashboard
        </button>
    );
};

export default BackButton;
