import { X, Save } from "lucide-react";
import { allschoolsdata, allsubjects, ALL_CLASSES} from "@/data/global/global";
import { useState } from "react";
import axiosInstance from "../../../../api/axiosInstance";

interface AdminAddTeacherFormProps {
  isOpen: boolean;
  onClose: () => void;
  onTeacherAdded: () => void;
}

const AdminAddTeacherForm = ({
  isOpen,
  onClose,
  onTeacherAdded,
}: AdminAddTeacherFormProps) => {
  const [formData, setFormData] = useState({
    userId: "",
    userName: "",
    branch: "",
    designation: "",
    joiningDate: "",
    mobileNo: "",
    email: "",
    qualifications: "",
    experience: "",
    subjects: [] as string[],
    gradesInCharge: [] as string[],
    status: "Active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArraySelection = (
    field: "subjects" | "gradesInCharge",
    value: string
  ) => {
    setFormData((prev) => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((item) => item !== value) };
      }
      if (current.length >= 5) {
        // Max 5 selection logic
        return prev;
      }
      return { ...prev, [field]: [...current, value] };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    // Basic Validation: Ensure simple required fields are present
    if (
      !formData.userId ||
      !formData.userName ||
      !formData.branch ||
      !formData.designation ||
      !formData.joiningDate ||
      !formData.qualifications ||
      !formData.experience ||
      formData.subjects.length === 0 ||
      formData.gradesInCharge.length === 0
    ) {
      setError("Please fill all required and mandatory fields.");
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post("/admin/teachers/create", formData);

      onTeacherAdded();
      onClose();
      setFormData({
        userId: "",
        userName: "",
        branch: "",
        designation: "",
        joiningDate: "",
        mobileNo: "",
        email: "",
        qualifications: "",
        experience: "",
        subjects: [],
        gradesInCharge: [],
        status: "Active",
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create teacher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-800">
            Add New Teacher
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {error && (
          <div className="px-6 pt-4">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          </div>
        )}

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              EMP ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. TCH1001"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              User Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Jane Doe"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Designation <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Senior Teacher"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Joining Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Qualifications <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="qualifications"
              value={formData.qualifications}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. M.Sc, B.Ed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Experience <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. 5 Years"
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Branch <span className="text-red-500">*</span>
            </label>
            <select
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select Branch</option>
              {allschoolsdata.map((school) => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Mobile No
            </label>
            <input
              type="text"
              name="mobileNo"
              value={formData.mobileNo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Optional"
            />
          </div>

          {/* Multi-select for Subjects */}
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              Subjects (Max 5) <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-gray-50 max-h-32 overflow-y-auto">
              {allsubjects.map((subj) => (
                <button
                  key={subj}
                  onClick={() => handleArraySelection("subjects", subj)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors border ${
                    formData.subjects.includes(subj)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  } ${
                    !formData.subjects.includes(subj) &&
                    formData.subjects.length >= 5
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={
                    !formData.subjects.includes(subj) &&
                    formData.subjects.length >= 5
                  }
                >
                  {subj}
                </button>
              ))}
            </div>
          </div>

          {/* Multi-select for Grades In Charge */}
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              Grades In Charge (Max 5) <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-gray-50 max-h-32 overflow-y-auto">
              {ALL_CLASSES.map((grade) => (
                <button
                  key={grade}
                  onClick={() => handleArraySelection("gradesInCharge", grade)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors border ${
                    formData.gradesInCharge.includes(grade)
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  } ${
                    !formData.gradesInCharge.includes(grade) &&
                    formData.gradesInCharge.length >= 5
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={
                    !formData.gradesInCharge.includes(grade) &&
                    formData.gradesInCharge.length >= 5
                  }
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Saving..."
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Teacher
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAddTeacherForm;
