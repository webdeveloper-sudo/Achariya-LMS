import { X, Save } from "lucide-react";
import { allschoolsdata, allsubjects, ALL_CLASSES } from "@/data/global/global";
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
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArraySelection = (
    field: "subjects" | "gradesInCharge",
    value: string,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white border border-black rounded-sm shadow-none w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="bg-black px-6 py-4 border-b border-black flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-[13px] font-bold text-white uppercase tracking-wider">
            Initialize Faculty Protocol
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 hover:bg-white/10 rounded-sm transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="px-6 pt-4">
            <div className="bg-white border border-black text-black px-4 py-2.5 rounded-sm text-[12px] font-medium uppercase tracking-wider">
              Error Profile: {error}
            </div>
          </div>
        )}

        {/* FORM BODY */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
          <div>
            <label className="block text-[11px] font-bold text-black uppercase mb-2 tracking-wider">
              Personnel ID <span className="text-gray-400">*</span>
            </label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-black text-[13px] rounded-sm focus:ring-1 focus:ring-black outline-none placeholder-gray-300"
              placeholder="e.g. TCH1001"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-black uppercase mb-2 tracking-wider">
              Faculty Name <span className="text-gray-400">*</span>
            </label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-black text-[13px] rounded-sm focus:ring-1 focus:ring-black outline-none placeholder-gray-300"
              placeholder="e.g. Jane Doe"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-black uppercase mb-2 tracking-wider">
              Administrative Rank <span className="text-gray-400">*</span>
            </label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-black text-[13px] rounded-sm focus:ring-1 focus:ring-black outline-none placeholder-gray-300"
              placeholder="e.g. Senior Teacher"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-black uppercase mb-2 tracking-wider">
              Initialization Date <span className="text-gray-400">*</span>
            </label>
            <input
              type="date"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-black text-[13px] rounded-sm focus:ring-1 focus:ring-black outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-black uppercase mb-2 tracking-wider">
              Credentials <span className="text-gray-400">*</span>
            </label>
            <input
              type="text"
              name="qualifications"
              value={formData.qualifications}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-black text-[13px] rounded-sm focus:ring-1 focus:ring-black outline-none placeholder-gray-300"
              placeholder="e.g. M.Sc, B.Ed"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-black uppercase mb-2 tracking-wider">
              Service Tenure <span className="text-gray-400">*</span>
            </label>
            <input
              type="text"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-black text-[13px] rounded-sm focus:ring-1 focus:ring-black outline-none placeholder-gray-300"
              placeholder="e.g. 5 Years"
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-[11px] font-bold text-black uppercase mb-2 tracking-wider">
              Branch Hub <span className="text-gray-400">*</span>
            </label>
            <select
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-black text-[13px] rounded-sm focus:ring-1 focus:ring-black outline-none bg-white"
            >
              <option value="">Select Branch</option>
              {allschoolsdata.map((school) => (
                <option key={school.id} value={school.name}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-black uppercase mb-2 tracking-wider">
              Operational Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-black text-[13px] rounded-sm focus:ring-1 focus:ring-black outline-none bg-white"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-black uppercase mb-2 tracking-wider">
              Comm Link (Mobile)
            </label>
            <input
              type="text"
              name="mobileNo"
              value={formData.mobileNo}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-black text-[13px] rounded-sm focus:ring-1 focus:ring-black outline-none placeholder-gray-300"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-black uppercase mb-2 tracking-wider">
              Secure Comm (Email)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-black text-[13px] rounded-sm focus:ring-1 focus:ring-black outline-none placeholder-gray-300"
              placeholder="Optional"
            />
          </div>

          {/* Multi-select for Subjects */}
          <div className="col-span-2">
            <label className="block text-[11px] font-bold text-black uppercase mb-3 tracking-wider">
              Instructional Subjects (Max 5){" "}
              <span className="text-gray-400">*</span>
            </label>
            <div className="flex flex-wrap gap-2 p-3 border border-black bg-white rounded-sm min-h-[80px]">
              {allsubjects.map((subj) => (
                <button
                  key={subj}
                  onClick={() => handleArraySelection("subjects", subj)}
                  className={`px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-all border ${
                    formData.subjects.includes(subj)
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-black hover:bg-gray-100"
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
            <label className="block text-[11px] font-bold text-black uppercase mb-3 tracking-wider">
              Assigned Cohorts (Max 5) <span className="text-gray-400">*</span>
            </label>
            <div className="flex flex-wrap gap-2 p-3 border border-black bg-white rounded-sm min-h-[80px]">
              {ALL_CLASSES.map((grade) => (
                <button
                  key={grade}
                  onClick={() => handleArraySelection("gradesInCharge", grade)}
                  className={`px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-all border ${
                    formData.gradesInCharge.includes(grade)
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-black hover:bg-gray-100"
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

        {/* FOOTER */}
        <div className="bg-white px-6 py-4 border-t border-black flex justify-end gap-3 sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-black text-black hover:bg-gray-50 text-[12px] uppercase tracking-wider font-bold rounded-sm transition-all"
          >
            Abort Initialization
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 bg-black text-white hover:bg-gray-800 text-[12px] uppercase tracking-wider font-bold rounded-sm transition-all flex items-center gap-2 border border-black disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {loading ? (
              "Executing..."
            ) : (
              <>
                <Save className="w-4 h-4" />
                Initialize Faculty
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAddTeacherForm;
