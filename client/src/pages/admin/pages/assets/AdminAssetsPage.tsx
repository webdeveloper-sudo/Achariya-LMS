import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  Image as ImageIcon,
  FileText,
  Music,
  MonitorPlay,
  File,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import axiosInstance from "../../../../api/axiosInstance";
import ConfirmationPopup from "../../../../components/ConfirmationPopup";

interface AssetFile {
  relativePath: string;
  fileName: string;
  size: number;
  mtime: string;
  type: string;
  folder: string;
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
  const [filterStatus] = useState<"all" | "used" | "unused">("all");

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
          f.folder,
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
      title: "Authorize Asset Deletion",
      message: `CRITICAL: Proceed with permanent deletion of asset ${file.fileName}? ${
        file.isUsed
          ? "SYSTEM WARNING: Asset is actively linked within the platform architecture. Deletion may cause catastrophic UI errors."
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
      setAllFiles((prev) =>
        prev.filter((f) => f.relativePath !== file.relativePath),
      );
      setConfirmPopup((prev) => ({ ...prev, isOpen: false }));
    } catch (err: any) {
      console.error("Delete failed", err);
      alert(
        "Asset purge failure: " + (err.response?.data?.error || err.message),
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
    <div className="space-y-12 pb-20 px-8">
      {/* Admin Header */}
      <div className="border-b border-black pb-12">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center text-[13px] hover:text-black mb-10 transition-colors capitalize text-gray-500"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          System Authority Terminal
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-center sm:text-left">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6 justify-center sm:justify-start">
              <div className="bg-black p-2 rounded-sm border border-black">
                <FolderOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-[13px] capitalize text-black font-medium">
                Asset Architecture
              </span>
            </div>
            <h1 className="text-4xl text-black mb-6 leading-tight capitalize">
              Media <span className="text-gray-400">Database</span>
            </h1>
            <p className="text-gray-600 text-[15px] max-w-xl leading-relaxed mx-auto sm:mx-0">
              Direct management and archival of platform media assets and
              structural files.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center sm:justify-start lg:mx-0 mx-auto">
            <button
              onClick={fetchAssets}
              className="inline-flex items-center px-6 py-3.5 border border-black text-black rounded-sm text-[13px] capitalize hover:bg-black hover:text-white transition shadow-sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Synchronize Database
            </button>
          </div>
        </div>
      </div>

      {/* Control Tabs */}
      <div className="bg-white border border-black rounded-sm overflow-hidden sticky top-8 z-20">
        <div className="flex overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const count = allFiles.filter((f) => f.folder === tab.id).length;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center px-6 py-4 font-medium whitespace-nowrap transition-all border-b-2 text-[13px] capitalize ${
                  activeTab === tab.id
                    ? "border-black text-black bg-gray-50/50"
                    : "border-transparent text-gray-400 hover:text-black hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4 mr-3" />
                {tab.label}
                <span
                  className={`ml-3 text-[10px] py-0.5 px-2 rounded-sm font-mono ${
                    activeTab === tab.id
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Media Grid / List */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-32 gap-6">
            <FolderOpen className="w-12 h-12 text-gray-200 animate-pulse" />
            <p className="text-[13px] text-gray-400 capitalize">
              Synchronizing Asset Archive...
            </p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-32 border border-dashed border-black rounded-sm flex flex-col items-center gap-6">
            <File className="w-12 h-12 text-gray-200" />
            <p className="text-gray-400 text-[13px] capitalize">
              Zero active assets detected within {activeTab} protocol.
            </p>
          </div>
        ) : activeTab === "images" ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredFiles.map((file) => (
              <div
                key={file.relativePath}
                className="group relative bg-white border border-black rounded-sm overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col"
              >
                <div className="aspect-square bg-gray-50 relative border-b border-black grayscale group-hover:grayscale-0 transition-all duration-700">
                  <img
                    src={`${axiosInstance.defaults.baseURL?.replace(
                      "/api/v1",
                      "",
                    )}/${
                      file.previewUrl.startsWith("/")
                        ? file.previewUrl.slice(1)
                        : file.previewUrl
                    }`}
                    onError={(e) =>
                      (e.currentTarget.src =
                        "https://placehold.co/200?text=ASSET_ERR")
                    }
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all"
                  />

                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDeleteClick(file)}
                      className="p-1.5 bg-white border border-black text-black rounded-sm hover:bg-black hover:text-white transition-colors"
                      title="Purge Asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <p
                    className="text-[11px] font-medium text-black truncate mb-1"
                    title={file.fileName}
                  >
                    {file.fileName}
                  </p>
                  <p className="text-[10px] text-gray-400 font-mono tracking-tighter">
                    {formatSize(file.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-sm border border-black overflow-hidden shadow-none">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black text-[11px] uppercase tracking-widest text-white/70">
                  <th className="py-5 px-6 font-medium">Asset Protocol Name</th>
                  <th className="py-5 px-6 font-medium">Architecture Type</th>
                  <th className="py-5 px-6 font-medium text-right">
                    Volume Size
                  </th>
                  <th className="py-5 px-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFiles.map((file) => (
                  <tr
                    key={file.relativePath}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6 font-medium text-black">
                      <div className="flex items-center gap-3">
                        <File className="w-4 h-4 text-gray-400" />
                        <a
                          href={`http://localhost:8000/${file.previewUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline text-[13px] text-black"
                        >
                          {file.fileName}
                        </a>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[11px] text-gray-400 font-mono  uppercase tracking-widest">
                      {file.type}
                    </td>
                    <td className="py-4 px-6 text-[12px] text-black font-mono text-right">
                      {formatSize(file.size)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteClick(file)}
                        className="p-2 border border-black rounded-sm text-black hover:bg-black hover:text-white transition-all active:scale-90 inline-block"
                        title="Purge Asset"
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

      <ConfirmationPopup
        isOpen={confirmPopup.isOpen}
        title={confirmPopup.title}
        message={confirmPopup.message}
        onConfirm={confirmPopup.onConfirm}
        onCancel={() => setConfirmPopup((prev) => ({ ...prev, isOpen: false }))}
        isLoading={confirmPopup.isLoading}
        type="warning"
        confirmText="Confirm Purge"
      />
    </div>
  );
};

export default AdminAssetsPage;
