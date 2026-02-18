import { Link } from "react-router-dom";
import { ArrowLeft, UserPlus, Edit2, Shield } from "lucide-react";
import axiosInstance from "../../../../api/axiosInstance";
import { useEffect, useState } from "react";
import AdminFilterComponent from "../../components/AdminFilterComponent"; // Reuse
import ConfirmationPopup from "../../../../components/ConfirmationPopup"; // Reuse
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

  // Unique schools for filter
  const uniqueSchools = [...new Set(principals.map((p) => p.school))];

  // Handle Edit Click
  const handleEditClick = (p: Principal) => {
    setSelectedPrincipal(p);
    setEditFormData({ ...p });
    setIsEditModalOpen(true);
  };

  // Handle Save Update
  const handleUpdateClick = () => {
    setConfirmPopup({
      isOpen: true,
      title: "Confirm Update",
      message: `Update details for ${editFormData.name}?`,
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

      // Update local state
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
      console.error("Failed to update", err);
      alert(err.response?.data?.message || "Failed to update.");
      setConfirmPopup((prev) => ({ ...prev, isLoading: false, isOpen: false }));
    }
  };

  const executeDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/admin/principals/${id}`);
      setPrincipals((prev) => prev.filter((p) => p._id !== id));
      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error("Failed to delete", err);
      alert(err.response?.data?.message || "Failed to delete.");
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
          <h1 className="text-3xl font-bold text-gray-800">
            Principal Management
          </h1>
          <p className="text-sm">Total Principals: {principals.length}</p>
        </div>
        <div>
          <button
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            onClick={() => setAddOpen(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add New Principal
          </button>
        </div>
        <AdminAddPrincipalForm
          isOpen={addOpen}
          onClose={() => setAddOpen(false)}
          onPrincipalAdded={fetchPrincipals}
        />
      </div>

      <AdminFilterComponent
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search Name, Email, School..."
        filters={filters}
        onFilterChange={(key, value) =>
          setFilters((prev) => ({ ...prev, [key]: value }))
        }
        filterOptions={{
          school: uniqueSchools.map((s) => ({ label: s, value: s })),
          class: [], // Not applicable
          section: [], // Not applicable
          status: [
            { label: "Active", value: "Active" },
            { label: "Inactive", value: "Inactive" },
          ],
        }}
        // Hide irrelevant filters
      />

      <div className="bg-white rounded-xl shadow-sm p-6 border mt-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Mobile
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  School
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                  ID
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
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredPrincipals.length > 0 ? (
                filteredPrincipals.map((p) => (
                  <tr key={p._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                          <Shield className="w-4 h-4 text-purple-600" />
                        </div>
                        <p className="font-semibold text-gray-800">{p.name}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {p.email}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {p.mobile}
                    </td>
                    <td
                      className="py-3 px-4 text-sm text-gray-600 truncate max-w-xs"
                      title={p.school}
                    >
                      {p.school}
                    </td>
                    <td className="py-3 px-4 text-center text-sm font-mono text-gray-500">
                      {p.school_id}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          p.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleEditClick(p)}
                        className="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No principals found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
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
        confirmText="Yes, Proceed"
      />
    </div>
  );
};

export default AdminPrincipalsPage;
