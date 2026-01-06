import { Link } from "react-router-dom";
import { ArrowLeft, UserPlus, Edit2 } from "lucide-react";
import axiosInstance from "../../../../api/axiosInstance";
import { useEffect, useState, useMemo } from "react";
import AdminFilterComponent from "../../components/AdminFilterComponent";
import ConfirmationPopup from "../../../../components/ConfirmationPopup";
import AdminAddTeacherForm from "../../components/teacher/AdminAddTeacherForm";
import AdminEditTeacherForm from "../../components/teacher/AdminEditTeacherForm";

interface Teacher {
  _id: string;
  userId: string;
  userName: string;
  branch: string;
  designation: string;
  joiningDate: string;
  mobileNo: string;
  email: string;
  status: string;
  subjects: string[];
  gradesInCharge: string[];
  qualifications: string;
  experience: string;
}

const AdminTeachersPage = () => {
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    branch: "",
    designation: "",
    status: "",
  });

  const [addNewTeacherOpen, setAddNewTeacherOpen] = useState(false);
  // Edit State
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Teacher>>({});

  // Confirmation State
  const [confirmPopup, setConfirmPopup] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isLoading: false,
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/teachers");
      setAllTeachers(res.data.teachers || []);
      console.log("Teachers", res.data.teachers);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to extract unique values for filters
  const getUniqueValues = (key: keyof Teacher) => {
    return [
      ...new Set(allTeachers.map((u) => u[key] as string).filter(Boolean)),
    ];
  };

  const uniqueBranches = useMemo(
    () => getUniqueValues("branch"),
    [allTeachers]
  ) as string[];
  const uniqueDesignations = useMemo(
    () => getUniqueValues("designation"),
    [allTeachers]
  ) as string[];
  const uniqueStatuses = useMemo(
    () => getUniqueValues("status"),
    [allTeachers]
  ) as string[];

  const filteredTeachers = useMemo(() => {
    return allTeachers.filter((teacher) => {
      const searchLower = searchQuery.toLowerCase();
      const teacherName = teacher.userName?.toLowerCase() || "";
      const teacherId = teacher.userId?.toLowerCase() || "";
      const teacherMobile = teacher.mobileNo
        ? String(teacher.mobileNo).toLowerCase()
        : "";

      const matchesSearch =
        teacherName.includes(searchLower) ||
        teacherId.includes(searchLower) ||
        teacherMobile.includes(searchLower);

      const matchesBranch =
        !filters.branch || teacher.branch === filters.branch;
      const matchesDesignation =
        !filters.designation || teacher.designation === filters.designation;
      const matchesStatus =
        !filters.status || teacher.status === filters.status;

      return (
        matchesSearch && matchesBranch && matchesDesignation && matchesStatus
      );
    });
  }, [allTeachers, searchQuery, filters]);

  // Handle Edit Click
  const handleEditClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setEditFormData({ ...teacher });
    setIsEditModalOpen(true);
  };

  // Handle Save Update
  const handleUpdateClick = () => {
    setConfirmPopup({
      isOpen: true,
      title: "Confirm Update",
      message: `Are you sure you want to update details for ${editFormData.userName}?`,
      onConfirm: executeUpdate,
      isLoading: false,
    });
  };

  const executeUpdate = async () => {
    if (!selectedTeacher) return;

    setConfirmPopup((prev) => ({ ...prev, isLoading: true }));
    try {
      const idToUpdate = selectedTeacher._id;

      await axiosInstance.put(`/admin/teachers/${idToUpdate}`, editFormData);

      // Update local state
      setAllTeachers((prev) =>
        prev.map((t) =>
          t._id === idToUpdate ? ({ ...t, ...editFormData } as Teacher) : t
        )
      );

      setIsEditModalOpen(false);
      setConfirmPopup((prev) => ({ ...prev, isOpen: false }));
    } catch (err: any) {
      console.error("Failed to update teacher", err);
      alert(
        err.response?.data?.message ||
          "Failed to update teacher. Please try again."
      );
      setConfirmPopup((prev) => ({ ...prev, isLoading: false, isOpen: false }));
    }
  };

  const executeDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/admin/teachers/${id}`);
      // Update local UI
      setAllTeachers((prev) => prev.filter((t) => t._id !== id));
      setIsEditModalOpen(false); // Close the modal
    } catch (err: any) {
      console.error("Failed to delete teacher", err);
      alert(err.response?.data?.message || "Failed to delete teacher.");
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
         <h1 className="text-3xl font-bold text-gray-800">Teacher Management</h1>
        <p className="text-sm">Total Teachers: {allTeachers.length}</p>
       </div>
        <div className="flex gap-3">
          <Link
            to="/admin/teachers/upload"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Upload Teachers
          </Link>
          <button
            onClick={() => setAddNewTeacherOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add New Teacher
          </button>
        </div>
        <AdminAddTeacherForm
          isOpen={addNewTeacherOpen}
          onClose={() => setAddNewTeacherOpen(false)}
          onTeacherAdded={fetchTeachers}
        />
      </div>

      <AdminFilterComponent
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search Name, User ID, Mobile..."
        filters={filters}
        onFilterChange={(key, value) =>
          setFilters((prev) => ({ ...prev, [key]: value }))
        }
        filterOptions={{
          branch: uniqueBranches.map((s) => ({ label: s, value: s })),
          designation: uniqueDesignations.map((s) => ({ label: s, value: s })),
          status: uniqueStatuses.map((s) => ({ label: s, value: s })),
        }}
      />

      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  User ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Subjects
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Branch
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Designation
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Joining Date
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
                    Loading teachers...
                  </td>
                </tr>
              ) : filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-800">
                        {teacher.userId}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-800">
                        {teacher.userName}
                      </p>
                      <p className="text-xs text-gray-500">{teacher.qualifications}</p>
                    </td>
                    <td className="py-3 px-4 text-left text-sm text-gray-600">
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects &&
                          teacher.subjects.slice(0, 2).map((sub, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-gray-100 rounded text-xs"
                            >
                              {sub}
                            </span>
                          ))}
                        {teacher.subjects && teacher.subjects.length > 2 && (
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                            +{teacher.subjects.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-left text-sm text-gray-600">
                      {teacher.branch}
                    </td>
                    <td className="py-3 px-4 text-left text-sm text-gray-600">
                      {teacher.designation}
                    </td>
                    <td className="py-3 px-4 text-left text-sm text-gray-600">
                      {teacher.joiningDate
                        ? new Date(teacher.joiningDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="py-3 px-4 text-left">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          teacher.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : teacher.status === "Inactive"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {teacher.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleEditClick(teacher)}
                        className="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded-lg transition-colors"
                        title="Edit Teacher"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    No teachers found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Teacher Modal */}
      {isEditModalOpen && (
        <AdminEditTeacherForm
          editFormData={editFormData}
          setEditFormData={setEditFormData}
          onCancel={() => setIsEditModalOpen(false)}
          onSave={handleUpdateClick}
          onDelete={() => {
            if (!selectedTeacher) return;
            const idToDelete = selectedTeacher._id;
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

export default AdminTeachersPage;
