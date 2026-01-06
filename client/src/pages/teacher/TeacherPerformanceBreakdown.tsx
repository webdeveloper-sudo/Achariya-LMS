import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Award } from 'lucide-react';
import { sampleData } from '../../data/sampleData';

const TeacherPerformanceBreakdown = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const teacher = sampleData.teachers.find(t => t.email === user.email) || sampleData.teachers[0];

    const teacherCourses = sampleData.courses.filter(c => c.teacher_id === teacher.id);

    const courseStats = teacherCourses.map(course => {
        const enrollments = sampleData.enrollments.filter(e => e.course_id === course.id);
        const avgCompletion = enrollments.length > 0
            ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
            : 0;

        return {
            ...course,
            enrollments: enrollments.length,
            avgCompletion,
            highPerformers: enrollments.filter(e => e.progress >= 85).length,
            needsAttention: enrollments.filter(e => e.progress < 70).length
        };
    });

    const overallAvg = Math.round(
        courseStats.reduce((sum, c) => sum + c.avgCompletion, 0) / courseStats.length
    );

    return (
        <div>
            <Link to="/teacher/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">Class Performance Breakdown</h1>
            <p className="text-gray-600 mb-6">Overall Average Completion: <span className="font-bold text-2xl text-blue-600">{overallAvg}%</span></p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {courseStats.map(course => (
                    <div key={course.id} className="bg-white rounded-xl shadow-sm p-6 border">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{course.title}</h3>
                                <p className="text-sm text-gray-600">{course.subject} • {course.level}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-bold text-blue-600">{course.avgCompletion}%</p>
                                <p className="text-xs text-gray-500">Avg Completion</p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Total Students:</span>
                                <span className="font-semibold text-gray-800">{course.enrollments}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 flex items-center">
                                    <Award className="w-4 h-4 mr-1 text-green-500" />
                                    High Performers (≥85%):
                                </span>
                                <span className="font-semibold text-green-600">{course.highPerformers}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 flex items-center">
                                    <TrendingUp className="w-4 h-4 mr-1 text-yellow-500" />
                                    Needs Attention (&lt;70%):
                                </span>
                                <span className="font-semibold text-red-600">{course.needsAttention}</span>
                            </div>
                        </div>

                        <div className="mb-2">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-500">Progress</span>
                                <span className="text-gray-500">{course.avgCompletion}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full transition-all ${course.avgCompletion >= 85 ? 'bg-green-500' :
                                        course.avgCompletion >= 70 ? 'bg-yellow-500' :
                                            'bg-red-500'
                                        }`}
                                    style={{ width: `${course.avgCompletion}%` }}
                                />
                            </div>
                        </div>

                        <Link
                            to={`/teacher/course/${course.id}`}
                            className="block text-center mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                        >
                            View Course Details
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeacherPerformanceBreakdown;
