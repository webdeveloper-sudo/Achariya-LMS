import { useMemo } from 'react';
import { teacherCourseCompletion, studentCourseProgress } from '../../data/completionData';

const CoursesAndLessons = () => {
    // Aggregate unique courses
    const courses = useMemo(() => {
        const courseMap = new Map<string, {
            course_code: string;
            course_name: string;
            campuses: Set<string>;
            grades: Set<string>;
            total_lessons: number[];
            teacher_completion: number[];
            student_completion: number[];
        }>();

        // Process teacher data
        teacherCourseCompletion.forEach(t => {
            const key = t.course_code;
            if (!courseMap.has(key)) {
                courseMap.set(key, {
                    course_code: t.course_code,
                    course_name: t.course_name,
                    campuses: new Set(),
                    grades: new Set(),
                    total_lessons: [],
                    teacher_completion: [],
                    student_completion: [],
                });
            }
            const course = courseMap.get(key)!;
            course.campuses.add(t.campus);
            course.grades.add(t.grade_program);
            course.total_lessons.push(t.total_lessons_planned);
            course.teacher_completion.push(t.completion_percentage);
        });

        // Process student data
        studentCourseProgress.forEach(s => {
            const key = s.course_code;
            if (courseMap.has(key)) {
                courseMap.get(key)!.student_completion.push(s.completion_percentage);
            }
        });

        return Array.from(courseMap.values()).map(course => ({
            course_code: course.course_code,
            course_name: course.course_name,
            campuses: Array.from(course.campuses).join(', '),
            grades: Array.from(course.grades).join(', '),
            avg_lessons: Math.round(course.total_lessons.reduce((a, b) => a + b, 0) / course.total_lessons.length),
            avg_teacher_completion: Math.round(
                course.teacher_completion.reduce((a, b) => a + b, 0) / course.teacher_completion.length
            ),
            avg_student_completion: course.student_completion.length > 0
                ? Math.round(course.student_completion.reduce((a, b) => a + b, 0) / course.student_completion.length)
                : 0,
        }));
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Courses and Lessons</h1>
                <p className="text-gray-500 mt-1">Overview of all courses with completion metrics</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Course Code</th>
                                <th className="px-6 py-3">Course Name</th>
                                <th className="px-6 py-3">Campuses</th>
                                <th className="px-6 py-3">Grade/Program</th>
                                <th className="px-6 py-3">Avg Lessons</th>
                                <th className="px-6 py-3">Teacher Completion</th>
                                <th className="px-6 py-3">Student Completion</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {courses.map((course, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-sm text-blue-600">{course.course_code}</td>
                                    <td className="px-6 py-4 font-medium text-gray-800">{course.course_name}</td>
                                    <td className="px-6 py-4 text-gray-600 text-xs">{course.campuses}</td>
                                    <td className="px-6 py-4 text-gray-600 text-xs">{course.grades}</td>
                                    <td className="px-6 py-4 text-gray-600">{course.avg_lessons}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${course.avg_teacher_completion >= 70 ? 'bg-green-500' : 'bg-orange-500'
                                                        }`}
                                                    style={{ width: `${course.avg_teacher_completion}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium">{course.avg_teacher_completion}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${course.avg_student_completion >= 70
                                                            ? 'bg-green-500'
                                                            : course.avg_student_completion >= 50
                                                                ? 'bg-blue-500'
                                                                : 'bg-orange-500'
                                                        }`}
                                                    style={{ width: `${course.avg_student_completion}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium">{course.avg_student_completion}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <span className="text-sm text-gray-500">Showing {courses.length} unique courses</span>
                </div>
            </div>
        </div>
    );
};

export default CoursesAndLessons;
