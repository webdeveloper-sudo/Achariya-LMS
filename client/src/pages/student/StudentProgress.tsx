import BackButton from '../../components/BackButton';
import { TrendingUp, BarChart3 } from 'lucide-react';

const StudentProgress = () => {
    // Weekly activity mock data
    const weeklyActivity = [
        { day: 'Mon', completion: 85, quizzes: 3, timeSpent: 120 },
        { day: 'Tue', completion: 92, quizzes: 4, timeSpent: 145 },
        { day: 'Wed', completion: 78, quizzes: 2, timeSpent: 95 },
        { day: 'Thu', completion: 95, quizzes: 5, timeSpent: 160 },
        { day: 'Fri', completion: 88, quizzes: 3, timeSpent: 130 },
        { day: 'Sat', completion: 70, quizzes: 2, timeSpent: 85 },
        { day: 'Sun', completion: 82, quizzes: 3, timeSpent: 110 }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <BackButton />

            <h1 className="text-3xl font-bold text-gray-800 mb-8">📊 My Progress</h1>

            {/* Weekly Activity Graph */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart3 className="w-7 h-7 text-blue-600" />
                        Weekly Activity
                    </h2>
                    <div className="text-sm text-gray-600">
                        <TrendingUp className="w-5 h-5 inline mr-1 text-green-600" />
                        +15% from last week
                    </div>
                </div>

                {/* Line Graph */}
                <div className="relative h-48 mb-4 mt-6">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 w-8">
                        <span>100%</span>
                        <span>75%</span>
                        <span>50%</span>
                        <span>25%</span>
                        <span>0%</span>
                    </div>

                    {/* Graph area */}
                    <div className="ml-10 h-full relative bg-gray-50 rounded-xl p-4">
                        <svg className="w-full h-full" viewBox="0 0 700 180" preserveAspectRatio="none">
                            {/* Grid lines */}
                            <line x1="0" y1="45" x2="700" y2="45" stroke="#e5e7eb" strokeWidth="1" />
                            <line x1="0" y1="90" x2="700" y2="90" stroke="#e5e7eb" strokeWidth="1" />
                            <line x1="0" y1="135" x2="700" y2="135" stroke="#e5e7eb" strokeWidth="1" />

                            {/* Line path */}
                            <path
                                d={`M 50,${180 - (weeklyActivity[0].completion * 1.8)} 
                                    L 150,${180 - (weeklyActivity[1].completion * 1.8)} 
                                    L 250,${180 - (weeklyActivity[2].completion * 1.8)} 
                                    L 350,${180 - (weeklyActivity[3].completion * 1.8)} 
                                    L 450,${180 - (weeklyActivity[4].completion * 1.8)} 
                                    L 550,${180 - (weeklyActivity[5].completion * 1.8)} 
                                    L 650,${180 - (weeklyActivity[6].completion * 1.8)}`}
                                fill="none"
                                stroke="url(#lineGradient)"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* Gradient definition */}
                            <defs>
                                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#8b5cf6" />
                                </linearGradient>
                            </defs>

                            {/* Data points with tooltips */}
                            {weeklyActivity.map((item, idx) => (
                                <g key={idx}>
                                    <circle
                                        cx={50 + idx * 100}
                                        cy={180 - (item.completion * 1.8)}
                                        r="6"
                                        fill="#3b82f6"
                                        stroke="#ffffff"
                                        strokeWidth="2"
                                        className="cursor-pointer hover:r-8 transition-all"
                                    />
                                </g>
                            ))}
                        </svg>

                        {/* Tooltip overlay */}
                        <div className="absolute inset-0 flex items-end">
                            {weeklyActivity.map((item, idx) => (
                                <div key={idx} className="flex-1 flex items-center justify-center relative group">
                                    <div className="absolute bottom-0 transform translate-y-full mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                                        <div className="font-semibold">{item.day}</div>
                                        <div>{item.completion}% completion</div>
                                        <div>{item.quizzes} quizzes</div>
                                        <div>{item.timeSpent} min</div>
                                    </div>
                                    <div className="w-full h-full cursor-pointer"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* X-axis labels */}
                    <div className="ml-10 flex justify-between mt-2 text-xs text-gray-600">
                        {weeklyActivity.map((item, idx) => (
                            <span key={idx} className="flex-1 text-center">{item.day}</span>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-8 text-sm text-gray-600 border-t pt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-t from-blue-600 to-blue-400 rounded"></div>
                        <span>Completion %</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span>Hover for details</span>
                    </div>
                </div>
            </div>

            {/* Existing progress content... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Course Progress */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold mb-4">📚 Course Progress</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-700">Advanced Mathematics</span>
                                <span className="text-blue-600 font-bold">85%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-700">Physics Fundamentals</span>
                                <span className="text-green-600 font-bold">92%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full" style={{ width: '92%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quiz Performance */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold mb-4">🎯 Quiz Performance</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700">Average Score</span>
                            <span className="text-2xl font-bold text-blue-600">92%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700">Quizzes Completed</span>
                            <span className="text-2xl font-bold text-green-600">24</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700">Perfect Scores</span>
                            <span className="text-2xl font-bold text-purple-600">8</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProgress;
