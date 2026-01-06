// Teacher Evidence Submission Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import { submitEvidence, getTeacherSubmissions, type EvidenceSubmission } from '../../services/evidenceService';

const TeacherEvidenceSubmission = () => {
    const navigate = useNavigate();
    const [subject, setSubject] = useState('');
    const [className, setClassName] = useState('');
    const [topic, setTopic] = useState('');
    const [selectedDoc, setSelectedDoc] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submissions, setSubmissions] = useState<EvidenceSubmission[]>([]);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Demo documents available
    const demoDocuments = [
        { url: '/demo-evidence/sample-lesson-plan.pdf', name: 'Newton\'s Laws - Lesson Plan', type: 'pdf' as const },
        { url: '/demo-evidence/sample-lab-report.pdf', name: 'Chemistry Lab Report', type: 'pdf' as const },
        { url: '/demo-evidence/sample-certificate.jpg', name: 'Teaching Certificate', type: 'image' as const }
    ];

    useEffect(() => {
        loadSubmissions();
    }, []);

    const loadSubmissions = async () => {
        const data = await getTeacherSubmissions(user.id || 'teacher1');
        setSubmissions(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !className || !topic || !selectedDoc) {
            alert('Please fill all fields and select a document');
            return;
        }

        setSubmitting(true);
        try {
            const doc = demoDocuments.find(d => d.url === selectedDoc);
            await submitEvidence({
                teacherId: user.id || 'teacher1',
                teacherName: user.name || 'Demo Teacher',
                subject,
                className,
                topic,
                documentUrl: selectedDoc,
                documentType: doc?.type || 'pdf'
            });

            alert('Evidence submitted successfully!');
            setSubject('');
            setClassName('');
            setTopic('');
            setSelectedDoc('');
            loadSubmissions();
        } catch (error: any) {
            console.error('Submit error:', error);
            console.error('Error message:', error.message);
            console.error('Error code:', error.code);
            alert(`Failed to submit evidence: ${error.message || 'Unknown error'}`);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return <Clock className="w-5 h-5 text-yellow-500" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'approved': return 'Approved';
            case 'rejected': return 'Rejected';
            default: return 'Pending Review';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/teacher/dashboard')}
                    className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </button>

                <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                    <FileText className="w-8 h-8" />
                    Submit Evidence
                </h1>

                {/* Submission Form */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">New Submission</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Subject</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full p-2 border rounded-lg"
                                    placeholder="e.g., Physics"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Class</label>
                                <input
                                    type="text"
                                    value={className}
                                    onChange={(e) => setClassName(e.target.value)}
                                    className="w-full p-2 border rounded-lg"
                                    placeholder="e.g., 10-A"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Topic</label>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="w-full p-2 border rounded-lg"
                                placeholder="e.g., Newton's Three Laws"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Select Document</label>
                            <select
                                value={selectedDoc}
                                onChange={(e) => setSelectedDoc(e.target.value)}
                                className="w-full p-2 border rounded-lg"
                            >
                                <option value="">-- Select a demo document --</option>
                                {demoDocuments.map(doc => (
                                    <option key={doc.url} value={doc.url}>{doc.name}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                        >
                            <Upload className="w-5 h-5" />
                            {submitting ? 'Submitting...' : 'Submit Evidence'}
                        </button>
                    </form>
                </div>

                {/* Submissions History */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Your Submissions</h2>
                    {submissions.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No submissions yet</p>
                    ) : (
                        <div className="space-y-4">
                            {submissions.map(sub => (
                                <div key={sub.id} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold">{sub.topic}</h3>
                                            <p className="text-sm text-gray-600">{sub.subject} - {sub.className}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(sub.status)}
                                            <span className="font-medium">{getStatusText(sub.status)}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Submitted: {sub.submittedAt?.toDate?.().toLocaleString() || 'Just now'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherEvidenceSubmission;
