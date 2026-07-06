import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, File, CheckCircle } from "lucide-react";
import { useState } from "react";
const UploadSection = () => {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const handleFileUpload = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadedFile(file);
        }
    };
    const handleGenerate = () => {
        if (!uploadedFile)
            return;
        setIsGenerating(true);
        setProgress(0);
        // Simulate progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsGenerating(false);
                    return 100;
                }
                return prev + 10;
            });
        }, 300);
    };
    const formatFileSize = (bytes) => {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    return (_jsx("section", { className: "py-20 bg-background", children: _jsx("div", { className: "container mx-auto px-4", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h2", { className: "text-3xl md:text-4xl font-bold text-foreground mb-4", children: "Upload Your Syllabus" }), _jsx("p", { className: "text-lg text-muted-foreground", children: "Support for PDF, DOCX, and TXT files. Our AI will analyze and create personalized study materials." })] }), _jsxs(Card, { className: "shadow-card border-0", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Upload, { className: "h-5 w-5 text-primary" }), "Document Upload"] }), _jsx(CardDescription, { children: "Upload your syllabus or study material to get started" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors mx-auto max-w-2xl", children: [_jsx("input", { type: "file", accept: ".pdf,.docx,.txt", onChange: handleFileUpload, className: "hidden", id: "file-upload" }), _jsxs("label", { htmlFor: "file-upload", className: "cursor-pointer flex flex-col items-center gap-4", children: [_jsx("div", { className: "bg-primary-lighter p-4 rounded-full", children: _jsx(Upload, { className: "h-8 w-8 text-primary" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-foreground font-medium mb-2", children: "Drop your files here or click to browse" }), _jsx("p", { className: "text-muted-foreground text-sm", children: "Supports PDF, DOCX, TXT (Max 10MB)" })] })] })] }), uploadedFile && (_jsx("div", { className: "bg-primary-lighter/50 border border-primary/20 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "bg-primary/10 p-2 rounded", children: uploadedFile.type.includes('pdf') ? (_jsx(FileText, { className: "h-5 w-5 text-primary" })) : (_jsx(File, { className: "h-5 w-5 text-primary" })) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium text-foreground", children: uploadedFile.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: formatFileSize(uploadedFile.size) })] }), _jsx(CheckCircle, { className: "h-5 w-5 text-accent" })] }) })), isGenerating && (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Generating notes..." }), _jsxs("span", { className: "text-primary font-medium", children: [progress, "%"] })] }), _jsx("div", { className: "w-full bg-secondary rounded-full h-2", children: _jsx("div", { className: "bg-gradient-primary h-2 rounded-full transition-all duration-300", style: { width: `${progress}%` } }) })] })), _jsxs("div", { className: "flex justify-center gap-3", children: [_jsx(Button, { variant: "hero", size: "lg", className: "w-full max-w-xs", onClick: handleGenerate, disabled: !uploadedFile || isGenerating, children: isGenerating ? 'Generating...' : 'Generate Notes' }), _jsx(Button, { variant: "study", size: "lg", disabled: !uploadedFile, className: "w-full max-w-xs", children: "Preview" })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4 pt-6 border-t border-border", children: [_jsxs("div", { className: "text-center", children: [_jsx(FileText, { className: "h-8 w-8 text-destructive mx-auto mb-2" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "PDF Files" })] }), _jsxs("div", { className: "text-center", children: [_jsx(File, { className: "h-8 w-8 text-primary mx-auto mb-2" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "DOCX Files" })] }), _jsxs("div", { className: "text-center", children: [_jsx(FileText, { className: "h-8 w-8 text-accent mx-auto mb-2" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "TXT Files" })] })] })] })] })] }) }) }));
};
export default UploadSection;
