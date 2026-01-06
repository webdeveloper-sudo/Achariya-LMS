import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { studentCourseProgress } from '../../data/completionData';

const StudentCompletion = () => {
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');

    const userData = JSON.parse(localStorage.getItem('user') || '{}');

    // Apply role filtering
    const roleFilteredData = useMemo(() => {
        if (userData.role === 'Student' && userData.studentId) {
            return studentCourseProgress.filter(s => s.student_id === userData.studentId);
        }
        return studentCourseProgress;
    }, [userData]);

    // Apply URL filters
    const filteredData = useMemo(() => {
        let data = roleFilteredData;

        // URL filter: at-risk
        if (searchParams.get('filter') === 'at-risk') {
            data = data.filter(s => s.at_risk_flag);
        }

        // URL filter: class
        const classFilter = searchParams.get('class');
        if (classFilter) {
            data = data.filter(s => `${s.grade_program} ${s.class_section}` === classFilter);
        }

        // URL filter: completion band
        const bandFilter = searchParams.get('band');
        if (bandFilter) {
            const [min, max] = bandFilter.split('-').map(Number);
            data = data.filter(s => s.completion_percentage >= min && s.completion_percentage < max);
        }

        // Search filter
        if (searchTerm) {
            data = data.filter(s =>
                s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.course_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return data;
    }, [roleFilteredData, searchParams, searchTerm]);

    const activeFilters = useMemo(() => {
        const filters: string[] = [];
        if (searchParams.get('filter') === 'at-risk') filters.push('At Risk Students');
        if (searchParams.get('class')) filters.push(`Class: ${searchParams.get('class')}`);
        if (searchParams.get('band')) filters.push(`Completion: ${searchParams.get('band')}%`);
        return filters;
    }, [searchParams]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Student Completion</h1>
                <p className="text-gray-500 mt-1">Track student progress across all courses</p>
            </div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-600">Active Filters:</span>
                    {activeFilters.map((filter, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                            {filter}
                        </span>
                    ))}
                </div>
            )}

            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by student name, ID, or course..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Student ID</th>
                                <th className="px-6 py-3">Student Name</th>
                                <th className="px-6 py-3">Course</th>
                                <th className="px-6 py-3">Class</th>
                                <th className="px-6 py-3">Campus</th>
                                <th className="px-6 py-3">Completion %</th>
                                <th className="px-6 py-3">Avg Score</th>
                                <th className="px-6 py-3">Last Activity</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredData.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-sm text-gray-600">{student.student_id}</td>
                                    <td className="px-6 py-4 font-medium text-gray-800">{student.student_name}</td>
                                    <td className="px-6 py-4 text-gray-600">{student.course_name}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {student.grade_program} {student.class_section}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{student.campus}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${student.completion_percentage >= 75
                                                            ? 'bg-green-500'
                                                            : student.completion_percentage >= 50
                                                                ? 'bg-blue-500'
                                                                : student.completion_percentage >= 25
                                                                    ? 'bg-orange-500'
                                                                    : 'bg-red-500'
                                                        }`}
                                                    style={{ width: `${student.completion_percentage}%` }}
                                                />
                                            </div>
                                            <span className="font-medium">{student.completion_percentage}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`font-medium ${student.average_score >= 70 ? 'text-green-600' : 'text-orange-600'
                                                }`}
                                        >
                                            {student.average_score}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">{student.last_activity_date}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${student.at_risk_flag
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-green-100 text-green-700'
                                                }`}
                                        >
                                            {student.at_risk_flag ? 'At Risk' : 'On Track'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <span className="text-sm text-gray-500">Showing {filteredData.length} student records</span>
                </div>
            </div>
        </div>
    );
};

export default StudentCompletion;
