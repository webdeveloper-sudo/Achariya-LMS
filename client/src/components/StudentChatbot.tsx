// Upgraded Student Chatbot with Gemini AI and Guardrails
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { sendMessage } from '../services/chatbotService';
import { sampleData } from '../data/sampleData';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    source?: string;
    flagged?: boolean;
}

interface StudentChatbotProps {
    studentId: number;
    studentName?: string; // Optional if not always available
}

// Simple markdown formatter for chat messages
const formatMessage = (text: string) => {
    // Convert **bold** to <strong>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Convert newlines to <br>
    formatted = formatted.replace(/\n/g, '<br>');
    // Convert bullet points
    formatted = formatted.replace(/^• /gm, '&bull; ');
    return formatted;
};

const StudentChatbot = ({ studentId, studentName }: StudentChatbotProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: studentName
                ? `👋 Hi ${studentName.split(' ')[0]}! I'm your AI Study Assistant. I can help answer questions about your enrolled courses, explain concepts, and guide you through your learning. What would you like to know?`
                : "👋 Hi! I'm your AI Study Assistant. I can help answer questions about your enrolled courses, explain concepts, and guide you through your learning. What would you like to know?",
            source: '🤖 AI Study Assistant'
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Get student's enrolled courses for context
    const enrollments = sampleData.enrollments.filter(e => e.student_id === studentId);
    const enrolledCourseIds = enrollments.map(e => e.course_id);
    const enrolledCourses = enrollments.map(e => {
        const course = sampleData.courses.find(c => c.id === e.course_id);
        return course?.title;
    }).filter(Boolean);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        // Add user message
        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        const userInput = input;
        setInput('');
        setIsTyping(true);

        try {
            // Call 5-tier chatbot system
            const result = await sendMessage(
                userInput,
                {
                    courseName: enrolledCourses[0] || 'Your Courses'
                },
                studentId.toString(),
                enrolledCourseIds, // Pass course IDs for static Q&A fallback
                studentName // Pass student name for personalized responses
            );

            // Add AI response
            const assistantMessage: Message = {
                role: 'assistant',
                content: result.response,
                flagged: result.flagged,
                source: result.source || '🤖 AI Study Assistant'
            };

            setMessages(prev => [...prev, assistantMessage]);

            // Auto-focus input field after response
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        } catch (error) {
            console.error('Chatbot error:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: "I'm having trouble right now. Please try again or ask your teacher for help.",
                source: '❌ Error'
            };
            setMessages(prev => [...prev, errorMessage]);

            // Auto-focus input field even on error
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        } finally {
            setIsTyping(false);
        }
    };

    const conversationStarters = [
        'Explain a concept from my course',
        'Help me with a difficult topic',
        'What should I focus on?',
        'Give me study tips'
    ];

    const handleStarterClick = (starter: string) => {
        setInput(starter);
    };

    const handleClose = () => {
        setIsOpen(false);
        // Optional: Clear history when closing
        // clearHistory();
    };

    return (
        <>
            {/* Floating Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-50 group"
                >
                    <MessageCircle className="w-6 h-6" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        AI
                    </span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-[576px] h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
                        <div className="flex items-center">
                            <Sparkles className="w-5 h-5 mr-2" />
                            <div>
                                <h3 className="font-bold">AI Study Assistant</h3>
                                <p className="text-xs opacity-90">Your Learning Companion</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="hover:bg-white/20 p-1 rounded transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : msg.flagged
                                            ? 'bg-yellow-50 border-2 border-yellow-300 text-gray-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}
                                >
                                    <div
                                        className="text-sm"
                                        dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                                    />
                                    {msg.source && (
                                        <p className="text-xs mt-2 opacity-70 italic">{msg.source}</p>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Conversation Starters */}
                    {messages.length === 1 && (
                        <div className="px-4 pb-2">
                            <p className="text-xs text-gray-500 mb-2">Try asking:</p>
                            <div className="flex flex-wrap gap-2">
                                {conversationStarters.slice(0, 3).map((starter, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleStarterClick(starter)}
                                        className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition"
                                    >
                                        {starter}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 border-t">
                        <div className="flex items-center space-x-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask me anything..."
                                autoFocus
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isTyping}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 text-center mt-1">Safe & filtered for education</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default StudentChatbot;
