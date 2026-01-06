

const EvidenceUpload = () => {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Evidence Upload</h1>
            <div className="bg-white p-6 rounded-lg shadow-md max-w-lg">
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Course</label>
                        <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                            <option>Mathematics - Grade 10A</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Topic</label>
                        <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">File</label>
                        <input type="file" className="mt-1 block w-full" />
                    </div>
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Upload
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EvidenceUpload;
