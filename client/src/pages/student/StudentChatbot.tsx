// Student AI Chatbot Interface
import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, X, ArrowLeft, Lightbulb } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { sendMessage, clearHistory, getSuggestedPrompts, type ChatMessage, type ChatContext } from '../../services/chatbotService';
import { sampleData } from '../../data/sampleData';

const StudentChatbot = () => {
    const navigate = useNavigate();
    const { courseId, moduleId } = useParams<{ courseId?: string; moduleId?: string }>();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [context, setContext] = useState<ChatContext>();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load context from course/module if available
    useEffect(() => {
        if (courseId) {
            const course = sampleData.courses.find(c => c.id === Number(courseId));
            let module = null;

            if (moduleId) {
                module = sampleData.modules.find(m => m.id === Number(moduleId));
            }

            setContext({
                courseId: courseId,
                courseName: course?.title || 'Your Course',
                moduleId: moduleId,
                moduleName: module?.title
            });
        }
    }, [courseId, moduleId]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Show welcome message on mount
    useEffect(() => {
        const welcomeMessage: ChatMessage = {
            role: 'assistant',
            content: `👋 Hi! I'm your AI Study Assistant!\n\nI can help you with:\n• Explaining difficult concepts\n• Breaking down complex topics\n• Answering academic questions\n• Guiding you through problems\n\n${context?.courseName ? `📚 Currently helping with: **${context.courseName}**${context.moduleName ? ` - ${context.moduleName}` : ''}` : ''}\n\nWhat would you like to learn about today?`,
            timestamp: new Date()
        };
        setMessages([welcomeMessage]);
    }, [context]);

    const handleSend = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMsg: ChatMessage = {
            role: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const result = await sendMessage(inputMessage, context, user.id || user.email);

            const assistantMsg: ChatMessage = {
                role: 'assistant',
                content: result.response,
                timestamp: new Date(),
                flagged: result.flagged
            };

            setMessages(prev => [...prev, assistantMsg]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMsg: ChatMessage = {
                role: 'assistant',
                content: "I'm having trouble right now. Please try again or contact your teacher for help.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleSuggestedPrompt = (prompt: string) => {
        setInputMessage(prompt);
        inputRef.current?.focus();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const suggestedPrompts = getSuggestedPrompts(context);

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-50">
            {/* Sticky Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-white/80 hover:text-white transition"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <Bot className="w-8 h-8" />
                        <div>
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                AI Study Assistant
                                <Sparkles className="w-5 h-5" />
                            </h1>
                            {context?.courseName && (
                                <p className="text-sm text-blue-100">
                                    {context.courseName}{context.moduleName && ` • ${context.moduleName}`}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            if (confirm('Clear conversation history?')) {
                                clearHistory();
                                setMessages([]);
                            }
                        }}
                        className="text-white/80 hover:text-white transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Messages Area - Vertically Expanded */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="max-w-4xl mx-auto space-y-4">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role === 'assistant' && (
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                        <Bot className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            )}

                            <div
                                className={`max-w-[70%] rounded-2xl p-4 ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : msg.flagged
                                        ? 'bg-yellow-50 border-2 border-yellow-300'
                                        : 'bg-white shadow-md'
                                    }`}
                            >
                                <div className="prose prose-sm max-w-none">
                                    {msg.content.split('\n').map((line, i) => {
                                        // Format bold text
                                        let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

                                        // Check if it's a bullet point
                                        if (formatted.startsWith('•')) {
                                            return (
                                                <div key={i} className="flex items-start gap-2 my-1">
                                                    <span className="text-blue-500 font-bold">•</span>
                                                    <span dangerouslySetInnerHTML={{ __html: formatted.substring(1) }} />
                                                </div>
                                            );
                                        }

                                        // Check if it's a numbered list
                                        const numberedMatch = formatted.match(/^(\d+)\.\s(.+)/);
                                        if (numberedMatch) {
                                            return (
                                                <div key={i} className="flex items-start gap-2 my-1">
                                                    <span className="text-blue-500 font-bold">{numberedMatch[1]}.</span>
                                                    <span dangerouslySetInnerHTML={{ __html: numberedMatch[2] }} />
                                                </div>
                                            );
                                        }

                                        // Regular line
                                        return formatted ? (
                                            <p key={i} className="my-1" dangerouslySetInnerHTML={{ __html: formatted }} />
                                        ) : (
                                            <br key={i} />
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>

                            {msg.role === 'user' && (
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                        <User className="w-6 h-6 text-gray-600" />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-3 justify-start">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                <Bot className="w-6 h-6 text-white animate-pulse" />
                            </div>
                            <div className="bg-white shadow-md rounded-2xl p-4">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Suggested Prompts (show when no messages yet) */}
                    {messages.length <= 1 && !isLoading && (
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" />
                                Try asking:
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {suggestedPrompts.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSuggestedPrompt(prompt)}
                                        className="text-left p-3 bg-white rounded-lg border-2 border-purple-200 hover:border-purple-400 transition text-sm"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Sticky Input */}
            <div className="bg-white border-t-2 border-gray-200 p-4 shadow-lg">
                <div className="max-w-4xl mx-auto flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything about your studies..."
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputMessage.trim() || isLoading}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                    Press Enter to send • Shift+Enter for new line
                </p>
            </div>
        </div>
    );
};

export default StudentChatbot;
