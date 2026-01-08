// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  X,
  Save,
  Upload,
  FileText,
  Video,
  Music,
  MonitorPlay,
  ListChecks,
  Loader2,
  CheckCircle,
  Lock,
  Trash2,
} from "lucide-react";
// Adjust relative paths to src/admin/components
import DocumentUploader from "@/pages/admin/components/uploaders/DocumentUploader";
import AudioUploader from "@/pages/admin/components/uploaders/AudioUploader";
import LoadingSpinner from "@/pages/admin/components/LoadingSpinner";
import AssessmentBuilder from "@/pages/admin/components/AssessmentBuilder";
import { useAssetUpload } from "@/hooks/useAssetUpload";
import axiosInstance from "@/api/axiosInstance";
import { deleteAssessment } from "@/services/assessmentService";

interface AdminEditModuleFormProps {
  moduleId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminEditModuleForm = ({
  moduleId,
  onClose,
  onSuccess,
}: AdminEditModuleFormProps) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [isAssessmentBuilderOpen, setIsAssessmentBuilderOpen] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);
  const [initialData, setInitialData] = useState<any>(null);

  // Asset Upload Hooks
  const {
    upload: uploadAudioFile,
    save: saveAudioFile,
    isUploading: isUploadingAudioFile,
  } = useAssetUpload("audio");

  const {
    upload: uploadDocFile,
    save: saveDocFile,
    isUploading: isUploadingDocFile,
  } = useAssetUpload("documents");

  const {
    upload: uploadImageFile,
    save: saveImageFile,
    isUploading: isUploadingImageFile,
  } = useAssetUpload("images");

  // Form setup
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
    getValues,
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      credits: 1,
      estimatedDuration: "",
      sequenceOrder: 1,
      status: "draft",
      prerequisites: [],
      // Nested Objects
      videoTutorial: { url: "", title: "", duration: "", thumbnail: "" },
      moduleNotes: null,
      pptEmbedUrl: "",
      audioContent: null,
      infographics: [],
    },
  });

  useEffect(() => {
    fetchModule();
  }, [moduleId]);

  const fetchModule = async () => {
    try {
      const res = await axiosInstance.get(`/admin/modules/${moduleId}`);
      const raw = res.data?.data ?? res.data?.module ?? res.data;

      if (!raw) {
        throw new Error("Module data not found");
      }

      // Populate form
      const normalizedData = {
        ...raw,
        videoTutorial: raw.videoTutorial ?? {
          url: "",
          title: "",
          duration: "",
          thumbnail: "",
        },
        audioContent: raw.audioContent ?? {
          url: "",
          title: "",
          duration: "",
          hasTranscript: false,
          transcriptPath: "",
        },
        moduleNotes: raw.moduleNotes ?? null,
        pptEmbedUrl: raw.pptEmbedUrl ?? "",
        infographics: raw.infographics ?? [],
      };

      setInitialData(normalizedData);
      reset(normalizedData);
    } catch (err) {
      console.error("Failed to load module:", err);
      alert("Failed to load module data");
    } finally {
      setDataLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: string) => {
    try {
      let finalUrl = "";
      let metadata: any = {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      };

      // 1. Upload & Save based on type
      if (type === "audio") {
        await uploadAudioFile(file);
        finalUrl = await saveAudioFile();
      } else if (type === "notes" || type === "transcript") {
        await uploadDocFile(file);
        finalUrl = await saveDocFile();
      } else if (type === "infographic") {
        const currentInfographics = getValues("infographics") || [];
        if (currentInfographics.length >= 10) {
          alert("You can only upload up to 10 infographics.");
          return;
        }
        await uploadImageFile(file);
        finalUrl = await saveImageFile();
      }

      if (!finalUrl) throw new Error("Failed to get file URL");

      // 2. Update Form State (which will be saved on "Save Changes")
      if (type === "notes") {
        setValue("moduleNotes", {
          ...metadata,
          filePath: finalUrl,
          uploadedOn: new Date().toISOString(),
        });
      } else if (type === "infographic") {
        const current = getValues("infographics") || [];
        setValue("infographics", [
          ...current,
          {
            url: finalUrl,
            title: file.name,
            order: current.length + 1,
          },
        ]);
      } else if (type === "audio") {
        const current = getValues("audioContent") || {};
        setValue("audioContent", {
          ...current,
          ...metadata,
          url: finalUrl,
          title: current.title || file.name,
        });
      } else if (type === "transcript") {
        const current = getValues("audioContent") || {};
        setValue("audioContent", {
          ...current,
          hasTranscript: true,
          transcriptPath: finalUrl,
        });
      }
    } catch (err) {
      console.error(err);
      alert(`Failed to upload ${type}`);
    }
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await axiosInstance.put(`/admin/modules/${moduleId}`, data);
      onSuccess();
    } catch (error: any) {
      console.error(error);
      alert("Failed to save module");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    if (!confirm("Are you sure you want to delete this assessment?")) return;
    try {
      await deleteAssessment(assessmentId);
      // Remove from local state
      setInitialData((prev: any) => ({
        ...prev,
        assessments: prev.assessments.filter(
          (a: any) => a._id !== assessmentId
        ),
      }));
    } catch (error) {
      console.error("Failed to delete assessment:", error);
      alert("Failed to delete assessment");
    }
  };

  if (dataLoading)
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        Loading module...
      </div>
    );

  const tabs = [
    { id: "basic", label: "Basic Info", icon: FileText },
    { id: "notes", label: "Notes (PDF)", icon: FileText },
    { id: "video", label: "Video Tutorial", icon: Video },
    { id: "audio", label: "Audio Content", icon: Music },
    { id: "slides", label: "Google Slides", icon: MonitorPlay },
    { id: "infographics", label: "Infographics", icon: FileText },
    { id: "assessments", label: "Assessments", icon: ListChecks },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Edit Module: {initialData?.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Tabs & Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-64 bg-gray-50 border-r overflow-y-auto">
            <div className="p-2 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition text-left
                                        ${
                                          activeTab === tab.id
                                            ? "bg-blue-100 text-blue-700"
                                            : "text-gray-600 hover:bg-white hover:shadow-sm"
                                        }
                                    `}
                >
                  <tab.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6 max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-sm border"
            >
              {activeTab === "basic" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Module Title *
                      </label>
                      <input
                        {...register("title", {
                          required: "Title is required",
                        })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                        placeholder="Enter module title"
                      />
                      {errors.title && (
                        <span className="text-red-500 text-xs">
                          {errors.title.message as string}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Estimated Duration
                      </label>
                      <input
                        {...register("estimatedDuration")}
                        placeholder="e.g. 2 hours"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Sequence Order
                      </label>
                      <input
                        type="number"
                        {...register("sequenceOrder", { valueAsNumber: true })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g. 1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Credits *
                      </label>
                      <input
                        type="number"
                        {...register("credits", { required: true, min: 1 })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        {...register("status")}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        {...register("description", {
                          required: "Description is required",
                          maxLength: 2000,
                        })}
                        rows={5}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        placeholder="Detailed description of the module content..."
                      />
                      {errors.description && (
                        <span className="text-red-500 text-xs">
                          {errors.description.message as string}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes Tab */}
              {activeTab === "notes" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b pb-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      Module Notes
                    </h3>
                    {watch("moduleNotes") && (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" /> Uploaded
                      </span>
                    )}
                  </div>

                  <DocumentUploader
                    label="Upload PDF Notes File"
                    type="pdf"
                    value={watch("moduleNotes")}
                    onUpload={(f) => handleFileUpload(f, "notes")}
                    onRemove={() => setValue("moduleNotes", null)}
                    isUploading={isUploadingDocFile}
                  />
                </div>
              )}

              {/* Slides Tab */}
              {activeTab === "slides" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b pb-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      Google Slides
                    </h3>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                    <label className="block text-sm font-semibold text-blue-900 mb-1">
                      Google Slides Embed URL
                    </label>
                    <input
                      {...register("pptEmbedUrl")}
                      placeholder='<iframe src="https://docs.google.com/presentation/..." ...></iframe>'
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                    />
                    <p className="text-xs text-blue-700 mt-2">
                      Paste the full iframe code from Google Slides (File &gt;
                      Share &gt; Publish to web &gt; Embed).
                    </p>
                  </div>

                  {/* Embed Preview */}
                  {(() => {
                    const embedCode = watch("pptEmbedUrl");

                    if (embedCode) {
                      return (
                        <div className="mt-4 border rounded-xl overflow-hidden shadow-sm bg-gray-100">
                          <div className="p-3 bg-gray-200 border-b flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-500 uppercase">
                              Slide Preview
                            </span>
                          </div>
                          <div
                            className="w-full h-[500px] flex justify-center bg-black"
                            dangerouslySetInnerHTML={{ __html: embedCode }}
                          />
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}

              {/* Infographics Tab */}
              {activeTab === "infographics" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b pb-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      Infographics
                    </h3>
                    <p className="text-sm text-gray-500">
                      Add visual learning materials
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                    <DocumentUploader
                      label="Upload Infographic (JPG/PNG)"
                      type="image"
                      value={null}
                      onUpload={(f) => handleFileUpload(f, "infographic")}
                      isUploading={isUploadingImageFile}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-700 border-b pb-2">
                      Uploaded Gallery ({watch("infographics")?.length || 0}/10)
                    </h4>
                    {watch("infographics") &&
                    watch("infographics").length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {watch("infographics").map((info: any, idx: number) => (
                          <div
                            key={idx}
                            className="relative group border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition"
                          >
                            <img
                              src={info.url}
                              alt={info.title}
                              className="w-full h-32 object-cover"
                            />
                            <div className="p-2">
                              <p
                                className="text-xs text-gray-600 truncate"
                                title={info.title}
                              >
                                {info.title}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const current = getValues("infographics");
                                const updated = current.filter(
                                  (_: any, i: number) => i !== idx
                                );
                                setValue("infographics", updated);
                              }}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove Infographic"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic text-center py-8">
                        No infographics uploaded yet.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Video Tab */}
              {activeTab === "video" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b pb-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      Video Tutorial
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Video URL (YouTube/Vimeo) *
                      </label>
                      <input
                        {...register("videoTutorial.url")}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      {/* Video Preview */}
                      {(() => {
                        const url = watch("videoTutorial.url");
                        let embedUrl = null;
                        if (url) {
                          const ytMatch = url.match(
                            /(?:youtu\.be\/|youtube\.com\/watch\?v=|v\/|u\/\w\/|embed\/)([^#&?]*).*/
                          );
                          const vimeoMatch = url.match(
                            /(?:vimeo.com\/)([0-9]+)/
                          );
                          if (ytMatch && ytMatch[1]) {
                            embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
                          } else if (vimeoMatch && vimeoMatch[1]) {
                            embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
                          }
                        }

                        if (embedUrl) {
                          return (
                            <div className="mt-4 bg-black rounded-xl overflow-hidden shadow-lg aspect-video">
                              <iframe
                                src={embedUrl}
                                title="Video Preview"
                                className="w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            </div>
                          );
                        } else if (url) {
                          return (
                            <div className="mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                              Enter a valid YouTube or Vimeo URL to see a
                              preview.
                            </div>
                          );
                        }
                      })()}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Video Title
                      </label>
                      <input
                        {...register("videoTutorial.title")}
                        placeholder="Title for the video"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Duration
                      </label>
                      <input
                        {...register("videoTutorial.duration")}
                        placeholder="e.g. 10:30"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Audio Tab */}
              {activeTab === "audio" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b pb-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      Audio Content
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-100 mb-2">
                      <label className="block text-sm font-bold text-blue-800 mb-2">
                        Upload Audio File
                      </label>
                      <AudioUploader
                        label="Upload Audio File (MP3/WAV)"
                        value={
                          watch("audioContent.url")
                            ? {
                                filePath: watch("audioContent.url"),
                                fileName:
                                  watch("audioContent.title") || "Audio File",
                              }
                            : null
                        }
                        onUpload={(f) => handleFileUpload(f, "audio")}
                        onRemove={() => setValue("audioContent.url", "")}
                        isUploading={isUploadingAudioFile}
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Or Enter Audio URL
                      </label>
                      <input
                        {...register("audioContent.url")}
                        placeholder="https://..."
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Audio Title
                      </label>
                      <input
                        {...register("audioContent.title")}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Duration
                      </label>
                      <input
                        {...register("audioContent.duration")}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div className="col-span-2 pt-4 border-t">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Transcript
                      </label>
                      <DocumentUploader
                        label="Upload Transcript (PDF/TXT)"
                        type="pdf"
                        value={
                          watch("audioContent.hasTranscript")
                            ? {
                                filePath: watch("audioContent.transcriptPath"),
                                fileName: "Transcript File",
                              }
                            : null
                        }
                        onUpload={(f) => handleFileUpload(f, "transcript")}
                        onRemove={() => {
                          setValue("audioContent.hasTranscript", false);
                          setValue("audioContent.transcriptPath", "");
                        }}
                        isUploading={isUploadingDocFile}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Assessments Tab */}
              {activeTab === "assessments" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {!isAssessmentBuilderOpen ? (
                    <>
                      <div className="flex items-center justify-between border-b pb-4">
                        <h3 className="text-lg font-bold text-gray-800">
                          Module Assessments
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAssessmentId(null);
                            setIsAssessmentBuilderOpen(true);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm flex items-center"
                        >
                          <ListChecks className="w-4 h-4 mr-2" />
                          Create New Assessment
                        </button>
                      </div>

                      <div className="space-y-3">
                        {initialData?.assessments?.length > 0 ? (
                          initialData.assessments.map(
                            (ass: any, index: number) => (
                              <div
                                key={ass._id || index}
                                className="p-4 border rounded-xl bg-white flex justify-between items-center hover:shadow-sm transition"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-800">
                                      {ass.title}
                                    </span>
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                        ass.isActive
                                          ? "bg-green-100 text-green-700"
                                          : "bg-gray-100 text-gray-600"
                                      }`}
                                    >
                                      {ass.isActive ? "Active" : "Inactive"}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {ass.assessmentType?.toUpperCase() ||
                                      "ASSESSMENT"}{" "}
                                    • {ass.questions?.length || 0} Questions •{" "}
                                    {ass.totalMarks || 0} Marks
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedAssessmentId(ass._id);
                                      setIsAssessmentBuilderOpen(true);
                                    }}
                                    className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteAssessment(ass._id)
                                    }
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                    title="Delete Assessment"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            )
                          )
                        ) : (
                          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <ListChecks className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">
                              No assessments added yet
                            </p>
                            <p className="text-gray-400 text-sm mt-1">
                              Create a quiz or exam for this module
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="bg-gray-50 border rounded-xl overflow-hidden">
                      <div className="p-4 border-b bg-white flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">
                          Assessment Editor
                        </h3>
                        <button
                          onClick={() => {
                            setIsAssessmentBuilderOpen(false);
                            fetchModule();
                          }}
                          className="text-sm text-gray-500 hover:text-gray-800"
                        >
                          Back to List
                        </button>
                      </div>
                      <AssessmentBuilder
                        isEmbedded={true}
                        moduleId={moduleId}
                        courseId={initialData?.courseId}
                        assessmentId={selectedAssessmentId}
                        onClose={() => {
                          setIsAssessmentBuilderOpen(false);
                          fetchModule();
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white flex justify-end gap-3 z-10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
          >
            Close
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center shadow-lg active:scale-95 transition font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin w-4 h-4 mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEditModuleForm;
