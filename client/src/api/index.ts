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
  resetPassword: (data: {
    admissionNumber: string;
    otp: string;
    password: string;
  }) =>
    client.post("/students/reset-password", {
      admissionNo: data.admissionNumber,
      otp: data.otp,
      password: data.password,
    }),
};

export const teacherAuthApi = {
  verifyAccount: (identifier: string) =>
    client.post("/teacher/auth/verify-account", { identifier }),
  sendOtp: (identifier: string) =>
    client.post("/teacher/auth/send-otp", { identifier }),
  verifyOtp: (identifier: string, otp: string) =>
    client.post("/teacher/auth/verify-otp", { identifier, otp }),
  completeActivation: (data: any) =>
    client.post("/teacher/auth/complete-activation", data),
  login: (email: string, password: string) =>
    client.post("/teacher/auth/login", { email, password }),
  forgotPassword: (email: string) =>
    client.post("/teacher/auth/forgot-password", { email }),
  resetPassword: (data: any) =>
    client.post("/teacher/auth/reset-password", data),
};

export const principalAuthApi = {
  sendOtp: (email: string) =>
    client.post("/principals/auth/send-otp", { email }),
  verifyOtp: (email: string, otp: string) =>
    client.post("/principals/auth/verify-otp", { email, otp }),
  loginWithPassword: (email: string, password: string) =>
    client.post("/principals/auth/login-password", { email, password }),
  activatePrincipal: (data: any) =>
    client.post("/principals/auth/activate", data),
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
  getWallet: () => client.get("/gamification/wallet"),
  getBadges: () => client.get("/gamification/badges"),
  syncBadges: () => client.post("/gamification/sync-badges"),
  getLeaderboard: (type: "weekly" | "alltime" | "class") =>
    client.get(`/gamification/leaderboard?type=${type}`),
  getPowerUps: () => client.get("/gamification/powerups"),
  purchasePowerUp: (powerUpId: string) =>
    client.post("/gamification/purchase-powerup", { powerUpId }),
  // Social
  getPotentialRivals: () => client.get("/social/rivals"),
  getMyChallenges: () => client.get("/social/challenges"),
  createChallenge: (data: any) => client.post("/social/challenge", data),
  acceptChallenge: (challengeId: string) =>
    client.post(`/social/challenge/${challengeId}/accept`),
  getFeed: () => client.get("/social/feed"),
  likeActivity: (activityId: string) =>
    client.post(`/social/activity/${activityId}/like`),
  commentOnActivity: (activityId: string, text: string) =>
    client.post(`/social/activity/${activityId}/comment`, { text }),
  postAchievement: (data: { title: string; type: string }) =>
    client.post("/social/share-achievement", data),
  getPublicProfile: (studentId: string) =>
    client.get(`/students/public-profile/${studentId}`),
};

export const teacherApi = {
  getDashboard: () => client.get("/teacher/dashboard"),
  getCourses: () => client.get("/teacher/courses"),
  getCourseDetail: (courseId: string) =>
    client.get(`/teacher/course/${courseId}`),
  getTeacherStudents: () => client.get("/teacher/students"),
  getStudentDetail: (studentId: string) =>
    client.get(`/teacher/student/${studentId}`),
  getCourseStudents: (courseId: string) =>
    client.get(`/teacher/course/${courseId}/students`),
  getAtRiskStudents: () => client.get("/teacher/at-risk-students"),
  submitEvidence: (data: any) => client.post("/teacher/evidence", data),
  getEvidence: () => client.get("/teacher/evidence"),
  getWallet: () => client.get("/teacher/wallet"),
};

export const principalApi = {
  getDashboard: () => client.get("/principals/auth/dashboard"),
  getCompletionByGrade: () =>
    client.get("/principals/auth/completion-by-grade"),
  getWeeklyActive: () => client.get("/principals/auth/weekly-active"),
  getTopPerformers: () => client.get("/principals/auth/top-performers"),
  getCourses: () => client.get("/principals/auth/courses"),
  exportSummary: () => client.get("/principals/auth/export"),
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
