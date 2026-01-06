// Principal Evidence Approval Dashboard
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, CheckCircle, XCircle, Clock, FileText, History, ArrowLeft, Trash2 } from 'lucide-react';
import { getPendingEvidence, getReviewedEvidence, getReviewHistory, submitReview, clearAllEvidence, type EvidenceSubmission, type EvidenceReview } from '../../services/evidenceService';

const EvidenceApproval = () => {
    const navigate = useNavigate();
    const [pendingEvidence, setPendingEvidence] = useState<EvidenceSubmission[]>([]);
    const [reviewedEvidence, setReviewedEvidence] = useState<EvidenceSubmission[]>([]);
    const [selectedEvidence, setSelectedEvidence] = useState<EvidenceSubmission | null>(null);
    const [reviewHistory, setReviewHistory] = useState<EvidenceReview[]>([]);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [decision, setDecision] = useState<'approved' | 'rejected'>('approved');
    const [comments, setComments] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showClearButton, setShowClearButton] = useState(false);
    const [clearing, setClearing] = useState(false);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Keyboard shortcut: Shift+D to reveal clear button
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.shiftKey && e.key === 'D') {
                setShowClearButton(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    useEffect(() => {
        loadEvidence();
    }, []);

    const loadEvidence = async () => {
        const [pending, reviewed] = await Promise.all([
            getPendingEvidence(),
            getReviewedEvidence()
        ]);
        setPendingEvidence(pending);
        setReviewedEvidence(reviewed);
    };

    const handleViewEvidence = async (evidence: EvidenceSubmission) => {
        setSelectedEvidence(evidence);
        const history = await getReviewHistory(evidence.id!);
        setReviewHistory(history);
    };

    const handleReviewClick = (reviewDecision: 'approved' | 'rejected') => {
        setDecision(reviewDecision);
        setShowApprovalModal(true);
    };

    const handleSubmitReview = async () => {
        if (!selectedEvidence) return;

        if (comments.length < 3 || comments.length > 500) {
            alert('Comments must be between 3 and 500 characters');
            return;
        }

        setSubmitting(true);
        try {
            await submitReview(
                selectedEvidence.id!,
                user.id || 'principal1',
                user.name || 'Demo Principal',
                decision,
                comments
            );

            setShowApprovalModal(false);
            setComments('');
            setSelectedEvidence(null);
            loadEvidence();
        } catch (error) {
            console.error('Review error:', error);
            alert('Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    // Resubmission function - to be implemented in future
    // const handleAllowResubmission = async (evidenceId: string) => {
    //     try {
    //         await allowResubmission(evidenceId);
    //         alert('Teacher can now resubmit');
    //         loadEvidence();
    //     } catch (error) {
    //         console.error('Resubmission error:', error);
    //     }
    // };

    const handleClearAllData = async () => {
        if (!confirm('⚠️ WARNING: This will delete ALL evidence submissions!\n\nThis action cannot be undone. Are you sure?')) {
            return;
        }

        setClearing(true);
        try {
            const count = await clearAllEvidence();
            alert(`✅ Cleared ${count} evidence submission(s)!\n\nDemo data has been reset.`);
            setSelectedEvidence(null);
            loadEvidence();
        } catch (error) {
            console.error('Clear error:', error);
            alert('❌ Failed to clear data. Check console for details.');
        } finally {
            setClearing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate('/principal/dashboard')}
                    className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </button>

                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <FileText className="w-8 h-8" />
                        Evidence Approval Dashboard
                    </h1>

                    {/* Hidden Clear Button - Shift+D to toggle */}
                    {showClearButton && (
                        <button
                            onClick={handleClearAllData}
                            disabled={clearing}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-all shadow-lg"
                            title="Clear all evidence submissions (for demo reset)"
                        >
                            <Trash2 className="w-5 h-5" />
                            {clearing ? 'Clearing...' : 'Clear All Demo Data'}
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {/* Left: Pending Evidence List */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            Pending Evidence ({pendingEvidence.length})
                        </h2>

                        {pendingEvidence.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No pending evidence</p>
                        ) : (
                            <div className="space-y-3">
                                {pendingEvidence.map(evidence => (
                                    <div
                                        key={evidence.id}
                                        className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${selectedEvidence?.id === evidence.id ? 'border-blue-500 bg-blue-50' : ''}`}
                                        onClick={() => handleViewEvidence(evidence)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-semibold">{evidence.topic}</h3>
                                                <p className="text-sm text-gray-600">{evidence.subject} - {evidence.className}</p>
                                                <p className="text-xs text-gray-500">By: {evidence.teacherName}</p>
                                            </div>
                                            <Clock className="w-5 h-5 text-yellow-500" />
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {evidence.submittedAt?.toDate?.().toLocaleDateString() || 'Just now'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Evidence Viewer & Review */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        {!selectedEvidence ? (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <div className="text-center">
                                    <Eye className="w-16 h-16 mx-auto mb-4" />
                                    <p>Select evidence to review</p>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Review Evidence</h2>

                                {/* Evidence Details */}
                                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                    <p><strong>Topic:</strong> {selectedEvidence.topic}</p>
                                    <p><strong>Subject:</strong> {selectedEvidence.subject}</p>
                                    <p><strong>Class:</strong> {selectedEvidence.className}</p>
                                    <p><strong>Teacher:</strong> {selectedEvidence.teacherName}</p>
                                </div>

                                {/* Document Viewer */}
                                <div className="mb-4">
                                    <h3 className="font-semibold mb-2">Document Preview</h3>
                                    <div className="border rounded-lg p-4 bg-gray-100">
                                        {selectedEvidence.documentType === 'pdf' ? (
                                            <iframe
                                                src={selectedEvidence.documentUrl}
                                                className="w-full h-96"
                                                title="Document Preview"
                                            />
                                        ) : (
                                            <img
                                                src={selectedEvidence.documentUrl}
                                                alt="Evidence"
                                                className="w-full rounded"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Review Actions */}
                                <div className="flex gap-3 mb-4">
                                    <button
                                        onClick={() => handleReviewClick('approved')}
                                        className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleReviewClick('rejected')}
                                        className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        Reject
                                    </button>
                                </div>

                                {/* Review History */}
                                {reviewHistory.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="font-semibold mb-2">Review History</h3>
                                        <div className="space-y-2">
                                            {reviewHistory.map(review => (
                                                <div key={review.id} className="border-l-4 border-blue-500 pl-4 py-2">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {review.decision === 'approved' ?
                                                            <CheckCircle className="w-4 h-4 text-green-500" /> :
                                                            <XCircle className="w-4 h-4 text-red-500" />
                                                        }
                                                        <span className="font-medium">
                                                            {review.decision === 'approved' ? 'Approved' : 'Rejected'}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            by {review.principalName}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-700">{review.comments}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {review.reviewedAt?.toDate?.().toLocaleString() || 'Just now'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviewed Evidence Log */}
                {reviewedEvidence.length > 0 && (
                    <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <History className="w-6 h-6" />
                            Today's Reviewed Evidence ({reviewedEvidence.length})
                        </h2>
                        <div className="grid grid-cols-3 gap-4">
                            {reviewedEvidence.map(evidence => (
                                <div
                                    key={evidence.id}
                                    className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 hover:shadow-md transition-all"
                                    onClick={() => handleViewEvidence(evidence)}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="font-semibold text-sm">{evidence.topic}</h3>
                                            <p className="text-xs text-gray-600">{evidence.subject} - {evidence.className}</p>
                                            <p className="text-xs text-gray-500">By: {evidence.teacherName}</p>
                                        </div>
                                        {evidence.status === 'approved' ? (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-500" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`text-xs font-medium ${evidence.status === 'approved' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {evidence.status === 'approved' ? 'Approved' : 'Rejected'}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {evidence.submittedAt?.toDate?.().toLocaleDateString() || 'Today'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Approval Modal */}
            {showApprovalModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <h2 className="text-xl font-semibold mb-4">
                            {decision === 'approved' ? 'Approve' : 'Reject'} Evidence
                        </h2>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Comments (3-500 characters) *
                            </label>
                            <textarea
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                className={`w-full p-3 border rounded-lg h-32 ${comments.length > 0 && (comments.length < 3 || comments.length > 500)
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                                    }`}
                                placeholder="Provide feedback for the teacher..."
                            />
                            <p className={`text-xs mt-1 ${comments.length < 3
                                ? 'text-red-500 font-medium'
                                : comments.length > 500
                                    ? 'text-red-500 font-medium'
                                    : 'text-gray-500'
                                }`}>
                                {comments.length}/500 characters
                                {comments.length > 0 && comments.length < 3 && ' (minimum 3 required)'}
                                {comments.length > 500 && ' (maximum 500)'}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowApprovalModal(false);
                                    setComments('');
                                }}
                                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitReview}
                                disabled={submitting || comments.length < 3 || comments.length > 500}
                                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EvidenceApproval;
