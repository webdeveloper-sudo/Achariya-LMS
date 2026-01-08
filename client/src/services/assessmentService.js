import axiosInstance from "../api/axiosInstance";

export const getAssessmentsByModule = async (moduleId) => {
  // route: /api/v1/admin/modules/:moduleId/assessments
  const response = await axiosInstance.get(
    `/admin/modules/${moduleId}/assessments`
  );
  return response.data;
};

export const createAssessment = async (moduleId, assessmentData) => {
  // route: /api/v1/admin/modules/:moduleId/assessments
  const response = await axiosInstance.post(
    `/admin/modules/${moduleId}/assessments`,
    assessmentData
  );
  return response.data;
};

export const getAssessmentById = async (assessmentId) => {
  const response = await axiosInstance.get(
    `/admin/assessments/${assessmentId}`
  );
  return response.data;
};

export const updateAssessment = async (assessmentId, assessmentData) => {
  const response = await axiosInstance.put(
    `/admin/assessments/${assessmentId}`,
    assessmentData
  );
  return response.data;
};

export const deleteAssessment = async (assessmentId) => {
  const response = await axiosInstance.delete(
    `/admin/assessments/${assessmentId}`
  );
  return response.data;
};
