import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import { sampleData } from '../../data/sampleData';

const TeacherAllStudentsPage = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const teacher = sampleData.teachers.find(t => t.email === user.email) || sampleData.teachers[0];

    // Get all students enrolled in teacher's courses
    const teacherCourses = sampleData.courses.filter(c => c.teacher_id === teacher.id);
    const courseIds = teacherCourses.map(c => c.id);
    const enrollments = sampleData.enrollments.filter(e => courseIds.includes(e.course_id));
    const studentIds = [...new Set(enrollments.map(e => e.student_id))];
    const students = sampleData.students.filter(s => studentIds.includes(s.id));

    return (
        <div>
            <Link to="/teacher/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-3 sm:mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">All My Students</h1>

            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                        Total Students: {students.length}
                    </h2>
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Student Name</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Courses Enrolled</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Avg Completion</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Active</th>
                                <th className="text-right py-3 px-4 font-semibold text-gray-700">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => {
                                const studentEnrollments = enrollments.filter(e => e.student_id === student.id);
                                const avgCompletion = Math.round(
                                    studentEnrollments.reduce((sum, e) => sum + e.progress, 0) / studentEnrollments.length
                                );
                                const lastActive = studentEnrollments.sort((a, b) =>
                                    new Date(b.last_active).getTime() - new Date(a.last_active).getTime()
                                )[0]?.last_active || 'N/A';

                                return (
                                    <tr
                                        key={student.id}
                                        className="border-b hover:bg-gray-50 cursor-pointer"
                                        onClick={() => navigate(`/teacher/student/${student.id}`)}
                                    >
                                        <td className="py-3 px-4">
                                            <div className="flex items-center">
                                                <User className="w-5 h-5 mr-2 text-gray-400" />
                                                <span className="font-medium text-gray-800">{student.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">{student.email}</td>
                                        <td className="py-3 px-4 text-gray-600">{studentEnrollments.length} course(s)</td>
                                        <td className="py-3 px-4">
                                            <span className={`font-semibold ${avgCompletion >= 85 ? 'text-green-600' :
                                                avgCompletion >= 70 ? 'text-yellow-600' :
                                                    'text-red-600'
                                                }`}>
                                                {avgCompletion}%
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">{lastActive}</td>
                                        <td className="py-3 px-4 text-right">
                                            <button className="text-blue-600 hover:text-blue-700 font-semibold">
                                                View Details →
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card Layout */}
                <div className="sm:hidden space-y-3">
                    {students.map(student => {
                        const studentEnrollments = enrollments.filter(e => e.student_id === student.id);
                        const avgCompletion = Math.round(
                            studentEnrollments.reduce((sum, e) => sum + e.progress, 0) / studentEnrollments.length
                        );
                        const lastActive = studentEnrollments.sort((a, b) =>
                            new Date(b.last_active).getTime() - new Date(a.last_active).getTime()
                        )[0]?.last_active || 'N/A';

                        return (
                            <div
                                key={student.id}
                                onClick={() => navigate(`/teacher/student/${student.id}`)}
                                className="bg-gray-50 p-4 rounded-lg border hover:bg-gray-100 active:bg-gray-200 transition"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center">
                                        <User className="w-5 h-5 mr-2 text-gray-400" />
                                        <p className="font-semibold text-gray-800">{student.name}</p>
                                    </div>
                                    <span className={`text-sm font-semibold ${avgCompletion >= 85 ? 'text-green-600' :
                                        avgCompletion >= 70 ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                        {avgCompletion}%
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mb-1">{student.email}</p>
                                <p className="text-sm text-gray-600 mb-1">{studentEnrollments.length} course(s) enrolled</p>
                                <p className="text-xs text-gray-500">Last active: {lastActive}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TeacherAllStudentsPage;
