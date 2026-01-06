import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, BookOpen, Award, ChevronRight, Server } from 'lucide-react';
import { sampleData, getTopPerformers, getTopBadgeHolders, getHighTrafficCourses } from '../../data/sampleData';

const PrincipalDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Get school-specific data
    const schoolId = user.email?.includes('college') ? 2 : 1;
    const school = sampleData.schools.find(s => s.id === schoolId);
    const schoolStudents = sampleData.students.filter(s => s.school_id === schoolId);
    const schoolTeachers = sampleData.teachers.filter(t => t.school_id === schoolId);
    const schoolCourses = sampleData.courses.filter(c => c.school_id === schoolId);

    // Calculate metrics
    const totalStudents = schoolStudents.length;
    const totalTeachers = schoolTeachers.length;
    const totalCourses = schoolCourses.length;
    const avgCompletion = Math.round(schoolStudents.reduce((sum, s) => sum + s.completion, 0) / totalStudents);

    // Get top performers
    const topPerformers = getTopPerformers(5).filter(s => s.school_id === schoolId);
    const topBadgeHolders = getTopBadgeHolders(5).filter((u: any) => {
        if (u.type === 'Student') return schoolStudents.some(s => s.id === u.id);
        return schoolTeachers.some(t => t.id === u.id);
    });
    const highTrafficCourses = getHighTrafficCourses().filter(c => c.school_id === schoolId);

    const completionData = sampleData.completionByGrade.filter(g => {
        if (schoolId === 1) return g.grade.includes('10') || g.grade.includes('12');
        return g.grade.includes('CS');
    });

    return (
        <div>
            {/* School Header - Clickable */}
            <div
                onClick={() => navigate(`/principal/school/${schoolId}`)}
                className="mb-4 sm:mb-6 cursor-pointer hover:bg-gray-50 p-3 sm:p-4 rounded-lg transition -m-3 sm:-m-4"
            >
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{school?.name}</h1>
                <p className="text-sm sm:text-base text-gray-600">Principal Dashboard - {school?.location} • Click for details →</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div
                    onClick={() => { navigate('/principal/students'); window.scrollTo(0, 0); }}
                    className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border hover:shadow-md cursor-pointer transition"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-600">Total Students</p>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">{totalStudents}</p>
                        </div>
                        <div className="bg-blue-500 p-3 rounded-lg">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => { navigate('/principal/teachers'); window.scrollTo(0, 0); }}
                    className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md cursor-pointer transition"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Teachers</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{totalTeachers}</p>
                        </div>
                        <div className="bg-green-500 p-3 rounded-lg">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => { navigate('/principal/courses'); window.scrollTo(0, 0); }}
                    className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md cursor-pointer transition"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Courses</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{totalCourses}</p>
                        </div>
                        <div className="bg-purple-500 p-3 rounded-lg">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => { navigate('/principal/system-stats'); window.scrollTo(0, 0); }}
                    className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md cursor-pointer transition"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">System Stats</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{avgCompletion}%</p>
                            <p className="text-xs text-gray-500">Avg Completion</p>
                        </div>
                        <div className="bg-orange-500 p-3 rounded-lg">
                            <Server className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Completion by Class - CLICKABLE */}
                <div
                    onClick={() => { navigate('/principal/class-analytics'); window.scrollTo(0, 0); }}
                    className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md cursor-pointer transition"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Completion by Class</h2>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Click for detailed analytics →</p>
                    <div className="space-y-3">
                        {completionData.map((grade) => (
                            <div key={grade.grade}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-700 font-medium">{grade.grade}</span>
                                    <span className="text-gray-600">{grade.completion}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                                        style={{ width: `${grade.completion}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weekly Active Students - CLICKABLE */}
                <div
                    onClick={() => { navigate('/principal/courses'); window.scrollTo(0, 0); }}
                    className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border hover:shadow-md cursor-pointer transition"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Weekly Active Students</h2>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Click for activity breakdown →</p>
                    <div className="space-y-3">
                        {sampleData.weeklyActivity.slice(0, 4).map((item, idx) => (
                            <div key={idx} className="flex items-center">
                                <span className="w-20 text-sm font-medium text-gray-600">{item.week}</span>
                                <div className="flex-1 mx-4">
                                    <div className="bg-gray-200 rounded-full h-6">
                                        <div
                                            className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2"
                                            style={{ width: `${(item.students / 60) * 100}%` }}
                                        >
                                            <span className="text-xs font-bold text-white">{item.students}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Top 5 Performers */}
                <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Top 5 Performing Students</h2>
                    <div className="space-y-3">
                        {topPerformers.map((student, idx) => (
                            <div
                                key={student.id}
                                onClick={() => { navigate(`/principal/student/${student.id}`); window.scrollTo(0, 0); }}
                                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                            >
                                <div className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-600' : 'bg-blue-100'
                                        }`}>
                                        <span className={`text-sm font-bold ${idx < 3 ? 'text-white' : 'text-blue-600'}`}>
                                            {idx + 1}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{student.name}</p>
                                        <p className="text-xs text-gray-500">{student.class}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-lg font-bold text-green-600 mr-2">{student.completion}%</span>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Badge Holders */}
                <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Top 5 Badge Holders</h2>
                    <div className="space-y-3">
                        {topBadgeHolders.map((user: any) => (
                            <div key={`${user.type}-${user.id}`} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                                        <Award className="w-5 h-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.type} • {user.class || user.department}</p>
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-yellow-600">{user.badges} 🏆</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* High Traffic Courses */}
            <div className="bg-white rounded-xl shadow-sm p-6 border mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">High Traffic Courses</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {highTrafficCourses.map((course) => (
                        <div
                            key={course.id}
                            onClick={() => { navigate(`/principal/course/${course.id}`); window.scrollTo(0, 0); }}
                            className="p-4 border border-orange-200 bg-orange-50 rounded-lg hover:shadow-md cursor-pointer transition"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-bold text-gray-800">{course.title}</h3>
                                <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">High</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{course.subject}</p>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">{course.enrollments} enrolled</span>
                                <span className="font-semibold text-orange-600">{course.active_users} active</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* All Courses Table */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
                <h2 className="text-xl font-bold text-gray-800 mb-4">All Courses</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Course</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Subject</th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Enrollments</th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Completion</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schoolCourses.map((course) => (
                                <tr key={course.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        <p className="font-semibold text-gray-800">{course.title}</p>
                                        <p className="text-xs text-gray-500">{course.level}</p>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-600">{course.subject}</td>
                                    <td className="py-3 px-4 text-center text-sm font-semibold">{course.enrollments}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${course.completion_avg >= 85 ? 'bg-green-100 text-green-700' :
                                            course.completion_avg >= 70 ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {course.completion_avg}%
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <button
                                            onClick={() => navigate(`/principal/course/${course.id}`)}
                                            className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center ml-auto"
                                        >
                                            View Details
                                            <ChevronRight className="w-4 h-4 ml-1" />
                                        </button>
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

export default PrincipalDashboard;
