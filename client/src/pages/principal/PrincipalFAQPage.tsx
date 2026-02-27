import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import FAQSection from "../../components/FAQSection";

const PrincipalFAQPage = () => {
  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="border-b border-gray-100 pb-12">
        <Link
          to="/principal/dashboard"
          className="inline-flex items-center text-[13px] hover:text-[#008000] mb-10 transition-colors capitalize"
          style={{ color: "#008000" }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Executive Dashboard
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-center sm:text-left">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6 justify-center sm:justify-start">
              <div className="bg-green-50 p-2 rounded border border-green-100">
                <BookOpen className="w-5 h-5" style={{ color: "#008000" }} />
              </div>
              <span
                className="text-[13px] capitalize"
                style={{ color: "#008000" }}
              >
                Knowledge Base
              </span>
            </div>
            <h1 className="text-4xl text-gray-900 mb-6 leading-tight capitalize">
              Institutional <span className="text-gray-400">Intelligence</span>
            </h1>
            <p className="text-gray-600 text-[15px] max-w-xl leading-relaxed mx-auto sm:mx-0">
              Comprehensive documentation and operational guidelines for
              executive oversight and institutional management.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-md border border-gray-100 shadow-sm">
        <FAQSection role="principal" />
      </div>
    </div>
  );
};

export default PrincipalFAQPage;
