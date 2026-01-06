import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { sampleData } from '../../data/sampleData';
import { useEffect } from 'react';

const PrincipalAllCourses = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const schoolId = user.email?.includes('college') ? 2 : 1;
    const courses = sampleData.courses.filter(c => c.school_id === schoolId);

    // Scroll to top when page loads
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div>
            <Link to="/principal/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold text-gray-800 mb-6">All Courses</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <Link
                        key={course.id}
                        to={`/principal/course/${course.id}`}
                        className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md transition"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-bold text-gray-800">{course.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${course.traffic === 'High' ? 'bg-orange-100 text-orange-700' :
                                course.traffic === 'Medium' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                {course.traffic}
                            </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">{course.subject} • {course.level}</p>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="text-center p-2 bg-gray-50 rounded">
                                <p className="text-lg font-bold text-gray-800">{course.enrollments}</p>
                                <p className="text-xs text-gray-600">Enrolled</p>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded">
                                <p className="text-lg font-bold text-green-600">{course.completion_avg}%</p>
                                <p className="text-xs text-gray-600">Completion</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <span className="text-blue-600 text-sm font-semibold">View Details →</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default PrincipalAllCourses;
