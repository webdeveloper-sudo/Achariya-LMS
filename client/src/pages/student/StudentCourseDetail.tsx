import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle, Clock, Award } from 'lucide-react';
import { sampleData } from '../../data/sampleData';
import StudentChatbot from '../../components/StudentChatbot';

const StudentCourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const student = sampleData.students.find(s => s.email === user.email) || sampleData.students[0];

    const course = sampleData.courses.find(c => c.id === Number(courseId));
    const modules = sampleData.modules.filter(m => m.course_id === Number(courseId));
    const enrollment = sampleData.enrollments.find(e => e.student_id === student.id && e.course_id === Number(courseId));

    if (!course) {
        return (
            <div>
                <Link to="/student/courses" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Courses
                </Link>
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <p className="text-red-700">Course not found.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Link to="/student/courses" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to My Courses
            </Link>

            {/* Course Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white mb-6">
                <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                <p className="text-blue-100 mb-4">{course.subject} • {course.level}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                        <p className="text-sm opacity-90">Your Progress</p>
                        <p className="text-3xl font-bold">{enrollment?.progress || 0}%</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                        <p className="text-sm opacity-90">Modules Completed</p>
                        <p className="text-3xl font-bold">{enrollment?.modules_completed || 0} / {modules.length}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                        <p className="text-sm opacity-90">Last Active</p>
                        <p className="text-lg font-semibold">{enrollment?.last_active || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-xl shadow-sm p-6 border mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Course Progress</h2>
                    <span className="text-2xl font-bold text-blue-600">
                        {enrollment?.modules_completed === modules.length ? 100 : (enrollment?.progress || 0)}%
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                        className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${enrollment?.modules_completed === modules.length ? 100 : (enrollment?.progress || 0)}%` }}
                    />
                </div>
            </div>

            {/* Course Modules */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                    Course Modules
                </h2>

                {modules.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No modules available for this course yet.</p>
                ) : (
                    <div className="space-y-3">
                        {modules.map((module) => {
                            const isCompleted = enrollment && enrollment.modules_completed >= module.order;
                            const isUnlocked = enrollment && (module.order === 1 || enrollment.modules_completed >= module.order - 1);

                            return (
                                <div
                                    key={module.id}
                                    className={`p-5 border rounded-lg transition ${isCompleted
                                        ? 'bg-green-50 border-green-200'
                                        : isUnlocked
                                            ? 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                            : 'bg-gray-50 border-gray-200 opacity-60'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center flex-1">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${isCompleted
                                                ? 'bg-green-500'
                                                : isUnlocked
                                                    ? 'bg-blue-500'
                                                    : 'bg-gray-400'
                                                }`}>
                                                {isCompleted ? (
                                                    <CheckCircle className="w-5 h-5 text-white" />
                                                ) : (
                                                    <span className="text-white font-bold">{module.order}</span>
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800 mb-1">{module.title}</h3>
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    <span>
                                                        {isCompleted
                                                            ? 'Completed'
                                                            : isUnlocked
                                                                ? 'Available Now'
                                                                : 'Locked - Complete previous module'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="flex items-center text-sm text-gray-600 mb-2">
                                                <Award className="w-4 h-4 mr-1 text-yellow-500" />
                                                <span>Class Average: {module.completion_rate}%</span>
                                            </div>
                                            {isUnlocked && !isCompleted && (
                                                <div className="space-y-2">
                                                    <button
                                                        onClick={() => navigate(`/student/module/${module.id}`)}
                                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                                                    >
                                                        Start Learning
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/student/quiz/${module.id}`)}
                                                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                                                    >
                                                        Take Quiz
                                                    </button>
                                                </div>
                                            )}
                                            {isCompleted && (
                                                <span className="mt-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold border border-green-300 inline-block">
                                                    ✓ Completed
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Course Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <h3 className="font-bold text-gray-800 mb-3">Course Information</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Subject:</span>
                            <span className="font-semibold text-gray-800">{course.subject}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Level:</span>
                            <span className="font-semibold text-gray-800">{course.level}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Modules:</span>
                            <span className="font-semibold text-gray-800">{modules.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Course Traffic:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${course.traffic === 'High' ? 'bg-orange-100 text-orange-700' :
                                course.traffic === 'Medium' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                {course.traffic}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <h3 className="font-bold text-gray-800 mb-3">Your Statistics</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Enrollment Date:</span>
                            <span className="font-semibold text-gray-800">{enrollment?.last_active || 'Recently'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Completion Rate:</span>
                            <span className={`font-semibold ${(enrollment?.progress || 0) >= 85 ? 'text-green-600' :
                                (enrollment?.progress || 0) >= 70 ? 'text-yellow-600' :
                                    'text-red-600'
                                }`}>
                                {enrollment?.progress || 0}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Modules Completed:</span>
                            <span className="font-semibold text-gray-800">
                                {enrollment?.modules_completed || 0} of {modules.length}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${(enrollment?.progress || 0) >= 70 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {(enrollment?.progress || 0) >= 70 ? 'On Track' : 'Needs Attention'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Chatbot */}
            <StudentChatbot studentId={student.id} studentName={student.name} />
        </div>
    );
};

export default StudentCourseDetail;
