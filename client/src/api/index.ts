import client from "./axiosInstance";

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await client.post("/auth/login", { email, password });
    return response.data;
  },

  selectRole: async (role: string) => {
    const response = await client.post("/auth/select-role", { role });
    return response.data;
  },
};

export const studentAuthApi = {
  checkAdmission: (admissionNumber: string) =>
    client.post("/students/verify-admission", { admissionNo: admissionNumber }),
  sendOtp: (admissionNumber: string, contactType: string) =>
    client.post("/students/send-otp", {
      admissionNo: admissionNumber,
      contactType,
    }),
  verifyOtp: (admissionNumber: string, otp: string) =>
    client.post("/students/verify-otp", { admissionNo: admissionNumber, otp }),
  completeOnboarding: (data: { admissionNumber: string; password: string }) =>
    client.post("/students/complete-onboarding", {
      admissionNo: data.admissionNumber,
      password: data.password,
    }),
  login: (admissionNumber: string, password: string) =>
    client.post("/students/login", { admissionNo: admissionNumber, password }),
};

export const studentApi = {
  getDashboard: () =>
    // The backend uses req.user.id from the token, so email query param is likely ignored or not needed if we use the protected route.
    // However, the controller signature is `getDashboard = async (req, res)` and uses `req.user`.
    // So we don't need to pass email in the query string anymore!
    client.get("/students/dashboard"),
  getCourses: () => client.get("/students/courses"),
  getCourseDetail: (courseId: number) =>
    client.get(`/students/course/${courseId}`), // Assuming this route exists or will exist.
  // Wait, the backend currently only has `getCourses`. It lacks `getCourseDetail` in `studentRoutes.js`.
  // I should probably leave existing ones I'm not sure about or comment them out if they are gonna fail.
  // For now I'll keep the ones I know for sure and leave others as is (maybe they point to mocks or aren't implemented yet).
  // Actually, looking at studentRoutes.js, there is NO `getCourseDetail`.
  // I will comment out unconfirmed routes to prevent confusion? Or just leave them if they were part of the pre-existing structure
  // and I shouldn't break other potential work.
  // I'll stick to updating what I KNOW.
  getModuleDetail: (moduleId: number) =>
    client.get(`/students/module/${moduleId}`),
  trackContent: (moduleId: number, data: any) =>
    client.post(`/students/module/${moduleId}/track`, data),
  getQuiz: (moduleId: number) =>
    client.get(`/students/module/${moduleId}/quiz`),
  submitQuiz: (moduleId: number, data: any) =>
    client.post(`/students/module/${moduleId}/quiz/submit`, data),
  getWallet: () => client.get("/students/wallet"), // Not in backend yet
  getBadges: () => client.get("/students/badges"), // Not in backend yet
};

export const teacherApi = {
  getDashboard: (email: string) =>
    client.get(`/teacher/dashboard?email=${email}`),
  getCourses: (email: string) => client.get(`/teacher/courses?email=${email}`),
  getCourseStudents: (courseId: number, email: string) =>
    client.get(`/teacher/course/${courseId}/students?email=${email}`),
  getAtRiskStudents: (email: string) =>
    client.get(`/teacher/at-risk-students?email=${email}`),
  submitEvidence: (data: any, email: string) =>
    client.post(`/teacher/evidence?email=${email}`, data),
  getWallet: (email: string) => client.get(`/teacher/wallet?email=${email}`),
};

export const principalApi = {
  getDashboard: (email: string) =>
    client.get(`/principal/dashboard?email=${email}`),
  getCompletionByGrade: (email: string) =>
    client.get(`/principal/completion-by-grade?email=${email}`),
  getWeeklyActive: (email: string) =>
    client.get(`/principal/weekly-active?email=${email}`),
  getTopPerformers: (email: string) =>
    client.get(`/principal/top-performers?email=${email}`),
  getCourses: (email: string) =>
    client.get(`/principal/courses?email=${email}`),
  exportSummary: (email: string) =>
    client.get(`/principal/export?email=${email}`),
};

export const adminApi = {
  getDashboard: () => client.get("/admin/dashboard"),
  getCourses: () => client.get("/admin/courses"),
  createCourse: (data: any) => client.post("/admin/courses", data),
  updateCourse: (courseId: number, data: any) =>
    client.put(`/admin/courses/${courseId}`, data),
  deleteCourse: (courseId: number) =>
    client.delete(`/admin/courses/${courseId}`),
  getModules: (courseId: number) =>
    client.get(`/admin/course/${courseId}/modules`),
  createModule: (data: any) => client.post("/admin/modules", data),
  getContent: (moduleId: number) =>
    client.get(`/admin/module/${moduleId}/content`),
  createContent: (data: any) => client.post("/admin/content", data),
  getUsers: (role?: string) =>
    client.get(`/admin/users${role ? `?role=${role}` : ""}`),
  createUser: (data: any) => client.post("/admin/users", data),
  getQuestions: (moduleId: number) =>
    client.get(`/admin/module/${moduleId}/questions`),
  createQuestion: (data: any) => client.post("/admin/questions", data),
  getConfig: () => client.get("/admin/config"),
  updateConfig: (data: any) => client.put("/admin/config", data),
  getActivityLogs: (params?: any) =>
    client.get("/admin/activity-logs", { params }),
  uploadStudentsFile: (formData: FormData) =>
    client.post("/admin/students/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  saveStudents: (data: any) => client.post("/admin/students/save", data),
  getStudents: () => client.get("/admin/students"),
};
