import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, File, CheckCircle } from "lucide-react";
import { useState } from "react";

const UploadSection = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleGenerate = () => {
    if (!uploadedFile) return;
    
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Upload Your Syllabus
            </h2>
            <p className="text-lg text-muted-foreground">
              Support for PDF, DOCX, and TXT files. Our AI will analyze and create personalized study materials.
            </p>
          </div>

          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Document Upload
              </CardTitle>
              <CardDescription>
                Upload your syllabus or study material to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors mx-auto max-w-2xl">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  <div className="bg-primary-lighter p-4 rounded-full">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium mb-2">
                      Drop your files here or click to browse
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Supports PDF, DOCX, TXT (Max 10MB)
                    </p>
                  </div>
                </label>
              </div>

              {/* Uploaded File Display */}
              {uploadedFile && (
                <div className="bg-primary-lighter/50 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded">
                      {uploadedFile.type.includes('pdf') ? (
                        <FileText className="h-5 w-5 text-primary" />
                      ) : (
                        <File className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(uploadedFile.size)}
                      </p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-accent" />
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {isGenerating && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Generating notes...</span>
                    <span className="text-primary font-medium">{progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <div className="flex justify-center gap-3">
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full max-w-xs"
                  onClick={handleGenerate}
                  disabled={!uploadedFile || isGenerating}
                >
                  {isGenerating ? 'Generating...' : 'Generate Notes'}
                </Button>
                <Button variant="study" size="lg" disabled={!uploadedFile} className="w-full max-w-xs">
                  Preview
                </Button>
              </div>

              {/* Supported Formats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                <div className="text-center">
                  <FileText className="h-8 w-8 text-destructive mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">PDF Files</p>
                </div>
                <div className="text-center">
                  <File className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">DOCX Files</p>
                </div>
                <div className="text-center">
                  <FileText className="h-8 w-8 text-accent mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">TXT Files</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default UploadSection;