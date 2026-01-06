

const MyTasks = () => {
    const tasks = [
        { id: 1, title: 'Math Homework 1', course: 'Mathematics', dueDate: '2023-11-30', status: 'Pending' },
        { id: 2, title: 'Science Project', course: 'Science', dueDate: '2023-12-05', status: 'In Progress' },
    ];

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">My Tasks</h1>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tasks.map((task) => (
                            <tr key={task.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{task.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{task.course}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{task.dueDate}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${task.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                        {task.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyTasks;
