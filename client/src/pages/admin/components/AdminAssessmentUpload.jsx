import React, { useState, useEffect, useMemo } from "react";
import {
  Upload,
  FileSpreadsheet,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Save,
  X,
} from "lucide-react";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import axiosInstance from "@/api/axiosInstance";

const EditQuestionModal = ({ question, onSave, onCancel }) => {
  const [editedQ, setEditedQ] = useState({ ...question });

  const handleChange = (field, value) => {
    setEditedQ((prev) => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (idx, value) => {
    const newOptions = [...editedQ.options];
    newOptions[idx] = value;
    setEditedQ((prev) => ({ ...prev, options: newOptions }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
          <h3 className="text-lg font-bold text-gray-800">
            Edit Question {editedQ.questionNumber}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Text
            </label>
            <textarea
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 box-border text-black bg-white"
              rows="3"
              value={editedQ.questionText}
              onChange={(e) => handleChange("questionText", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marks
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 box-border text-black bg-white"
                value={editedQ.marks}
                onChange={(e) => handleChange("marks", Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-600 capitalize">
                {editedQ.questionType?.replace("_", " ")}
              </div>
            </div>
          </div>

          {/* Options Editor for MCQ */}
          {(editedQ.questionType === "choose" ||
            editedQ.questionType === "multiple-choice") && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Options
              </label>
              {editedQ.options?.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm font-bold w-6 text-gray-700">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-blue-500 box-border text-black bg-white"
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                  />
                </div>
              ))}
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correct Answer (Option Letter)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 uppercase box-border text-black bg-white"
                  value={editedQ.correctAnswer}
                  onChange={(e) =>
                    handleChange("correctAnswer", e.target.value.toUpperCase())
                  }
                  maxLength={1}
                />
              </div>
            </div>
          )}

          {/* Simple Answer Editor for others */}
          {(editedQ.questionType === "fillups" ||
            editedQ.questionType === "short_answer" ||
            editedQ.questionType === "true_false" ||
            editedQ.questionType === "fill-ups") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correct Answer
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 box-border text-black bg-white"
                value={editedQ.correctAnswer}
                onChange={(e) => handleChange("correctAnswer", e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border hover:bg-gray-50 rounded-lg font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(editedQ)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper component for rendering individual question previews
const QuestionPreview = ({ question, index, onEdit }) => (
  <div className="bg-white rounded-xl shadow-sm border p-6 transition hover:shadow-md relative group">
    <button
      onClick={() => onEdit(index)}
      className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 rounded-lg transition opacity-0 group-hover:opacity-100 border border-gray-200"
      title="Edit Question"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 3a2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
      </svg>
    </button>
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3">
        <span className="bg-gray-100 text-gray-700 font-bold px-3 py-1 rounded text-sm">
          Q{index + 1}
        </span>
        <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-1 rounded uppercase">
          {question.questionType?.replace("_", " ") || "Question"}
        </span>
        <span className="text-sm text-gray-500 font-medium">
          {question.marks} Marks
        </span>
      </div>
    </div>

    <div className="mb-4">
      <p className="text-lg font-medium text-gray-800">
        {question.questionText}
      </p>
      {/* Show images for Diagram MCQ or general images */}
      {(question.previewImages?.length > 0 || question.images?.length > 0) && (
        <div className="mt-3 flex gap-4 overflow-x-auto pb-2">
          {(question.previewImages || question.images).map((src, i) => (
            <img
              key={i}
              src={src}
              alt="Question visual"
              className="h-32 w-auto object-cover rounded-lg border shadow-sm"
            />
          ))}
        </div>
      )}
    </div>

    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
      {/* Table MCQ - Show Table Rows */}
      {question.questionType === "table-mcq" && question.tableRows && (
        <div className="mb-4 bg-white p-3 rounded border">
          <table className="w-full text-sm">
            <tbody>
              {question.tableRows.map((row, idx) => (
                <tr key={idx} className="border-b last:border-0">
                  <td className="py-2 px-2">{row}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Options for Choose, Diagram MCQ, and Table MCQ */}
      {(question.questionType === "choose" ||
        question.questionType === "multiple-choice" ||
        question.questionType === "diagram-mcq" ||
        question.questionType === "table-mcq") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {question.options?.map((opt, i) => {
            const optionLabel = String.fromCharCode(65 + i);
            // Handle both letter (A,B,C) and value matching for correctness
            const isCorrect =
              question.correctAnswer === optionLabel ||
              question.correctAnswer === opt;
            return (
              <div
                key={i}
                className={`p-3 rounded border flex items-center ${isCorrect ? "bg-green-50 border-green-200" : "bg-white"}`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${isCorrect ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"}`}
                >
                  {optionLabel}
                </span>
                <span
                  className={
                    isCorrect ? "text-green-800 font-medium" : "text-gray-700"
                  }
                >
                  {opt}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {(question.questionType === "fillups" ||
        question.questionType === "short_answer" ||
        question.questionType === "fill-ups") && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-600">Answer:</span>
          <div className="px-4 py-2 bg-green-50 border border-green-200 text-green-800 rounded font-medium">
            {question.correctAnswer}
          </div>
        </div>
      )}

      {(question.questionType === "true_false" ||
        question.questionType === "true-false") && (
        <div className="flex gap-4">
          {["TRUE", "FALSE"].map((val) => (
            <div
              key={val}
              className={`px-6 py-2 rounded-lg border font-medium ${String(question.correctAnswer).toUpperCase() === val ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600"}`}
            >
              {val}
            </div>
          ))}
        </div>
      )}

      {question.questionType === "match" && (
        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
          {question.pairs?.map((pair, idx) => (
            <React.Fragment key={idx}>
              <div className="bg-white p-2 border rounded text-right pr-4 border-r-4 border-r-blue-200">
                {pair.left}
              </div>
              <div className="bg-white p-2 border rounded pl-4 border-l-4 border-l-green-200">
                {pair.right}
              </div>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  </div>
);

const AdminAssessmentUpload = ({ onSave, onCancel, initialData }) => {
  const [excelFile, setExcelFile] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [imageMap, setImageMap] = useState({}); // filename -> objectURL (for preview)
  const [imageBlobs, setImageBlobs] = useState({}); // filename -> Blob (for upload)

  // New States for Assessment Metadata
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Edit State
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setQuestions(initialData.questions || []);
    }
  }, [initialData]);

  const handleEditQuestion = (index) => {
    setEditingIndex(index);
  };

  const handleUpdateQuestion = (updatedQ) => {
    const newQuestions = [...questions];
    newQuestions[editingIndex] = updatedQ;
    setQuestions(newQuestions);
    setEditingIndex(null);
  };

  // const handleExcelChange = (e) => {
  //   const file = e.target.files?.[0];
  //   if (file) setExcelFile(file);
  // };

  const handleZipChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setZipFile(file);
  };

  const processFiles = async () => {
    if (!title.trim()) {
      setError("Please enter an Assessment Title.");
      return;
    }
    if (!excelFile) {
      setError("Please upload an Excel file.");
      return;
    }

    setParsing(true);
    setError(null);
    setQuestions([]);

    try {
      // 1. Process ZIP if present
      const imgMap = {};
      const blobMap = {};
      if (zipFile) {
        const zip = new JSZip();
        const contents = await zip.loadAsync(zipFile);

        const imagePromises = [];
        contents.forEach((relativePath, zipEntry) => {
          if (
            !zipEntry.dir &&
            relativePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)
          ) {
            imagePromises.push(
              (async () => {
                const blob = await zipEntry.async("blob");
                const url = URL.createObjectURL(blob);
                const filename = relativePath.split("/").pop() || relativePath;
                imgMap[filename] = url;
                blobMap[filename] = blob;
              })(),
            );
          }
        });

        await Promise.all(imagePromises);
        setImageMap(imgMap);
        setImageBlobs(blobMap);

        if (Object.keys(imgMap).length === 0) {
          setError(
            "No valid images found in ZIP. Please check file structure.",
          );
        } else {
          // Optional: Show success message via ephemeral state or simple alert logic?
          // For now, let's just proceed. The 'imageMap' state will update the UI count.
        }
      }

      // 2. Process Excel
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const extractedQuestions = [];

          workbook.SheetNames.forEach((sheetName) => {
            const ws = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(ws);

            let type = "choose";
            const lowerSheet = sheetName.toLowerCase();
            if (
              lowerSheet.includes("mcq") &&
              !lowerSheet.includes("diagram") &&
              !lowerSheet.includes("table")
            )
              type = "choose";
            else if (
              lowerSheet.includes("true") ||
              lowerSheet.includes("false")
            )
              type = "true_false";
            else if (lowerSheet.includes("fill")) type = "fillups";
            else if (lowerSheet.includes("match")) type = "match";
            else if (lowerSheet.includes("diagram")) type = "diagram-mcq";
            else if (lowerSheet.includes("table")) type = "table-mcq";

            rows.forEach((row, index) => {
              const q = {
                id: row.question_id || `${sheetName}-${index}`,
                questionType: type, // Ensure backend compatibility
                questionText: row.question_text || row.question || "", // Fallback
                marks: Number(row.marks) || 1,
                difficulty: row.difficulty || "Easy",
                hint: row.hint,
                explanation: row.explanation,
                imageKeys: row.image_keys
                  ? row.image_keys
                      .toString()
                      .split(/[,;]/)
                      .map((k) => k.trim())
                  : undefined,
              };

              if (
                type === "choose" ||
                type === "diagram-mcq" ||
                type === "table-mcq"
              ) {
                q.options = row.options
                  ? row.options
                      .toString()
                      .split(/[,;]/)
                      .map((o) => o.trim())
                  : [];
                q.correctAnswer = row.correct_answer || row.correct_option;
                // Map correct_option (A, B, C) to the actual value if needed, or keep as is.
                // Backend expects 'answer' field to be populated.
                // For types that need 'correctOption', standardizing to 'correctAnswer' is good.
              }

              if (type === "table-mcq") {
                q.tableRows = row.table_rows
                  ? row.table_rows
                      .toString()
                      .split(/[,;]/)
                      .map((r) => r.trim())
                  : [];
                // Using regex split for robust handling
              }

              if (type === "true_false") {
                q.correctAnswer = row.correct_answer;
              }

              if (type === "fillups") {
                q.correctAnswer = row.correct_answer;
              }

              if (type === "match") {
                if (row.pairs) {
                  q.pairs = row.pairs
                    .toString()
                    .split(",")
                    .map((p) => {
                      const [left, right] = p.split("|");
                      return { left: left?.trim(), right: right?.trim() };
                    });
                }
              }

              if (q.imageKeys) {
                // For preview
                q.previewImages = q.imageKeys
                  .map((key) => imgMap[key])
                  .filter(Boolean);
                // For backend logic (we'll replace these with real URLs later)
                q.images = q.imageKeys;
                // Set single image field for Diagram MCQ if it expects one
                if (q.images.length > 0) q.image = q.images[0];
              }

              extractedQuestions.push(q);
            });
          });

          setQuestions(extractedQuestions);
          setParsing(false);
          if (extractedQuestions.length === 0) setError("No questions found.");
        } catch (err) {
          console.error(err);
          setError("Failed to parse Excel file.");
          setParsing(false);
        }
      };
      reader.readAsBinaryString(excelFile);
    } catch (err) {
      console.error(err);
      setError("Error processing files.");
      setParsing(false);
    }
  };

  const handleSave = async () => {
    setUploading(true);
    try {
      let finalQuestions = [...questions];

      // 1. Upload Images if any
      if (Object.keys(imageBlobs).length > 0) {
        const formData = new FormData();
        Object.entries(imageBlobs).forEach(([filename, blob]) => {
          formData.append("files", blob, filename);
        });

        // Clean temp first (optional but good practice)
        try {
          await axiosInstance.post(`/admin/upload/cleanup-temp/images`);
        } catch (e) {}

        // Upload Bulk
        const uploadRes = await axiosInstance.post(
          `/admin/upload/asset/bulk/images`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );

        if (uploadRes.data.success) {
          // 1.1 Map StoredFilename -> OriginalName
          // uploadRes.data.files = [{ filename: '123-orig.png', originalName: 'orig.png', ... }]
          const storedToOriginal = {};
          uploadRes.data.files.forEach((f) => {
            storedToOriginal[f.filename] = f.originalName;
          });

          // Save to permanent
          const saveRes = await axiosInstance.post(
            `/admin/upload/save/all/images`,
          );

          if (saveRes.data.success) {
            const savedFiles = saveRes.data.savedFiles; // [{ filename: '123-orig.png', url: '...' }]
            const urlMap = {};

            savedFiles.forEach((f) => {
              const originalName = storedToOriginal[f.filename];
              if (originalName) {
                urlMap[originalName] = f.url;
              }
            });

            // 2. Replace image keys with real URLs & Map types
            finalQuestions = finalQuestions.map((q) => {
              let newType = q.questionType;
              if (q.questionType === "choose") newType = "multiple-choice";
              else if (q.questionType === "true_false") newType = "true-false";
              else if (q.questionType === "fillups") newType = "fill-ups";
              else if (q.questionType === "match") {
                newType = "match";
                // Match questions might need a dummy answer if backend requires it (though we relaxed schema)
                if (!q.correctAnswer) q.correctAnswer = "Match the pairs";
              }

              if (q.images && q.images.length > 0) {
                const realUrls = q.images
                  .map((key) => urlMap[key])
                  .filter(Boolean);
                // If we found URLs, replace. If not (e.g. mapping failed), keep original (or clear?)
                // Better to keep original if mapping failed so user can debug, BUT
                // user requested mapping. If mapping works, 'realUrls' has data.

                // NOTE: If realUrls is empty but images was NOT, it means mapping failed.
                // We should probably log this.

                if (realUrls.length > 0) {
                  return {
                    ...q,
                    questionType: newType,
                    images: realUrls,
                    image: realUrls[0] || null,
                    previewImages: undefined,
                  };
                }
              }

              // Fallback or No Images
              return { ...q, questionType: newType, previewImages: undefined };
            });
          }
        } else {
          throw new Error("Upload failed during bulk processing");
        }
      } else {
        // If no images to upload, just map types
        finalQuestions = finalQuestions.map((q) => {
          let newType = q.questionType;
          if (q.questionType === "choose") newType = "multiple-choice";
          else if (q.questionType === "true_false") newType = "true-false";
          else if (q.questionType === "fillups") newType = "fill-ups";
          else if (q.questionType === "match") {
            newType = "match";
            if (!q.correctAnswer) q.correctAnswer = "Match the pairs";
          }
          return { ...q, questionType: newType, previewImages: undefined };
        });
      }

      onSave(finalQuestions, title, description);
    } catch (err) {
      console.error("Upload failed", err);
      setError("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleExcelChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setExcelFile(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-white">
          <h2 className="text-xl font-bold text-gray-800">
            {initialData ? "Edit Assessment" : "Upload Assessment Questions"}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center border border-red-200">
              <AlertCircle className="w-5 h-5 mr-3" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assessment Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Module 1 Final Quiz"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of this assessment..."
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 bg-white">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-800">Upload Excel</h3>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelChange}
                className="mt-2 block w-full text-sm text-gray-500"
              />
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-500 bg-white">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-800">Upload Images ZIP</h3>
              <input
                type="file"
                accept=".zip"
                onChange={handleZipChange}
                className="mt-2 block w-full text-sm text-gray-500"
              />
              {Object.keys(imageMap).length > 0 && (
                <p className="text-xs text-green-600 font-bold mt-2">
                  {Object.keys(imageMap).length} images identified
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-center mb-8">
            <button
              onClick={processFiles}
              disabled={parsing || !excelFile || !title.trim()}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
            >
              {parsing ? "Processing..." : "Process Files & Preview"}
            </button>
          </div>

          {questions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">
                Preview ({questions.length} Questions)
              </h3>
              {questions.map((q, i) => (
                <QuestionPreview
                  key={i}
                  question={q}
                  index={i}
                  onEdit={handleEditQuestion}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-white flex justify-end gap-3 z-10">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={questions.length === 0 || uploading}
            className="px-6 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center shadow-lg transition font-medium disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {uploading ? "Uploading Images..." : "Confirm & Save Assessment"}
          </button>
        </div>

        {editingIndex !== null && (
          <EditQuestionModal
            question={questions[editingIndex]}
            onSave={handleUpdateQuestion}
            onCancel={() => setEditingIndex(null)}
          />
        )}
      </div>
    </div>
  );
};

export default AdminAssessmentUpload;
