import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { sampleData, getStudentsByCourse } from '../../data/sampleData';

const PrincipalCourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const course = sampleData.courses.find(c => c.id === parseInt(courseId || '0'));
    const students = getStudentsByCourse(parseInt(courseId || '0'));
    const teacher = sampleData.teachers.find(t => t.id === course?.teacher_id);
    const modules = sampleData.modules.filter(m => m.course_id === parseInt(courseId || '0'));

    // Scroll to top when page loads
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!course) {
        return <div>Course not found</div>;
    }

    return (
        <div>
            <Link to="/principal/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-3 sm:mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">{course.title}</h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-6 text-xs sm:text-sm text-gray-600">
                    <span className="font-semibold">{course.subject}</span>
                    <span>•</span>
                    <span>{course.level}</span>
                    <span>•</span>
                    <span>Teacher: {teacher?.name}</span>
                </div>
            </div>

            {/* Course Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border">
                    <p className="text-xs sm:text-sm text-gray-600">Total Enrollments</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">{course.enrollments}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <p className="text-sm text-gray-600">Active Students</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{course.active_users}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <p className="text-sm text-gray-600">Avg Completion</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{course.completion_avg}%</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <p className="text-sm text-gray-600">Traffic Level</p>
                    <p className={`text-2xl font-bold mt-2 ${course.traffic === 'High' ? 'text-orange-600' :
                        course.traffic === 'Medium' ? 'text-blue-600' : 'text-gray-600'
                        }`}>{course.traffic}</p>
                </div>
            </div>

            {/* Modules */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Course Modules</h2>
                <div className="space-y-3">
                    {modules.map((module) => (
                        <div key={module.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-semibold text-gray-800">{module.title}</p>
                                <p className="text-sm text-gray-600">Module {module.order}</p>
                            </div>
                            <div className="flex items-center">
                                <div className="mr-4">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${module.completion_rate}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1 text-right">{module.completion_rate}%</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Enrolled Students */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Enrolled Students</h2>
                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Student</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Class</th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Progress</th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Modules</th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Last Active</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student: any) => (
                                <tr key={student.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        <p className="font-semibold text-gray-800">{student.name}</p>
                                        <p className="text-xs text-gray-500">{student.email}</p>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-600">{student.class}</td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                                                <div
                                                    className="bg-green-600 h-2 rounded-full"
                                                    style={{ width: `${student.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-semibold">{student.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center text-sm">
                                        {student.modules_completed}/{student.total_modules}
                                    </td>
                                    <td className="py-3 px-4 text-center text-sm text-gray-600">
                                        {student.last_active}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <button
                                            onClick={() => navigate(`/principal/student/${student.id}`)}
                                            className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center ml-auto"
                                        >
                                            View Profile
                                            <ChevronRight className="w-4 h-4 ml-1" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card Layout */}
                <div className="sm:hidden space-y-3">
                    {students.map((student: any) => (
                        <div
                            key={student.id}
                            onClick={() => navigate(`/principal/student/${student.id}`)}
                            className="bg-gray-50 p-4 rounded-lg border hover:bg-gray-100 active:bg-gray-200 transition"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="font-semibold text-gray-800">{student.name}</p>
                                    <p className="text-xs text-gray-500">{student.email}</p>
                                </div>
                                <span className="text-sm font-semibold text-green-600">{student.progress}%</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{student.class}</p>
                            <p className="text-sm text-gray-600 mb-2">
                                Modules: {student.modules_completed}/{student.total_modules}
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${student.progress}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500">Last active: {student.last_active}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PrincipalCourseDetail;
