import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Image as ImageIcon,
  Presentation,
  Video,
  Headphones,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
  FileText,
} from "lucide-react";
import StudentChatbot from "../../components/StudentChatbot";
import ExplainerPlayer from "../../components/ExplainerPlayer";
import PptxViewJs from "../../components/PptxViewJs";
import axiosInstance from "../../api/axiosInstance";
import PdfSlidesViewer from "../../components/PdfSlidesViewer";

const StudentModuleView = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `/courses/${courseId}/modules/${moduleId}`
        );
        if (response.data.success) {
          setModule(response.data.data);
        } else {
          setError("Failed to load module data.");
        }
      } catch (err: any) {
        console.error("Error fetching module:", err);
        setError(
          err.response?.data?.message || "Module not found or failed to load."
        );
      } finally {
        setLoading(false);
      }
    };

    if (courseId && moduleId) {
      fetchModule();
    }
  }, [courseId, moduleId]);

  useEffect(() => {
    if (module) {
      // Set the first available section as active
      const sections = getAvailableSections();
      if (sections.length > 0 && !activeSection) {
        setActiveSection(sections[0].id);
      }
    }
  }, [module]);

  const getAvailableSections = () => {
    if (!module) return [];

    const sections = [];

    // Video (Default Order: 1)
    if (module.videoTutorial?.url && module.videoTutorial?.section !== 0) {
      sections.push({
        id: "video",
        name: "Video",
        icon: Video,
        order: module.videoTutorial?.section || 1,
      });
    }

    // Slides (Default Order: 2)
    if (module.pptEmbedUrl && module.pptSection !== 0) {
      sections.push({
        id: "slides",
        name: "Slides",
        icon: Presentation,
        order: module.pptSection || 2,
      });
    }

    // Audio (Default Order: 3)
    if (module.audioContent?.url && module.audioContent?.section !== 0) {
      sections.push({
        id: "audio",
        name: "Audio",
        icon: Headphones,
        order: module.audioContent?.section || 3,
      });
    }

    // Notes (Default Order: 4)
    if (module.moduleNotes?.filePath && module.moduleNotes?.section !== 0) {
      sections.push({
        id: "notes",
        name: "Notes",
        icon: FileText,
        order: module.moduleNotes?.section || 4,
      });
    }

    // Infographics (Default Order: 5)
    if (
      module.infographics &&
      module.infographics.length > 0 &&
      module.infographicsSection !== 0
    ) {
      sections.push({
        id: "infographics",
        name: "Infographics",
        icon: Sparkles,
        order: module.infographicsSection || 5,
      });
    }

    return sections.sort((a, b) => a.order - b.order);
  };

  const getVideoEmbedUrl = (url: string) => {
    if (!url) return null;

    const ytMatch = url.match(
      /(?:youtu\.be\/|youtube\.com\/watch\?v=|v\/|u\/\w\/|embed\/)([^#&?]*).*/
    );
    const vimeoMatch = url.match(/(?:vimeo.com\/)([0-9]+)/);

    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    } else if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return null;
  };

  const renderSectionContent = () => {
    if (!activeSection) return null;

    switch (activeSection) {
      case "video":
        return (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b flex items-center gap-2 bg-gray-50">
              <Video className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-800">Video Tutorial</h3>
            </div>
            <div
              className="relative bg-black flex items-center justify-center"
              style={{ minHeight: "500px" }}
            >
              {getVideoEmbedUrl(module.videoTutorial.url) ? (
                <iframe
                  src={getVideoEmbedUrl(module.videoTutorial.url)!}
                  title="Video Tutorial"
                  className="w-full h-full absolute inset-0"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video
                  src={module.videoTutorial.url}
                  controls
                  className="w-full max-h-[70vh]"
                  poster={module.videoTutorial.thumbnail}
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
            {module.videoTutorial.title && (
              <div className="p-4 bg-gray-50 border-t">
                <p className="font-medium text-gray-800">
                  {module.videoTutorial.title}
                </p>
                {module.videoTutorial.duration && (
                  <p className="text-xs text-gray-500 mt-1">
                    Duration: {module.videoTutorial.duration}
                  </p>
                )}
              </div>
            )}
          </div>
        );

      case "slides":
        return (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b flex items-center gap-2 bg-gray-50">
              <Presentation className="w-5 h-5 text-orange-600" />
              <h3 className="font-bold text-gray-800">Presentation Slides</h3>
            </div>
            <div className="w-full h-[600px] flex justify-center items-center bg-gray-100 p-4">
              <div
                className="w-full h-full flex justify-center shadow-lg"
                dangerouslySetInnerHTML={{ __html: module.pptEmbedUrl }}
              />
            </div>
          </div>
        );

      case "audio":
        return (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b flex items-center gap-2 bg-gray-50">
              <Headphones className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-gray-800">Audio Content</h3>
            </div>
            <div className="p-8 text-center bg-gradient-to-br from-green-50 to-blue-50 flex flex-col items-center justify-center">
              <div className="max-w-2xl w-full bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Headphones className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-left flex-1">
                    <h4 className="font-bold text-gray-800">
                      {module.audioContent.title || "Audio Lecture"}
                    </h4>
                    {module.audioContent.duration && (
                      <p className="text-xs text-gray-500">
                        {module.audioContent.duration}
                      </p>
                    )}
                  </div>
                </div>
                <audio
                  controls
                  className="w-full"
                  src={module.audioContent.url}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          </div>
        );

      case "notes":
        return (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b flex items-center gap-2 bg-gray-50">
              <FileText className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-gray-800">Module Notes</h3>
            </div>
            <div className="h-[80vh] w-full bg-gray-100">
              <iframe
                src={module.moduleNotes.filePath}
                className="w-full h-full border-0"
                title="Notes Viewer"
              ></iframe>
            </div>
            <div className="p-3 bg-gray-50 border-t text-right">
              <a
                href={module.moduleNotes.filePath}
                download
                className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
              >
                <FileText className="w-4 h-4 mr-1" /> Download Notes PDF
              </a>
            </div>
          </div>
        );

      case "infographics":
        return (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b flex items-center gap-2 bg-gray-50">
              <Sparkles className="w-5 h-5 text-pink-600" />
              <h3 className="font-bold text-gray-800">Infographics</h3>
            </div>
            <div className="p-6 bg-gray-100 space-y-8">
              {module.infographics.map((info: any, index: number) => (
                <div
                  key={index}
                  className="bg-white p-2 rounded-xl shadow-sm max-w-4xl mx-auto"
                >
                  <img
                    src={info.url}
                    alt={info.title || `Infographic ${index + 1}`}
                    className="w-full h-auto rounded-lg"
                    loading="lazy"
                  />
                  {info.title && (
                    <p className="p-3 text-center text-gray-700 font-medium border-t mt-2">
                      {info.title}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (error || !module) {
    return (
      <div>
        <Link
          to={`/student/course/${courseId}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700">{error || "Module not found."}</p>
        </div>
      </div>
    );
  }

  const availableSections = getAvailableSections();

  return (
    <div>
      <Link
        to={`/student/course/${courseId}`}
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Course
      </Link>

      {/* Module Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-6">
        <p className="text-sm opacity-90 mb-1">Module {module.sequenceOrder}</p>
        <h1 className="text-3xl font-bold mb-2">{module.title}</h1>
        <p className="text-blue-100 line-clamp-2">{module.description}</p>
      </div>

      {/* Section Navigation Bar */}
      {availableSections.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border mb-6 overflow-hidden">
          <div className="flex overflow-x-auto">
            {availableSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeSection === section.id
                      ? "bg-blue-600 text-white border-b-2 border-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{section.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="space-y-8">
        {availableSections.length > 0 ? (
          renderSectionContent()
        ) : (
          <div className="p-12 text-center bg-white rounded-xl border">
            <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No Content Available
            </h3>
            <p className="text-gray-500">
              This module does not have any learning materials uploaded yet.
            </p>
          </div>
        )}
      </div>

      {/* Module Completion & Quiz */}
      <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-gray-800 mb-1">
            Ready to test your knowledge in this Module?
          </h3>
          <p className="text-gray-600 text-sm">
            Complete the Assessment after reviewing all learning materials above to
            unlock the next module.
          </p>
        </div>
        <button
          onClick={() => navigate(`/student/quiz/${module._id}`)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition whitespace-nowrap shadow-sm"
        >
          Take Module Assessment
        </button>
      </div>

      {/* AI Chatbot */}
      <StudentChatbot studentId={1} />
    </div>
  );
};

export default StudentModuleView;
