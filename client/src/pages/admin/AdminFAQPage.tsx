import { Link } from "react-router-dom";
import { ArrowLeft, LifeBuoy } from "lucide-react";
import FAQSection from "../../components/FAQSection";

const AdminFAQPage = () => {
  return (
    <div className="space-y-12 pb-20 px-8">
      {/* Admin Header */}
      <div className="border-b border-black pb-12">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center text-[13px] hover:text-black mb-10 transition-colors capitalize text-gray-500"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          System Authority Terminal
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-black p-2 rounded-sm border border-black">
            <LifeBuoy className="w-5 h-5 text-white" />
          </div>
          <span className="text-[13px] capitalize text-black font-medium">
            Reference Protocol
          </span>
        </div>
        <h1 className="text-4xl text-black mb-6 leading-tight capitalize">
          Administrative <span className="text-gray-400">FAQ Archive</span>
        </h1>
        <p className="text-gray-600 text-[15px] max-w-xl leading-relaxed capitalize">
          System documentation and frequent operator inquiries regarding
          platform mechanics.
        </p>
      </div>

      <div className="bg-white rounded-sm border border-black shadow-none overflow-hidden">
        <FAQSection role="admin" />
      </div>
    </div>
  );
};

export default AdminFAQPage;
