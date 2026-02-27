// Teacher Evidence Submission Page
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  submitEvidence,
  getTeacherSubmissions,
  type EvidenceSubmission,
} from "../../services/evidenceService";

const TeacherEvidenceSubmission = () => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [topic, setTopic] = useState("");
  const [selectedDoc, setSelectedDoc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState<EvidenceSubmission[]>([]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Demo documents available
  const demoDocuments = [
    {
      url: "/demo-evidence/sample-lesson-plan.pdf",
      name: "Newton's Laws - Lesson Plan",
      type: "pdf" as const,
    },
    {
      url: "/demo-evidence/sample-lab-report.pdf",
      name: "Chemistry Lab Report",
      type: "pdf" as const,
    },
    {
      url: "/demo-evidence/sample-certificate.jpg",
      name: "Teaching Certificate",
      type: "image" as const,
    },
  ];

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    const data = await getTeacherSubmissions(user.id || "teacher1");
    setSubmissions(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !className || !topic || !selectedDoc) {
      alert("Please fill all fields and select a document");
      return;
    }

    setSubmitting(true);
    try {
      const doc = demoDocuments.find((d) => d.url === selectedDoc);
      await submitEvidence({
        teacherId: user.id || "teacher1",
        teacherName: user.name || "Demo Teacher",
        subject,
        className,
        topic,
        documentUrl: selectedDoc,
        documentType: doc?.type || "pdf",
      });

      alert("Evidence submitted successfully!");
      setSubject("");
      setClassName("");
      setTopic("");
      setSelectedDoc("");
      loadSubmissions();
    } catch (error: any) {
      console.error("Submit error:", error);
      alert(`Failed to submit evidence: ${error.message || "Unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5" style={{ color: "#c72323" }} />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      default:
        return "Pending Review";
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Premium Header */}
      <div className="border-b border-gray-100 pb-12">
        <button
          onClick={() => navigate("/teacher/dashboard")}
          className="inline-flex items-center text-[13px] hover:text-[#c72323] mb-10 transition-colors capitalize"
          style={{ color: "#c72323" }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Operational Dashboard
        </button>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-center sm:text-left">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6 justify-center sm:justify-start">
              <div className="bg-red-50 p-2 rounded border border-red-100">
                <FileText className="w-5 h-5" style={{ color: "#c72323" }} />
              </div>
              <span
                className="text-[13px] capitalize"
                style={{ color: "#c72323" }}
              >
                Compliance Unit
              </span>
            </div>
            <h1 className="text-4xl text-gray-900 mb-6 leading-tight capitalize">
              Evidence <span className="text-gray-400">Archive</span>
            </h1>
            <p className="text-gray-600 text-[15px] max-w-xl leading-relaxed mx-auto sm:mx-0">
              Submit and track instructional artifacts for institutional
              verification and audit cycles.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Submission Form */}
        <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden h-fit text-center sm:text-left">
          <div className="p-8 border-b border-gray-50">
            <h2 className="text-xl text-gray-900 capitalize">New Submission</h2>
            <p className="text-gray-600 text-[11px] mt-1 capitalize">
              Register Instructional Artifact
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <label className="block text-[12px] text-gray-600 mb-3 capitalize">
                  Subject Domain
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-md px-4 py-3.5 text-sm text-gray-900 focus:ring-1 focus:ring-[#c72323] outline-none transition capitalize"
                  placeholder="e.g., Physics"
                />
              </div>
              <div>
                <label className="block text-[12px] text-gray-600 mb-3 capitalize">
                  Class Designation
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-md px-4 py-3.5 text-sm text-gray-900 focus:ring-1 focus:ring-[#c72323] outline-none transition capitalize"
                  placeholder="e.g., 10-A"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] text-gray-600 mb-3 capitalize">
                Session Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-md px-4 py-3.5 text-sm text-gray-900 focus:ring-1 focus:ring-[#c72323] outline-none transition capitalize"
                placeholder="e.g., Newton's Three Laws"
              />
            </div>

            <div>
              <label className="block text-[12px] text-gray-600 mb-3 capitalize">
                Artifact Source
              </label>
              <select
                value={selectedDoc}
                onChange={(e) => setSelectedDoc(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-md px-4 py-3.5 text-sm text-gray-900 focus:ring-1 focus:ring-[#c72323] outline-none transition capitalize"
              >
                <option value="">-- Select Curated Document --</option>
                {demoDocuments.map((doc) => (
                  <option key={doc.url} value={doc.url}>
                    {doc.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full ${submitting ? "bg-gray-100 cursor-wait" : "bg-gray-900 hover:bg-[#c72323]"} text-white py-4 rounded-md text-[13px] transition flex items-center justify-center gap-3 capitalize`}
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Authorize Submission <ChevronRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Submissions History */}
        <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden h-fit text-center sm:text-left">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-xl text-gray-900 capitalize">
                Submission Registry
              </h2>
              <p className="text-gray-600 text-[11px] mt-1 capitalize">
                Operational History
              </p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <Clock size={16} className="text-gray-400" />
            </div>
          </div>

          <div className="p-8 space-y-6">
            {submissions.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-[12px] capitalize">
                  No historical data found in registry.
                </p>
              </div>
            ) : (
              submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-6 border border-gray-50 rounded-md hover:border-red-100 transition-colors relative group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-sm text-gray-900 capitalize group-hover:text-[#c72323] transition-colors">
                        {sub.topic}
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-1 capitalize">
                        {sub.subject} — {sub.className}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(sub.status)}
                      <span className="text-[11px] capitalize font-medium text-gray-700">
                        {getStatusText(sub.status)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-gray-400 capitalize">
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} />{" "}
                      {sub.submittedAt?.toDate?.().toLocaleDateString() ||
                        "Recently Sync"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherEvidenceSubmission;
