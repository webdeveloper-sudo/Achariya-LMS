import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { teacherCourseCompletion, lessonDetails, TeacherCourseCompletion } from '../../data/completionData';

const TeacherCompletion = () => {
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState<TeacherCourseCompletion | null>(null);

    // Get role-based userData
    const userData = JSON.parse(localStorage.getItem('user') || '{}');

    // Apply role filtering
    const roleFilteredData = useMemo(() => {
        if (userData.role === 'Teacher' && userData.teacherName) {
            return teacherCourseCompletion.filter(t => t.teacher_name === userData.teacherName);
        }
        return teacherCourseCompletion;
    }, [userData]);

    // Apply URL filters
    const filteredData = useMemo(() => {
        let data = roleFilteredData;

        // URL filter: grade
        const gradeFilter = searchParams.get('grade');
        if (gradeFilter) {
            data = data.filter(t => t.grade_program === gradeFilter);
        }

        // URL filter: teacher
        const teacherFilter = searchParams.get('teacher');
        if (teacherFilter) {
            data = data.filter(t => t.teacher_name === teacherFilter);
        }

        // URL filter: behind schedule
        if (searchParams.get('filter') === 'behind') {
            data = data.filter(t => t.behind_schedule_flag);
        }

        // Search filter
        if (searchTerm) {
            data = data.filter(t =>
                t.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.class_section.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return data;
    }, [roleFilteredData, searchParams, searchTerm]);

    // Get lessons for selected course
    const selectedLessons = useMemo(() => {
        if (!selectedCourse) return [];
        return lessonDetails.filter(l => l.teacher_completion_id === selectedCourse.id);
    }, [selectedCourse]);

    const activeFilters = useMemo(() => {
        const filters: string[] = [];
        if (searchParams.get('grade')) filters.push(`Grade: ${searchParams.get('grade')}`);
        if (searchParams.get('teacher')) filters.push(`Teacher: ${searchParams.get('teacher')}`);
        if (searchParams.get('filter') === 'behind') filters.push('Behind Schedule');
        return filters;
    }, [searchParams]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Teacher Completion</h1>
                <p className="text-gray-500 mt-1">Track lesson completion progress across all courses</p>
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
                        placeholder="Search by teacher, course, or class..."
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
                                <th className="px-6 py-3">Teacher</th>
                                <th className="px-6 py-3">Course</th>
                                <th className="px-6 py-3">Class</th>
                                <th className="px-6 py-3">Campus</th>
                                <th className="px-6 py-3">Lessons Completed</th>
                                <th className="px-6 py-3">Completion %</th>
                                <th className="px-6 py-3">On Time</th>
                                <th className="px-6 py-3">Delayed</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredData.map((course) => (
                                <tr
                                    key={course.id}
                                    onClick={() => setSelectedCourse(course)}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-4 font-medium text-gray-800">{course.teacher_name}</td>
                                    <td className="px-6 py-4 text-gray-600">{course.course_name}</td>
                                    <td className="px-6 py-4 text-gray-600">{course.class_section}</td>
                                    <td className="px-6 py-4 text-gray-600">{course.campus}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {course.lessons_completed} / {course.total_lessons_planned}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${course.completion_percentage >= 70 ? 'bg-green-500' : 'bg-orange-500'
                                                        }`}
                                                    style={{ width: `${course.completion_percentage}%` }}
                                                />
                                            </div>
                                            <span className="font-medium">{course.completion_percentage}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-green-600">{course.on_time_lessons}</td>
                                    <td className="px-6 py-4 text-orange-600">{course.delayed_lessons}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${course.behind_schedule_flag
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-green-100 text-green-700'
                                                }`}
                                        >
                                            {course.behind_schedule_flag ? 'Behind' : 'On Track'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <span className="text-sm text-gray-500">Showing {filteredData.length} courses</span>
                </div>
            </div>

            {/* Side Panel for Lesson Details */}
            {selectedCourse && (
                <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-40 overflow-y-auto">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Lesson Details</h2>
                                <p className="text-sm text-gray-500 mt-1">{selectedCourse.course_name}</p>
                            </div>
                            <button
                                onClick={() => setSelectedCourse(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">Teacher</p>
                                <p className="font-semibold text-gray-800">{selectedCourse.teacher_name}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">Class</p>
                                <p className="font-semibold text-gray-800">
                                    {selectedCourse.grade_program} - {selectedCourse.class_section}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">Progress</p>
                                <p className="font-semibold text-gray-800">
                                    {selectedCourse.lessons_completed} / {selectedCourse.total_lessons_planned} lessons
                                </p>
                            </div>
                        </div>

                        <h3 className="font-semibold text-gray-800 mb-3">Lessons</h3>
                        <div className="space-y-2">
                            {selectedLessons.map((lesson) => (
                                <div
                                    key={lesson.id}
                                    className={`p-3 rounded-lg border ${lesson.status === 'Completed'
                                            ? 'bg-green-50 border-green-200'
                                            : lesson.status === 'Delayed'
                                                ? 'bg-orange-50 border-orange-200'
                                                : lesson.status === 'In Progress'
                                                    ? 'bg-blue-50 border-blue-200'
                                                    : 'bg-gray-50 border-gray-200'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-800 text-sm">{lesson.lesson_title}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Planned: {lesson.planned_date}
                                                {lesson.completed_date && ` | Completed: ${lesson.completed_date}`}
                                            </p>
                                        </div>
                                        <span
                                            className={`text-xs px-2 py-1 rounded ${lesson.status === 'Completed'
                                                    ? 'bg-green-200 text-green-800'
                                                    : lesson.status === 'Delayed'
                                                        ? 'bg-orange-200 text-orange-800'
                                                        : lesson.status === 'In Progress'
                                                            ? 'bg-blue-200 text-blue-800'
                                                            : ' bg-gray-200 text-gray-800'
                                                }`}
                                        >
                                            {lesson.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherCompletion;
