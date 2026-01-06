import { X, Save, Trash2, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { allschoolsdata, ALL_CLASSES } from "@/data/global/global";
import axiosInstance from "@/api/axiosInstance";
import { useAssetUpload } from "@/hooks/useAssetUpload";
import ImageUploader from "@/pages/admin/components/uploaders/ImageUploader";

interface TeacherOption {
  id: string;
  userId: string;
  userName: string;
  subjects: string[];
  branch: string;
  designation: string;
}

interface AdminEditCourseFormProps {
  editFormData: any;
  setEditFormData: (data: any) => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete?: () => void;
}

const AdminEditCourseForm = ({
  editFormData,
  setEditFormData,
  onCancel,
  onSave,
  onDelete,
}: AdminEditCourseFormProps) => {
  // Filter states
  const [schoolsQuery, setSchoolsQuery] = useState("");
  const [gradesQuery, setGradesQuery] = useState("");
  const [teachersQuery, setTeachersQuery] = useState("");

  const [allTeachers, setAllTeachers] = useState<TeacherOption[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<TeacherOption[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(false);

  const {
    upload: uploadImage,
    save: saveImage,
    isUploading: isImageUploading,
  } = useAssetUpload("images");

  // Refs not strictly needed for basic filtering unless we implement click-outside closing for dropdowns,
  // but here we display lists inline.

  // Normalize initial data on mount
  useEffect(() => {
    fetchTeachers();

    // Ensure array fields are arrays
    setEditFormData((prev: any) => ({
      ...prev,
      gradesEligible: Array.isArray(prev.gradesEligible)
        ? prev.gradesEligible
        : [],
      eligibleSchools: Array.isArray(prev.eligibleSchools)
        ? prev.eligibleSchools.map((s: any) =>
            typeof s === "string" ? s : s.name
          )
        : [],
      assignedTeachers: Array.isArray(prev.assignedTeachers)
        ? prev.assignedTeachers.map((t: any) =>
            typeof t === "string" ? t : t._id || t.id
          )
        : [],
    }));
  }, []); // Run once on mount

  const fetchTeachers = async () => {
    setTeachersLoading(true);
    try {
      const res = await axiosInstance.get("/admin/teachers");
      const teachers = res.data.teachers || res.data || [];
      const formatted = teachers.map((t: any) => ({
        id: t._id || t.userId,
        userId: t.userId,
        userName: t.userName,
        subjects: t.subjects || [],
        branch: t.branch || "",
        designation: t.designation || "",
      }));
      setAllTeachers(formatted);
      setFilteredTeachers(formatted);
    } catch (err) {
      console.error("Failed to fetch teachers", err);
    } finally {
      setTeachersLoading(false);
    }
  };

  // Filter teachers logic
  useEffect(() => {
    let filtered = allTeachers;

    const q = teachersQuery.toLowerCase();

    // If user is searching, show all matches regardless of school
    if (q) {
      filtered = allTeachers.filter(
        (t) =>
          t.userName.toLowerCase().includes(q) ||
          t.userId.toLowerCase().includes(q) ||
          t.subjects.some((s) => s.toLowerCase().includes(q))
      );
    } else {
      // Default: show teachers matching selected schools
      if (
        editFormData.eligibleSchools &&
        editFormData.eligibleSchools.length > 0
      ) {
        filtered = filtered.filter((t) =>
          editFormData.eligibleSchools.includes(t.branch)
        );
      }
    }

    setFilteredTeachers(filtered);
  }, [editFormData.eligibleSchools, teachersQuery, allTeachers]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setEditFormData({
      ...editFormData,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleArraySelection = (
    field: "gradesEligible" | "eligibleSchools" | "assignedTeachers",
    value: string
  ) => {
    const current = editFormData[field] || [];
    let newArray;

    if (current.includes(value)) {
      newArray = current.filter((item: string) => item !== value);
    } else {
      newArray = [...current, value];
    }
    setEditFormData({ ...editFormData, [field]: newArray });
  };

  const handleSelectAll = (field: "gradesEligible" | "eligibleSchools") => {
    if (field === "eligibleSchools") {
      setEditFormData((prev: any) => ({
        ...prev,
        eligibleSchools: [...allschoolsdata],
      }));
    } else if (field === "gradesEligible") {
      setEditFormData((prev: any) => ({
        ...prev,
        gradesEligible: [...ALL_CLASSES],
      }));
    }
  };

  const handleClearAll = (field: "gradesEligible" | "eligibleSchools") => {
    setEditFormData((prev: any) => ({ ...prev, [field]: [] }));
  };

  // Filter lists
  const filteredSchools = allschoolsdata.filter((school) =>
    school.toLowerCase().includes(schoolsQuery.toLowerCase())
  );

  const filteredGrades = ALL_CLASSES.filter((grade) =>
    grade.toLowerCase().includes(gradesQuery.toLowerCase())
  );

  const handleThumbnailUpload = async (file: File) => {
    try {
      await uploadImage(file);
      const finalUrl = await saveImage();
      setEditFormData((prev: any) => ({
        ...prev,
        thumbnail: finalUrl,
      }));
    } catch (err: any) {
      console.error(err);
      alert("Failed to upload thumbnail");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-800">
            Edit Course: {editFormData.courseId}
          </h2>
          <button onClick={onCancel}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Info */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Course Title *
            </label>
            <input
              name="title"
              value={editFormData.title || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Subject Code *
            </label>
            <input
              name="subjectCode"
              value={editFormData.subjectCode || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Status
            </label>
            <select
              name="status"
              value={editFormData.status || "draft"}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex items-center mt-6">
            <input
              type="checkbox"
              name="isActive"
              checked={editFormData.isActive ?? true}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-xs font-semibold text-gray-500 uppercase">
              Is Active
            </label>
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Description * (Max 1000 chars)
            </label>
            <textarea
              name="description"
              value={editFormData.description || ""}
              onChange={handleChange}
              rows={4}
              maxLength={1000}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <div className="text-xs text-gray-500 mt-1">
              {(editFormData.description || "").length}/1000 characters
            </div>
          </div>

          {/* Thumbnail URL */}
          <div className="col-span-2 md:col-span-1">
            <ImageUploader
              label="Course Thumbnail"
              value={editFormData.thumbnail}
              onUpload={handleThumbnailUpload}
              onRemove={() =>
                setEditFormData((prev: any) => ({ ...prev, thumbnail: "" }))
              }
              isUploading={isImageUploading}
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            {/* Preview if valid URL? Optional */}
          </div>

          {/* SCHOOLS */}
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              Eligible Schools *
            </label>
            <div className="relative">
              <div className="flex gap-2 mb-2">
                <Search className="w-4 h-4 text-gray-400 my-auto ml-1" />
                <input
                  value={schoolsQuery}
                  onChange={(e) => setSchoolsQuery(e.target.value)}
                  placeholder="Search schools..."
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded outline-none"
                />
              </div>

              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => handleSelectAll("eligibleSchools")}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition"
                >
                  Select All Schools
                </button>
                <button
                  type="button"
                  onClick={() => handleClearAll("eligibleSchools")}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition"
                >
                  Clear All
                </button>
              </div>

              {/* Selected Schools Area */}
              {editFormData.eligibleSchools &&
                editFormData.eligibleSchools.length > 0 && (
                  <div className="mb-2 p-2 border border-blue-100 bg-blue-50 rounded-lg flex flex-wrap gap-2">
                    <span className="text-xs font-semibold text-blue-700 w-full">
                      Selected Schools:
                    </span>
                    {editFormData.eligibleSchools.map((school: string) => (
                      <div
                        key={school}
                        className="flex items-center gap-1 text-xs bg-white border border-blue-200 text-blue-800 px-2 py-1 rounded-full"
                      >
                        {school}
                        <button
                          onClick={() =>
                            handleArraySelection("eligibleSchools", school)
                          }
                          className="hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

              <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
                {filteredSchools.map((school) => {
                  const isSelected =
                    editFormData.eligibleSchools?.includes(school);
                  return (
                    <button
                      key={school}
                      onClick={() =>
                        handleArraySelection("eligibleSchools", school)
                      }
                      className={`px-3 py-1 rounded-full text-xs text-left transition-colors border ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {school}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* GRADES */}
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              Grades Eligible
            </label>
            <div className="relative">
              <div className="flex gap-2 mb-2">
                <Search className="w-4 h-4 text-gray-400 my-auto ml-1" />
                <input
                  value={gradesQuery}
                  onChange={(e) => setGradesQuery(e.target.value)}
                  placeholder="Search grades..."
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded outline-none"
                />
              </div>

              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => handleSelectAll("gradesEligible")}
                  className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition"
                >
                  Select All Grades
                </button>
                <button
                  type="button"
                  onClick={() => handleClearAll("gradesEligible")}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition"
                >
                  Clear All
                </button>
              </div>

              <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-gray-50 max-h-32 overflow-y-auto">
                {filteredGrades.map((grade) => {
                  const isSelected =
                    editFormData.gradesEligible?.includes(grade);
                  return (
                    <button
                      key={grade}
                      onClick={() =>
                        handleArraySelection("gradesEligible", grade)
                      }
                      className={`px-3 py-1 rounded-full text-xs transition-colors border ${
                        isSelected
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {grade}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* TEACHERS */}
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              Assigned Teachers
            </label>
            <div className="relative">
              <div className="flex gap-2 mb-2">
                <Search className="w-4 h-4 text-gray-400 my-auto ml-1" />
                <input
                  value={teachersQuery}
                  onChange={(e) => setTeachersQuery(e.target.value)}
                  placeholder="Search teachers..."
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-gray-50 max-h-32 overflow-y-auto">
                {teachersLoading ? (
                  <span className="text-xs text-gray-500">Loading...</span>
                ) : filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher) => {
                    const isSelected = editFormData.assignedTeachers?.includes(
                      teacher.id
                    );
                    return (
                      <button
                        key={teacher.id}
                        onClick={() =>
                          handleArraySelection("assignedTeachers", teacher.id)
                        }
                        className={`px-3 py-1 rounded-full text-xs transition-colors border ${
                          isSelected
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                        }`}
                        title={`${teacher.userName} (${teacher.branch})`}
                      >
                        {teacher.userName}
                      </button>
                    );
                  })
                ) : (
                  <span className="text-xs text-gray-500">
                    No teachers found.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between px-6 py-4 border-t bg-gray-50 sticky bottom-0 z-10">
          {onDelete ? (
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Course
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEditCourseForm;
