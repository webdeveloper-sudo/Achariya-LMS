import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Presentation,
  Video,
  Headphones,
  FileText,
  Clock,
  Zap,
  Maximize2,
  Layout,
  Target,
  Loader2,
} from "lucide-react";

import StudentChatbot from "../../components/StudentChatbot";
import axiosInstance from "../../api/axiosInstance";

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
          `/courses/${courseId}/modules/${moduleId}`,
        );
        if (response.data.success) {
          setModule(response.data.data);
        } else {
          setError("Failed to load module data.");
        }
      } catch (err: any) {
        console.error("Error fetching module:", err);
        setError(
          err.response?.data?.message || "Module not found or failed to load.",
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
      const sections = getAvailableSections();
      if (sections.length > 0 && !activeSection) {
        setActiveSection(sections[0].id);
      }
    }
  }, [module]);

  const getAvailableSections = () => {
    if (!module) return [];

    const sections = [];

    if (module.videoTutorial?.url && module.videoTutorial?.section !== 0) {
      sections.push({
        id: "video",
        name: "Video Tutorial",
        icon: Video,
        order: module.videoTutorial?.section || 1,
      });
    }

    if (module.pptEmbedUrl && module.pptSection !== 0) {
      sections.push({
        id: "slides",
        name: "Presentation",
        icon: Presentation,
        order: module.pptSection || 2,
      });
    }

    if (module.audioContent?.url && module.audioContent?.section !== 0) {
      sections.push({
        id: "audio",
        name: "Audio Lecture",
        icon: Headphones,
        order: module.audioContent?.section || 3,
      });
    }

    if (module.moduleNotes?.filePath && module.moduleNotes?.section !== 0) {
      sections.push({
        id: "notes",
        name: "Study Notes",
        icon: FileText,
        order: module.moduleNotes?.section || 4,
      });
    }

    if (
      module.infographics &&
      module.infographics.length > 0 &&
      module.infographicsSection !== 0
    ) {
      sections.push({
        id: "infographics",
        name: "Visual Aids",
        icon: Layout,
        order: module.infographicsSection || 5,
      });
    }

    return sections.sort((a, b) => a.order - b.order);
  };

  const getVideoEmbedUrl = (url: string) => {
    if (!url) return null;

    const ytMatch = url.match(
      /(?:youtu\.be\/|youtube\.com\/watch\?v=|v\/|u\/\w\/|embed\/)([^#&?]*).*/,
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
          <div className="bg-white rounded-md border border-gray-300 overflow-hidden shadow-sm animate-in fade-in duration-500">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 text-sm">
                  Video Content
                </h3>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest rounded border border-gray-100">
                <Maximize2 size={12} /> Focus Active
              </div>
            </div>
            <div className="relative bg-black aspect-video">
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
                  className="w-full h-full"
                  poster={module.videoTutorial.thumbnail}
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
            {module.videoTutorial.title && (
              <div className="p-8 bg-gray-50/30">
                <div className="flex justify-between items-start gap-6">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">
                      {module.videoTutorial.title}
                    </h4>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Comprehensive visual guidance covering the core curriculum
                      objectives of this module.
                    </p>
                  </div>
                  {module.videoTutorial.duration && (
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                        Duration
                      </span>
                      <span className="text-blue-600 font-bold text-sm flex items-center gap-2 justify-end">
                        <Clock size={14} /> {module.videoTutorial.duration}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case "slides":
        return (
          <div className="bg-white rounded-md border border-gray-300 overflow-hidden shadow-sm animate-in fade-in duration-500">
            <div className="p-5 border-b border-gray-100 flex items-center gap-3 bg-white">
              <Presentation className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-900 text-sm">
                Presentation Slides
              </h3>
            </div>
            <div className="w-full h-[600px] flex justify-center items-center bg-gray-100 p-2">
              <div
                className="w-full h-full bg-white rounded border border-gray-300 overflow-hidden"
                dangerouslySetInnerHTML={{ __html: module.pptEmbedUrl }}
              />
            </div>
          </div>
        );

      case "audio":
        return (
          <div className="bg-white rounded-md border border-gray-300 overflow-hidden shadow-sm animate-in fade-in duration-500">
            <div className="p-5 border-b border-gray-100 bg-white flex items-center gap-3">
              <Headphones className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-900 text-sm">Audio Lecture</h3>
            </div>
            <div className="p-12 text-center bg-gray-50/30 flex flex-col items-center justify-center">
              <div className="max-w-xl w-full bg-white rounded-md p-10 border border-gray-300 shadow-sm">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-100">
                  <Headphones size={24} />
                </div>
                <div className="text-center mb-8">
                  <h4 className="text-xl font-bold text-gray-900 mb-1">
                    {module.audioContent.title || "Lecture Recording"}
                  </h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Academic Audio Content â€¢{" "}
                    {module.audioContent.duration || "Self-Paced"}
                  </p>
                </div>
                <div className="w-full bg-gray-50 p-4 rounded-md border border-gray-100">
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
          </div>
        );

      case "notes":
        return (
          <div className="bg-white rounded-md border border-gray-300 overflow-hidden shadow-sm animate-in fade-in duration-500">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 text-sm">
                  Module Documentation
                </h3>
              </div>
              <a
                href={module.moduleNotes.filePath}
                download
                className="bg-gray-900 text-white px-5 py-2 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <FileText size={14} /> Download PDF
              </a>
            </div>
            <div className="h-[80vh] w-full bg-gray-100 p-4">
              <div className="w-full h-full bg-white rounded border border-gray-300 overflow-hidden">
                <iframe
                  src={module.moduleNotes.filePath}
                  className="w-full h-full border-0"
                  title="Notes Viewer"
                ></iframe>
              </div>
            </div>
          </div>
        );

      case "infographics":
        return (
          <div className="bg-white rounded-md border border-gray-300 overflow-hidden shadow-sm animate-in fade-in duration-500">
            <div className="p-5 border-b border-gray-100 flex items-center gap-3 bg-white">
              <Layout className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-900 text-sm">
                Visual Summary Aids
              </h3>
            </div>
            <div className="p-10 bg-gray-50/30 space-y-10">
              {module.infographics.map((info: any, index: number) => (
                <div
                  key={index}
                  className="bg-white p-2 rounded-md border border-gray-300 shadow-sm max-w-4xl mx-auto overflow-hidden"
                >
                  <img
                    src={info.url}
                    alt={info.title || `Infographic ${index + 1}`}
                    className="w-full h-auto rounded-sm"
                    loading="lazy"
                  />
                  {info.title && (
                    <div className="p-4 border-t border-gray-50 bg-gray-50/50">
                      <p className="text-gray-900 font-bold text-sm text-center">
                        {info.title}
                      </p>
                    </div>
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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-6">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
          Initializing Curriculum Environment...
        </p>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="min-h-screen bg-white p-6 sm:p-10 flex flex-col items-center justify-center text-center">
        <div className="max-w-md">
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <ArrowLeft className="text-red-600 w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Content Not Accessible
          </h2>
          <p className="text-gray-500 text-sm mb-10 leading-relaxed font-medium">
            The requested module content is currently unavailable or has been
            relocated within the curriculum.
          </p>
          <button
            onClick={() => navigate(`/student/course/${courseId}`)}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-md font-bold uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Course
          </button>
        </div>
      </div>
    );
  }

  const availableSections = getAvailableSections();

  return (
    <div className="min-h-screen bg-white p-6 sm:p-10 max-w-7xl mx-auto">
      <Link
        to={`/student/course/${courseId}`}
        className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-8 transition-colors font-semibold text-sm group"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Return to Curriculum
      </Link>

      {/* Focus Mode Header */}
      <div className="relative border border-gray-300 rounded-md bg-white p-10 sm:p-14 mb-10 shadow-sm overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-blue-600" />
            <span className="text-blue-600 font-bold tracking-widest text-[10px] uppercase">
              Academic Unit {module.sequenceOrder || "Standard"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
            {module.title}
          </h1>
          <p className="text-gray-500 text-lg max-w-3xl leading-relaxed">
            {module.description ||
              "Systematic study of the module's core objectives through curated learning materials and guided instructional sequences."}
          </p>

          <div className="mt-8 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-50 rounded border border-gray-100">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                45 Minute Unit
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50/50 rounded border border-blue-100">
              <Layout className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                Curated Content
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Navigation */}
      {availableSections.length > 0 && (
        <div className="bg-white border-b border-gray-300 mb-10 sticky top-0 z-40">
          <div className="flex overflow-x-auto no-scrollbar gap-1 py-1">
            {availableSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-bold text-[10px] uppercase tracking-widest transition-all relative whitespace-nowrap ${
                    isActive
                      ? "text-blue-600"
                      : "text-gray-400 hover:text-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{section.name}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 animate-in slide-in-from-left duration-300"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Delivery Area */}
      <div className="min-h-[400px]">
        {availableSections.length > 0 ? (
          renderSectionContent()
        ) : (
          <div className="p-20 text-center bg-gray-50 rounded-md border border-gray-300 shadow-sm">
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Resources Pending
            </h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Instructional materials for this module are currently being
              finalized by the academic department.
            </p>
          </div>
        )}
      </div>

      {/* Assessment Invitation Section */}
      <div className="mt-16">
        <div className="bg-slate-900 rounded-md p-10 sm:p-14 text-white relative overflow-hidden shadow-lg border border-slate-800">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-2xl text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                <span className="text-blue-400 font-bold uppercase tracking-[0.2em] text-[10px] border border-blue-400/30 px-3 py-1 rounded">
                  Academic Evaluation
                </span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold mb-6 tracking-tight">
                Module Mastery Review
              </h3>
              <p className="text-slate-400 text-lg leading-relaxed">
                Demonstrate your grasp of this unit's curriculum objectives
                through formal assessments.{" "}
                <span className="text-white font-bold italic underline decoration-blue-500">
                  All assessments in this module must be cleared at 100%
                </span>{" "}
                to officially mark this unit as complete and unlock progress.
              </p>
            </div>

            <div className="flex-shrink-0 w-full lg:w-auto flex flex-col items-center lg:items-end">
              <button
                onClick={() =>
                  navigate(
                    `/student/course/${courseId}/assessment/${module._id}`,
                  )
                }
                className="w-full lg:w-auto px-10 py-4 bg-blue-600 text-white rounded-md font-bold uppercase tracking-widest text-xs hover:bg-blue-700 transition-colors flex items-center justify-center gap-3 shadow-md"
              >
                <Zap className="fill-white" size={16} />
                Begin Assessment
              </button>
              <span className="mt-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">
                Formal evaluation required for unit credit
              </span>
            </div>
          </div>
        </div>
      </div>

      {module && <StudentChatbot studentId={1} studentName="Achiever" />}
    </div>
  );
};

export default StudentModuleView;

