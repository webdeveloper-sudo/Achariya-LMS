import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import TeacherAssessmentBuilder from "./components/TeacherAssessmentBuilder";

const TeacherAssessmentCreator = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();

  // Since it's a new assessment, assessmentId is null/undefined
  const assessmentId = null;

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-none p-4 bg-white border-b flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">Create Assessment</h1>
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-900 font-medium"
        >
          Close
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
