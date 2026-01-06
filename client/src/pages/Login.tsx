import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import { authApi } from '../api';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const emailLower = email.toLowerCase();

        // Real backend authentication for Admin
        if (emailLower === 'admin@achariya.org') {
            try {
                setLoading(true);
                const data = await authApi.login(email, password);

                // Save token for API client
                localStorage.setItem('token', data.token);

                // Save user with Admin role
                localStorage.setItem(
                    'user',
                    JSON.stringify({
                        email: data.user.email,
                        name: data.user.name || 'Admin',
                        role: data.user.role,
                        selectedRole: data.user.role
                    })
                );

                navigate('/admin/dashboard');
                return;
            } catch (err: any) {
                setError(err?.response?.data?.message || 'Invalid admin credentials');
                setLoading(false);
                return;
            }
        }

        // Demo mode for non-admin roles (unchanged)
        let role = 'Student';
        if (emailLower.includes('principal')) {
            role = 'Principal';
        } else if (
            emailLower.includes('teacher') ||
            emailLower === 'hari@achariya.org' ||
            emailLower === 'meena@achariya.org' ||
            emailLower === 'kumar@achariya.org' ||
            emailLower === 'lakshmi@achariya.org'
        ) {
            role = 'Teacher';
        }

        localStorage.setItem(
            'user',
            JSON.stringify({
                email,
                name: email.split('@')[0],
                selectedRole: role
            })
        );

        const dashboardMap: Record<string, string> = {
            Student: '/student/dashboard',
            Teacher: '/teacher/dashboard',
            Principal: '/principal/dashboard',
            Admin: '/admin/dashboard'
        };

        navigate(dashboardMap[role]);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col items-center justify-center p-4">
            {/* Large Centered Logo */}
            <div className="mb-8 text-center">
                <div className="w-40 h-40 mx-auto mb-4 flex items-center justify-center">
                    <img src="/achariya-logo.jpg" alt="Achariya Logo" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Achariya Learning Portal</h1>
                <p className="text-gray-600 mt-2">Unified Learning Management System</p>
            </div>

            {/* Login Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign In</h2>
                {error && (
                    <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="your.email@achariya.org"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Demo Hint */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-800 mb-2">
                        <strong>Admin:</strong> Use <code>admin@achariya.org</code> / <code>123</code> (real authentication).
                    </p>
                    <ul className="text-xs text-blue-700 space-y-1">
                        <li>• Demo Student: student@achariya.org (any password)</li>
                        <li>• Demo Teacher: teacher@achariya.org (any password)</li>
                        <li>• Demo Principal: principal@achariya.org (any password)</li>
                    </ul>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-gray-500 text-sm">
                <p>© 2025 Achariya Group of Institutions</p>
            </div>
        </div>
    );
};

export default Login;
