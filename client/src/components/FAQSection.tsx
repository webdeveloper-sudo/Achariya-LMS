import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { faqData, UserRole } from '../data/faqs';

interface FAQSectionProps {
    role: UserRole;
}

const FAQSection = ({ role }: FAQSectionProps) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const faqs = faqData[role];

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center mb-6">
                <HelpCircle className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-3">
                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        className="border border-gray-200 rounded-lg overflow-hidden transition-all"
                    >
                        <button
                            onClick={() => toggleFAQ(index)}
                            className="w-full px-4 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition"
                        >
                            <span className="font-semibold text-gray-800 text-left">
                                {faq.question}
                            </span>
                            {openIndex === index ? (
                                <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0 ml-4" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0 ml-4" />
                            )}
                        </button>

                        {openIndex === index && (
                            <div className="px-4 py-4 bg-white">
                                <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQSection;
