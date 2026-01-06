import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

interface Evidence {
    id: number;
    teacherId: number;
    teacherName: string;
    courseId: number;
    courseName: string;
    title: string;
    description: string;
    fileName: string;
    status: string;
    submittedAt: string;
    approvedAt?: string;
    rejectedAt?: string;
}

const PrincipalEvidenceApproval = () => {
    const [evidenceList, setEvidenceList] = useState<Evidence[]>(() => {
        const stored = localStorage.getItem('teacherEvidence');
        return stored ? JSON.parse(stored) : [
            {
                id: 1,
                teacherId: 1,
                teacherName: 'Hari Krishnan',
                courseId: 1,
                courseName: 'Advanced Mathematics',
                title: 'Module 2 Teaching Materials',
                description: 'Comprehensive lesson plans and student worksheets for Module 2',
                fileName: 'module2_materials.pdf',
                status: 'Pending',
                submittedAt: '2025-12-04T10:30:00'
            },
            {
                id: 2,
                teacherId: 2,
                teacherName: 'Meena Sundaram',
                courseId: 2,
                courseName: 'Physics Fundamentals',
                title: 'Lab Session Evidence',
                description: 'Photos and reports from practical lab sessions',
                fileName: 'lab_evidence.zip',
                status: 'Pending',
                submittedAt: '2025-12-05T14:20:00'
            }
        ];
    });

    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');

    const handleApprove = (evidenceId: number) => {
        setEvidenceList((prev: Evidence[]) => {
            const updated = prev.map((item: Evidence) =>
                item.id === evidenceId
                    ? { ...item, status: 'Approved', approvedAt: new Date().toISOString() }
                    : item
            );
            localStorage.setItem('teacherEvidence', JSON.stringify(updated));
            return updated;
        });

        setNotificationMessage(' approved successfully!');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
    };

    const handleReject = (evidenceId: number) => {
        setEvidenceList((prev: Evidence[]) => {
            const updated = prev.map((item: Evidence) =>
                item.id === evidenceId
                    ? { ...item, status: 'Rejected', rejectedAt: new Date().toISOString() }
                    : item
            );
            localStorage.setItem('teacherEvidence', JSON.stringify(updated));
            return updated;
        });

        setNotificationMessage('Evidence rejected.');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
    };

    const pendingEvidence = evidenceList.filter((e: Evidence) => e.status === 'Pending');
    const reviewedEvidence = evidenceList.filter((e: Evidence) => e.status !== 'Pending');

    return (
        <div>
            <Link to="/principal/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold text-gray-800 mb-6">Evidence Approval</h1>

            {showNotification && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50">
                    <p className="font-semibold">{notificationMessage}</p>
                </div>
            )}

            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Pending Review ({pendingEvidence.length})
                </h2>

                {pendingEvidence.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">No pending evidence to review</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingEvidence.map((evidence: Evidence) => (
                            <div key={evidence.id} className="bg-white border border-yellow-200 rounded-xl p-6 shadow-sm">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-800 mb-1">{evidence.title}</h3>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {evidence.teacherName} • {evidence.courseName}
                                        </p>
                                        <p className="text-sm text-gray-700 mb-3">{evidence.description}</p>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <FileText className="w-4 h-4 mr-1" />
                                            <span>{evidence.fileName}</span>
                                            <span className="mx-2">•</span>
                                            <span>Submitted: {new Date(evidence.submittedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                                        Pending
                                    </span>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleApprove(evidence.id)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(evidence.id)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {reviewedEvidence.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        Recently Reviewed ({reviewedEvidence.length})
                    </h2>

                    <div className="space-y-3">
                        {reviewedEvidence.map((evidence: Evidence) => (
                            <div
                                key={evidence.id}
                                className={`p-4 border rounded-lg ${evidence.status === 'Approved'
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-red-50 border-red-200'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-gray-800">{evidence.title}</h4>
                                        <p className="text-sm text-gray-600">
                                            {evidence.teacherName} • {evidence.courseName}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 text-sm rounded-full ${evidence.status === 'Approved'
                                            ? 'bg-green-500 text-white'
                                            : 'bg-red-500 text-white'
                                            }`}
                                    >
                                        {evidence.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Previously Submitted Evidence - MATCHES TEACHER VIEW */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
                <h2 className="text-xl font-bold text-gray-800 mb-4">All Submitted Evidence</h2>

                {evidenceList.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No evidence has been submitted yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {evidenceList.map((evidence) => (
                            <div key={evidence.id} className="border rounded-lg p-4 hover:shadow-md transition">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800">{evidence.title}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{evidence.description}</p>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                            <span>📁 {evidence.fileName}</span>
                                            <span>📅 {new Date(evidence.submittedAt).toLocaleDateString()}</span>
                                            <span>👤 {evidence.teacherName}</span>
                                            <span>📚 {evidence.courseName}</span>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${evidence.status === 'Approved'
                                        ? 'bg-green-100 text-green-700'
                                        : evidence.status === 'Rejected'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {evidence.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
export default PrincipalEvidenceApproval;
