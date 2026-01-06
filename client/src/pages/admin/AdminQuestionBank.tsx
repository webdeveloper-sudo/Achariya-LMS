import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Filter } from 'lucide-react';
import { questionBankData } from '../../data/questionBankData';

const AdminQuestionBank = () => {
    const [selectedCourse, setSelectedCourse] = useState('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [showPDFModal, setShowPDFModal] = useState(false);

    const filteredQuestions = questionBankData.filter(q => {
        const courseMatch = selectedCourse === 'all' || q.course === selectedCourse;
        const difficultyMatch = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
        return courseMatch && difficultyMatch;
    });

    const exportToPDF = () => {
        setShowPDFModal(true);
    };

    return (
        <div>
            <Link to="/admin/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Question Bank</h1>
                    <p className="text-gray-600 mt-1">Total: {filteredQuestions.length} questions</p>
                </div>
                <button
                    onClick={exportToPDF}
                    className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                >
                    <Download className="w-5 h-5 mr-2" />
                    Export to PDF
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 border mb-6">
                <div className="flex items-center gap-4">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="px-4 py-2 border rounded-lg"
                    >
                        <option value="all">All Courses</option>
                        <option value="Advanced Mathematics">Advanced Mathematics</option>
                        <option value="Physics">Physics</option>
                        <option value="English Literature">English Literature</option>
                    </select>
                    <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="px-4 py-2 border rounded-lg"
                    >
                        <option value="all">All Difficulties</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>
            </div>

            {/* Questions Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Course</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Topic</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Question</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Difficulty</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Answer</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredQuestions.map(q => (
                                <tr key={q.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4 font-mono text-sm text-gray-600">Q{q.id}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{q.course}</td>
                                    <td className="py-3 px-4 text-sm text-gray-600">{q.topic}</td>
                                    <td className="py-3 px-4 text-sm text-gray-800 max-w-md">{q.question}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                                q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {q.difficulty}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-semibold text-sm">
                                            {q.correctAnswer}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PDF Modal */}
            {showPDFModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                                <FileText className="w-6 h-6 mr-2 text-red-600" />
                                Question Bank PDF Preview
                            </h2>
                            <button
                                onClick={() => setShowPDFModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-8 bg-white" style={{ fontFamily: 'serif' }}>
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold mb-2">Achariya Learning Portal</h1>
                                <h2 className="text-xl text-gray-700 mb-1">Question Bank Repository</h2>
                                <p className="text-gray-600">Total Questions: {filteredQuestions.length}</p>
                                <div className="border-b-2 border-gray-300 mt-4"></div>
                            </div>

                            {filteredQuestions.map((q, index) => (
                                <div key={q.id} className="mb-6 pb-4 border-b">
                                    <div className="flex items-start justify-between mb-2">
                                        <p className="font-bold text-lg">Question {index + 1} (ID: Q{q.id})</p>
                                        <div className="flex gap-2">
                                            <span className="text-sm px-2 py-1 bg-gray-100 rounded">{q.course}</span>
                                            <span className={`text-sm px-2 py-1 rounded ${q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                                    q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {q.difficulty}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 mb-1"><strong>Topic:</strong> {q.topic}</p>
                                    <p className="text-gray-900 mb-3">{q.question}</p>
                                    <div className="space-y-1 ml-4">
                                        {q.options.map((opt, i) => (
                                            <p key={i} className={`${opt.startsWith(q.correctAnswer) ? 'font-bold text-green-700' : 'text-gray-700'}`}>
                                                {opt}
                                            </p>
                                        ))}
                                    </div>
                                    <p className="mt-2 text-sm text-green-700">
                                        <strong>Correct Answer: {q.correctAnswer}</strong>
                                    </p>
                                </div>
                            ))}

                            <div className="text-center mt-8 pt-4 border-t">
                                <p className="text-gray-600 text-sm">© Achariya Learning Portal • Question Bank</p>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-end gap-3">
                            <button
                                onClick={() => window.print()}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                            >
                                Print / Save as PDF
                            </button>
                            <button
                                onClick={() => setShowPDFModal(false)}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminQuestionBank;
