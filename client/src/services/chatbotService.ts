// 5-Tier Intelligent Chatbot Service
// Flow: Guardrails → Static Q&A → RAG (placeholder) → Gemini → ChatGPT
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { checkMessage, escalateIncident } from './chatbotGuardrails';
import { generateChatbotResponse } from '../utils/chatbotResponses';

// API Keys
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY, dangerouslyAllowBrowser: true }) : null;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    flagged?: boolean;
    source?: string;
}

export interface ChatContext {
    courseId?: string;
    courseName?: string;
    moduleId?: string;
    moduleName?: string;
}

// Conversation history
let conversationHistory: ChatMessage[] = [];

export function clearHistory() {
    conversationHistory = [];
}

export function getHistory(): ChatMessage[] {
    return conversationHistory;
}

// TIER 2: Try Static Q&A (INSTANT, FREE)
function tryStaticQA(userMessage: string, enrolledCourseIds: number[], studentName?: string): { response: string; source: string } | null {
    console.log('📚 Tier 2: Trying static Q&A...');

    const staticResponse = generateChatbotResponse(userMessage, enrolledCourseIds, studentName);

    // Check if we got a real answer (not the fallback message)
    if (!staticResponse.content.includes("I'm your AI study assistant! I can help with")) {
        console.log('✅ Static Q&A match found!');
        return {
            response: staticResponse.content,
            source: staticResponse.source || '📚 Course Materials'
        };
    }

    console.log('⏭️ No static match, continuing to next tier...');
    return null;
}

// TIER 3: RAG - Placeholder for future GDrive integration
async function tryRAG(_userMessage: string): Promise<{ response: string; source: string } | null> {
    console.log('📂 Tier 3: RAG system (not yet implemented)');
    // TODO: Implement GDrive-based RAG when corpus is ready
    // 1. Fetch relevant documents from GDrive
    // 2. Extract text from PDFs/docs
    // 3. Semantic search for relevant chunks
    // 4. Return context + answer
    return null;
}

// TIER 4: Try Gemini Flash Latest (FREE, 5s timeout)
async function tryGemini(userMessage: string, timeoutMs: number = 5000): Promise<{ response: string; source: string } | null> {
    if (!genAI) {
        console.log('⚠️ Gemini API key not found');
        return null;
    }

    console.log('🤖 Tier 4: Trying Gemini Flash Latest (5s timeout)...');

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const systemPrompt = `You are an AI Study Assistant for K-12 students in India (grades 6-8).
Provide clear, concise explanations suitable for students.
Keep responses under 150 words unless explaining complex topics.
Use bullet points for clarity.
NEVER share external links or URLs.
Focus on helping students understand concepts, not solving homework directly.`;

        const fullPrompt = `${systemPrompt}\n\nStudent Question: "${userMessage}"\n\nProvide a helpful educational response:`;

        // Set timeout
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Gemini timeout')), timeoutMs)
        );

        const geminiPromise = model.generateContent(fullPrompt);

        const result = await Promise.race([geminiPromise, timeoutPromise]) as any;
        const response = await result.response;
        const text = response.text();

        console.log('✅ Gemini SUCCESS! Response length:', text.length);

        return {
            response: text,
            source: '🤖 AI Study Assistant'
        };

    } catch (error: any) {
        if (error.message === 'Gemini timeout') {
            console.log('⏱️ Gemini timeout (>5s), moving to ChatGPT...');
        } else {
            console.warn('❌ Gemini failed:', error.message);
        }
        return null;
    }
}

// TIER 5: ChatGPT Fallback (PAID, GUARANTEED)
async function tryChatGPT(userMessage: string): Promise<{ response: string; source: string }> {
    if (!openai) {
        throw new Error('OpenAI API key not found and all other tiers failed');
    }

    console.log('💬 Tier 5: Using ChatGPT fallback...');

    try {
        const systemPrompt = `You are an AI Study Assistant for K-12 students in India.
Provide concise, clear explanations suitable for students.
Keep responses under 150 words unless explaining complex topics.
Use bullet points for clarity.
NEVER share external links or URLs.
Focus on helping students understand concepts, not solving homework for them.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ],
            max_tokens: 300,
            temperature: 0.7,
        });

        const response = completion.choices[0]?.message?.content || 'No response generated';

        console.log('✅ ChatGPT SUCCESS! Response length:', response.length);

        return {
            response,
            source: '🤖 AI Study Assistant'
        };

    } catch (error: any) {
        console.error('❌ ChatGPT FAILED:', error.message);

        // Last resort fallback message
        return {
            response: "I'm having trouble connecting right now. Please try asking your question again, or contact your teacher for help.",
            source: '⚠️ System Notice'
        };
    }
}

// MAIN FUNCTION: 5-Tier Waterfall System
export async function sendMessage(
    userMessage: string,
    _context?: ChatContext,
    studentId?: string,
    enrolledCourseIds?: number[],
    studentName?: string
): Promise<{ response: string; flagged: boolean; source?: string; error?: string }> {

    console.log('\n🔄 Starting 5-tier chatbot system for:', userMessage.substring(0, 50));

    // TIER 1: Guardrails Check
    console.log('🛡️ Tier 1: Checking guardrails...');
    const userCheck = checkMessage(userMessage);

    if (!userCheck.safe) {
        console.log('⚠️ Message blocked by guardrails');

        // Log incident if escalation needed
        if (userCheck.action === 'ESCALATE' && studentId) {
            await escalateIncident({
                studentId,
                category: userCheck.category || 'unknown',
                message: userMessage,
                timestamp: new Date(),
                action: userCheck.action
            });
        }

        return {
            response: userCheck.message || "I'm here to help with your studies. Let's keep our conversation educational!",
            flagged: true,
            source: '⚠️ Content Filtered'
        };
    }

    console.log('✅ Guardrails passed');

    // TIER 2: Static Q&A (instant, free)
    const staticResult = tryStaticQA(userMessage, enrolledCourseIds || [], studentName);
    if (staticResult) {
        return {
            response: staticResult.response,
            flagged: false,
            source: staticResult.source
        };
    }

    // TIER 3: RAG (placeholder for future)
    const ragResult = await tryRAG(userMessage);
    if (ragResult) {
        return {
            response: ragResult.response,
            flagged: false,
            source: ragResult.source
        };
    }

    // TIER 4: Gemini Flash Latest (5s timeout)
    const geminiResult = await tryGemini(userMessage, 5000);
    if (geminiResult) {
        return {
            response: geminiResult.response,
            flagged: false,
            source: geminiResult.source
        };
    }

    // TIER 5: ChatGPT (guaranteed fallback)
    const chatGPTResult = await tryChatGPT(userMessage);
    return {
        response: chatGPTResult.response,
        flagged: false,
        source: chatGPTResult.source
    };
}

// Get suggested prompts
export function getSuggestedPrompts(_context?: ChatContext): string[] {
    return [
        'Explain quadratic equations',
        "What are Newton's laws?",
        'How to analyze poetry?',
        'How do I earn credits?'
    ];
}
