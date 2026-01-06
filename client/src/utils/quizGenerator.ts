import { questionBankData } from '../data/questionBankData';
import { sampleData } from '../data/sampleData';

// Shuffle array utility
const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// Convert A/B/C/D format to 0/1/2/3 index
const convertAnswerToIndex = (answer: string): number => {
    return answer.charCodeAt(0) - 'A'.charCodeAt(0);
};

// Generate a dynamic quiz from question bank
export const generateDynamicQuiz = (moduleId: number, numberOfQuestions: number = 15) => {
    // Get module to find course
    const module = sampleData.modules.find(m => m.id === moduleId);
    if (!module) return null;

    // Get course to match subject
    const course = sampleData.courses.find(c => c.id === module.course_id);
    if (!course) return null;

    // Filter questions by course subject
    let relevantQuestions = questionBankData.filter(q =>
        q.course === course.subject || q.course.includes(course.subject)
    );

    // If not enough questions for this course, use courseId match
    if (relevantQuestions.length < numberOfQuestions) {
        relevantQuestions = questionBankData.filter(q => q.courseId === course.id);
    }

    // If still not enough, use all questions (fallback)
    if (relevantQuestions.length < numberOfQuestions) {
        relevantQuestions = questionBankData;
    }

    // Shuffle and select questions
    const shuffledQuestions = shuffleArray(relevantQuestions);
    const selectedQuestions = shuffledQuestions.slice(0, Math.min(numberOfQuestions, shuffledQuestions.length));

    // Transform questions to quiz format with randomized options
    const transformedQuestions = selectedQuestions.map((q, index) => {
        // Parse options (remove "A. ", "B. ", etc.)
        const parsedOptions = q.options.map(opt => opt.substring(3));

        // Get correct answer index
        const correctIndex = convertAnswerToIndex(q.correctAnswer);
        const correctAnswerText = parsedOptions[correctIndex];

        // Shuffle options
        const shuffledOptions = shuffleArray(parsedOptions);

        // Find new index of correct answer after shuffling
        const newCorrectIndex = shuffledOptions.indexOf(correctAnswerText);

        // Generate contextual explanation
        const explanation = `In ${q.topic}, ${correctAnswerText} is the correct answer because it directly addresses the core concept being tested in this question.`;

        return {
            id: index + 1,
            question: q.question,
            options: shuffledOptions,
            correctAnswer: newCorrectIndex,
            explanation: explanation,  // Meaningful explanation!
            moduleId: moduleId,  // Include moduleId for navigation back to content!
            topic: q.topic  // Include topic for reference
        };
    });

    // Shuffle the questions themselves
    const finalQuestions = shuffleArray(transformedQuestions).map((q, idx) => ({
        ...q,
        id: idx + 1  // Renumber after shuffling
    }));

    return {
        id: Math.floor(Math.random() * 900000) + 100000, // Random 6-digit number
        moduleId: moduleId,
        courseId: course.id,
        title: `${module.title} - Quiz`,
        questions: finalQuestions,
        timeLimit: 120, // 2 minutes
        maxAttempts: 3
    };
};
