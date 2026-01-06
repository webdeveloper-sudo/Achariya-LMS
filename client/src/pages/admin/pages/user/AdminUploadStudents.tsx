import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  X,
  Search,
  Table,
} from "lucide-react";
import axiosInstance from "../../../../api/axiosInstance";
import { allschoolsdata } from "@/data/global/global";
import * as XLSX from "xlsx";

const AdminUploadStudents = () => {
  const schoolOptions = allschoolsdata;

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [schoolSearch, setSchoolSearch] = useState("");
  const [showSchoolPicker, setShowSchoolPicker] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const filteredSchools = useMemo(() => {
    return schoolOptions.filter((s) =>
      s.toLowerCase().includes(schoolSearch.trim().toLowerCase())
    );
  }, [schoolOptions, schoolSearch]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];

    if (
      !validTypes.includes(selectedFile.type) &&
      !selectedFile.name.endsWith(".xlsx") &&
      !selectedFile.name.endsWith(".xls") &&
      !selectedFile.name.endsWith(".csv")
    ) {
      setError("Please upload a valid Excel file (.xlsx, .xls, or .csv)");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(null);
    setPreviewData([]);
    setHeaders([]);

    // Client-side preview
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { defval: "" });

        if (data && data.length > 0) {
          setPreviewData(data);
          // @ts-ignore
          setHeaders(Object.keys(data[0]));
        }
      } catch (err) {
        console.error("Preview error:", err);
        setError("Failed to parse Excel file for preview.");
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  /* New Cell Change Handler */
  const handleCellChange = (rowIndex: number, key: string, value: string) => {
    const updatedData = [...previewData];
    updatedData[rowIndex] = { ...updatedData[rowIndex], [key]: value };
    setPreviewData(updatedData);
  };

  const handleUpload = async () => {
    if (previewData.length === 0) {
      setError("No data to upload. Please load a valid file first.");
      return;
    }
    if (!selectedSchool) {
      setError("Please select a school before uploading.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Send JSON payload with School
      const response = await axiosInstance.post(
        "/admin/upload/students/bulk",
        {
          data: previewData,
          school: selectedSchool,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Upload response:", response.data);
      const msg = response.data.message || "Bulk import successful!";
      const details = response.data.saved
        ? ` (Saved: ${response.data.saved}, Skipped: ${
            response.data.skipped || 0
          })`
        : "";
      setSuccess(msg + details);

      // Reset
      setFile(null);
      setPreviewData([]);
      setHeaders([]);
    } catch (err: any) {
      console.error("Upload error:", err?.response?.data || err);
      setError(err.response?.data?.error || "Error uploading data");
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setError(null);
    setSuccess(null);
    setPreviewData([]);
    setHeaders([]);
  };

  return (
    <div>
      <Link
        to="/admin/users"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to User Management
      </Link>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Upload Students Data
        </h1>
      </div>

      {/* School Picker */}
      <div className="bg-white rounded-xl shadow-sm p-6 border mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-gray-700">Select School</p>
            <p className="text-xs text-gray-500">
              Choose a school before uploading student data.
            </p>
          </div>
          <div className="text-sm text-gray-600">
            {selectedSchool
              ? `Selected: ${selectedSchool}`
              : "No school selected"}
          </div>
        </div>

        <div className="relative">
          <div className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={schoolSearch}
              onFocus={() => setShowSchoolPicker(true)}
              onChange={(e) => {
                setSchoolSearch(e.target.value);
                setShowSchoolPicker(true);
              }}
              placeholder="Search school..."
              className="w-full outline-none text-sm"
            />
            <button
              type="button"
              onClick={() => setShowSchoolPicker((prev) => !prev)}
              className="text-xs text-blue-600 font-semibold"
            >
              {showSchoolPicker ? "Hide" : "Show"}
            </button>
          </div>

          {showSchoolPicker && (
            <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
              {filteredSchools.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-500">
                  No schools found
                </div>
              )}
              {filteredSchools.map((school) => (
                <button
                  key={school}
                  type="button"
                  onClick={() => {
                    setSelectedSchool(school);
                    setShowSchoolPicker(false);
                    setSchoolSearch(school);
                    setError(null);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${
                    selectedSchool === school
                      ? "bg-blue-50 font-semibold text-blue-700"
                      : "text-gray-800"
                  }`}
                >
                  {school}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Select Excel File {selectedSchool ? `- ${selectedSchool}` : ""}
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FileSpreadsheet className="w-4 h-4 inline mr-2" />
              Select Excel File (.xlsx, .xls, or .csv)
            </label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-2">
              Expected columns (mandatory): S. NO., ADM NO, STUDENT NAME, CLASS,
              SECTION, MOBILE NO. Optional: Email.
            </p>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {previewData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-6">
          <div className="p-6 border-b flex justify-between items-center bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Table className="w-5 h-5 mr-2 text-gray-500" />
              Data Preview & Edit ({previewData.length} rows)
            </h2>
          </div>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700 font-semibold border-b sticky top-0 z-10">
                <tr>
                  {headers.map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 whitespace-nowrap bg-gray-100"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {previewData.map((row: any, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {headers.map((h) => (
                      <td
                        key={`${i}-${h}`}
                        className="px-4 py-2 whitespace-nowrap min-w-[150px]"
                      >
                        <input
                          type="text"
                          value={row[h] || ""}
                          onChange={(e) =>
                            handleCellChange(i, h, e.target.value)
                          }
                          className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded bg-transparent focus:bg-white outline-none transition-colors"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Buttons (Below Preview) */}
      {previewData.length > 0 && (
        <div className="flex justify-end gap-4 mb-8">
          <button
            onClick={handleClear}
            className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel & Clear
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium shadow-lg"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading
              ? "Saving..."
              : `Save ${previewData.length} Records to Database`}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminUploadStudents;
