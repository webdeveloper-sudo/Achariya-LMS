import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Users, Award } from 'lucide-react';
import { sampleData } from '../../data/sampleData';

const PrincipalClassAnalytics = () => {
    // Group enrollments by class/grade
    const classByGrade = sampleData.completionByGrade.map(grade => {
        const gradeStudents = sampleData.students.filter(s => s.class === grade.grade);
        const gradeEnrollments = sampleData.enrollments.filter(e =>
            gradeStudents.some(s => s.id === e.student_id)
        );

        const avgCompletion = gradeEnrollments.length > 0
            ? Math.round(gradeEnrollments.reduce((sum, e) => sum + e.progress, 0) / gradeEnrollments.length)
            : 0;

        return {
            ...grade,
            studentCount: gradeStudents.length,
            avgCompletion,
            highPerformers: gradeEnrollments.filter(e => e.progress >= 85).length,
            needsAttention: gradeEnrollments.filter(e => e.progress < 70).length
        };
    });

    // Calculate overall average safely
    const overallAvg = classByGrade.length > 0
        ? Math.round(classByGrade.reduce((sum, g) => sum + (g.completion || 0), 0) / classByGrade.length)
        : 0;

    return (
        <div>
            <Link to="/principal/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold text-gray-800 mb-4">Class Analytics - Completion by Grade</h1>

            {/* Overall School Performance - Moved to Top (FIX FOR ISSUE #12) */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-800 mb-2">Overall School Performance</h3>
                <p className="text-gray-600 text-sm">
                    Average completion across all grades: <span className="font-bold text-blue-600 text-lg">
                        {overallAvg}%
                    </span>
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {classByGrade.map(grade => (
                    <div key={grade.grade} className="bg-white rounded-xl shadow-sm p-6 border">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-bold text-gray-800">{grade.grade}</h3>
                            <div className="text-right">
                                <p className="text-4xl font-bold text-blue-600">{grade.completion || 0}%</p>
                                <p className="text-xs text-gray-500">Completion Rate</p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 flex items-center">
                                    <Users className="w-4 h-4 mr-2" />
                                    Total Students
                                </span>
                                <span className="font-semibold text-gray-800">{grade.studentCount}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Avg Completion</span>
                                <span className="font-semibold text-gray-800">{grade.avgCompletion}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-green-600 flex items-center">
                                    <Award className="w-4 h-4 mr-2" />
                                    High Performers
                                </span>
                                <span className="font-semibold text-green-600">{grade.highPerformers}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-red-600 flex items-center">
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    Needs Attention
                                </span>
                                <span className="font-semibold text-red-600">{grade.needsAttention}</span>
                            </div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                            <div
                                className={`h-3 rounded-full transition-all ${(grade.completion || 0) >= 85 ? 'bg-green-500' :
                                    (grade.completion || 0) >= 70 ? 'bg-yellow-500' :
                                        'bg-red-500'
                                    }`}
                                style={{ width: `${grade.completion || 0}%` }}
                            />
                        </div>

                        <p className="text-xs text-gray-500 text-center">{grade.completion || 0}% Complete</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PrincipalClassAnalytics;
