import axiosInstance from "../api/axiosInstance";

export const getModulesByCourse = async (courseId) => {
  // Use the nested route: /courses/:courseId/modules
  const response = await axiosInstance.get(
    `/admin/courses/${courseId}/modules`
  );
  return response.data;
};

export const createModule = async (courseId, moduleData) => {
  const response = await axiosInstance.post(
    `/admin/courses/${courseId}/modules`,
    moduleData
  );
  return response.data;
};

export const getModuleById = async (moduleId) => {
  const response = await axiosInstance.get(`/admin/modules/${moduleId}`);
  return response.data;
};

export const updateModule = async (moduleId, moduleData) => {
  const response = await axiosInstance.put(
    `/admin/modules/${moduleId}`,
    moduleData
  );
  return response.data;
};

export const deleteModule = async (moduleId) => {
  const response = await axiosInstance.delete(`/admin/modules/${moduleId}`);
  return response.data;
};

export const reorderModules = async (moduleIds) => {
  // We'll use the generic reorder endpoint.
  // Ideally this should be /admin/modules/reorder
  // In server/routes/moduleRoutes.js, we need to ensure this route exists or matches the pattern.
  // Assuming strict REST, we might need to adjust, but let's try the direct approach:
  const response = await axiosInstance.patch(`/admin/modules/reorder`, {
    moduleIds,
  });
  return response.data;
};

export const uploadModuleFile = async (moduleId, fileType, file) => {
  // Map fileType to specific upload endpoint suffix
  // Types: 'slides_ppt', 'slides_pdf', 'infographic', 'notes', 'audio', 'transcript'
  // Also support legacy 'slides' (defaults to ppt?) No, form uses explicit types now.

  let endpointSuffix = "";
  let fieldName = fileType;

  switch (fileType) {
    case "slides_ppt":
      endpointSuffix = "upload-slides-ppt";
      break;
    case "slides_pdf":
      endpointSuffix = "upload-slides-pdf";
      break;
    case "infographic":
      endpointSuffix = "upload-infographic";
      break;
    case "notes":
      endpointSuffix = "upload-notes";
      break;
    case "audio":
      endpointSuffix = "upload-audio";
      break;
    case "transcript":
      endpointSuffix = "upload-transcript";
      break;
    // Legacy fallback if needed (though we updated form)
    case "slides":
      // Assuming generic slides is ppt for now if old code calls it
      endpointSuffix = "upload-slides-ppt";
      fieldName = "slides_ppt";
      break;
    default:
      console.error("Unknown file type for module upload:", fileType);
      return { success: false, error: "Unknown file type" };
  }

  try {
    const formData = new FormData();
    formData.append(fieldName, file);

    const response = await axiosInstance.post(
      `/admin/modules/${moduleId}/${endpointSuffix}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("uploadModuleFile error:", error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

export const updateVideoUrl = async (moduleId, videoData) => {
  const response = await axiosInstance.put(
    `/admin/modules/${moduleId}`,
    videoData
  );
  return response.data;
};
