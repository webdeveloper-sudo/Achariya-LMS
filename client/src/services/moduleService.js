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
  // Map module file types to generic asset types
  let assetType = "documents";
  if (fileType === "slides") assetType = "slides";
  else if (fileType === "audio") assetType = "audio";
  // 'notes' and 'transcript' fall under 'documents'

  try {
    // 1. Cleanup Temp for this type
    await axiosInstance.post(`/admin/upload/cleanup-temp/${assetType}`);

    // 2. Upload to Temp
    const formData = new FormData();
    formData.append("file", file);
    const tempRes = await axiosInstance.post(
      `/admin/upload/asset/${assetType}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (!tempRes.data.success) {
      throw new Error(tempRes.data.error || "Upload to temp failed");
    }

    // 3. Save (Move to Permanent)
    const saveRes = await axiosInstance.post(`/admin/upload/save/${assetType}`);

    if (!saveRes.data.success) {
      throw new Error(saveRes.data.error || "Save permanent failed");
    }

    return {
      success: true,
      data: {
        filePath: saveRes.data.url,
        fileName: tempRes.data.originalName,
      },
    };
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
