import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Search,
  BookOpen,
  Database,
  LayoutGrid,
} from "lucide-react";
import axiosInstance from "../../../../api/axiosInstance";
import { useEffect, useState, useMemo } from "react";
import ConfirmationPopup from "../../../../components/ConfirmationPopup";
import AdminEditCourseForm from "../../components/courses/AdminEditCourseForm";
import AdminAddCourseForm from "../../components/courses/AdminAddCourseForm";

interface Course {
  _id: string;
  courseId: string;
  title: string;
  subjectCode: string;
  description: string;
  thumbnail: string;
  status: string;
  totalCredits: number;
  eligibleSchools: string[] | any[];
  assignedTeachers: string[] | any[];
  modules: any[];
}

const AdminCoursesPage = () => {
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Add State
  const [addNewCourseOpen, setAddNewCourseOpen] = useState(false);

  // Edit State
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Course>>({});

  // Confirmation State
  const [confirmPopup, setConfirmPopup] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isLoading: false,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/courses?limit=100");
      setAllCourses(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = useMemo(() => {
    return allCourses.filter((course) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        course.title.toLowerCase().includes(searchLower) ||
        course.subjectCode.toLowerCase().includes(searchLower) ||
        course.courseId.toLowerCase().includes(searchLower)
      );
    });
  }, [allCourses, searchQuery]);

  const handleEditClick = (course: Course) => {
    setSelectedCourse(course);
    setEditFormData(course);
    setIsEditModalOpen(true);
  };

  const handleManageModules = (course: Course) => {
    navigate(`/admin/courses/${course._id || course.courseId}/modules`);
  };

  const handleUpdateClick = () => {
    setConfirmPopup({
      isOpen: true,
      title: "Confirm Registry Update",
      message: `Authorize structural modifications to course variant: ${editFormData.title}?`,
      onConfirm: executeUpdate,
      isLoading: false,
    });
  };

  const executeUpdate = async () => {
    if (!selectedCourse) return;
    setConfirmPopup((prev) => ({ ...prev, isLoading: true }));
    try {
      const { _id, modules, ...updateData } = editFormData as Course;

      await axiosInstance.put(
        `/admin/courses/${selectedCourse._id}`,
        updateData,
      );

      setAllCourses((prev) =>
        prev.map((c) =>
          c._id === selectedCourse._id
            ? ({ ...c, ...editFormData } as Course)
            : c,
        ),
      );
      setIsEditModalOpen(false);
      setConfirmPopup((prev) => ({ ...prev, isOpen: false }));
    } catch (err: any) {
      console.error("Update failed", err);
      alert("Failed to update asset");
      setConfirmPopup((prev) => ({ ...prev, isLoading: false, isOpen: false }));
    }
  };

  const executeDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/admin/courses/${id}`);
      setAllCourses((prev) => prev.filter((c) => c._id !== id));
      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error("Delete failed", err);
      alert("Asset deletion failure");
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
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-[13px] capitalize text-black font-medium">
                Curriculum Inventory
              </span>
            </div>
            <h1 className="text-4xl text-black mb-6 leading-tight capitalize">
              Asset <span className="text-gray-400">Registry</span>
            </h1>
            <p className="text-gray-600 text-[15px] max-w-xl leading-relaxed mx-auto sm:mx-0">
              Management and synchronization of institutional instructional
              streams. Total Registry Count: {allCourses.length}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center sm:justify-start lg:mx-0 mx-auto">
            <button
              onClick={() => setAddNewCourseOpen(true)}
              className="inline-flex items-center px-8 py-3.5 bg-black text-white rounded-sm text-[13px] capitalize hover:bg-gray-800 transition shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Initialize Asset
            </button>
          </div>
        </div>
      </div>

      {/* Filter Terminal */}
      <div className="bg-white p-6 rounded-sm border border-black shadow-none flex items-center">
        <Search className="text-black w-5 h-5 mr-4" />
        <input
          type="text"
          placeholder="Filter by Designation, Protocol Code, or Identity..."
          className="flex-1 outline-none text-[13px] text-black bg-white placeholder-gray-300 capitalize"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Results Deck */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
          <div className="bg-gray-50 p-6 rounded-sm border border-black">
            <Database className="w-12 h-12 text-black animate-pulse" />
          </div>
          <p className="text-[11px] text-gray-400 capitalize">
            Synchronizing Inventory Parameters...
          </p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6 border border-dashed border-black rounded-sm text-center">
          <LayoutGrid className="w-12 h-12 text-gray-200" />
          <p className="text-[13px] text-gray-400 capitalize">
            Zero assets match current filter protocol.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-sm border border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col group overflow-hidden"
            >
              <div className="h-48 bg-gray-50 relative border-b border-black grayscale group-hover:grayscale-0 transition-all duration-700">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl opacity-10 font-bold grayscale">
                    UI.PROTOCOL
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-3 py-1 rounded-sm text-[10px] uppercase font-bold border ${
                      course.status === "published"
                        ? "bg-black text-white border-black"
                        : "bg-white text-black border-black"
                    }`}
                  >
                    {course.status}
                  </span>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3
                      className="text-lg font-medium text-black line-clamp-1 cursor-pointer hover:underline transition-all capitalize"
                      title={course.title}
                      onClick={() => handleManageModules(course)}
                    >
                      {course.title}
                    </h3>
                    <p className="text-[10px] text-gray-400 capitalize mt-1 font-mono tracking-tighter">
                      Protocol: {course.courseId}
                    </p>
                  </div>
                  <span className="text-[10px] bg-gray-50 text-black border border-black/10 px-2 py-0.5 rounded-sm font-mono font-bold">
                    {course.subjectCode}
                  </span>
                </div>
                <p className="text-[13px] text-gray-500 line-clamp-3 mb-8 flex-1 leading-relaxed capitalize">
                  {course.description}
                </p>

                <div className="flex justify-between items-center pt-6 border-t border-gray-50 mt-auto">
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleManageModules(course)}
                      className="px-4 py-2 bg-black text-white text-[11px] capitalize rounded-sm hover:invert transition-all flex items-center gap-2"
                    >
                      Audit Units
                    </button>
                    <button
                      onClick={() => handleEditClick(course)}
                      className="p-2 border border-black text-black rounded-sm hover:bg-black hover:text-white transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Forms & Modals */}
      <AdminAddCourseForm
        isOpen={addNewCourseOpen}
        onClose={() => setAddNewCourseOpen(false)}
        onCourseAdded={fetchCourses}
      />

      {isEditModalOpen && selectedCourse && (
        <AdminEditCourseForm
          editFormData={editFormData}
          setEditFormData={setEditFormData}
          onCancel={() => setIsEditModalOpen(false)}
          onSave={handleUpdateClick}
          onDelete={() => {
            if (selectedCourse) {
              if (confirm("Authorize complete deletion of asset?")) {
                executeDelete(selectedCourse._id);
              }
            }
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
        confirmText="Authorize Modification"
      />
    </div>
  );
};

export default AdminCoursesPage;
