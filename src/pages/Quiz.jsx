import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Target, Clock, Play, FileText, File, Upload, BookOpen, CheckCircle2, XCircle, ArrowLeft, ArrowRight, RefreshCw, Lightbulb } from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from '@/contexts/AuthContext';
import { uploadService } from '@/services/uploadService';
import { generatedDocumentService } from '@/services/generatedDocumentService';
import { aiService } from '@/services/aiService';
const Quiz = () => {
    const { user } = useAuth();
    const [currentView, setCurrentView] = useState('selection'); // 'selection', 'quiz', 'results'
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [quizSettings, setQuizSettings] = useState({
        source: 'notes', // 'notes' or 'files'
        difficulty: 'medium',
        questionCount: 10,
        timeLimit: 15 // minutes
    });
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [quizResults, setQuizResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [quizStartTime, setQuizStartTime] = useState(null);
    const [notes, setNotes] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    // Timer effect
    useEffect(() => {
        let timer;
        if (currentView === 'quiz' && currentQuiz && quizSettings.timeLimit > 0) {
            // Initialize timer when quiz starts
            if (timeRemaining === 0) {
                setTimeRemaining(quizSettings.timeLimit * 60); // Convert minutes to seconds
            }
            timer = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        // Time's up - auto submit quiz
                        submitQuiz();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timer)
                clearInterval(timer);
        };
    }, [currentView, currentQuiz, timeRemaining]);
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
    // Load files and notes data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [docsRes, genDocsRes] = await Promise.all([
                    uploadService.getUserDocuments(),
                    generatedDocumentService.getGeneratedDocuments()
                ]);
                // Ensure proper mapping of data property
                const docs = docsRes.data?.data?.documents || docsRes.data?.documents || [];
                const genDocs = genDocsRes.data?.data?.documents || genDocsRes.data?.documents || [];
                setUploadedFiles(docs);
                setNotes(genDocs);
            }
            catch (err) {
                console.error('Error fetching data:', err);
                setUploadedFiles([]);
                setNotes([]);
            }
        };
        fetchData();
    }, []);
    const getFileIcon = (fileType) => {
        if (fileType === 'pdf')
            return _jsx(FileText, { className: "h-4 w-4 text-red-400" });
        if (fileType === 'docx')
            return _jsx(File, { className: "h-4 w-4 text-blue-400" });
        return _jsx(File, { className: "h-4 w-4 text-green-400" });
    };
    const getStatusBadge = (status) => {
        if (status === 'completed' || status === 'processed')
            return _jsx(Badge, { className: "bg-green-500/20 text-green-400 border-green-500/30", children: "Ready" });
        if (status === 'processing')
            return _jsx(Badge, { className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", children: "Processing" });
        return _jsx(Badge, { className: "bg-gray-500/20 text-gray-400 border-gray-500/30", children: "Not Ready" });
    };
    const handleFileSelection = (fileId, isSelected) => {
        if (isSelected) {
            setSelectedFiles([...selectedFiles, fileId]);
        }
        else {
            setSelectedFiles(selectedFiles.filter(id => id !== fileId));
        }
    };
    const generateQuiz = async () => {
        if (selectedFiles.length === 0) {
            alert('Please select at least one file to generate quiz from.');
            return;
        }
        setLoading(true);
        try {
            // Gather text from selected files
            let combinedText = '';
            if (quizSettings.source === 'notes') {
                const selectedDocs = notes.filter(n => selectedFiles.includes(n.id || n._id));
                for (const doc of selectedDocs) {
                    if (doc.content) {
                        combinedText += doc.content + '\\n\\n';
                    }
                    else {
                        const res = await generatedDocumentService.getGeneratedDocument(doc.id || doc._id);
                        const fullDoc = res.data?.data?.document || res.data?.document;
                        if (fullDoc && fullDoc.content)
                            combinedText += fullDoc.content + '\\n\\n';
                    }
                }
            }
            else {
                const selectedDocs = uploadedFiles.filter(f => selectedFiles.includes(f.id || f._id));
                for (const doc of selectedDocs) {
                    if (doc.extractedText) {
                        combinedText += doc.extractedText + '\\n\\n';
                    }
                    else {
                        const res = await uploadService.getDocument(doc.id || doc._id);
                        const fullDoc = res.data?.data?.document || res.data?.document;
                        if (fullDoc && fullDoc.extractedText)
                            combinedText += fullDoc.extractedText + '\\n\\n';
                    }
                }
            }
            if (!combinedText.trim()) {
                alert('Could not extract text from selected files. Please try different files.');
                return;
            }
            // Generate quiz questions via AI
            const response = await aiService.generateQuiz(combinedText, quizSettings.questionCount, quizSettings.difficulty);
            const generatedQuestions = response.data?.data?.questions || response.data?.questions || [];
            if (!generatedQuestions || generatedQuestions.length === 0) {
                throw new Error('No questions generated');
            }
            const formattedQuestions = generatedQuestions.map((q, idx) => ({
                id: q.id || (idx + 1),
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation || "No explanation provided."
            }));
            const newQuiz = {
                id: Date.now(),
                title: `Quiz from ${selectedFiles.length} file(s)`,
                questions: formattedQuestions,
                settings: quizSettings,
                createdAt: new Date().toISOString(),
                startTime: Date.now()
            };
            setCurrentQuiz(newQuiz);
            setCurrentView('quiz');
            setTimeRemaining(quizSettings.timeLimit > 0 ? quizSettings.timeLimit * 60 : 0);
        }
        catch (err) {
            console.error('Error generating quiz:', err);
            alert('Failed to generate quiz. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    const handleAnswerSelect = (questionId, answerIndex) => {
        setSelectedAnswers({
            ...selectedAnswers,
            [questionId]: answerIndex
        });
    };
    const submitQuiz = () => {
        const results = {
            totalQuestions: currentQuiz.questions.length,
            correctAnswers: currentQuiz.questions.filter(q => selectedAnswers[q.id] === q.correctAnswer).length,
            answers: selectedAnswers,
            completedAt: new Date().toISOString()
        };
        setQuizResults(results);
        setCurrentView('results');
    };
    const resetQuiz = () => {
        setCurrentView('selection');
        setSelectedFiles([]);
        setCurrentQuiz(null);
        setCurrentQuestion(0);
        setSelectedAnswers({});
        setQuizResults(null);
        setTimeRemaining(0);
    };
    return (_jsxs("div", { className: "min-h-screen bg-gradient-cosmic pt-16 sm:pt-20", children: [_jsx(Header, {}), _jsx("div", { className: "container mx-auto px-4 py-6 sm:py-8 lg:py-12", children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, className: "max-w-6xl mx-auto", children: [currentView === 'selection' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-4xl md:text-5xl font-bold text-white mb-4", children: "AI Quiz Generator" }), _jsx("p", { className: "text-xl text-gray-300 max-w-2xl mx-auto", children: "Create personalized quizzes from your uploaded files and generated notes" })] }), _jsxs(Card, { className: "bg-card/95 border border-white/10 mb-8", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-white flex items-center gap-2", children: [_jsx(Target, { className: "h-5 w-5" }), "Quiz Settings"] }) }), _jsx(CardContent, { className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-300 mb-2 block", children: "Difficulty Level" }), _jsxs("select", { value: quizSettings.difficulty, onChange: (e) => setQuizSettings({ ...quizSettings, difficulty: e.target.value }), className: "w-full bg-gray-800 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none", children: [_jsx("option", { value: "easy", className: "bg-gray-800 text-white", children: "Easy" }), _jsx("option", { value: "medium", className: "bg-gray-800 text-white", children: "Medium" }), _jsx("option", { value: "hard", className: "bg-gray-800 text-white", children: "Hard" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-300 mb-2 block", children: "Number of Questions" }), _jsxs("select", { value: quizSettings.questionCount, onChange: (e) => setQuizSettings({ ...quizSettings, questionCount: parseInt(e.target.value) }), className: "w-full bg-gray-800 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none", children: [_jsx("option", { value: "5", className: "bg-gray-800 text-white", children: "5 Questions" }), _jsx("option", { value: "10", className: "bg-gray-800 text-white", children: "10 Questions" }), _jsx("option", { value: "15", className: "bg-gray-800 text-white", children: "15 Questions" }), _jsx("option", { value: "20", className: "bg-gray-800 text-white", children: "20 Questions" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-300 mb-2 block", children: "Time Limit (minutes)" }), _jsxs("select", { value: quizSettings.timeLimit, onChange: (e) => setQuizSettings({ ...quizSettings, timeLimit: parseInt(e.target.value) }), className: "w-full bg-gray-800 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none", children: [_jsx("option", { value: "10", className: "bg-gray-800 text-white", children: "10 Minutes" }), _jsx("option", { value: "15", className: "bg-gray-800 text-white", children: "15 Minutes" }), _jsx("option", { value: "30", className: "bg-gray-800 text-white", children: "30 Minutes" }), _jsx("option", { value: "0", className: "bg-gray-800 text-white", children: "No Limit" })] })] })] }) })] }), _jsxs(Tabs, { defaultValue: "notes", onValueChange: (value) => setQuizSettings({ ...quizSettings, source: value }), children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2 bg-card/95 border border-white/10 mb-6", children: [_jsxs(TabsTrigger, { value: "notes", className: "data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300", children: [_jsx(BookOpen, { className: "h-4 w-4 mr-2" }), "Generated Notes (", notes.length, ")"] }), _jsxs(TabsTrigger, { value: "files", className: "data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300", children: [_jsx(Upload, { className: "h-4 w-4 mr-2" }), "Uploaded Files (", uploadedFiles.filter(f => f.status === 'processed').length, ")"] })] }), _jsx(TabsContent, { value: "notes", children: _jsxs(Card, { className: "bg-card/95 border border-white/10", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-white", children: "Select Notes to Create Quiz From" }) }), _jsx(CardContent, { children: notes.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(BookOpen, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-400", children: "No generated notes available. Upload files first!" })] })) : (_jsx("div", { className: "space-y-3", children: notes.map((note) => (_jsx("div", { className: `p-4 rounded-lg border cursor-pointer transition-all ${selectedFiles.includes(note.id)
                                                                    ? 'border-purple-500/50 bg-purple-500/10'
                                                                    : 'border-white/10 hover:border-purple-500/30'}`, onClick: () => handleFileSelection(note.id, !selectedFiles.includes(note.id)), children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "checkbox", checked: selectedFiles.includes(note.id), onChange: () => { }, className: "text-purple-500" }), getFileIcon(note.fileType), _jsxs("div", { children: [_jsx("h4", { className: "text-white font-medium", children: note.fileName }), _jsxs("p", { className: "text-gray-400 text-sm", children: ["Generated: ", note.generatedDate, " \u2022 Size: ", note.fileSize] })] })] }), getStatusBadge(note.status)] }) }, note.id))) })) })] }) }), _jsx(TabsContent, { value: "files", children: _jsxs(Card, { className: "bg-card/95 border border-white/10", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-white", children: "Select Files to Create Quiz From" }) }), _jsx(CardContent, { children: uploadedFiles.filter(f => f.status === 'processed').length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(Upload, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-400", children: "No processed files available. Upload and process files first!" })] })) : (_jsx("div", { className: "space-y-3", children: uploadedFiles.filter(f => f.status === 'processed').map((file) => (_jsx("div", { className: `p-4 rounded-lg border cursor-pointer transition-all ${selectedFiles.includes(file.id)
                                                                    ? 'border-purple-500/50 bg-purple-500/10'
                                                                    : 'border-white/10 hover:border-purple-500/30'}`, onClick: () => handleFileSelection(file.id, !selectedFiles.includes(file.id)), children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "checkbox", checked: selectedFiles.includes(file.id), onChange: () => { }, className: "text-purple-500" }), getFileIcon(file.fileType), _jsxs("div", { children: [_jsx("h4", { className: "text-white font-medium", children: file.fileName }), _jsxs("p", { className: "text-gray-400 text-sm", children: ["Uploaded: ", file.uploadDate, " \u2022 Size: ", file.fileSize] })] })] }), getStatusBadge(file.status)] }) }, file.id))) })) })] }) })] }), _jsx("div", { className: "text-center mt-8", children: _jsx(Button, { onClick: generateQuiz, disabled: selectedFiles.length === 0 || loading, className: "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3 text-lg font-medium", children: loading ? (_jsxs(_Fragment, { children: [_jsx(RefreshCw, { className: "h-5 w-5 mr-2 animate-spin" }), "Generating Quiz..."] })) : (_jsxs(_Fragment, { children: [_jsx(Play, { className: "h-5 w-5 mr-2" }), "Generate Quiz (", selectedFiles.length, " file", selectedFiles.length !== 1 ? 's' : '', " selected)"] })) }) })] })), currentView === 'quiz' && currentQuiz && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs(Button, { variant: "outline", onClick: () => setCurrentView('selection'), className: "border-white/20 text-white hover:bg-white/10", children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Back to Selection"] }), _jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: currentQuiz.title }), _jsxs("p", { className: "text-gray-400", children: ["Question ", currentQuestion + 1, " of ", currentQuiz.questions.length] })] }), _jsx("div", { className: "text-right", children: quizSettings.timeLimit > 0 ? (_jsxs("div", { className: `text-lg font-mono ${timeRemaining < 300 ? 'text-red-400' : timeRemaining < 600 ? 'text-yellow-400' : 'text-green-400'}`, children: [_jsx(Clock, { className: "h-4 w-4 inline mr-1" }), formatTime(timeRemaining)] })) : (_jsx("div", { className: "text-gray-400 text-sm", children: "No Time Limit" })) })] }), _jsx("div", { className: "mb-8", children: _jsx(Progress, { value: (currentQuestion + 1) / currentQuiz.questions.length * 100, className: "h-2" }) }), _jsx(Card, { className: "bg-card/95 border border-white/10 mb-6", children: _jsxs(CardContent, { className: "p-8", children: [_jsx("h3", { className: "text-xl font-semibold text-white mb-6", children: currentQuiz.questions[currentQuestion].question }), _jsx("div", { className: "space-y-3", children: currentQuiz.questions[currentQuestion].options.map((option, index) => (_jsx("div", { className: `p-4 rounded-lg border cursor-pointer transition-all ${selectedAnswers[currentQuiz.questions[currentQuestion].id] === index
                                                        ? 'border-purple-500/50 bg-purple-500/10'
                                                        : 'border-white/10 hover:border-purple-500/30'}`, onClick: () => handleAnswerSelect(currentQuiz.questions[currentQuestion].id, index), children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "radio", name: `question-${currentQuiz.questions[currentQuestion].id}`, checked: selectedAnswers[currentQuiz.questions[currentQuestion].id] === index, onChange: () => { }, className: "text-purple-500" }), _jsx("span", { className: "text-white", children: option })] }) }, index))) })] }) }), _jsxs("div", { className: "flex justify-between", children: [_jsxs(Button, { variant: "outline", onClick: () => setCurrentQuestion(Math.max(0, currentQuestion - 1)), disabled: currentQuestion === 0, className: "border-white/20 text-white hover:bg-white/10", children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Previous"] }), currentQuestion === currentQuiz.questions.length - 1 ? (_jsxs(Button, { onClick: submitQuiz, className: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white", children: ["Submit Quiz", _jsx(CheckCircle2, { className: "h-4 w-4 ml-2" })] })) : (_jsxs(Button, { onClick: () => setCurrentQuestion(Math.min(currentQuiz.questions.length - 1, currentQuestion + 1)), className: "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white", children: ["Next", _jsx(ArrowRight, { className: "h-4 w-4 ml-2" })] }))] })] })), currentView === 'results' && quizResults && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-4xl font-bold text-white mb-4", children: "Quiz Results" }), _jsx("div", { className: "text-6xl mb-4", children: quizResults.correctAnswers === quizResults.totalQuestions ? '🏆' :
                                                quizResults.correctAnswers / quizResults.totalQuestions >= 0.8 ? '🎉' :
                                                    quizResults.correctAnswers / quizResults.totalQuestions >= 0.6 ? '👏' : '📚' })] }), _jsx(Card, { className: "bg-card/95 border border-white/10 mb-8", children: _jsxs(CardContent, { className: "p-8 text-center", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8 mb-8", children: [_jsxs("div", { children: [_jsx("div", { className: "text-3xl font-bold text-green-400 mb-2", children: quizResults.correctAnswers }), _jsx("div", { className: "text-gray-300", children: "Correct Answers" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-3xl font-bold text-red-400 mb-2", children: quizResults.totalQuestions - quizResults.correctAnswers }), _jsx("div", { className: "text-gray-300", children: "Incorrect Answers" })] }), _jsxs("div", { children: [_jsxs("div", { className: "text-3xl font-bold text-purple-400 mb-2", children: [Math.round((quizResults.correctAnswers / quizResults.totalQuestions) * 100), "%"] }), _jsx("div", { className: "text-gray-300", children: "Score" })] })] }), _jsx(Progress, { value: (quizResults.correctAnswers / quizResults.totalQuestions) * 100, className: "h-4 mb-4" }), _jsx("p", { className: "text-gray-300 mb-6", children: quizResults.correctAnswers === quizResults.totalQuestions ? 'Perfect score! Outstanding work!' :
                                                    quizResults.correctAnswers / quizResults.totalQuestions >= 0.8 ? 'Excellent performance! Keep it up!' :
                                                        quizResults.correctAnswers / quizResults.totalQuestions >= 0.6 ? 'Good job! Room for improvement.' :
                                                            'Keep studying! Practice makes perfect.' })] }) }), _jsxs(Card, { className: "bg-card/95 border border-white/10 mb-8", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-white", children: "Review Answers" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-6", children: currentQuiz.questions.map((question, index) => {
                                                    const userAnswer = quizResults.answers[question.id];
                                                    const isCorrect = userAnswer === question.correctAnswer;
                                                    return (_jsx("div", { className: "p-4 rounded-lg border border-white/10", children: _jsxs("div", { className: "flex items-start gap-3 mb-3", children: [isCorrect ?
                                                                    _jsx(CheckCircle2, { className: "h-5 w-5 text-green-400 mt-0.5" }) :
                                                                    _jsx(XCircle, { className: "h-5 w-5 text-red-400 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "text-white font-medium mb-2", children: question.question }), _jsxs("div", { className: "space-y-1 text-sm", children: [_jsxs("div", { className: "text-gray-300", children: [_jsx("span", { className: "font-medium", children: "Your answer:" }), " ", question.options[userAnswer] || 'Not answered'] }), _jsxs("div", { className: "text-green-400", children: [_jsx("span", { className: "font-medium", children: "Correct answer:" }), " ", question.options[question.correctAnswer]] }), question.explanation && (_jsxs("div", { className: "text-gray-400 mt-2 p-2 bg-muted/20 rounded", children: [_jsx(Lightbulb, { className: "h-4 w-4 inline mr-1" }), question.explanation] }))] })] })] }) }, question.id));
                                                }) }) })] }), _jsx("div", { className: "text-center", children: _jsxs(Button, { onClick: resetQuiz, className: "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3", children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), "Take Another Quiz"] }) })] }))] }) })] }));
};
export default Quiz;
