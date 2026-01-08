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
} from "lucide-react";
// Adjust relative paths to src/admin/components
import DocumentUploader from "@/pages/admin/components/uploaders/DocumentUploader";
import AudioUploader from "@/pages/admin/components/uploaders/AudioUploader";
import LoadingSpinner from "@/pages/admin/components/LoadingSpinner";
import AssessmentBuilder from "@/pages/admin/components/AssessmentBuilder";
import axiosInstance from "@/api/axiosInstance";
import { useAssetUpload } from "@/hooks/useAssetUpload";

interface AdminAddModuleFormProps {
  courseId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminAddModuleForm = ({
  courseId,
  onClose,
  onSuccess,
}: AdminAddModuleFormProps) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAssessmentBuilderOpen, setIsAssessmentBuilderOpen] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);

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

  // If created, we switch to edit mode
  const [createdModuleId, setCreatedModuleId] = useState<string | null>(null);
  const isEditing = !!createdModuleId;

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
      pptEmbedUrl: "", // Changed default
      audioContent: null, // { url, title, duration, hasTranscript, transcriptPath }
    },
  });

  // Unified File Upload Handler
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
        // limit check
        const currentInfographics = getValues("infographics") || [];
        if (currentInfographics.length >= 10) {
          alert("You can only upload up to 10 infographics.");
          return;
        }
        await uploadImageFile(file);
        finalUrl = await saveImageFile();
      }

      if (!finalUrl) throw new Error("Failed to get file URL");

      // 2. Update Form State
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
      // Sanitize payload to prevent CastError/Validation Error
      const payload = {
        ...data,
        credits: Number(data.credits) || 0,
        sequenceOrder: Number(data.sequenceOrder) || 1,
        moduleNotes: data.moduleNotes ? data.moduleNotes : undefined,
        audioContent: data.audioContent ? data.audioContent : undefined,
        infographics: data.infographics || [],
        pptEmbedUrl: data.pptEmbedUrl || "",
        videoTutorial: {
          ...data.videoTutorial,
          duration: data.videoTutorial?.duration || "", // Ensure string
        },
      };

      if (courseId) {
        // Mode A: Create new module directly under course
        const endpoint = `/admin/modules/course/${courseId}`;
        await axiosInstance.post(endpoint, payload);
      } else {
        throw new Error("Missing courseId");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Submission Error:", error);
      console.error("Error Response:", error.response?.data);

      const serverError =
        error.response?.data?.error || error.response?.data?.message;
      // If serverError is an object (common with Mongoose validation), stringify it
      const displayError =
        typeof serverError === "object"
          ? JSON.stringify(serverError, null, 2)
          : serverError || "Failed to save module";

      alert(`Save Failed: ${displayError}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: FileText },
    { id: "notes", label: "Notes (PDF)", icon: FileText },
    { id: "video", label: "Video Tutorial", icon: Video },
    { id: "audio", label: "Audio Content", icon: Music },
    { id: "slides", label: "PPT Slides", icon: MonitorPlay },
    { id: "infographics", label: "Infographics", icon: FileText },
    {
      id: "assessments",
      label: "Assessments",
      icon: ListChecks,
      disabled: !isEditing,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {isEditing ? `Edit Module` : "Create New Module"}
            </h2>
            {!isEditing && (
              <p className="text-sm text-gray-500">
                Step 1: Create module structure. Step 2: Add files.
              </p>
            )}
            {isEditing && (
              <p className="text-sm text-green-600">
                Module Created! You can now upload files and add assessments.
              </p>
            )}
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

                  {/* PDF Preview */}
                  {watch("moduleNotes")?.filePath && (
                    <div className="mt-4 border rounded-xl overflow-hidden shadow-sm bg-gray-100">
                      <div className="p-3 bg-gray-200 border-b flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase">
                          PDF Preview
                        </span>
                      </div>
                      <iframe
                        src={watch("moduleNotes").filePath}
                        className="w-full h-[500px]"
                        title="PDF Preview"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Slides Tab */}
              {activeTab === "slides" && (
                <div className="space-y-6 animate-in fade-in duration-200">
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
                      // Extract src if full iframe tag is pasted, or use as is if just URL (though prompt implies iframe code)
                      // Prompt: "add ppt like this ... <iframe ...></iframe>"
                      // Let's safe render it using dangerouslySetInnerHTML but purely for preview
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
                    <h4 className="text-sm font-bold text-blue-800 mb-2">
                      Upload Infographic Image
                    </h4>
                    <DocumentUploader
                      label="Upload Image (JPG/PNG)"
                      type="image"
                      value={null} // We don't bind a single value, we push to array in backend
                      onUpload={(f) => handleFileUpload(f, "infographic")}
                      isUploading={isUploadingImageFile}
                    />
                  </div>

                  {/* List of uploaded infographics */}
                  {/* List of uploaded infographics */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-700 border-b pb-2">
                      Uploaded Infographics (
                      {watch("infographics")?.length || 0}/10)
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
                    {/* Simplified Assessment List (Since we don't have initialData.assessments populated here unless we refetch) */}
                    {/* Add Form won't have assessments yet unless we refetch after creation.
                        We can implement refetch logic but for now let's just show placeholder */}
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <ListChecks className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">
                        Assessments can be managed after creating basic module.
                      </p>
                    </div>
                  </div>
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
            {isEditing ? "Save Changes" : "Create Module"}
          </button>
        </div>
      </div>

      {/* Nested Assessment Builder Modal */}
      {isAssessmentBuilderOpen && (
        <AssessmentBuilder
          isOpen={isAssessmentBuilderOpen}
          onClose={() => {
            setIsAssessmentBuilderOpen(false);
            if (onSuccess) onSuccess(); // Refresh?
          }}
          moduleId={createdModuleId}
          courseId={courseId}
          assessmentId={selectedAssessmentId}
        />
      )}
    </div>
  );
};

export default AdminAddModuleForm;
