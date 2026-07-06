import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, File, Calendar, Eye, Download, Trash2, Upload, FolderOpen, BookOpen } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useNotes } from '@/hooks/useNotes';
import { uploadService } from '@/services/uploadService';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { notesService } from '@/services/notesService';
import { generatedDocumentService } from '@/services/generatedDocumentService';
const Notes = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('notes');
    // Fetch notes from the original notes API
    const { data: notesData, isLoading: notesLoading, error: notesError, refetch: refetchNotes } = useNotes();
    // Fetch generated documents from Study Hub
    const { data: generatedDocsData, isLoading: generatedDocsLoading, refetch: refetchGeneratedDocs } = useQuery({
        queryKey: ['generatedDocuments'],
        queryFn: () => generatedDocumentService.getGeneratedDocuments().then(r => {
            const data = r.data?.data || r.data;
            return data;
        }),
        retry: false
    });
    // Fetch uploaded documents
    const { data: documentsData, isLoading: documentsLoading } = useQuery({
        queryKey: ['documents'],
        queryFn: () => uploadService.getUserDocuments().then(r => r.data.data || r.data),
        retry: false
    });
    // Merge notes and generated documents, and deduplicate by _id
    const originalNotes = notesData?.notes || [];
    const generatedDocs = generatedDocsData?.documents || generatedDocsData?.generatedDocuments || (Array.isArray(generatedDocsData) ? generatedDocsData : []);
    // Deduplicate notes since both endpoints return documents from the GeneratedDocument collection
    const allNotes = [...originalNotes, ...generatedDocs];
    const notesMap = new Map();
    allNotes.forEach(note => {
        const id = note._id || note.id;
        if (id && !notesMap.has(id)) {
            notesMap.set(id, note);
        }
    });
    const notes = Array.from(notesMap.values());
    const documents = documentsData?.documents || [];
    const loading = notesLoading || documentsLoading || generatedDocsLoading;
    const error = notesError;
    // Combined refetch function for both data sources
    const refetchAllNotes = () => {
        refetchNotes();
        refetchGeneratedDocs();
    };
    // Handle note deletion - determine if it's original note or generated document
    const handleDeleteNote = async (noteId) => {
        if (confirm('Are you sure you want to delete this item?')) {
            try {
                // Check if it's a generated document (has generationType field) or original note
                const item = notes.find(n => n._id === noteId || n.id === noteId);
                if (item?.generationType) {
                    // It's a generated document from Study Hub
                    await generatedDocumentService.deleteGeneratedDocument(noteId);
                }
                else {
                    // It's an original note
                    await notesService.deleteNote(noteId);
                }
                // Refetch BOTH data sources since they overlap in the UI
                refetchAllNotes();
                toast({
                    title: "Success",
                    description: "Item deleted successfully."
                });
            }
            catch (error) {
                console.error('Error deleting item:', error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to delete item. Please try again."
                });
            }
        }
    };
    // Convert markdown-style text to clean HTML
    const markdownToHtml = (text) => {
        if (!text)
            return '';
        let html = text;
        // Escape HTML entities first
        html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        // Code blocks (``` ... ```)
        html = html.replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre class="code-block">$1</pre>');
        // Horizontal rules
        html = html.replace(/^[-*_]{3,}$/gm, '<hr>');
        // Headers (# to ####)
        html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
        html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^#\s+(.+)$/gm, '<h1 class="section-title">$1</h1>');
        // Bold and italic
        html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        // Question/Answer patterns (Q1:, Question 1:, Answer:, Correct Answer:, Expected Answer:)
        html = html.replace(/^(Q\d+[:.]\s*)(.+)$/gm, '<div class="question"><span class="q-label">$1</span>$2</div>');
        html = html.replace(/^(Question\s+\d+[:.]\s*)(.+)$/gm, '<div class="question"><span class="q-label">$1</span>$2</div>');
        html = html.replace(/^((?:Correct\s+)?Answer[:.]\s*)(.+)$/gm, '<div class="answer"><span class="a-label">$1</span>$2</div>');
        html = html.replace(/^(Expected\s+Answer[:.]\s*)(.+)$/gm, '<div class="answer"><span class="a-label">$1</span>$2</div>');
        html = html.replace(/^(Key\s+Points\s+to\s+Cover[:.]\s*)(.+)$/gm, '<div class="answer"><span class="a-label">$1</span>$2</div>');
        // MCQ options (a), b), c), d) or A), B), C), D))
        html = html.replace(/^([a-dA-D]\))\s+(.+)$/gm, '<div class="mcq-option"><span class="option-letter">$1</span> $2</div>');
        // Numbered lists (1. 2. etc.)
        html = html.replace(/^(\d+)\.\s+(.+)$/gm, '<div class="numbered-item"><span class="num">$1.</span> $2</div>');
        // Bullet points (- or *)
        html = html.replace(/^[\-\*]\s+(.+)$/gm, '<div class="bullet-item">$1</div>');
        // Paragraphs: convert remaining double newlines to paragraph breaks
        html = html.replace(/\n\n+/g, '</p><p>');
        // Single newlines within paragraphs
        html = html.replace(/\n/g, '<br>');
        // Wrap in paragraph tags
        html = '<p>' + html + '</p>';
        // Clean up empty paragraphs
        html = html.replace(/<p>\s*<\/p>/g, '');
        // Don't wrap block elements in <p>
        html = html.replace(/<p>(<(?:h[1-4]|div|pre|hr)[^>]*>)/g, '$1');
        html = html.replace(/(<\/(?:h[1-4]|div|pre)>)<\/p>/g, '$1');
        html = html.replace(/<p>(<hr>)<\/p>/g, '$1');
        return html;
    };
    const buildPdfHtml = (note) => {
        const safeContent = getSafeContent(note.content);
        const htmlContent = markdownToHtml(safeContent);
        const genType = note.generationType || 'notes';
        const typeLabel = genType === 'notes' ? '📝 Study Notes' : genType === 'quiz' ? '❓ Question Bank' : '📄 ' + genType.charAt(0).toUpperCase() + genType.slice(1);
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${note.title} - LastMin AI</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.75;
      background: #fff;
      color: #1f2937;
      font-size: 14px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      max-width: 780px;
      margin: 0 auto;
      padding: 48px 56px;
    }

    /* ─── Header ─── */
    .header {
      text-align: center;
      padding-bottom: 24px;
      margin-bottom: 32px;
      border-bottom: 3px solid #7c3aed;
      position: relative;
    }
    .header::after {
      content: '';
      position: absolute;
      bottom: -3px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 3px;
      background: #a78bfa;
    }
    .header h1 {
      font-size: 26px;
      font-weight: 800;
      color: #7c3aed;
      margin-bottom: 10px;
      letter-spacing: -0.5px;
    }
    .meta { color: #6b7280; font-size: 13px; }
    .badge {
      display: inline-block;
      background: #f3f0ff;
      color: #7c3aed;
      padding: 3px 14px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-left: 8px;
      border: 1px solid #e0d4fc;
    }

    /* ─── Content ─── */
    .content { margin-top: 8px; }

    .content p {
      margin-bottom: 14px;
      color: #374151;
      font-size: 14px;
      line-height: 1.8;
    }

    .content h1.section-title {
      font-size: 22px;
      font-weight: 800;
      color: #5b21b6;
      margin: 32px 0 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #ede9fe;
    }
    .content h2 {
      font-size: 18px;
      font-weight: 700;
      color: #6d28d9;
      margin: 28px 0 12px;
      padding-left: 12px;
      border-left: 4px solid #8b5cf6;
    }
    .content h3 {
      font-size: 15px;
      font-weight: 700;
      color: #7c3aed;
      margin: 22px 0 10px;
    }
    .content h4 {
      font-size: 14px;
      font-weight: 600;
      color: #4c1d95;
      margin: 18px 0 8px;
    }

    .content strong { color: #111827; font-weight: 700; }
    .content em { color: #4b5563; font-style: italic; }

    /* ─── Lists ─── */
    .bullet-item {
      padding: 4px 0 4px 24px;
      position: relative;
      margin-bottom: 4px;
    }
    .bullet-item::before {
      content: '•';
      position: absolute;
      left: 8px;
      color: #7c3aed;
      font-weight: 700;
      font-size: 16px;
    }
    .numbered-item {
      padding: 4px 0 4px 8px;
      margin-bottom: 4px;
    }
    .numbered-item .num {
      color: #7c3aed;
      font-weight: 700;
      margin-right: 4px;
    }

    /* ─── Q&A ─── */
    .question {
      background: #f8f6ff;
      border-left: 4px solid #7c3aed;
      padding: 12px 16px;
      margin: 18px 0 6px;
      border-radius: 0 8px 8px 0;
      font-weight: 500;
    }
    .q-label {
      color: #7c3aed;
      font-weight: 700;
    }
    .answer {
      background: #f0fdf4;
      border-left: 4px solid #22c55e;
      padding: 12px 16px;
      margin: 4px 0 18px;
      border-radius: 0 8px 8px 0;
      color: #166534;
    }
    .a-label {
      color: #15803d;
      font-weight: 700;
    }
    .mcq-option {
      padding: 4px 0 4px 20px;
      margin: 2px 0;
    }
    .mcq-option .option-letter {
      font-weight: 700;
      color: #6d28d9;
    }

    /* ─── Code ─── */
    code {
      font-family: 'JetBrains Mono', monospace;
      background: #f3f4f6;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12.5px;
      color: #be185d;
    }
    .code-block {
      font-family: 'JetBrains Mono', monospace;
      background: #1e1e2e;
      color: #cdd6f4;
      padding: 16px 20px;
      border-radius: 8px;
      font-size: 12.5px;
      line-height: 1.6;
      overflow-x: auto;
      margin: 16px 0;
      white-space: pre-wrap;
    }

    hr {
      border: none;
      height: 1px;
      background: linear-gradient(to right, transparent, #d1d5db, transparent);
      margin: 28px 0;
    }

    /* ─── Footer ─── */
    .footer {
      margin-top: 48px;
      padding-top: 20px;
      border-top: 2px solid #f3f4f6;
      text-align: center;
      font-size: 11px;
      color: #9ca3af;
    }
    .footer .brand {
      color: #7c3aed;
      font-weight: 600;
    }

    /* ─── Print ─── */
    @media print {
      body { font-size: 12px; }
      .page { padding: 24px 32px; max-width: none; }
      .question, .answer { -webkit-print-color-adjust: exact; }
      .code-block { background: #f3f4f6 !important; color: #1f2937 !important; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <h1>${note.title}</h1>
      <p class="meta">
        Generated on ${formatDate(note.createdAt || new Date().toISOString())}
        <span class="badge">${typeLabel}</span>
      </p>
    </div>
    <div class="content">${htmlContent}</div>
    <div class="footer">
      Generated by <span class="brand">LastMin AI</span> &mdash; Your Intelligent Study Companion
    </div>
  </div>
</body>
</html>`;
    };
    const handlePreview = (note) => {
        if (!note.content) {
            alert('Notes are still being processed');
            return;
        }
        const htmlContent = buildPdfHtml(note);
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const popup = window.open(url, 'NotesPreview', 'width=800,height=600,scrollbars=yes,resizable=yes');
        if (popup) {
            popup.onload = () => setTimeout(() => URL.revokeObjectURL(url), 100);
        }
        else {
            alert('Please allow pop-ups for this site to preview the notes');
            URL.revokeObjectURL(url);
        }
    };
    const handleDownloadPDF = (note) => {
        if (!note.content) {
            toast({ title: 'Error', description: 'No content to download', variant: 'destructive' });
            return;
        }
        const htmlContent = buildPdfHtml(note);
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        // Open in new window and trigger print (Save as PDF)
        const printWindow = window.open(url, '_blank', 'width=800,height=600');
        if (printWindow) {
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.print();
                    URL.revokeObjectURL(url);
                }, 500);
            };
        }
        else {
            // Fallback: download as HTML
            const link = document.createElement('a');
            link.href = url;
            link.download = `${note.title || 'study-notes'}.html`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
        toast({ title: 'PDF Ready', description: 'Use your browser\'s Print dialog to save as PDF' });
    };
    const handleDeleteFile = async (fileId) => {
        if (confirm('Are you sure you want to delete this file and all its generated documents?')) {
            try {
                await uploadService.deleteDocument(fileId);
                toast({
                    title: "Success",
                    description: "File and associated generated documents deleted successfully."
                });
                // Refresh both lists
                refetchAllNotes();
            }
            catch (error) {
                console.error('Error deleting file:', error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to delete file. Please try again."
                });
            }
        }
    };
    const handleReprocessDocument = async (fileId, fileName) => {
        if (confirm('Re-process this document to extract text content? This may take a few moments.')) {
            try {
                await uploadService.reprocessDocument(fileId);
                toast({
                    title: "Success",
                    description: `${fileName} is being reprocessed. Please wait a moment and refresh.`
                });
                // Refresh the documents list after a short delay
                setTimeout(() => {
                    window.location.reload(); // Simple refresh for now
                }, 2000);
            }
            catch (error) {
                console.error('Error reprocessing file:', error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to reprocess document. Please try again."
                });
            }
        }
    };
    const handleDownload = async (file) => {
        try {
            const response = await uploadService.downloadDocument(file.id || file._id);
            // Create blob and download link
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = file.title || file.filename || file.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast({
                title: "Success",
                description: `${file.title || file.filename} downloaded successfully.`
            });
        }
        catch (error) {
            console.error('Error downloading file:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to download file. Please try again."
            });
        }
    };
    const handleGenerateNotes = async (file) => {
        if (confirm(`Generate study notes for ${file.title || file.filename}?`)) {
            try {
                const result = await generatedDocumentService.generateDocument({
                    sourceDocumentId: file._id || file.id,
                    generationType: 'notes',
                    title: `Study Notes - ${file.title || file.filename}`,
                    subject: 'General'
                });
                console.log('Generation result:', result);
                toast({
                    title: "Success",
                    description: "Study notes generation started! Check back in a few seconds."
                });
                // Refresh notes list
                setTimeout(() => refetchAllNotes(), 3000);
            }
            catch (error) {
                console.error('Error generating notes:', error);
                console.error('Error details:', error.response?.data || error.message);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to generate notes. Please try again."
                });
            }
        }
    };
    // Safe content display helper
    const getSafeContent = (content) => {
        if (!content)
            return '';
        if (typeof content === 'string')
            return content;
        if (typeof content === 'object')
            return JSON.stringify(content);
        return String(content);
    };
    // Utility functions
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    const formatFileSize = (bytes) => {
        if (bytes === 0)
            return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    const getFileIcon = (fileType) => {
        if (fileType === 'pdf' || fileType?.includes('pdf'))
            return _jsx(FileText, { className: "h-5 w-5 text-red-400" });
        if (fileType === 'docx' || fileType?.includes('word'))
            return _jsx(File, { className: "h-5 w-5 text-blue-400" });
        if (fileType === 'txt' || fileType?.includes('text'))
            return _jsx(File, { className: "h-5 w-5 text-green-400" });
        if (fileType?.includes('image') || fileType === 'png' || fileType === 'jpg' || fileType === 'jpeg')
            return _jsx(File, { className: "h-5 w-5 text-purple-400" });
        return _jsx(File, { className: "h-5 w-5 text-gray-400" });
    };
    const getStatusBadge = (status) => {
        if (status === 'completed' || status === 'processed')
            return _jsx(Badge, { className: "bg-green-500/20 text-green-400 border-green-500/30", children: "Completed" });
        if (status === 'processing' || status === 'generating')
            return _jsx(Badge, { className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", children: "Processing" });
        if (status === 'uploaded')
            return _jsx(Badge, { className: "bg-blue-500/20 text-blue-400 border-blue-500/30", children: "Uploaded" });
        return _jsx(Badge, { className: "bg-red-500/20 text-red-400 border-red-500/30", children: "Failed" });
    };
    return (_jsxs("div", { className: "min-h-screen bg-gradient-cosmic pt-16 sm:pt-20", children: [_jsx(Header, {}), _jsx("main", { className: "container mx-auto px-4 py-6 sm:py-8 lg:py-12", children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, className: "max-w-6xl mx-auto", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-4xl md:text-5xl font-bold text-white mb-4", children: "My Files & Notes" }), _jsx("p", { className: "text-xl text-gray-300 max-w-2xl mx-auto", children: "Manage your uploaded files and generated study notes" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-8", children: [_jsx(Card, { className: "bg-card/95 border border-white/10", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-white", children: documents.length }), _jsx("p", { className: "text-gray-400", children: "Total Files" })] }), _jsx(Upload, { className: "h-8 w-8 text-purple-400" })] }) }) }), _jsx(Card, { className: "bg-card/95 border border-white/10", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-white", children: notes.filter(n => n.status === 'completed').length }), _jsx("p", { className: "text-gray-400", children: "Notes Generated" })] }), _jsx(FileText, { className: "h-8 w-8 text-green-400" })] }) }) }), _jsx(Card, { className: "bg-card/95 border border-white/10", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-white", children: notes.filter(n => n.status === 'generating' || n.status === 'processing').length }), _jsx("p", { className: "text-gray-400", children: "Processing" })] }), _jsx("div", { className: "h-8 w-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" })] }) }) }), _jsx(Card, { className: "bg-card/95 border border-white/10", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-white", children: documents.filter(f => f.status === 'uploaded').length }), _jsx("p", { className: "text-gray-400", children: "Ready to Process" })] }), _jsx(FolderOpen, { className: "h-8 w-8 text-blue-400" })] }) }) })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2 bg-card/95 border border-white/10", children: [_jsxs(TabsTrigger, { value: "notes", className: "data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300", children: [_jsx(BookOpen, { className: "h-4 w-4 mr-2" }), "Study Notes (", notes.length, ")"] }), _jsxs(TabsTrigger, { value: "files", className: "data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300", children: [_jsx(FolderOpen, { className: "h-4 w-4 mr-2" }), "Uploaded Files (", documents.length, ")"] })] }), _jsx(TabsContent, { value: "notes", className: "mt-6", children: loading ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "inline-block h-8 w-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mb-4" }), _jsx("p", { className: "text-gray-400", children: "Loading your notes..." })] })) : error ? (_jsx(Card, { className: "bg-card/95 border border-red-500/30", children: _jsxs(CardContent, { className: "p-12 text-center", children: [_jsx("div", { className: "h-16 w-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx(FileText, { className: "h-8 w-8 text-red-400" }) }), _jsx("h3", { className: "text-xl font-semibold text-white mb-2", children: "Error Loading Notes" }), _jsx("p", { className: "text-gray-400 mb-6", children: "Failed to load notes. Please try again." }), _jsx(Button, { onClick: () => refetchAllNotes(), className: "bg-red-500 hover:bg-red-600", children: "Try Again" })] }) })) : notes.length === 0 ? (_jsx(Card, { className: "bg-card/95 border border-white/10", children: _jsxs(CardContent, { className: "p-12 text-center", children: [_jsx(FileText, { className: "h-16 w-16 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-xl font-semibold text-white mb-2", children: "No generated notes yet" }), _jsx("p", { className: "text-gray-400 mb-6", children: "Upload your first document and generate AI study notes to get started" }), _jsx(Button, { onClick: () => window.location.href = '/syllabus', className: "bg-primary hover:bg-primary/90", children: "Upload Document" })] }) })) : (_jsx("div", { className: "space-y-4", children: notes && Array.isArray(notes) && notes.map((note) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, children: _jsx(Card, { className: "bg-card/95 border border-white/10 hover:border-purple-500/30 transition-all duration-300", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start gap-4 flex-1", children: [_jsx("div", { className: "p-3 bg-muted/20 rounded-lg", children: _jsx(FileText, { className: "h-5 w-5 text-green-400" }) }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: note.title }), getStatusBadge(note.status || 'completed')] }), _jsxs("div", { className: "flex items-center gap-6 text-sm text-gray-400", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Calendar, { className: "h-4 w-4" }), _jsxs("span", { children: ["Created: ", formatDate(note.createdAt)] })] }), note.generationType && (_jsx(Badge, { className: `text-xs ${note.generationType === 'notes' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                                                                            note.generationType === 'quiz' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                                                                                                'bg-blue-500/20 text-blue-400 border-blue-500/30'}`, children: note.generationType === 'notes' ? '📝 Notes' :
                                                                                            note.generationType === 'quiz' ? '❓ Questions' :
                                                                                                note.generationType })), note.sourceDocument && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(FileText, { className: "h-4 w-4" }), _jsxs("span", { children: ["Source: ", note.sourceDocument.title || note.sourceDocument.filename] })] })), _jsx("span", { children: "Type: notes" })] }), note.content && (_jsxs("p", { className: "text-gray-300 text-sm line-clamp-2", children: [getSafeContent(note.content).substring(0, 150), "..."] }))] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [(note.status === 'completed' || note.content) && (_jsxs(_Fragment, { children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => handlePreview(note), className: "border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/10", children: [_jsx(Eye, { className: "h-4 w-4 mr-1" }), "Preview"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleDownloadPDF(note), className: "border-green-500/30 hover:border-green-500/50 hover:bg-green-500/10 text-green-400", children: [_jsx(Download, { className: "h-4 w-4 mr-1" }), "PDF"] })] })), _jsx(Button, { variant: "outline", size: "sm", onClick: () => handleDeleteNote(note._id), className: "border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10 text-red-400", children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] }) }) }) }, note._id || note.id))) })) }), _jsx(TabsContent, { value: "files", className: "mt-6", children: loading ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "inline-block h-8 w-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mb-4" }), _jsx("p", { className: "text-gray-400", children: "Loading your files..." })] })) : error ? (_jsx(Card, { className: "bg-card/95 border border-red-500/30", children: _jsxs(CardContent, { className: "p-12 text-center", children: [_jsx("div", { className: "h-16 w-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx(FolderOpen, { className: "h-8 w-8 text-red-400" }) }), _jsx("h3", { className: "text-xl font-semibold text-white mb-2", children: "Error Loading Files" }), _jsx("p", { className: "text-gray-400 mb-6", children: "Failed to load files. Please try again." }), _jsx(Button, { onClick: () => window.location.reload(), className: "bg-red-500 hover:bg-red-600", children: "Try Again" })] }) })) : documents.length === 0 ? (_jsx(Card, { className: "bg-card/95 border border-white/10", children: _jsxs(CardContent, { className: "p-12 text-center", children: [_jsx(FolderOpen, { className: "h-16 w-16 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-xl font-semibold text-white mb-2", children: "No files uploaded yet" }), _jsx("p", { className: "text-gray-400 mb-6", children: "Upload your first document to get started" }), _jsx(Button, { onClick: () => window.location.href = '/syllabus', className: "bg-primary hover:bg-primary/90", children: "Upload Document" })] }) })) : (_jsx("div", { className: "space-y-4", children: documents.map((file) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, children: _jsx(Card, { className: "bg-card/95 border border-white/10 hover:border-purple-500/30 transition-all duration-300", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start gap-4 flex-1", children: [_jsx("div", { className: "p-3 bg-muted/20 rounded-lg", children: getFileIcon(file.fileType) }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: file.title || file.filename }), getStatusBadge(file.processingStatus || 'uploaded')] }), _jsxs("div", { className: "flex items-center gap-6 text-sm text-gray-400", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Calendar, { className: "h-4 w-4" }), _jsxs("span", { children: ["Uploaded: ", formatDate(file.createdAt)] })] }), _jsxs("span", { children: ["Size: ", formatFileSize(file.fileSize || 0)] }), _jsxs("span", { children: ["Type: ", file.fileType?.toUpperCase() || 'FILE'] })] }), _jsx("p", { className: "text-gray-300 text-sm", children: file.processingStatus === 'completed' ? '✅ Text extracted successfully - Ready for note generation' :
                                                                                    file.processingStatus === 'processing' ? '⏳ Currently processing for text extraction...' :
                                                                                        file.processingStatus === 'failed' ? '⚠️ Text extraction failed - Click Reprocess to try again' :
                                                                                            file.processingStatus === 'file_not_found' ? '❌ Original file not found - Re-upload recommended' :
                                                                                                file.processingStatus === 'not_applicable' ? '📄 Text extraction not needed for this file type' :
                                                                                                    '📝 Ready for text extraction and note generation' })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleDownload(file), className: "border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/10", children: [_jsx(Download, { className: "h-4 w-4 mr-1" }), "Download"] }), (file.processingStatus === 'failed' || file.processingStatus === 'file_not_found') && (_jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleReprocessDocument(file._id, file.originalName), className: "border-yellow-500/30 hover:border-yellow-500/50 hover:bg-yellow-500/10 text-yellow-400", children: [_jsx(FileText, { className: "h-4 w-4 mr-1" }), "Reprocess"] })), file.processingStatus !== 'processing' && file.processingStatus !== 'failed' && (_jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleGenerateNotes(file), className: "border-green-500/30 hover:border-green-500/50 hover:bg-green-500/10", children: [_jsx(FileText, { className: "h-4 w-4 mr-1" }), "Generate Notes"] })), _jsx(Button, { variant: "outline", size: "sm", onClick: () => handleDeleteFile(file._id), className: "border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10 text-red-400", children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] }) }) }) }, file._id))) })) })] })] }) })] }));
};
export default Notes;
