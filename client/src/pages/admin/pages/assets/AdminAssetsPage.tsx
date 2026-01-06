import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  Image as ImageIcon,
  FileText,
  Music,
  MonitorPlay,
  File,
  Filter,
  RefreshCw,
} from "lucide-react";
import axiosInstance from "../../../../api/axiosInstance";
import ConfirmationPopup from "../../../../components/ConfirmationPopup"; // Adjust if necessary

interface AssetFile {
  relativePath: string;
  fileName: string;
  size: number;
  mtime: string;
  type: string;
  folder: string; // 'images', 'documents', etc.
  isUsed: boolean;
  previewUrl: string;
}

const TABS = [
  { id: "images", label: "Images", icon: ImageIcon },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "audio", label: "Audio", icon: Music },
  { id: "slides", label: "Slides", icon: MonitorPlay },
  { id: "temp", label: "Temporary", icon: RefreshCw },
  { id: "other", label: "Others", icon: File },
];

const AdminAssetsPage = () => {
  const [allFiles, setAllFiles] = useState<AssetFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("images");
  const [filterStatus, setFilterStatus] = useState<"all" | "used" | "unused">(
    "all"
  );

  // Confirmation State
  const [confirmPopup, setConfirmPopup] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isLoading: false,
  });

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/assets");
      if (res.data.success) {
        setAllFiles(res.data.files);
      }
    } catch (err) {
      console.error("Failed to fetch assets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const filteredFiles = useMemo(() => {
    let files = allFiles.filter((f) => {
      if (activeTab === "other") {
        return !["images", "documents", "audio", "slides", "temp"].includes(
          f.folder
        );
      }
      return f.folder === activeTab;
    });

    if (filterStatus === "used") {
      files = files.filter((f) => f.isUsed);
    } else if (filterStatus === "unused") {
      files = files.filter((f) => !f.isUsed);
    }

    return files;
  }, [allFiles, activeTab, filterStatus]);

  const handleDeleteClick = (file: AssetFile) => {
    setConfirmPopup({
      isOpen: true,
      title: "Delete Asset",
      message: `Are you sure you want to delete ${file.fileName}? ${
        file.isUsed
          ? "WARNING: This file is currently marked as USED in the system. Deleting it will break links."
          : ""
      }`,
      onConfirm: () => executeDelete(file),
      isLoading: false,
    });
  };

  const executeDelete = async (file: AssetFile) => {
    setConfirmPopup((prev) => ({ ...prev, isLoading: true }));
    try {
      await axiosInstance.delete("/admin/assets", {
        data: { relativePath: file.relativePath },
      });
      // Remove from state
      setAllFiles((prev) =>
        prev.filter((f) => f.relativePath !== file.relativePath)
      );
      setConfirmPopup((prev) => ({ ...prev, isOpen: false }));
    } catch (err: any) {
      console.error("Delete failed", err);
      alert(
        "Failed to delete asset: " + (err.response?.data?.error || err.message)
      );
      setConfirmPopup((prev) => ({ ...prev, isLoading: false, isOpen: false }));
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 flex flex-col">
      <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Assets</h1>
          <p className="text-sm text-gray-500 mt-1">
            Server Uploads Management
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchAssets}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Sticky Navbar */}
      <div className="sticky top-0 z-20 bg-white shadow-sm border rounded-xl mb-6 overflow-hidden">
        {/* Main Tabs */}
        <div className="flex overflow-x-auto border-b">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const count = allFiles.filter((f) => f.folder === tab.id).length;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 border-b-2 font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 bg-blue-50/50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
                <span
                  className={`ml-2 text-xs py-0.5 px-2 rounded-full ${
                    activeTab === tab.id
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Bar */}
        {/* <div className="flex items-center p-3 gap-2 bg-gray-50/50">
          <Filter className="w-4 h-4 text-gray-500 ml-2" />
          <span className="text-sm font-semibold text-gray-700 mr-2">
            Filter:
          </span>

          {(["all", "used", "unused"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 text-sm rounded-md capitalize transition ${
                filterStatus === status
                  ? "bg-white text-gray-800 shadow-sm border font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {status}
            </button>
          ))}

          <div className="ml-auto text-sm text-gray-500">
            Showing {filteredFiles.length} files
          </div>
        </div> */}
      </div>

      {/* Content */}
      <div className="flex-1">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed">
            <p className="text-gray-500">
              No {activeTab} files found in {filterStatus} category.
            </p>
          </div>
        ) : activeTab === "images" ? (
          /* Grid for Images */
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file.relativePath}
                className={`group relative bg-white rounded-lg border overflow-hidden hover:shadow-md transition ${
                  file.isUsed ? "border-green-200" : "border-red-100"
                }`}
              >
                <div className="aspect-square bg-gray-100 relative">
                  <img
                    src={`${axiosInstance.defaults.baseURL?.replace(
                      "/api/v1",
                      ""
                    )}/${
                      file.previewUrl.startsWith("/")
                        ? file.previewUrl.slice(1)
                        : file.previewUrl
                    }`}
                    // Note: previewUrl from API is "/assets/..."
                    // If baseURL includes /api/v1, we need to strip or just use relative if proxy?
                    // Actually the API returns `/assets/temp/...`.
                    // If running on port 5173 and server 8000, we need full URL or proxy.
                    // For safety, let's try just the path if proxy is set, or full url.
                    // The server response `previewUrl` is `/assets/images/...`.
                    // Browsers handle `/assets` relative to current origin (client).
                    // But assets are on server (8000). Client is 5173.
                    // So we need `http://localhost:8000/assets...`.
                    // I'll assume axiosInstance.defaults.baseURL is http://localhost:8000/api/v1
                    // So I need to strip /api/v1 and append.
                    onError={(e) =>
                      (e.currentTarget.src =
                        "https://placehold.co/200?text=IMG")
                    }
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDeleteClick(file)}
                      className="p-1.5 bg-white text-red-600 rounded-full shadow hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* <div className="absolute top-2 left-2">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        file.isUsed
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {file.isUsed ? "Used" : "Unused"}
                    </span>
                  </div> */}
                </div>
                <div className="p-2">
                  <p
                    className="text-xs font-medium text-gray-700 truncate"
                    title={file.fileName}
                  >
                    {file.fileName}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {formatSize(file.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List for others */
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 font-semibold">
                <tr>
                  <th className="px-6 py-3">File Name</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Size</th>
                  {/* <th className="px-6 py-3">Status</th> */}
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFiles.map((file) => (
                  <tr key={file.relativePath} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-800">
                      <div className="flex items-center gap-2">
                        <File className="w-4 h-4 text-gray-400" />
                        <a
                          href={`http://localhost:8000/${file.previewUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline hover:text-blue-600"
                        >
                          {file.fileName}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-500 uppercase">
                      {file.type}
                    </td>
                    <td className="px-6 py-3 text-gray-500 font-mono">
                      {formatSize(file.size)}
                    </td>
                    {/* <td className="px-6 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-bold ${
                          file.isUsed
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {file.isUsed ? "USED" : "UNUSED"}
                      </span>
                    </td> */}
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => handleDeleteClick(file)}
                        className="text-gray-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Popup */}
      <ConfirmationPopup
        isOpen={confirmPopup.isOpen}
        title={confirmPopup.title}
        message={confirmPopup.message}
        onConfirm={confirmPopup.onConfirm}
        onCancel={() => setConfirmPopup((prev) => ({ ...prev, isOpen: false }))}
        isLoading={confirmPopup.isLoading}
        type="danger"
        confirmText="Yes, Delete"
      />
    </div>
  );
};

export default AdminAssetsPage;
