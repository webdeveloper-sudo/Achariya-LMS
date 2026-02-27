import { Save, Trash2, X } from "lucide-react";
import ConfirmationPopup from "../../../../components/ConfirmationPopup";
import { useState } from "react";
import { allschoolsdata, allsubjects, ALL_CLASSES } from "@/data/global/global";

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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArraySelection = (
    field: "subjects" | "gradesInCharge",
    value: string,
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
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white border border-black rounded-sm shadow-none w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="bg-black px-6 py-4 border-b border-black flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-[13px] font-bold text-white uppercase tracking-wider">
            Edit Faculty Profile
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setDeleteConfOpen(true)}
              className="text-white/70 hover:text-white p-1 hover:bg-white/10 rounded-sm transition-colors"
              title="Delete Teacher"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onCancel}
              className="text-white/70 hover:text-white p-1 hover:bg-white/10 rounded-sm transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* FORM BODY */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
          <div>
            <label className="block text-[11px] font-bold text-black uppercase mb-2 tracking-wider">
              Personnel ID
            </label>
            <input
              type="text"
              name="userId"
              value={editFormData.userId || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 border border-black bg-gray-50 text-[13px] rounded-sm focus:ring-1 focus:ring-black outline-none"
              disabled
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-black uppercase mb-2 tracking-wider">
              Faculty Name
            </label>
            <input
              type="text"
              name="userName"
              value={editFormData.userName || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 border border-black text-[13px] rounded-sm focus:ring-1 focus:ring-black outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-black uppercase mb-2 tracking-wider">
              Administrative Rank
            </label>
            <input
              type="text"
              name="designation"
              value={editFormData.designation || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 border border-black text-[13px] rounded-sm focus:ring-1 focus:ring-black outline-none"
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-[11px] font-bold text-black uppercase mb-2 tracking-wider">
              Branch Hub
            </label>
            <select
              name="branch"
              value={editFormData.branch || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 border border-black text-[13px] rounded-sm focus:ring-1 focus:ring-black outline-none bg-white"
            >
              <option value="">Select Branch</option>
              {allschoolsdata.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-black uppercase mb-2 tracking-wider">
              Initialization Date
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
              className="w-full px-3 py-2.5 border border-black text-[13px] rounded-sm focus:ring-1 focus:ring-black outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-black uppercase mb-2 tracking-wider">
              Credentials
            </label>
            <input
              type="text"
              name="qualifications"
              value={editFormData.qualifications || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 border border-black text-[13px] rounded-sm focus:ring-1 focus:ring-black outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-black uppercase mb-2 tracking-wider">
              Service Tenure
            </label>
            <input
              type="text"
              name="experience"
              value={editFormData.experience || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 border border-black text-[13px] rounded-sm focus:ring-1 focus:ring-black outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-black uppercase mb-2 tracking-wider">
              Comm Link (Mobile)
            </label>
            <input
              type="text"
              name="mobileNo"
              value={editFormData.mobileNo || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 border border-black text-[13px] rounded-sm focus:ring-1 focus:ring-black outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-black uppercase mb-2 tracking-wider">
              Secure Comm (Email)
            </label>
            <input
              type="email"
              name="email"
              value={editFormData.email || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 border border-black text-[13px] rounded-sm focus:ring-1 focus:ring-black outline-none"
            />
          </div>

          {editFormData.activated && (
            <div>
              <label className="block text-[11px] font-bold text-black uppercase mb-2 tracking-wider">
                Reset Password (Leave empty to keep)
              </label>
              <input
                type="text"
                name="password"
                value={editFormData.password || ""}
                onChange={handleInputChange}
                placeholder="Enter new password"
                className="w-full px-3 py-2.5 border border-black bg-gray-50 text-[13px] rounded-sm focus:ring-1 focus:ring-black outline-none"
                autoComplete="off"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-black uppercase mb-2 tracking-wider">
              Operational Status
            </label>
            <select
              name="status"
              value={editFormData.status || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 border border-black text-[13px] rounded-sm focus:ring-1 focus:ring-black outline-none bg-white"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          {/* Multi-select for Subjects */}
          <div className="col-span-2">
            <label className="block text-[11px] font-bold text-black uppercase mb-3 tracking-wider">
              Instructional Subjects (Max 5)
            </label>
            <div className="flex flex-wrap gap-2 p-3 border border-black bg-white rounded-sm min-h-[80px]">
              {allsubjects.map((subj) => {
                const isSelected = (editFormData.subjects || []).includes(subj);
                return (
                  <button
                    key={subj}
                    onClick={() => handleArraySelection("subjects", subj)}
                    className={`px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-all border ${
                      isSelected
                        ? "bg-black text-white border-black"
                        : "bg-white text-black border-black hover:bg-gray-100"
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
            <label className="block text-[11px] font-bold text-black uppercase mb-3 tracking-wider">
              Assigned Cohorts (Max 5)
            </label>
            <div className="flex flex-wrap gap-2 p-3 border border-black bg-white rounded-sm min-h-[80px]">
              {ALL_CLASSES.map((grade) => {
                const isSelected = (editFormData.gradesInCharge || []).includes(
                  grade,
                );
                return (
                  <button
                    key={grade}
                    onClick={() =>
                      handleArraySelection("gradesInCharge", grade)
                    }
                    className={`px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-all border ${
                      isSelected
                        ? "bg-black text-white border-black"
                        : "bg-white text-black border-black hover:bg-gray-100"
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
        <div className="bg-white px-6 py-4 border-t border-black flex justify-end gap-3 sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-black text-black hover:bg-gray-50 text-[12px] uppercase tracking-wider font-bold rounded-sm transition-all"
          >
            Abort
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-5 py-2.5 bg-black text-white hover:bg-gray-800 text-[12px] uppercase tracking-wider font-bold rounded-sm transition-all flex items-center shadow-none active:scale-95 border border-black"
          >
            <Save className="w-4 h-4 mr-2" />
            Commit Changes
          </button>
        </div>
      </div>

      <ConfirmationPopup
        isOpen={deleteConfOpen}
        title="Administer Personnel Purge"
        message={`Authorize permanent deletion algorithm for personnel: ${editFormData.userName}? Reversal not possible.`}
        confirmText="Confirm Purge"
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
