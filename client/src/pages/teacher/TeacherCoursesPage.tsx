import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { sampleData } from '../../data/sampleData';

const TeacherCoursesPage = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const teacher = sampleData.teachers.find(t => t.email === user.email) || sampleData.teachers[0];
    const courses = sampleData.courses.filter(c => c.teacher_id === teacher.id);

    return (
        <div>
            <Link to="/teacher/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Teaching Assignments</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course) => {
                    const enrollments = sampleData.enrollments.filter(e => e.course_id === course.id);
                    const modules = sampleData.modules.filter(m => m.course_id === course.id);

                    return (
                        <div key={course.id} className="bg-white rounded-xl shadow-sm p-6 border">
                            <div
                                onClick={() => navigate(`/teacher/course/${course.id}`)}
                                className="cursor-pointer hover:bg-gray-50 -m-6 p-6 rounded-xl transition"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-1">{course.title}</h3>
                                        <p className="text-sm text-gray-600">{course.subject} • {course.level}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${course.traffic === 'High' ? 'bg-orange-100 text-orange-700' :
                                            course.traffic === 'Medium' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                        }`}>
                                        {course.traffic} Traffic
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <p className="text-2xl font-bold text-blue-600">{enrollments.length}</p>
                                        <p className="text-xs text-gray-600">Students</p>
                                    </div>
                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <p className="text-2xl font-bold text-green-600">{course.completion_avg}%</p>
                                        <p className="text-xs text-gray-600">Completion</p>
                                    </div>
                                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                                        <p className="text-2xl font-bold text-purple-600">{modules.length}</p>
                                        <p className="text-xs text-gray-600">Modules</p>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="font-semibold text-gray-700 mb-2">Modules</h4>
                                    <div className="space-y-2">
                                        {modules.map((module) => (
                                            <div key={module.id} className="flex justify-between items-center text-sm">
                                                <span className="text-gray-700">{module.order}. {module.title}</span>
                                                <span className="text-green-600 font-semibold">{module.completion_rate}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TeacherCoursesPage;
