import { Link } from "react-router-dom";
import { ArrowLeft, UserPlus, Edit2, Shield, Database } from "lucide-react";
import axiosInstance from "../../../../api/axiosInstance";
import { useEffect, useState } from "react";
import AdminFilterComponent from "../../components/AdminFilterComponent";
import ConfirmationPopup from "../../../../components/ConfirmationPopup";
import AdminAddPrincipalForm from "../../components/user/AdminAddPrincipalForm";
import AdminEditPrincipalForm from "../../components/user/AdminEditPrincipalForm";

interface Principal {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  school: string;
  school_id: number;
  status: string;
  createdAt?: string;
}

const AdminPrincipalsPage = () => {
  const [principals, setPrincipals] = useState<Principal[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    school: "",
    status: "",
  });

  const [addOpen, setAddOpen] = useState(false);

  // Edit State
  const [selectedPrincipal, setSelectedPrincipal] = useState<Principal | null>(
    null,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Principal>>({});

  // Confirmation State
  const [confirmPopup, setConfirmPopup] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isLoading: false,
  });

  useEffect(() => {
    fetchPrincipals();
  }, []);

  const fetchPrincipals = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/principals/all");
      setPrincipals(res.data.principals || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrincipals = principals.filter((p) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(searchLower) ||
      p.email.toLowerCase().includes(searchLower) ||
      p.school.toLowerCase().includes(searchLower);

    const matchesSchool = !filters.school || p.school === filters.school;
    const matchesStatus = !filters.status || p.status === filters.status;

    return matchesSearch && matchesSchool && matchesStatus;
  });

  const uniqueSchools = [...new Set(principals.map((p) => p.school))];

  const handleEditClick = (p: Principal) => {
    setSelectedPrincipal(p);
    setEditFormData({ ...p });
    setIsEditModalOpen(true);
  };

  const handleUpdateClick = () => {
    setConfirmPopup({
      isOpen: true,
      title: "Authorize Executive Update",
      message: `Synchronize modified parameters for executive member: ${editFormData.name}?`,
      onConfirm: executeUpdate,
      isLoading: false,
    });
  };

  const executeUpdate = async () => {
    if (!selectedPrincipal) return;
    setConfirmPopup((prev) => ({ ...prev, isLoading: true }));
    try {
      await axiosInstance.put(
        `/admin/principals/${selectedPrincipal._id}`,
        editFormData,
      );
      setPrincipals((prev) =>
        prev.map((p) =>
          p._id === selectedPrincipal._id
            ? ({ ...p, ...editFormData } as Principal)
            : p,
        ),
      );
      setIsEditModalOpen(false);
      setConfirmPopup((prev) => ({ ...prev, isOpen: false }));
    } catch (err: any) {
      alert("Executive synchronization failure.");
      setConfirmPopup((prev) => ({ ...prev, isLoading: false, isOpen: false }));
    }
  };

  const executeDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/admin/principals/${id}`);
      setPrincipals((prev) => prev.filter((p) => p._id !== id));
      setIsEditModalOpen(false);
    } catch (err: any) {
      alert("Executive purge failure.");
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
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-[13px] capitalize text-black font-medium">
                Executive Oversight
              </span>
            </div>
            <h1 className="text-4xl text-black mb-6 leading-tight capitalize">
              Principal <span className="text-gray-400">Registry</span>
            </h1>
            <p className="text-gray-600 text-[15px] max-w-xl leading-relaxed mx-auto sm:mx-0">
              Direct administrative management of institutional leaders and
              school assignments. Active Executives: {principals.length}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center sm:justify-start lg:mx-0 mx-auto">
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center px-8 py-3.5 bg-black text-white rounded-sm text-[13px] capitalize hover:bg-gray-800 transition shadow-sm"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Initialize Executive
            </button>
          </div>
        </div>
      </div>

      {/* Filter Component */}
      <div className="bg-white border border-black rounded-sm">
        <AdminFilterComponent
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Filter by Name, Executive Email, or Hub..."
          filters={filters}
          onFilterChange={(key, value) =>
            setFilters((prev) => ({ ...prev, [key]: value }))
          }
          filterOptions={{
            school: uniqueSchools.map((s) => ({ label: s, value: s })),
            class: [],
            section: [],
            status: [
              { label: "Active", value: "Active" },
              { label: "Inactive", value: "Inactive" },
            ],
          }}
        />
      </div>

      {/* Registry Table */}
      <div className="bg-white border border-black rounded-sm shadow-none mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-[11px] uppercase tracking-widest text-white/70">
                <th className="py-5 px-6 font-medium">Executive Designation</th>
                <th className="py-5 px-6 font-medium">Digital Terminal</th>
                <th className="py-5 px-6 font-medium">Direct Channel</th>
                <th className="py-5 px-6 font-medium">Institutional Hub</th>
                <th className="py-5 px-6 font-medium text-center">
                  Protocol ID
                </th>
                <th className="py-5 px-6 font-medium">Operational Status</th>
                <th className="py-5 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-20">
                    <div className="flex flex-col items-center gap-4">
                      <Database className="w-10 h-10 text-gray-200 animate-pulse" />
                      <p className="text-[11px] text-gray-400 capitalize">
                        Synchronizing executives...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredPrincipals.length > 0 ? (
                filteredPrincipals.map((p) => (
                  <tr
                    key={p._id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-sm bg-gray-50 border border-black/5 flex items-center justify-center text-black font-bold text-[10px] group-hover:bg-black group-hover:text-white transition-all">
                          {p.name.charAt(0)}
                        </div>
                        <p className="text-[14px] font-medium text-black capitalize group-hover:underline cursor-pointer">
                          {p.name}
                        </p>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-[13px] text-gray-500 font-mono">
                      {p.email}
                    </td>
                    <td className="py-5 px-6 text-[13px] text-gray-500 font-mono">
                      {p.mobile}
                    </td>
                    <td
                      className="py-5 px-6 text-[12px] text-gray-400 capitalize truncate max-w-xs"
                      title={p.school}
                    >
                      {p.school}
                    </td>
                    <td className="py-5 px-6 text-center text-[12px] font-mono text-gray-900 font-bold">
                      {p.school_id}
                    </td>
                    <td className="py-5 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-[10px] uppercase font-bold border ${
                          p.status === "Active"
                            ? "bg-black text-white border-black"
                            : "bg-white text-black border-gray-200"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <button
                        onClick={() => handleEditClick(p)}
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
                    colSpan={7}
                    className="text-center py-20 text-gray-400 text-[13px] capitalize"
                  >
                    Zero executives detected matching current filter protocol.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forms & Modals */}
      <AdminAddPrincipalForm
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onPrincipalAdded={fetchPrincipals}
      />

      {isEditModalOpen && (
        <AdminEditPrincipalForm
          editFormData={editFormData}
          setEditFormData={setEditFormData}
          onCancel={() => setIsEditModalOpen(false)}
          onSave={handleUpdateClick}
          onDelete={() => {
            if (!selectedPrincipal) return;
            executeDelete(selectedPrincipal._id);
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
        confirmText="Execute Operation"
      />
    </div>
  );
};

export default AdminPrincipalsPage;
