import { Link } from 'react-router-dom';
import { ArrowLeft, Server, Activity, Database, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'; import { sampleData } from '../../data/sampleData';

const AdminSystemMonitoring = () => {
    // Calculate system metrics
    const totalUsers = sampleData.students.length + sampleData.teachers.length + 2;
    const totalCourses = sampleData.courses.length;
    const totalEnrollments = sampleData.enrollments.length;
    const avgCompletion = Math.round(
        sampleData.students.reduce((sum, s) => sum + s.completion, 0) / sampleData.students.length
    );

    // System health metrics
    const systemHealth = {
        apiResponse: 45, // ms
        dbQueries: 23, // ms
        activeConnections: 127,
        memoryUsage: 67, // %
        cpuUsage: 34, // %
        diskUsage: 42 // %
    };

    const recentActivity = [
        { timestamp: '2025-12-11 15:35', event: 'User Login', user: 'Pranav R', type: 'info' },
        { timestamp: '2025-12-11 15:30', event: 'Course Enrollment', user: 'Aisha Khan', type: 'success' },
        { timestamp: '2025-12-11 15:28', event: 'Quiz Submitted', user: 'Arjun S', type: 'success' },
        { timestamp: '2025-12-11 15:25', event: 'Evidence Uploaded', user: 'Hari Krishnan', type: 'info' },
        { timestamp: '2025-12-11 15:20', event: 'Failed Login Attempt', user: 'Unknown', type: 'warning' }
    ];

    return (
        <div>
            <Link to="/admin/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold text-gray-800 mb-6">System Monitoring</h1>

            {/* System Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                        <span className="px-3 py-1 bg-green-500 text-white text-sm rounded-full">Healthy</span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1">System Status</h3>
                    <p className="text-sm text-gray-600">All services operational</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                        <Activity className="w-10 h-10 text-blue-600" />
                        <span className="text-3xl font-bold text-blue-600">{totalUsers}</span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1">Active Users</h3>
                    <p className="text-sm text-gray-600">Currently online: {systemHealth.activeConnections}</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                        <TrendingUp className="w-10 h-10 text-purple-600" />
                        <span className="text-3xl font-bold text-purple-600">{avgCompletion}%</span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1">Avg Completion</h3>
                    <p className="text-sm text-gray-600">Across all courses</p>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-xl shadow-sm p-6 border mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Performance Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">API Response Time</span>
                            <span className="text-sm font-bold text-green-600">{systemHealth.apiResponse}ms</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Excellent</p>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Database Queries</span>
                            <span className="text-sm font-bold text-green-600">{systemHealth.dbQueries}ms</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Excellent</p>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Active Connections</span>
                            <span className="text-sm font-bold text-blue-600">{systemHealth.activeConnections}</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Normal</p>
                    </div>
                </div>
            </div>

            {/* Resource Usage */}
            <div className="bg-white rounded-xl shadow-sm p-6 border mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Resource Usage</h2>
                <div className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">CPU Usage</span>
                            <span className="text-sm font-bold text-gray-800">{systemHealth.cpuUsage}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-3">
                            <div className="bg-green-500 h-3 rounded-full" style={{ width: `${systemHealth.cpuUsage}%` }}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Memory Usage</span>
                            <span className="text-sm font-bold text-gray-800">{systemHealth.memoryUsage}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-3">
                            <div className="bg-yellow-500 h-3 rounded-full" style={{ width: `${systemHealth.memoryUsage}%` }}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Disk Usage</span>
                            <span className="text-sm font-bold text-gray-800">{systemHealth.diskUsage}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-3">
                            <div className="bg-green-500 h-3 rounded-full" style={{ width: `${systemHealth.diskUsage}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Log */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
                <div className="space-y-3">
                    {recentActivity.map((activity, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-3">
                                {activity.type === 'info' && <Server className="w-5 h-5 text-blue-500" />}
                                {activity.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                                {activity.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                                <div>
                                    <p className="font-semibold text-gray-800">{activity.event}</p>
                                    <p className="text-sm text-gray-600">{activity.user}</p>
                                </div>
                            </div>
                            <span className="text-xs text-gray-500">{activity.timestamp}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Database Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6 border mt-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Database Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Database className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-800">{totalUsers}</p>
                        <p className="text-sm text-gray-600">Total Users</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Database className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-800">{totalCourses}</p>
                        <p className="text-sm text-gray-600">Total Courses</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Database className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-800">{totalEnrollments}</p>
                        <p className="text-sm text-gray-600">Enrollments</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Database className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-800">{sampleData.modules.length}</p>
                        <p className="text-sm text-gray-600">Total Modules</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSystemMonitoring;
