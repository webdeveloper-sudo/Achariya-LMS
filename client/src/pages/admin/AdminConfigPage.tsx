import { Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

const AdminConfigPage = () => {
    return (
        <div>
            <Link to="/admin/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold text-gray-800 mb-6">System Configuration</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quiz Settings */}
                <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Quiz Configuration</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Questions per Quiz
                            </label>
                            <input
                                type="number"
                                defaultValue="15"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Time Limit (seconds)
                            </label>
                            <input
                                type="number"
                                defaultValue="120"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Maximum Attempts
                            </label>
                            <input
                                type="number"
                                defaultValue="3"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Passing Score (%)
                            </label>
                            <input
                                type="number"
                                defaultValue="100"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Credit Configuration */}
                <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Credit Slabs</h2>
                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-2">Fast & Full Performance</h3>
                            <p className="text-sm text-gray-600 mb-2">100% score in ≤60 seconds</p>
                            <input
                                type="number"
                                defaultValue="15"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Credits"
                            />
                        </div>

                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-2">Normal & Full Performance</h3>
                            <p className="text-sm text-gray-600 mb-2">100% score in ≤120 seconds</p>
                            <input
                                type="number"
                                defaultValue="10"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Credits"
                            />
                        </div>

                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-2">Basic Performance</h3>
                            <p className="text-sm text-gray-600 mb-2">Passed but slower</p>
                            <input
                                type="number"
                                defaultValue="2"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                placeholder="Credits"
                            />
                        </div>
                    </div>
                </div>

                {/* Content Completion */}
                <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Content Completion Thresholds</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Video/Audio Completion (%)
                            </label>
                            <input
                                type="number"
                                defaultValue="90"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Content marked complete at this percentage</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Module Unlock Threshold (%)
                            </label>
                            <input
                                type="number"
                                defaultValue="100"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Content completion required to unlock next module</p>
                        </div>
                    </div>
                </div>

                {/* Teacher Settings */}
                <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Teacher Credit Rules</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Evidence Upload Credits
                            </label>
                            <input
                                type="number"
                                defaultValue="50"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Student Achievement Bonus
                            </label>
                            <input
                                type="number"
                                defaultValue="10"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Credits per student scoring 100%</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                    <Save className="w-4 h-4 mr-2" />
                    Save Configuration
                </button>
            </div>
        </div>
    );
};

export default AdminConfigPage;
