import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import FAQSection from '../../components/FAQSection';

const TeacherFAQPage = () => {
    return (
        <div>
            <Link to="/teacher/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <FAQSection role="teacher" />
        </div>
    );
};

export default TeacherFAQPage;
