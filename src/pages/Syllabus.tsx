import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, File, X } from "lucide-react";
import Header from "@/components/Header";

const Syllabus = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-8 w-8 text-red-400" />;
    if (fileType.includes('word')) return <File className="h-8 w-8 text-blue-400" />;
    if (fileType.includes('text')) return <FileText className="h-8 w-8 text-green-400" />;
    return <File className="h-8 w-8 text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-gradient-cosmic pt-16 sm:pt-20">
      <Header />
      
      <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Upload Your Syllabus
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Support for PDF, DOCX, and TXT files. Our AI will analyze and create personalized study materials.
            </p>
          </div>

          {/* Upload Card */}
          <Card className="bg-card/95 backdrop-blur-md border-2 border-white/10 shadow-2xl shadow-primary/25 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Document Upload
              </CardTitle>
              <CardDescription className="text-gray-300">
                Upload your syllabus or study material to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
                  isDragOver
                    ? 'border-purple-400 bg-purple-400/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-gray-800 p-4 rounded-full">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                  
                  {uploadedFile ? (
                    <div className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-3 max-w-md">
                      {getFileIcon(uploadedFile.type)}
                      <div className="flex-1 text-left">
                        <p className="text-white font-medium truncate">{uploadedFile.name}</p>
                        <p className="text-gray-400 text-sm">
                          {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={removeFile}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-white">
                        <p className="text-lg font-medium mb-2">
                          Drop your files here or click to browse
                        </p>
                        <p className="text-gray-400">
                          Supports PDF, DOCX, TXT (Max 10MB)
                        </p>
                      </div>
                      
                      <Button
                        onClick={handleBrowseClick}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Browse Files
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <Button
                  disabled={!uploadedFile}
                  className="flex-1 bg-gradient-primary hover:opacity-90 shadow-lg shadow-primary/30 h-12 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate Notes
                </Button>
                <Button
                  variant="outline"
                  disabled={!uploadedFile}
                  className="px-8 border-white/20 bg-card/60 hover:bg-card/80 backdrop-blur-sm h-12 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Preview
                </Button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* File Type Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card/95 backdrop-blur-md border border-white/10 text-center">
              <CardContent className="pt-6">
                <FileText className="h-12 w-12 text-red-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">PDF Files</h3>
                <p className="text-gray-400 text-sm">
                  Upload PDF documents with text content for analysis
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/95 backdrop-blur-md border border-white/10 text-center">
              <CardContent className="pt-6">
                <File className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">DOCX Files</h3>
                <p className="text-gray-400 text-sm">
                  Microsoft Word documents with formatted content
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/95 backdrop-blur-md border border-white/10 text-center">
              <CardContent className="pt-6">
                <FileText className="h-12 w-12 text-green-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">TXT Files</h3>
                <p className="text-gray-400 text-sm">
                  Plain text files with syllabus or course content
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Syllabus;
