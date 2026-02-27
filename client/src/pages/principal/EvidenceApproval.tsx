// Principal Evidence Approval Dashboard
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  History,
  ArrowLeft,
  Trash2,
  RefreshCw,
} from "lucide-react";
import {
  getPendingEvidence,
  getReviewedEvidence,
  getReviewHistory,
  submitReview,
  clearAllEvidence,
  type EvidenceSubmission,
  type EvidenceReview,
} from "../../services/evidenceService";

const EvidenceApproval = () => {
  const [pendingEvidence, setPendingEvidence] = useState<EvidenceSubmission[]>(
    [],
  );
  const [reviewedEvidence, setReviewedEvidence] = useState<
    EvidenceSubmission[]
  >([]);
  const [selectedEvidence, setSelectedEvidence] =
    useState<EvidenceSubmission | null>(null);
  const [reviewHistory, setReviewHistory] = useState<EvidenceReview[]>([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [decision, setDecision] = useState<"approved" | "rejected">("approved");
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showClearButton, setShowClearButton] = useState(false);
  const [clearing, setClearing] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Keyboard shortcut: Shift+D to reveal clear button
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "D") {
        setShowClearButton((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  useEffect(() => {
    loadEvidence();
  }, []);

  const loadEvidence = async () => {
    const [pending, reviewed] = await Promise.all([
      getPendingEvidence(),
      getReviewedEvidence(),
    ]);
    setPendingEvidence(pending || []);
    setReviewedEvidence(reviewed || []);
  };

  const handleViewEvidence = async (evidence: EvidenceSubmission) => {
    setSelectedEvidence(evidence);
    const history = await getReviewHistory(evidence.id!);
    setReviewHistory(history || []);
  };

  const handleReviewClick = (reviewDecision: "approved" | "rejected") => {
    setDecision(reviewDecision);
    setShowApprovalModal(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedEvidence) return;

    if (comments.length < 3 || comments.length > 500) {
      alert("Comments must be between 3 and 500 characters");
      return;
    }

    setSubmitting(true);
    try {
      await submitReview(
        selectedEvidence.id!,
        user.id || "principal1",
        user.name || "Demo Principal",
        decision,
        comments,
      );

      setShowApprovalModal(false);
      setComments("");
      setSelectedEvidence(null);
      loadEvidence();
    } catch (error) {
      console.error("Review error:", error);
      alert("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearAllData = async () => {
    if (
      !confirm(
        "⚠️ WARNING: This will delete ALL evidence submissions!\n\nThis action cannot be undone. Are you sure?",
      )
    ) {
      return;
    }

    setClearing(true);
    try {
      const count = await clearAllEvidence();
      alert(
        `✅ Cleared ${count} evidence submission(s)!\n\nDemo data has been reset.`,
      );
      setSelectedEvidence(null);
      loadEvidence();
    } catch (error) {
      console.error("Clear error:", error);
      alert("❌ Failed to clear data. Check console for details.");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="border-b border-gray-100 pb-12">
        <Link
          to="/principal/dashboard"
          className="inline-flex items-center text-[13px] hover:text-[#008000] mb-10 transition-colors capitalize"
          style={{ color: "#008000" }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Executive Dashboard
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-center sm:text-left">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6 justify-center sm:justify-start">
              <div className="bg-green-50 p-2 rounded border border-green-100">
                <FileText className="w-5 h-5" style={{ color: "#008000" }} />
              </div>
              <span
                className="text-[13px] capitalize"
                style={{ color: "#008000" }}
              >
                Quality Assurance Terminal
              </span>
            </div>
            <h1 className="text-4xl text-gray-900 mb-6 leading-tight capitalize">
              Evidence <span className="text-gray-400">Review</span>
            </h1>
            <p className="text-gray-600 text-[15px] max-w-xl leading-relaxed mx-auto sm:mx-0">
              Strategic validation of instructional artifacts and professional
              submissions.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center sm:justify-start lg:mx-0 mx-auto">
            {showClearButton && (
              <button
                onClick={handleClearAllData}
                disabled={clearing}
                className="px-6 py-2.5 bg-red-600 text-white rounded-md text-[11px] capitalize hover:bg-red-700 disabled:bg-gray-400 transition shadow-sm flex items-center gap-2"
              >
                <Trash2 size={14} />
                {clearing ? "Clearing..." : "Wipe Registry"}
              </button>
            )}
            <button
              onClick={loadEvidence}
              className="p-3 bg-gray-50 text-gray-400 rounded-md hover:text-[#008000] hover:bg-green-50 transition border border-gray-100"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Pending Evidence List */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-md border border-gray-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg text-gray-900 capitalize font-medium">
                Pending Queue
              </h2>
              <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[10px] rounded border border-gray-100">
                {pendingEvidence.length}
              </span>
            </div>

            {pendingEvidence.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                <p className="text-[13px] text-gray-400 capitalize">
                  No pending submissions
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingEvidence.map((evidence) => (
                  <div
                    key={evidence.id}
                    className={`p-4 border rounded-md cursor-pointer transition-all hover:bg-gray-50/50 ${selectedEvidence?.id === evidence.id ? "border-green-100 bg-green-50/30" : "border-gray-50"}`}
                    onClick={() => handleViewEvidence(evidence)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-sm text-gray-900 font-medium capitalize truncate group-hover:text-[#008000]">
                          {evidence.topic}
                        </h3>
                        <p className="text-[11px] text-gray-400 capitalize mt-0.5">
                          {evidence.subject} • {evidence.className}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          Submitted by:{" "}
                          <span className="text-gray-600">
                            {evidence.teacherName}
                          </span>
                        </p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                    </div>
                    <p className="text-[10px] text-gray-400 capitalize font-mono">
                      {evidence.submittedAt?.toDate?.().toLocaleDateString() ||
                        "Recent Sync"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Evidence Viewer & Review */}
        <div className="lg:col-span-8 space-y-8">
          {!selectedEvidence ? (
            <div className="bg-white rounded-md border border-gray-100 shadow-sm p-12 text-center h-[600px] flex flex-col items-center justify-center">
              <div className="bg-gray-50 p-6 rounded-full mb-6">
                <Eye className="w-12 h-12 text-gray-200" />
              </div>
              <p className="text-[13px] text-gray-400 capitalize">
                Initialize selection to engage review engine
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-md border border-gray-100 shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl text-gray-900 capitalize">
                  Review Terminal
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-amber-50 text-amber-700 text-[10px] capitalize font-medium border border-amber-100">
                  Awaiting Validation
                </span>
              </div>

              {/* Evidence Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 bg-gray-50 p-6 rounded-md border border-gray-100">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 capitalize">
                    Designation
                  </p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {selectedEvidence.topic}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 capitalize">
                    Stratum
                  </p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {selectedEvidence.subject} • {selectedEvidence.className}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 capitalize">
                    Originator
                  </p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {selectedEvidence.teacherName}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 capitalize">Type</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {selectedEvidence.documentType}
                  </p>
                </div>
              </div>

              {/* Document Viewer */}
              <div className="mb-10">
                <h3 className="text-[11px] text-gray-400 capitalize mb-4">
                  Instructional Artifact Preview
                </h3>
                <div className="border border-gray-100 rounded-md bg-gray-50 overflow-hidden min-h-[400px]">
                  {selectedEvidence.documentType === "pdf" ? (
                    <iframe
                      src={selectedEvidence.documentUrl}
                      className="w-full h-[500px]"
                      title="Artifact Preview"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full p-4">
                      <img
                        src={selectedEvidence.documentUrl}
                        alt="Evidence Artifact"
                        className="max-w-full rounded shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Review Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <button
                  onClick={() => handleReviewClick("approved")}
                  className="flex-1 bg-gray-900 text-white py-4 rounded-md hover:bg-[#008000] flex items-center justify-center gap-3 text-[13px] capitalize transition shadow-sm active:scale-95"
                >
                  <CheckCircle size={18} />
                  Validate Submission
                </button>
                <button
                  onClick={() => handleReviewClick("rejected")}
                  className="flex-1 bg-white text-gray-700 border border-gray-100 py-4 rounded-md hover:bg-red-50 hover:text-red-700 hover:border-red-100 flex items-center justify-center gap-3 text-[13px] capitalize transition active:scale-95"
                >
                  <XCircle size={18} />
                  Decline Artifact
                </button>
              </div>

              {/* Review History */}
              {reviewHistory.length > 0 && (
                <div className="pt-8 border-t border-gray-100">
                  <h3 className="text-[11px] text-gray-400 capitalize mb-6">
                    Validation Logs
                  </h3>
                  <div className="space-y-4">
                    {reviewHistory.map((review) => (
                      <div
                        key={review.id}
                        className="p-4 bg-gray-50 rounded-md border border-gray-100 flex gap-4"
                      >
                        <div
                          className={`shrink-0 w-8 h-8 rounded flex items-center justify-center ${review.decision === "approved" ? "bg-green-100 text-[#008000]" : "bg-red-100 text-red-600"}`}
                        >
                          {review.decision === "approved" ? (
                            <CheckCircle size={16} />
                          ) : (
                            <XCircle size={16} />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {review.decision === "approved"
                                ? "Validated"
                                : "Declined"}
                            </p>
                            <span className="text-[10px] text-gray-400">
                              {review.reviewedAt?.toDate?.().toLocaleString() ||
                                "Recent Sync"}
                            </span>
                          </div>
                          <p className="text-[13px] text-gray-600 leading-relaxed mb-2">
                            {review.comments}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Processed by Principal Terminal •{" "}
                            {review.principalName}
                          </p>
                        </div>
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
        <div className="bg-white rounded-md border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-4 mb-10 text-center sm:text-left">
            <div
              className="bg-gray-50 p-2.5 rounded border border-gray-100"
              style={{ color: "#008000" }}
            >
              <History size={20} />
            </div>
            <div>
              <h2 className="text-xl text-gray-900 capitalize">
                Engagement History
              </h2>
              <p className="text-gray-400 text-[11px] capitalize mt-1">
                Processed Artifact Trace Log ({reviewedEvidence.length})
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviewedEvidence.map((evidence) => (
              <div
                key={evidence.id}
                className="p-5 border border-gray-50 rounded-md hover:border-green-100 transition-all cursor-pointer group"
                onClick={() => handleViewEvidence(evidence)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 capitalize group-hover:text-[#008000]">
                      {evidence.topic}
                    </h3>
                    <p className="text-[10px] text-gray-400 capitalize mt-0.5">
                      {evidence.subject} • {evidence.className}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Status:{" "}
                      <span
                        className={
                          evidence.status === "approved"
                            ? "text-[#008000]"
                            : "text-red-600"
                        }
                      >
                        {evidence.status === "approved"
                          ? "Validated"
                          : "Declined"}
                      </span>
                    </p>
                  </div>
                  <div
                    className={`p-1.5 rounded ${evidence.status === "approved" ? "bg-green-50 text-[#008000]" : "bg-red-50 text-red-600"}`}
                  >
                    {evidence.status === "approved" ? (
                      <CheckCircle size={14} />
                    ) : (
                      <XCircle size={14} />
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-400 capitalize pt-4 border-t border-gray-50">
                  <span>{evidence.teacherName}</span>
                  <span>
                    {evidence.submittedAt?.toDate?.().toLocaleDateString() ||
                      "Today"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-md p-10 max-w-lg w-full shadow-2xl border border-gray-100">
            <div className="flex items-center gap-4 mb-8">
              <div
                className={`p-3 rounded-full ${decision === "approved" ? "bg-green-50 text-[#008000]" : "bg-red-50 text-red-700"}`}
              >
                {decision === "approved" ? (
                  <CheckCircle size={24} />
                ) : (
                  <XCircle size={24} />
                )}
              </div>
              <div>
                <h2 className="text-2xl text-gray-900 capitalize leading-tight">
                  {decision === "approved" ? "Validate" : "Decline"} Protocol
                </h2>
                <p className="text-[13px] text-gray-400 capitalize mt-1">
                  Engagement Verification Required
                </p>
              </div>
            </div>

            <div className="mb-10">
              <label className="block text-[11px] text-gray-400 capitalize mb-3">
                Feedback Diagnostic Trace (3-500 characters) *
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className={`w-full p-6 bg-gray-50 border rounded-md h-40 text-[13px] focus:outline-none transition-all ${
                  comments.length > 0 &&
                  (comments.length < 3 || comments.length > 500)
                    ? "border-red-500 focus:bg-white"
                    : "border-transparent focus:bg-white focus:border-green-100"
                }`}
                placeholder="Enter structural feedback for the originator..."
              />
              <div className="flex justify-between items-center mt-3">
                <p
                  className={`text-[10px] capitalize ${comments.length > 500 ? "text-red-500 font-medium" : "text-gray-400"}`}
                >
                  {comments.length}/500 Characters Engaged
                </p>
                {comments.length > 0 && comments.length < 3 && (
                  <p className="text-[10px] text-red-500 font-medium capitalize">
                    Minimum 3 Required
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setComments("");
                }}
                className="flex-1 px-8 py-4 bg-white text-gray-700 border border-gray-100 rounded-md text-[13px] capitalize hover:bg-gray-50 transition"
              >
                Abort Protocol
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={
                  submitting || comments.length < 3 || comments.length > 500
                }
                className="flex-1 px-8 py-4 bg-gray-900 text-white rounded-md text-[13px] capitalize hover:bg-[#008000] disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-lg"
              >
                {submitting ? "Processing..." : "Execute Decision"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidenceApproval;
