import { Link } from 'react-router-dom';
import { ArrowLeft, Server, Database, Activity, HardDrive, Cpu, Users } from 'lucide-react';

const PrincipalSystemStats = () => {
    const stats = {
        serverHealth: 98,
        databaseSize: 2.4,
        activeUsers: 247,
        totalRequests: 15420,
        avgResponseTime: 245,
        uptime: 99.9
    };

    return (
        <div>
            <Link to="/principal/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold text-gray-800 mb-4">System Statistics</h1>

            {/* System Status Note - Moved to Top (FIX FOR ISSUE #14) */}
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center">
                <Activity className="w-5 h-5 text-green-600 mr-3" />
                <p className="text-sm text-green-700">
                    <strong>All systems operational.</strong> No issues detected in the past 24 hours.
                </p>
            </div>

            {/* Server Health */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-xl p-6 text-white">
                    <Server className="w-12 h-12 mb-3 opacity-80" />
                    <p className="text-sm opacity-90">Server Health</p>
                    <p className="text-4xl font-bold">{stats.serverHealth}%</p>
                    <p className="text-xs opacity-75 mt-2">All systems operational</p>
                </div>

                <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl p-6 text-white">
                    <Database className="w-12 h-12 mb-3 opacity-80" />
                    <p className="text-sm opacity-90">Database Size</p>
                    <p className="text-4xl font-bold">{stats.databaseSize} GB</p>
                    <p className="text-xs opacity-75 mt-2">PostgreSQL 14.5</p>
                </div>

                <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl p-6 text-white">
                    <Users className="w-12 h-12 mb-3 opacity-80" />
                    <p className="text-sm opacity-90">Active Users (24h)</p>
                    <p className="text-4xl font-bold">{stats.activeUsers}</p>
                    <p className="text-xs opacity-75 mt-2">Students & Faculty</p>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-blue-600" />
                        Performance Metrics
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-600">Avg Response Time</span>
                                <span className="font-semibold text-gray-800">{stats.avgResponseTime}ms</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-600">System Uptime</span>
                                <span className="font-semibold text-green-600">{stats.uptime}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.9%' }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-600">API Requests (24h)</span>
                                <span className="font-semibold text-gray-800">{stats.totalRequests.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                        <HardDrive className="w-5 h-5 mr-2 text-green-600" />
                        Resource Usage
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-600 flex items-center">
                                    <Cpu className="w-4 h-4 mr-1" />
                                    CPU Usage
                                </span>
                                <span className="font-semibold text-gray-800">42%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '42%' }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-600">Memory Usage</span>
                                <span className="font-semibold text-gray-800">6.2 / 16 GB</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '39%' }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-600">Disk Space</span>
                                <span className="font-semibold text-gray-800">12.4 / 50 GB</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Info */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
                <h3 className="font-bold text-gray-800 mb-4">System Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Backend</p>
                        <p className="font-semibold text-gray-800">FastAPI 0.104.1</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Frontend</p>
                        <p className="font-semibold text-gray-800">React 18.2.0</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Database</p>
                        <p className="font-semibold text-gray-800">PostgreSQL 14.5</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Hosting</p>
                        <p className="font-semibold text-gray-800">AWS EC2</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrincipalSystemStats;
