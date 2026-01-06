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
import { uploadModuleFile } from "@/services/moduleService";
import axiosInstance from "@/api/axiosInstance";

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

  // If created, we switch to edit mode
  const [createdModuleId, setCreatedModuleId] = useState<string | null>(null);
  const isEditing = !!createdModuleId;

  // Upload states
  const [uploadingNotes, setUploadingNotes] = useState(false);
  const [uploadingSlides, setUploadingSlides] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingTranscript, setUploadingTranscript] = useState(false);

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
      pptSlides: null,
      audioContent: null, // { url, title, duration, hasTranscript, transcriptPath }
    },
  });

  const [pendingUploads, setPendingUploads] = useState<{
    [key: string]: File;
  }>({});

  const handleFileUpload = async (file: File, type: string) => {
    // If module exists, upload immediately
    if (createdModuleId) {
      const setters: any = {
        notes: setUploadingNotes,
        slides: setUploadingSlides,
        audio: setUploadingAudio,
        transcript: setUploadingTranscript,
      };
      const setter = setters[type];
      if (setter) setter(true);

      try {
        const res = await uploadModuleFile(createdModuleId, type, file);
        if (res.success) {
          const fileData = res.data;
          updateFormFileState(type, fileData);
        }
      } catch (error) {
        console.error(error);
        alert("Upload failed");
      } finally {
        if (setter) setter(false);
      }
    } else {
      // Store locally for later upload
      setPendingUploads((prev) => ({ ...prev, [type]: file }));
      // Create a mock file data object for visual feedback & preview
      const localUrl = URL.createObjectURL(file);
      const mockFileData = {
        filePath: localUrl,
        fileName: file.name,
        originalFile: file, // Keep reference if needed
      };
      updateFormFileState(type, mockFileData);
    }
  };

  const updateFormFileState = (type: string, fileData: any) => {
    if (type === "notes") {
      setValue("moduleNotes", fileData);
    } else if (type === "slides") {
      setValue("pptSlides", fileData);
    } else if (type === "audio") {
      const currentAudio = getValues("audioContent") || {};
      setValue("audioContent", {
        ...currentAudio,
        url: fileData.filePath,
        title: fileData.fileName,
      });
    } else if (type === "transcript") {
      const currentAudio = getValues("audioContent") || {};
      setValue("audioContent", {
        ...currentAudio,
        hasTranscript: true,
        transcriptPath: fileData.filePath,
      });
    }
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      let targetModuleId = createdModuleId;

      if (!targetModuleId) {
        // Step 1: Create Module
        const res = await axiosInstance.post(
          `/admin/modules/course/${courseId}`,
          data
        );
        if (res.data.success) {
          targetModuleId = res.data.data._id;
          setCreatedModuleId(targetModuleId);
        } else {
          throw new Error("Failed to create module");
        }
      } else {
        // Update existing module (basic info)
        await axiosInstance.put(`/admin/modules/${targetModuleId}`, data);
      }

      // Step 2: Handle Pending Uploads
      const pendingKeys = Object.keys(pendingUploads);
      if (pendingKeys.length > 0 && targetModuleId) {
        const updates: any = {};

        // Parallel uploads
        // Sequential uploads to avoid temp folder conflicts
        for (const type of pendingKeys) {
          const file = pendingUploads[type];
          try {
            const uploadRes = await uploadModuleFile(
              targetModuleId!,
              type,
              file
            );
            if (uploadRes.success) {
              // Collect updates to save back to module
              const fileData = uploadRes.data;
              if (type === "notes") updates.moduleNotes = fileData;
              else if (type === "slides") updates.pptSlides = fileData;
              else if (type === "audio") {
                updates.audioContent = updates.audioContent || {
                  ...data.audioContent,
                };
                updates.audioContent.url = fileData.filePath;
                updates.audioContent.title = fileData.fileName;
              } else if (type === "transcript") {
                updates.audioContent = updates.audioContent || {
                  ...data.audioContent,
                };
                updates.audioContent.hasTranscript = true;
                updates.audioContent.transcriptPath = fileData.filePath;
              }
            }
          } catch (err) {
            console.error(`Failed to upload ${type}`, err);
          }
        }

        // Step 3: Update module with new file paths if any uploads happened
        if (Object.keys(updates).length > 0) {
          // If we have updates, we need to merge them with existing data and save again
          await axiosInstance.put(`/admin/modules/${targetModuleId}`, {
            ...data,
            ...updates,
          });
        }
      }

      onSuccess();
    } catch (error: any) {
      console.error(error);
      alert("Failed to save module");
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
                    isUploading={uploadingNotes}
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
                  <div className="flex items-center justify-between border-b pb-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      Presentation Slides
                    </h3>
                    {watch("pptSlides") && (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" /> Uploaded
                      </span>
                    )}
                  </div>

                  <DocumentUploader
                    label="Upload PPT/PPTX Slides"
                    type="ppt"
                    value={watch("pptSlides")}
                    onUpload={(f) => handleFileUpload(f, "slides")}
                    onRemove={() => setValue("pptSlides", null)}
                    isUploading={uploadingSlides}
                  />

                  {/* PPT Preview - Using Google Viewer if remote, or just Image if it's an image? 
                      User mentioned 'ppt slides or image'. If it's PPT, standard browsers can't embed it natively. 
                      If it is a blob (pending), we can't send it to Google.
                      If it is remote, we can.
                  */}
                  {watch("pptSlides")?.filePath && (
                    <div className="mt-4 border rounded-xl overflow-hidden shadow-sm bg-gray-100">
                      <div className="p-3 bg-gray-200 border-b flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase">
                          Slide Preview
                        </span>
                      </div>
                      {(() => {
                        const path = watch("pptSlides").filePath;
                        // If it's a blob/local, we can't preview PPT easeily.
                        if (path.startsWith("blob:")) {
                          return (
                            <div className="p-10 text-center text-gray-500">
                              <p>Preview will be available after saving.</p>
                            </div>
                          );
                        } else {
                          // Use Google Viewer for office docs
                          return (
                            <iframe
                              src={`https://docs.google.com/gview?url=${encodeURIComponent(
                                path
                              )}&embedded=true`}
                              className="w-full h-[500px]"
                              title="Slides Preview"
                            />
                          );
                        }
                      })()}
                    </div>
                  )}
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
                        isUploading={uploadingAudio}
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
                        isUploading={uploadingTranscript}
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
