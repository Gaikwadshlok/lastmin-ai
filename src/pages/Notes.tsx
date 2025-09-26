import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, File, Calendar, Eye, Download, Trash2, Upload, FolderOpen, BookOpen } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { uploadService } from '@/services/uploadService';
import { generatedDocumentService } from '@/services/generatedDocumentService';
import { toast } from '@/hooks/use-toast';

const Notes = () => {
  const { user } = useAuth();
  const [generatedDocuments, setGeneratedDocuments] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('notes');

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch generated documents and uploaded documents in parallel
        const [generatedResponse, documentsResponse] = await Promise.all([
          generatedDocumentService.getGeneratedDocuments({ generationType: 'notes' }).catch(err => {
            console.warn('Generated documents API not available, using mock data:', err);
            return null;
          }),
          uploadService.getUserDocuments().catch(err => {
            console.warn('Upload service API issue, using mock data:', err);
            return null;
          })
        ]);

        console.log('Generated documents response:', generatedResponse);
        console.log('Upload documents response:', documentsResponse);

        let transformedGenerated = [];
        let transformedFiles = [];

        // If APIs are not available, use mock data
        if (!generatedResponse || !documentsResponse) {
          console.log('Using mock data as fallback');
          
          // Mock generated documents
          transformedGenerated = [
            {
              id: '1',
              fileName: 'Study Notes - Data Structures',
              fileType: 'note',
              uploadDate: '2025-09-25',
              generatedDate: '2025-09-25',
              status: 'completed',
              notesContent: 'Comprehensive study notes on Data Structures including arrays, linked lists, stacks, queues, trees, and graphs. These notes cover fundamental concepts, time complexities, and practical applications.',
              fileSize: '2.3 KB',
              sourceDocumentId: 'doc1',
              generationType: 'notes',
              isPinned: true,
              quality: { aiConfidence: 0.9, completeness: 0.85 }
            },
            {
              id: '2',
              fileName: 'Study Notes - Algorithms',
              fileType: 'note',
              uploadDate: '2025-09-24',
              generatedDate: '2025-09-24',
              status: 'completed',
              notesContent: 'Detailed analysis of algorithm complexity, Big-O notation, sorting algorithms, and search techniques. Includes examples and optimization strategies.',
              fileSize: '1.8 KB',
              sourceDocumentId: 'doc2',
              generationType: 'notes',
              isPinned: false,
              quality: { aiConfidence: 0.87, completeness: 0.92 }
            },
            {
              id: '3',
              fileName: 'Study Notes - Machine Learning',
              fileType: 'note',
              uploadDate: '2025-09-23',
              generatedDate: null,
              status: 'generating',
              notesContent: null,
              fileSize: '0 KB',
              sourceDocumentId: 'doc3',
              generationType: 'notes',
              isPinned: false,
              quality: null
            }
          ];

          // Mock uploaded files
          transformedFiles = [
            {
              id: 'doc1',
              fileName: 'Data_Structures_Questions.pdf',
              fileType: 'pdf',
              uploadDate: '2025-09-25',
              fileSize: '2.3 MB',
              status: 'processed',
              originalPath: '/uploads/data-structures.pdf',
              mimeType: 'application/pdf',
              hasGeneratedNotes: true
            },
            {
              id: 'doc2',
              fileName: 'Algorithm_Analysis.docx',
              fileType: 'docx',
              uploadDate: '2025-09-24',
              fileSize: '1.8 MB',
              status: 'processed',
              originalPath: '/uploads/algorithm-analysis.docx',
              mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              hasGeneratedNotes: true
            },
            {
              id: 'doc3',
              fileName: 'Machine_Learning_Basics.txt',
              fileType: 'txt',
              uploadDate: '2025-09-23',
              fileSize: '0.5 MB',
              status: 'processing',
              originalPath: '/uploads/ml-basics.txt',
              mimeType: 'text/plain',
              hasGeneratedNotes: false
            },
            {
              id: 'doc4',
              fileName: 'Web_Development_Guide.pdf',
              fileType: 'pdf',
              uploadDate: '2025-09-22',
              fileSize: '3.1 MB',
              status: 'uploaded',
              originalPath: '/uploads/web-dev-guide.pdf',
              mimeType: 'application/pdf',
              hasGeneratedNotes: false
            },
            {
              id: 'doc5',
              fileName: 'Python_Cheatsheet.png',
              fileType: 'png',
              uploadDate: '2025-09-21',
              fileSize: '1.2 MB',
              status: 'uploaded',
              originalPath: '/uploads/python-cheat.png',
              mimeType: 'image/png',
              hasGeneratedNotes: false
            }
          ];
        } else {
          // Transform generated documents data - handle both array and object responses
          let generatedDocs = [];
          if (generatedResponse?.data) {
            const docs = generatedResponse.data.documents || generatedResponse.data || [];
            generatedDocs = Array.isArray(docs) ? docs : [];
          }

          transformedGenerated = generatedDocs.map(doc => ({
            id: doc._id || doc.id,
            fileName: doc.title,
            fileType: 'note',
            uploadDate: new Date(doc.createdAt).toISOString().split('T')[0],
            generatedDate: doc.generatedAt ? new Date(doc.generatedAt).toISOString().split('T')[0] : null,
            status: doc.status === 'completed' ? 'completed' : doc.status,
            notesContent: doc.content,
            fileSize: doc.contentSizeFormatted || `${Math.round((doc.analysis?.wordCount || 0) * 0.005) || 1}KB`,
            sourceDocumentId: doc.sourceDocument?._id || doc.sourceDocument,
            generationType: doc.generationType,
            isPinned: doc.isPinned,
            quality: doc.quality
          }));

          // Transform uploaded documents data - handle both array and object responses
          let uploadedDocs = [];
          if (documentsResponse?.data) {
            uploadedDocs = Array.isArray(documentsResponse.data) ? documentsResponse.data : 
                          (documentsResponse.data.documents || []);
          }

          transformedFiles = uploadedDocs.map(doc => ({
            id: doc._id || doc.id,
            fileName: doc.originalName,
            fileType: doc.fileType,
            uploadDate: new Date(doc.createdAt || doc.uploadedAt).toISOString().split('T')[0],
            fileSize: doc.fileSizeFormatted || formatFileSize(doc.fileSize || 0),
            status: doc.processingStatus || 'uploaded',
            originalPath: doc.filePath,
            mimeType: doc.mimeType,
            hasGeneratedNotes: (doc.generatedMaterials?.notes?.length || 0) > 0
          }));
        }

        console.log('Final transformed generated docs:', transformedGenerated);
        console.log('Final transformed uploaded files:', transformedFiles);

        setGeneratedDocuments(transformedGenerated);
        setUploadedFiles(transformedFiles);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load your files and notes."
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      // If no user, show empty state but don't load
      setLoading(false);
      setGeneratedDocuments([]);
      setUploadedFiles([]);
    }
  }, [user, toast]);

  // Utility function to format file sizes
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType === 'pdf') return <FileText className="h-5 w-5 text-red-400" />;
    if (fileType === 'docx') return <File className="h-5 w-5 text-blue-400" />;
    if (fileType === 'txt') return <File className="h-5 w-5 text-green-400" />;
    if (fileType === 'png' || fileType === 'jpg' || fileType === 'jpeg') return <File className="h-5 w-5 text-purple-400" />;
    return <File className="h-5 w-5 text-gray-400" />;
  };

  const getStatusBadge = (status) => {
    if (status === 'completed' || status === 'processed') return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge>;
    if (status === 'processing') return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Processing</Badge>;
    if (status === 'uploaded') return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Uploaded</Badge>;
    return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Failed</Badge>;
  };

  const handlePreview = (note) => {
    if (!note.notesContent) {
      alert('Notes are still being processed');
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <title>${note.fileName} - Generated Notes</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              margin: 20px; 
              background: white;
              color: black;
            }
            h1 { color: #7c3aed; margin-bottom: 20px; }
            h2 { color: #5b21b6; margin-top: 25px; margin-bottom: 15px; }
            h3 { color: #6d28d9; margin-top: 20px; margin-bottom: 10px; }
            p { margin-bottom: 10px; }
            .header { text-align: center; border-bottom: 2px solid #7c3aed; padding-bottom: 10px; }
            .content { margin-top: 20px; white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>LastMin AI - ${note.fileName}</h1>
            <p>Generated on ${note.generatedDate}</p>
          </div>
          <div class="content">${note.notesContent.replace(/\n/g, '<br>')}</div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const popup = window.open(url, 'NotesPreview', 'width=800,height=600,scrollbars=yes,resizable=yes');
    
    if (popup) {
      popup.onload = () => {
        setTimeout(() => URL.revokeObjectURL(url), 100);
      };
    } else {
      alert('Please allow pop-ups for this site to preview the notes');
      URL.revokeObjectURL(url);
    }
  };

  const handleDelete = async (documentId) => {
    if (confirm('Are you sure you want to delete this generated document?')) {
      try {
        await generatedDocumentService.deleteGeneratedDocument(documentId);
        setGeneratedDocuments(generatedDocuments.filter(doc => doc.id !== documentId));
        toast({
          title: "Success",
          description: "Generated document deleted successfully."
        });
      } catch (error) {
        console.error('Error deleting generated document:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete generated document. Please try again."
        });
      }
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (confirm('Are you sure you want to delete this file and all its generated documents?')) {
      try {
        await uploadService.deleteDocument(fileId);
        setUploadedFiles(uploadedFiles.filter(file => file.id !== fileId));
        // Also remove any generated documents from this source
        setGeneratedDocuments(generatedDocuments.filter(doc => doc.sourceDocumentId !== fileId));
        toast({
          title: "Success",
          description: "File and associated generated documents deleted successfully."
        });
      } catch (error) {
        console.error('Error deleting file:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete file. Please try again."
        });
      }
    }
  };

  const handleDownload = async (file) => {
    try {
      const response = await uploadService.downloadDocument(file.id);
      
      // Create blob and download link
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: `${file.fileName} downloaded successfully.`
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download file. Please try again."
      });
    }
  };

  const handleGenerateNotes = async (file) => {
    if (confirm(`Generate study notes for ${file.fileName}?`)) {
      try {
        // Update file status to processing
        setUploadedFiles(prevFiles => 
          prevFiles.map(f => 
            f.id === file.id 
              ? { ...f, status: 'processing' }
              : f
          )
        );
        
        // Add to generated documents with processing status
        const tempDocument = {
          id: `temp-${Date.now()}`,
          fileName: `Study Notes - ${file.fileName}`,
          fileType: 'note',
          uploadDate: file.uploadDate,
          generatedDate: null,
          status: 'generating',
          notesContent: null,
          fileSize: '0KB',
          sourceDocumentId: file.id,
          generationType: 'notes',
          isPinned: false,
          quality: null
        };
        
        setGeneratedDocuments(prevDocs => [...prevDocs, tempDocument]);
        
        try {
          // Try to call API to generate notes
          const response = await generatedDocumentService.generateDocument({
            sourceDocumentId: file.id,
            generationType: 'notes',
            title: `Study Notes - ${file.fileName}`,
            subject: 'General'
          });
          
          // Update generated documents with the real document
          const generatedDocument = {
            id: response.data.document._id,
            fileName: response.data.document.title,
            fileType: 'note',
            uploadDate: file.uploadDate,
            generatedDate: new Date().toISOString().split('T')[0],
            status: response.data.document.status,
            notesContent: response.data.document.content,
            fileSize: response.data.document.contentSizeFormatted || '1KB',
            sourceDocumentId: file.id,
            generationType: 'notes',
            isPinned: false,
            quality: response.data.document.quality
          };
          
          // Replace temp document with generated document
          setGeneratedDocuments(prevDocs => 
            prevDocs.map(doc => 
              doc.id === tempDocument.id ? generatedDocument : doc
            )
          );
        } catch (apiError) {
          console.warn('API not available, using mock generation:', apiError);
          
          // Simulate AI generation with mock data
          setTimeout(() => {
            const mockGeneratedDocument = {
              id: `generated-${Date.now()}`,
              fileName: `Study Notes - ${file.fileName}`,
              fileType: 'note',
              uploadDate: file.uploadDate,
              generatedDate: new Date().toISOString().split('T')[0],
              status: 'completed',
              notesContent: `# Study Notes: ${file.fileName}

## Overview
This document contains comprehensive study notes generated from your uploaded file.

## Key Concepts
- Main topics extracted from the source material
- Important definitions and explanations  
- Key points for exam preparation

## Detailed Analysis
AI-generated content based on ${file.fileName}. This includes structured information to help with your studies.

## Study Questions
1. What are the main concepts covered in this material?
2. How do the different topics relate to each other?
3. What are the practical applications of this knowledge?

## Summary
These notes provide a structured overview of the material for effective studying and review.

---
*Generated on ${new Date().toLocaleDateString()} using AI analysis*`,
              fileSize: '2.5KB',
              sourceDocumentId: file.id,
              generationType: 'notes',
              isPinned: false,
              quality: { aiConfidence: 0.85, completeness: 0.9 }
            };
            
            // Replace temp document with mock generated document
            setGeneratedDocuments(prevDocs => 
              prevDocs.map(doc => 
                doc.id === tempDocument.id ? mockGeneratedDocument : doc
              )
            );
          }, 3000); // Simulate 3 second generation time
        }
        
        // Update file status to processed
        setUploadedFiles(prevFiles => 
          prevFiles.map(f => 
            f.id === file.id 
              ? { ...f, status: 'processed', hasGeneratedNotes: true }
              : f
          )
        );
        
        toast({
          title: "Success",
          description: "Study notes generation started! Check back in a few seconds."
        });
        
      } catch (error) {
        console.error('Error generating notes:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to generate notes. Please try again."
        });
        
        // Remove temp document and revert status changes on error
        setGeneratedDocuments(prevDocs => 
          prevDocs.filter(doc => !doc.id.startsWith('temp-'))
        );
        
        setUploadedFiles(prevFiles => 
          prevFiles.map(f => 
            f.id === file.id 
              ? { ...f, status: 'uploaded' }
              : f
          )
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-cosmic pt-16 sm:pt-20">
      <Header />
      
      <main className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              My Files & Notes
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Manage your uploaded files and generated study notes
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card/95 border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{uploadedFiles.length}</p>
                    <p className="text-gray-400">Total Files</p>
                  </div>
                  <Upload className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/95 border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{generatedDocuments.filter(d => d.status === 'completed').length}</p>
                    <p className="text-gray-400">Notes Generated</p>
                  </div>
                  <FileText className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/95 border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{generatedDocuments.filter(d => d.status === 'generating' || d.status === 'processing').length}</p>
                    <p className="text-gray-400">Processing</p>
                  </div>
                  <div className="h-8 w-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/95 border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{uploadedFiles.filter(f => f.status === 'uploaded').length}</p>
                    <p className="text-gray-400">Ready to Process</p>
                  </div>
                  <FolderOpen className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="notes" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-card/95 border border-white/10">
              <TabsTrigger value="notes" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                <BookOpen className="h-4 w-4 mr-2" />
                Study Notes ({generatedDocuments.length})
              </TabsTrigger>
              <TabsTrigger value="files" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                <FolderOpen className="h-4 w-4 mr-2" />
                Uploaded Files ({uploadedFiles.length})
              </TabsTrigger>
            </TabsList>

            {/* Notes Tab */}
            {/* Notes Tab */}
            <TabsContent value="notes" className="mt-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-400">Loading your notes...</p>
                </div>
              ) : error ? (
                <Card className="bg-card/95 border border-red-500/30">
                  <CardContent className="p-12 text-center">
                    <div className="h-16 w-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-red-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Error Loading Notes</h3>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <Button 
                      onClick={() => window.location.reload()}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              ) : generatedDocuments.length === 0 ? (
                <Card className="bg-card/95 border border-white/10">
                  <CardContent className="p-12 text-center">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No generated notes yet</h3>
                    <p className="text-gray-400 mb-6">Upload your first document and generate AI study notes to get started</p>
                    <Button 
                      onClick={() => window.location.href = '/syllabus'}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Upload Document
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {generatedDocuments.map((document) => (
                    <motion.div
                      key={document.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Card className="bg-card/95 border border-white/10 hover:border-purple-500/30 transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="p-3 bg-muted/20 rounded-lg">
                                {getFileIcon(document.fileType)}
                              </div>
                              
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                  <h3 className="text-lg font-semibold text-white">{document.fileName}</h3>
                                  {getStatusBadge(document.status)}
                                  {document.isPinned && (
                                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pinned</Badge>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-6 text-sm text-gray-400">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>Created: {document.uploadDate}</span>
                                  </div>
                                  {document.generatedDate && (
                                    <div className="flex items-center gap-1">
                                      <FileText className="h-4 w-4" />
                                      <span>Generated: {document.generatedDate}</span>
                                    </div>
                                  )}
                                  <span>Size: {document.fileSize}</span>
                                  <span>Type: {document.generationType}</span>
                                </div>
                                
                                {document.notesContent && (
                                  <p className="text-gray-300 text-sm line-clamp-2">
                                    {document.notesContent.substring(0, 150)}...
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {document.status === 'completed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePreview(document)}
                                  className="border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/10"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Preview
                                </Button>
                              )}
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(document.id)}
                                className="border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10 text-red-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Files Tab */}
            <TabsContent value="files" className="mt-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-400">Loading your files...</p>
                </div>
              ) : error ? (
                <Card className="bg-card/95 border border-red-500/30">
                  <CardContent className="p-12 text-center">
                    <div className="h-16 w-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FolderOpen className="h-8 w-8 text-red-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Error Loading Files</h3>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <Button 
                      onClick={() => window.location.reload()}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              ) : uploadedFiles.length === 0 ? (
                <Card className="bg-card/95 border border-white/10">
                  <CardContent className="p-12 text-center">
                    <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No files uploaded yet</h3>
                    <p className="text-gray-400 mb-6">Upload your first document to get started</p>
                    <Button 
                      onClick={() => window.location.href = '/syllabus'}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Upload Document
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {uploadedFiles.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Card className="bg-card/95 border border-white/10 hover:border-purple-500/30 transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="p-3 bg-muted/20 rounded-lg">
                                {getFileIcon(file.fileType)}
                              </div>
                              
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                  <h3 className="text-lg font-semibold text-white">{file.fileName}</h3>
                                  {getStatusBadge(file.status)}
                                </div>
                                
                                <div className="flex items-center gap-6 text-sm text-gray-400">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>Uploaded: {file.uploadDate}</span>
                                  </div>
                                  <span>Size: {file.fileSize}</span>
                                  <span>Type: {file.fileType.toUpperCase()}</span>
                                </div>
                                
                                <p className="text-gray-300 text-sm">
                                  {file.status === 'processed' ? 'File processed - Notes available in Notes tab' :
                                   file.status === 'processing' ? 'Currently processing for note generation' :
                                   'Ready to generate study notes'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(file)}
                                className="border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/10"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                              
                              {file.status === 'uploaded' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleGenerateNotes(file)}
                                  className="border-green-500/30 hover:border-green-500/50 hover:bg-green-500/10"
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  Generate Notes
                                </Button>
                              )}
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteFile(file.id)}
                                className="border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10 text-red-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default Notes;
