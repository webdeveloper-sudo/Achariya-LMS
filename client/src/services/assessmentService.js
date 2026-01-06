import adminApi from "./adminApi";

export const getAssessmentsByModule = async (moduleId) => {
  // route: /api/admin/modules/:moduleId/assessments
  const response = await adminApi.get(`/admin/modules/${moduleId}/assessments`);
  return response.data;
};

export const createAssessment = async (moduleId, assessmentData) => {
  // route: /api/admin/modules/:moduleId/assessments
  const response = await adminApi.post(
    `/admin/modules/${moduleId}/assessments`,
    assessmentData
  );
  return response.data;
};

export const getAssessmentById = async (assessmentId) => {
  const response = await adminApi.get(`/admin/assessments/${assessmentId}`);
  return response.data;
};

export const updateAssessment = async (assessmentId, assessmentData) => {
  const response = await adminApi.put(
    `/admin/assessments/${assessmentId}`,
    assessmentData
  );
  return response.data;
};

export const deleteAssessment = async (assessmentId) => {
  const response = await adminApi.delete(`/admin/assessments/${assessmentId}`);
  return response.data;
};
