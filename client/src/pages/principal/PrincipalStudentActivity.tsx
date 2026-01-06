import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Calendar, Activity } from 'lucide-react';
import { sampleData } from '../../data/sampleData';

const PrincipalStudentActivity = () => {
    // Calculate activity stats
    const weeklyData = [
        { day: 'Monday', active: 85, inactive: 15 },
        { day: 'Tuesday', active: 78, inactive: 22 },
        { day: 'Wednesday', active: 92, inactive: 8 },
        { day: 'Thursday', active: 88, inactive: 12 },
        { day: 'Friday', active: 95, inactive: 5 },
        { day: 'Saturday', active: 42, inactive: 58 },
        { day: 'Sunday', active: 35, inactive: 65 }
    ];

    const totalStudents = sampleData.students.length;
    const avgWeeklyActive = Math.round(weeklyData.reduce((sum, d) => sum + d.active, 0) / weeklyData.length);

    return (
        <div>
            <Link to="/principal/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">Weekly Active Students</h1>
            <p className="text-gray-600 mb-4">Student engagement and activity breakdown</p>

            {/* Key Insights - Moved to Top (FIX FOR ISSUE #13) */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                    Key Insights
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Weekday engagement is consistently high (78-95%)</li>
                    <li>• Friday shows peak student activity at 95%</li>
                    <li>• Weekend activity drops significantly, suggesting need for better weekend content</li>
                    <li>• Wednesday shows a strong mid-week spike at 92%</li>
                </ul>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-xl p-6 text-white">
                    <Activity className="w-12 h-12 mb-3 opacity-80" />
                    <p className="text-sm opacity-90">Total Students</p>
                    <p className="text-4xl font-bold">{totalStudents}</p>
                </div>
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl p-6 text-white">
                    <TrendingUp className="w-12 h-12 mb-3 opacity-80" />
                    <p className="text-sm opacity-90">Avg Weekly Active</p>
                    <p className="text-4xl font-bold">{avgWeeklyActive}%</p>
                </div>
                <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl p-6 text-white">
                    <Calendar className="w-12 h-12 mb-3 opacity-80" />
                    <p className="text-sm opacity-90">Peak Day</p>
                    <p className="text-3xl font-bold">Friday</p>
                </div>
            </div>

            {/* Weekly Breakdown */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Daily Activity Breakdown</h2>

                <div className="space-y-4">
                    {weeklyData.map(day => (
                        <div key={day.day} className="border-b pb-4 last:border-b-0">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-800">{day.day}</span>
                                <div className="text-sm text-gray-600">
                                    <span className="font-semibold text-green-600">{day.active}% Active</span>
                                    {' • '}
                                    <span className="text-gray-500">{day.inactive}% Inactive</span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden flex">
                                <div
                                    className="bg-green-500 flex items-center justify-center text-white text-xs font-semibold"
                                    style={{ width: `${day.active}%` }}
                                >
                                    {day.active > 20 && `${day.active}%`}
                                </div>
                                <div
                                    className="bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-semibold"
                                    style={{ width: `${day.inactive}%` }}
                                >
                                    {day.inactive > 20 && `${day.inactive}%`}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PrincipalStudentActivity;
