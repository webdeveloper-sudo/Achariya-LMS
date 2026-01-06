import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { sampleData } from '../../data/sampleData';

const PrincipalAllTeachers = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const schoolId = user.email?.includes('college') ? 2 : 1;
    const teachers = sampleData.teachers.filter(t => t.school_id === schoolId);

    return (
        <div>
            <Link to="/principal/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold text-gray-800 mb-6">All Teachers</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teachers.map((teacher) => (
                    <div key={teacher.id} className="bg-white rounded-xl shadow-sm p-6 border">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{teacher.name}</h3>
                        <p className="text-sm text-gray-600 mb-4">{teacher.email}</p>
                        <p className="text-sm text-gray-700 mb-4"><strong>Department:</strong> {teacher.department}</p>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600">{teacher.courses}</p>
                                <p className="text-xs text-gray-600">Courses</p>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">{teacher.students}</p>
                                <p className="text-xs text-gray-600">Students</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center text-sm">
                            <div>
                                <p className="font-semibold text-gray-800">{teacher.completion_avg}%</p>
                                <p className="text-xs text-gray-500">Avg Completion</p>
                            </div>
                            <div>
                                <p className="font-semibold text-yellow-600">{teacher.badges}</p>
                                <p className="text-xs text-gray-500">Badges</p>
                            </div>
                            <div>
                                <p className="font-semibold text-purple-600">{teacher.credits}</p>
                                <p className="text-xs text-gray-500">Credits</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PrincipalAllTeachers;
