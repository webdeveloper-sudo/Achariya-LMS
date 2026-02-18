import { X, Save } from "lucide-react";
import { allschoolsdata } from "@/data/global/global";
import { useState } from "react";
import axiosInstance from "@/api/axiosInstance";

interface AdminAddPrincipalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onPrincipalAdded: () => void;
}

const AdminAddPrincipalForm = ({
  isOpen,
  onClose,
  onPrincipalAdded,
}: AdminAddPrincipalFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    school: "",
    school_id: "", // String input for number
    password: "", // Optional initial password
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // Auto-suggest school_id if school is selected (simple logic for now)
    if (name === "school") {
      const isCollege = value.toLowerCase().includes("college");
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        school_id: isCollege ? "2" : "1", // Suggestion
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    // Basic Validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.mobile ||
      !formData.school ||
      !formData.school_id
    ) {
      setError(
        "All fields (Name, Email, Mobile, School, School ID) are required.",
      );
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post("/admin/principals/create", {
        ...formData,
        school_id: Number(formData.school_id),
      });

      // Success
      onPrincipalAdded(); // Refresh list
      onClose(); // Close modal
      // Reset form
      setFormData({
        name: "",
        email: "",
        mobile: "",
        school: "",
        school_id: "",
        password: "",
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create principal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Add New Principal
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 pt-4">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          </div>
        )}

        {/* FORM */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Principal Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Dr. Sarah Smith"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="principal@achariya.org"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Mobile No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. 9876543210"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Initial Password (Optional)
            </label>
            <input
              type="text"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-yellow-50"
              placeholder="Set initial password if needed"
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              School <span className="text-red-500">*</span>
            </label>
            <select
              name="school"
              value={formData.school}
              onChange={(e) => {
                const selectedSchoolName = e.target.value;
                const schoolObj = allschoolsdata.find(
                  (s) => s.name === selectedSchoolName,
                );

                setFormData((prev) => ({
                  ...prev,
                  school: selectedSchoolName,
                  school_id: schoolObj ? String(schoolObj.id) : "",
                }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select School</option>
              {allschoolsdata.map((school) => (
                <option key={school.id} value={school.name}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              School ID <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="school_id"
              value={formData.school_id}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-100 text-gray-600 cursor-not-allowed"
              placeholder="Auto-generated ID"
            />
            <p className="text-xs text-green-600 mt-1">
              ID is automatically assigned based on selected school.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
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
                Save Principal
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAddPrincipalForm;
