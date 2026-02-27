import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { faqData, UserRole } from "../data/faqs";

interface FAQSectionProps {
  role: UserRole;
}

const FAQSection = ({ role }: FAQSectionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = faqData[role];

  const getRoleConfig = (role: UserRole) => {
    switch (role) {
      case "teacher":
        return {
          primary: "#c72323",
          bg: "bg-red-50",
          border: "border-red-100",
          text: "text-[#c72323]",
        };
      case "principal":
        return {
          primary: "#008000",
          bg: "bg-emerald-50",
          border: "border-emerald-100",
          text: "text-[#008000]",
        };
      case "admin":
        return {
          primary: "#000000",
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "text-black",
        };
      default:
        return {
          primary: "#1e3a8a", // blue-900
          bg: "bg-blue-50",
          border: "border-blue-100",
          text: "text-blue-900",
        };
    }
  };

  const config = getRoleConfig(role);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white rounded-md shadow-xl p-10 border border-gray-200 relative overflow-hidden group text-center sm:text-left">
      <div className="flex items-center gap-6 mb-12 relative z-10">
        <div
          className="p-3 rounded-md shadow-sm border"
          style={{
            backgroundColor: config.primary,
            borderColor: config.primary,
          }}
        >
          <HelpCircle className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-3xl text-gray-900 capitalize">
            Standard <span className="text-gray-400">Operating Procedures</span>
          </h2>
          <p className="text-[14px] text-gray-600 mt-2 capitalize">
            Institutional verified guidance and protocol documentation
          </p>
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border rounded-md overflow-hidden transition-all duration-300"
            style={{
              borderColor: openIndex === index ? config.primary : "#e5e7eb",
              transform: openIndex === index ? "scale(1.01)" : "scale(1)",
              boxShadow:
                openIndex === index
                  ? `0 20px 25px -5px rgba(0, 0, 0, 0.1)`
                  : "none",
            }}
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-8 py-6 flex items-center justify-between transition-all duration-500"
              style={{
                backgroundColor:
                  openIndex === index ? config.primary : "#f9fafb",
                color: openIndex === index ? "white" : "#374151",
              }}
            >
              <span className="capitalize text-[15px]">{faq.question}</span>
              <div
                className="p-2 rounded-sm border transition-all"
                style={{
                  backgroundColor:
                    openIndex === index ? "rgba(255,255,255,0.2)" : "white",
                  borderColor:
                    openIndex === index ? "rgba(255,255,255,0.4)" : "#e5e7eb",
                }}
              >
                {openIndex === index ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </div>
            </button>

            {openIndex === index && (
              <div className="px-10 py-8 bg-white animate-in slide-in-from-top-4 duration-500">
                <p className="text-gray-600 leading-relaxed text-[15px]">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQSection;
