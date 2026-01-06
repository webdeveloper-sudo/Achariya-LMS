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

export const studentApi = {
  getDashboard: (email: string) =>
    client.get(`/student/dashboard?email=${email}`),
  getCourses: (email: string) => client.get(`/student/courses?email=${email}`),
  getCourseDetail: (courseId: number, email: string) =>
    client.get(`/student/course/${courseId}?email=${email}`),
  getModuleDetail: (moduleId: number, email: string) =>
    client.get(`/student/module/${moduleId}?email=${email}`),
  trackContent: (moduleId: number, data: any, email: string) =>
    client.post(`/student/module/${moduleId}/track?email=${email}`, data),
  getQuiz: (moduleId: number, email: string) =>
    client.get(`/student/module/${moduleId}/quiz?email=${email}`),
  submitQuiz: (moduleId: number, data: any, email: string) =>
    client.post(`/student/module/${moduleId}/quiz/submit?email=${email}`, data),
  getWallet: (email: string) => client.get(`/student/wallet?email=${email}`),
  getBadges: (email: string) => client.get(`/student/badges?email=${email}`),
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
