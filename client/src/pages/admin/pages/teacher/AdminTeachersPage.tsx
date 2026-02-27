import { Link } from "react-router-dom";
import {
  ArrowLeft,
  UserPlus,
  Edit2,
  Database,
  GraduationCap,
} from "lucide-react";
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
  activated?: boolean;
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
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const getUniqueValues = (key: keyof Teacher) => {
    return [
      ...new Set(allTeachers.map((u) => u[key] as string).filter(Boolean)),
    ];
  };

  const uniqueBranches = useMemo(
    () => getUniqueValues("branch"),
    [allTeachers],
  ) as string[];
  const uniqueDesignations = useMemo(
    () => getUniqueValues("designation"),
    [allTeachers],
  ) as string[];
  const uniqueStatuses = useMemo(
    () => getUniqueValues("status"),
    [allTeachers],
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

  const handleEditClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setEditFormData({ ...teacher });
    setIsEditModalOpen(true);
  };

  const handleUpdateClick = () => {
    setConfirmPopup({
      isOpen: true,
      title: "Authorize Faculty Update",
      message: `Synchronize modified parameters for faculty member: ${editFormData.userName}?`,
      onConfirm: executeUpdate,
      isLoading: false,
    });
  };

  const executeUpdate = async () => {
    if (!selectedTeacher) return;
    setConfirmPopup((prev) => ({ ...prev, isLoading: true }));
    try {
      const idToUpdate = selectedTeacher._id || (selectedTeacher as any).id;
      if (!idToUpdate) throw new Error("Missing Teacher ID");
      await axiosInstance.put(`/admin/teachers/${idToUpdate}`, editFormData);

      setAllTeachers((prev) =>
        prev.map((t) =>
          (t._id || (t as any).id) === idToUpdate
            ? ({ ...t, ...editFormData } as Teacher)
            : t,
        ),
      );
      setIsEditModalOpen(false);
      setConfirmPopup((prev) => ({ ...prev, isOpen: false }));
    } catch (err: any) {
      console.error("Update error:", err.response?.data || err.message);
      alert(
        `Faculty synchronization failure: ${err.response?.data?.message || err.message}`,
      );
      setConfirmPopup((prev) => ({ ...prev, isLoading: false, isOpen: false }));
    }
  };

  const executeDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/admin/teachers/${id}`);
      setAllTeachers((prev) =>
        prev.filter((t) => (t._id || (t as any).id) !== id),
      );
      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error("Delete error:", err.response?.data || err.message);
      alert(
        `Personnel purge failure: ${err.response?.data?.message || err.message}`,
      );
    }
  };

  return (
    <div className="space-y-12 pb-20 px-8">
      {/* Header */}
      <div className="border-b border-black pb-12">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center text-[13px] hover:text-black mb-10 transition-colors capitalize text-gray-500"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          System Authority Terminal
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-center sm:text-left">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6 justify-center sm:justify-start">
              <div className="bg-black p-2 rounded-sm border border-black">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-[13px] capitalize text-black font-medium">
                Faculty Hub
              </span>
            </div>
            <h1 className="text-4xl text-black mb-6 leading-tight capitalize">
              Personnel <span className="text-gray-400">Registry</span>
            </h1>
            <p className="text-gray-600 text-[15px] max-w-xl leading-relaxed mx-auto sm:mx-0">
              Direct oversight of institutional faculty members and
              instructional assignments. Active Personnel: {allTeachers.length}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center sm:justify-start lg:mx-0 mx-auto">
            <Link
              to="/admin/teachers/upload"
              className="inline-flex items-center px-6 py-3.5 border border-black text-black rounded-sm text-[13px] capitalize hover:bg-gray-50 transition"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Batch Initialization
            </Link>
            <button
              onClick={() => setAddNewTeacherOpen(true)}
              className="inline-flex items-center px-6 py-3.5 bg-black text-white rounded-sm text-[13px] capitalize hover:bg-gray-800 transition shadow-sm"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Initialize Personnel
            </button>
          </div>
        </div>
      </div>

      {/* Filter Component */}
      <div className="bg-white border border-black rounded-sm">
        <AdminFilterComponent
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Filter by Name, Personnel ID, or Mobile..."
          filters={filters}
          onFilterChange={(key, value) =>
            setFilters((prev) => ({ ...prev, [key]: value }))
          }
          filterOptions={{
            branch: uniqueBranches.map((s) => ({ label: s, value: s })),
            designation: uniqueDesignations.map((s) => ({
              label: s,
              value: s,
            })),
            status: uniqueStatuses.map((s) => ({ label: s, value: s })),
          }}
        />
      </div>

      {/* Registry Table */}
      <div className="bg-white border border-black rounded-sm shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-[11px] uppercase tracking-widest text-white/70">
                <th className="py-5 px-6 font-medium">Personnel Protocol</th>
                <th className="py-5 px-6 font-medium">Faculty Designation</th>
                <th className="py-5 px-6 font-medium">
                  Instructional Subjects
                </th>
                <th className="py-5 px-6 font-medium">Branch Hub</th>
                <th className="py-5 px-6 font-medium">Administrative Rank</th>
                <th className="py-5 px-6 font-medium">Initialization Date</th>
                <th className="py-5 px-6 font-medium">Operational Status</th>
                <th className="py-5 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-20">
                    <div className="flex flex-col items-center gap-4">
                      <Database className="w-10 h-10 text-gray-200 animate-pulse" />
                      <p className="text-[11px] text-gray-400 capitalize">
                        Synchronizing personnel...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => (
                  <tr
                    key={teacher._id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="py-5 px-6 font-mono text-[12px] text-gray-400">
                      {teacher.userId}
                    </td>
                    <td className="py-5 px-6">
                      <p className="text-[14px] font-medium text-black capitalize group-hover:underline cursor-pointer">
                        {teacher.userName}
                      </p>
                      <p className="text-[10px] text-gray-400 capitalize mt-0.5">
                        {teacher.qualifications}
                      </p>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-wrap gap-2">
                        {teacher.subjects &&
                          teacher.subjects.slice(0, 2).map((sub, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 border border-gray-100 bg-gray-50 text-[10px] text-gray-600 rounded-sm"
                            >
                              {sub}
                            </span>
                          ))}
                        {teacher.subjects && teacher.subjects.length > 2 && (
                          <span className="px-2 py-0.5 border border-gray-100 bg-gray-50 text-[10px] text-gray-400 rounded-sm">
                            +{teacher.subjects.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-6 text-[12px] text-gray-500 capitalize">
                      {teacher.branch}
                    </td>
                    <td className="py-5 px-6 text-[12px] text-gray-500 capitalize">
                      {teacher.designation}
                    </td>
                    <td className="py-5 px-6 text-[12px] text-gray-500 font-mono">
                      {teacher.joiningDate
                        ? new Date(teacher.joiningDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="py-5 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-[10px] uppercase font-bold border ${
                          teacher.status === "Active"
                            ? "bg-black text-white border-black"
                            : "bg-white text-black border-gray-200"
                        }`}
                      >
                        {teacher.status}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <button
                        onClick={() => handleEditClick(teacher)}
                        className="p-2 border border-black rounded-sm text-black hover:bg-black hover:text-white transition-all active:scale-90"
                      >
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-20 text-gray-400 text-[13px] capitalize"
                  >
                    Zero personnel detected matching current filter protocol.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forms & Modals */}
      <AdminAddTeacherForm
        isOpen={addNewTeacherOpen}
        onClose={() => setAddNewTeacherOpen(false)}
        onTeacherAdded={fetchTeachers}
      />

      {isEditModalOpen && (
        <AdminEditTeacherForm
          editFormData={editFormData}
          setEditFormData={setEditFormData}
          onCancel={() => setIsEditModalOpen(false)}
          onSave={handleUpdateClick}
          onDelete={() => {
            if (!selectedTeacher) return;
            const idToDelete =
              selectedTeacher._id || (selectedTeacher as any).id;
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
        confirmText="Exceute Operation"
      />
    </div>
  );
};

export default AdminTeachersPage;
