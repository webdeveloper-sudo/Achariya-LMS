import { Link } from "react-router-dom";
import { ArrowLeft, HelpCircle, Sparkles } from "lucide-react";
import FAQSection from "../../components/FAQSection";

const StudentFAQPage = () => {
  return (
    <div className="min-h-screen">
      {/* Header Section - Standardized Industrial Refinement */}
      <div className=" border-b border-gray-100 pt-10 pb-8 px-6 sm:px-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
     <Link
            to="/student/dashboard"
            className="inline-flex items-center text-gray-500 hover:text-blue-900 mb-5 transition-colors text-[12px] uppercase tracking-widest group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Dashboard
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-900 p-2 rounded border border-blue-800 shadow-sm">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-blue-900   tracking-widest text-[10px] uppercase">
                  Support & Documentation
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl   text-gray-900 mb-4 tracking-tight leading-tight uppercase">
                Knowledge <span className="text-gray-400">Base</span>
              </h1>
              <p className="text-gray-500 text-[15px] font-medium max-w-2xl leading-relaxed">
                Access institution-verified documentation and procedural
                guidance to maximize your academic performance and registry
                standing.
              </p>
            </div>

            <div className="hidden lg:block">
              <div className="bg-white p-6 rounded-md border border-gray-300 shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none heatmap-industrial bg-blue-900"></div>
                <div className="relative z-10 flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-md">
                    <Sparkles className="w-6 h-6 text-blue-900" />
                  </div>
                  <div>
                    <p className="text-[10px]   text-gray-900 uppercase tracking-widest">
                      Protocol Version
                    </p>
                    <p className="text-[12px]   text-blue-900">
                      v4.0 Academic Standard
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 pb-32 mt-3 relative z-20">
        <div className="grid grid-cols-1 gap-10">
          <FAQSection role="student" />
        </div>
      </div>
    </div>
  );
};

export default StudentFAQPage;
