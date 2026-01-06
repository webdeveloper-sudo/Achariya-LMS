import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Edit2, Search } from "lucide-react";
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
  eligibleSchools: string[] | any[]; // could be objects if populated
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
      // Assuming getCourses endpoint handles pagination or I get all.
      // AdminTeachersPage gets all. I'll get all logic here.
      const res = await axiosInstance.get("/admin/courses?limit=100"); // Getting specific limit
      setAllCourses(res.data.data || []);
      console.log(res.data.data);
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
      title: "Confirm Update",
      message: `Are you sure you want to update course ${editFormData.title}?`,
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
        updateData
      );

      setAllCourses((prev) =>
        prev.map((c) =>
          c._id === selectedCourse._id
            ? ({ ...c, ...editFormData } as Course)
            : c
        )
      );
      setIsEditModalOpen(false);
      setConfirmPopup((prev) => ({ ...prev, isOpen: false }));
    } catch (err: any) {
      console.error("Update failed", err);
      alert("Failed to update course");
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
      alert("Failed to delete course");
    }
  };

  return (
    <div className="p-6">
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Course Management</h1>
          <p className="text-sm">Total Courses: {allCourses.length}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setAddNewCourseOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Course
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border flex items-center">
        <Search className="text-gray-400 w-5 h-5 mr-3" />
        <input
          type="text"
          placeholder="Search by Title, Subject Code, or ID..."
          className="flex-1 outline-none text-gray-700"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <AdminAddCourseForm
        isOpen={addNewCourseOpen}
        onClose={() => setAddNewCourseOpen(false)}
        onCourseAdded={fetchCourses}
      />

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">
          Loading courses...
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed text-gray-500">
          No courses found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border overflow-hidden flex flex-col group"
            >
              <div className="h-40 bg-gray-200 relative">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    📚
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      course.status === "published"
                        ? "bg-green-100 text-green-700"
                        : course.status === "draft"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {course.status}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3
                    className="font-bold text-gray-800 line-clamp-1 cursor-pointer hover:text-blue-600 transition-colors"
                    title={course.title}
                    onClick={() => handleManageModules(course)}
                  >
                    {course.title}
                  </h3>
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-mono">
                    {course.subjectCode}
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                  {course.description}
                </p>

                <div className="flex justify-between items-center text-xs text-gray-400 border-t pt-3 mt-auto">
                  <span>ID: {course.courseId}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleManageModules(course)}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition"
                    >
                      Modules
                    </button>
                    <button
                      onClick={() => handleEditClick(course)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isEditModalOpen && selectedCourse && (
        <AdminEditCourseForm
          editFormData={editFormData}
          setEditFormData={setEditFormData}
          onCancel={() => setIsEditModalOpen(false)}
          onSave={handleUpdateClick}
          onDelete={() => {
            if (selectedCourse) {
              if (confirm("Are you sure you want to delete this course?")) {
                executeDelete(selectedCourse._id);
              }
            }
          }}
        />
      )}

      {/* Uses global confirmation popup from re-used components */}
      <ConfirmationPopup
        isOpen={confirmPopup.isOpen}
        title={confirmPopup.title}
        message={confirmPopup.message}
        onConfirm={confirmPopup.onConfirm}
        onCancel={() => setConfirmPopup((prev) => ({ ...prev, isOpen: false }))}
        isLoading={confirmPopup.isLoading}
        type="warning"
        confirmText="Yes, Update"
      />
    </div>
  );
};

export default AdminCoursesPage;
