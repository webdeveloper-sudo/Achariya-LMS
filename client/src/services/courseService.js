import adminApi from "./adminApi";

// Get all courses (with filters)
export const getCourses = async (page = 1, filters = {}, sort = "") => {
  const params = { page, ...filters, sort };
  const response = await adminApi.get("/admin/courses", { params });
  return response.data; // { success, count, pagination, data }
};

// Get single course by ID
export const getCourseById = async (courseId) => {
  const response = await adminApi.get(`/admin/courses/${courseId}`);
  return response.data;
};

// Create new course
export const createCourse = async (courseData) => {
  const response = await adminApi.post("/admin/courses", courseData);
  return response.data;
};

// Update course
export const updateCourse = async (courseId, courseData) => {
  const response = await adminApi.put(`/admin/courses/${courseId}`, courseData);
  return response.data;
};

// Delete course
export const deleteCourse = async (courseId) => {
  const response = await adminApi.delete(`/admin/courses/${courseId}`);
  return response.data;
};

// Update specific status
export const updateCourseStatus = async (courseId, status) => {
  const response = await adminApi.patch(`/admin/courses/${courseId}/status`, {
    status,
  });
  return response.data;
};

// Upload thumbnail
export const uploadCourseThumbnail = async (file) => {
  const formData = new FormData();
  formData.append("thumbnail", file);

  // Using genericupload endpoint? Or specific?
  // Prompt: POST /api/admin/upload/course-thumbnail
  const response = await adminApi.post(
    "/admin/upload/course-thumbnail",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};
