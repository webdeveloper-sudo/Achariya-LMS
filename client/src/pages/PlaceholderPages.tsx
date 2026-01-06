import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface PlaceholderProps {
    title: string;
    backLink: string;
}

const Placeholder = ({ title, backLink }: PlaceholderProps) => (
    <div>
        <Link to={backLink} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
        </Link>
        <div className="bg-white rounded-xl shadow-sm p-8 border text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">{title}</h1>
            <p className="text-gray-600">This page is under development.</p>
        </div>
    </div>
);

export const StudentQuiz = () => <Placeholder title="Module Quiz" backLink="/student/courses" />;
