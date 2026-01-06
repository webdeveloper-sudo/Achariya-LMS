import { Link } from "react-router-dom";
import { ArrowLeft, UserPlus, Edit2, X, Save } from "lucide-react";
import axiosInstance from "../../../../api/axiosInstance";
import { useEffect, useState, useMemo } from "react";
import AdminFilterComponent from "../../components/AdminFilterComponent";
import ConfirmationPopup from "../../../../components/ConfirmationPopup";
import AdminAddUserForm from "../../components/user/AdminAddUserForm";
import AdminEditUserForm from "../../components/user/AdminEditUserForm";

interface User {
  _id: string; // Assuming MongoDB _id
  id?: string;
  admissionNo: string;
  admissionno?: string; // Handle legacy case
  name: string;
  class: string;
  section: string;
  mobileNo: string;
  credits?: any[]; // Changed from number to array as per schema
  totalCredits?: number; // Added field
  school: string;
  status: string;
  role?: string;
  department?: string; // Handle legacy case
  email?: string;
  onboarded?: boolean;
}

const AdminUsersPage = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    school: "",
    class: "",
    section: "",
    status: "",
  });

  const [addNewUserOpen, setAddNewUserOpen] = useState(false);
  // Edit State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});

  // Confirmation State
  const [confirmPopup, setConfirmPopup] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isLoading: false,
  });

  useEffect(() => {
    fetchstudnets();
  }, []);

  const fetchstudnets = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/students");
      setAllUsers(res.data.students || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to extract unique values for filters
  const getUniqueValues = (key: keyof User | "department") => {
    return [
      ...new Set(
        allUsers
          .map((u) => {
            if (key === "class") return u.class || u.department;
            // Handle array/object properties safely if they are used here (though mostly strings)
            return u[key as keyof User];
          })
          .filter(Boolean)
      ),
    ];
  };

  const uniqueSchools = useMemo(
    () => getUniqueValues("school"),
    [allUsers]
  ) as string[];
  const uniqueClasses = useMemo(
    () => getUniqueValues("class"),
    [allUsers]
  ) as string[];
  const uniqueSections = useMemo(
    () => getUniqueValues("section"),
    [allUsers]
  ) as string[];
  const uniqueStatuses = useMemo(
    () => getUniqueValues("status"),
    [allUsers]
  ) as string[];

  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      const searchLower = searchQuery.toLowerCase();
      const userName = user.name?.toLowerCase() || "";
      const userAdm = (
        user.admissionNo ||
        user.admissionno ||
        ""
      ).toLowerCase();
      const userMobile = user.mobileNo
        ? String(user.mobileNo).toLowerCase()
        : "";

      const matchesSearch =
        userName.includes(searchLower) ||
        userAdm.includes(searchLower) ||
        userMobile.includes(searchLower);

      const matchesSchool = !filters.school || user.school === filters.school;
      const matchesClass =
        !filters.class || (user.class || user.department) === filters.class;
      const matchesSection =
        !filters.section || user.section === filters.section;
      const matchesStatus = !filters.status || user.status === filters.status;

      return (
        matchesSearch &&
        matchesSchool &&
        matchesClass &&
        matchesSection &&
        matchesStatus
      );
    });
  }, [allUsers, searchQuery, filters]);

  // Handle Edit Click
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditFormData({ ...user });
    setIsEditModalOpen(true);
  };

  // Handle Input Change in Edit Modal
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Save Update
  const handleUpdateClick = () => {
    setConfirmPopup({
      isOpen: true,
      title: "Confirm Update",
      message: `Are you sure you want to update details for ${editFormData.name}?`,
      onConfirm: executeUpdate,
      isLoading: false,
    });
  };

  const executeUpdate = async () => {
    if (!selectedUser) return;

    setConfirmPopup((prev) => ({ ...prev, isLoading: true }));
    try {
      const idToUpdate = selectedUser._id || selectedUser.id;

      await axiosInstance.put(`/admin/students/${idToUpdate}`, editFormData);

      // Update local state
      setAllUsers((prev) =>
        prev.map((u) =>
          u._id === idToUpdate || u.id === idToUpdate
            ? ({ ...u, ...editFormData } as User)
            : u
        )
      );

      setIsEditModalOpen(false);
      setConfirmPopup((prev) => ({ ...prev, isOpen: false }));
    } catch (err: any) {
      console.error("Failed to update user", err);
      alert(
        err.response?.data?.message ||
          "Failed to update user. Please try again."
      );
      setConfirmPopup((prev) => ({ ...prev, isLoading: false, isOpen: false }));
    }
  };

  const executeDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/admin/students/${id}`);
      // Update local UI
      setAllUsers((prev) => prev.filter((u) => u._id !== id && u.id !== id));
      setIsEditModalOpen(false); // Close the modal
    } catch (err: any) {
      console.error("Failed to delete user", err);
      alert(err.response?.data?.message || "Failed to delete user.");
    }
  };

  return (
    <div>
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm">Total Students: {allUsers.length}</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/users/upload"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Upload Students
          </Link>
          <button
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            onClick={() => setAddNewUserOpen(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add New User
          </button>
        </div>
        <AdminAddUserForm
          isOpen={addNewUserOpen}
          onClose={() => setAddNewUserOpen(false)}
          onUserAdded={fetchstudnets}
        />
      </div>

      <AdminFilterComponent
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search Name, Admission No, Mobile..."
        filters={filters}
        onFilterChange={(key, value) =>
          setFilters((prev) => ({ ...prev, [key]: value }))
        }
        filterOptions={{
          school: uniqueSchools.map((s) => ({ label: s, value: s })),
          class: uniqueClasses.map((c) => ({ label: c, value: c })),
          section: uniqueSections.map((s) => ({ label: s, value: s })),
          status: uniqueStatuses.map((s) => ({ label: s, value: s })),
        }}
      />

      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Admission No
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Section
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Mobile No
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Credits
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  School
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={`${user.role || "user"}-${user.id || user._id}`}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-800">
                        {user.admissionNo || user.admissionno}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">
                        {user.class || user.department}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-left">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.role === "Student"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {user.section}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-left text-sm font-semibold text-blue-600">
                      {user.mobileNo}
                    </td>
                    <td className="py-3 px-4 text-left text-sm font-semibold text-purple-600">
                      {user.totalCredits || 0}
                    </td>
                    <td className="py-3 px-4 text-left text-sm">
                      {user.school}
                    </td>
                    <td className="py-3 px-4 text-left">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    No users found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <AdminEditUserForm
          editFormData={editFormData}
          setEditFormData={setEditFormData}
          uniqueSchools={uniqueSchools}
          onCancel={() => setIsEditModalOpen(false)}
          onSave={handleUpdateClick}
          onDelete={() => {
            if (!selectedUser) return;
            const idToDelete = selectedUser._id || selectedUser.id;
            if (idToDelete) executeDelete(idToDelete);
          }}
        />
      )}
      <ConfirmationPopup
        isOpen={confirmPopup.isOpen}
        title={confirmPopup.title}
        message={confirmPopup.message}
        onConfirm={confirmPopup.onConfirm}
        onCancel={() => setConfirmPopup((prev) => ({ ...prev, isOpen: false }))}
        isLoading={confirmPopup.isLoading}
        type="warning"
        confirmText="Yes, Proceed"
      />
    </div>
  );
};

export default AdminUsersPage;
