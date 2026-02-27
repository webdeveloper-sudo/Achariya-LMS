import { useParams, useNavigate } from "react-router-dom";
// @ts-ignore
import TeacherAssessmentBuilder from "./components/TeacherAssessmentBuilder";
import { X } from "lucide-react";

const TeacherAssessmentCreator = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();

  // Since it's a new assessment, assessmentId is null/undefined
  const assessmentId = null;

  return (
    <div className="h-screen flex flex-col bg-gray-50/30">
      <div className="flex-none p-6 bg-white border-b border-gray-100 flex justify-between items-center shadow-sm">
        <h1 className="text-xl text-gray-900 capitalize">
          Create <span className="text-gray-400">Assessment</span>
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-[#c72323] transition-colors flex items-center gap-2 text-sm capitalize"
        >
          <X size={18} /> Close Terminal
        </button>
      </div>
      <div className="flex-1 relative">
        <TeacherAssessmentBuilder
          isOpen={true}
          onClose={() => navigate(-1)}
          moduleId={moduleId}
          courseId={courseId}
          assessmentId={assessmentId}
          isEmbedded={false} // Full screen mode
        />
      </div>
    </div>
  );
};

export default TeacherAssessmentCreator;
