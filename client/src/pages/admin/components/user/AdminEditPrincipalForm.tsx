import { Save, Trash2, X } from "lucide-react";
import ConfirmationPopup from "../../../../components/ConfirmationPopup";
import { useState } from "react";
import { allschoolsdata } from "@/data/global/global";

interface AdminEditPrincipalFormProps {
  editFormData: any;
  setEditFormData: React.Dispatch<React.SetStateAction<any>>;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
}

const AdminEditPrincipalForm = ({
  editFormData,
  setEditFormData,
  onCancel,
  onSave,
  onDelete,
}: AdminEditPrincipalFormProps) => {
  const [deleteConfOpen, setDeleteConfOpen] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // Auto-update ID logic if needed, but risky on edit. Let's just update field.
    setEditFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">
            Edit Principal Details
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setDeleteConfOpen(true)}
              className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
              title="Delete Principal"
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
              Name
            </label>
            <input
              type="text"
              name="name"
              value={editFormData.name || ""}
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
              name="mobile"
              value={editFormData.mobile || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Email
            </label>
            <input
              type="email" // Read-only usually? Or editable.
              name="email"
              value={editFormData.email || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Reset Password
            </label>
            <input
              type="text"
              name="password"
              value={editFormData.password || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-yellow-50"
              placeholder="Enter new password to reset"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              School
            </label>
            <select
              name="school"
              value={editFormData.school || ""}
              onChange={(e) => {
                const selectedSchoolName = e.target.value;
                const schoolObj = allschoolsdata.find(
                  (s) => s.name === selectedSchoolName,
                );
                setEditFormData((prev: any) => ({
                  ...prev,
                  school: selectedSchoolName,
                  school_id: schoolObj ? schoolObj.id : prev.school_id,
                }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select School</option>
              {allschoolsdata.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              School ID
            </label>
            <input
              type="number"
              name="school_id"
              value={editFormData.school_id || ""}
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
            </select>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
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
        title="Delete Principal"
        message={`Are you sure you want to permanently delete ${editFormData.name}?`}
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

export default AdminEditPrincipalForm;
