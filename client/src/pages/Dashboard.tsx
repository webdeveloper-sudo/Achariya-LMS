import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { GraduationCap, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { teacherCourseCompletion, studentCourseProgress } from '../data/completionData';

interface UserData {
    role: 'Principal' | 'Teacher' | 'Student';
    teacherName: string | null;
    studentId: string | null;
}

const Dashboard = () => {
    const navigate = useNavigate();
    const userData: UserData = JSON.parse(localStorage.getItem('user') || '{}');

    // Apply role-based filtering
    const filteredTeacherData = useMemo(() => {
        if (userData.role === 'Teacher' && userData.teacherName) {
            return teacherCourseCompletion.filter(t => t.teacher_name === userData.teacherName);
        }
        return teacherCourseCompletion;
    }, [userData]);

    const filteredStudentData = useMemo(() => {
        if (userData.role === 'Student' && userData.studentId) {
            return studentCourseProgress.filter(s => s.student_id === userData.studentId);
        }
        return studentCourseProgress;
    }, [userData]);

    // Card 1: Overall Teacher Completion
    const overallTeacherCompletion = useMemo(() => {
        const avg = filteredTeacherData.reduce((sum, t) => sum + t.completion_percentage, 0) / filteredTeacherData.length;
        return Math.round(avg);
    }, [filteredTeacherData]);

    // Card 2: Overall Student Completion
    const overallStudentCompletion = useMemo(() => {
        const avg = filteredStudentData.reduce((sum, s) => sum + s.completion_percentage, 0) / filteredStudentData.length;
        return Math.round(avg);
    }, [filteredStudentData]);

    // Card 3: Classes Behind Schedule
    const classesBehindSchedule = useMemo(() => {
        return filteredTeacherData.filter(t => t.behind_schedule_flag).length;
    }, [filteredTeacherData]);

    // Card 4: At Risk Students
    const atRiskStudents = useMemo(() => {
        return filteredStudentData.filter(s => s.at_risk_flag).length;
    }, [filteredStudentData]);

    // Chart 1: Teacher Completion by Grade/Program
    const teacherCompletionByGrade = useMemo(() => {
        const grouped: Record<string, number[]> = {};
        filteredTeacherData.forEach(t => {
            if (!grouped[t.grade_program]) grouped[t.grade_program] = [];
            grouped[t.grade_program].push(t.completion_percentage);
        });
        return Object.entries(grouped).map(([name, values]) => ({
            name,
            value: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
        }));
    }, [filteredTeacherData]);

    // Chart 2: Teacher Completion by Teacher
    const teacherCompletionByTeacher = useMemo(() => {
        const grouped: Record<string, number[]> = {};
        filteredTeacherData.forEach(t => {
            if (!grouped[t.teacher_name]) grouped[t.teacher_name] = [];
            grouped[t.teacher_name].push(t.completion_percentage);
        });
        return Object.entries(grouped).map(([name, values]) => ({
            name,
            value: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
        })).sort((a, b) => b.value - a.value).slice(0, 10);
    }, [filteredTeacherData]);

    // Chart 3: Student Completion by Class
    const studentCompletionByClass = useMemo(() => {
        const grouped: Record<string, { '0-25': number; '25-50': number; '50-75': number; '75-100': number }> = {};
        filteredStudentData.forEach(s => {
            const key = `${s.grade_program} ${s.class_section}`;
            if (!grouped[key]) grouped[key] = { '0-25': 0, '25-50': 0, '50-75': 0, '75-100': 0 };

            if (s.completion_percentage < 25) grouped[key]['0-25']++;
            else if (s.completion_percentage < 50) grouped[key]['25-50']++;
            else if (s.completion_percentage < 75) grouped[key]['50-75']++;
            else grouped[key]['75-100']++;
        });
        return Object.entries(grouped).map(([name, bands]) => ({ name, ...bands })).slice(0, 10);
    }, [filteredStudentData]);

    // Chart 4: On Time vs Delayed Lessons
    const lessonStatusData = useMemo(() => {
        const onTime = filteredTeacherData.reduce((sum, t) => sum + t.on_time_lessons, 0);
        const delayed = filteredTeacherData.reduce((sum, t) => sum + t.delayed_lessons, 0);
        const notStarted = filteredTeacherData.reduce((sum, t) =>
            sum + (t.total_lessons_planned - t.lessons_completed), 0
        );
        return [
            { name: 'On Time', value: onTime },
            { name: 'Delayed', value: delayed },
            { name: 'Not Started', value: notStarted },
        ];
    }, [filteredTeacherData]);

    const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-500 mt-1">
                    {userData.role === 'Principal' && 'Overview of all teachers and students'}
                    {userData.role === 'Teacher' && `Your teaching progress - ${userData.teacherName}`}
                    {userData.role === 'Student' && 'Your learning progress'}
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div
                    onClick={() => navigate('/teacher-completion')}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between mb-3">
                        <GraduationCap className="text-blue-600" size={32} />
                        <span className="text-3xl font-bold text-gray-800">{overallTeacherCompletion}%</span>
                    </div>
                    <h3 className="font-semibold text-gray-800">Overall Teacher Completion</h3>
                    <p className="text-sm text-gray-500 mt-1">Lessons completed vs planned</p>
                </div>

                <div
                    onClick={() => navigate('/student-completion')}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between mb-3">
                        <Users className="text-green-600" size={32} />
                        <span className="text-3xl font-bold text-gray-800">{overallStudentCompletion}%</span>
                    </div>
                    <h3 className="font-semibold text-gray-800">Overall Student Completion</h3>
                    <p className="text-sm text-gray-500 mt-1">Average course completion</p>
                </div>

                <div
                    onClick={() => navigate('/teacher-completion?filter=behind')}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between mb-3">
                        <AlertTriangle className="text-orange-600" size={32} />
                        <span className="text-3xl font-bold text-gray-800">{classesBehindSchedule}</span>
                    </div>
                    <h3 className="font-semibold text-gray-800">Classes Behind Schedule</h3>
                    <p className="text-sm text-gray-500 mt-1">Below 70% of planned lessons</p>
                </div>

                <div
                    onClick={() => navigate('/student-completion?filter=at-risk')}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between mb-3">
                        <TrendingUp className="text-red-600" size={32} />
                        <span className="text-3xl font-bold text-gray-800">{atRiskStudents}</span>
                    </div>
                    <h3 className="font-semibold text-gray-800">At Risk Students</h3>
                    <p className="text-sm text-gray-500 mt-1">Below 50% course completion</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 1 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Teacher Completion by Grade/Program</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={teacherCompletionByGrade}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                <YAxis />
                                <Tooltip />
                                <Bar
                                    dataKey="value"
                                    fill="#3b82f6"
                                    onClick={(data: any) => data?.name && navigate(`/teacher-completion?grade=${encodeURIComponent(data.name)}`)}
                                    cursor="pointer"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Teacher Completion by Teacher</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={teacherCompletionByTeacher} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={80} />
                                <Tooltip />
                                <Bar
                                    dataKey="value"
                                    onClick={(data: any) => data?.name && navigate(`/teacher-completion?teacher=${encodeURIComponent(data.name)}`)}
                                    cursor="pointer"
                                >
                                    {teacherCompletionByTeacher.map((entry, idx) => (
                                        <Cell key={`cell-${idx}`} fill={entry.value < 70 ? '#f59e0b' : '#10b981'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 3 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Completion by Class</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={studentCompletionByClass}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="0-25" stackId="a" fill="#ef4444" onClick={(data: any) => data?.name && navigate(`/student-completion?class=${encodeURIComponent(data.name)}&band=0-25`)} cursor="pointer" />
                                <Bar dataKey="25-50" stackId="a" fill="#f59e0b" onClick={(data: any) => data?.name && navigate(`/student-completion?class=${encodeURIComponent(data.name)}&band=25-50`)} cursor="pointer" />
                                <Bar dataKey="50-75" stackId="a" fill="#3b82f6" onClick={(data: any) => data?.name && navigate(`/student-completion?class=${encodeURIComponent(data.name)}&band=50-75`)} cursor="pointer" />
                                <Bar dataKey="75-100" stackId="a" fill="#10b981" onClick={(data: any) => data?.name && navigate(`/student-completion?class=${encodeURIComponent(data.name)}&band=75-100`)} cursor="pointer" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 4 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">On Time vs Delayed Lessons</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={lessonStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    onClick={(data) => navigate(`/teacher-completion?status=${encodeURIComponent(data.name.toLowerCase().replace(' ', '-'))}`)}
                                    cursor="pointer"
                                >
                                    {lessonStatusData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Updates */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Updates</h3>
                <div className="space-y-3">
                    {filteredTeacherData.slice(0, 5).map((teacher) => (
                        <div key={teacher.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                            <GraduationCap className="text-blue-600 mt-1" size={20} />
                            <div>
                                <p className="text-sm text-gray-800">
                                    <span className="font-semibold">{teacher.teacher_name}</span> completed{' '}
                                    <span className="font-semibold">{teacher.lessons_completed}</span> lessons in{' '}
                                    <span className="font-semibold">{teacher.course_name}</span> ({teacher.class_section})
                                </p>
                                <p className="text-xs text-gray-500">{teacher.completion_percentage}% complete</p>
                            </div>
                        </div>
                    ))}
                    {filteredStudentData.slice(0, 3).map((student) => (
                        <div key={student.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                            <Users className="text-green-600 mt-1" size={20} />
                            <div>
                                <p className="text-sm text-gray-800">
                                    <span className="font-semibold">{student.student_name}</span> reached{' '}
                                    <span className="font-semibold">{student.completion_percentage}%</span> in{' '}
                                    <span className="font-semibold">{student.course_name}</span>
                                </p>
                                <p className="text-xs text-gray-500">Last activity: {student.last_activity_date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
