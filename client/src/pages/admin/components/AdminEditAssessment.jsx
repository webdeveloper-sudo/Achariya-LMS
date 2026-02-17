import React from "react";
import AdminAssessmentUpload from "./AdminAssessmentUpload";

const AdminEditAssessment = (props) => {
  return <AdminAssessmentUpload {...props} isEditing={true} />;
};

export default AdminEditAssessment;
