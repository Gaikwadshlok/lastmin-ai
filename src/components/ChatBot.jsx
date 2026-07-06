import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Send, Bot, User, Loader2, Plus, Mic, Globe, Wifi, FileText, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { aiService } from "@/services/aiService.js";
import { uploadService } from "@/services/uploadService.js";
import { generatedDocumentService } from "@/services/generatedDocumentService.js";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
const TypingIndicator = () => {
    const [dots, setDots] = useState("");
    useEffect(() => {
        let i = 0;
        const iv = setInterval(() => {
            i = (i + 1) % 4;
            setDots(".".repeat(i));
        }, 400);
        return () => clearInterval(iv);
    }, []);
    return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-muted/50 animate-pulse" }), _jsxs("span", { className: "text-sm text-muted-foreground", children: ["Thinking", dots] })] }));
};
const ChatBot = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const [inputMessage, setInputMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [sending, setSending] = useState(false);
    const [webAccessEnabled, setWebAccessEnabled] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedSuggestions, setSelectedSuggestions] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [generatedFiles, setGeneratedFiles] = useState([]);
    const [filesContext, setFilesContext] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null);
    // Auto-scroll when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    // Load uploaded and generated files for context
    useEffect(() => {
        (async () => {
            try {
                const up = await uploadService.getUserDocuments();
                if (up?.data?.success)
                    setUploadedFiles(up.data.data || []);
                const gen = await generatedDocumentService.getGeneratedDocuments();
                if (gen?.data?.success)
                    setGeneratedFiles(gen.data.data || []);
                // build a simple filesContext summary
                const titles = [
                    ...(up?.data?.data || []).map((d) => d.title || d.originalName),
                    ...(gen?.data?.data || []).map((d) => d.title),
                ].slice(0, 5);
                setFilesContext(titles.join("; "));
            }
            catch (err) {
                // ignore
            }
        })();
    }, []);
    // Initialize speech recognition
    useEffect(() => {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.continuous = false;
            recognitionInstance.interimResults = false;
            recognitionInstance.lang = 'en-US';
            recognitionInstance.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputMessage(prev => prev + transcript);
                setIsListening(false);
            };
            recognitionInstance.onerror = () => {
                setIsListening(false);
            };
            recognitionInstance.onend = () => {
                setIsListening(false);
            };
            setRecognition(recognitionInstance);
        }
    }, []);
    const handleSendMessage = async () => {
        if (!inputMessage.trim())
            return;
        // Check if message is study/learning related
        if (!isStudyRelated(inputMessage)) {
            const rejectionMessage = {
                id: Date.now().toString(),
                content: "I'm designed to help with learning and study-related questions only. Please ask me about academic topics, homework help, explanations of concepts, or questions related to your uploaded study materials.",
                sender: "bot",
                timestamp: new Date()
            };
            const userMessage = {
                id: (Date.now() - 1).toString(),
                content: inputMessage,
                sender: "user",
                timestamp: new Date()
            };
            setMessages((prev) => [...prev, userMessage, rejectionMessage]);
            setInputMessage("");
            return;
        }
        const userMessage = {
            id: Date.now().toString(),
            content: inputMessage,
            sender: "user",
            timestamp: new Date()
        };
        setMessages((prev) => [...prev, userMessage]);
        setInputMessage("");
        setIsTyping(true);
        setSending(true);
        try {
            let response;
            // Detect the type of study request
            const requestType = detectStudyRequestType(inputMessage);
            // Enhance context based on request type
            let enhancedContext = filesContext;
            let enhancedMessage = inputMessage;
            switch (requestType) {
                case 'question_bank':
                    enhancedMessage = `QUESTION BANK MODE: Please provide detailed answers to the following questions. For each question, give a comprehensive answer with explanations, examples, and key points. Format as: Question 1: [question] Answer: [detailed answer] Question 2: [question] Answer: [detailed answer]... Here are the questions: ${inputMessage}`;
                    break;
                case 'topic_notes':
                    enhancedMessage = `TOPIC NOTES GENERATION MODE: Generate comprehensive study notes for the following topic/chapter/module. Include: 1) Introduction and overview 2) Key concepts and definitions 3) Important points and facts 4) Examples and applications 5) Summary of main takeaways. Make the notes structured and study-friendly. Topic: ${inputMessage}`;
                    break;
                case 'notes_to_questions':
                    enhancedMessage = `QUESTION GENERATION MODE: Create a comprehensive question bank based on the provided notes/content. Generate different types of questions: 1) Multiple choice questions 2) Short answer questions 3) Long answer/essay questions 4) Application-based questions. Include answers for each question. Content: ${inputMessage}`;
                    break;
                default:
                    enhancedMessage = inputMessage;
            }
            if (webAccessEnabled || requestType === 'topic_notes') {
                // Use web-enabled chat for topic notes generation and web-enabled queries
                response = await fetch('http://localhost:9002/api/ai/chat-web', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        message: enhancedMessage,
                        urls: [], // Could be enhanced to extract URLs from message
                        context: enhancedContext
                    })
                });
                if (!response.ok) {
                    throw new Error('Web chat request failed');
                }
                const webData = await response.json();
                response = webData;
            }
            else {
                // Use regular chat with enhanced context
                response = await aiService.chat(enhancedMessage, enhancedContext);
            }
            const aiContent = response.data?.data?.response ||
                response.data?.response ||
                "I'm here to help! Could you please rephrase your question?";
            const botMessage = {
                id: (Date.now() + 1).toString(),
                content: aiContent,
                sender: "bot",
                timestamp: new Date()
            };
            setMessages((prev) => [...prev, botMessage]);
        }
        catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    content: webAccessEnabled
                        ? "Sorry, I'm having trouble accessing the web right now. Make sure the Chrome extension bridge is running and try again."
                        : "Sorry, I'm having trouble connecting right now. Please try again later.",
                    sender: "bot",
                    timestamp: new Date()
                }
            ]);
        }
        finally {
            setIsTyping(false);
            setSending(false);
        }
    };
    // Handle suggestion click - just add as pill, don't populate input
    const handleSuggestionClick = async (suggestion) => {
        // Handle navigation to Study Modes page
        if (suggestion === "Open Study Modes Page") {
            navigate('/syllabus');
            return;
        }
        // Add to selected suggestions as pill only
        if (!selectedSuggestions.includes(suggestion)) {
            setSelectedSuggestions([...selectedSuggestions, suggestion]);
        }
    };
    // Handle pill click - populate input with enhanced message
    const handlePillClick = async (suggestion) => {
        let enhancedMessage = suggestion;
        if (suggestion === "Ask from Generated Files" && generatedFiles.length > 0) {
            enhancedMessage = `I have ${generatedFiles.length} generated documents available. What would you like to know about them? You can ask about specific topics, request summaries, or get explanations from: ${generatedFiles.map(f => f.title).join(', ')}.`;
        }
        else if (suggestion === "Ask from Uploaded Files" && uploadedFiles.length > 0) {
            enhancedMessage = `I have ${uploadedFiles.length} uploaded documents available. What questions do you have about them? Available files: ${uploadedFiles.map(f => f.title || f.originalName).join(', ')}.`;
        }
        else if (suggestion === "Ask from Generated Files" && generatedFiles.length === 0) {
            enhancedMessage = "You haven't generated any documents yet. Upload some files and create notes, summaries, or quizzes to get started!";
        }
        else if (suggestion === "Ask from Uploaded Files" && uploadedFiles.length === 0) {
            enhancedMessage = "You haven't uploaded any files yet. Upload documents, PDFs, or text files to start asking questions about them!";
        }
        else if (suggestion === "Generate Notes for Topic") {
            enhancedMessage = "Generate comprehensive notes for topic: [Enter your topic, chapter, or module name here - e.g., 'Photosynthesis in Biology', 'Machine Learning Algorithms', 'French Revolution History']";
        }
        else if (suggestion === "Answer Question Bank") {
            enhancedMessage = "Please provide detailed answers to these questions:\n\nQuestion 1: [Enter your first question]\nQuestion 2: [Enter your second question]\nQuestion 3: [Enter your third question]\n[Add more questions as needed]";
        }
        else if (suggestion === "Create Questions from Notes") {
            enhancedMessage = "Generate questions from these notes:\n\n[Paste your notes, content, or study material here and I'll create a comprehensive question bank with multiple choice, short answer, and essay questions]";
        }
        setInputMessage(enhancedMessage);
    };
    // Handle voice-to-text
    const handleVoiceToText = () => {
        if (!recognition)
            return;
        if (isListening) {
            recognition.stop();
            setIsListening(false);
        }
        else {
            recognition.start();
            setIsListening(true);
        }
    };
    // Detect the type of study request
    const detectStudyRequestType = (message) => {
        const lowerMessage = message.toLowerCase();
        // Question Bank Detection
        if (lowerMessage.includes('question bank') ||
            lowerMessage.includes('answer these questions') ||
            lowerMessage.includes('solve these questions') ||
            (lowerMessage.includes('questions:') || lowerMessage.includes('q.') || lowerMessage.includes('question'))) {
            return 'question_bank';
        }
        // Topic/Chapter Notes Generation Detection
        if (lowerMessage.includes('generate notes') ||
            lowerMessage.includes('make notes') ||
            lowerMessage.includes('create notes') ||
            lowerMessage.includes('notes on') ||
            lowerMessage.includes('explain topic') ||
            lowerMessage.includes('chapter') ||
            lowerMessage.includes('module') ||
            (lowerMessage.includes('topic:') && (lowerMessage.includes('notes') || lowerMessage.includes('explain')))) {
            return 'topic_notes';
        }
        // Question Generation from Notes Detection
        if ((lowerMessage.includes('generate questions') ||
            lowerMessage.includes('create questions') ||
            lowerMessage.includes('make questions') ||
            lowerMessage.includes('question bank from')) &&
            (lowerMessage.includes('notes') || lowerMessage.includes('content') || lowerMessage.includes('material'))) {
            return 'notes_to_questions';
        }
        return 'general_study';
    };
    // Check if message is study/learning related
    const isStudyRelated = (message) => {
        const studyKeywords = [
            // Educational topics
            'learn', 'study', 'understand', 'explain', 'teach', 'help', 'homework', 'assignment',
            'lesson', 'tutorial', 'course', 'class', 'education', 'academic', 'school', 'university',
            'college', 'exam', 'test', 'quiz', 'practice', 'exercise', 'problem', 'solution',
            // Subject areas
            'math', 'science', 'physics', 'chemistry', 'biology', 'history', 'geography', 'literature',
            'english', 'language', 'programming', 'computer', 'technology', 'engineering', 'medicine',
            'law', 'business', 'economics', 'psychology', 'philosophy', 'art', 'music', 'research',
            // Learning actions
            'calculate', 'solve', 'analyze', 'summarize', 'review', 'notes', 'concept', 'theory',
            'definition', 'meaning', 'formula', 'equation', 'example', 'procedure', 'method',
            'technique', 'strategy', 'approach', 'process', 'steps', 'guide', 'instruction',
            // Academic materials
            'book', 'textbook', 'paper', 'article', 'document', 'reference', 'source', 'citation',
            'chapter', 'section', 'page', 'paragraph', 'diagram', 'chart', 'graph', 'table',
            // Question words (often used in learning)
            'what', 'how', 'why', 'when', 'where', 'which', 'who', 'can you', 'could you',
            'please', 'help me', 'show me', 'tell me', 'i need', 'i want to'
        ];
        const lowerMessage = message.toLowerCase();
        // Check if message contains study-related keywords
        const hasStudyKeywords = studyKeywords.some(keyword => lowerMessage.includes(keyword));
        // Check if message is asking about files (uploaded/generated content)
        const isAboutFiles = lowerMessage.includes('file') ||
            lowerMessage.includes('document') ||
            lowerMessage.includes('upload') ||
            lowerMessage.includes('generate');
        // Check if it's a greeting or polite conversation starter
        const isPoliteConversation = /^(hi|hello|hey|good morning|good afternoon|good evening|thanks|thank you|please)/i.test(lowerMessage.trim());
        // Check if it's one of our special study modes
        const isSpecialStudyMode = detectStudyRequestType(message) !== 'general_study';
        return hasStudyKeywords || isAboutFiles || isPoliteConversation || isSpecialStudyMode;
    };
    return (_jsxs("div", { className: "bg-background flex flex-col h-[500px] max-h-[500px] border border-border/20 rounded-lg overflow-hidden no-sparkle", children: [_jsx("div", { className: "flex-shrink-0 border-b border-border/20 bg-card/50 backdrop-blur-sm", children: _jsx("div", { className: "px-4 py-2", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `p-2 rounded-lg transition-all duration-300 ${isTyping || sending
                                            ? "bg-primary/30 animate-pulse"
                                            : "bg-primary/20"}`, children: _jsx(Bot, { className: `h-5 w-5 transition-all duration-300 ${isTyping || sending ? "text-primary animate-pulse" : "text-primary"}` }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-lg font-semibold text-foreground", children: "LastMin" }), (isTyping || sending) && (_jsx("p", { className: "text-xs text-muted-foreground", children: webAccessEnabled && isTyping ? "Searching the web..." : "Processing..." }))] })] }), _jsx(Badge, { className: `transition-all duration-300 ${isTyping || sending
                                    ? "bg-yellow-500/20 text-yellow-600 border-yellow-500/30 animate-pulse"
                                    : "bg-primary/20 text-primary border-primary/30"}`, children: isTyping || sending ? "Processing" : "Online" })] }) }) }), _jsx("div", { className: "flex-1 overflow-hidden", children: _jsxs("div", { className: "h-full flex flex-col", children: [_jsx(ScrollArea, { className: "flex-1 px-4", children: _jsxs("div", { className: "py-3 space-y-4", children: [messages.length === 0 ? (
                                    // Empty state for startup
                                    _jsxs("div", { className: "flex flex-col items-center justify-start h-full text-center px-4 pt-16", children: [_jsxs("h2", { className: "text-5xl font-bold mb-3", style: { color: 'hsl(260, 75%, 65%)' }, children: ["Hello, ", user?.name?.split(' ')[0]?.toUpperCase() || 'STUDENT'] }), _jsx("p", { className: "text-xl text-muted-foreground", children: "Want to try out a few things?" })] })) : (
                                    // Show messages when they exist
                                    _jsxs(_Fragment, { children: [messages.map((message) => (_jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: `flex gap-4 ${message.sender === "user" ? "justify-end" : "justify-start"}`, children: message.sender === "user" ? (
                                                // User message (right side)
                                                _jsxs(_Fragment, { children: [_jsxs("div", { className: "flex flex-col items-end max-w-[70%]", children: [_jsx("div", { className: "text-sm text-muted-foreground mb-1", children: "You" }), _jsx("div", { className: "bg-primary/20 border border-primary/30 rounded-lg px-4 py-3 mb-1", children: _jsx("p", { className: "text-foreground leading-relaxed whitespace-pre-wrap", children: message.content }) }), _jsx("div", { className: "text-xs text-muted-foreground", children: new Date(message.timestamp).toLocaleTimeString([], {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                        hour12: true
                                                                    }) })] }), _jsx("div", { className: "bg-muted/80 p-2 rounded-lg w-10 h-10 flex items-center justify-center flex-shrink-0", children: _jsx(User, { className: "h-5 w-5 text-muted-foreground" }) })] })) : (
                                                // Bot message (left side)
                                                _jsxs(_Fragment, { children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "bg-primary/20 p-2 rounded-lg w-10 h-10 flex items-center justify-center", children: _jsx(Bot, { className: "h-5 w-5 text-primary" }) }) }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx("div", { className: "text-sm text-muted-foreground", children: "LastMin" }), _jsx("div", { className: "bg-card/60 border border-border/30 rounded-lg px-4 py-3", children: _jsx("p", { className: "text-foreground leading-relaxed whitespace-pre-wrap", children: message.content }) }), _jsx("div", { className: "text-xs text-muted-foreground", children: new Date(message.timestamp).toLocaleTimeString([], {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                        hour12: true
                                                                    }) })] })] })) }, message.id))), isTyping && (_jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: "flex gap-4", children: [_jsx("div", { className: "bg-primary/20 p-2 rounded-lg w-10 h-10 flex items-center justify-center", children: _jsx(Bot, { className: "h-5 w-5 text-primary" }) }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx("div", { className: "text-sm text-muted-foreground", children: "LastMin" }), _jsx("div", { className: "bg-card/60 border border-border/30 rounded-lg px-4 py-3", children: _jsx(TypingIndicator, {}) })] })] }))] })), _jsx("div", { ref: messagesEndRef })] }) }), _jsx("div", { className: "flex-shrink-0 border-t border-border/20 bg-card/30 backdrop-blur-sm", children: _jsxs("div", { className: "px-4 py-2", children: [_jsxs("div", { className: "flex items-center gap-3 bg-input/60 border border-border/40 rounded-lg px-3 py-2 focus-within:border-primary/50", children: [_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "sm", className: "text-muted-foreground hover:text-primary hover:bg-primary/10 p-2 h-auto rounded-lg transition-all duration-200", title: "Quick suggestions", children: _jsx(Plus, { className: "h-5 w-5" }) }) }), _jsxs(DropdownMenuContent, { align: "start", side: "top", className: "w-72 mb-2 bg-card/95 backdrop-blur-md border-border/50 shadow-xl shadow-primary/20", sideOffset: 8, children: [_jsx("div", { className: "p-2 border-b border-border/30 mb-1", children: _jsx("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: "Quick Suggestions" }) }), [
                                                                "Ask from Generated Files",
                                                                "Ask from Uploaded Files",
                                                                "Generate Notes for Topic",
                                                                "Answer Question Bank",
                                                                "Create Questions from Notes",
                                                                "Open Study Modes Page"
                                                            ].map((suggestion, i) => (_jsx(DropdownMenuItem, { className: "cursor-pointer p-3 m-1 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200 focus:bg-primary/10 focus:text-primary", onClick: () => handleSuggestionClick(suggestion), children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-primary/60" }), _jsx("span", { className: "text-sm font-medium", children: suggestion })] }) }, i)))] })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setWebAccessEnabled(!webAccessEnabled), className: `p-2 h-auto rounded-lg transition-all duration-200 ${webAccessEnabled
                                                    ? "text-white bg-green-500 hover:bg-green-600"
                                                    : "text-muted-foreground hover:text-green-600 hover:bg-green-50"}`, title: webAccessEnabled ? "Disable web access" : "Enable web access", children: webAccessEnabled ? (_jsx(Globe, { className: "h-5 w-5" })) : (_jsx(Wifi, { className: "h-5 w-5" })) }), _jsx(Input, { value: inputMessage, onChange: (e) => setInputMessage(e.target.value), placeholder: isTyping || sending
                                                    ? (webAccessEnabled ? "Searching the web..." : "AI is thinking...")
                                                    : "Continue your conversation...", className: `flex-1 bg-transparent border-none focus:ring-0 text-foreground px-0 transition-all duration-200 ${isTyping || sending
                                                    ? "placeholder-primary/60"
                                                    : "placeholder-muted-foreground"}`, disabled: isTyping || sending, onKeyDown: (e) => {
                                                    if (e.key === "Enter" && !e.shiftKey && !isTyping && !sending) {
                                                        e.preventDefault();
                                                        handleSendMessage();
                                                    }
                                                } }), _jsx(Button, { variant: "ghost", size: "sm", onClick: handleVoiceToText, disabled: !recognition, className: `p-2 h-auto rounded-lg transition-all duration-200 ${isListening
                                                    ? "text-red-500 bg-red-50 hover:bg-red-100 animate-pulse"
                                                    : "text-muted-foreground hover:text-primary hover:bg-primary/10"}`, title: isListening ? "Stop recording" : "Start voice input", children: _jsx(Mic, { className: "h-5 w-5" }) }), _jsx(Button, { onClick: handleSendMessage, disabled: !inputMessage.trim() || isTyping || sending, variant: "ghost", size: "sm", className: `p-2 h-auto rounded-lg transition-all duration-200 ${sending || isTyping
                                                    ? "text-primary bg-primary/10"
                                                    : "text-muted-foreground hover:text-primary hover:bg-primary/10"} disabled:opacity-50`, title: sending || isTyping ? "Sending..." : "Send message", children: sending || isTyping ? (_jsx(Loader2, { className: "h-4 w-4 animate-spin" })) : (_jsx(Send, { className: "h-4 w-4" })) })] }), selectedSuggestions.length > 0 && (_jsx("div", { className: "px-3 pt-3 pb-2", children: _jsx("div", { className: "flex items-center gap-2 flex-wrap", children: selectedSuggestions.map((suggestion, i) => {
                                                const isGenerated = suggestion.includes("Generated");
                                                const isUploaded = suggestion.includes("Uploaded");
                                                const displayText = isGenerated ? "Generated" : isUploaded ? "Uploaded" : suggestion;
                                                const bgColor = isGenerated ? "bg-green-100 hover:bg-green-200 border-green-300 text-green-700" : isUploaded ? "bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-700" : "bg-primary/10 hover:bg-primary/20 border-primary/30 text-primary";
                                                return (_jsxs("button", { onClick: () => handlePillClick(suggestion), className: `inline-flex items-center gap-2 px-3 py-1.5 ${bgColor} border rounded-full text-sm font-medium transition-all duration-200 hover:scale-105`, children: [isGenerated && _jsx(FileText, { className: "h-3 w-3" }), isUploaded && _jsx(Upload, { className: "h-3 w-3" }), _jsx("span", { children: displayText }), _jsx("button", { onClick: (e) => {
                                                                e.stopPropagation();
                                                                setSelectedSuggestions(selectedSuggestions.filter((_, idx) => idx !== i));
                                                            }, className: `ml-1 rounded-full w-4 h-4 flex items-center justify-center text-xs ${isGenerated ? "text-green-600 hover:text-green-800 hover:bg-green-300" :
                                                                isUploaded ? "text-blue-600 hover:text-blue-800 hover:bg-blue-300" :
                                                                    "text-primary/60 hover:text-primary hover:bg-primary/20"}`, "aria-label": `Remove ${suggestion}`, children: "\u00D7" })] }, i));
                                            }) }) }))] }) })] }) })] }));
};
export default ChatBot;
