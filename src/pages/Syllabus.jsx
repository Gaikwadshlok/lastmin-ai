import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileText, File, X, HelpCircle, BookOpen, Plus, Loader2, Copy, Download, CheckCircle, Brain } from "lucide-react";
import Header from "@/components/Header";
import { uploadService } from '@/services/uploadService.js';
import { aiService } from '@/services/aiService.js';
import { studyModesService } from '@/services/studyModesService';
import { generatedDocumentService } from '@/services/generatedDocumentService';
import { useToast } from '@/hooks/use-toast';
const Syllabus = () => {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('upload');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [notesResult, setNotesResult] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    // Study Modes State
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    // Question Bank State
    const [questionBank, setQuestionBank] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState('');
    // Topic Notes State
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState('intermediate');
    const [noteLength, setNoteLength] = useState('medium');
    // Notes to Questions State
    const [notes, setNotes] = useState('');
    const [questionType, setQuestionType] = useState('mixed');
    const [questionCount, setQuestionCount] = useState('10');
    // Safe result rendering helper
    const renderResult = (result) => {
        if (!result)
            return '';
        if (typeof result === 'string')
            return result;
        if (typeof result === 'object') {
            // If it's an array of questions, format them nicely
            if (Array.isArray(result)) {
                return result.map((item, index) => `${index + 1}. ${JSON.stringify(item)}`).join('\n\n');
            }
            // If it's an object, convert to readable format
            return JSON.stringify(result, null, 2);
        }
        return String(result);
    };
    const handleFileUpload = (file) => {
        // Check file type and size
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (!allowedTypes.includes(file.type)) {
            alert('Please upload PDF, DOCX, or TXT files only');
            return;
        }
        if (file.size > maxSize) {
            alert('File size should be less than 10MB');
            return;
        }
        setUploadedFile(file);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };
    const handleFileSelect = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileUpload(files[0]);
        }
    };
    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };
    const removeFile = () => {
        setUploadedFile(null);
        setNotesResult(null);
        setProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    const getFileIcon = (fileType) => {
        if (fileType.includes('pdf'))
            return _jsx(FileText, { className: "h-8 w-8 text-red-400" });
        if (fileType.includes('word'))
            return _jsx(File, { className: "h-8 w-8 text-blue-400" });
        if (fileType.includes('text'))
            return _jsx(FileText, { className: "h-8 w-8 text-green-400" });
        return _jsx(File, { className: "h-8 w-8 text-gray-400" });
    };
    // Simulate a progress bar while backend work occurs
    const simulateProgress = () => {
        setProgress(5);
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval); // Finish later when actual call resolves
                    return prev;
                }
                return prev + Math.random() * 10;
            });
        }, 400);
        return () => clearInterval(interval);
    };
    const handleGenerateNotes = async () => {
        if (!uploadedFile || isGenerating)
            return;
        setIsGenerating(true);
        setError(null);
        setNotesResult(null);
        setProgress(0);
        const stopSim = simulateProgress();
        try {
            // 1. Upload the document
            const formData = new FormData();
            formData.append('document', uploadedFile);
            const uploadRes = await uploadService.uploadDocument(formData);
            const documentId = uploadRes.data?.data?.document?.id || uploadRes.data?.document?.id;
            // 2. Request AI analysis / summary
            // Prefer analyzeDocument if full content, else summary
            const textForAI = uploadRes.data?.data?.extractedText || uploadRes.data?.extractedText || '';
            let aiText = '';
            if (textForAI) {
                const analyzeRes = await aiService.analyzeDocument(textForAI, documentId);
                aiText = analyzeRes.data?.data?.analysis || JSON.stringify(analyzeRes.data, null, 2);
            }
            else {
                // Fallback: ask for summary based on file name if no extracted text provided
                const summaryRes = await aiService.generateSummary(uploadedFile.name, 'detailed');
                aiText = summaryRes.data?.data?.summary || JSON.stringify(summaryRes.data, null, 2);
            }
            setProgress(100);
            setNotesResult(aiText);
        }
        catch (e) {
            console.error('Generate notes error', e);
            const msg = e.response?.data?.error?.message || e.message || 'Failed to generate notes';
            setError(msg);
        }
        finally {
            stopSim();
            setIsGenerating(false);
        }
    };
    // Convert markdown-style text to clean HTML (same as Notes page)
    const markdownToHtml = (text) => {
        if (!text)
            return '';
        let html = text;
        html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        html = html.replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre class="code-block">$1</pre>');
        html = html.replace(/^[-*_]{3,}$/gm, '<hr>');
        html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
        html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^#\s+(.+)$/gm, '<h1 class="section-title">$1</h1>');
        html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        html = html.replace(/^(Q\d+[:.]\s*)(.+)$/gm, '<div class="question"><span class="q-label">$1</span>$2</div>');
        html = html.replace(/^(Question\s+\d+[:.]\s*)(.+)$/gm, '<div class="question"><span class="q-label">$1</span>$2</div>');
        html = html.replace(/^((?:Correct\s+)?Answer[:.]\s*)(.+)$/gm, '<div class="answer"><span class="a-label">$1</span>$2</div>');
        html = html.replace(/^(Expected\s+Answer[:.]\s*)(.+)$/gm, '<div class="answer"><span class="a-label">$1</span>$2</div>');
        html = html.replace(/^([a-dA-D]\))\s+(.+)$/gm, '<div class="mcq-option"><span class="option-letter">$1</span> $2</div>');
        html = html.replace(/^(\d+)\.\s+(.+)$/gm, '<div class="numbered-item"><span class="num">$1.</span> $2</div>');
        html = html.replace(/^[\-\*]\s+(.+)$/gm, '<div class="bullet-item">$1</div>');
        html = html.replace(/\n\n+/g, '</p><p>');
        html = html.replace(/\n/g, '<br>');
        html = '<p>' + html + '</p>';
        html = html.replace(/<p>\s*<\/p>/g, '');
        html = html.replace(/<p>(<(?:h[1-4]|div|pre|hr)[^>]*>)/g, '$1');
        html = html.replace(/(<\/(?:h[1-4]|div|pre)>)<\/p>/g, '$1');
        html = html.replace(/<p>(<hr>)<\/p>/g, '$1');
        return html;
    };
    const handlePreviewPDF = () => {
        if (!notesResult) {
            alert('Please generate notes first');
            return;
        }
        const parsedContent = markdownToHtml(notesResult);
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Generated Study Notes - LastMin AI</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',-apple-system,sans-serif;line-height:1.75;background:#fff;color:#1f2937;font-size:14px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .page{max-width:780px;margin:0 auto;padding:48px 56px}
    .header{text-align:center;padding-bottom:24px;margin-bottom:32px;border-bottom:3px solid #7c3aed;position:relative}
    .header::after{content:'';position:absolute;bottom:-3px;left:50%;transform:translateX(-50%);width:60px;height:3px;background:#a78bfa}
    .header h1{font-size:26px;font-weight:800;color:#7c3aed;margin-bottom:10px;letter-spacing:-.5px}
    .meta{color:#6b7280;font-size:13px}
    .badge{display:inline-block;background:#f3f0ff;color:#7c3aed;padding:3px 14px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-left:8px;border:1px solid #e0d4fc}
    .content{margin-top:8px}
    .content p{margin-bottom:14px;color:#374151;font-size:14px;line-height:1.8}
    .content h1.section-title{font-size:22px;font-weight:800;color:#5b21b6;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #ede9fe}
    .content h2{font-size:18px;font-weight:700;color:#6d28d9;margin:28px 0 12px;padding-left:12px;border-left:4px solid #8b5cf6}
    .content h3{font-size:15px;font-weight:700;color:#7c3aed;margin:22px 0 10px}
    .content h4{font-size:14px;font-weight:600;color:#4c1d95;margin:18px 0 8px}
    .content strong{color:#111827;font-weight:700}
    .content em{color:#4b5563;font-style:italic}
    .bullet-item{padding:4px 0 4px 24px;position:relative;margin-bottom:4px}
    .bullet-item::before{content:'•';position:absolute;left:8px;color:#7c3aed;font-weight:700;font-size:16px}
    .numbered-item{padding:4px 0 4px 8px;margin-bottom:4px}
    .numbered-item .num{color:#7c3aed;font-weight:700;margin-right:4px}
    .question{background:#f8f6ff;border-left:4px solid #7c3aed;padding:12px 16px;margin:18px 0 6px;border-radius:0 8px 8px 0;font-weight:500}
    .q-label{color:#7c3aed;font-weight:700}
    .answer{background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;margin:4px 0 18px;border-radius:0 8px 8px 0;color:#166534}
    .a-label{color:#15803d;font-weight:700}
    .mcq-option{padding:4px 0 4px 20px;margin:2px 0}
    .mcq-option .option-letter{font-weight:700;color:#6d28d9}
    code{font-family:'JetBrains Mono',monospace;background:#f3f4f6;padding:2px 6px;border-radius:4px;font-size:12.5px;color:#be185d}
    .code-block{font-family:'JetBrains Mono',monospace;background:#1e1e2e;color:#cdd6f4;padding:16px 20px;border-radius:8px;font-size:12.5px;line-height:1.6;overflow-x:auto;margin:16px 0;white-space:pre-wrap}
    hr{border:none;height:1px;background:linear-gradient(to right,transparent,#d1d5db,transparent);margin:28px 0}
    .footer{margin-top:48px;padding-top:20px;border-top:2px solid #f3f4f6;text-align:center;font-size:11px;color:#9ca3af}
    .footer .brand{color:#7c3aed;font-weight:600}
    @media print{body{font-size:12px}.page{padding:24px 32px;max-width:none}.question,.answer{-webkit-print-color-adjust:exact}.code-block{background:#f3f4f6!important;color:#1f2937!important}}
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <h1>${uploadedFile?.name ? 'Study Notes - ' + uploadedFile.name : 'Generated Study Notes'}</h1>
      <p class="meta">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} <span class="badge">📝 Study Notes</span></p>
    </div>
    <div class="content">${parsedContent}</div>
    <div class="footer">Generated by <span class="brand">LastMin AI</span> &mdash; Your Intelligent Study Companion</div>
  </div>
</body>
</html>`;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const popup = window.open(url, 'NotesPreview', 'width=850,height=700,scrollbars=yes,resizable=yes');
        if (popup) {
            popup.onload = () => setTimeout(() => URL.revokeObjectURL(url), 100);
        }
        else {
            alert('Please allow pop-ups for this site to preview the PDF');
            URL.revokeObjectURL(url);
        }
    };
    // Study Modes Functions
    const addQuestion = () => {
        if (currentQuestion.trim()) {
            setQuestionBank([...questionBank, { question: currentQuestion, answer: null }]);
            setCurrentQuestion('');
        }
    };
    const removeQuestion = (index) => {
        setQuestionBank(questionBank.filter((_, i) => i !== index));
    };
    const handleQuestionBank = async () => {
        if (questionBank.length === 0) {
            toast({
                title: "Error",
                description: "Please add at least one question",
                variant: "destructive"
            });
            return;
        }
        setLoading(true);
        try {
            const questions = questionBank.map(item => item.question);
            const response = await studyModesService.answerQuestions(questions, '');
            const answersText = response.data?.answers || (typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2));
            setResult(answersText);
            // Update question bank with answers
            const answeredQuestions = questionBank.map((item, index) => ({
                ...item,
                answer: typeof answersText === 'string' ? answersText.split('\n\n')[index] || '' : ''
            }));
            setQuestionBank(answeredQuestions);
            // Save to database so it appears in Notes page
            try {
                await generatedDocumentService.generateDocument({
                    sourceDocumentId: undefined,
                    generationType: 'notes',
                    title: `Question Bank Answers (${questions.length} questions)`,
                    subject: 'Question Bank',
                    content: answersText
                });
                toast({
                    title: "Saved to Notes",
                    description: "Answers are also available in the Notes page"
                });
            }
            catch (dbError) {
                console.error('Error saving answers to database:', dbError);
            }
            toast({
                title: "Success",
                description: `Generated answers for ${questions.length} questions`
            });
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to generate answers",
                variant: "destructive"
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handleTopicNotes = async () => {
        if (!topic.trim()) {
            toast({
                title: "Error",
                description: "Please enter a topic",
                variant: "destructive"
            });
            return;
        }
        setLoading(true);
        try {
            // Generate notes using studyModes service
            const response = await studyModesService.generateNotes(topic, {
                difficulty,
                length: noteLength
            });
            const notesText = response.data?.notes || (typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2));
            setResult(notesText);
            // Also save to database so it appears in Notes page
            if (response.data) {
                try {
                    console.log('💾 Saving topic notes to database:', {
                        topic,
                        responseType: typeof response.data,
                        hasContent: !!response.data
                    });
                    await generatedDocumentService.generateDocument({
                        sourceDocumentId: undefined, // Topic notes are standalone
                        generationType: 'notes',
                        title: `Topic Notes - ${topic}`,
                        subject: topic,
                        content: notesText
                    });
                    console.log('✅ Topic notes saved to database successfully');
                    toast({
                        title: "Saved to Notes",
                        description: "Generated notes are also available in the Notes page"
                    });
                }
                catch (dbError) {
                    console.error('❌ Error saving to database:', dbError);
                    toast({
                        title: "Warning",
                        description: "Notes generated but not saved to Notes page",
                        variant: "destructive"
                    });
                }
            }
            toast({
                title: "Success",
                description: `Generated comprehensive notes for "${topic}"`
            });
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to generate notes",
                variant: "destructive"
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handleNotesToQuestions = async () => {
        if (!notes.trim()) {
            toast({
                title: "Error",
                description: "Please provide notes content",
                variant: "destructive"
            });
            return;
        }
        setLoading(true);
        try {
            const response = await studyModesService.generateQuestionsFromNotes(notes, {
                questionType,
                questionCount: parseInt(questionCount),
                difficulty
            });
            const questionsText = response.data?.questionBank || (typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2));
            setResult(questionsText);
            // Also save to database so it appears in Notes page
            if (response.data) {
                try {
                    console.log('💾 Saving questions to database:', {
                        questionType,
                        questionCount,
                        responseType: typeof response.data,
                        hasContent: !!response.data
                    });
                    await generatedDocumentService.generateDocument({
                        sourceDocumentId: undefined, // This is generated from user notes, not a document
                        generationType: 'quiz',
                        title: `Generated Questions - ${questionType} (${questionCount} questions)`,
                        subject: 'General',
                        content: questionsText
                    });
                    console.log('✅ Questions saved to database successfully');
                    toast({
                        title: "Saved to Notes",
                        description: "Generated questions are also available in the Notes page"
                    });
                }
                catch (dbError) {
                    console.error('❌ Error saving questions to database:', dbError);
                    toast({
                        title: "Warning",
                        description: "Questions generated but not saved to Notes page",
                        variant: "destructive"
                    });
                }
            }
            toast({
                title: "Success",
                description: `Generated ${questionCount} questions from your notes`
            });
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to generate questions",
                variant: "destructive"
            });
        }
        finally {
            setLoading(false);
        }
    };
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied!",
            description: "Content copied to clipboard"
        });
    };
    const downloadAsText = (content, filename) => {
        const element = document.createElement('a');
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };
    return (_jsxs("div", { className: "min-h-screen bg-gradient-cosmic pt-16 sm:pt-20", children: [_jsx(Header, {}), _jsx("div", { className: "container mx-auto px-4 py-6 sm:py-8 lg:py-12", children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, className: "max-w-4xl mx-auto", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.1 }, className: "text-center mb-12", children: [_jsx("h1", { className: "text-4xl md:text-5xl font-bold text-white mb-4", children: "Study Hub" }), _jsx("p", { className: "text-xl text-gray-300 max-w-2xl mx-auto", children: "Upload your syllabus and access powerful AI study tools in one place." })] }), _jsx(motion.div, { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay: 0.2 }, children: _jsx(Card, { className: "bg-card/95 backdrop-blur-md border-2 border-white/10 shadow-2xl shadow-primary/25 mb-8", children: _jsx(CardContent, { children: _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4 bg-black/20 backdrop-blur-sm", children: [_jsxs(TabsTrigger, { value: "upload", className: "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white flex items-center gap-2", children: [_jsx(Upload, { className: "h-4 w-4" }), "Upload"] }), _jsxs(TabsTrigger, { value: "question-bank", className: "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-700 data-[state=active]:text-white flex items-center gap-2", children: [_jsx(HelpCircle, { className: "h-4 w-4" }), "Questions"] }), _jsxs(TabsTrigger, { value: "topic-notes", className: "data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-700 data-[state=active]:text-white flex items-center gap-2", children: [_jsx(BookOpen, { className: "h-4 w-4" }), "Notes"] }), _jsxs(TabsTrigger, { value: "notes-to-questions", className: "data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-700 data-[state=active]:text-white flex items-center gap-2", children: [_jsx(Brain, { className: "h-4 w-4" }), "Generate"] })] }), _jsx(TabsContent, { value: "upload", className: "mt-6", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("h3", { className: "text-xl font-semibold text-white mb-2", children: "Upload Your Syllabus" }), _jsx("p", { className: "text-gray-300", children: "Support for PDF, DOCX, and TXT files. Our AI will analyze and create personalized study materials." })] }), _jsx("div", { className: `border-2 border-dashed rounded-lg p-12 text-center transition-all ${isDragOver
                                                                ? 'border-purple-400 bg-purple-400/10'
                                                                : 'border-gray-600 hover:border-gray-500'}`, onDrop: handleDrop, onDragOver: handleDragOver, onDragLeave: handleDragLeave, children: _jsxs("div", { className: "flex flex-col items-center gap-4", children: [_jsx("div", { className: "bg-gray-800 p-4 rounded-full", children: _jsx(Upload, { className: "h-8 w-8 text-gray-400" }) }), uploadedFile ? (_jsxs("div", { className: "flex items-center gap-3 bg-gray-800/50 rounded-lg p-3 max-w-md", children: [getFileIcon(uploadedFile.type), _jsxs("div", { className: "flex-1 text-left", children: [_jsx("p", { className: "text-white font-medium truncate", children: uploadedFile.name }), _jsxs("p", { className: "text-gray-400 text-sm", children: [(uploadedFile.size / (1024 * 1024)).toFixed(2), " MB"] })] }), _jsx("button", { onClick: removeFile, className: "text-red-400 hover:text-red-300 transition-colors", children: _jsx(X, { className: "h-5 w-5" }) })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "text-white", children: [_jsx("p", { className: "text-lg font-medium mb-2", children: "Drop your files here or click to browse" }), _jsx("p", { className: "text-gray-400", children: "Supports PDF, DOCX, TXT (Max 10MB)" })] }), _jsx(Button, { onClick: handleBrowseClick, className: "bg-purple-600 hover:bg-purple-700 text-white", children: "Browse Files" })] }))] }) }), _jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex gap-4", children: [_jsx(Button, { disabled: !uploadedFile || isGenerating, onClick: handleGenerateNotes, className: `flex-1 hover:opacity-90 shadow-lg shadow-primary/30 h-12 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed border-2 border-primary/50 ${uploadedFile ? 'bg-primary text-white' : 'bg-gradient-primary'}`, children: isGenerating ? `Generating... ${Math.round(progress)}%` : 'Generate Notes' }), _jsx(Button, { variant: "outline", disabled: !notesResult, onClick: handlePreviewPDF, className: "px-8 border-white/20 bg-card/60 hover:bg-card/80 backdrop-blur-sm h-12 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed", children: "Preview" })] }), isGenerating && (_jsx("div", { className: "w-full bg-gray-700/40 h-2 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 transition-all", style: { width: `${Math.min(100, progress)}%` } }) })), error && (_jsx("div", { className: "p-3 border border-red-500/30 bg-red-500/10 rounded-md text-sm text-red-300", children: error }))] }), _jsx("input", { ref: fileInputRef, type: "file", accept: ".pdf,.docx,.txt", onChange: handleFileSelect, className: "hidden" })] }) }), _jsx(TabsContent, { value: "question-bank", className: "mt-6", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsxs("h3", { className: "text-xl font-semibold text-white mb-2 flex items-center justify-center gap-2", children: [_jsx(HelpCircle, { className: "h-6 w-6 text-blue-400" }), "Question Bank Answering"] }), _jsx("p", { className: "text-gray-300", children: "Add your questions and get AI-powered answers" })] }), _jsxs("div", { className: "space-y-4", children: [questionBank.map((item, index) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-gray-800/40 rounded-lg p-4 border border-gray-700/50", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsxs("span", { className: "text-blue-400 font-semibold mt-1", children: ["Q", index + 1, ":"] }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx("p", { className: "text-white", children: item.question }), item.answer && (_jsx("div", { className: "bg-gray-900/50 rounded-md p-3", children: _jsx("p", { className: "text-gray-300 text-sm", children: item.answer }) }))] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => removeQuestion(index), className: "text-red-400 hover:text-red-300 hover:bg-red-400/10", children: _jsx(X, { className: "h-4 w-4" }) })] }) }, index))), _jsxs("div", { className: "space-y-3", children: [_jsx(Textarea, { placeholder: "Enter your question here...", value: currentQuestion, onChange: (e) => setCurrentQuestion(e.target.value), className: "bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 resize-none", rows: 3 }), _jsxs("div", { className: "flex gap-3", children: [_jsxs(Button, { onClick: addQuestion, disabled: !currentQuestion.trim(), className: "bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Question"] }), _jsx(Button, { onClick: handleQuestionBank, disabled: questionBank.length === 0 || loading, className: "flex-1 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white", children: loading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Generating Answers..."] })) : (_jsxs(_Fragment, { children: [_jsx(HelpCircle, { className: "h-4 w-4 mr-2" }), "Get AI Answers (", questionBank.length, ")"] })) })] })] }), result && (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-6 border border-blue-500/20", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h4", { className: "text-white font-semibold flex items-center gap-2", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-400" }), "Generated Answers"] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => copyToClipboard(renderResult(result)), className: "border-white/20 hover:bg-white/10", children: [_jsx(Copy, { className: "h-4 w-4 mr-2" }), "Copy"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => downloadAsText(renderResult(result), 'question-bank-answers'), className: "border-white/20 hover:bg-white/10", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Download"] })] })] }), _jsx(ScrollArea, { className: "h-64 w-full", children: _jsx("div", { className: "text-gray-300 text-sm whitespace-pre-wrap", children: renderResult(result) }) })] }))] })] }) }), _jsx(TabsContent, { value: "topic-notes", className: "mt-6", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsxs("h3", { className: "text-xl font-semibold text-white mb-2 flex items-center justify-center gap-2", children: [_jsx(BookOpen, { className: "h-6 w-6 text-green-400" }), "Topic Notes Generation"] }), _jsx("p", { className: "text-gray-300", children: "Generate detailed study notes for any topic" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsx(Input, { placeholder: "Enter topic (e.g., 'Photosynthesis', 'World War 2')", value: topic, onChange: (e) => setTopic(e.target.value), className: "bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [_jsxs(Select, { value: difficulty, onValueChange: setDifficulty, children: [_jsx(SelectTrigger, { className: "bg-gray-800/50 border-gray-600 text-white", children: _jsx(SelectValue, { placeholder: "Select difficulty" }) }), _jsxs(SelectContent, { className: "bg-gray-800 border-gray-600", children: [_jsx(SelectItem, { value: "beginner", children: "Beginner" }), _jsx(SelectItem, { value: "intermediate", children: "Intermediate" }), _jsx(SelectItem, { value: "advanced", children: "Advanced" })] })] }), _jsxs(Select, { value: noteLength, onValueChange: setNoteLength, children: [_jsx(SelectTrigger, { className: "bg-gray-800/50 border-gray-600 text-white", children: _jsx(SelectValue, { placeholder: "Select length" }) }), _jsxs(SelectContent, { className: "bg-gray-800 border-gray-600", children: [_jsx(SelectItem, { value: "short", children: "Short (1-2 pages)" }), _jsx(SelectItem, { value: "medium", children: "Medium (3-5 pages)" }), _jsx(SelectItem, { value: "long", children: "Long (6+ pages)" })] })] })] }), _jsx(Button, { onClick: handleTopicNotes, disabled: !topic.trim() || loading, className: "w-full bg-gradient-to-r from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-800 text-white h-12 font-semibold", children: loading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Generating Notes..."] })) : (_jsxs(_Fragment, { children: [_jsx(BookOpen, { className: "h-4 w-4 mr-2" }), "Generate Topic Notes"] })) })] }), result && (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-6 border border-green-500/20", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h4", { className: "text-white font-semibold flex items-center gap-2", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-400" }), "Generated Notes"] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => copyToClipboard(renderResult(result)), className: "border-white/20 hover:bg-white/10", children: [_jsx(Copy, { className: "h-4 w-4 mr-2" }), "Copy"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => downloadAsText(renderResult(result), 'topic-notes'), className: "border-white/20 hover:bg-white/10", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Download"] })] })] }), _jsx(ScrollArea, { className: "h-64 w-full", children: _jsx("div", { className: "text-gray-300 text-sm whitespace-pre-wrap", children: renderResult(result) }) })] }))] })] }) }), _jsx(TabsContent, { value: "notes-to-questions", className: "mt-6", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsxs("h3", { className: "text-xl font-semibold text-white mb-2 flex items-center justify-center gap-2", children: [_jsx(Brain, { className: "h-6 w-6 text-purple-400" }), "Notes to Questions Generation"] }), _jsx("p", { className: "text-gray-300", children: "Convert your study notes into practice questions" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsx(Textarea, { placeholder: "Paste your study notes here...", value: notes, onChange: (e) => setNotes(e.target.value), className: "bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 min-h-32 resize-none", rows: 6 }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [_jsxs(Select, { value: questionType, onValueChange: setQuestionType, children: [_jsx(SelectTrigger, { className: "bg-gray-800/50 border-gray-600 text-white", children: _jsx(SelectValue, { placeholder: "Select question type" }) }), _jsxs(SelectContent, { className: "bg-gray-800 border-gray-600", children: [_jsx(SelectItem, { value: "multiple-choice", children: "Multiple Choice" }), _jsx(SelectItem, { value: "short-answer", children: "Short Answer" }), _jsx(SelectItem, { value: "essay", children: "Essay Questions" }), _jsx(SelectItem, { value: "mixed", children: "Mixed Types" })] })] }), _jsxs(Select, { value: questionCount, onValueChange: setQuestionCount, children: [_jsx(SelectTrigger, { className: "bg-gray-800/50 border-gray-600 text-white", children: _jsx(SelectValue, { placeholder: "Number of questions" }) }), _jsxs(SelectContent, { className: "bg-gray-800 border-gray-600", children: [_jsx(SelectItem, { value: "5", children: "5 Questions" }), _jsx(SelectItem, { value: "10", children: "10 Questions" }), _jsx(SelectItem, { value: "15", children: "15 Questions" }), _jsx(SelectItem, { value: "20", children: "20 Questions" })] })] })] }), _jsx(Button, { onClick: handleNotesToQuestions, disabled: !notes.trim() || loading, className: "w-full bg-gradient-to-r from-purple-500 to-pink-700 hover:from-purple-600 hover:to-pink-800 text-white h-12 font-semibold", children: loading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Generating Questions..."] })) : (_jsxs(_Fragment, { children: [_jsx(Brain, { className: "h-4 w-4 mr-2" }), "Generate Questions from Notes"] })) })] }), result && (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-6 border border-purple-500/20", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h4", { className: "text-white font-semibold flex items-center gap-2", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-400" }), "Generated Questions"] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => copyToClipboard(renderResult(result)), className: "border-white/20 hover:bg-white/10", children: [_jsx(Copy, { className: "h-4 w-4 mr-2" }), "Copy"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => downloadAsText(renderResult(result), 'generated-questions'), className: "border-white/20 hover:bg-white/10", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Download"] })] })] }), _jsx(ScrollArea, { className: "h-64 w-full", children: _jsx("div", { className: "text-gray-300 text-sm whitespace-pre-wrap", children: renderResult(result) }) })] }))] })] }) })] }) }) }) }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.3 }, className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.4 }, children: _jsx(Card, { className: "bg-card/95 backdrop-blur-md border border-white/10 text-center", children: _jsxs(CardContent, { className: "pt-6", children: [_jsx(FileText, { className: "h-12 w-12 text-red-400 mx-auto mb-3" }), _jsx("h3", { className: "text-white font-semibold mb-2", children: "PDF Files" }), _jsx("p", { className: "text-gray-400 text-sm", children: "Upload PDF documents with text content for analysis" })] }) }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.5 }, children: _jsx(Card, { className: "bg-card/95 backdrop-blur-md border border-white/10 text-center", children: _jsxs(CardContent, { className: "pt-6", children: [_jsx(File, { className: "h-12 w-12 text-blue-400 mx-auto mb-3" }), _jsx("h3", { className: "text-white font-semibold mb-2", children: "DOCX Files" }), _jsx("p", { className: "text-gray-400 text-sm", children: "Microsoft Word documents with formatted content" })] }) }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.6 }, children: _jsx(Card, { className: "bg-card/95 backdrop-blur-md border border-white/10 text-center", children: _jsxs(CardContent, { className: "pt-6", children: [_jsx(FileText, { className: "h-12 w-12 text-green-400 mx-auto mb-3" }), _jsx("h3", { className: "text-white font-semibold mb-2", children: "TXT Files" }), _jsx("p", { className: "text-gray-400 text-sm", children: "Plain text files with syllabus or course content" })] }) }) })] })] }) })] }));
};
export default Syllabus;
