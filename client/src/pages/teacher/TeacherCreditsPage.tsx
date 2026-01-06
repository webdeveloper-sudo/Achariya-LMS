import { Link } from 'react-router-dom';
import { ArrowLeft, Coins, TrendingUp, Award } from 'lucide-react';
import { sampleData } from '../../data/sampleData';

const TeacherCreditsPage = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const teacher = sampleData.teachers.find(t => t.email === user.email) || sampleData.teachers[0];

    const teacherCourses = sampleData.courses.filter(c => c.teacher_id === teacher.id);
    const courseIds = teacherCourses.map(c => c.id);
    const enrollments = sampleData.enrollments.filter(e => courseIds.includes(e.course_id));
    const studentIds = [...new Set(enrollments.map(e => e.student_id))];
    const students = sampleData.students.filter(s => studentIds.includes(s.id));

    // Calculate student credits
    const studentCredits = students.map(student => {
        // Estimate credits from completion (simplified)
        const studentEnrollments = enrollments.filter(e => e.student_id === student.id);
        const avgCompletion = studentEnrollments.length > 0
            ? Math.round(studentEnrollments.reduce((sum, e) => sum + e.progress, 0) / studentEnrollments.length)
            : 0;
        const estimatedCredits = Math.floor(avgCompletion * 1.5) + (student.badges * 20);

        return {
            ...student,
            credits: estimatedCredits,
            badges: student.badges
        };
    }).sort((a, b) => b.credits - a.credits);

    const totalCredits = studentCredits.reduce((sum, s) => sum + s.credits, 0);

    return (
        <div>
            <Link to="/teacher/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold text-gray-800 mb-6">Student Credits Overview</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">Total Credits Distributed</p>
                            <p className="text-4xl font-bold mt-2">{totalCredits.toLocaleString()}</p>
                        </div>
                        <Coins className="w-16 h-16 opacity-50" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">Top Performer</p>
                            <p className="text-2xl font-bold mt-2">{studentCredits[0]?.name.split(' ')[0]}</p>
                            <p className="text-sm mt-1">{studentCredits[0]?.credits} credits</p>
                        </div>
                        <Award className="w-16 h-16 opacity-50" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">Average per Student</p>
                            <p className="text-4xl font-bold mt-2">{Math.round(totalCredits / students.length)}</p>
                        </div>
                        <TrendingUp className="w-16 h-16 opacity-50" />
                    </div>
                </div>
            </div>

            {/* Student Credits Table */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Credits by Student</h2>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Student Name</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                                <th className="text-right py-3 px-4 font-semibold text-gray-700">Credits</th>
                                <th className="text-right py-3 px-4 font-semibold text-gray-700">Badges</th>
                                <th className="text-right py-3 px-4 font-semibold text-gray-700">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentCredits.map((student, index) => (
                                <tr key={student.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                            index === 1 ? 'bg-gray-100 text-gray-700' :
                                                index === 2 ? 'bg-orange-100 text-orange-700' :
                                                    'bg-blue-50 text-blue-600'
                                            }`}>
                                            {index + 1}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 font-medium text-gray-800">{student.name}</td>
                                    <td className="py-3 px-4 text-gray-600 text-sm">{student.email}</td>
                                    <td className="py-3 px-4 text-right">
                                        <span className="font-bold text-yellow-600 flex items-center justify-end">
                                            <Coins className="w-4 h-4 mr-1" />
                                            {student.credits}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <span className="font-semibold text-gray-700">{student.badges}</span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${student.credits >= 100 ? 'bg-green-100 text-green-700' :
                                            student.credits >= 50 ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {student.credits >= 100 ? 'Excellent' :
                                                student.credits >= 50 ? 'Good' : 'Developing'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TeacherCreditsPage;
