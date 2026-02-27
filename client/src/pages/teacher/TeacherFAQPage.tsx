import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import FAQSection from "../../components/FAQSection";

const TeacherFAQPage = () => {
  return (
    <div className="pb-20">
      <Link
        to="/teacher/dashboard"
        className="inline-flex items-center text-[13px] hover:text-[#c72323] mb-8 transition-colors capitalize"
        style={{ color: "#c72323" }}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>

      <FAQSection role="teacher" />
    </div>
  );
};

export default TeacherFAQPage;
