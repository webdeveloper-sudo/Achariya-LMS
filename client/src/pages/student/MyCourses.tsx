

const MyCourses = () => {
    const courses = [
        { id: 1, name: 'Mathematics', teacher: 'Mr. Smith', grade: 'A' },
        { id: 2, name: 'Science', teacher: 'Ms. Johnson', grade: 'B+' },
        { id: 3, name: 'History', teacher: 'Mrs. Davis', grade: 'A-' },
    ];

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">My Courses</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <div key={course.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h2 className="text-xl font-semibold mb-2">{course.name}</h2>
                        <p className="text-gray-600 mb-4">Teacher: {course.teacher}</p>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Current Grade</span>
                            <span className="font-bold text-blue-600">{course.grade}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyCourses;
