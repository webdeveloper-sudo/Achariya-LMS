import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import AdminAddCourseForm from "../../components/courses/AdminAddCourseForm";

const AdminUploadCourse = () => {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // This wrapper page seems to serve as a entry point for "Uploading" (Adding).
  // In Teacher flow, "AdminUploadTeachers" might be for bulk upload via CSV?
  // But the prompt said "adminuploadcourse.tsx in this component the third component adminaddcourseform should be imported".
  // So likely this is the "Add" page/wrapper.

  return (
    <div className="p-6">
      <button
        onClick={() => navigate("/admin/courses")}
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Courses
      </button>

      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Create New Course
        </h2>
        <p className="text-gray-500 mb-6">
          Add a single course manually including initial module details.
        </p>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition shadow-sm"
        >
          Open Course Form
        </button>
      </div>

      <AdminAddCourseForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCourseAdded={() => {
          // Navigate back or show success?
          navigate("/admin/courses");
        }}
      />
    </div>
  );
};

export default AdminUploadCourse;
