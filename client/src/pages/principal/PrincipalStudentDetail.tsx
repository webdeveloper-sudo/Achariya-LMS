import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Award, Wallet, BookOpen, TrendingUp } from 'lucide-react';
import { getStudentDetails } from '../../data/sampleData';

const PrincipalStudentDetail = () => {
    const { studentId } = useParams();
    const studentData = getStudentDetails(parseInt(studentId || '0'));

    if (!studentData) {
        return <div>Student not found</div>;
    }

    return (
        <div>
            <Link to="/principal/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            {/* Student Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 border mb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">{studentData.name}</h1>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                                <Mail className="w-4 h-4 mr-1" />
                                {studentData.email}
                            </span>
                            <span>•</span>
                            <span>{studentData.class}</span>
                            <span>•</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${studentData.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                {studentData.status}
                            </span>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-1">
                                <Award className="w-8 h-8 text-yellow-600" />
                            </div>
                            <p className="text-xs text-gray-600">Badges</p>
                            <p className="text-lg font-bold text-gray-800">{studentData.badges}</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-1">
                                <Wallet className="w-8 h-8 text-purple-600" />
                            </div>
                            <p className="text-xs text-gray-600">Credits</p>
                            <p className="text-lg font-bold text-gray-800">{studentData.credits}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Overall Completion</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">{studentData.completion}%</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Quiz Average</p>
                            <p className="text-3xl font-bold text-blue-600 mt-2">{studentData.quiz_avg}%</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active Courses</p>
                            <p className="text-3xl font-bold text-purple-600 mt-2">{studentData.courses?.length || 0}</p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <BookOpen className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Enrolled Courses */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Enrolled Courses</h2>
                <div className="space-y-4">
                    {studentData.courses?.map((course: any) => (
                        <div key={course.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className="font-bold text-gray-800">{course.title}</h3>
                                    <p className="text-sm text-gray-600">{course.subject} • {course.level}</p>
                                </div>
                                <span className="text-2xl font-bold text-green-600">{course.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-600 h-2 rounded-full transition-all"
                                    style={{ width: `${course.progress}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PrincipalStudentDetail;
