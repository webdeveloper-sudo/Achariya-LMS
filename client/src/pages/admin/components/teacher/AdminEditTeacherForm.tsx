import { Save, Trash2, X } from "lucide-react";
import ConfirmationPopup from "../../../../components/ConfirmationPopup";
import { useState } from "react";
import { allschoolsdata, allsubjects, ALL_CLASSES} from "@/data/global/global";

interface AdminEditTeacherFormProps {
  editFormData: any;
  setEditFormData: React.Dispatch<React.SetStateAction<any>>;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
}

const AdminEditTeacherForm = ({
  editFormData,
  setEditFormData,
  onCancel,
  onSave,
  onDelete,
}: AdminEditTeacherFormProps) => {
  const [deleteConfOpen, setDeleteConfOpen] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArraySelection = (
    field: "subjects" | "gradesInCharge",
    value: string
  ) => {
    setEditFormData((prev: any) => {
      const current = prev[field] || [];
      if (current.includes(value)) {
        return {
          ...prev,
          [field]: current.filter((item: string) => item !== value),
        };
      }
      if (current.length >= 5) {
        return prev;
      }
      return { ...prev, [field]: [...current, value] };
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-lg font-bold text-gray-800">
            Edit Teacher Details
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setDeleteConfOpen(true)}
              className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
              title="Delete Teacher"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* FORM BODY */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              EMP ID
            </label>
            <input
              type="text"
              name="userId"
              value={editFormData.userId || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              disabled
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              User Name
            </label>
            <input
              type="text"
              name="userName"
              value={editFormData.userName || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Designation
            </label>
            <input
              type="text"
              name="designation"
              value={editFormData.designation || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Branch
            </label>
            <select
              name="branch"
              value={editFormData.branch || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select Branch</option>
              {allschoolsdata.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Joining Date
            </label>
            <input
              type="date"
              name="joiningDate"
              value={
                editFormData.joiningDate
                  ? new Date(editFormData.joiningDate)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Qualifications
            </label>
            <input
              type="text"
              name="qualifications"
              value={editFormData.qualifications || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Experience
            </label>
            <input
              type="text"
              name="experience"
              value={editFormData.experience || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Mobile No
            </label>
            <input
              type="text"
              name="mobileNo"
              value={editFormData.mobileNo || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={editFormData.email || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Status
            </label>
            <select
              name="status"
              value={editFormData.status || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          {/* Multi-select for Subjects */}
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              Subjects (Max 5)
            </label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-gray-50 max-h-32 overflow-y-auto">
              {allsubjects.map((subj) => {
                const isSelected = (editFormData.subjects || []).includes(subj);
                return (
                  <button
                    key={subj}
                    onClick={() => handleArraySelection("subjects", subj)}
                    className={`px-3 py-1 rounded-full text-xs transition-colors border ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    } ${
                      !isSelected && (editFormData.subjects || []).length >= 5
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={
                      !isSelected && (editFormData.subjects || []).length >= 5
                    }
                  >
                    {subj}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Multi-select for Grades In Charge */}
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              Grades In Charge (Max 5)
            </label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-gray-50 max-h-32 overflow-y-auto">
              {ALL_CLASSES.map((grade) => {
                const isSelected = (editFormData.gradesInCharge || []).includes(
                  grade
                );
                return (
                  <button
                    key={grade}
                    onClick={() =>
                      handleArraySelection("gradesInCharge", grade)
                    }
                    className={`px-3 py-1 rounded-full text-xs transition-colors border ${
                      isSelected
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    } ${
                      !isSelected &&
                      (editFormData.gradesInCharge || []).length >= 5
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={
                      !isSelected &&
                      (editFormData.gradesInCharge || []).length >= 5
                    }
                  >
                    {grade}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3 sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>

      <ConfirmationPopup
        isOpen={deleteConfOpen}
        title="Delete Teacher"
        message={`Are you sure you want to permanently delete ${editFormData.userName}? This action cannot be undone.`}
        confirmText="Yes, Delete"
        type="danger"
        onConfirm={() => {
          onDelete();
          setDeleteConfOpen(false);
        }}
        onCancel={() => setDeleteConfOpen(false)}
      />
    </div>
  );
};

export default AdminEditTeacherForm;
