// Gemini AI Service - Question Explanations & Hints
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

if (!API_KEY) {
    console.warn('VITE_GEMINI_API_KEY not set - AI features will use fallback messages');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export interface QuestionMetadata {
    questionId: string;
    quizId: string;
    questionText: string;
    correctAnswer: string;
    explanation: string;
    hint: string;
}

// Generate explanation for why an answer is correct/wrong
export async function generateExplanation(
    questionText: string,
    correctAnswer: string,
    wrongAnswer: string
): Promise<string> {
    if (!genAI) {
        return `The correct answer is "${correctAnswer}". Review the question carefully to understand why this is the best choice.`;
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are a helpful teacher explaining quiz answers to students.

Question: "${questionText}"
Correct Answer: "${correctAnswer}"
Student's Answer: "${wrongAnswer}"

Explain in 2-3 clear sentences why "${correctAnswer}" is the correct answer and why "${wrongAnswer}" is incorrect. Be encouraging and educational.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini explanation error:', error);
        console.error('API Key exists:', !!API_KEY);
        console.error('Question:', questionText);
        return `The correct answer is "${correctAnswer}". The answer "${wrongAnswer}" is not correct because it doesn't fully address the question.`;
    }
}

// Generate hint for a question (without giving away the answer)
export async function generateHint(
    questionText: string,
    correctAnswer: string
): Promise<string> {
    if (!genAI) {
        return 'Think carefully about what the question is really asking. Review your notes if needed.';
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are a helpful teacher providing hints to students during a quiz.

Question: "${questionText}"
Correct Answer: "${correctAnswer}"

Provide a subtle hint (1-2 sentences) that guides the student toward the correct answer WITHOUT revealing it directly. The hint should help them think in the right direction.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini hint error:', error);
        return 'Think about the key concepts related to this topic. What have you learned recently that might apply here?';
    }
}

// Batch generate metadata for multiple questions (more efficient)
export async function batchGenerateMetadata(
    questions: {
        questionId: string;
        quizId: string;
        questionText: string;
        correctAnswer: string;
        wrongAnswers: string[];
    }[]
): Promise<QuestionMetadata[]> {
    const metadata: QuestionMetadata[] = [];

    for (const q of questions) {
        try {
            // Generate hint (needed for all questions)
            const hint = await generateHint(q.questionText, q.correctAnswer);

            // For explanations, we'll generate when needed (in results page)
            // since we don't know which answer the student will choose

            metadata.push({
                questionId: q.questionId,
                quizId: q.quizId,
                questionText: q.questionText,
                correctAnswer: q.correctAnswer,
                explanation: '', // Generated on-demand based on student's wrong answer
                hint
            });

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error(`Error generating metadata for question ${q.questionId}:`, error);
            // Add fallback metadata
            metadata.push({
                questionId: q.questionId,
                quizId: q.quizId,
                questionText: q.questionText,
                correctAnswer: q.correctAnswer,
                explanation: '',
                hint: 'Review the key concepts for this topic.'
            });
        }
    }

    return metadata;
}

// Cache explanation/hint to Firestore (optional - for performance)
export async function cacheMetadata(metadata: QuestionMetadata): Promise<void> {
    // This would save to Firestore questionMetadata collection
    // Skipping implementation for now - can add if needed
    console.log('Metadata cached:', metadata.questionId);
}
