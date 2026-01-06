import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { sampleData } from '../../data/sampleData';

const TeacherCourseDetail = () => {
    const { courseId } = useParams();
    const course = sampleData.courses.find(c => c.id === Number(courseId));
    const modules = sampleData.modules.filter(m => m.course_id === Number(courseId));
    const enrollments = sampleData.enrollments.filter(e => e.course_id === Number(courseId));

    const students = enrollments.map(e => {
        const student = sampleData.students.find(s => s.id === e.student_id);
        return { ...student, ...e };
    });

    if (!course) return <div>Course not found</div>;

    return (
        <div>
            <Link to="/teacher/courses" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Courses
            </Link>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">{course.title}</h1>
            <p className="text-gray-600 mb-6">{course.subject} • {course.level}</p>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-4 border text-center">
                    <p className="text-2xl font-bold text-blue-600">{enrollments.length}</p>
                    <p className="text-sm text-gray-600">Enrolled</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border text-center">
                    <p className="text-2xl font-bold text-green-600">{course.completion_avg}%</p>
                    <p className="text-sm text-gray-600">Avg Completion</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border text-center">
                    <p className="text-2xl font-bold text-purple-600">{modules.length}</p>
                    <p className="text-sm text-gray-600">Modules</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border text-center">
                    <p className="text-2xl font-bold text-orange-600">{course.traffic}</p>
                    <p className="text-sm text-gray-600">Traffic</p>
                </div>
            </div>

            {/* Modules */}
            <div className="bg-white rounded-xl shadow-sm p-6 border mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Course Modules</h2>
                <div className="space-y-3">
                    {modules.map((module) => (
                        <div key={module.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-semibold text-gray-800">{module.order}. {module.title}</p>
                            </div>
                            <span className="text-green-600 font-semibold">{module.completion_rate}% complete</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Enrolled Students */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Enrolled Students</h2>
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Student</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Progress</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Modules</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Last Active</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student: any) => (
                            <tr key={student.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4">
                                    <p className="font-semibold text-gray-800">{student.name}</p>
                                    <p className="text-xs text-gray-500">{student.class}</p>
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${student.progress >= 70 ? 'bg-green-500' : 'bg-red-500'}`}
                                                style={{ width: `${student.progress}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-semibold">{student.progress}%</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-center text-sm">{student.modules_completed}/{student.total_modules}</td>
                                <td className="py-3 px-4 text-center text-sm text-gray-600">{student.last_active}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeacherCourseDetail;
