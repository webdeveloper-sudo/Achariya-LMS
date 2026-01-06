import adminApi from "./adminApi";

export const getAllTeachers = async () => {
  // Existing route: /api/v1/admin/teachers
  // We can use adminApi but we need to create a version that hits v1 or just use the base axios if we set up adminApi for '/api' only.
  // server.js: app.use("/api/v1/admin/teachers", require("./routes/teacherRoutes"));
  // My adminApi points to /api (implied /api/admin/courses -> /api + /admin/courses).
  // If I want /api/v1/admin/teachers, I can use adminApi with full relative path if I didn't lock baseURL?
  // axios baseURL is prepended.
  // If baseURL is 'http://locahost:8000/api', then '.get(/v1/admin/teachers)' -> 'http://locahost:8000/api/v1/admin/teachers'.
  // Yes.

  // Check baseURL in adminApi.js.
  // If VITE_API_URL is '.../api/v1', I replaced it with '.../api'.
  // So baseURL is '.../api'.
  // So requesting '/v1/admin/teachers' should work.

  const response = await adminApi.get("/v1/admin/teachers");
  return response.data;
};
