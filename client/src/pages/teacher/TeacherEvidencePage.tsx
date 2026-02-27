import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Check,
  Loader2,
  FileText,
  Activity,
  Clock,
  ChevronRight,
} from "lucide-react";
import { teacherApi } from "../../api";

const TeacherEvidencePage = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedCourse, setSelectedCourse] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesRes, evidenceRes] = await Promise.all([
          teacherApi.getCourses(),
          teacherApi.getEvidence(),
        ]);
        setCourses(coursesRes.data.courses);
        setEvidenceList(evidenceRes.data.evidence);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        console.error("Failed to synchronize with evidence registry.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourse || !title || !description) {
      alert("Functional requirement: All parameters must be defined.");
      return;
    }

    try {
      setSubmitting(true);

      // Prepare FormData for file upload
      const formData = new FormData();
      formData.append("courseId", selectedCourse);
      formData.append("title", title);
      formData.append("description", description);
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      await teacherApi.submitEvidence(formData);

      // Show success
      setShowSuccess(true);

      // Reset form
      setSelectedCourse("");
      setTitle("");
      setDescription("");
      setSelectedFile(null);

      // Refresh list
      const evidenceRes = await teacherApi.getEvidence();
      setEvidenceList(evidenceRes.data.evidence);

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      console.error("Submission error:", err);
      alert("Terminal Error: Transmission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2
          className="w-12 h-12 animate-spin"
          style={{ color: "#c72323" }}
        />
        <p className="text-[12px] text-gray-500 animate-pulse capitalize">
          Accessing Evidence Vault...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Premium Header */}
      <div className="border-b border-gray-100 pb-12">
        <Link
          to="/teacher/dashboard"
          className="inline-flex items-center text-[13px] hover:text-[#c72323] mb-10 transition-colors capitalize"
          style={{ color: "#c72323" }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Operational Dashboard
        </Link>

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
              Evidence <span className="text-gray-400">Submission</span>
            </h1>
            <p className="text-gray-600 text-[15px] max-w-xl leading-relaxed mx-auto sm:mx-0">
              Official portal for uploading instructional artifacts, session
              logs, and performance evidence for institutional audit.
            </p>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed top-8 right-8 bg-gray-900 border-l-4 border-[#c72323] text-white px-8 py-5 rounded shadow-2xl flex items-center gap-4 animate-slide-in z-50 capitalize">
          <div className="bg-[#c72323] p-1 rounded-full">
            <Check className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[13px] text-white">Transmission Successful</p>
            <p className="text-gray-400 text-[11px] mt-1">
              Artifact Encrypted And Vaulted.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Upload Section */}
        <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden h-fit text-center sm:text-left">
          <div className="p-8 border-b border-gray-50">
            <h2 className="text-xl text-gray-900 capitalize">New Submission</h2>
            <p className="text-gray-600 text-[11px] mt-1 capitalize">
              Initialize Data Transfer
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div>
              <label className="block text-[12px] text-gray-600 mb-3 capitalize">
                Module Context
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-md px-4 py-3.5 text-sm text-gray-900 focus:ring-1 focus:ring-[#c72323] outline-none transition capitalize"
              >
                <option value="">Select Curricular Module...</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] text-gray-600 mb-3 capitalize">
                Artifact Designation
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Grade 4 Math Log V1"
                className="w-full bg-gray-50 border border-gray-100 rounded-md px-4 py-3.5 text-sm text-gray-900 focus:ring-1 focus:ring-[#c72323] outline-none transition capitalize"
              />
            </div>

            <div>
              <label className="block text-[12px] text-gray-600 mb-3 capitalize">
                Brief / Abstract
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Summary of submitted instructional artifacts..."
                className="w-full bg-gray-50 border border-gray-100 rounded-md px-4 py-3.5 text-sm text-gray-900 focus:ring-1 focus:ring-[#c72323] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[12px] text-gray-600 mb-3 capitalize">
                Source Attachment
              </label>
              <label className="border-2 border-dashed border-gray-100 rounded-md p-10 text-center hover:border-[#c72323]/30 transition cursor-pointer group block bg-gray-50/30">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="w-10 h-10 text-gray-300 mx-auto mb-4 group-hover:text-[#c72323] transition-colors" />
                {selectedFile ? (
                  <p className="text-[12px] text-[#c72323] capitalize">
                    {selectedFile.name}
                  </p>
                ) : (
                  <>
                    <p className="text-[12px] text-gray-500 capitalize">
                      Select Operational Document
                    </p>
                    <p className="text-[11px] text-gray-400 mt-2 capitalize">
                      PDF | JPG | PNG (MAX 10MB)
                    </p>
                  </>
                )}
              </label>
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
                  Authorize Transmission <ChevronRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* History Section */}
        <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden h-fit text-center sm:text-left">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-xl text-gray-900 capitalize">Registry Log</h2>
              <p className="text-gray-600 text-[11px] mt-1 capitalize">
                Archived Submissions
              </p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <Clock size={16} className="text-gray-400" />
            </div>
          </div>

          <div className="p-8 space-y-6">
            {evidenceList.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-[12px] capitalize">
                  No historical data found in registry.
                </p>
              </div>
            ) : (
              evidenceList.map((item: any) => (
                <div
                  key={item._id}
                  className="p-6 border border-gray-50 rounded-md hover:border-red-100 transition-colors relative group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-gray-900 text-sm capitalize group-hover:text-[#c72323] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-1 capitalize">
                        ID: {item._id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-[4px] text-[11px] capitalize border ${
                        item.status === "Approved"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : item.status === "Rejected"
                            ? "bg-red-50 text-red-600 border-red-100"
                            : "bg-gray-50 text-gray-500 border-gray-100"
                      }`}
                    >
                      {item.status || "Archived"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed capitalize">
                    {item.description || item.details}
                  </p>
                  <div className="flex items-center gap-4 text-[11px] text-gray-400 capitalize">
                    <span className="flex items-center gap-1.5">
                      <Activity size={12} /> {item.fileName || "Data Blob"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} />{" "}
                      {new Date(
                        item.timestamp || item.submittedAt,
                      ).toLocaleDateString()}
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

export default TeacherEvidencePage;
