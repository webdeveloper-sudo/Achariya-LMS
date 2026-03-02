import { Link } from "react-router-dom";
import { ArrowLeft, UserPlus, Edit2, X, Database, Users } from "lucide-react";
import axiosInstance from "../../../../api/axiosInstance";
import { useEffect, useState, useMemo } from "react";
import AdminFilterComponent from "../../components/AdminFilterComponent";
import ConfirmationPopup from "../../../../components/ConfirmationPopup";
import AdminAddUserForm from "../../components/user/AdminAddUserForm";
import AdminEditUserForm from "../../components/user/AdminEditUserForm";

interface User {
  _id: string;
  id?: string;
  admissionNo: string;
  admissionno?: string;
  name: string;
  class: string;
  section: string;
  mobileNo: string;
  gamification?: { totalCredits: number };
  school: string;
  status: string;
  role?: string;
  department?: string;
  email?: string;
  onboarded?: boolean;
  avatar?: string;
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

  const getUniqueValues = (key: keyof User | "department") => {
    return [
      ...new Set(
        allUsers
          .map((u) => {
            if (key === "class") return u.class || u.department;
            return u[key as keyof User];
          })
          .filter(Boolean),
      ),
    ];
  };

  const uniqueSchools = useMemo(
    () => getUniqueValues("school"),
    [allUsers],
  ) as string[];
  const uniqueClasses = useMemo(
    () => getUniqueValues("class"),
    [allUsers],
  ) as string[];
  const uniqueSections = useMemo(
    () => getUniqueValues("section"),
    [allUsers],
  ) as string[];
  const uniqueStatuses = useMemo(
    () => getUniqueValues("status"),
    [allUsers],
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

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditFormData({ ...user });
    setIsEditModalOpen(true);
  };

  const handleUpdateClick = () => {
    setConfirmPopup({
      isOpen: true,
      title: "Authorize Identity Update",
      message: `Synchronize modified parameters for subject: ${editFormData.name}?`,
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
      setAllUsers((prev) =>
        prev.map((u) =>
          u._id === idToUpdate || u.id === idToUpdate
            ? ({ ...u, ...editFormData } as User)
            : u,
        ),
      );
      setIsEditModalOpen(false);
      setConfirmPopup((prev) => ({ ...prev, isOpen: false }));
    } catch (err: any) {
      console.error("Failed to update user", err);
      alert("Identity synchronization failure.");
      setConfirmPopup((prev) => ({ ...prev, isLoading: false, isOpen: false }));
    }
  };

  const executeDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/admin/students/${id}`);
      setAllUsers((prev) => prev.filter((u) => u._id !== id && u.id !== id));
      setIsEditModalOpen(false);
    } catch (err: any) {
      alert("Identity purge failure.");
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
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-[13px] capitalize text-black font-medium">
                Participant Registry
              </span>
            </div>
            <h1 className="text-4xl text-black mb-6 leading-tight capitalize">
              Identity <span className="text-gray-400">Vault</span>
            </h1>
            <p className="text-gray-600 text-[15px] max-w-xl leading-relaxed mx-auto sm:mx-0">
              Management of institutional subject identities and credentials.
              Registered Entities: {allUsers.length}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center sm:justify-start lg:mx-0 mx-auto">
            <Link
              to="/admin/users/upload"
              className="inline-flex items-center px-6 py-3.5 border border-black text-black rounded-sm text-[13px] capitalize hover:bg-gray-50 transition"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Batch Initialization
            </Link>
            <button
              onClick={() => setAddNewUserOpen(true)}
              className="inline-flex items-center px-6 py-3.5 bg-black text-white rounded-sm text-[13px] capitalize hover:bg-gray-800 transition shadow-sm"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              New Identity
            </button>
            <button
              className="inline-flex items-center px-4 py-2 border border-red-600 text-red-600 rounded-sm text-[11px] capitalize hover:bg-red-50 transition"
              onClick={() =>
                setConfirmPopup({
                  isOpen: true,
                  title: "Wipe Identity Vault?",
                  message:
                    "CRITICAL: Authorize total purge of all student identities. This operation is non-reversible.",
                  onConfirm: async () => {
                    setConfirmPopup((prev) => ({ ...prev, isLoading: true }));
                    try {
                      await axiosInstance.delete("/admin/students/deleteAll");
                      setAllUsers([]);
                    } catch (err: any) {
                      alert("Vault purge failure.");
                    } finally {
                      setConfirmPopup((prev) => ({
                        ...prev,
                        isOpen: false,
                        isLoading: false,
                      }));
                    }
                  },
                  isLoading: false,
                })
              }
            >
              <X className="w-4 h-4 mr-2" />
              Total Purge
            </button>
          </div>
        </div>
      </div>

      {/* Filter Component - Needs to be B&W aware or replaced with custom */}
      <div className="bg-white border border-black rounded-sm">
        <AdminFilterComponent
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Filter by Name, Admission Protocol, or Terminal ID..."
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
      </div>

      {/* Registry Table */}
      <div className="bg-white border border-black rounded-sm shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-[11px] uppercase tracking-widest text-white/70">
                <th className="py-5 px-6 font-medium">Avatar</th>
                <th className="py-5 px-6 font-medium">Admission Protocol</th>
                <th className="py-5 px-6 font-medium">Subject Designation</th>
                <th className="py-5 px-6 font-medium">Strata / Section</th>
                <th className="py-5 px-6 font-medium">Terminal Channel</th>
                <th className="py-5 px-6 font-medium">Asset Credits</th>
                <th className="py-5 px-6 font-medium">Institutional Hub</th>
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
                        Synchronizing subjects...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={`${user.role || "user"}-${user.id || user._id}`}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="py-5 px-6">
                      <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                        {user.avatar ? (
                          <img
                            src={
                              user.avatar.startsWith("http")
                                ? user.avatar
                                : `${axiosInstance.defaults.baseURL?.replace("/api/v1", "")}${user.avatar}`
                            }
                            alt={user.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://ui-avatars.com/api/?name=" +
                                encodeURIComponent(user.name);
                            }}
                          />
                        ) : (
                          <Users className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-6 font-mono text-[12px] text-gray-400">
                      {user.admissionNo || user.admissionno}
                    </td>
                    <td className="py-5 px-6">
                      <p className="text-[14px] font-medium text-black capitalize group-hover:underline cursor-pointer">
                        {user.name}
                      </p>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] text-gray-600 bg-gray-50 px-2 py-0.5 border border-gray-100 rounded-sm">
                          {user.class || user.department}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono tracking-tighter">
                          {user.section}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-[13px] font-medium text-black font-mono">
                      {user.mobileNo}
                    </td>
                    <td className="py-5 px-6 text-[13px] font-medium text-black tabular-nums">
                      {user.gamification?.totalCredits || 0}
                    </td>
                    <td className="py-5 px-6 text-[12px] text-gray-500 capitalize">
                      {user.school}
                    </td>
                    <td className="py-5 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-[10px] uppercase font-bold border ${user.status === "active" ? "bg-black text-white border-black" : "bg-white text-black border-gray-200"}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <button
                        onClick={() => handleEditClick(user)}
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
                    Zero subjects detected matching current filter protocol.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forms & Modals */}
      <AdminAddUserForm
        isOpen={addNewUserOpen}
        onClose={() => setAddNewUserOpen(false)}
        onUserAdded={fetchstudnets}
      />

      {isEditModalOpen && (
        <AdminEditUserForm
          editFormData={editFormData}
          setEditFormData={setEditFormData}
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
        confirmText="Exceute Operation"
      />
    </div>
  );
};

export default AdminUsersPage;
