import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Check } from 'lucide-react';
import { sampleData } from '../../data/sampleData';

const TeacherEvidencePage = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const teacher = sampleData.teachers.find(t => t.email === user.email) || sampleData.teachers[0];
    const courses = sampleData.courses.filter(c => c.teacher_id === teacher.id);

    // State management (FIX FOR ISSUE #3)
    const [selectedCourse, setSelectedCourse] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedCourse || !title || !description) {
            alert('Please fill in all fields');
            return;
        }

        // Store in localStorage (Demo Mode)
        const evidence = {
            id: Date.now(),
            courseId: selectedCourse,
            title,
            description,
            fileName: selectedFile?.name || 'No file',
            status: 'Pending',
            submittedAt: new Date().toISOString(),
            teacherId: teacher.id
        };

        const existingEvidence = JSON.parse(localStorage.getItem('teacherEvidence') || '[]');
        existingEvidence.push(evidence);
        localStorage.setItem('teacherEvidence', JSON.stringify(existingEvidence));

        // Show success popup
        setShowSuccess(true);

        // Reset form
        setSelectedCourse('');
        setTitle('');
        setDescription('');
        setSelectedFile(null);

        // Hide popup after 3 seconds
        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <div>
            <Link to="/teacher/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold text-gray-800 mb-6">Evidence Submission</h1>

            {/* Success Popup (FIX FOR ISSUE #3) */}
            {showSuccess && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in z-50">
                    <Check className="w-6 h-6" />
                    <div>
                        <p className="font-semibold">Evidence submitted successfully!</p>
                        <p className="text-sm opacity-90">(Demo Mode)</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Form */}
                <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Submit New Evidence</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
                            <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Choose a course...</option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>{course.title}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Evidence Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Module 1 Teaching Session"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your evidence..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Files</label>
                            <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer block">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    className="hidden"
                                />
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                {selectedFile ? (
                                    <p className="text-sm text-blue-600 font-semibold">{selectedFile.name}</p>
                                ) : (
                                    <>
                                        <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                                        <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 10MB</p>
                                    </>
                                )}
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                            Submit Evidence
                        </button>
                    </form>
                </div>

                {/* Submitted Evidence - FROM LOCALSTORAGE */}
                <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Previously Submitted</h2>
                    <div className="space-y-3">
                        {(() => {
                            const submitted = JSON.parse(localStorage.getItem('teacherEvidence') || '[]');
                            if (submitted.length === 0) {
                                return <p className="text-gray-500 text-center py-4">No evidence submitted yet</p>;
                            }
                            return submitted.map((item: any) => (
                                <div key={item.id} className={`p-4 border rounded-lg ${item.status === 'Approved' ? 'bg-green-50 border-green-200' :
                                        item.status === 'Rejected' ? 'bg-red-50 border-red-200' :
                                            'bg-blue-50 border-blue-200'
                                    }`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-gray-800">{item.title}</h4>
                                        <span className={`px-2 py-1 text-white text-xs rounded-full ${item.status === 'Approved' ? 'bg-green-500' :
                                                item.status === 'Rejected' ? 'bg-red-500' :
                                                    'bg-yellow-500'
                                            }`}>{item.status}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                                    <div className="flex gap-3 text-xs text-gray-500">
                                        <span>📁 {item.fileName}</span>
                                        <span>📅 {new Date(item.submittedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default TeacherEvidencePage;
