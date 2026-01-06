import { X, Save, Search, Plus, Loader2 } from "lucide-react";
import {
  allschoolsdata,
  allsubjects,
  ALL_CLASSES,
  allboards,
} from "@/data/global/global";
import { useState, useEffect, useRef } from "react";
import ImageUploader from "@/pages/admin/components/uploaders/ImageUploader";
import axiosInstance from "@/api/axiosInstance";
import { useAssetUpload } from "@/hooks/useAssetUpload";

interface TeacherOption {
  id: string;
  userId: string;
  userName: string;
  subjects: string[];
  branch: string;
  designation: string;
}

interface AdminAddCourseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseAdded: () => void;
}

const AdminAddCourseForm = ({
  isOpen,
  onClose,
  onCourseAdded,
}: AdminAddCourseFormProps) => {
  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    subjectCode: "",
    description: "",
    thumbnail: "",
    totalCredits: "",
    gradesEligible: [] as string[],
    eligibleSchools: [] as string[],
    assignedTeachers: [] as string[],
    status: "draft",
    isActive: true,
  });

  // Filter states
  const [schoolsQuery, setSchoolsQuery] = useState("");
  const [gradesQuery, setGradesQuery] = useState("");
  const [teachersQuery, setTeachersQuery] = useState("");

  // Teachers data
  const [allTeachers, setAllTeachers] = useState<TeacherOption[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<TeacherOption[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    upload: uploadImage,
    save: saveImage,
    isUploading: isImageUploading,
  } = useAssetUpload("images");

  // Refs for dropdowns
  const schoolsRef = useRef<HTMLDivElement>(null);
  const gradesRef = useRef<HTMLDivElement>(null);
  const teachersRef = useRef<HTMLDivElement>(null);

  // Fetch teachers on modal open
  useEffect(() => {
    if (isOpen) {
      fetchTeachers();
    }
  }, [isOpen]);

  const fetchTeachers = async () => {
    setTeachersLoading(true);
    try {
      const res = await axiosInstance.get("/admin/teachers");
      const teachers = res.data.teachers || res.data || [];
      console.log(teachers);
      setAllTeachers(
        teachers.map((t: any) => ({
          id: t._id || t.userId,
          userId: t.userId,
          userName: t.userName,
          subjects: t.subjects || [],
          branch: t.branch || "",
          designation: t.designation || "",
        }))
      );
      setFilteredTeachers(teachers);
    } catch (err) {
      console.error("Failed to fetch teachers", err);
    } finally {
      setTeachersLoading(false);
    }
  };

  // Filter teachers based on selected schools and search query
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
      if (formData.eligibleSchools.length > 0) {
        filtered = filtered.filter((t) =>
          formData.eligibleSchools.includes(t.branch)
        );
      }
    }

    setFilteredTeachers(filtered);
  }, [formData.eligibleSchools, teachersQuery, allTeachers]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleArraySelection = (
    field: "gradesEligible" | "eligibleSchools" | "assignedTeachers",
    value: string
  ) => {
    setFormData((prev) => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((item) => item !== value) };
      }
      return { ...prev, [field]: [...current, value] };
    });
  };

  const handleSelectAll = (field: "gradesEligible" | "eligibleSchools") => {
    if (field === "eligibleSchools") {
      setFormData((prev) => ({
        ...prev,
        eligibleSchools: [...allschoolsdata],
      }));
    } else if (field === "gradesEligible") {
      setFormData((prev) => ({ ...prev, gradesEligible: [...ALL_CLASSES] }));
    }
  };

  const handleClearAll = (field: "gradesEligible" | "eligibleSchools") => {
    setFormData((prev) => ({ ...prev, [field]: [] }));
  };

  // Filter functions
  const filteredSchools = allschoolsdata.filter((school) => {
    // If search query is empty, show all schools (or just selected ones if prefered, but user wants to be able to select)
    // The previous issue was likely that 'Select All' selected everything, but search might have been confusing if it filtered out selected ones.
    // Here we just filter by query.
    return school.toLowerCase().includes(schoolsQuery.toLowerCase());
  });

  const filteredGrades = ALL_CLASSES.filter((grade) =>
    grade.toLowerCase().includes(gradesQuery.toLowerCase())
  );

  const handleThumbnailUpload = async (file: File) => {
    try {
      // 1. Upload to Temp (Preview)
      await uploadImage(file);
      // 2. Commit to Permanent (Save)
      const finalUrl = await saveImage();

      setFormData((prev) => ({ ...prev, thumbnail: finalUrl }));
    } catch (err: any) {
      console.error(err);
      setError("Failed to upload thumbnail");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    if (
      !formData.title.trim() ||
      !formData.subjectCode.trim() ||
      !formData.description.trim() ||
      formData.gradesEligible.length === 0 ||
      formData.eligibleSchools.length === 0
    ) {
      setError(
        "Please fill all required fields: Title, Subject Code, Description, Grades, and Schools."
      );
      setLoading(false);
      return;
    }

    if (formData.description.length > 1000) {
      setError("Description must be less than 1000 characters.");
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post("/admin/courses/create", formData);
      onCourseAdded();
      onClose();
      setFormData({
        courseId: "",
        title: "",
        subjectCode: "",
        description: "",
        thumbnail: "",
        totalCredits: "",
        gradesEligible: [],
        eligibleSchools: [],
        assignedTeachers: [],
        status: "draft",
        isActive: true,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-800">
            Add New Course
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {error && (
          <div className="px-6 pt-4">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          </div>
        )}

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Course basic fields - SAME AS BEFORE */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Course ID
            </label>
            <input
              type="text"
              name="courseId"
              value={formData.courseId || "Auto-generated (CRS-2025-XXX)"}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
              disabled
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Course Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Advanced Physics"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Subject Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="subjectCode"
              value={formData.subjectCode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
              placeholder="e.g. PHY-101"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Description <span className="text-red-500">*</span> (Max 1000
              chars)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              maxLength={1000}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-vertical"
              placeholder="Detailed course description..."
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.description.length}/1000 characters
            </div>
          </div>

          {/* FILTERABLE SCHOOLS - NEW */}
          <div className="col-span-2" ref={schoolsRef}>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              Eligible Schools <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={schoolsQuery}
                  onChange={(e) => setSchoolsQuery(e.target.value)}
                  placeholder="Search schools..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                />
                <button
                  onClick={() => setSchoolsQuery("")}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
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
              {formData.eligibleSchools.length > 0 && (
                <div className="mb-2 p-2 border border-blue-100 bg-blue-50 rounded-lg flex flex-wrap gap-2">
                  <span className="text-xs font-semibold text-blue-700 w-full">
                    Selected Schools:
                  </span>
                  {formData.eligibleSchools.map((school) => (
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
                  const isSelected = formData.eligibleSchools.includes(school);
                  // Hide already selected ones from the list to avoid clutter? Or keep them highlighted?
                  // User said "im unable to select... even if i select all".
                  // Let's keep them in list but highlighted
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
                      disabled={false}
                    >
                      {school}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FILTERABLE GRADES - NEW */}
          <div className="col-span-2" ref={gradesRef}>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              Grades Eligible <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={gradesQuery}
                  onChange={(e) => setGradesQuery(e.target.value)}
                  placeholder="Search grades..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-xs"
                />
                <button
                  onClick={() => setGradesQuery("")}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
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
                  const isSelected = formData.gradesEligible.includes(grade);
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
                      } ${
                        !isSelected && formData.gradesEligible.length >= 8
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={
                        !isSelected && formData.gradesEligible.length >= 8
                      }
                    >
                      {grade}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FILTERABLE TEACHERS - NEW */}
          <div className="col-span-2" ref={teachersRef}>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              Assigned Teachers
            </label>
            <div className="relative">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={teachersQuery}
                  onChange={(e) => setTeachersQuery(e.target.value)}
                  placeholder="Search teachers by name, ID, or subject..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                />
                <button
                  onClick={() => setTeachersQuery("")}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-gray-50 max-h-32 overflow-y-auto">
                {teachersLoading ? (
                  <div className="text-xs text-gray-500 p-2">
                    Loading teachers...
                  </div>
                ) : filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher) => {
                    const isSelected = formData.assignedTeachers.includes(
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
                        } ${
                          !isSelected && formData.assignedTeachers.length >= 8
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        disabled={
                          !isSelected && formData.assignedTeachers.length >= 8
                        }
                        title={`${teacher.userName} (${teacher.userId}) - ${teacher.branch}`}
                      >
                        {teacher.userName} - ${teacher.branch}
                      </button>
                    );
                  })
                ) : (
                  <div className="text-xs text-gray-500 p-2 col-span-2">
                    {formData.eligibleSchools.length === 0
                      ? "Select schools first to see matching teachers..."
                      : "No teachers match your search"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Other fields remain the same */}
          <div className="col-span-2 md:col-span-1">
            <ImageUploader
              label="Course Thumbnail"
              value={formData.thumbnail}
              onUpload={handleThumbnailUpload}
              onRemove={() =>
                setFormData((prev) => ({ ...prev, thumbnail: "" }))
              }
              isUploading={isImageUploading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Total Credits
            </label>
            <input
              type="number"
              name="totalCredits"
              value={formData.totalCredits}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
              placeholder="Auto-calculated from modules"
              disabled
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-xs font-semibold text-gray-500 uppercase">
              Is Active
            </label>
          </div>

          <div className="col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">
              Next Steps
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>
                • <strong>{formData.eligibleSchools.length}</strong> schools
                selected
              </li>
              <li>
                • <strong>{formData.gradesEligible.length}</strong> grades
                selected
              </li>
              <li>
                • <strong>{formData.assignedTeachers.length}</strong> teachers
                selected
              </li>
              <li>
                • Modules: Create modules and link to this course after saving
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Course
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAddCourseForm;
