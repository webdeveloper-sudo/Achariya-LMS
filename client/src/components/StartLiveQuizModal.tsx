// Start Live Quiz Session Modal
import { useState } from 'react';
import { X, Play, Users, Clock } from 'lucide-react';

interface StartLiveQuizModalProps {
    quizTitle: string;
    questionCount: number;
    onStart: (data: {
        classId: string;
        className: string;
        duration: number;
    }) => void;
    onClose: () => void;
}

const StartLiveQuizModal = ({
    quizTitle,
    questionCount,
    onStart,
    onClose
}: StartLiveQuizModalProps) => {
    const [selectedClass, setSelectedClass] = useState('');
    const [duration, setDuration] = useState(120); // default 2 minutes

    // Mock classes - in production, fetch from API based on teacher
    const classes = [
        { id: '8-A', name: 'Class 8-A', studentCount: 30 },
        { id: '8-B', name: 'Class 8-B', studentCount: 28 },
        { id: '9-A', name: 'Class 9-A', studentCount: 32 },
        { id: '10-A', name: 'Class 10-A', studentCount: 25 },
    ];

    const handleStart = () => {
        if (!selectedClass) return;

        const classData = classes.find(c => c.id === selectedClass);
        if (!classData) return;

        onStart({
            classId: selectedClass,
            className: classData.name,
            duration: duration,
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Play className="w-6 h-6" />
                            Start Live Quiz Session
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 rounded-lg p-2 transition">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Quiz Info */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <h3 className="font-bold text-gray-800">{quizTitle}</h3>
                        <div className="text-sm text-gray-600">
                            <p>Questions: {questionCount}</p>
                            <p>Randomization: Enabled ✓</p>
                        </div>
                    </div>

                    {/* Class Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Select Class
                        </label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none transition">
                            <option value="">Choose a class...</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name} ({cls.studentCount} students)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Duration Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Quiz Duration
                        </label>
                        <select
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none transition">
                            <option value={60}>1 minute (Quick)</option>
                            <option value={120}>2 minutes (Standard)</option>
                            <option value={180}>3 minutes (Extended)</option>
                            <option value={300}>5 minutes (Long)</option>
                        </select>
                    </div>

                    {/* Warning */}
                    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                            ⚠️ <strong>Note:</strong> Once started, all students in the selected class will see the quiz alert immediately. The quiz will auto-end after the selected duration.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition">
                        Cancel
                    </button>
                    <button
                        onClick={handleStart}
                        disabled={!selectedClass}
                        className={`flex-1 px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${selectedClass
                                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-700 hover:to-orange-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}>
                        <Play className="w-5 h-5" />
                        Start Quiz
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StartLiveQuizModal;
