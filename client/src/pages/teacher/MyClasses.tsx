

const MyClasses = () => {
    const classes = [
        { id: 1, name: 'Mathematics - Grade 10A', students: 30 },
        { id: 2, name: 'Mathematics - Grade 10B', students: 28 },
    ];

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">My Classes</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {classes.map((cls) => (
                    <div key={cls.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h2 className="text-xl font-semibold mb-2">{cls.name}</h2>
                        <p className="text-gray-600">Students: {cls.students}</p>
                        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            View Details
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyClasses;
