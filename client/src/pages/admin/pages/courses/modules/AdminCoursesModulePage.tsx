import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  ArrowLeft,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  FileText,
  Video as VideoIcon,
} from "lucide-react";
import axiosInstance from "../../../../../api/axiosInstance";
import AdminAddModuleForm from "../../../components/courses/modules/AdminAddModuleForm";
import AdminEditModuleForm from "../../../components/courses/modules/AdminEditModuleForm";

interface Module {
  _id: string;
  moduleId: string;
  title: string;
  description: string;
  sequenceOrder: number;
  credits: number;
  estimatedDuration: string;
  status: string;
}

interface Course {
  _id: string;
  courseId: string;
  title: string;
}

const AdminCoursesModulePage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);

  useEffect(() => {
    fetchCourseAndModules();
  }, [courseId]);

  const fetchCourseAndModules = async () => {
    setLoading(true);
    try {
      // Fetch Course Details (for title)
      // We assume courseId param is the _id or courseId string. API handles both.
      if (!courseId) return;

      const courseRes = await axiosInstance.get(`/admin/courses/${courseId}`);
      setCourse(courseRes.data.data);

      const modulesRes = await axiosInstance.get(
        `/admin/modules/course/${courseId}`
      );
      setModules(modulesRes.data.data || []);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (
    currentIndex: number,
    direction: "up" | "down"
  ) => {
    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === modules.length - 1) return;

    const newModules = [...modules];
    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    // Swap
    [newModules[currentIndex], newModules[targetIndex]] = [
      newModules[targetIndex],
      newModules[currentIndex],
    ];
    setModules(newModules); // Optimistic update

    // Call backend to save order
    const moduleIds = newModules.map((m) => m._id);
    try {
      await axiosInstance.put("/admin/modules/reorder", { moduleIds });
    } catch (err) {
      console.error("Reorder failed", err);
      fetchCourseAndModules(); // Revert on failure
    }
  };

  const handleDelete = async (moduleId: string) => {
    if (!confirm("Delete this module?")) return;
    try {
      await axiosInstance.delete(`/admin/modules/${moduleId}`);
      fetchCourseAndModules();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return <div className="p-8 text-center">Loading Course Modules...</div>;
  if (!course)
    return <div className="p-8 text-center text-red-500">Course not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/courses")}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{course.title}</h1>
            <p className="text-gray-500 text-sm">
              Managing Modules • {modules.length} Modules
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Module
        </button>
      </div>

      {/* Modules List */}
      <div className="space-y-4 max-w-5xl mx-auto">
        {modules.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">
              No modules found. Add your first module to get started.
            </p>
          </div>
        ) : (
          modules.map((module, index) => (
            <div
              key={module._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              {/* Reorder Controls */}
              <div className="flex flex-col gap-1 text-gray-400">
                <button
                  onClick={() => handleReorder(index, "up")}
                  disabled={index === 0}
                  className="hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleReorder(index, "down")}
                  disabled={index === modules.length - 1}
                  className="hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>

              {/* Module Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded">
                    {module.moduleId} // SEQ: {module.sequenceOrder}
                  </span>
                  {module.status === "published" ? (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                      Published
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border">
                      Draft
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-800 text-lg">
                  {module.title}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-1">
                  {module.description}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <VideoIcon className="w-3 h-3" /> Video
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Notes
                  </span>
                  <span>{module.estimatedDuration || "No duration"}</span>
                  <span>{module.credits} Credits</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingModuleId(module._id)} // Or moduleId depending on route used. AdminEdit uses fetch by ID.
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(module._id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {showAddModal && course && (
        <AdminAddModuleForm
          courseId={course._id}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchCourseAndModules();
          }}
        />
      )}

      {editingModuleId && course && (
        <AdminEditModuleForm
          moduleId={editingModuleId}
          onClose={() => setEditingModuleId(null)}
          onSuccess={() => {
            setEditingModuleId(null);
            fetchCourseAndModules();
          }}
        />
      )}
    </div>
  ); 
};

export default AdminCoursesModulePage;
