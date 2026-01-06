import { useState } from "react";
import axiosInstance from "@/api/axiosInstance";

export const useAssetUpload = (
  type: "images" | "slides" | "documents" | "audio"
) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      // 1. Clean temp
      await axiosInstance.post(`/admin/upload/cleanup-temp/${type}`);

      // 2. Upload to temp
      const formData = new FormData();
      formData.append("file", file);

      const res = await axiosInstance.post(
        `/admin/upload/asset/${type}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        // Return the temp URL for preview
        // The backend returns 'previewUrl' which is relative or absolute?
        // Backend: res.json({ ..., previewUrl: `/assets/temp/...` })
        return res.data.previewUrl;
      } else {
        throw new Error(res.data.error || "Upload failed");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Upload failed");
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const save = async () => {
    setIsUploading(true);
    setError(null);
    try {
      const res = await axiosInstance.post(`/admin/upload/save/${type}`);
      if (res.data.success) {
        return res.data.url; // The final permanent URL
      } else {
        throw new Error(res.data.error || "Save failed");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Save failed");
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const cancel = async () => {
    try {
      await axiosInstance.delete(`/admin/upload/temp/${type}`);
    } catch (err) {
      console.error(err);
    }
  };

  return { upload, save, cancel, isUploading, error };
};
