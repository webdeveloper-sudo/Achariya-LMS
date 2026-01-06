import { Save, Trash2, X } from "lucide-react";
import ConfirmationPopup from "../../../../components/ConfirmationPopup";
import { useState } from "react";

interface AdminEditUserFormProps {
  editFormData: any;
  setEditFormData: React.Dispatch<React.SetStateAction<any>>;
  uniqueSchools: string[];
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void; // New prop for delete action
}

const AdminEditUserForm = ({
  editFormData,
  setEditFormData,
  uniqueSchools,
  onCancel,
  onSave,
  onDelete,
}: AdminEditUserFormProps) => {
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

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Edit User Details</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setDeleteConfOpen(true)}
              className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
              title="Delete User"
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
              Admission No
            </label>
            <input
              type="text"
              name="admissionNo"
              value={editFormData.admissionNo || editFormData.admissionno || ""}
              onChange={(e) => {
                handleInputChange(e);
                setEditFormData((prev: any) => ({
                  ...prev,
                  admissionno: e.target.value,
                }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Class
            </label>
            <input
              type="text"
              name="class"
              value={editFormData.class || editFormData.department || ""}
              onChange={(e) => {
                handleInputChange(e);
                setEditFormData((prev: any) => ({
                  ...prev,
                  department: e.target.value,
                }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Section
            </label>
            <input
              type="text"
              name="section"
              value={editFormData.section || ""}
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

          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              School
            </label>
            <select
              name="school"
              value={editFormData.school || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select School</option>
              {uniqueSchools.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
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
        title="Delete User"
        message={`Are you sure you want to permanently delete ${editFormData.name}? This action cannot be undone.`}
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

export default AdminEditUserForm;
