import { useNavigate } from 'react-router-dom';
import { User, GraduationCap, Users, Settings } from 'lucide-react';

const RoleSelection = () => {
    const navigate = useNavigate();

    const selectRole = (role: string) => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.selectedRole = role;
        localStorage.setItem('user', JSON.stringify(user));

        // Navigate to appropriate dashboard
        const dashboardMap: Record<string, string> = {
            'Student': '/student/dashboard',
            'Teacher': '/teacher/dashboard',
            'Principal': '/principal/dashboard',
            'Admin': '/admin/dashboard'
        };

        navigate(dashboardMap[role]);
    };

    const roles = [
        {
            name: 'Student',
            icon: GraduationCap,
            description: 'Access your courses, quizzes, and wallet',
            color: 'bg-blue-600 hover:bg-blue-700'
        },
        {
            name: 'Teacher',
            icon: User,
            description: 'Manage classes, track student progress',
            color: 'bg-green-600 hover:bg-green-700'
        },
        {
            name: 'Principal',
            icon: Users,
            description: 'View school-wide analytics and reports',
            color: 'bg-purple-600 hover:bg-purple-700'
        },
        {
            name: 'Admin',
            icon: Settings,
            description: 'Manage courses, users, and system config',
            color: 'bg-gray-700 hover:bg-gray-800'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col items-center justify-center p-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Select Your Role</h1>
                <p className="text-gray-600">Choose how you want to access the portal</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
                {roles.map((role) => (
                    <button
                        key={role.name}
                        onClick={() => selectRole(role.name)}
                        className={`${role.color} text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105`}
                    >
                        <role.icon className="w-16 h-16 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">{role.name}</h2>
                        <p className="text-sm opacity-90">{role.description}</p>
                    </button>
                ))}
            </div>

            <button
                onClick={() => navigate('/')}
                className="mt-8 text-gray-600 hover:text-gray-800 text-sm"
            >
                ← Back to Login
            </button>
        </div>
    );
};

export default RoleSelection;
