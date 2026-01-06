import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { sampleData } from '../../data/sampleData';

const AdminModuleEdit = () => {
    const { moduleId } = useParams();
    const navigate = useNavigate();
    const module = sampleData.modules.find(m => m.id === parseInt(moduleId || '0'));
    const course = module ? sampleData.courses.find(c => c.id === module.course_id) : null;

    const [title, setTitle] = useState(module?.title || '');
    const [order, setOrder] = useState(module?.order || 1);
    const [completionRate, setCompletionRate] = useState(module?.completion_rate || 0);
    const [showSuccess, setShowSuccess] = useState(false);

    if (!module || !course) {
        return <div className="text-center py-8">Module not found</div>;
    }

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        // In demo mode, just show success (no actual backend)
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            navigate('/admin/courses');
        }, 2000);
    };

    return (
        <div>
            <Link to="/admin/courses" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Courses
            </Link>

            <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Module</h1>

            {showSuccess && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50">
                    <p className="font-semibold">✅ Module updated successfully! (Demo Mode)</p>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-6 border">
                <div className="mb-6">
                    <p className="text-sm text-gray-600">Course</p>
                    <p className="text-lg font-semibold text-gray-800">{course.title}</p>
                    <p className="text-sm text-gray-500">{course.subject} • {course.level}</p>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Module Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Order Number *
                            </label>
                            <input
                                type="number"
                                value={order}
                                onChange={(e) => setOrder(parseInt(e.target.value))}
                                min="1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Completion Rate (%)
                            </label>
                            <input
                                type="number"
                                value={completionRate}
                                onChange={(e) => setCompletionRate(parseInt(e.target.value))}
                                min="0"
                                max="100"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-700">
                            <strong>Note:</strong> In demo mode, changes are saved locally. In production, module content editing will be integrated with the backend CMS.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                            <Save className="w-5 h-5" />
                            Save Changes
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/admin/courses')}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                        >
                            <X className="w-5 h-5" />
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminModuleEdit;
